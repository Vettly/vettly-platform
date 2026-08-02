# Deployment

Vettly runs entirely on free-tier infrastructure: no VPS, no paid database, no paid Redis. This doc covers the live stack, every service's URL, and how it was set up.

## Stack

| Piece | Provider | Why |
|---|---|---|
| Frontend | Cloudflare Pages | Free static hosting, global CDN, no cold starts |
| Backend (11 services) | Render (free web services) | Free tier runs arbitrary Docker containers, no VPS to manage |
| Postgres | Neon | Free serverless Postgres, supports multiple databases in one project |
| Redis | Upstash | Free Redis with a standard `rediss://` protocol endpoint (not just REST) |
| Container registry | GHCR | Free private image storage, used by the manual build workflow |
| Email | Mailtrap (sandbox) | Free — note: sandbox mode captures mail in a test inbox, doesn't deliver to real recipients |
| Object storage | Cloudflare R2 | Resumes and signed documents |

## Live URLs

**Frontend**: https://vettly-platform.pages.dev

**Backend** (each is its own Render web service — in the originally-designed architecture only `api-gateway` was meant to be publicly reachable, with everything else on a private network behind it; Render's free tier gives every web service its own public URL regardless, so today all of these are technically reachable directly, not just through the gateway):

| Service | URL |
|---|---|
| api-gateway | https://vettly-api-gateway.onrender.com |
| auth-service | https://vettly-auth-service.onrender.com |
| candidate-service | https://vettly-candidate-service.onrender.com |
| job-service | https://vettly-job-service.onrender.com |
| organization-service | https://vettly-organization-service.onrender.com |
| messaging-service | https://vettly-messaging-service.onrender.com |
| esign-service | https://vettly-esign-service.onrender.com |
| interview-service | https://vettly-interview-service.onrender.com |
| screening-service | https://vettly-screening-service.onrender.com |
| matching-service | https://vettly-matching-service.onrender.com |
| notification-service | https://vettly-notification-service.onrender.com |

The frontend only ever talks to `api-gateway` — every `VITE_*_API_URL` env var points at the same gateway URL, since the endpoint paths already disambiguate which backend a request is for (e.g. `/api/auth/*`, `/api/candidates/*`).

## Setup

### 1. Neon (Postgres)

One Neon project, one Postgres instance, 7 databases inside it (`vettly_auth`, `vettly_jobs`, `vettly_organization`, `vettly_candidate`, `vettly_messaging`, `vettly_esign`, `vettly_interview`), created via the SQL editor:

```sql
CREATE DATABASE vettly_auth;
CREATE DATABASE vettly_jobs;
CREATE DATABASE vettly_organization;
CREATE DATABASE vettly_candidate;
CREATE DATABASE vettly_messaging;
CREATE DATABASE vettly_esign;
CREATE DATABASE vettly_interview;
```

Each service's `ConnectionStrings__*` env var uses Neon's **pooler host**, in Npgsql's key-value format — **not** the `postgresql://` URI Neon's dashboard shows by default:

```
Host=<project>-pooler.<region>.aws.neon.tech;Database=<dbname>;Username=<user>;Password=<password>;SSL Mode=Require;Trust Server Certificate=true
```

Every .NET service that touches Postgres runs `db.Database.Migrate()` on startup — no manual migration step needed after first deploy.

### 2. Upstash (Redis)

One free Redis database. Two different formats needed depending on the client library:

- **`notification-service` (Go, `go-redis`)** — set `REDIS_URL` to the full `rediss://default:<password>@<host>:6379` connection string directly; `redis.ParseURL()` understands it natively.
- **The 5 .NET services using Redis** (`auth`, `job`, `candidate`, `messaging`, `esign`) — `StackExchange.Redis` doesn't parse `rediss://` URIs. Set `Redis__ConnectionString` to: `<host>:6379,password=<password>,ssl=True,abortConnect=False`.

Standard Redis pub/sub (not just Upstash's HTTP REST API) was verified working with a plain `redis-cli --tls -u <url> subscribe/publish` round-trip before wiring up the real services — worth re-confirming if the Redis provider ever changes, since some serverless Redis offerings only support pub/sub over their REST API, which none of these services use.

### 3. Render — backend

`render.yaml` at the repo root is a Render Blueprint defining all 11 services (`type: web`, `runtime: docker`, `plan: free`, `healthCheckPath: /health`). Every secret and inter-service URL is marked `sync: false` in the blueprint (never committed) and filled in manually per service in Render's dashboard after the blueprint creates the (initially failing) services.

Inter-service URLs follow Render's deterministic naming: `https://<service-name>.onrender.com`, matching each service's `name:` in `render.yaml`.

### 4. Cloudflare Pages — frontend

- Root directory: `apps/web/vettly-web`
- Build command: `npm run build`
- Output directory: `dist`
- All 7 `VITE_*_API_URL` vars set to the gateway's URL (see Live URLs above)

### 5. CI — build & push images

`.github/workflows/deploy.yml` — manual (`workflow_dispatch`) matrix build across all 11 services, pushing `:latest` and `:<sha>` tags to `ghcr.io/vettly/vettly-<service>`. `docker-compose.yml` mirrors this with `image:` + `pull_policy: always` alongside each service's existing `build:` block, so local dev (`docker compose up --build`) is unaffected.

## Known limitations of this deployment

- Every backend service is individually publicly reachable (a Render free-tier constraint), not just `api-gateway` — each still validates JWTs independently, but this differs from the private-network isolation the original architecture assumed.
- `screening-service`/`matching-service` load a `sentence-transformers` model into memory; Render's free tier gives 512MB RAM, which is tight for PyTorch — watch for OOM kills in their logs on first real use.
- Mailtrap sandbox mode means notification emails never reach real inboxes in this deployment.
- No CI auto-triggers on push — the GHCR build/push workflow is manual (`workflow_dispatch`) only.
