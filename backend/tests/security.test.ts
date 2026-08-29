import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { ApiError } from '../src/utils/httpErrors.js'
import type { ApiTest } from '../src/types/contracts.js'

// Mock the tests service so this suite needs no database. A known slug returns
// a valid payload; anything else is treated as an invalid content id (404).
vi.mock('../src/modules/tests/tests.service.js', () => {
  const testPayload: ApiTest = {
    id: 't1',
    slug: 'demo',
    title: 'Demo',
    shortDescription: 'd',
    fullDescription: 'd',
    category: { id: 'c1', slug: 'algorithms', name: 'Algorithms' },
    tags: [],
    topics: ['Numbers'],
    difficulty: 'beginner',
    estimatedMinutes: 5,
    totalQuestions: 1,
    language: 'en',
    passingScorePercentage: 60,
    featured: false,
    status: 'published',
    version: '1.0.0',
    indexable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return {
    testsService: {
      list: vi.fn(),
      getBySlug: vi.fn((params: { slug: string }) => {
        if (params?.slug === 'demo') return Promise.resolve(testPayload)
        throw ApiError.notFound('Test', 'TEST_NOT_FOUND')
      }),
      getQuestionsForTest: vi.fn(),
      verifyAnswers: vi.fn(),
      getFeatured: vi.fn(),
      getRelated: vi.fn(),
    },
  }
})

// Production-style config. The global rate limit is kept high here so the other
// assertions aren't starved by it; the 429 behaviour is exercised in its own
// isolated suite (tests/rate-limit.test.ts) with a tiny limit.
vi.stubEnv('NODE_ENV', 'production')
vi.stubEnv('CORS_ORIGINS', 'http://localhost:5173')
vi.stubEnv('RATE_LIMIT_MAX', '50')
vi.stubEnv('RATE_LIMIT_WINDOW_MS', '60000')

const { buildApp } = await import('../src/app.js')

describe('Prompt 8 — security', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  beforeAll(async () => {
    app = await buildApp()
  })
  afterAll(async () => {
    await app.close()
  })

  it('sets security headers on public responses', async () => {
    const res = await app.inject({ method: 'GET', url: '/health', headers: { origin: 'http://localhost:5173' } })
    expect(res.statusCode).toBe(200)
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['x-frame-options']).toBe('DENY')
    expect(res.headers['cross-origin-resource-policy']).toBe('same-origin')
  })

  it('never reflects a wildcard CORS origin', async () => {
    const evil = await app.inject({ method: 'GET', url: '/health', headers: { origin: 'http://evil.example' } })
    expect(evil.headers['access-control-allow-origin']).not.toBe('http://evil.example')
    expect(evil.headers['access-control-allow-origin']).toBeUndefined()

    const good = await app.inject({ method: 'GET', url: '/health', headers: { origin: 'http://localhost:5173' } })
    expect(good.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })

  it('rejects malformed query parameters with 422 (input validation)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/tests?limit=not-a-number' })
    expect(res.statusCode).toBe(422)
    expect(res.json().error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects over-long search input with 422', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/search?q=${'a'.repeat(101)}` })
    expect(res.statusCode).toBe(422)
  })

  it('returns 404 for unknown routes (no internal detail leak)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/does-not-exist' })
    expect(res.statusCode).toBe(404)
    expect(res.json().success).toBe(false)
    expect(res.json().error.code).toBe('NOT_FOUND')
  })

  it('maps invalid content ids to a clean 404 (no SQL/stack in production)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/tests/nope-not-real' })
    expect(res.statusCode).toBe(404)
    expect(res.json().error.code).toBe('TEST_NOT_FOUND')
    expect(JSON.stringify(res.body)).not.toMatch(/stack|sql|prisma|password/i)
  })

  it('rejects oversized request bodies (413)', async () => {
    const big = 'x'.repeat(2_000_000)
    const res = await app.inject({
      method: 'POST',
      url: '/api/tests/demo/answers',
      headers: { 'content-type': 'application/json' },
      payload: big,
    })
    expect(res.statusCode).toBe(413)
  })
})
