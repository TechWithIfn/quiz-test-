import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { ApiError } from '../utils/httpErrors.js'
import { fail } from '../utils/response.js'
import { isProduction, env } from '../config/env.js'

export function registerErrorHandler(app: FastifyInstance): void {
  app.setNotFoundHandler((req, reply) => {
    return reply.code(404).send(fail('NOT_FOUND', `Route not found: ${req.method} ${req.url}`))
  })

  app.setErrorHandler((error, req, reply) => {
    // Rate limiting is thrown by @fastify/rate-limit's errorResponseBuilder as a
    // plain response object (not an Error instance). Forward it as-is with 429.
    if (
      typeof error === 'object' &&
      error !== null &&
      (error as { error?: { code?: string } }).error?.code === 'RATE_LIMITED'
    ) {
      return reply.code(429).send(error)
    }

    // Known application errors — safe to surface.
    if (error instanceof ApiError) {
      return reply
        .code(error.statusCode)
        .send(fail(error.code, error.message, error.details))
    }

    // Input validation errors from Zod.
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
      return reply
        .code(422)
        .send(fail('VALIDATION_ERROR', 'Request validation failed', details))
    }

    // Prisma "record not found" — map to a clean 404.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return reply.code(404).send(fail('NOT_FOUND', 'Resource not found'))
    }

    // Database connection errors — treat as service unavailable.
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return reply
        .code(503)
        .send(fail('SERVICE_UNAVAILABLE', 'Database is unavailable'))
    }

    // Unknown errors — never leak internals in production unless explicitly allowed.
    const exposeDetails = !isProduction || env.EXPOSE_ERROR_DETAILS
    const statusCode = error.statusCode && error.statusCode < 500 ? error.statusCode : 500
    const message = exposeDetails ? error.message : 'Internal server error'
    const details = exposeDetails ? { stack: error.stack } : undefined
    app.log.error({ err: error, url: req.url }, 'Unhandled error')
    return reply.code(statusCode).send(fail('INTERNAL_ERROR', message, details))
  })
}
