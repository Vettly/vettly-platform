package main

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port string

	JWTSecret   string
	JWTIssuer   string
	JWTAudience string

	AuthServiceURL         *url.URL
	CandidateServiceURL    *url.URL
	JobServiceURL          *url.URL
	OrganizationServiceURL *url.URL
	MessagingServiceURL    *url.URL
	EsignServiceURL        *url.URL
	InterviewServiceURL    *url.URL
	MatchingServiceURL     *url.URL

	CORSAllowedOrigin string

	RateLimitRPS   float64
	RateLimitBurst int
}

func LoadConfig() (Config, error) {
	var missing []string
	var invalid []string

	get := func(name string) string {
		v := os.Getenv(name)
		if v == "" {
			missing = append(missing, name)
		}
		return v
	}

	parseURL := func(name string) *url.URL {
		raw := get(name)
		if raw == "" {
			return nil
		}
		u, err := url.Parse(raw)
		if err != nil {
			invalid = append(invalid, fmt.Sprintf("%s (%v)", name, err))
			return nil
		}
		return u
	}

	cfg := Config{
		JWTSecret:              get("JWT_SECRET"),
		AuthServiceURL:         parseURL("AUTH_SERVICE_URL"),
		CandidateServiceURL:    parseURL("CANDIDATE_SERVICE_URL"),
		JobServiceURL:          parseURL("JOB_SERVICE_URL"),
		OrganizationServiceURL: parseURL("ORGANIZATION_SERVICE_URL"),
		MessagingServiceURL:    parseURL("MESSAGING_SERVICE_URL"),
		EsignServiceURL:        parseURL("ESIGN_SERVICE_URL"),
		InterviewServiceURL:    parseURL("INTERVIEW_SERVICE_URL"),
		MatchingServiceURL:     parseURL("MATCHING_SERVICE_URL"),
	}

	if len(missing) > 0 {
		return Config{}, fmt.Errorf("missing required env vars: %s", strings.Join(missing, ", "))
	}
	if len(invalid) > 0 {
		return Config{}, fmt.Errorf("invalid env vars: %s", strings.Join(invalid, ", "))
	}

	cfg.Port = os.Getenv("PORT")
	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	cfg.JWTIssuer = os.Getenv("JWT_ISSUER")
	if cfg.JWTIssuer == "" {
		cfg.JWTIssuer = "vettly-auth-service"
	}

	cfg.JWTAudience = os.Getenv("JWT_AUDIENCE")
	if cfg.JWTAudience == "" {
		cfg.JWTAudience = "vettly-platform"
	}

	cfg.CORSAllowedOrigin = os.Getenv("CORS_ALLOWED_ORIGIN")

	cfg.RateLimitRPS = 10
	if v := os.Getenv("RATE_LIMIT_RPS"); v != "" {
		f, err := strconv.ParseFloat(v, 64)
		if err != nil {
			return Config{}, fmt.Errorf("RATE_LIMIT_RPS must be a number: %w", err)
		}
		cfg.RateLimitRPS = f
	}

	cfg.RateLimitBurst = 20
	if v := os.Getenv("RATE_LIMIT_BURST"); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil {
			return Config{}, fmt.Errorf("RATE_LIMIT_BURST must be an integer: %w", err)
		}
		cfg.RateLimitBurst = n
	}

	return cfg, nil
}
