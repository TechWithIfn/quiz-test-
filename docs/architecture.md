# QuizFlow Architecture & Extension Guide

## 1. System Overview

**QuizFlow** is an open-source, client-side, zero-login online test and quiz platform built for maximum speed, privacy, and frictionless learning.

### Core Principle
```
Search → Find Test → Start → Answer → Result → Review → Improve → Take Another Test
```

### Key Architectural Constraints Fulfilled
- **Zero Authentication / No Logins**: No cookies, no accounts, no user identification, no profiling questions.
- **100% Client-Side Quiz Engine**: Scoring, timer, state transitions, and result generation work offline and without server dependencies.
- **Backend-Agnostic / Extensible**: All data access is mediated through a repository pattern (`ITestRepository`), allowing REST, GraphQL, Supabase, Firebase, or IndexedDB storage adapters to be plugged in seamlessly without rewriting the quiz runner.

---

## 2. Directory Structure

```
├── docs/
│   └── architecture.md          # Technical documentation & extension roadmap
├── public/
│   └── favicon.svg              # SVG icons & PWA assets
├── tests/
│   ├── setup.ts                 # Vitest test setup and DOM mocks
│   ├── quizStore.test.ts        # Quiz session state machine tests
│   ├── scoring.test.ts          # Pure mathematical scoring engine tests
│   └── search.test.ts           # Fuse.js fuzzy search & filter tests
├── src/
│   ├── types/
│   │   └── index.ts             # Domain models (Test, Question, Attempt, Result, etc.)
│   ├── config/
│   │   └── constants.ts         # App config, taxonomy, storage keys
│   ├── utils/
│   │   ├── cn.ts                # Tailwind class merge helper
│   │   ├── time.ts              # Duration & timestamp formatters
│   │   └── scoring.ts           # Pure scoring & breakdown calculator
│   ├── services/
│   │   ├── storage.service.ts   # Safe LocalStorage wrapper
│   │   └── test.service.ts      # ITestRepository interface & LocalTestRepository
│   ├── store/
│   │   ├── theme.store.ts       # Light/Dark mode state with DOM syncing
│   │   ├── quiz.store.ts        # Active test session state machine
│   │   └── history.store.ts     # Client attempt history & bookmarks
│   ├── components/ui/
│   │   ├── Button.tsx           # Button with variants, sizes, icon slots, loading
│   │   ├── Card.tsx             # Card, Header, Content, Footer
│   │   ├── Badge.tsx            # Taxonomy, status, and difficulty badges
│   │   ├── Input.tsx            # Text input with icon slots & validation states
│   │   ├── ProgressBar.tsx      # Smooth animated progress indicators
│   │   ├── ThemeToggle.tsx      # Dark/Light mode switcher
│   │   ├── CodeBlock.tsx        # Syntax block with copy functionality
│   │   └── Modal.tsx            # Accessible dialog modal
│   ├── features/
│   │   ├── search/              # Fuse.js fuzzy search, live dropdown, category pills
│   │   ├── tests/               # Test card, responsive grid, filter toolbars
│   │   ├── quiz/                # Question runner, timer header, navigator palette, submit dialog
│   │   ├── results/             # Score hero, metrics cards, category breakdown
│   │   ├── review/              # Answer auditing, explanations, tag analysis
│   │   └── recommendations/     # Related & next-step test suggestions
│   ├── layouts/
│   │   ├── Header.tsx           # Navigation bar with search shortcut & theme toggle
│   │   ├── Footer.tsx           # Open-source notice & privacy guarantee
│   │   └── MainLayout.tsx       # Standard page layout wrapper
│   ├── pages/
│   │   ├── HomePage.tsx         # Hero search, featured tests, 6-step loop
│   │   ├── TestsCatalogPage.tsx # Full searchable & filterable test catalog
│   │   ├── TestDetailPage.tsx   # Test syllabus, rules, and instant start CTA
│   │   ├── QuizTakingPage.tsx   # Focus-mode quiz runner with keyboard shortcuts
│   │   ├── QuizResultPage.tsx   # Score summary, accuracy gauge, retake triggers
│   │   ├── QuizReviewPage.tsx   # Question-by-question explanations with filter tabs
│   │   ├── AboutPage.tsx        # Open-source manifesto & architectural details
│   │   └── NotFoundPage.tsx     # 404 handler
│   ├── App.tsx                  # React Router configuration
│   ├── main.tsx                 # Entrypoint
│   └── index.css                # Design system tokens & Tailwind layer
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

---

## 3. Core Domain Models

```typescript
// Test metadata
export interface Test {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  category: TestCategory
  tags: TestTag[]
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all-levels'
  timeLimitMinutes: number
  totalQuestions: number
  passingScorePercentage: number
  featured?: boolean
  createdAt: string
}

