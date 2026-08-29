// Standard API error codes returned in the error envelope.
export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'TEST_NOT_FOUND'
  | 'CATEGORY_NOT_FOUND'
  | 'TOPIC_NOT_FOUND'
  | 'QUESTION_NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly statusCode: number
  readonly details?: unknown

  constructor(code: ApiErrorCode, statusCode: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError('BAD_REQUEST', 400, message, details)
  }

  static validationError(message: string, details?: unknown): ApiError {
    return new ApiError('VALIDATION_ERROR', 422, message, details)
  }

  // `resource` is used for the human-readable message; `code` lets clients
  // branch on a stable machine code (e.g. TEST_NOT_FOUND).
  static notFound(resource: string, code: ApiErrorCode = 'NOT_FOUND'): ApiError {
    return new ApiError(code, 404, `${resource} not found`)
  }

  static internal(message = 'Internal server error', details?: unknown): ApiError {
    return new ApiError('INTERNAL_ERROR', 500, message, details)
  }

  static serviceUnavailable(message = 'Service temporarily unavailable', details?: unknown): ApiError {
    return new ApiError('SERVICE_UNAVAILABLE', 503, message, details)
  }
}
