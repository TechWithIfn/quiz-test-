# Authoring Questions & Tests

This guide explains how to add high-quality questions and tests to QuizFlow **without**
needing to understand the React application. QuizFlow is a 100% client-side, open-source
test platform: content is version-controlled TypeScript, there is no backend or database.

> Golden rule: **quality over quantity.** One well-written question that teaches a distinct
> concept is worth more than ten barely-different ones. Never mass-generate filler.

---

## 1. Where content lives

All static tests live in `src/data/tests/`. There are two builders:

| Builder | File | Use when |
| --- | --- | --- |
| `buildExpandedTest(...)` | `src/data/tests/testBuilder.ts` | Full tests with rich metadata per question (recommended for depth). |
| `makeTest(...)` + `makeQuestion(...)` | `src/data/tests/catalogExpansion.ts` | Compact seed-style tests (good for short foundation tests). |

Every test file ends by exporting a `RawTest` that is registered in
`src/data/tests/index.ts` (`ALL_RAW_TESTS`). **If you add a new test file, export it and
add it to `ALL_RAW_TESTS`.**

---

## 2. Required fields (per question)

Every question object must satisfy the `RawQuestion` schema (`src/types/content.ts`):

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | ✅ | Unique **within the repository** (`q-<testKey>-<n>`). |
| `question` | string | ✅ | Clear wording, no trick phrasing unless intentional. |
| `type` | `'single-choice' \| 'multiple-choice' \| 'code-snippet'` | ✅ | |
| `options` | `RawOption[]` (≥ 2) | ✅ | Each option needs a unique `id` and non-empty `text`. No duplicate option text. |
| `correctAnswer` | string | ✅ | Must equal one `option.id`. |
| `explanation` | string | ✅ | ≥ 15 chars, teaches the concept (see §6). |
| `topic` | string | ✅ | Descriptive domain topic, e.g. `"Indexing"`. |
| `difficulty` | `'beginner' \| 'intermediate' \| 'advanced'` | ✅ | Match real complexity (see §4). |
| `tags` | string[] | ✅ | 1–4 useful tags; include the topic and category. |

Recommended (not strictly enforced, but reported):

| Field | Type | Notes |
| --- | --- | --- |
| `concept` | string | The specific concept tested. Defaults to `topic` if omitted. |
| `estimatedTime` | number | Seconds to answer. Defaults to `45` if omitted. |
| `hint` | string | Optional nudge for stuck learners. |
| `codeSnippet` / `codeLanguage` | string | Use for code/output questions (`type: 'code-snippet'`). |

A question is **invalid** if any required field is missing, an option is empty/duplicated,
or `correctAnswer` does not match an option id.

---

## 3. How to create a question (example)

Using `buildExpandedTest`:

```ts
import { buildExpandedTest } from '../testBuilder'

const webCat = { id: 'cat-web-development', name: 'Web Development', slug: 'web-development',
  description: '...', color: '#0284c7', icon: 'Globe' }

export const htmlDeepTest = buildExpandedTest(
  'html-deep', 'html-test', 'HTML Deep-Dive Test',
  'Short one-liner description.',
  'Longer full description shown on the test detail page.',
  webCat, 'html', 'intermediate', 30,
  [
    {
      topic: 'Forms – Input Types',
      prompt: 'What advantage does <input type="email"> provide over type="text"?',
      options: [
        'It encrypts the email value before submission',
        'It provides built-in browser validation, a mobile email keyboard, and semantic intent for assistive tech',
        'It automatically sends a verification email',
        'It is identical to type="text" in all browsers',
      ],
      correct: 1,
      explanation:
        'Semantic input types provide free built-in validation, trigger appropriate mobile keyboards, ' +
        'and communicate field purpose to assistive technologies and autofill engines.',
      hint: 'Think mobile UX and free browser-level validation.',
      difficulty: 'beginner',
      tags: ['Forms', 'Input Types', 'Mobile UX'],
    },
    // ...more questions
  ],
  { featured: true, aliases: ['html', 'html5'] }
)
```

`correct` is the zero-based index of the right option; the builder converts it to the
correct `option.id` automatically.

For seed-style tests use `makeTest(testKey, slug, title, shortDescription, category, language, seeds)`:

```ts
export const cProgrammingTest = makeTest('c-programming', 'c-programming-test', 'C Programming Test',
  'Practice pointers, memory, arrays, and core C behavior.', programming, 'c', [
  { topic: 'Pointers', prompt: 'What does a pointer store in C?',
    options: ['A memory address', 'A source file', 'A CPU instruction', 'A type name'],
    correct: 0, explanation: 'A pointer stores the memory address of another object.' },
])
```

