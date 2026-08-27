/**
 * Static Content Definitions and Schemas for Version-Controlled Test Files
 */

export type QuestionType = 'single-choice' | 'multiple-choice' | 'code-snippet'

export type ContentDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface RawOption {
  id: string
  text: string
  codeSnippet?: string
}

export interface RawQuestion {
  id: string
  question: string
  type: QuestionType
  options: RawOption[]
  correctAnswer: string // id of the correct option
  explanation: string
  hint?: string
  difficulty: ContentDifficulty
  topic: string
  concept?: string
  tags: string[]
  estimatedTime?: number // in seconds
  codeSnippet?: string
  codeLanguage?: string
  points?: number
}

export interface RawTest {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription?: string
  category: {
    id: string
    name: string
    slug: string
    description?: string
    icon?: string
    color?: string
  }
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
  aliases?: string[]
  skills?: string[]
  difficulty: ContentDifficulty
  estimatedMinutes: number
  questionCount: number
  language: string
  passingScorePercentage?: number
  featured?: boolean
  createdAt: string
  updatedAt?: string
  questions: RawQuestion[]
}

export interface ValidationIssue {
  type: 'error' | 'warning'
  testId?: string
  testSlug?: string
  questionId?: string
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  totalTests: number
  totalQuestions: number
}
