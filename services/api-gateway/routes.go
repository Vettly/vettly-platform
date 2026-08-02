package main

import (
	"net/url"
	"sort"
)

// RouteRule maps a path prefix to a backend target. Public routes skip JWT
// validation; everything else requires a valid bearer token.
type RouteRule struct {
	Prefix string
	Target *url.URL
	Public bool
}

// BuildRoutes returns the static route table, sorted by descending prefix
// length so the most specific rule is matched first.
func BuildRoutes(cfg Config) []RouteRule {
	rules := []RouteRule{
		{Prefix: "/api/auth/register", Target: cfg.AuthServiceURL, Public: true},
		{Prefix: "/api/auth/login", Target: cfg.AuthServiceURL, Public: true},
		{Prefix: "/api/auth/refresh", Target: cfg.AuthServiceURL, Public: true},
		{Prefix: "/api/auth/google", Target: cfg.AuthServiceURL, Public: true},
		{Prefix: "/api/auth/github", Target: cfg.AuthServiceURL, Public: true},
		{Prefix: "/api/auth/oauth/callback", Target: cfg.AuthServiceURL, Public: true},
		{Prefix: "/api/auth", Target: cfg.AuthServiceURL, Public: false},

		// Google/GitHub redirect here directly after the user approves access.
		// Must stay on the same origin as /api/auth/google|github (this gateway)
		// so the OAuth correlation cookie set on the initiating request is still
		// readable when the provider redirects back — otherwise ASP.NET Core's
		// OAuth handler fails correlation validation and throws.
		{Prefix: "/signin-google", Target: cfg.AuthServiceURL, Public: true},
		{Prefix: "/signin-github", Target: cfg.AuthServiceURL, Public: true},

		{Prefix: "/hubs/messaging", Target: cfg.MessagingServiceURL, Public: false},
		{Prefix: "/api/messaging", Target: cfg.MessagingServiceURL, Public: false},

		{Prefix: "/api/candidates", Target: cfg.CandidateServiceURL, Public: false},
		{Prefix: "/api/jobs", Target: cfg.JobServiceURL, Public: false},
		{Prefix: "/api/organizations", Target: cfg.OrganizationServiceURL, Public: false},
		{Prefix: "/api/esign", Target: cfg.EsignServiceURL, Public: false},
		{Prefix: "/api/interviews", Target: cfg.InterviewServiceURL, Public: false},
		{Prefix: "/api/matching", Target: cfg.MatchingServiceURL, Public: false},
	}

	sort.SliceStable(rules, func(i, j int) bool {
		return len(rules[i].Prefix) > len(rules[j].Prefix)
	})

	return rules
}
