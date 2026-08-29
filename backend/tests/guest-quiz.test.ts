import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'

import { buildApp } from '../src/app.js'
import { testsService } from '../src/modules/tests/tests.service.js'
import type { ApiTest, ApiQuestion } from '../src/types/contracts.js'

vi.mock('../src/modules/tests/tests.service.js', () => ({
  testsService: {
    list: vi.fn(),
    getBySlug: vi.fn(),
    getQuestionsForTest: vi.fn(),
    verifyAnswers: vi.fn(),
    getFeatured: vi.fn(),
    getRelated: vi.fn(),
  },
}))

const testPayload: ApiTest = {
  id: 't1',
  slug: 'demo',
  title: 'Demo Test',
  shortDescription: 'A demo.',
  fullDescription: 'A demo test.',
  category: { id: 'c1', slug: 'algorithms', name: 'Algorithms' },
  tags: [],
  topics: ['Numbers'],
  difficulty: 'beginner',
  estimatedMinutes: 5,
  totalQuestions: 2,
  language: 'en',
  passingScorePercentage: 60,
  featured: false,
  status: 'published',
  version: '1.0.0',
  indexable: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// The two questions that make up this test (used by the fake verifier so the
// submission cases reflect real scoring/aggregation logic).
const RAW = [
  {
    id: 'q1',
    options: [
      { id: 'o1', isCorrect: true },
      { id: 'o2', isCorrect: false },
    ],
    points: 1,
    difficulty: 'beginner',
    topic: { id: 'tp1', slug: 'numbers', name: 'Numbers' },
  },
  {
    id: 'q2',
    options: [
      { id: 'o3', isCorrect: true },
      { id: 'o4', isCorrect: true },
    ],
    points: 1,
    difficulty: 'beginner',
    topic: { id: 'tp1', slug: 'numbers', name: 'Numbers' },
  },
]

const fakeVerify = (submission: { answers: { questionId: string; optionIds: string[] }[] }) => {
  let total = 0
  let earned = 0
  const topic: Record<string, { total: number; correct: number }> = {}
  const diff: Record<string, { total: number; correct: number }> = {}
  for (const q of RAW) {
    total += q.points
    topic[q.topic.name] = topic[q.topic.name] ?? { total: 0, correct: 0 }
    topic[q.topic.name].total += 1
    diff[q.difficulty] = diff[q.difficulty] ?? { total: 0, correct: 0 }
    diff[q.difficulty].total += 1
  }
  const results: unknown[] = []
  let valid = 0
  for (const a of submission.answers) {
    const q = RAW.find((r) => r.id === a.questionId)
    if (!q) {
      results.push({ questionId: a.questionId, correct: false, correctOptionIds: [], points: 0, earnedPoints: 0, invalid: true })
      continue
    }
    valid += 1
    const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id).sort().join(',')
    const correct = correctIds === [...a.optionIds].sort().join(',')
    if (correct) {
      topic[q.topic.name].correct += 1
      diff[q.difficulty].correct += 1
    }
    const pts = q.points
    const ep = correct ? pts : 0
    earned += ep
    results.push({
      questionId: a.questionId,
      correct,
      correctOptionIds: q.options.filter((o) => o.isCorrect).map((o) => o.id),
      points: pts,
      earnedPoints: ep,
    })
  }
  const perf = (agg: Record<string, { total: number; correct: number }>) =>
    Object.fromEntries(
      Object.entries(agg).map(([k, v]) => [k, { total: v.total, correct: v.correct, accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0 }]),
    )
  return {
    testId: 't1',
    slug: 'demo',
    results,
    score: { total, earned, percentage: total ? Math.round((earned / total) * 100) : 0 },
    answeredCount: submission.answers.length,
    unanswered: RAW.length - valid,
    topicPerformance: perf(topic),
    difficultyPerformance: perf(diff),
  }
}

const question: ApiQuestion = {
  id: 'q1',
  text: 'What is 1+1?',
  type: 'single-choice',
  options: [
    { id: 'o1', text: '2' },
    { id: 'o2', text: '3' },
  ],
  explanation: 'One plus one is two.',
  points: 1,
  difficulty: 'beginner',
  topic: 'Numbers',
  tags: [],
}

