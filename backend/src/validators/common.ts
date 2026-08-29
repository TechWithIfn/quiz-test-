import { z } from 'zod'

// Slugs are URL-safe identifiers: lower/upper-case letters, digits, hyphens.
// Used for path params (`/api/categories/:slug`) and query filters (`?category=`).
export const SLUG_RE = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/

export const slug = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(SLUG_RE, 'Invalid slug format (use letters, digits, and hyphens)')

export const difficultyEnum = z.enum(['beginner', 'intermediate', 'advanced'])

export const questionTypeEnum = z.enum(['single-choice', 'multiple-choice', 'code-snippet'])

// Safe pagination: limit is bounded so clients cannot request arbitrarily large
// result sets. Larger values are rejected during validation (422), not clamped.
export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

// Path parameter: a single `:slug`.
export const slugParam = z.object({ slug })

// Free-text search term (required, bounded).
export const searchTerm = z.string().trim().min(1).max(200)

export const queryParam = z.object({
  q: searchTerm.optional(),
})

// Query for GET /api/questions — a required topic slug plus safe pagination.
export const questionsQuery = paginationQuery.extend({
  topic: slug,
})
