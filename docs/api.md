# QuizFlow Public API

Online-only, public, read-optimized content API. No authentication, no personal
data, no offline/PWA behavior. All descriptive and governance data is treated as
public.

Base URL: `/api`

## Conventions

### Published content only

Every read endpoint returns **only published content**. `Test`, `Question`, and
`Topic` rows carry a `status`; anything not `published` is excluded from all
list/detail/search responses (and therefore yields `404` for single-item
lookups). This keeps drafts, review, and archived content out of the public API.

### Stable ordering (no per-retry randomization)

Question order and option order are returned deterministically (questions by
their `questionOrder` within a test, options by `optionOrder`). The API does
**not** reshuffle on every request, so a client can initialize a stable quiz
session without login. Randomization/rotation, if desired, is a client-side
concern and must not rely on the server changing order between retries.

### HTTP caching

Read endpoints send a normal `Cache-Control: public, max-age=60` header. This is
server-driven HTTP caching only — it never creates an offline quiz system; the
client still requires the network to fetch content. Mutating endpoints (`POST
/api/tests/:slug/answers`) are not cached.

### Envelope

Every response uses a stable envelope.

Success:

```json
{ "success": true, "data": { "...": "..." }, "meta": { "...": "..." } }
```

Error:

```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Category not found", "details": {} }
}
```

### Pagination

List endpoints accept `limit` and `offset` query parameters.

| Param   | Default | Min | Max | Notes                              |
| ------- | ------- | --- | --- | ---------------------------------- |
| `limit` | 50      | 1   | 100 | Values above 100 are rejected (422) |
| `offset`| 0       | 0   | -   | Negative values are rejected (422)  |

Paginated responses include a `meta` object:

```json
{
  "success": true,
  "data": [ "..." ],
  "meta": { "limit": 50, "offset": 0, "total": 128, "hasMore": true }
}
```

### Slugs

Path and filter slugs match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Invalid slugs are
rejected with `422 VALIDATION_ERROR`.

### Validation errors

Request validation failures return `422` with a `VALIDATION_ERROR` code and a
`details` object describing each field.

### Error codes

| Code                  | HTTP |
| --------------------- | ---- |
| `BAD_REQUEST`         | 400  |
| `VALIDATION_ERROR`    | 422  |
| `NOT_FOUND`           | 404  |
| `TEST_NOT_FOUND`      | 404  |
| `CATEGORY_NOT_FOUND`  | 404  |
| `TOPIC_NOT_FOUND`     | 404  |
| `QUESTION_NOT_FOUND`  | 404  |
| `INTERNAL_ERROR`      | 500  |
| `SERVICE_UNAVAILABLE` | 503  |

Single-item lookups use a resource-specific `404` code (e.g. `TEST_NOT_FOUND`)
so clients can branch without parsing messages. Database errors are never
surfaced; they map to `404` (Prisma "record not found"), `503` (DB
unavailable), or `500` (unexpected).

### Answer security

Question options returned by any `GET` endpoint never include `isCorrect`.
Correct answers are only revealed on an explicit, post-submission `POST`.

---

## Endpoints

### GET /api/tests

List tests with optional filters.

Query parameters:

- `category` (slug, optional) — filter by category slug.
- `tag` (slug, optional) — filter by tag slug.
- `difficulty` (optional) — `beginner` | `intermediate` | `advanced`.
- `limit`, `offset` — pagination.

Response `data`: `ApiTest[]` with `meta` pagination.

Example: `GET /api/tests?category=algorithms&difficulty=beginner&limit=20`

---

### GET /api/tests/:slug

Get a single test by slug.

Path: `slug` (slug, required).

Response `data`: `ApiTest` (includes `questionsCount`, `totalPoints`, `estimatedMinutes`).

`404 NOT_FOUND` when the slug does not exist.

---

### GET /api/tests/:slug/questions

Get the questions for a test. **Correct answers are never included.**

Path: `slug` (slug, required).

Query: `type` (optional) — `single-choice` | `multiple-choice` | `code-snippet`.

Response `data`: `ApiQuestion[]` where every option has only `{ id, text }`.

Example: `GET /api/tests/demo-quick-think/questions?type=single-choice`

---

### POST /api/tests/:slug/answers

Submit answers and receive the correctness reveal. This is the **only** path
that returns correct answers.

Path: `slug` (slug, required).

Request body:

```json
{
  "answers": [
    { "questionId": "q1", "optionIds": ["o1"] },
    { "questionId": "q2", "optionIds": ["o3", "o4"] }
  ]
}
```

- `answers` must be a non-empty array.
- Unknown question ids are flagged with `invalid: true` and contribute 0 points.

Response `data`: `ApiAnswerVerification`

```json
{
  "results": [
    {
      "questionId": "q1",
      "correct": true,
      "earnedPoints": 2,
      "correctOptionIds": ["o1"],
      "invalid": false
    }
  ],
  "score": { "total": 3, "earned": 2, "percentage": 67 },
  "answeredCount": 2,
  "unanswered": 0,
  "topicPerformance": { "Numbers": { "total": 2, "correct": 1, "accuracy": 50 } },
  "difficultyPerformance": { "beginner": { "total": 2, "correct": 1, "accuracy": 50 } }
}
```

