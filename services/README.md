# Vettly backend services

All backend services live here as sibling folders, sharing one Postgres instance (`docker-compose.yml`, root) and one Redis instance for caching and async events. The `.NET` services are unified under [`Vettly.slnx`](./Vettly.slnx) and reference the [`shared`](./shared) class library for common DTOs, event contracts, and JWT middleware.

Two communication patterns are used throughout:
- **Synchronous HTTP** between services when the caller needs the result immediately (e.g. candidate-service calling screening-service).
- **Async Redis pub/sub** on a single channel, `vettly.events`, for fire-and-forget notifications. Events are wrapped in a `DomainEventEnvelope<T>` (`shared/DTOs/Events/`) with a `Type`, `OccurredAt`, and `Data` payload. Current event types: `application_received`, `stage_changed`, `offer_ready`, `document_signed`.

## auth-service (.NET)

JWT auth, refresh tokens, and Google/GitHub OAuth. Source of truth for user identity — no outbound calls to other services.

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/auth/google`, `GET /api/auth/github`, `GET /api/auth/oauth/callback`
- `GET /api/internal/users/{id}/name` — internal lookup used by other services to resolve a display name
- Model: `User` (email, password hash, role, name, active flag)
- Refresh tokens and the logout blacklist are stored in Redis via `ITokenService`

## candidate-service (.NET)

Candidate profiles, applications, resumes (stored in Cloudflare R2).

- `api/candidates/applications`: `POST /` (apply), `GET /`, `GET /{id}`, `GET /{id}/summary`, `POST /preview-scores` (batch AI score preview across jobs)
- `api/candidates`: profile CRUD (`GET/POST/PUT /profile`, `POST /profile/avatar`), experience/education/skills sub-resources, resume upload/list/delete/set-primary
- `api/internal/applications`: `PATCH /{id}/screening-result` (callback target for screening-service), `GET /{id}/participants` (used by messaging-service and notification-service)
- Models: `CandidateProfile` (has many `Experience`, `Education`, `Skill`, `Resume`, `Application`); `Application` (job/resume refs, `Status`, `AiScore`, `MatchScore`, `BiasFlagged`, `SkillGap`)
- Calls out to: job-service (`POST /api/jobs/{jobId}/pipeline/applications` to register a new application) and screening-service (`POST /screen-resume`, `POST /batch-preview`)
- Publishes `application_received` to Redis on new application

## job-service (.NET)

Job postings and pipeline stage management.

- `api/jobs`: public `GET /`, `GET /{id}`; recruiter-only `GET /my-jobs`, `GET /my-jobs/stats`, `POST /`, `PUT /{id}`, `PATCH /{id}/status`, `DELETE /{id}`
- `api/jobs/{jobId}/pipeline`: `GET /` (filter by stage), `POST /move`, `POST /applications` (candidate-service registers here), `GET /application/{applicationId}`, `PATCH /application/{applicationId}/notes`
- Models: `JobPosting` (type, experience level, salary range, status draft/open/closed/archived, org info, has many `JobSkill`/`PipelineStage`); `PipelineStage` (applied → screening → matched → interview → offer → hired/rejected)
- Calls out to: organization-service (`GET /api/organizations/mine`, to attach org info when creating a job)
- Publishes `stage_changed` to Redis when a pipeline stage moves

## organization-service (.NET)

Recruiter organizations and membership.

- `api/organizations`: `POST /` (create), `GET /mine`, `GET /{id}` (public), `PUT /mine`, `GET /search`, `POST /join` (by join code), `POST /mine/join-code/regenerate` (owner only)
- Models: `Organization` (profile fields, join code, has many `OrganizationMember`); `OrganizationMember` (role within org)
- No outbound calls; consumed by job-service

## messaging-service (.NET + SignalR)

Real-time chat plus in-app notifications, and the main **consumer** of the Redis event stream.

- `api/messaging/conversations`: `GET /`, `POST /` (get-or-create by application), `GET /{id}/messages` (paginated), `POST /{id}/messages`, `POST /{id}/read`
- `api/messaging`: `GET /notifications`, `POST /notifications/read`, `GET /unread-summary`
- `MessagingHub` (SignalR) — adds each connection to a `user:{userId}` group for real-time push
- Models: `Conversation` (per-side unread counts, has many `Message`); `Notification` (typed: application_received/stage_changed/offer_ready/message_reply/document_signed)
- `RedisEventSubscriber` background service handles all four event types, calling job-service/candidate-service to resolve participants before creating an in-app `Notification`

## esign-service (.NET)

Offer letter generation and e-signatures, documents stored in R2.

- `api/esign/documents`: `POST /` (create), `GET /`, `GET /{id}`, `GET /{id}/download` (presigned URL), `POST /{id}/sign`
- Every action logs an `AuditTrailEntry` (action, actor, IP, user agent)
- Models: `Document` (type, salary/start date, S3 key + signed S3 key, status pending/signed, SHA-256 `Hash`, has one `Signature`, many `AuditTrailEntry`)
- Calls out to: candidate-service, job-service, auth-service to enrich document data
- Publishes `offer_ready` on document creation and `document_signed` after signing

## interview-service (.NET)

Interview scheduling between recruiter and candidate.

- `api/interviews`: `POST /` (recruiter creates), `GET /` (role-aware list), `GET /{id}`, `DELETE /{id}` (cancel)
- Model: `Interview` (recruiter/candidate refs, scheduled time, duration, status, meeting link)
- Calls out to: job-service and candidate-service to validate/enrich data on creation. No events published.

## screening-service (Python / FastAPI)

Resume screening and bias detection.

- `GET /health`
- `POST /screen-resume` → `202 Accepted`, runs as a background task: fetches the job from job-service, downloads the resume from R2, extracts text, scores it, runs bias detection, then **PATCHes the result back** to the caller-supplied `callback_url` (candidate-service's internal screening-result endpoint)
- `POST /batch-preview` → scores one resume against multiple jobs synchronously, no callback
- Scoring: `sentence-transformers` (`all-MiniLM-L6-v2`) cosine similarity between resume and job description for `ai_score`; `match_score` blends `ai_score` (70%) with required/optional skill match ratio (30%)
- Bias detection: flags a `gender_signal` (via name-based gender inference) and `age_signal` (birth/graduation year implying age > 40) — these are heuristics for surfacing potential bias in downstream screening decisions, not ground truth

## matching-service (Python / FastAPI)

Semantic candidate↔job ranking and skill gap analysis, both recruiter-only.

- `POST /api/matching/rank-candidates` — embeds job + candidate profiles and ranks by cosine similarity (`fitScore`); candidates whose profile can't be fetched are returned with `status: "skipped"`
- `POST /api/matching/skill-gap` — matches each required job skill against the candidate's skills above a similarity threshold, returns matched/missing skills and a match percentage
- Forwards the recruiter's JWT when calling candidate-service and job-service

## notification-service (Go)

Pure Redis subscriber — no HTTP endpoints. Subscribes to `vettly.events` and sends transactional email (via SMTP/Mailtrap) for each event type:

| Event | Email sent to |
|---|---|
| `application_received` | Recruiter — "New application from {candidate}" |
| `stage_changed` (ignores `applied`) | Candidate — "You were moved to {stage}" |
| `offer_ready` | Candidate — "Your offer for {job} is ready to sign" |
| `document_signed` | Recruiter — "{candidate} accepted the offer" |

Resolves job/user/participant details via plain HTTP GET to job-service, candidate-service, and auth-service's internal endpoints. Failures are logged and recovered so one bad message never kills the subscribe loop.

## api-gateway (Go)

The single public entry point in front of every other backend service — a reverse proxy with centralized auth, rate limiting, and CORS.

- Static route table (`routes.go`), matched by longest path prefix: `/api/auth`, `/api/candidates`, `/api/jobs`, `/api/organizations`, `/api/messaging` + `/hubs/messaging`, `/api/esign`, `/api/interviews`, `/api/matching` — each proxied to its backend's internal URL via `httputil.ReverseProxy` (which handles WebSocket upgrades natively, so the messaging SignalR hub works transparently through the gateway).
- `screening-service` and every `/api/internal/*` route are **not** exposed through the gateway — internal/service-to-service only.
- JWT validation (`middleware_auth.go`): local HMAC verification using the same `JWT_SECRET`/issuer/audience every other service already validates against — fast-fails protected routes with 401, forwards the original `Authorization` header unchanged. A handful of `auth-service` routes are public (register/login/refresh/OAuth); everything else requires a valid token.
- Per-IP rate limiting (`middleware_ratelimit.go`) — in-memory token bucket, configurable via `RATE_LIMIT_RPS`/`RATE_LIMIT_BURST`.
- CORS is centralized here (`CORS_ALLOWED_ORIGIN`) rather than duplicated per service.
- `GET /health` is handled directly by the gateway (public, bypasses auth) for platform health checks.

## Deployment notes

- `render.yaml` at the repo root defines all 11 services as free-tier Render web services for a zero-cost deployment path (Neon for Postgres, Upstash/Redis Cloud for Redis instead of the docker-compose containers).
- `.github/workflows/deploy.yml` builds and pushes every service's image to GHCR on manual trigger.
