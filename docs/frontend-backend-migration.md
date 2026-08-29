# Frontend ↔ Backend Migration Plan

This document is the step-by-step migration from the current 100% client-side
content model to a backend-authoritative model. **The backend scaffolding is
already in place** (see `docs/backend-architecture.md`). Each phase is independently
shippable; the application must keep working at every step.

> Principle: there is exactly **one** authoritative production source of truth —
> PostgreSQL. The frontend never duplicates the production question bank.

---

## PHASE 1 — Backend Foundation ✅ (done in this step)

- [x] Create `backend/` package (Node.js + TypeScript + Fastify + Zod + Prisma).
- [x] `Prisma` schema for `Category, Tag, Topic, Test, Question, Option` + enums.
- [x] Layered modules: `route → service → repository → PostgreSQL`.
- [x] Consistent error envelope + global Zod/Prisma error mapping.
- [x] Public read-only API surface designed under `/api/*`.
- [x] `ApiTestRepository` added in the frontend as **preparation** (not wired in).
- [x] `.env.example`, `README.md`, architecture docs.

**Gate:** `npm run typecheck:backend` and `npm run build:backend` pass.

---

## PHASE 2 — Database Schema & Migration

- [x] Provision PostgreSQL (local Docker or managed).
- [x] `cp backend/.env.example backend/.env` and set `DATABASE_URL`.
- [x] `npm --prefix backend run db:generate`
- [x] `npm --prefix backend run db:migrate` (creates tables, M:N junctions
  `test_questions`/`question_tags`, `ContentStatus`/`QuestionType` enums, SEO
  columns, `version`, and `isCorrect` option flag — answers are never exposed).
- [x] Review generated SQL for safety (no destructive ops on existing data — there is none yet).

**Gate:** `prisma migrate status` is clean; `npx prisma studio` connects.

---

## PHASE 3 — API Implementation & Hardening

- [ ] Verify each endpoint against a live DB:
  `GET /api/tests`, `/:slug`, `/:slug/questions`, `/featured`, `/:slug/related`,
  `/api/categories`, `/api/topics`, `/api/search`, `/api/content/governance`.
- [ ] Add response caching headers (`Cache-Control`, `ETag`) keyed on the test `version`.
- [ ] Add request logging + basic rate limiting (optional, no auth).
- [ ] Add integration tests (`backend/tests/*.test.ts`) for each module.

**Gate:** All public endpoints return correct envelopes; health check green.

---

## PHASE 4 — Content Import

- [ ] Run `npm --prefix backend run db:seed-prod` to import the real catalog.
  - The import script (`backend/scripts/seed.ts`) imports `ALL_RAW_TESTS` from the
    existing `src/data/tests` via the `@/` alias (configured in
    `tsconfig.scripts.json`) and writes into PostgreSQL.
  - Idempotent: categories/tags/topics upsert; a test's questions/links are replaced
    per test. Correct answers become `Option.isCorrect` (never exposed via API).
- [ ] (Local only) `npm --prefix backend run db:seed` loads a small **original**
  demo dataset (`scripts/dev-seed.ts`) for development without real content.
- [ ] Validate counts: `SELECT count(*) FROM "Test"`, `"Question"` ≈ 36 / 302.
- [ ] Spot-check a test's questions and options via `prisma studio`.

**Gate:** DB row counts match the content audit; no duplicate question ids.

---

## PHASE 5 — Frontend API Integration

- [ ] Set `VITE_API_BASE_URL` in `.env` (or leave blank for same-origin `/api`).
- [ ] In `src/services/test.service.ts`, swap the active singleton:
  ```ts
  import { ApiTestRepository } from './api-test.repository'
  export const testRepository: ITestRepository = new ApiTestRepository()
  ```
  (No page files change — they already depend only on `testRepository`.)
- [ ] Map the API contract → frontend `Test`/`Question` (already implemented in
  `api-test.repository.ts`).
- [ ] Add a graceful fallback: if the API is unreachable, fall back to
  `StaticContentTestRepository` so the quiz never hard-fails during rollout.
- [ ] Wire `contentService`/SEO to read `seoTitle`/`seoDescription`/`canonicalUrl`
  from the API where available.

**Gate:** App works against the backend; existing routes/UI unchanged.

---

## PHASE 6 — Remove Production Question Data from Frontend

- [ ] After the API is confirmed live for all tests:
  - Remove `src/data/tests/**` production files (keep `testBuilder`-style local
    custom-test types only).
  - Remove `ContentService` static normalization that depends on `ALL_RAW_TESTS`.
  - Keep `src/types/content.ts` and `RawTest`/`RawQuestion` only if still used by
    the local **custom test builder**; otherwise move them to `api-test.repository`
    mapping helpers.
- [ ] Ensure the frontend bundle no longer ships the question bank (check bundle size drop).
- [ ] Keep `StaticContentTestRepository` as the offline fallback behind a flag.

**Gate:** `npm run build` succeeds; production bundle contains no question text.

---

## PHASE 7 — Regression Testing

- [ ] `npm run typecheck` + `npm run build` (frontend).
- [ ] `npm run test` (Vitest: scoring, search, quiz store) still green.
- [ ] Manual: Search → open test → start → answer → submit → result → review →
  related tests, for at least 3 categories.
- [ ] Verify SEO: sitemap/script still emits canonical URLs; JSON-LD intact.
- [ ] Verify local features unaffected: attempt recovery, mistakes, bookmarks,
  theme, local custom tests.

**Gate:** Zero regressions in quiz flow; content now served from PostgreSQL.

---

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| API downtime breaks the quiz | Keep `StaticContentTestRepository` as offline fallback in Phase 5/6. |
| Search behavior change | Keep client-side `SearchService` for instant UX; backend `/api/search` is canonical discovery. |
| Duplicate content temporarily | Enforced: DB is source of truth after Phase 6; frontend production bank removed. |
| Breaking current quiz now | Not done — backend is staged; `testRepository` still `StaticContentTestRepository`. |
