import type { FastifyPluginAsync } from 'fastify'
import { topicsService } from './topics.service.js'
import { ok } from '../../utils/response.js'
import { slugParam, paginationQuery } from '../../validators/common.js'
import {
  paginatedApiTopicSchema,
  topicDetailSchema,
} from '../../validators/response.validator.js'

export const topicsModule: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    const items = await topicsService.list()
    return ok(items, undefined, paginatedApiTopicSchema)
  })

  fastify.get('/:slug', async (req) => {
    const params = slugParam.parse(req.params)
    const query = paginationQuery.parse(req.query)
    const result = await topicsService.getBySlug(params.slug, query.limit)
    return ok(result, undefined, topicDetailSchema)
  })
}
