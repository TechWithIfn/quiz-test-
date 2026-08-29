import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { buildApp } from '../src/app.js'
import type { FastifyInstance } from 'fastify'
import type { ApiTest, ApiCategory } from '../src/types/domain.js'

import { searchService } from '../src/modules/search/search.service.js'
import { testsService } from '../src/modules/tests/tests.service.js'

vi.mock('../src/modules/search/search.service.js', () => ({
  searchService: { search: vi.fn() },
}))
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

const cat = (name: string): ApiCategory => ({
  id: name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  name,
})

function makeTest(title: string, slug: string): ApiTest {
  return {
    id: slug,
    slug,
    title,
    shortDescription: '',
    fullDescription: '',
    category: cat('General'),
    tags: [],
    topics: [],
    difficulty: 'beginner',
    estimatedMinutes: 10,
    totalQuestions: 1,
    language: 'en',
    passingScorePercentage: 70,
    featured: false,
    status: 'published',
    version: '1.0.0',
    indexable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

describe('search & discovery API (PROMPT 5)', () => {
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

  it('returns ranked results with pagination meta for a normal query', async () => {
    vi.mocked(searchService.search).mockResolvedValue({
      tests: [makeTest('SQL Test', 'sql-test'), makeTest('SQL JOIN Test', 'sql-join-test')],
      categories: [],
      topics: [],
      total: 2,
    })
    const res = await app.inject({ method: 'GET', url: '/api/search?q=sql' })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.tests).toHaveLength(2)
    expect(res.json().meta.total).toBe(2)
    expect(res.json().meta.hasMore).toBe(false)
  })

  it('rejects an empty search term with 422', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/search?q=' })
    expect(res.statusCode).toBe(422)
    expect(res.json().error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects a very long query with 422 (bounded length)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/search?q=${'a'.repeat(500)}` })
    expect(res.statusCode).toBe(422)
  })

  it('handles special characters without erroring', async () => {
    vi.mocked(searchService.search).mockResolvedValue({ tests: [], categories: [], topics: [], total: 0 })
    const res = await app.inject({ method: 'GET', url: '/api/search?q=%25script_%3Cx%3E' })
    expect(res.statusCode).toBe(200)
    // The service receives the raw (decoded) term; internal sanitization prevents
    // the wildcards from altering the query shape.
    expect(vi.mocked(searchService.search).mock.calls[0][0].q).toBe('%script_<x>')
  })

  it('returns a clean empty result set (no results)', async () => {
    vi.mocked(searchService.search).mockResolvedValue({ tests: [], categories: [], topics: [], total: 0 })
    const res = await app.inject({ method: 'GET', url: '/api/search?q=zzzznomatch' })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.tests).toHaveLength(0)
    expect(res.json().meta.total).toBe(0)
  })

  it('GET /api/tests/:slug/related returns only real published related tests', async () => {
    vi.mocked(testsService.getRelated).mockResolvedValue([
      makeTest('SQL JOIN Test', 'sql-join-test'),
      makeTest('SQL GROUP BY Test', 'sql-group-by-test'),
    ])
    const res = await app.inject({ method: 'GET', url: '/api/tests/sql-test/related' })
    expect(res.statusCode).toBe(200)
    expect(res.json().data).toHaveLength(2)
    expect(res.json().data[0].slug).toBe('sql-join-test')
  })
})
