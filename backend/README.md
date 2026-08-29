# QuizFlow Backend API

Public, **no-login** API for the QuizFlow test platform. It serves the test
catalog, questions, categories, topics, and search from PostgreSQL — the single
authoritative source of truth for content. The frontend remains responsible for
all UI, quiz interaction, and browser-local state.

> This backend is staged alongside the existing frontend. It does **not** replace
> the frontend's current static content yet — see `../docs/frontend-backend-migration.md`.

## Tech Stack

- **Node.js + TypeScript** (strict)
- **Fastify** — HTTP framework
- **Zod** — input validation
- **PostgreSQL** — persistent content storage
- **Prisma** — ORM / query layer + migrations
- **Vitest** — tests (`app.inject`)

## Requirements

- Node.js 18+
- PostgreSQL 14+ (local Docker or managed)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL instance.

# 3. Generate Prisma client & create tables
npm run db:generate
npm run db:migrate

# 4. Seed a local dev dataset (original demo content, safe for local use)
npm run db:seed

# 5. (Optional) Import the real frontend content catalog into PostgreSQL
npm run db:seed-prod

# 6. Run the API (default http://localhost:3001)
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start with hot reload (`tsx watch`). |
| `npm run build` | Compile TypeScript to `dist/`. |
| `npm run start` | Run compiled `dist/server.js`. |
| `npm run typecheck` | `tsc --noEmit` (backend `src`). |
| `npm run typecheck:scripts` | Typecheck `scripts/` against the real frontend data. |
| `npm run lint` | ESLint over `src`. |
| `npm run test` | Vitest suite. |
| `npm run db:generate` | Generate Prisma client. |
| `npm run db:migrate` | Apply migrations (dev). |
| `npm run db:deploy` | Apply migrations (production). |
| `npm run db:seed` | Seed original **demo** content into the database. |
| `npm run db:seed-prod` | Import content from the frontend `src/data/tests`. |
| `npm run db:studio` | Open Prisma Studio. |
| `npm run validate:content` | Validate `content/` files (schema + cross-file rules). No DB. |
| `npm run content:check` | Validate content and verify live DB integrity. |
| `npm run content:import` | Import validated `content/` into the database (transactional). |

## API Surface (public, read-only)

```
GET /health
GET /api/tests
GET /api/tests/featured
GET /api/tests/:slug
GET /api/tests/:slug/questions
GET /api/tests/:slug/related
GET /api/questions?topic=:slug
GET /api/categories
GET /api/categories/:slug
GET /api/categories/:slug/tests
GET /api/topics
GET /api/topics/:slug
GET /api/search?q=...&type=...
GET /api/content/governance
```

All responses use a consistent envelope:

```json
{ "success": true, "data": [ ... ], "meta": { "total": 36 } }
```

Errors:

```json
{ "success": false, "error": { "code": "TEST_NOT_FOUND", "message": "Test not found" } }
```

The correct-answer flag (`Option.isCorrect`) is intentionally **omitted** from
public question payloads — the API only exposes `id` and `text` per option, so the
server never leaks answers and never receives quiz answers.

## Architecture

```
route (Fastify plugin)
  → service     (composition / business rules)
    → repository (Prisma queries only)
      → PostgreSQL
```

Modules live in `src/modules/*` (each with `*.module.ts`, `*.service.ts`,
`*.repository.ts`). Shared utilities: `utils/response.ts` (envelopes),
`utils/mappers.ts` (DB → API contract), `utils/httpErrors.ts` (`ApiError`).

Future content-management endpoints will live under `/api/admin` behind
authentication — **not** implemented in this phase, and no user/auth tables exist.

## Migrations

Migrations are SQL files under `prisma/migrations/<name>/migration.sql`, generated
and managed by Prisma Migrate. They are the **only** way schema changes reach
production — there is no `prisma db push` / auto-sync in the deploy path.

```bash
# Create a new migration after editing prisma/schema.prisma
npm run db:migrate            # dev: writes SQL + updates _prisma_migrations

# Apply pending migrations without generating (CI / production)
npm run db:deploy

# Inspect the generated SQL before applying
npx prisma migrate diff --from-migration-history --to-schema-datamodel prisma/schema.prisma --script
```

**Rollback.** Prisma does not auto-rollback. To revert:

1. `npx prisma migrate resolve --rolled-back <migration-name>` to mark it applied-then-rolled-back, **or**
2. Write a compensating migration (preferred for production) that reverses the change, then commit it.

Never edit an already-applied migration file; always add a new one.

**Seed.** Two distinct seeds exist:

- `npm run db:seed` — `scripts/dev-seed.ts`: tiny **original** demo dataset
  (category, tags, topics, and a couple of tests with questions). Safe and clearly
  marked as demo; contains no real user data.
- `npm run db:seed-prod` — `scripts/seed.ts`: the one-way bridge that imports the
  existing frontend `src/data/tests` catalog into PostgreSQL. Idempotent
  (re-runnable). This is the step that makes the database the source of truth.

## Privacy & PWA Audit

- **No authentication, no users.** There are no login/session/account tables and no
  personal data anywhere in the schema. The backend stores **public content only**
  (tests, questions, categories, topics, tags).
- **No PWA / offline.** A `vite-plugin-pwa` dependency exists in the *frontend*
  `package.json` but is **never imported** by `vite.config.ts` or any source file,
  so no service worker, no offline cache, and no `manifest` generation run. The
  platform is online-only by design. (Recommend removing the unused dependency.)
- **No analytics / tracking.** Nothing in the backend collects client identifiers.

See `../docs/backend-architecture.md` for the full data model and
`../docs/frontend-backend-migration.md` for the rollout plan.