---

## 4. Difficulty guidelines

Map to real complexity, not to how hard *you* find it:

- **beginner (Easy)** – fundamentals, definitions, single obvious application.
- **intermediate (Medium)** – combining concepts, realistic "which query/code is correct" tasks.
- **advanced (Hard)** – edge cases, optimisation, architecture, multi-step reasoning.

Target distribution per test:

| Test type | Easy | Medium | Hard |
| --- | --- | --- | --- |
| Standard skill test | ~30% | ~50% | ~20% |
| Interview preparation | ~20% | ~50% | ~30% |

Avoid an all-easy or all-hard test, and never label a question "advanced" just because the
topic is prestigious.

---

## 5. Topic guidelines

Give every test an explicit topic scope. Examples:

- **SQL Interview**: SELECT, WHERE, ORDER BY, GROUP BY, HAVING, JOIN, Subqueries, CTE,
  Window Functions, Indexes, Transactions, Normalization, Constraints, Views, Optimization.
- **Python Interview**: Variables, Data Types, Lists, Tuples, Sets, Dictionaries, Functions,
  Arguments, Lambda, Comprehensions, Exceptions, Modules, OOP, Inheritance, Polymorphism,
  Decorators, Generators, Iterators, Context Managers, Testing.
- **Excel**: Formulas, Functions, Lookup, XLOOKUP, INDEX/MATCH, IF, SUMIFS, COUNTIFS, Text
  functions, Date functions, PivotTables, Charts, Conditional Formatting, Data Cleaning.

Each question's `topic` should be one of these scoping topics. Do not force every test to
cover every topic — a clearly defined, smaller scope beats a vague, sprawling one.

---

## 6. Explanation guidelines

Explanations **teach**. Never write "Option B is correct."

Bad:
> Option B is correct.

Good:
> `GROUP BY` combines rows sharing column values. `HAVING` filters the grouped result *after*
> aggregation, while `WHERE` filters rows *before* grouping — so aggregate filters belong in
> `HAVING`.

For coding questions explain:
- why the correct answer works, and
- why important alternatives fail (when that is instructive).

Keep it concise but educational. Unsupported factual claims and "self-explanatory" are
rejected by the validator.

---

## 7. Duplicate-question rules

Do **not** add:

- exact duplicate questions (same id or same text),
- near-duplicate questions with only minor wording changes,
- questions sharing an identical set of answer options (reused distractor blocks),
- repeated concepts that add no new variation.

The validator **reports** suspected duplicates as warnings; it never deletes content.
If a warning appears, either reword for a genuinely distinct angle or drop the question.

For technical subjects prefer **application** questions over memorisation:

- Bad: "What does SQL stand for?"
- Good: "Which query returns customers with more than three orders?"

Use code/output questions where appropriate.

---

## 8. How to validate content

Run the production content validator. It fails the command (non-zero exit) if any test has
validation **errors**:

```bash
npm run validate:content
```

It checks:

- missing / invalid fields
- invalid `correctAnswer`
- duplicate test IDs / slugs
- duplicate question IDs (within and across tests)
- duplicate / empty options
- missing topics
- invalid difficulty or question type
- missing / weak explanations
- question-count mismatch
- near-duplicate and duplicate-option-set questions (warnings)

To see the full audit (per-test counts, topics, difficulty, coverage, warnings):

```bash
npm run audit:content      # prints a report and writes docs/content-audit.md
```

---

## 9. How to test a new test

1. Add the question(s) using a builder and register the test in `src/data/tests/index.ts`.
2. `npm run typecheck` — ensure it compiles.
3. `npm run validate:content` — ensure zero errors.
4. `npm run audit:content` — review coverage and warnings for your test.
5. `npm test` — run the unit/content suite.
6. `npm run dev` — open the test in the browser, start it, and confirm questions render,
   the correct option is accepted, and the explanation shows.

Recommended question-count targets (do not inflate artificially):

| Scope | Questions |
| --- | --- |
| Small focused test | 20–30 |
| Standard skill test | 30–50 |
| Interview preparation | 40–60 |
| Large comprehensive test | 75–100+ |

Every added question must introduce a distinct concept or a useful variation.

---

## 10. Checklist before opening a PR

- [ ] Question has clear wording and exactly one correct answer.
- [ ] Options are plausible and unique (no duplicates).
- [ ] Explanation teaches the concept (≥ 15 chars, no placeholder).
- [ ] `topic`, `difficulty`, and `tags` are accurate.
- [ ] No duplicate/near-duplicate of an existing question.
- [ ] `npm run validate:content` passes with 0 errors.
- [ ] Audit shows reasonable coverage for the test's scope.
