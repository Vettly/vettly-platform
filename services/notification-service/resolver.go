package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Resolver struct {
	client              *http.Client
	jobServiceURL       string
	candidateServiceURL string
	authServiceURL      string
}

func NewResolver(cfg Config) *Resolver {
	return &Resolver{
		client:              &http.Client{Timeout: 5 * time.Second},
		jobServiceURL:       cfg.JobServiceURL,
		candidateServiceURL: cfg.CandidateServiceURL,
		authServiceURL:      cfg.AuthServiceURL,
	}
}

// JobResponse mirrors Vettly.Shared.DTOs.Job.JobResponse — extra fields are
// ignored by encoding/json, so we only declare what we need.
type JobResponse struct {
	RecruiterId string `json:"recruiterId"`
	Title       string `json:"title"`
	CompanyName string `json:"companyName"`
}

// Participants mirrors candidate-service's internal participants response.
type Participants struct {
	CandidateUserId    string `json:"candidateUserId"`
	CandidateFirstName string `json:"candidateFirstName"`
	CandidateLastName  string `json:"candidateLastName"`
	CandidateEmail     string `json:"candidateEmail"`
}

// UserInfo mirrors auth-service's internal user-name response.
type UserInfo struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
}

func (r *Resolver) GetJob(ctx context.Context, jobId string) (*JobResponse, error) {
	var out JobResponse
	url := fmt.Sprintf("%s/api/jobs/%s", r.jobServiceURL, jobId)
	if err := r.getJSON(ctx, url, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *Resolver) GetParticipants(ctx context.Context, applicationId string) (*Participants, error) {
	var out Participants
	url := fmt.Sprintf("%s/api/internal/applications/%s/participants", r.candidateServiceURL, applicationId)
	if err := r.getJSON(ctx, url, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *Resolver) GetUser(ctx context.Context, userId string) (*UserInfo, error) {
	var out UserInfo
	url := fmt.Sprintf("%s/api/internal/users/%s/name", r.authServiceURL, userId)
	if err := r.getJSON(ctx, url, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *Resolver) getJSON(ctx context.Context, url string, out any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}

	resp, err := r.client.Do(req)
	if err != nil {
		return fmt.Errorf("request to %s failed: %w", url, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status %d from %s", resp.StatusCode, url)
	}

	if err := json.NewDecoder(resp.Body).Decode(out); err != nil {
		return fmt.Errorf("decoding response from %s: %w", url, err)
	}
	return nil
}
