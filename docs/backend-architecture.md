# QuizFlow Backend Architecture

_Prepared architecture for the public, no-login backend API. This step designs
and scaffolds the backend **without breaking the existing frontend**. The current
client-side quiz continues to work unchanged; the backend is staged for a later,
incremental migration._

---

## 1. Current (Inspected) Architecture

QuizFlow is a **100% client-side** React 18 + TypeScript single-page app.

| Concern | Current implementation |
| --- | --- |
| Framework | React 18, Vite 6, TypeScript 5 (strict) |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM v6 |
| State | Zustand (`quiz`, `history`, `theme` stores) |
| Content source | `src/data/tests/**` (TS modules, ~36 tests / ~302 questions per content audit) |
| Content service | `ContentService` normalizes `RawTest` → `Test`/`Question` |
| Data access seam | `ITestRepository` + `StaticContentTestRepository` (`src/services/test.service.ts`) |
| Search | Client-side `SearchService` (inverted index + Levenshtein fuzzy) in `src/features/search` |
| Quiz engine | `src/engine/*` (pure scoring, state transition, randomizer, adaptive) |
| Local data | `localStorage` (`StorageService`), custom tests, mistakes, bookmarks, history |
| SEO | `scripts/generate-sitemap.mjs`, `public/robots.txt`, `public/sitemap.xml`, JSON-LD |
| Tests | Vitest + JSDOM |

### Key observation — the integration seam already exists

Every page consumes content exclusively through the `testRepository`
(`ITestRepository`) singleton, **never** importing `src/data/tests` directly:

- `HomePage`, `TestsCatalogPage`, `CategoryPage`, `TestDetailPage`, `QuizTakingPage`
- `QuizResultPage`, `QuizReviewPage`, `PracticeQuestionPage`, `PracticeMistakesPage`
- `features/recommendations/NextTestRecommendations.tsx`

This repository pattern is the exact point where a backend API is plugged in
later. No page needs to change its interaction logic.

---

## 2. Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Browser (Anonymous Visitor)                                  │
│  - UI, routing, timer, palette, animations, result charts    │
│  - Zustand quiz/interaction state (local only)               │
│  - localStorage: attempt recovery, mistakes, bookmarks       │
│  - SearchService (client-side fuzzy search remains local)    │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTPS  (GET only, public)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend API  (Node.js + TypeScript + Fastify)                │
│  /api/tests  /api/questions  /api/categories                 │
│  /api/topics  /api/search  /api/content                      │
│  - Zod input validation   - Consistent error envelope        │
│  - routes → handlers → services → repositories → PostgreSQL  │
└───────────────────────────┬─────────────────────────────────┘
                            │  Prisma
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ PostgreSQL                                                   │
│  categories, tags, topics, tests, questions, options         │
│  + test_questions / question_tags junctions (M:N)            │
│  + ContentStatus enum, version, SEO, isCorrect (hidden)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Responsibility Split

### Frontend keeps (never moves to backend)
- UI components, page layouts, navigation, responsive design, animations
- Question rendering, option selection, timer display, question palette
- Next/previous, mark-for-review, keyboard interactions
- Result visualization & charts, accessibility behavior
- **Client-side quiz interaction state** (Zustand), temporary answer state
- **Browser-local recovery**: attempt recovery, local mistake history, bookmarks,
  theme preference, local custom tests (until a future optional sync)
- **Client-side search UX** — the `SearchService` fuzzy ranking can stay local for
  instant feedback; the backend `/api/search` is the canonical discovery source.

### Backend owns (authoritative source of truth)
- Question bank, test catalog, test metadata
- Categories, topics, tags
- Difficulty & question metadata, answer definitions, explanations
- Tags, test configuration, question selection rules
- Published / unpublished state, content version
- SEO metadata, search/discovery data, content validation, publishing state
- Canonical test information

### Database owns
- Persistent, normalized content (single source of truth)
- Referential integrity between tests, questions, options, taxonomy
- Publishing state & content versioning

### Local browser keeps (no server sync)
- Current attempt recovery, temporary answers
- Local attempt history, bookmarks, theme, local custom tests
- Local adaptive-learning heuristics (derived only from local data)

---

## 4. Technology Decisions

### Backend framework: **Fastify** ✅
Chosen over Express because:
- First-class, schema-friendly TypeScript with full type inference on `req/reply`.
- Built-in `setErrorHandler` / `setNotFound` make the consistent error envelope trivial.
- Lightweight plugin system maps cleanly to the `modules/*` structure.
- High performance with low overhead — appropriate for a read-heavy public API.
- Sensible defaults (JSON, logging, `inject()` for tests) speed up the Vitest suite.

