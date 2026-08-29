import { z } from 'zod'
import { difficultyEnum, paginationQuery, questionTypeEnum, slug, slugParam } from './common.js'

export const listTestsQuery = paginationQuery.extend({
  category: slug.optional(),
  difficulty: difficultyEnum.optional(),
  tag: slug.optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  sort: z.enum(['newest', 'questions-asc', 'time-asc', 'title']).default('title'),
})

export const getTestParams = slugParam

// Query for the questions of a single test. `type` filters by question type and
// exercises the questionType validator.
export const testQuestionsQuery = paginationQuery.extend({
  type: questionTypeEnum.optional(),
})

export const getTestQuestionsParams = slugParam

// Request body for the public answer-verification endpoint. The client submits
// its selections; the server returns correctness WITHOUT exposing correct
// answers through the question-delivery (GET) endpoints.
export const answerSubmissionSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1).max(100),
        optionIds: z.array(z.string().min(1).max(100)).min(1).max(10),
      }),
    )
    .min(1)
    .max(200),
})

export type ListTestsQuery = z.infer<typeof listTestsQuery>
export type GetTestParams = z.infer<typeof getTestParams>
export type TestQuestionsQuery = z.infer<typeof testQuestionsQuery>
export type AnswerSubmission = z.infer<typeof answerSubmissionSchema>
