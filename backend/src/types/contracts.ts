// Typed API contracts — inferred from the Zod validators (requests) and the
// backend domain types (responses). These document the public surface and are
// reused by handlers/services so there is a single source of truth (no separate
// frontend/backend model duplication for the API boundary).

import type {
  ApiTest,
  ApiQuestion,
  ApiCategory,
  ApiTopic,
  SearchResult,
  Paginated,
  ApiAnswerVerification,
  ApiAnswerSubmission,
} from './domain.js'
import type { ListTestsQuery, TestQuestionsQuery, AnswerSubmission } from '../validators/tests.validator.js'
import type { SearchQuery } from '../validators/search.validator.js'

// GET /api/tests
export type ListTestsRequest = { query: ListTestsQuery }
export type ListTestsResponse = Paginated<ApiTest>

// GET /api/tests/:slug
export type GetTestRequest = { params: { slug: string } }
export type GetTestResponse = ApiTest

// GET /api/tests/:slug/questions
export type GetTestQuestionsRequest = { params: { slug: string }; query: TestQuestionsQuery }
export type GetTestQuestionsResponse = { test: ApiTest; questions: ApiQuestion[] }

// GET /api/categories
export type ListCategoriesResponse = ApiCategory[]

// GET /api/categories/:slug
export type GetCategoryRequest = { params: { slug: string } }
export type GetCategoryResponse = ApiCategory

// GET /api/categories/:slug/tests
export type GetCategoryTestsRequest = { params: { slug: string }; query: { limit: number; offset: number } }
export type GetCategoryTestsResponse = { category: ApiCategory; tests: ApiTest[] }

// GET /api/topics/:slug
export type GetTopicRequest = { params: { slug: string }; query: { limit: number; offset: number } }
export type GetTopicResponse = { topic: ApiTopic; tests: ApiTest[]; questions: ApiQuestion[] }

// GET /api/search
export type SearchRequest = { query: SearchQuery }
export type SearchResponse = SearchResult

// POST /api/tests/:slug/answers  (public answer verification)
export type VerifyAnswersRequest = { params: { slug: string }; body: ApiAnswerSubmission }
export type VerifyAnswersResponse = ApiAnswerVerification
export type { AnswerSubmission }
