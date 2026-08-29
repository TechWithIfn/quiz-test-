import type { FastifyPluginAsync } from 'fastify'
import { questionsService } from './questions.service.js'
import { ok } from '../../utils/response.js'
import { questionsQuery } from '../../validators/common.js'
import { paginatedApiQuestionSchema } from '../../validators/response.validator.js'

export const questionsModule: FastifyPluginAsync = async (fastify) => {
  // Retrieve questions by topic slug (discovery / practice building).
  fastify.get('/', async (req) => {
    const query = questionsQuery.parse(req.query)
    const items = await questionsService.getByTopicSlug(query.topic, query.limit)
    return ok(items, { limit: query.limit, offset: query.offset }, paginatedApiQuestionSchema)
  })
}