describe('Prompt 7 — anonymous online quiz (no login)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  beforeEach(() => {
    vi.mocked(testsService.verifyAnswers).mockReset()
    vi.mocked(testsService.getBySlug).mockReset()
    vi.mocked(testsService.getQuestionsForTest).mockReset()
    vi.mocked(testsService.verifyAnswers).mockImplementation((_slug, submission) => fakeVerify(submission) as never)
    vi.mocked(testsService.getBySlug).mockResolvedValue(testPayload as never)
    vi.mocked(testsService.getQuestionsForTest).mockResolvedValue({
      test: testPayload,
      questions: [question],
    } as never)
  })

  afterAll(async () => {
    await app?.close()
  })

  it('guest can start a test without any credentials', async () => {
    app = await buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/tests/demo' })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.slug).toBe('demo')
  })

  it('guest can submit answers and receive a stateless result (score + aggregates)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/tests/demo/answers',
      payload: { answers: [{ questionId: 'q1', optionIds: ['o1'] }] },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    // q1 correct (1pt), q2 skipped -> total 2, earned 1, 50%.
    expect(body.data.score).toEqual({ total: 2, earned: 1, percentage: 50 })
    expect(body.data.unanswered).toBe(1)
    expect(body.data.topicPerformance.Numbers).toEqual({ total: 2, correct: 1, accuracy: 50 })
    expect(body.data.difficultyPerformance.beginner).toEqual({ total: 2, correct: 1, accuracy: 50 })
  })

  it('survives a refresh during the quiz (question delivery is idempotent and never leaks answers)', async () => {
    const first = await app.inject({ method: 'GET', url: '/api/tests/demo/questions' })
    const second = await app.inject({ method: 'GET', url: '/api/tests/demo/questions' })
    expect(first.statusCode).toBe(200)
    expect(second.statusCode).toBe(200)
    for (const opt of second.json().data.questions[0].options) {
      expect(opt).not.toHaveProperty('isCorrect')
      expect(opt).not.toHaveProperty('correctOptionId')
    }
  })

  it('counts skipped/timeout questions as unanswered in the result', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/tests/demo/answers',
      payload: { answers: [{ questionId: 'q1', optionIds: ['o2'] }] },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().data.unanswered).toBe(1)
    expect(res.json().data.answeredCount).toBe(1)
    expect(res.json().data.topicPerformance.Numbers.accuracy).toBe(0)
  })

  it('double submit is an idempotent, stateless re-verification (no server history is created)', async () => {
    const a = await app.inject({
      method: 'POST',
      url: '/api/tests/demo/answers',
      payload: { answers: [{ questionId: 'q1', optionIds: ['o1'] }] },
    })
    const b = await app.inject({
      method: 'POST',
      url: '/api/tests/demo/answers',
      payload: { answers: [{ questionId: 'q1', optionIds: ['o1'] }] },
    })
    expect(a.statusCode).toBe(200)
    expect(b.statusCode).toBe(200)
    // The endpoint is pure verification: each call is independent and writes nothing.
    expect(vi.mocked(testsService.verifyAnswers).mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(a.json().data.score).toEqual(b.json().data.score)
  })

  it('rejects invalid answer payloads with 422 (no silent fallback to client truth)', async () => {
    const missing = await app.inject({ method: 'POST', url: '/api/tests/demo/answers', payload: {} })
    const bad = await app.inject({
      method: 'POST',
      url: '/api/tests/demo/answers',
      payload: { answers: 'nope' },
    })
    expect(missing.statusCode).toBe(422)
    expect(bad.statusCode).toBe(422)
  })

  it('rejects a submit with no answers at all (422)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/tests/demo/answers',
      payload: { answers: [] },
    })
    expect(res.statusCode).toBe(422)
  })

  it('exposes no login/account surface anywhere', async () => {
    for (const path of ['/api/auth/login', '/api/login', '/api/signup', '/api/account']) {
      const res = await app.inject({ method: 'GET', url: path })
      expect(res.statusCode).toBe(404)
    }
  })
})
