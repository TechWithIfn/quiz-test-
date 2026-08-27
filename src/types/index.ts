/**
 * Core Domain Models for QuizFlow Platform
 * Decoupled from physical storage or backends.
 */

export * from './content'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'all-levels'

export interface TestCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
}

export interface TestTag {
  id: string
  name: string
  slug: string
}

export interface QuestionOption {
  id: string
  text: string
  codeSnippet?: string
}

export interface Question {
  id: string
  testId: string
  text: string // Normalized question text
  question?: string // Source question alias
  type?: 'single-choice' | 'multiple-choice' | 'code-snippet'
  codeSnippet?: string
  codeLanguage?: string
  options: QuestionOption[]
  correctOptionId: string
  correctAnswer?: string // Source alias
  explanation: string
  hint?: string
  points: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  topic: string
  concept?: string
  tags: string[]
  estimatedTime?: number // in seconds
  category?: string
}

export interface Test {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  category: TestCategory
  tags: TestTag[]
  topics?: string[]
  skills?: string[]
  aliases?: string[]
  difficulty: DifficultyLevel
  timeLimitMinutes: number
  estimatedMinutes?: number // Alias
  totalQuestions: number
  questionCount?: number // Alias
  language?: string
  passingScorePercentage: number
  author?: {
    name: string
    avatarUrl?: string
  }
  featured?: boolean
  createdAt: string
  updatedAt?: string
}

export interface Answer {
  questionId: string
  selectedOptionId: string | null
  isMarkedForReview: boolean
  timeSpentSeconds: number
  answeredAt?: string
}

export interface MistakeRecord {
  id: string
  questionId: string
  testId: string
  testSlug: string
  testTitle: string
  selectedOptionId: string
  correctOptionId: string
  attemptId: string
  questionNumber: number
  topic?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  recordedAt: string
  lastCorrectAt?: string
  correctRetryCount: number
}

export type QuizMode = 'full-test' | 'single-question' | 'mistake-practice' | 'custom-test' | 'adaptive-practice'

export type TestAttemptStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned'

export interface TestAttempt {
  id: string
  testId: string
  testSlug: string
  testTitle: string
  startedAt: string
  completedAt?: string
  status: TestAttemptStatus
  mode?: QuizMode
  answers: Record<string, Answer> // questionId -> Answer
  currentQuestionIndex: number
  timeRemainingSeconds: number
  expiresAt?: string
}

export interface CategoryScoreSummary {
  category: string
  totalQuestions: number
  correctQuestions: number
  accuracyPercentage: number
}

export interface TopicScoreSummary {
  topic: string
  totalQuestions: number
  attemptedQuestions: number
  correctQuestions: number
  incorrectQuestions: number
  accuracyPercentage: number
  averageTimeSeconds?: number
}

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
  topicBreakdown?: Record<string, TopicScoreSummary>
  startedAt: string
  completedAt: string
  answers: Record<string, Answer>
}

export interface SearchFilterState {
  query: string
  categorySlug?: string
  difficulty?: DifficultyLevel
  tagSlug?: string
  sortBy?: 'popular' | 'newest' | 'questions-asc' | 'time-asc'
}

export interface ClientBookmark {
  testSlug: string
  bookmarkedAt: string
}
