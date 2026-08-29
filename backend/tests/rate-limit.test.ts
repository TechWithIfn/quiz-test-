import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

// Isolated rate-limit suite. A tiny global ceiling lets us actually trip 429
// without interfering with the other security assertions (the global limiter is
// per client IP across all routes).
vi.stubEnv('NODE_ENV', 'production')
vi.stubEnv('CORS_ORIGINS', 'http://localhost:5173')
vi.stubEnv('RATE_LIMIT_MAX', '3')
vi.stubEnv('RATE_LIMIT_WINDOW_MS', '60000')

const { buildApp } = await import('../src/app.js')

describe('Prompt 8 — rate limiting', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  beforeAll(async () => {
    app = await buildApp()
  })
  afterAll(async () => {
    await app.close()
  })

  it('returns 429 with a RATE_LIMITED envelope and retry-after after the ceiling', async () => {
    const codes: number[] = []
    for (let i = 0; i < 6; i++) {
      const res = await app.inject({ method: 'GET', url: '/health' })
      codes.push(res.statusCode)
    }
    // First 3 allowed, the rest throttled.
    expect(codes.filter((c) => c === 200).length).toBe(3)
    expect(codes.filter((c) => c === 429).length).toBeGreaterThan(0)

    const limited = await app.inject({ method: 'GET', url: '/health' })
    expect(limited.statusCode).toBe(429)
    expect(limited.json().success).toBe(false)
    expect(limited.json().error.code).toBe('RATE_LIMITED')
    expect(limited.headers).toHaveProperty('retry-after')
  })
})
