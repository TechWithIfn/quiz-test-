/**
 * Typed contracts returned by the QuizFlow backend API.
 *
 * These mirror `backend/src/types/domain.ts` and `backend/src/validators/response.validator.ts`.
 * The frontend NEVER receives correct answers on delivery — only the post-submission
 * verification reveal contains them.
 */

export type ApiDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type ApiQuestionType = 'single-choice' | 'multiple-choice' | 'code-snippet'

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

export interface ApiTopic {
  slug: string
  name: string
  category?: ApiCategory
  testCount: number
  questionCount: number
}

export interface ApiTest {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  category: ApiCategory
  tags: ApiTag[]
  topics?: string[]
  difficulty: ApiDifficulty
  estimatedMinutes: number
  totalQuestions: number
  language: string
  passingScorePercentage: number
  featured: boolean
  status: 'draft' | 'review' | 'published' | 'archived'
  version: string
  indexable: boolean
  seoTitle?: string
  seoDescription?: string
  canonicalPath?: string
  createdAt: string
  updatedAt: string
}

export interface ApiQuestion {
  id: string
  testId?: string
  text: string
  type?: ApiQuestionType
  codeSnippet?: string
  codeLanguage?: string
  options: Array<{ id: string; text: string; codeSnippet?: string }>
  explanation: string
  hint?: string
  points: number
  difficulty?: ApiDifficulty
  topic?: string
  topicSlug?: string
  concept?: string
  tags: string[]
  estimatedTime?: number
  category?: string
  version?: string
}

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
  score: { total: number; earned: number; percentage: number }
  answeredCount: number
  unanswered: number
  topicPerformance: Record<string, { total: number; correct: number; accuracy: number }>
  difficultyPerformance: Record<string, { total: number; correct: number; accuracy: number }>
}

export interface ApiSearchResult {
  tests: ApiTest[]
  categories: ApiCategory[]
  topics: ApiTopic[]
  total: number
}

export interface ApiGovernance {
  contentVersion: string
  publishedTests: number
  totalTests: number
  totalQuestions: number
  generatedAt: string
}

/** Body accepted by POST /api/tests/:slug/answers. */
export interface AnswerSubmission {
  answers: Array<{ questionId: string; optionIds: string[] }>
}

/** Envelope returned by every endpoint. */
export interface ApiEnvelope<T> {
  success: boolean
  data: T
  meta?: Record<string, unknown>
  error?: { code: string; message: string; details?: unknown }
}
