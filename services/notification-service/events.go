package main

import (
	"encoding/json"
	"time"
)

const (
	EventApplicationReceived = "application_received"
	EventStageChanged        = "stage_changed"
	EventOfferReady          = "offer_ready"
)

// Envelope mirrors Vettly.Shared.DTOs.Events.DomainEventEnvelope<T> — the
// two-phase decode (RawMessage for Data) lets us pick the concrete event
// struct only after inspecting Type.
type Envelope struct {
	Type       string          `json:"type"`
	OccurredAt time.Time       `json:"occurredAt"`
	Data       json.RawMessage `json:"data"`
}

type ApplicationReceived struct {
	ApplicationId      string `json:"applicationId"`
	JobId              string `json:"jobId"`
	CandidateProfileId string `json:"candidateProfileId"`
	CandidateName      string `json:"candidateName"`
}

type StageChanged struct {
	ApplicationId      string `json:"applicationId"`
	JobId              string `json:"jobId"`
	JobTitle           string `json:"jobTitle"`
	CandidateProfileId string `json:"candidateProfileId"`
	Stage              string `json:"stage"`
	RecruiterUserId    string `json:"recruiterUserId"`
}

type OfferReady struct {
	ApplicationId   string `json:"applicationId"`
	JobId           string `json:"jobId"`
	JobTitle        string `json:"jobTitle"`
	CandidateUserId string `json:"candidateUserId"`
}
