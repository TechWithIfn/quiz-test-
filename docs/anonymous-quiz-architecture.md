# Anonymous Online Quiz & Result Architecture (Prompt 7)

Online-only, no accounts. This document evaluates the existing backend against
the Prompt 7 requirements and records the design decisions.

## 1. Quiz flow (server vs client responsibility)

```
Open Test ──▶ Start ──▶ Questions ──▶ Answer ──▶ Submit ──▶ Result ──▶ Review
   GET         (client)   GET          (client)  POST       (client)   (client)
 /tests/:slug            /tests/:slug            /:slug/answers
                           /questions
```

- **Client keeps** (temporary browser storage, never sent to the server):
  selected answers, question navigation, timer display, "mark for review",
  in-progress attempt state, and result visualization.
- **Server provides** (authoritative, read-only except the stateless verify):
  test, questions, question metadata, a correct-answer **verification mechanism**,
  and `version` (via `GET /api/governance`).

## 2. Answer security evaluation

**Verdict: server-side verification was already implemented (Prompt 3) and it
exactly satisfies Prompt 7 — no login was introduced.**

- Pre-submission delivery (`GET /api/tests/:slug/questions`) returns options
  with **only `id` and `text`**. `Option.isCorrect` is mapped out by
  `utils/mappers.ts` and the response schema `apiQuestionOptionSchema` is
  **`.strict()`**, so a leaked `isCorrect` would fail validation before reaching
  any client.
- Correct answers are revealed **only** on an explicit `POST /api/tests/:slug/answers`,
  where the server compares submitted `optionIds` against `Option.isCorrect` in
  the database and returns `correct` + `correctOptionIds` per question.
- The reveal is the **single** path that returns correct answers (enforced by
  contract tests).

### Limitation (documented, accepted)
A determined user who solves a quiz by calling `POST /:slug/answers` for every
permutation can still discover correct options — but this is the explicit reveal
endpoint, which is the intended grading mechanism. There is **no** hidden
client-side answer bank to scrape (the previous client-only grading model was
removed). This is the correct trade-off for a public, account-less quiz: the
score can be gamed by a determined individual, but nothing private is exposed and
no account is created to "prevent" it (Prompt 7 forbids adding login to solve this).

## 3. Result calculation without personal identity

`POST /:slug/answers` returns a stateless `ApiAnswerVerification`:

- `score` → `{ total, earned, percentage }` (score, accuracy)
- per-question `results[].correct` → correct / incorrect
- `unanswered` → skipped/timeout questions
- `topicPerformance` / `difficultyPerformance` → `{ total, correct, accuracy }`
  aggregates computed from the submitted answers + question metadata

The client needs **no identity** to compute score, accuracy, correct, incorrect,
unanswered, time, topic performance, and difficulty performance. Persistent
personal history (if the product wants it) stays local to the browser; the
server never stores it.

## 4. Refresh recovery

- Question delivery is **idempotent**: `GET /api/tests/:slug` and
  `GET /api/tests/:slug/questions` can be re-fetched on refresh and return the
  same public data — no answer leak, no server session.
- Recovery of the in-progress attempt (selected answers, current index, timer,
  mark-for-review) is the client's responsibility using temporary browser storage
  (sessionStorage/localStorage). This is **not** offline mode: the app still
  requires the API online to load questions and to submit; the question bank is
  never cached for offline use.

## 5. No server user history / no tracking

- `verifyAnswers` is **pure**: it reads the test + its questions and returns the
  reveal. It calls **no repository write**, so a double submit simply re-verifies
  and creates zero records. Verified by `tests/guest-quiz.test.ts` (double-submit
  case).
- No `ip`, `userAgent`, session, or anonymous tracking table is written anywhere.
- There are no auth endpoints: `GET /api/auth/login|/api/login|/api/signup|/api/account`
  all return `404` (asserted in `tests/guest-quiz.test.ts`).

## 6. Verification matrix (Prompt 7 §8)

| Scenario | Behavior | Test |
| --- | --- | --- |
| guest start | `GET /api/tests/:slug` → 200, no credentials | guest-quiz |
| guest submit | `POST /:slug/answers` → 200, stateless result | guest-quiz |
| refresh during quiz | `GET /:slug/questions` idempotent, no `isCorrect` | guest-quiz |
| timeout | unanswered questions counted via `unanswered` | guest-quiz (skipped) |
| double submit | re-verified, identical, no stored state | guest-quiz |
| invalid answer | `422 VALIDATION_ERROR` | guest-quiz |
| missing answer | empty `answers` → `422`; partial → `unanswered>0` | guest-quiz |
| result calculation | score + aggregates returned | guest-quiz + answer.verification |
| no login anywhere | auth routes → `404` | guest-quiz |

## Files touched
- `src/types/domain.ts` — `ApiAnswerVerification` gains `unanswered`,
  `topicPerformance`, `difficultyPerformance`.
- `src/validators/response.validator.ts` — `answerVerificationSchema` gains the
  same fields.
- `src/modules/tests/tests.service.ts` — `verifyAnswers` computes the stateless
  aggregates (idempotent, no writes).
- `tests/guest-quiz.test.ts` — Prompt 7 anonymous-flow contract tests.
- `tests/answer.verification.test.ts` — extended with aggregate assertions.
- `docs/api.md` — answer-verification response documented with aggregates.
