# Vettly

Vettly is a smart recruitment platform that uses AI to screen resumes, rank candidates against job requirements, and flag bias in the hiring pipeline — alongside the usual job posting, application, e-signature, and messaging flows recruiters and candidates need.

The platform is a polyglot microservices monorepo: a React SPA frontend, seven ASP.NET Core services, two Python/FastAPI AI services, and two Go services (an API gateway and an async notification worker), all sharing one Postgres instance and Redis for caching and async events.

## Live Demo

- **App**: [vettly-platform.pages.dev](https://vettly-platform.pages.dev)
- **API (gateway)**: [vettly-api-gateway.onrender.com](https://vettly-api-gateway.onrender.com)

Deployed entirely on free tiers — see [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for the full stack, every individual service's URL, and how it's wired together.

## Screenshots

### Recruiter portal

<table>
<tr>
<td width="33%"><img src="Assets/Recruiter/Screenshot%202026-08-02%20153514.png"/><br><sub><b>Dashboard</b> — active jobs, applicant totals, pipeline breakdown</sub></td>
<td width="33%"><img src="Assets/Recruiter/Screenshot%202026-08-02%20153555.png"/><br><sub><b>Jobs</b> — manage postings by status (open/draft/closed/archived)</sub></td>
<td width="33%"><img src="Assets/Recruiter/Screenshot%202026-08-02%20153619.png"/><br><sub><b>Pipeline board</b> — drag candidates through applied → hired/rejected</sub></td>
</tr>
<tr>
<td width="33%"><img src="Assets/Recruiter/Screenshot%202026-08-02%20153625.png"/><br><sub><b>Candidates</b> — every applicant across all jobs, with match score</sub></td>
<td width="33%"><img src="Assets/Recruiter/Screenshot%202026-08-02%20153634.png"/><br><sub><b>Candidate profile</b> — AI/match scores, skill gap, bias check</sub></td>
<td width="33%"><img src="Assets/Recruiter/Screenshot%202026-08-02%20153721.png"/><br><sub><b>Messages</b> — direct chat with candidates (SignalR, real-time)</sub></td>
</tr>
<tr>
<td width="33%"><img src="Assets/Recruiter/Screenshot%202026-08-02%20153744.png"/><br><sub><b>Organization</b> — company profile, team, join code</sub></td>
<td width="33%"><img src="Assets/Recruiter/Screenshot%202026-08-02%20153751.png"/><br><sub><b>Analytics</b> — hire rate and conversion funnel</sub></td>
<td width="33%"><img src="Assets/Recruiter/Screenshot%202026-08-02%20154102.png"/><br><sub><b>Interviews</b> — scheduled interviews with join links</sub></td>
</tr>
</table>

### Candidate portal

<table>
<tr>
<td width="33%"><img src="Assets/Candidate/Screenshot%202026-08-02%20153829.png"/><br><sub><b>Dashboard</b> — applications, profile strength, average match</sub></td>
<td width="33%"><img src="Assets/Candidate/Screenshot%202026-08-02%20153840.png"/><br><sub><b>Find jobs</b> — browse open roles with live match %</sub></td>
<td width="33%"><img src="Assets/Candidate/Screenshot%202026-08-02%20153851.png"/><br><sub><b>Job details</b> — salary, skills, benefits, one-click apply</sub></td>
</tr>
<tr>
<td width="33%"><img src="Assets/Candidate/Screenshot%202026-08-02%20153901.png"/><br><sub><b>My applications</b> — track status across every job applied to</sub></td>
<td width="33%"><img src="Assets/Candidate/Screenshot%202026-08-02%20153927.png"/><br><sub><b>Documents</b> — e-sign offer letters from the document vault</sub></td>
<td width="33%"><img src="Assets/Candidate/Screenshot%202026-08-02%20153944.png"/><br><sub><b>Profile</b> — experience, education, skills, resume</sub></td>
</tr>
</table>

## How a hire happens

1. **Candidate applies** — candidate-service stores the application and asks screening-service to score the resume against the job (async callback pattern: screening-service PATCHes the AI score, match score, skill gap, and any bias flags back onto the application once ready).
2. **Application enters the pipeline** — candidate-service registers it with job-service, which tracks it through stages: `applied → screening → matched → interview → offer → hired/rejected`.
3. **Recruiter reviews candidates** — matching-service ranks all applicants for a job by semantic fit and computes per-candidate skill gaps, on demand from the recruiter dashboard.
4. **Recruiter moves candidates through the pipeline**, schedules interviews (interview-service), and messages candidates directly (messaging-service, real-time via SignalR).
5. **Recruiter sends an offer** — esign-service generates a PDF offer letter, stores it in R2, and tracks a full audit trail (created/viewed/signed) alongside a SHA-256 hash of the signed document.
6. **Candidate signs** the offer on the web portal.
7. Throughout this flow, key events (`application_received`, `stage_changed`, `offer_ready`, `document_signed`) are published to Redis: messaging-service turns them into in-app notifications, and notification-service emails the relevant party.

All of this traffic passes through **api-gateway**, the single public entry point in front of every other backend service — it validates JWTs, rate-limits, centralizes CORS, and reverse-proxies to the right backend by path prefix (with WebSocket passthrough for the messaging hub).

See [`services/README.md`](./services/README.md) for endpoint-level detail on every service, including request/response shapes for the AI services.

## Repository layout

```
vettly-platform/
├── apps/
│   └── web/vettly-web/     # React + TypeScript frontend (candidate & recruiter portal)
├── services/
│   ├── Vettly.slnx          # .NET solution (all C# services + shared lib)
│   ├── shared/               # Shared DTOs & middleware for .NET services
│   ├── auth-service/         # .NET — auth, JWT, OAuth
│   ├── candidate-service/    # .NET — candidate profiles, applications, resumes
│   ├── job-service/          # .NET — job postings, pipeline stages
│   ├── organization-service/ # .NET — recruiter orgs
│   ├── messaging-service/    # .NET — real-time chat (SignalR)
│   ├── esign-service/        # .NET — offer letters, e-signatures
│   ├── interview-service/    # .NET — interview scheduling
│   ├── api-gateway/          # Go — single public entry point: JWT validation, rate limiting, CORS, reverse proxy
│   ├── notification-service/ # Go — async email notifications
│   ├── screening-service/    # Python/FastAPI — resume screening & bias detection
│   └── matching-service/     # Python/FastAPI — candidate↔job ranking & skill gap
└── docker-compose.yml        # Postgres, Redis, and all implemented services
```

## Services

| Service | Stack | Purpose | Port (host) |
|---|---|---|---|
| auth-service | .NET / EF Core | JWT auth, refresh tokens, Google & GitHub OAuth | 5050 |
| candidate-service | .NET / EF Core | Candidate profiles, applications, resume storage (R2) | 5051 |
| job-service | .NET / EF Core | Job postings, pipeline stage management | 5052 |
| organization-service | .NET / EF Core | Recruiter organizations | 5053 |
| screening-service | Python / FastAPI | Resume PDF extraction, AI scoring, bias detection | 5054 |
| messaging-service | .NET + SignalR | Real-time chat between candidates & recruiters | 5055 |
| esign-service | .NET / EF Core | Offer letter generation, e-signatures, document storage (R2) | 5056 |
| interview-service | .NET / EF Core | Interview scheduling | 5057 |
| matching-service | Python / FastAPI | Embedding-based candidate ranking & skill gap analysis | 5058 |
| notification-service | Go | Consumes Redis events, sends email via SMTP (Mailtrap) | internal only (no host port) |
| api-gateway | Go | Single public entry point — JWT validation, per-IP rate limiting, centralized CORS, reverse proxy to every other backend service (incl. WebSocket passthrough for messaging) | 5000 |

Services communicate synchronously over HTTP for request/response calls (e.g. `job-service` → `organization-service`, `candidate-service` → `screening-service`), and asynchronously via Redis pub/sub for fire-and-forget events consumed by `notification-service` (application received, document signed, offer ready, stage changed). In production, `api-gateway` is the only service that should be publicly reachable — every other service is meant to sit on an internal network behind it, each still validating JWTs independently as defense in depth.

Each service that touches Postgres owns its own database on the shared instance: `vettly_auth`, `vettly_jobs`, `vettly_organization`, `vettly_candidate`, `vettly_messaging`, `vettly_esign`, `vettly_interview`.

## Frontend (`apps/web/vettly-web`)

React 19 + TypeScript + Vite, styled with Tailwind CSS v4.

- **Routing**: React Router v7, with route paths centralized in `src/router/routes.ts`
- **Server state**: TanStack Query v5 (persisted to storage)
- **Client/UI state**: Zustand (`src/stores/`)
- **Forms**: React Hook Form + Zod
- **Real-time**: `@microsoft/signalr` for the messaging hub
- **HTTP**: Axios (`src/api/`, one client module per backend service)

Pages are organized by role under `src/pages/`: `auth/`, `candidate/` (profile, applications, interviews, documents), `recruiter/` (job pipeline, candidates, interviews, analytics, bias reports), and `messages/`.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend (.NET) | ASP.NET Core, Entity Framework Core |
| Backend (Go) | Go (notification worker) |
| AI / ML | Python, FastAPI |
| Database | PostgreSQL 16 |
| Cache / Pub-Sub | Redis 7 |
| Object storage | Cloudflare R2 (resumes, signed documents) |
| Email | SMTP via Mailtrap |
| Real-time | SignalR |
| Local orchestration | Docker Compose |

## Getting started

### Prerequisites
- Docker & Docker Compose
- Node.js (for the frontend)
- .NET SDK, Python 3, and Go if you want to run individual services outside Docker

### Backend

1. Create a `.env` file in the repo root (see [Environment variables](#environment-variables) below — the checked-in `.env.example` only lists a subset).
2. Start everything:
   ```
   docker compose up --build
   ```
   This brings up Postgres, Redis, and all 11 services (`auth`, `candidate`, `job`, `organization`, `messaging`, `esign`, `interview`, `screening`, `matching`, `notification`, `api-gateway`).

### Frontend

```
cd apps/web/vettly-web
npm install
npm run dev
```

Requires a `.env` file in `apps/web/vettly-web/` with the `VITE_*_API_URL` variables listed below, pointing at the corresponding service ports above.

## Environment variables

The root `.env` needs:

```
POSTGRES_PASSWORD=
JWT_SECRET=
CORS_ALLOWED_ORIGIN=
FRONTEND_BASE_URL=
JOB_SERVICE_BASE_URL=
ORGANIZATION_SERVICE_BASE_URL=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Cloudflare R2 (resume/document storage)
R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Mailtrap (SMTP)
MAILTRAP_HOST=
MAILTRAP_PORT=
MAILTRAP_USERNAME=
MAILTRAP_PASSWORD=
MAILTRAP_FROM=
```

The frontend's `.env` needs:

```
VITE_AUTH_API_URL=
VITE_CANDIDATE_API_URL=
VITE_JOB_API_URL=
VITE_ORG_API_URL=
VITE_MESSAGING_API_URL=
VITE_ESIGN_API_URL=
VITE_INTERVIEW_API_URL=
```

## Project status

- A manual (`workflow_dispatch`) GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and pushes all 11 service images to GHCR.
- The root `.env.example` is out of date; use the variable list above rather than that file.
