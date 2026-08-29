import type { FastifyPluginAsync } from 'fastify'
import { searchService } from './search.service.js'
import { ok } from '../../utils/response.js'
import { searchQuery } from '../../validators/search.validator.js'
import { searchResultSchema } from '../../validators/response.validator.js'
import { env } from '../../config/env.js'

export const searchModule: FastifyPluginAsync = async (fastify) => {
  // Search is the most expensive read path; keep it tight to deter scraping.
  fastify.get('/', {
    config: { rateLimit: { max: env.RATE_LIMIT_SEARCH_MAX } },
  }, async (req) => {
    const query = searchQuery.parse(req.query)
    const result = await searchService.search(query)
    return ok(
      result,
      { total: result.total, limit: query.limit, offset: query.offset, hasMore: query.offset + query.limit < result.total },
      searchResultSchema,
    )
  })
}