The result is **calculable without any identity**: `score` plus the stateless
`topicPerformance` / `difficultyPerformance` aggregates and `unanswered` count
let a client render score, accuracy, correct/incorrect/unanswered, topic
performance and difficulty performance with no user account.

- `answers` must be a non-empty array.
- `unanswered` = questions in the test that were not submitted (skipped/timeout).
- Unknown question ids are flagged with `invalid: true` and contribute 0 points.
- Verification is **stateless**: the endpoint writes nothing and, on a double
  submit, simply re-verifies. No anonymous attempt history is stored.

`422 VALIDATION_ERROR` for a missing/empty/non-array body.

---

### GET /api/categories

List categories.

Response `data`: `ApiCategory[]`.

---

### GET /api/categories/:slug

Get a single category.

Path: `slug` (slug, required).

Response `data`: `ApiCategory`. `404` when missing.

---

### GET /api/categories/:slug/tests

List tests in a category.

Path: `slug` (slug, required).

Query: `limit`, `offset`.

Response `data`: `ApiTest[]` with `meta` pagination. `404` when the category
is missing.

---

### GET /api/topics/:slug

Get a topic and its related public content.

Path: `slug` (slug, required).

Response `data`: `ApiTopic` with `tests`, `questions`, and `relatedTopics`.
`404` when missing.

---

### GET /api/search

Search public, published content. Uses PostgreSQL `ILIKE` matching (no external
search engine). Scope: test title, test description, topics, categories, tags.

Query:

- `q` (string, required, non-empty, **max 100 chars**) — search term.
- `category` (slug, optional) — restrict to a category.
- `type` (optional) — `tests` | `categories` | `topics` | `all` (default `all`).
- `limit`, `offset` — pagination.

#### Relevance ranking

Candidates are fetched from the database (bounded — see safety), then ranked in
the service by a score that prioritizes, highest first:

1. exact title match
2. title prefix match
3. title substring match
4. topic match
5. category match
6. description match
7. tag match

Multi-word queries sum per-token scores (e.g. `python oop` rewards a test that
mentions both). Ties break on `featured`, then alphabetical title.

#### Search safety

- Query length is capped at 100 characters (longer → `422 VALIDATION_ERROR`).
- Empty queries are rejected (`422`).
- PostgreSQL `LIKE` wildcards (`%`, `_`) and backslashes in the input are
  stripped before querying, so user input cannot alter the query shape or cause
  wildcard-driven expensive scans.
- Candidate fetching from the DB is capped (`SEARCH_CANDIDATE_CAP = 200`) and
  `limit` is capped at 100, preventing unbounded/expensive queries.

#### SEO

Search is a query endpoint, not a crawlable catalog. The API does **not**
generate a per-keyword indexable page, so thousands of `?q=` URLs are never
exposed as SEO surfaces. Search result pages should be marked `noindex` by the
client. The backend-authored `indexable`/`canonicalPath` fields only apply to
real content pages (tests/categories/topics), not to search.

Response `data`: `SearchResult` with `tests`, `categories`, `topics` arrays and
`meta` (`total`, `limit`, `offset`, `hasMore`).

---

### GET /api/tests/:slug/related

Related-test discovery. Returns other **real, published** tests in the same
category, ranked by title-token overlap with the source test (e.g. `SQL Test`
→ `SQL JOIN Test`, `SQL GROUP BY Test`). No synthetic/fake tests are generated.
`404 TEST_NOT_FOUND` when the source test is missing or unpublished.

---

### GET /api/content/governance

Get platform governance/descriptive content (about, terms, privacy,
categories, tags, total counts).

Response `data`: `Governance`.

---

## Data types (summary)

- `ApiTest`: `id`, `slug`, `title`, `description?`, `category`, `tags`,
  `difficulty`, `status` (`draft` | `published` | `archived`), `version`,
  `canonicalPath?`, `indexable`, `seo?`, `questionsCount`, `totalPoints`,
  `estimatedMinutes?`, `createdAt`, `updatedAt`.
- `ApiQuestion`: `id`, `question`, `questionType`
  (`single-choice` | `multiple-choice` | `code-snippet`), `options`
  (`{ id, text }[]`), `explanation?`, `difficulty`, `tags`, `topic?`, `points`,
  `testId?`.
- `ApiCategory`: `id`, `slug`, `name`, `description?`, `icon?`, `color?`,
  `testCount`.
- `ApiTopic`: `id`, `slug`, `name`, `description?`, `tests`, `questions`,
  `relatedTopics`.
- `ApiTag`: `id`, `slug`, `name`.
- `SearchResult`: `tests` (`ApiTest[]`), `categories` (`ApiCategory[]`),
  `topics` (`ApiTopic[]`), `total` (matched test count).
- `ApiAnswerVerification`: `results` (`ApiAnswerResult[]`), `score`
  (`{ total, earned, percentage }`).
- `ApiAnswerResult`: `questionId`, `correct`, `earnedPoints`,
  `correctOptionIds`, `invalid`.

## Notes

- All responses are validated against response-contract schemas; an internal
  contract breach surfaces as `500 INTERNAL_ERROR`, never as leaked data.
- See `src/validators/*.ts` for request schemas and `src/validators/response.validator.ts`
  for response contracts.