### Validation: **Zod** ✅
Used for all query/params validation; Zod errors are mapped to a `VALIDATION_ERROR`
envelope by the global error handler.

### Database: **PostgreSQL** ✅
Relational integrity, mature tooling, and enums fit content with stable
relationships. The content model uses many-to-many junctions (`test_questions`,
`question_tags`) instead of denormalizing questions under a single test, and a
`ContentStatus` enum (`draft | review | published | archived`) drives what the
public API serves. SEO fields (`seoTitle`, `seoDescription`, `canonicalPath`,
`indexable`) are backend-owned. No JSON/`selectionConfig` blob is used — the
former "question selection rules" are expressed as explicit, queryable columns.

### ORM / query layer: **Prisma** ✅
Chosen over Drizzle because:
- Migrations + `prisma generate` client give strong, typed access with minimal
  boilerplate — lower risk for this team during migration.
- The `seed` workflow and `Json`/enum support match the content model directly.
- Clear repository layer keeps Prisma usage isolated (easy to swap later).

### Data Model (PostgreSQL)

Defined in `backend/prisma/schema.prisma`; migrations in `backend/prisma/migrations`.

| Table | Purpose | Key columns |
| --- | --- | --- |
| `Category` | Taxonomy root | `id`, `slug` (unique), `name`, `description?` |
| `Tag` | Reusable label | `id`, `slug` (unique), `name` |
| `Topic` | Subject area | `id`, `slug` (unique), `name`, `categoryId?`, `status` |
| `Test` | A quiz | `id`, `slug` (unique), `title`, `shortDescription`, `description?`, `difficulty`, `estimatedTime`, `status`, `questionCount`, `seoTitle?`, `seoDescription?`, `canonicalPath?`, `indexable`, `featured`, `version`, `publishedAt?`, `categoryId` |
| `Question` | A single question | `id`, `question`, `questionType` (enum `SINGLE_CHOICE`/`MULTIPLE_CHOICE`/`CODE_SNIPPET`), `explanation`, `difficulty`, `topicId?`, `status`, `version`, `points`, … |
| `Option` | Answer choice | `id`, `questionId`, `optionText`, `optionOrder`, `isCorrect` (**never exposed**), `codeSnippet?` |
| `TestQuestion` | Test→Question (M:N, ordered) | `testId`, `questionId`, `questionOrder` |
| `TestTag` | Test→Tag (M:N) | `testId`, `tagId` |
| `QuestionTag` | Question→Tag (M:N) | `questionId`, `tagId` |

Enums: `Difficulty` (`beginner`/`intermediate`/`advanced`),
`ContentStatus` (`draft`/`review`/`published`/`archived`),
`QuestionType` (stored without hyphens; mapped to the hyphenated API value in
`utils/mappers.ts`).

Constraints: unique `slug` per taxonomy row, required FKs, `status`/`difficulty`/
`questionType` validated by enums, and indexes on `slug` (unique), `categoryId`,
`status`, `topicId`, `featured`, and `questionId` for join lookups. Public queries
filter on `status = 'published'` only.

---

## 5. Folder Structure (created)

```
backend/
├── prisma/
│   └── schema.prisma            # PostgreSQL content model (source of truth)
├── scripts/
│   └── seed.ts                  # One-way import from frontend src/data/tests
├── src/
│   ├── config/                  # env.ts (Zod-validated configuration)
│   ├── db/                      # client.ts (Prisma singleton)
│   ├── middleware/              # errorHandler.ts (consistent envelopes)
│   ├── modules/                 # Feature slices, each with repo+service+route
│   │   ├── tests/
│   │   ├── questions/
│   │   ├── categories/
│   │   ├── topics/
│   │   ├── search/
│   │   └── content/             # publishing state + content version
│   ├── routes/                  # index.ts assembles modules under /api
│   ├── validators/              # Zod schemas for query/params
│   ├── utils/                   # response envelopes, mappers, httpErrors
│   ├── types/                   # domain.ts (API contract types)
│   ├── app.ts                   # buildApp() — testable, no listen()
│   └── server.ts                # start() — listen + graceful shutdown
├── tests/
│   └── health.test.ts           # Fastify inject() tests
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### Layering (dependency direction)
```
route (Fastify plugin)
  → service   (business rules, composition)
    → repository (Prisma queries only)
      → PostgreSQL
