import { z } from 'zod'
import { SLUG_RE } from '../validators/common.js'

// Contributor-friendly content file schemas. All content is authored as plain
// JSON under `content/` and validated before any database write.
//
// `original: true` is a mandatory copyright attestation: contributors must
// declare that the content is original and not copied from books, courses,
// exam dumps, or competitor question banks.

export const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const questionTypeSchema = z.enum(['single-choice', 'multiple-choice', 'code-snippet'])

export const optionFileSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  correct: z.boolean().default(false),
  codeSnippet: z.string().optional(),
})

export const questionFileSchema = z.object({
  id: z.string().min(1),
  type: questionTypeSchema,
  question: z.string().min(1),
  options: z.array(optionFileSchema),
  explanation: z.string().min(1),
  difficulty: difficultySchema,
  topicSlug: z.string().min(1),
  points: z.number().int().positive().default(1),
  tags: z.array(z.string().min(1)).default([]),
  concept: z.string().optional(),
  codeSnippet: z.string().optional(),
  codeLanguage: z.string().optional(),
  original: z.literal(true, {
    errorMap: () => ({ message: 'Content must be declared original (set "original": true)' }),
  }),
})

export const categoryFileSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(SLUG_RE, 'Invalid slug'),
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export const topicFileSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(SLUG_RE, 'Invalid slug'),
  name: z.string().min(1),
  description: z.string().optional(),
  categorySlug: z.string().min(1),
  original: z.literal(true, {
    errorMap: () => ({ message: 'Content must be declared original (set "original": true)' }),
  }).optional(),
})

export const testFileSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(SLUG_RE, 'Invalid slug'),
  title: z.string().min(1),
  shortDescription: z.string().default(''),
  description: z.string().optional(),
  difficulty: difficultySchema,
  categorySlug: z.string().min(1),
  questionIds: z.array(z.string().min(1)).min(1, 'A test needs at least one question'),
  tags: z.array(z.string().min(1)).default([]),
  status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
  version: z.string().default('1.0.0'),
  estimatedMinutes: z.number().int().positive().default(10),
  featured: z.boolean().default(false),
  passingScorePercentage: z.number().int().min(0).max(100).default(70),
  language: z.string().default('en'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalPath: z.string().optional(),
  original: z.literal(true, {
    errorMap: () => ({ message: 'Content must be declared original (set "original": true)' }),
  }),
})

export type CategoryFile = z.infer<typeof categoryFileSchema>
export type TopicFile = z.infer<typeof topicFileSchema>
export type QuestionFile = z.infer<typeof questionFileSchema>
export type TestFile = z.infer<typeof testFileSchema>
export type OptionFile = z.infer<typeof optionFileSchema>

// Map the public API question type to the stored DB enum value.
export function toDbQuestionType(type: z.infer<typeof questionTypeSchema>) {
  switch (type) {
    case 'single-choice':
      return 'SINGLE_CHOICE' as const
    case 'multiple-choice':
      return 'MULTIPLE_CHOICE' as const
    case 'code-snippet':
      return 'CODE_SNIPPET' as const
  }
}
