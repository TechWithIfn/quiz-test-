import type {
  ApiCategory,
  ApiQuestion,
  ApiQuestionOption,
  ApiTag,
  ApiTest,
  ApiTopic,
  ContentStatus,
  Difficulty,
  QuestionType,
} from '../types/domain.js'
import type { Category, QuestionType as DbQuestionType, Tag, Topic } from '@prisma/client'
import type { Prisma } from '@prisma/client'

export const testInclude = {
  category: true,
  testTags: { include: { tag: true } },
  testQuestions: { include: { question: { include: { topic: true } } } },
  _count: { select: { testQuestions: true } },
} satisfies Prisma.TestInclude

// Lightweight projection for LIST/SEARCH endpoints — excludes the full question
// bank (question text, options, explanations) so catalog/search responses stay
// small. Total question count comes from `_count`; topics are omitted (the
// catalog UI does not need them).
export const testListInclude = {
  category: true,
  testTags: { include: { tag: true } },
  _count: { select: { testQuestions: true } },
} satisfies Prisma.TestInclude

// Detail projection: includes only the topics needed to build the topic list,
// not option text/explanation. Used by GET /api/tests/:slug.
export const testDetailInclude = {
  category: true,
  testTags: { include: { tag: true } },
  testQuestions: { select: { question: { select: { topic: true } } } },
  _count: { select: { testQuestions: true } },
} satisfies Prisma.TestInclude

export type TestWithRelations = Prisma.TestGetPayload<{ include: typeof testInclude }>
export type TestListWithRelations = Prisma.TestGetPayload<{ include: typeof testListInclude }>
export type TestDetailWithRelations = Prisma.TestGetPayload<{ include: typeof testDetailInclude }>

export const questionInclude = {
  options: { orderBy: { optionOrder: 'asc' } },
  topic: true,
  questionTags: { include: { tag: true } },
  testQuestions: { select: { testId: true } },
} satisfies Prisma.QuestionInclude

export type QuestionWithRelations = Prisma.QuestionGetPayload<{ include: typeof questionInclude }>

// Map the stored DB enum to the hyphenated public API value.
function toApiQuestionType(value: DbQuestionType): QuestionType {
  switch (value) {
    case 'SINGLE_CHOICE':
      return 'single-choice'
    case 'MULTIPLE_CHOICE':
      return 'multiple-choice'
    case 'CODE_SNIPPET':
      return 'code-snippet'
  }
}

// Map the hyphenated public API value back to the stored DB enum.
export function toDbQuestionType(value: QuestionType): DbQuestionType {
  switch (value) {
    case 'single-choice':
      return 'SINGLE_CHOICE'
    case 'multiple-choice':
      return 'MULTIPLE_CHOICE'
    case 'code-snippet':
      return 'CODE_SNIPPET'
  }
}

export function toApiCategory(category: Category): ApiCategory {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description ?? undefined,
    icon: category.icon ?? undefined,
    color: category.color ?? undefined,
  }
}

export function toApiTag(tag: Tag): ApiTag {
  return { id: tag.id, slug: tag.slug, name: tag.name }
}

// Structural source type shared by the full, list and detail projections so a
// single mapper serves every endpoint. List/detail projections omit
// `testQuestions` (or only select the topic), which is fine here because
// `testQuestions` is optional.
interface ApiTestSource {
  id: string
  slug: string
  title: string
  shortDescription: string
  description: string | null
  category: Category
  testTags: { tag: { id: string; slug: string; name: string } }[]
  testQuestions?: ({ question?: { topic?: { slug: string; name: string } | null } | null })[]
  _count?: { testQuestions: number } | null
  questionCount: number
  difficulty: Difficulty
  estimatedTime: number
  language: string
  passingScorePercentage: number
  featured: boolean
  status: ContentStatus
  version: string
  indexable: boolean
  seoTitle: string | null
  seoDescription: string | null
  canonicalPath: string | null
  createdAt: Date
  updatedAt: Date
}

export function toApiTest(test: ApiTestSource): ApiTest {
  const tags = (test.testTags ?? []).map((relation) => toApiTag(relation.tag))
  const total = test._count?.testQuestions ?? test.questionCount
  const topicMap = new Map<string, string>()
  for (const tq of test.testQuestions ?? []) {
    const topic = tq.question?.topic
    if (topic) topicMap.set(topic.slug, topic.name)
  }
  return {
    id: test.id,
    slug: test.slug,
    title: test.title,
    shortDescription: test.shortDescription,
    fullDescription: test.description ?? test.shortDescription,
    category: toApiCategory(test.category),
    tags,
    topics: Array.from(topicMap.values()),
    difficulty: test.difficulty as Difficulty,
    estimatedMinutes: test.estimatedTime,
    totalQuestions: total,
    language: test.language,
    passingScorePercentage: test.passingScorePercentage,
    featured: test.featured,
    status: test.status as ContentStatus,
    version: test.version,
    indexable: test.indexable,
    seoTitle: test.seoTitle ?? undefined,
    seoDescription: test.seoDescription ?? undefined,
    canonicalPath: test.canonicalPath ?? undefined,
    createdAt: test.createdAt.toISOString(),
    updatedAt: test.updatedAt.toISOString(),
  }
}

// The correct option flag (isCorrect) is intentionally omitted from public
// payloads so answers never leak through the read-only catalog API.
export function toApiQuestion(question: QuestionWithRelations): ApiQuestion {
  const options: ApiQuestionOption[] = question.options.map((option) => ({
    id: option.id,
    text: option.optionText,
    ...(option.codeSnippet ? { codeSnippet: option.codeSnippet } : {}),
  }))
  const tags = (question.questionTags ?? []).map((relation) => relation.tag.name)
  const testId =
    question.testQuestions && question.testQuestions.length > 0
      ? question.testQuestions[0].testId
      : undefined
  return {
    id: question.id,
    ...(testId ? { testId } : {}),
    text: question.question,
    type: toApiQuestionType(question.questionType),
    ...(question.codeSnippet ? { codeSnippet: question.codeSnippet } : {}),
    ...(question.codeLanguage ? { codeLanguage: question.codeLanguage } : {}),
    options,
    explanation: question.explanation,
    ...(question.hint ? { hint: question.hint } : {}),
    points: question.points,
    difficulty: question.difficulty as Difficulty,
    ...(question.topic
      ? { topic: question.topic.name, topicSlug: question.topic.slug }
      : {}),
    ...(question.concept ? { concept: question.concept } : {}),
    tags,
    ...(question.estimatedTime ? { estimatedTime: question.estimatedTime } : {}),
    ...(question.version ? { version: question.version } : {}),
  }
}

export function toApiTopic(
  topic: Topic,
  counts: { testCount: number; questionCount: number },
  category?: Category,
): ApiTopic {
  return {
    slug: topic.slug,
    name: topic.name,
    ...(category ? { category: toApiCategory(category) } : {}),
    testCount: counts.testCount,
    questionCount: counts.questionCount,
  }
}