```
Application code never imports Prisma types into the HTTP layer; mappers in
`utils/mappers.ts` convert DB rows → API contract types.

---

## 6. Frontend Data Audit (content sources)

| Source file | Type | Records | Move to backend? |
| --- | --- | --- | --- |
| `src/data/tests/index.ts` | Registry | 36 tests | **Yes** (via seed) |
| `src/data/tests/python/*` | Tests+Questions | ~41 Q | **Yes** |
| `src/data/tests/sql/*` | Tests+Questions | ~44 Q | **Yes** |
| `src/data/tests/javascript/*`, `programming/*` | Tests+Questions | ~76 Q | **Yes** |
| `src/data/tests/interview/*`, `aptitude/*`, `reasoning/*` | Tests+Questions | ~75 Q | **Yes** |
| `src/data/tests/excel/*` | Tests+Questions | ~4 Q | **Yes** |
| `src/data/tests/catalogExpansion.ts`, `strategicCatalog.ts` | Tests+Questions | ~62 Q | **Yes** |
| `src/types/content.ts` (`RawTest`, `RawQuestion`) | Type defs | — | Keep as **frontend import/API types** |
| `src/types/index.ts` (`Test`, `Question`) | Runtime types | — | Keep (UI contract) |
| `src/services/content.service.ts` | Normalizer | — | **Yes** (superseded by API) |
| `src/services/test.service.ts` (`ITestRepository`) | Seam | — | Keep interface; add `ApiTestRepository` |
| `src/features/search/*` | Search UI+ranking | — | **Keep local** (UX), backend `/api/search` for canonical |
| `src/services/custom-test.service.ts` | Local custom tests | — | **Keep local** |
| `src/services/mistake.service.ts`, `storage.service.ts` | Local data | — | **Keep local** |

Total audited content (from `npm run audit:content`): **36 tests / 302 questions**.

**Rule enforced:** After migration there is exactly **one** authoritative
production source — PostgreSQL. The frontend will contain only TypeScript types,
API-response types, UI defaults, and (optionally) a small dev mock. No duplicate
production question bank in frontend + backend + database.

---

## 7. API Surface (public, read-only)

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

Planned (later phase, **not public**): `/api/admin/*` content-management
endpoints behind authentication. No auth is added in this step.

---

## 8. Error Format (consistent envelope)

Success:
```json
{ "success": true, "data": [ ... ], "meta": { "total": 36, "limit": 50, "offset": 0 } }
```

Error (never leaks stack traces / SQL / file paths in production):
```json
{
  "success": false,
  "error": { "code": "TEST_NOT_FOUND", "message": "Test not found" }
}
```
`code` values: `BAD_REQUEST`, `VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR`,
`SERVICE_UNAVAILABLE`. Zod failures become `VALIDATION_ERROR` (422) with a
`details` array of `{ path, message }`.

---

## 9. Security & Privacy Boundaries

- **No authentication, no login, no signup, no user table, no sessions, no PII.**
- All public endpoints are `GET`-only; anonymous access by design.
- CORS allow-list from `CORS_ORIGINS` (frontend origin only).
- `helmet` applied; verbose error details disabled outside development.
- `Option.isCorrect` is **omitted** from public question payloads (mappers expose
  only `id` and `text`); answers are evaluated client-side against the local
  attempt, and the server never receives answers.
- No analytics, no personal-data collection, no PWA requirements.
- **PWA audit:** the frontend `package.json` declares `vite-plugin-pwa` but it is
  **never imported** by `vite.config.ts` or any source file, so no service worker,
  offline cache, or manifest is generated. The platform is online-only by design.

---

## 10. Monorepo Decision

Kept as a **single repository with a separate `backend/` package** (no Turborepo
/Nx, no restructuring of the existing frontend). This is the least disruptive
approach: the frontend keeps its own `package.json`, scripts, and build, while the
backend lives beside it. Root `package.json` gains `dev:backend`, `build:backend`,
`typecheck:backend`, `test:backend` convenience scripts that delegate to the
backend package — existing frontend commands are untouched.

---

## 11. Environment Configuration

`backend/.env.example` defines `DATABASE_URL`, `PORT`, `NODE_ENV`, `API_BASE_URL`,
`CORS_ORIGINS`, `CONTENT_VERSION`, `EXPOSE_ERROR_DETAILS`. Real credentials are
never committed; `.env` is git-ignored.
