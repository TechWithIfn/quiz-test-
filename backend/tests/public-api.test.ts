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

// Mock the service layer so the public read API is exercised without a database.
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
  questionsService: { getByTopicSlug: vi.fn() },
}))
vi.mock('../src/modules/categories/categories.service.js', () => ({
  categoriesService: { list: vi.fn(), getBySlug: vi.fn(), getTests: vi.fn() },
}))
vi.mock('../src/modules/topics/topics.service.js', () => ({
  topicsService: { listAll: vi.fn(), getBySlug: vi.fn() },
}))
vi.mock('../src/modules/search/search.service.js', () => ({
  searchService: { search: vi.fn() },
}))
vi.mock('../src/modules/content/content.service.js', () => ({
  contentService: { getGovernance: vi.fn() },
}))

const test = {
  id: 't1',
  slug: 'demo-quick-think',
  title: 'Demo Quick Think',
  shortDescription: 'A short demo.',
  fullDescription: 'A longer demo description.',
  category: { id: 'c1', slug: 'algorithms', name: 'Algorithms' },
  tags: [{ id: 'tg1', slug: 'demo', name: 'Demo' }],
  topics: ['Algorithms', 'Data Structures'],
  difficulty: 'beginner',
  estimatedMinutes: 10,
  totalQuestions: 2,
  language: 'en',
  passingScorePercentage: 70,
  featured: false,
  status: 'published',
  version: '1.0.0',
  indexable: true,
  seoTitle: 'Demo',
  seoDescription: 'Demo',
  canonicalPath: '/tests/demo-quick-think',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const question = {
  id: 'q1',
  testId: 't1',
  text: '2 + 2?',
  type: 'single-choice' as const,
  options: [{ id: 'o1', text: '4' }, { id: 'o2', text: '3' }],
  explanation: '4',
  points: 1,
  difficulty: 'beginner',
  topic: 'Numbers',
  topicSlug: 'numbers',
  tags: [],
}

describe('public test & question API (PROMPT 4)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })
  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'test'
  })

  it('GET /api/tests returns a valid test list (published content)', async () => {
    vi.mocked(testsService.list).mockResolvedValue({
      items: [test],
      total: 1,
      limit: 50,
      offset: 0,
    })
    const res = await app.inject({ method: 'GET', url: '/api/tests' })
    expect(res.statusCode).toBe(200)
    expect(res.json().success).toBe(true)
    expect(res.json().data).toHaveLength(1)
    expect(res.json().meta.total).toBe(1)
  })

  it('GET /api/tests/:slug returns a single test detail with topics', async () => {
    vi.mocked(testsService.getBySlug).mockResolvedValue(test)
    const res = await app.inject({ method: 'GET', url: '/api/tests/demo-quick-think' })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.topics).toEqual(['Algorithms', 'Data Structures'])
    expect(res.json().data).not.toHaveProperty('internal')
  })

  it('GET /api/tests/:slug/questions returns questions WITHOUT correct answers', async () => {
    vi.mocked(testsService.getQuestionsForTest).mockResolvedValue({ test, questions: [question] })
    const res = await app.inject({ method: 'GET', url: '/api/tests/demo-quick-think/questions' })
    expect(res.statusCode).toBe(200)
    const opts = res.json().data.questions[0].options
    expect(opts).toEqual([{ id: 'o1', text: '4' }, { id: 'o2', text: '3' }])
    for (const opt of opts) expect(opt).not.toHaveProperty('isCorrect')
  })

  it('GET /api/tests/:slug returns 404 TEST_NOT_FOUND for an unknown/unpublished test', async () => {
    vi.mocked(testsService.getBySlug).mockRejectedValue(ApiError.notFound('Test', 'TEST_NOT_FOUND'))
    const res = await app.inject({ method: 'GET', url: '/api/tests/does-not-exist' })
    expect(res.statusCode).toBe(404)
    expect(res.json().error.code).toBe('TEST_NOT_FOUND')
  })

  it('GET /api/categories/:slug returns 404 CATEGORY_NOT_FOUND for a missing category', async () => {
    vi.mocked(categoriesService.getBySlug).mockRejectedValue(
      ApiError.notFound('Category', 'CATEGORY_NOT_FOUND'),
    )
    const res = await app.inject({ method: 'GET', url: '/api/categories/missing' })
    expect(res.statusCode).toBe(404)
    expect(res.json().error.code).toBe('CATEGORY_NOT_FOUND')
  })

  it('GET /api/topics/:slug returns 404 TOPIC_NOT_FOUND for a missing topic', async () => {
    vi.mocked(topicsService.getBySlug).mockRejectedValue(ApiError.notFound('Topic', 'TOPIC_NOT_FOUND'))
    const res = await app.inject({ method: 'GET', url: '/api/topics/missing' })
    expect(res.statusCode).toBe(404)
    expect(res.json().error.code).toBe('TOPIC_NOT_FOUND')
  })

  it('GET /api/categories/:slug/tests returns an empty list (200) for a category with no tests', async () => {
    vi.mocked(categoriesService.getTests).mockResolvedValue({
      category: { id: 'c1', slug: 'empty', name: 'Empty' },
      tests: { items: [], total: 0, limit: 50, offset: 0 },
    })
    const res = await app.inject({ method: 'GET', url: '/api/categories/empty/tests' })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.tests).toHaveLength(0)
    expect(res.json().meta.total).toBe(0)
  })

  it('GET /api/tests rejects large pagination with 422', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/tests?limit=1000' })
    expect(res.statusCode).toBe(422)
    expect(res.json().error.code).toBe('VALIDATION_ERROR')
  })

  it('GET /api/tests rejects an invalid category slug with 422', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/tests?category=Bad_Slug' })
    expect(res.statusCode).toBe(422)
  })
})
