# Content Import, Validation & Versioning

Repository-controlled content is the single source of truth. Content lives as
plain JSON under `content/` and is validated, then imported into PostgreSQL by
a fail-safe, transactional pipeline.

```
content/
├── categories/   # *.json  (id, slug, name, ...)
├── topics/       # *.json  (id, slug, name, categorySlug, original?)
├── questions/     # *.json  (id, type, question, options, explanation, ...)
└── tests/         # *.json  (id, slug, title, categorySlug, questionIds, ...)
```

Format: **JSON** (no extra runtime dependency, Git-diff friendly, simple for
contributors). Each content file declares `original: true` as a copyright
attestation.

## Commands

| Command | Purpose | Touches DB? |
| --- | --- | --- |
| `npm run validate:content` | Validate all content files (schema + cross-file rules). Exits non-zero on any issue. | No |
| `npm run content:check` | Validate content **and** verify live DB integrity (orphans, published tests without questions, choice questions without options). | Yes |
| `npm run content:import` | Validate, then import into the database inside one transaction. | Yes |

`content:import` requires `DATABASE_URL`. Validation runs **before** any write, so
broken content can never partially corrupt the production database.

## File schemas (summary)

- **Category**: `id`, `slug` (kebab), `name`, optional `description`/`icon`/`color`.
- **Topic**: `id`, `slug`, `name`, `categorySlug` (must exist), optional `original`.
- **Question**: `id`, `type` (`single-choice`|`multiple-choice`|`code-snippet`),
  `question`, `options[]` (`{ id, text, correct? }`), `explanation`,
  `difficulty`, `topicSlug` (must exist), `points?`, `tags?`, `original: true`.
- **Test**: `id`, `slug`, `title`, `shortDescription`, `difficulty`,
  `categorySlug` (must exist), `questionIds[]` (≥1, must exist, unique),
  `tags?`, `status` (`draft`|`review`|`published`|`archived`, default `draft`),
  `version?`, `estimatedMinutes?`, `featured?`, `passingScorePercentage?`,
  optional SEO (`seoTitle`/`seoDescription`/`canonicalPath`), `original: true`.

## Validation rules (safe import)

| Code | Rule |
| --- | --- |
| `SCHEMA_ERROR` | Field fails its Zod schema (e.g. missing explanation, invalid difficulty, non-original content). |
| `DUPLICATE_ID` | Same `id` used across any content file. |
| `DUPLICATE_SLUG` | Same slug within categories / topics / tests. |
| `DUPLICATE_QUESTION` | Two questions with identical (case-insensitive) text. |
| `INVALID_REFERENCE` | Test → unknown question, question → unknown topic, topic/test → unknown category, or a question listed twice in a test. |
| `MISSING_OPTIONS` | Choice question with fewer than 2 options. |
| `INVALID_ANSWER` | Single-choice with ≠1 correct option; multiple-choice with 0 correct; duplicate option id. |

## Versioning & auditing

- Every `Test` and `Question` carries a `version` string; `Test` also has
  `publishedAt`. On import, the file `version` is written to the row.
- Content files are committed to Git, so **every change is auditable through Git
  history** (who/when/what). The DB is a derived, rebuildable cache of content.
- Re-running `content:import` is idempotent: rows are upserted and child rows
  (options, test/questions links, tags) are replaced, converging to the same
  state.

## Publishing

- Only content with `status: "published"` is exposed by the public API (see
  Prompt 4). Drafts/reviews are imported but filtered out of all read endpoints.
- `question.status` is set to `published` on import, so a published test's
  questions are served; an unpublished (draft) test hides its whole set.

## Copyright rule

All content must be original. The `original: true` field is mandatory; copying
from websites, books, paid courses, exam dumps, or competitor banks is rejected
at validation time. Explanations must be written from concepts, not transcribed.

## Implementation

- `src/content/schema.ts` — Zod schemas + types.
- `src/content/loader.ts` — reads `content/` JSON.
- `src/content/validate.ts` — schema parse + cross-file safety checks.
- `src/content/plan.ts` — maps validated content to a DB-ready `ImportPlan`.
- `src/content/import.ts` — `applyImportPlan` (transactional upserts) + orchestrator.
- `src/content/integrity.ts` — live DB integrity checks for `content:check`.
- `scripts/content-validate.ts`, `content-check.ts`, `content-import.ts` — CLIs.
