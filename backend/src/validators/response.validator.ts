import { z } from 'zod'
import { difficultyEnum, questionTypeEnum } from './common.js'

// ---------------------------------------------------------------------------
// Response contracts (defense-in-depth at the HTTP boundary)
//
// These schemas mirror the API payloads produced by `utils/mappers.ts`. They are
// applied via `ok(data, meta, schema)` so a contract drift (or, worse, a leak of
// the correct-answer flag) is caught before it ever reaches a client.
// ---------------------------------------------------------------------------

export const apiCategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export const apiTagSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
})

// Options are STRICT: any extra key (e.g. `isCorrect`, `correctOptionId`) makes
// validation fail. This guarantees answers are never serialized to clients.
export const apiQuestionOptionSchema = z
  .object({
    id: z.string(),
    text: z.string(),
    codeSnippet: z.string().optional(),
  })
  .strict()

export const apiQuestionSchema = z.object({
  id: z.string(),
  testId: z.string().optional(),
  text: z.string(),
  type: questionTypeEnum,
  codeSnippet: z.string().optional(),
  codeLanguage: z.string().optional(),
  options: z.array(apiQuestionOptionSchema),
  explanation: z.string(),
  hint: z.string().optional(),
  points: z.number(),
  difficulty: difficultyEnum,
  topic: z.string().optional(),
  topicSlug: z.string().optional(),
  concept: z.string().optional(),
  tags: z.array(z.string()),
  estimatedTime: z.number().optional(),
  category: z.string().optional(),
  version: z.string().optional(),
})

export const apiTopicSchema = z.object({
  slug: z.string(),
  name: z.string(),
  category: apiCategorySchema.optional(),
  testCount: z.number(),
  questionCount: z.number(),
})

export const apiTestSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  shortDescription: z.string(),
  fullDescription: z.string(),
  category: apiCategorySchema,
  tags: z.array(apiTagSchema),
  topics: z.array(z.string()),
  difficulty: difficultyEnum,
  estimatedMinutes: z.number(),
  totalQuestions: z.number(),
  language: z.string(),
  passingScorePercentage: z.number(),
  featured: z.boolean(),
  status: z.enum(['draft', 'review', 'published', 'archived']),
  version: z.string(),
  indexable: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalPath: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const paginatedApiTestSchema = z.array(apiTestSchema)
export const paginatedApiQuestionSchema = z.array(apiQuestionSchema)
export const paginatedApiCategorySchema = z.array(apiCategorySchema)
export const paginatedApiTopicSchema = z.array(apiTopicSchema)

export const searchResultSchema = z.object({
  tests: z.array(apiTestSchema),
  categories: z.array(apiCategorySchema),
  topics: z.array(apiTopicSchema),
  total: z.number(),
})

export const testQuestionsSchema = z.object({
  test: apiTestSchema,
  questions: paginatedApiQuestionSchema,
})

export const categoryTestsSchema = z.object({
  category: apiCategorySchema,
  tests: paginatedApiTestSchema,
})

export const topicDetailSchema = z.object({
  topic: apiTopicSchema,
  tests: paginatedApiTestSchema,
  questions: paginatedApiQuestionSchema,
})

export const governanceSchema = z.object({
  contentVersion: z.string(),
  publishedTests: z.number(),
  totalTests: z.number(),
  totalQuestions: z.number(),
  generatedAt: z.string(),
})

// Answer-verification response (POST /api/tests/:slug/answers). Correct option
// ids ARE returned here because this is the post-submission reveal path — they
// are never present in the pre-submission question-delivery (GET) payloads.
export const answerResultSchema = z.object({
  questionId: z.string(),
  correct: z.boolean(),
  correctOptionIds: z.array(z.string()),
  points: z.number(),
  earnedPoints: z.number(),
  invalid: z.boolean().optional(),
})

export const answerVerificationSchema = z.object({
  testId: z.string(),
  slug: z.string(),
  results: z.array(answerResultSchema),
  score: z.object({
    total: z.number(),
    earned: z.number(),
    percentage: z.number(),
  }),
  answeredCount: z.number(),
  unanswered: z.number(),
  topicPerformance: z.record(
    z.string(),
    z.object({ total: z.number(), correct: z.number(), accuracy: z.number() }),
  ),
  difficultyPerformance: z.record(
    z.string(),
    z.object({ total: z.number(), correct: z.number(), accuracy: z.number() }),
  ),
})

export type ApiTestPayload = z.infer<typeof apiTestSchema>
export type ApiQuestionPayload = z.infer<typeof apiQuestionSchema>
export type AnswerVerificationPayload = z.infer<typeof answerVerificationSchema>
