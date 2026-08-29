import type { ZodType } from 'zod'
import type { ApiErrorCode } from './httpErrors.js'
import { ApiError } from './httpErrors.js'

// Consistent success envelope returned by every public endpoint.
export interface SuccessEnvelope<T> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

// Consistent error envelope. Never leaks stack traces, SQL, or file paths.
export interface ErrorEnvelope {
  success: false
  error: {
    code: ApiErrorCode
    message: string
    details?: unknown
  }
}

export function ok<T>(
  data: T,
  meta?: Record<string, unknown>,
  schema?: ZodType<T>,
): SuccessEnvelope<T> {
  // When a response contract is provided, validate at the boundary. A mismatch is
  // a server-side contract bug (never the client's fault), so it surfaces as 500.
  const validated = schema ? validateContract(schema, data) : data
  return { success: true, data: validated, ...(meta ? { meta } : {}) }
}

function validateContract<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw ApiError.internal('Response contract validation failed', result.error.issues)
  }
  return result.data
}

export function fail(code: ApiErrorCode, message: string, details?: unknown): ErrorEnvelope {
  return {
    success: false,
    error: details !== undefined ? { code, message, details } : { code, message },
  }
}
