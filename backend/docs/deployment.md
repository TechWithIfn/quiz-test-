# Deployment & Operations (Prompt 10)

Backend-only, no login, no PWA, no offline mode. Everything here is provider-neutral
and can run fully free on a developer's machine via Docker.

## 1. Environment variables

All configuration comes from the environment — nothing secret is hardcoded.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. Never commit a real value. |
| `PORT` | no | HTTP port (default 3001). |
| `NODE_ENV` | no | `development` \| `test` \| `production`. |
| `API_BASE_URL` | no | Public base URL (used in links/SEO metadata). |
| `CORS_ORIGINS` | no | Comma-separated allowed frontend origins. Must NOT be `*` in production. |
| `CONTENT_VERSION` | no | Reported by `/api/content/governance`. |
| `EXPOSE_ERROR_DETAILS` | no | `false` in production (masks stacks/SQL). |
| `TRUST_PROXY` | no | `true` only behind a trusted reverse proxy (correct per-IP rate limiting). |
| `RATE_LIMIT_*` | no | See `.env.example` (search/submit/question ceilings). |

## 2. Health check

`GET /health` returns a minimal JSON liveness response (`{ success, data: { status, timestamp } }`).
It does **not** query the database and exposes no secrets, so it is safe to expose and is used
by the container `HEALTHCHECK` and any external probe.

## 3. Database

### Migration
Migrations live in `prisma/migrations`. Apply them with:
```
npx prisma migrate deploy          # production: applies pending migrations, no dev data
# or locally with compose:
docker compose run --rm backend npx prisma migrate deploy
```
`migrate deploy` is idempotent and safe to run on every start; it never drops data.

### Startup
- `docker compose up --build` starts Postgres and the backend. The backend waits for the
  `db` service to be **healthy** (`depends_on: condition: service_healthy`) before booting,
  avoiding race conditions.
- The runtime image runs `node dist/server.js` (compiled output). The Prisma client is
  generated at build time and copied into the runtime layer.

### Shutdown
- `docker compose down` stops both containers gracefully. The **named volume `pgdata` is
  preserved** — no data is destroyed.
- Application shutdown is handled by Node/Fastify defaults; there is no in-memory state to
  flush (the API is stateless — see the anonymous-quiz architecture doc).

### Backup considerations
- The database is a normal Postgres data directory in the `pgdata` volume. Back it up with:
  ```
  docker compose exec db pg_dump -U quizflow quizflow > backup.sql
  # restore:
  docker compose exec -T db psql -U quizflow quizflow < backup.sql
  ```
- For managed Postgres (any cloud), use the provider's snapshot/PITR features.
- **Never** run `docker compose down -v` in production — that deletes the volume. It is an
  explicit, opt-in destructive action and is documented as such.

## 4. Production architecture (deployment-neutral)

```
        Internet
           │  HTTPS (TLS terminated at the edge / reverse proxy)
           ▼
        Frontend  (static SPA: CDN, static host, or the same origin)
           │  HTTPS
           ▼
        Backend   (this Node/Fastify service, behind a reverse proxy / load balancer)
           │  internal network
           ▼
        PostgreSQL (managed or self-hosted; do NOT expose it publicly)
```

Notes:
- The reverse proxy (nginx, Caddy, or a cloud LB) should set `X-Forwarded-*` and you should
  set `TRUST_PROXY=true` so per-client-IP rate limiting works.
- Enable `HSTS` (already on in production) at the edge.
- No Redis/cache layer is required — rate limiting uses an in-memory store, sufficient for a
  single instance. For multi-instance deployments, point `@fastify/rate-limit` at a shared
  store (e.g. Redis) only if measured traffic demands it.
- The backend is stateless; scale horizontally by running multiple instances behind the LB.
  Session affinity is unnecessary.

## 5. Cost

**Free (local development):**
- Docker Desktop / Docker Engine — free (open-source / personal use).
- `postgres:16-alpine` image — free, open-source.
- No Redis, no paid services, no external APIs.
- All `npm` dependencies are MIT/permissive.

**Optional, paid (only if you choose a hosted provider):**
- Managed PostgreSQL (AWS RDS, GCP Cloud SQL, Supabase, Neon, Fly Postgres, etc.).
- A VM / container host (Fly.io, Render, Railway, DigitalOcean, etc.).
- A CDN / static host for the frontend.
- These are entirely optional and provider-agnostic; nothing in the code pins you to any
  vendor. `DATABASE_URL` is the only coupling point.

## 6. No offline / PWA

This backend contains **no** service worker, offline cache, background sync, or PWA manifest.
The API is online-only; the frontend (separate) is responsible for temporary browser-storage
refresh recovery, which is not offline mode (see `docs/anonymous-quiz-architecture.md`).

## 7. Docker images

- `Dockerfile` is multi-stage: a `builder` stage installs all dependencies, generates the
  Prisma client, and compiles TypeScript; the `runtime` stage installs **production
  dependencies only** and copies the compiled output + generated Prisma client. No dev
  tooling (eslint, vitest, prisma CLI, typescript) ships in the final image.
- `.dockerignore` excludes `node_modules`, `dist`, `.env`, and logs.
- The container `HEALTHCHECK` hits `/health`.
