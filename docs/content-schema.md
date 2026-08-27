# QuizFlow Static Content Schema & Authoring Guide

This document defines the schema, authoring rules, and directory structure for version-controlled static test and question files in QuizFlow.

---

## 1. Directory Structure

All test content is modularized by domain under `src/data/tests/`:

```
src/data/tests/
├── python/
│   ├── pythonBasics.ts         # Python Basics Test
│   └── pythonInterview.ts      # Python Interview Test
├── sql/
│   ├── sqlBasics.ts            # SQL Basics Test
│   └── sqlInterview.ts         # SQL Interview Test
├── interview/
│   └── dataAnalyst.ts          # Data Analyst Role Assessment
├── excel/
│   └── excelAdvanced.ts        # Advanced Excel Formulas & Analytics
├── javascript/
│   └── javascriptCore.ts       # JavaScript & Async Internals
├── aptitude/
│   └── logicalReasoning.ts     # Logical Reasoning & Aptitude
├── reasoning/
│   └── criticalThinking.ts     # Critical Thinking & Decision Making
└── index.ts                    # Central static test registry
```

The discovery taxonomy is metadata-driven and does not impose a user setup step. Current category slugs are:

`programming`, `data-analytics`, `office-productivity`, `aptitude`, `reasoning`, `english`, `interview-preparation`, `competitive-exams`, `general-knowledge`, `science`, `mathematics`, `web-development`, `database`, `cybersecurity`, and `cloud-devops`.

---

## 2. Test File Format (`RawTest`)

Each test is an exported TypeScript object typed with `RawTest`:

```typescript
export interface RawTest {
  id: string                   // Unique globally (e.g. 'test-py-basics')
  slug: string                 // URL-safe kebab-case (e.g. 'python-basics-test')
  title: string                // Human-readable title
  shortDescription: string     // 1-2 sentence overview for cards & previews
  fullDescription?: string     // In-depth syllabus and description
  category: {
    id: string                 // e.g. 'cat-python'
    name: string               // e.g. 'Python'
    slug: string               // e.g. 'python'
    description?: string
    icon?: string
    color?: string
  }
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedMinutes: number     // Estimated completion time limit in minutes
  questionCount: number        // Total number of questions in test
  language: string             // 'python' | 'sql' | 'javascript' | 'excel' | 'mixed' | 'general'
  passingScorePercentage?: number // Default: 70
  featured?: boolean           // Display on homepage featured banner
  createdAt: string            // ISO 8601 string (e.g. '2026-01-10T00:00:00.000Z')
  questions: RawQuestion[]     // Array of questions
}
```

---

## 3. Question Schema (`RawQuestion`)

Each question inside `questions` must adhere to:

```typescript
export interface RawQuestion {
  id: string                   // Unique ID (e.g. 'q-pyb-1')
  question: string             // The question stem / prompt text
  type: 'single-choice' | 'multiple-choice' | 'code-snippet'
  options: Array<{
    id: string                 // Unique within question (e.g. 'opt-pyb-1a')
    text: string               // Option display text
    codeSnippet?: string       // Optional code snippet inside option
  }>
  correctAnswer: string        // Must match exactly one option.id
  explanation: string          // In-depth explanation & rationale (minimum 10 chars)
  hint?: string                // Optional guiding hint for learner
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  topic: string                // Subtopic name for category accuracy breakdown
   concept?: string             // Optional concept within the topic
  tags: string[]               // Search & concept tags
  estimatedTime?: number       // Estimated seconds to answer
  codeSnippet?: string         // Optional question code block
  codeLanguage?: string        // 'python' | 'sql' | 'javascript' | 'typescript' | 'excel'
  points?: number              // Point weight (default: 1)
}
```

---

## 4. Automated Validation Rules

The `ContentValidatorService` (`src/services/content-validator.service.ts`) enforces the following integrity checks automatically at build and test time:

1. **Unique IDs**:
   - Every `test.id` must be globally unique across all tests.
   - Every `question.id` must be globally unique across the entire platform.
2. **Valid Slugs**:
   - `test.slug` must match `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` (lowercase alphanumeric kebab-case).
   - Duplicate slugs are strictly prohibited.
3. **Correct Answer Integrity**:
   - `question.correctAnswer` must match an existing `option.id` within that question.
4. **Options Requirements**:
   - Each question must provide at least 2 options.
   - Option IDs within a question must be unique.
   - Option texts cannot be empty.
5. **Detailed Explanations**:
   - Explanations must be at least 10 characters long and explain *why* the answer is correct.

---

## 5. How to Add a New Test (Contributor Guide)

1. Create a new file under the appropriate topic folder:
   ```typescript
   // src/data/tests/python/pythonAdvanced.ts
   import { RawTest } from '@/types/content'

   export const pythonAdvancedTest: RawTest = {
     id: 'test-py-adv',
     slug: 'python-advanced-test',
     title: 'Python Advanced Metaprogramming',
     // ...
     questions: [ ... ]
   }
   ```
2. Register the new test in `src/data/tests/index.ts`:
   ```typescript
   import { pythonAdvancedTest } from './python/pythonAdvanced'
   export const ALL_RAW_TESTS: RawTest[] = [
     // ...,
     pythonAdvancedTest
   ]
   ```
3. Run the automated content validator test suite:
   ```bash
   npm run validate:content
   ```
4. Build the application to verify 100% type safety:
   ```bash
   npm run build
   ```

## 6. Browser Authoring and Rich Text

The `/contribute/validate` route accepts one test object or an array of test objects as JSON and runs the same schema validator used by the repository. It performs no network request.

The `/tests/create` route creates validated single-choice tests on the current device. Custom tests use the same `RawTest` schema, repository interface, quiz engine, scoring, review, and recommendation flows as version-controlled tests. They can be edited or deleted locally.

Question stems, options, and explanations support Markdown and `$inline$` or `$$block$$` math. Rendering is sanitized before KaTeX enhancement; raw HTML and scripts are not enabled.
