package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/redis/go-redis/v9"
)

type Config struct {
	Port string

	// RedisURL, if set, is a full connection string (redis:// or rediss://,
	// optionally with a username/password) and takes precedence over
	// RedisAddr. Managed Redis providers like Upstash/Redis Cloud require
	// auth + TLS, which only the URL form carries.
	RedisURL  string
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
		RedisURL:            os.Getenv("REDIS_URL"),
		RedisAddr:           os.Getenv("REDIS_ADDR"),
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

	if cfg.RedisURL == "" && cfg.RedisAddr == "" {
		missing = append(missing, "REDIS_URL or REDIS_ADDR")
	}

	if len(missing) > 0 {
		return Config{}, fmt.Errorf("missing required env vars: %s", strings.Join(missing, ", "))
	}

	if cfg.FromName == "" {
		cfg.FromName = "Vettly"
	}

	cfg.Port = os.Getenv("PORT")
	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	return cfg, nil
}

// buildRedisOptions prefers RedisURL (redis:// or rediss://, carries auth
// and TLS) and falls back to a bare host:port for local/unauthenticated
// Redis, matching docker-compose's REDIS_ADDR=redis:6379.
func buildRedisOptions(cfg Config) (*redis.Options, error) {
	if cfg.RedisURL != "" {
		opts, err := redis.ParseURL(cfg.RedisURL)
		if err != nil {
			return nil, fmt.Errorf("invalid REDIS_URL: %w", err)
		}
		return opts, nil
	}

	return &redis.Options{Addr: cfg.RedisAddr}, nil
}
