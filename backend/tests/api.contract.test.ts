import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { buildApp } from '../src/app.js'
import type { FastifyInstance } from 'fastify'
import { ApiError } from '../src/utils/httpErrors.js'

import { testsService } from '../src/modules/tests/tests.service.js'
import { questionsService } from '../src/modules/questions/questions.service.js'
import { categoriesService } from '../src/modules/categories/categories.service.js'
import { topicsService } from '../src/modules/topics/topics.service.js'
import { searchService } from '../src/modules/search/search.service.js'
import { contentService } from '../src/modules/content/content.service.js'

// Mock the service layer so the API contract (routing, validation, envelope,
// serialization) is exercised without a database.
vi.mock('../src/modules/tests/tests.service.js', () => ({
  testsService: {
    list: vi.fn(),
    getBySlug: vi.fn(),
    getFeatured: vi.fn(),
    getRelated: vi.fn(),
    getQuestionsForTest: vi.fn(),
    verifyAnswers: vi.fn(),
  },
}))
vi.mock('../src/modules/questions/questions.service.js', () => ({
  questionsService: { getByTestId: vi.fn(), getByTopicSlug: vi.fn() },
}))
vi.mock('../src/modules/categories/categories.service.js', () => ({
  categoriesService: { list: vi.fn(), getBySlug: vi.fn(), getTests: vi.fn() },
}))
vi.mock('../src/modules/topics/topics.service.js', () => ({
  topicsService: { list: vi.fn(), getBySlug: vi.fn() },
}))
vi.mock('../src/modules/search/search.service.js', () => ({
  searchService: { search: vi.fn() },
}))
vi.mock('../src/modules/content/content.service.js', () => ({
  contentService: { getGovernance: vi.fn() },
}))

const now = new Date().toISOString()

const category = { id: 'c1', slug: 'general-knowledge', name: 'General Knowledge' }
const test = {
  id: 't1',
  slug: 'demo-quick-think',
  title: 'Demo: Quick Think',
  shortDescription: 'A short demo test',
  fullDescription: 'A short demo test with questions',
  category,
  tags: [],
  topics: ['Numbers'],
  difficulty: 'beginner' as const,
  estimatedMinutes: 5,
  totalQuestions: 3,
  language: 'en',
  passingScorePercentage: 70,
  featured: true,
  status: 'published' as const,
  version: '1.0.0',
  indexable: true,
  createdAt: now,
  updatedAt: now,
}
const question = {
  id: 'q1',
  testId: 't1',
  text: 'What is 7 + 6?',
  type: 'single-choice' as const,
  options: [{ id: 'o1', text: '13' }],
  explanation: '13',
  points: 1,
  difficulty: 'beginner' as const,
  tags: [],
}
const apiTopic = { slug: 'numbers', name: 'Numbers', testCount: 1, questionCount: 3 }
const searchResult = { tests: [test], categories: [category], topics: [apiTopic], total: 3 }
const governance = {
  contentVersion: '1.0.0',
  publishedTests: 1,
  totalTests: 1,
  totalQuestions: 3,
  generatedAt: now,
}
const answerVerification = {
  testId: 't1',
  slug: 'demo-quick-think',
  results: [
    {
      questionId: 'q1',
      correct: true,
      correctOptionIds: ['o1'],
      points: 1,
      earnedPoints: 1,
    },
  ],
  score: { total: 1, earned: 1, percentage: 100 },
  answeredCount: 1,
  unanswered: 0,
  topicPerformance: { Algorithms: { total: 1, correct: 1, accuracy: 100 } },
  difficultyPerformance: { beginner: { total: 1, correct: 1, accuracy: 100 } },
}

