// Backend-owned domain types — the contract returned to the frontend.
// These intentionally mirror the frontend's runtime shapes but are defined
// here so the API does not leak raw Prisma/database types to clients.

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type QuestionType = 'single-choice' | 'multiple-choice' | 'code-snippet'

export type ContentStatus = 'draft' | 'review' | 'published' | 'archived'

export interface ApiCategory {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  color?: string
}

export interface ApiTag {
  id: string
  slug: string
  name: string
}

export interface ApiQuestionOption {
  id: string
  text: string
  codeSnippet?: string
}

// The correct option id is intentionally NOT exposed in question lists; the
// answer is only returned after submission in a future scoring phase. For the
// read-only catalog it is omitted from the public payload.
export interface ApiQuestion {
  id: string
  testId?: string
  text: string
  type: QuestionType
  codeSnippet?: string
  codeLanguage?: string
  options: ApiQuestionOption[]
  explanation: string
  hint?: string
  points: number
  difficulty: Difficulty
  topic?: string
  topicSlug?: string
  concept?: string
  tags: string[]
  estimatedTime?: number
  category?: string
  version?: string
}

export interface ApiTest {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  category: ApiCategory
  tags: ApiTag[]
  topics: string[]
  difficulty: Difficulty
  estimatedMinutes: number
  totalQuestions: number
  language: string
  passingScorePercentage: number
  featured: boolean
  status: ContentStatus
  version: string
  indexable: boolean
  seoTitle?: string
  seoDescription?: string
  canonicalPath?: string
  createdAt: string
  updatedAt: string
}

export interface ApiTopic {
  slug: string
  name: string
  category?: ApiCategory
  testCount: number
  questionCount: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface SearchResult {
  tests: ApiTest[]
  categories: ApiCategory[]
  topics: ApiTopic[]
  total: number
}

// ---------------------------------------------------------------------------
// Answer verification (public, post-submission only)
//
// Clients submit their selections; the server returns correctness. The correct
// option ids ARE included here (this is the post-submission reveal) but are
// NEVER present in the pre-submission question-delivery (GET) payloads.
// ---------------------------------------------------------------------------

export interface ApiAnswerResult {
  questionId: string
  correct: boolean
  correctOptionIds: string[]
  points: number
  earnedPoints: number
  invalid?: boolean
}

export interface ApiAnswerVerification {
  testId: string
  slug: string
  results: ApiAnswerResult[]
  score: {
    total: number
    earned: number
    percentage: number
  }
  answeredCount: number
  // Questions in the test that were not submitted at all (e.g. skipped/timeout).
  unanswered: number
  // Stateless performance breakdown by topic and difficulty. Computed from the
  // submitted answers plus question metadata; no user identity is involved.
  topicPerformance: Record<string, { total: number; correct: number; accuracy: number }>
  difficultyPerformance: Record<string, { total: number; correct: number; accuracy: number }>
}

export interface ApiAnswerSubmission {
  answers: Array<{ questionId: string; optionIds: string[] }>
}
