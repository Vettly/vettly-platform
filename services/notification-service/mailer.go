package main

import (
	"bytes"
	"context"
	"embed"
	"fmt"
	"html/template"

	"github.com/wneessen/go-mail"
)

//go:embed templates/*.html
var templatesFS embed.FS

//go:embed assets/vettly-logo.png
var assetsFS embed.FS

const logoContentID = "vettly-logo"

type Mailer struct {
	client      *mail.Client
	fromAddr    string
	fromName    string
	frontendURL string
	templates   map[string]*template.Template
}

func NewMailer(cfg Config) (*Mailer, error) {
	client, err := mail.NewClient(cfg.SMTPHost,
		mail.WithPort(cfg.SMTPPort),
		mail.WithSMTPAuth(mail.SMTPAuthPlain),
		mail.WithUsername(cfg.SMTPUsername),
		mail.WithPassword(cfg.SMTPPassword),
		mail.WithTLSPolicy(mail.TLSOpportunistic),
	)
	if err != nil {
		return nil, fmt.Errorf("creating smtp client: %w", err)
	}

	templates := make(map[string]*template.Template, len(eventTemplateNames))
	for _, name := range eventTemplateNames {
		tmpl, err := template.ParseFS(templatesFS, "templates/base.html", "templates/"+name+".html")
		if err != nil {
			return nil, fmt.Errorf("parsing template %q: %w", name, err)
		}
		templates[name] = tmpl
	}

	return &Mailer{
		client:      client,
		fromAddr:    cfg.FromAddress,
		fromName:    cfg.FromName,
		frontendURL: cfg.FrontendURL,
		templates:   templates,
	}, nil
}

var eventTemplateNames = []string{
	EventApplicationReceived,
	EventStageChanged,
	EventOfferReady,
	EventDocumentSigned,
}

// EmailContext is embedded into every template's data so base.html has
// access to shared fields (the "View in Vettly" button target) regardless
// of which event body is rendered.
type EmailContext struct {
	ActionURL string
}

// Send renders the named template (each event type has a matching
// templates/<name>.html) into base.html's layout, embeds the Vettly logo as
// an inline (cid:) image, and delivers it via SMTP.
func (m *Mailer) Send(ctx context.Context, toEmail, toName, subject, templateName string, data any) error {
	tmpl, ok := m.templates[templateName]
	if !ok {
		return fmt.Errorf("unknown email template %q", templateName)
	}

	var body bytes.Buffer
	if err := tmpl.ExecuteTemplate(&body, "layout", data); err != nil {
		return fmt.Errorf("rendering template %q: %w", templateName, err)
	}

	msg := mail.NewMsg()
	if err := msg.FromFormat(m.fromName, m.fromAddr); err != nil {
		return fmt.Errorf("setting from address: %w", err)
	}
	if err := msg.AddToFormat(toName, toEmail); err != nil {
		return fmt.Errorf("setting to address: %w", err)
	}
	msg.Subject(subject)
	msg.SetBodyString(mail.TypeTextHTML, body.String())

	if err := msg.EmbedFromEmbedFS("assets/vettly-logo.png", &assetsFS, mail.WithFileContentID(logoContentID)); err != nil {
		return fmt.Errorf("embedding logo: %w", err)
	}

	if err := m.client.DialAndSendWithContext(ctx, msg); err != nil {
		return fmt.Errorf("sending email: %w", err)
	}
	return nil
}
