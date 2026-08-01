package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	RedisAddr string

	SMTPHost     string
	SMTPPort     int
	SMTPUsername string
	SMTPPassword string
	FromAddress  string
	FromName     string

	JobServiceURL       string
	CandidateServiceURL string
	AuthServiceURL      string
	FrontendURL         string
}

func LoadConfig() (Config, error) {
	var missing []string
	get := func(name string) string {
		v := os.Getenv(name)
		if v == "" {
			missing = append(missing, name)
		}
		return v
	}

	cfg := Config{
		RedisAddr:           get("REDIS_ADDR"),
		SMTPHost:            get("SMTP_HOST"),
		SMTPUsername:        get("SMTP_USERNAME"),
		SMTPPassword:        get("SMTP_PASSWORD"),
		FromAddress:         get("SMTP_FROM"),
		FromName:            os.Getenv("SMTP_FROM_NAME"),
		JobServiceURL:       get("JOB_SERVICE_URL"),
		CandidateServiceURL: get("CANDIDATE_SERVICE_URL"),
		AuthServiceURL:      get("AUTH_SERVICE_URL"),
		FrontendURL:         get("FRONTEND_BASE_URL"),
	}

	portStr := get("SMTP_PORT")
	if portStr != "" {
		port, err := strconv.Atoi(portStr)
		if err != nil {
			return Config{}, fmt.Errorf("SMTP_PORT must be an integer: %w", err)
		}
		cfg.SMTPPort = port
	}

	if len(missing) > 0 {
		return Config{}, fmt.Errorf("missing required env vars: %s", strings.Join(missing, ", "))
	}

	if cfg.FromName == "" {
		cfg.FromName = "Vettly"
	}

	return cfg, nil
}