// Question schema
export interface Question {
  id: string
  testId: string
  text: string
  codeSnippet?: string
  codeLanguage?: string
  options: QuestionOption[]
  correctOptionId: string
  explanation: string
  points: number
  tags: string[]
  category?: string
}

// Result snapshot
export interface TestResult {
  attemptId: string
  testId: string
  testSlug: string
  testTitle: string
  totalQuestions: number
  answeredQuestions: number
  unansweredQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  flaggedQuestions: number
  scorePoints: number
  maxPoints: number
  scorePercentage: number
  passed: boolean
  passingScorePercentage: number
  totalTimeSeconds: number
  timeTakenSeconds: number
  categoryBreakdown: Record<string, CategoryScoreSummary>
  startedAt: string
  completedAt: string
  answers: Record<string, Answer>
}
```

---

## 4. State Management Strategy

1. **Active Quiz Execution (`useQuizStore`)**:
   - Manages active test instance, question index, elapsed time, answer map, review flags, and submission.
  - Synchronizes active attempt state to `localStorage` to guard against accidental page reloads.

2. **History & Bookmarks (`useHistoryStore`)**:
   - Stores up to 100 historical attempts and bookmarked tests on the client device.
   - Never exposes or syncs user data without explicit user initiation.

3. **Theme Preference (`useThemeStore`)**:
   - Supports light / dark mode with instant DOM class manipulation and `prefers-color-scheme` fallback.

4. **Optional Local Learning Data**:
  - `MistakeRepository` records incorrect answers and retry improvements without identity data.
  - `CustomTestRepository` stores validated user-authored tests locally.
  - Both repositories are replaceable and failures never block the basic quiz experience.

---

## 5. Extensibility: Adding a Backend in Phase 2

To introduce a backend or cloud storage layer in the future:
1. Implement the `ITestRepository` interface:
   ```typescript
   export class ApiTestRepository implements ITestRepository {
     async getAllTests(): Promise<Test[]> {
       const res = await fetch('/api/v1/tests')
       return res.json()
     }
     // ...
   }
   ```
2. Replace the singleton in `src/services/test.service.ts`:
   ```typescript
   export const testRepository: ITestRepository = new ApiTestRepository()
   ```
3. The quiz runner, scoring engine, search filters, and UI remain 100% untouched.

---

## 6. What Was Changed & Future Roadmap

### Completed in Phase 1 (Foundation):
- [x] Full architectural scaffolding with React 18, TypeScript, Tailwind CSS, Vite.
- [x] Strict domain models for Tests, Questions, Options, Attempts, Answers, and Results.
- [x] Repository pattern decoupling data sources from presentation.
- [x] Pure scoring engine with per-topic breakdown.
- [x] Fuse.js client-side search and category filtering.
- [x] Focus-mode quiz runner with keyboard shortcuts (1-4, A-D, F to flag, Arrows to navigate).
- [x] Review screen with detailed question rationales and filter tabs.
- [x] Full light/dark mode design system.
- [x] Vitest unit test suite covering scoring, search, and quiz state.

### Phase 2 Roadmap:
- [ ] Export results to JSON / Markdown summary for offline notes.
- [x] Markdown / LaTeX math equation rendering support in question stems and explanations.
- [x] Community test submission schema validator tool at `/contribute/validate`.
- [x] Custom user test creation mode at `/tests/create`, stored locally and exposed through the test repository.