describe('API contracts', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })
  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.mocked(testsService.list).mockResolvedValue({ items: [test], total: 1, limit: 50, offset: 0 })
    vi.mocked(testsService.getBySlug).mockResolvedValue(test)
    vi.mocked(testsService.getFeatured).mockResolvedValue([test])
    vi.mocked(testsService.getRelated).mockResolvedValue([test])
    vi.mocked(testsService.getQuestionsForTest).mockResolvedValue({ test, questions: [question] })
    vi.mocked(testsService.verifyAnswers).mockResolvedValue(answerVerification)
    vi.mocked(questionsService.getByTestId).mockResolvedValue([question])
    vi.mocked(questionsService.getByTopicSlug).mockResolvedValue([question])
    vi.mocked(categoriesService.list).mockResolvedValue([category])
    vi.mocked(categoriesService.getBySlug).mockResolvedValue(category)
    vi.mocked(categoriesService.getTests).mockResolvedValue({
      category,
      tests: { items: [test], total: 1, limit: 50, offset: 0 },
    })
    vi.mocked(topicsService.list).mockResolvedValue([apiTopic])
    vi.mocked(topicsService.getBySlug).mockResolvedValue({ topic: apiTopic, tests: [test], questions: [question] })
    vi.mocked(searchService.search).mockResolvedValue(searchResult)
    vi.mocked(contentService.getGovernance).mockResolvedValue(governance)
  })

  describe('valid requests', () => {
    it('GET /api/tests returns a paginated envelope', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/tests' })
      expect(res.statusCode).toBe(200)
      expect(res.json().success).toBe(true)
      expect(Array.isArray(res.json().data)).toBe(true)
      expect(res.json().meta.total).toBe(1)
    })

    it('GET /api/tests honors filters and safe pagination', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/tests?limit=10&offset=0&difficulty=beginner&category=general-knowledge&sort=title',
      })
      expect(res.statusCode).toBe(200)
    })

    it('GET /api/tests/featured', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/tests/featured' })
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.json().data)).toBe(true)
    })

    it('GET /api/tests/:slug', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/tests/demo-quick-think' })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.slug).toBe('demo-quick-think')
    })

    it('GET /api/tests/:slug/questions (answers never exposed)', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/tests/demo-quick-think/questions' })
      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.data.test.slug).toBe('demo-quick-think')
      expect(Array.isArray(body.data.questions)).toBe(true)
      for (const q of body.data.questions) {
        for (const opt of q.options) {
          expect(opt).not.toHaveProperty('isCorrect')
          expect(opt).not.toHaveProperty('correctOptionId')
        }
      }
    })

    it('GET /api/tests/:slug/questions?type filters by question type', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/tests/demo-quick-think/questions?type=single-choice',
      })
      expect(res.statusCode).toBe(200)
    })

    it('GET /api/categories', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/categories' })
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.json().data)).toBe(true)
    })

    it('GET /api/categories/:slug', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/categories/general-knowledge' })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.slug).toBe('general-knowledge')
    })

    it('GET /api/categories/:slug/tests', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/categories/general-knowledge/tests' })
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.json().data.tests)).toBe(true)
      expect(res.json().meta.total).toBe(1)
    })

    it('GET /api/topics/:slug', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/topics/numbers' })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.topic.slug).toBe('numbers')
      expect(Array.isArray(res.json().data.questions)).toBe(true)
    })

    it('GET /api/search?q=...', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/search?q=python' })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.total).toBe(3)
    })

    it('GET /api/content/governance', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/content/governance' })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.publishedTests).toBe(1)
    })

    it('POST /api/tests/:slug/answers verifies submissions', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/tests/demo-quick-think/answers',
        payload: { answers: [{ questionId: 'q1', optionIds: ['o1'] }] },
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.score.percentage).toBe(100)
    })
  })

  describe('invalid requests (rejected safely with 422)', () => {
    it('rejects limit above the maximum', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/tests?limit=500' })
      expect(res.statusCode).toBe(422)
      expect(res.json().error.code).toBe('VALIDATION_ERROR')
    })

    it('rejects limit below 1', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/tests?limit=0' })
      expect(res.statusCode).toBe(422)
    })

    it('rejects negative offset', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/tests?offset=-1' })
      expect(res.statusCode).toBe(422)
    })

    it('rejects an unknown difficulty', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/tests?difficulty=expert' })
      expect(res.statusCode).toBe(422)
    })

    it('rejects a malformed category slug', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/tests?category=Invalid Slug' })
      expect(res.statusCode).toBe(422)
    })

    it('rejects an unknown question type filter', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/tests/demo-quick-think/questions?type=invalid',
      })
      expect(res.statusCode).toBe(422)
    })

    it('rejects a malformed category path slug', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/categories/Invalid Slug' })
      expect(res.statusCode).toBe(422)
    })

    it('rejects a malformed topic path slug', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/topics/Invalid Slug' })
      expect(res.statusCode).toBe(422)
    })

    it('requires a search term', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/search' })
      expect(res.statusCode).toBe(422)
    })

    it('rejects an empty search term', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/search?q=' })
      expect(res.statusCode).toBe(422)
    })

    it('rejects a missing answer body', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/tests/demo-quick-think/answers',
        payload: {},
      })
      expect(res.statusCode).toBe(422)
    })

    it('rejects an empty answers array', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/tests/demo-quick-think/answers',
        payload: { answers: [] },
      })
      expect(res.statusCode).toBe(422)
    })

    it('rejects a non-array answers body', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/tests/demo-quick-think/answers',
        payload: { answers: 'oops' },
      })
      expect(res.statusCode).toBe(422)
    })
  })

  describe('not found (404)', () => {
    it('returns 404 for a missing test', async () => {
      vi.mocked(testsService.getBySlug).mockRejectedValue(ApiError.notFound('Test'))
      const res = await app.inject({ method: 'GET', url: '/api/tests/missing' })
      expect(res.statusCode).toBe(404)
      expect(res.json().error.code).toBe('NOT_FOUND')
    })

    it('returns 404 for a missing category', async () => {
      vi.mocked(categoriesService.getBySlug).mockRejectedValue(ApiError.notFound('Category'))
      const res = await app.inject({ method: 'GET', url: '/api/categories/missing' })
      expect(res.statusCode).toBe(404)
    })

    it('returns 404 for a missing topic', async () => {
      vi.mocked(topicsService.getBySlug).mockRejectedValue(ApiError.notFound('Topic'))
      const res = await app.inject({ method: 'GET', url: '/api/topics/missing' })
      expect(res.statusCode).toBe(404)
    })
  })
})
