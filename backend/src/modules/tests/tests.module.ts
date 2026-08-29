import type { FastifyPluginAsync } from 'fastify'
import { testsService } from './tests.service.js'
import { ok } from '../../utils/response.js'
import { env } from '../../config/env.js'
import {
  listTestsQuery,
  getTestParams,
  testQuestionsQuery,
  answerSubmissionSchema,
} from '../../validators/tests.validator.js'
import {
  apiTestSchema,
  paginatedApiTestSchema,
  testQuestionsSchema,
  answerVerificationSchema,
} from '../../validators/response.validator.js'

export const testsModule: FastifyPluginAsync = async (fastify) => {
  // List published tests with filters, sorting, and safe pagination.
  fastify.get('/', async (req) => {
    const query = listTestsQuery.parse(req.query)
    const result = await testsService.list(query)
    return ok(result.items, { total: result.total, limit: result.limit, offset: result.offset }, paginatedApiTestSchema)
  })

  // Featured tests (declared before /:slug to avoid route shadowing).
  fastify.get('/featured', async () => {
    const items = await testsService.getFeatured()
    return ok(items, undefined, paginatedApiTestSchema)
  })

  // Questions for a test. Answers (isCorrect) are NEVER included here — that is
  // the responsibility of the separate POST /:slug/answers verification path.
  // Tighter rate limit: question retrieval is a high-traffic read path.
  fastify.get('/:slug/questions', {
    config: { rateLimit: { max: env.RATE_LIMIT_QUESTIONS_MAX } },
  }, async (req) => {
    const params = getTestParams.parse(req.params)
    const query = testQuestionsQuery.parse(req.query)
    const result = await testsService.getQuestionsForTest(params.slug, query.type)
    return ok(result, undefined, testQuestionsSchema)
  })

  // Single test metadata by slug.
  fastify.get('/:slug', async (req) => {
    const params = getTestParams.parse(req.params)
    const test = await testsService.getBySlug(params)
    return ok(test, undefined, apiTestSchema)
  })

  // Related tests (same category) for discovery.
  fastify.get('/:slug/related', async (req) => {
    const params = getTestParams.parse(req.params)
    const items = await testsService.getRelated(params.slug)
    return ok(items, undefined, paginatedApiTestSchema)
  })

  // Public answer verification (post-submission only). Accepts the user's
  // selections and returns per-question correctness; it does not read answers
  // from the GET delivery endpoints above. Tighter limit: this is a compute
  // endpoint and the most attractive one to abuse.
  fastify.post('/:slug/answers', {
    config: { rateLimit: { max: env.RATE_LIMIT_SUBMIT_MAX } },
  }, async (req) => {
    const params = getTestParams.parse(req.params)
    const body = answerSubmissionSchema.parse(req.body)
    const result = await testsService.verifyAnswers(params.slug, body)
    return ok(result, undefined, answerVerificationSchema)
  })
}
