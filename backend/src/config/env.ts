import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_BASE_URL: z.string().url().default('http://localhost:3001'),
  // Whether Fastify should trust X-Forwarded-* headers. Enable ONLY when the app
  // sits behind a known reverse proxy / load balancer. Required for correct
  // per-client IP rate limiting; left off by default so client IPs cannot be
  // spoofed and so all traffic isn't bucketed under one proxy IP.
  TRUST_PROXY: z.enum(['false', 'true']).default('false').transform((v) => v === 'true'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://localhost:4173')
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CONTENT_VERSION: z.string().default('1.0.0'),
  EXPOSE_ERROR_DETAILS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  // Rate limiting (per client IP). Search and submission are tighter because
  // they are the most expensive / most abusable public endpoints.
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_SEARCH_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_SUBMIT_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_QUESTIONS_MAX: z.coerce.number().int().positive().default(120),
})

export type AppEnv = z.infer<typeof envSchema>

function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid environment configuration:\n${issues}`)
  }
  return parsed.data
}

export const env: AppEnv = loadEnv()

export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
