import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { env, isProduction } from './config/env.js'
import { registerErrorHandler } from './middleware/errorHandler.js'
import { registerRoutes } from './routes/index.js'

// Build (but do not start) the Fastify application.
// Exporting the builder keeps the app testable and decoupled from listen().
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
    bodyLimit: 1_048_576,
    trustProxy: env.TRUST_PROXY,
  })

  // --- Security headers (framework-recommended middleware) -----------------
  // For a pure JSON API we disable the CSP default (no HTML is served) but keep
  // every other protective header. HSTS is only emitted in production where TLS
  // is expected; it would break local http development otherwise.
  await app.register(helmet, {
    contentSecurityPolicy: false,
    hsts: isProduction ? { maxAge: 31_536_000, includeSubDomains: true } : false,
    frameguard: { action: 'deny' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
  })

  // --- CORS: explicit origins only ----------------------------------------
  // Never reflect a wildcard in production. The default is localhost dev
  // origins; production deployments MUST set CORS_ORIGINS to their real frontend
  // host(s). A wildcard is rejected so it cannot be enabled by accident.
  const allowedOrigins = env.CORS_ORIGINS
  if (isProduction && allowedOrigins.includes('*')) {
    throw new Error('CORS_ORIGINS must not be "*" in production. Set explicit frontend origins.')
  }
  await app.register(cors, {
    origin: allowedOrigins,
    methods: ['GET', 'OPTIONS', 'POST'],
    maxAge: 86_400,
    credentials: false,
  })

  // --- Rate limiting (per client IP) --------------------------------------
  // A generous global ceiling protects the whole API without disturbing normal
  // users; specific endpoints are tightened via per-route `config.rateLimit`.
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    errorResponseBuilder: () => ({
      statusCode: 429,
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests, please slow down.' },
    }),
  })

  registerErrorHandler(app)
  await registerRoutes(app)

  // Normal HTTP caching for read endpoints. This is server-driven and never
  // creates an offline quiz system: clients still require the network to fetch
  // content; the header only lets intermediaries/browsers reuse a response for
  // a short window. Mutating endpoints (POST) are unaffected.
  app.addHook('onSend', async (req, reply) => {
    if (req.method === 'GET' && !reply.hasHeader('Cache-Control')) {
      reply.header('Cache-Control', 'public, max-age=60')
    }
  })

  return app
}
