package main

import (
	"context"
	"encoding/json"
	"log"
	"time"
)

type Deps struct {
	Resolver    *Resolver
	Mailer      *Mailer
	FrontendURL string
}

// HandleMessage decodes one vettly.events payload and dispatches it to the
// matching handler. It never panics or returns an error out — a bad payload
// or a downstream failure is logged and the subscribe loop keeps running.
func HandleMessage(d *Deps, payload string) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("recovered from panic handling event: %v", r)
		}
	}()

	var env Envelope
	if err := json.Unmarshal([]byte(payload), &env); err != nil {
		log.Printf("failed to decode event envelope: %v", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	switch env.Type {
	case EventApplicationReceived:
		handleApplicationReceived(ctx, d, env.Data)
	case EventStageChanged:
		handleStageChanged(ctx, d, env.Data)
	case EventOfferReady:
		handleOfferReady(ctx, d, env.Data)
	default:
		log.Printf("ignoring unknown event type %q", env.Type)
	}
}

func handleApplicationReceived(ctx context.Context, d *Deps, raw json.RawMessage) {
	var data ApplicationReceived
	if err := json.Unmarshal(raw, &data); err != nil {
		log.Printf("application_received: bad payload: %v", err)
		return
	}

	job, err := d.Resolver.GetJob(ctx, data.JobId)
	if err != nil {
		log.Printf("application_received: resolving job %s: %v", data.JobId, err)
		return
	}

	recruiter, err := d.Resolver.GetUser(ctx, job.RecruiterId)
	if err != nil {
		log.Printf("application_received: resolving recruiter %s: %v", job.RecruiterId, err)
		return
	}
	if recruiter.Email == "" {
		log.Printf("application_received: recruiter %s has no email, skipping", job.RecruiterId)
		return
	}

	subject := "New application from " + data.CandidateName
	toName := recruiter.FirstName + " " + recruiter.LastName
	body := struct{ CandidateName, JobTitle, ActionURL string }{data.CandidateName, job.Title, d.FrontendURL}

	if err := d.Mailer.Send(ctx, recruiter.Email, toName, subject, EventApplicationReceived, body); err != nil {
		log.Printf("application_received: sending email to %s: %v", recruiter.Email, err)
		return
	}
	log.Printf("application_received: emailed recruiter %s for application %s", recruiter.Email, data.ApplicationId)
}

func handleStageChanged(ctx context.Context, d *Deps, raw json.RawMessage) {
	var data StageChanged
	if err := json.Unmarshal(raw, &data); err != nil {
		log.Printf("stage_changed: bad payload: %v", err)
		return
	}
	if data.Stage == "applied" {
		// duplicates application_received — skip
		return
	}

	participants, err := d.Resolver.GetParticipants(ctx, data.ApplicationId)
	if err != nil {
		log.Printf("stage_changed: resolving participants for %s: %v", data.ApplicationId, err)
		return
	}
	if participants.CandidateEmail == "" {
		log.Printf("stage_changed: candidate for application %s has no email, skipping", data.ApplicationId)
		return
	}

	subject := "You were moved to " + data.Stage
	toName := participants.CandidateFirstName + " " + participants.CandidateLastName
	body := struct{ Stage, JobTitle, ActionURL string }{data.Stage, data.JobTitle, d.FrontendURL}

	if err := d.Mailer.Send(ctx, participants.CandidateEmail, toName, subject, EventStageChanged, body); err != nil {
		log.Printf("stage_changed: sending email to %s: %v", participants.CandidateEmail, err)
		return
	}
	log.Printf("stage_changed: emailed candidate %s for application %s", participants.CandidateEmail, data.ApplicationId)
}

func handleOfferReady(ctx context.Context, d *Deps, raw json.RawMessage) {
	var data OfferReady
	if err := json.Unmarshal(raw, &data); err != nil {
		log.Printf("offer_ready: bad payload: %v", err)
		return
	}

	participants, err := d.Resolver.GetParticipants(ctx, data.ApplicationId)
	if err != nil {
		log.Printf("offer_ready: resolving participants for %s: %v", data.ApplicationId, err)
		return
	}
	if participants.CandidateEmail == "" {
		log.Printf("offer_ready: candidate for application %s has no email, skipping", data.ApplicationId)
		return
	}

	subject := "Your offer for " + data.JobTitle + " is ready to sign"
	toName := participants.CandidateFirstName + " " + participants.CandidateLastName
	body := struct{ JobTitle, ActionURL string }{data.JobTitle, d.FrontendURL}

	if err := d.Mailer.Send(ctx, participants.CandidateEmail, toName, subject, EventOfferReady, body); err != nil {
		log.Printf("offer_ready: sending email to %s: %v", participants.CandidateEmail, err)
		return
	}
	log.Printf("offer_ready: emailed candidate %s for application %s", participants.CandidateEmail, data.ApplicationId)
}
