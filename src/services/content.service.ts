import { RawTest, RawQuestion } from '@/types/content'
import { Test, Question, QuestionOption, TestCategory } from '@/types'
import { ALL_RAW_TESTS } from '@/data/tests'
import { APP_ENV } from '@/config/env'
import { ContentValidatorService } from './content-validator.service'

/**
 * ContentService acts as the abstraction layer between raw version-controlled files
 * and runtime UI components.
 */
export class ContentService {
  private rawTests: RawTest[]
  private normalizedTests: Test[] = []
  private questionsByTestId: Map<string, Question[]> = new Map()
  private testsBySlug: Map<string, Test> = new Map()
  private testsById: Map<string, Test> = new Map()
  private categoriesMap: Map<string, TestCategory> = new Map()

  constructor(tests: RawTest[] = ALL_RAW_TESTS) {
    this.rawTests = tests
    this.buildIndex()
  }

  private buildIndex(): void {
    // Validate on initialization in dev/test
    if (!APP_ENV.isProduction) {
      const validation = ContentValidatorService.validateAll(this.rawTests)
      if (!validation.valid) {
        console.error('[ContentService] Static content validation failed with errors:', validation.errors)
      }
    }

    this.normalizedTests = []
    this.questionsByTestId.clear()
    this.testsBySlug.clear()
    this.testsById.clear()
    this.categoriesMap.clear()

    for (const raw of this.rawTests) {
      const normalizedTest: Test = {
        id: raw.id,
        slug: raw.slug,
        title: raw.title,
        shortDescription: raw.shortDescription,
        fullDescription: raw.fullDescription || raw.shortDescription,
        category: raw.category,
        tags: raw.tags,
        skills: raw.skills,
        aliases: raw.aliases,
        topics: Array.from(new Set(raw.questions.map((question) => question.topic).filter(Boolean))),
        difficulty: raw.difficulty,
        timeLimitMinutes: raw.estimatedMinutes,
        estimatedMinutes: raw.estimatedMinutes,
        totalQuestions: raw.questions.length,
        questionCount: raw.questions.length,
        language: raw.language,
        passingScorePercentage: raw.passingScorePercentage || 70,
        featured: raw.featured ?? false,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      }

      this.normalizedTests.push(normalizedTest)
      this.testsBySlug.set(raw.slug, normalizedTest)
      this.testsById.set(raw.id, normalizedTest)

      if (raw.category && !this.categoriesMap.has(raw.category.slug)) {
        this.categoriesMap.set(raw.category.slug, raw.category)
      }

      const normalizedQuestions: Question[] = raw.questions.map((rq: RawQuestion) => {
        const options: QuestionOption[] = rq.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          codeSnippet: opt.codeSnippet,
        }))

        return {
          id: rq.id,
          testId: raw.id,
          text: rq.question,
          question: rq.question,
          type: rq.type,
          codeSnippet: rq.codeSnippet,
          codeLanguage: rq.codeLanguage || (raw.language === 'mixed' ? undefined : raw.language),
          options,
          correctOptionId: rq.correctAnswer,
          correctAnswer: rq.correctAnswer,
          explanation: rq.explanation,
          hint: rq.hint,
          points: rq.points || 1,
          difficulty: rq.difficulty,
          topic: rq.topic.trim() || 'Uncategorized',
          concept: rq.concept,
          tags: rq.tags || [],
          estimatedTime: rq.estimatedTime,
          category: raw.category.name,
        }
      })

      this.questionsByTestId.set(raw.id, normalizedQuestions)
    }
  }

  getRawTests(): RawTest[] {
    return [...this.rawTests]
  }

  getAllTests(): Test[] {
    return [...this.normalizedTests]
  }

  getFeaturedTests(): Test[] {
    return this.normalizedTests.filter((t) => t.featured)
  }

  getTestBySlug(slug: string): Test | null {
    return this.testsBySlug.get(slug) || null
  }

  getTestById(id: string): Test | null {
    return this.testsById.get(id) || null
  }

  getQuestionsForTest(testId: string): Question[] {
    return this.questionsByTestId.get(testId) || []
  }

  getCategories(): TestCategory[] {
    return Array.from(this.categoriesMap.values())
  }

  getRelatedTests(currentSlug: string, limit: number = 3): Test[] {
    const current = this.getTestBySlug(currentSlug)
    if (!current) return this.normalizedTests.slice(0, limit)

    return this.normalizedTests
      .filter((t) => t.slug !== currentSlug)
      .sort((a, b) => {
        const aCatMatch = a.category.id === current.category.id ? 1 : 0
        const bCatMatch = b.category.id === current.category.id ? 1 : 0
        return bCatMatch - aCatMatch
      })
      .slice(0, limit)
  }
}

export const contentService = new ContentService()
