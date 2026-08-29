import type { FastifyPluginAsync } from 'fastify'
import { categoriesService } from './categories.service.js'
import { ok } from '../../utils/response.js'
import { slugParam, paginationQuery } from '../../validators/common.js'
import {
  apiCategorySchema,
  paginatedApiCategorySchema,
  categoryTestsSchema,
} from '../../validators/response.validator.js'

export const categoriesModule: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    const items = await categoriesService.list()
    return ok(items, undefined, paginatedApiCategorySchema)
  })

  fastify.get('/:slug/tests', async (req) => {
    const params = slugParam.parse(req.params)
    const query = paginationQuery.parse(req.query)
    const result = await categoriesService.getTests(params.slug, query.limit, query.offset)
    return ok(
      { category: result.category, tests: result.tests.items },
      { total: result.tests.total, limit: result.tests.limit, offset: result.tests.offset },
      categoryTestsSchema,
    )
  })

  fastify.get('/:slug', async (req) => {
    const params = slugParam.parse(req.params)
    const category = await categoriesService.getBySlug(params.slug)
    return ok(category, undefined, apiCategorySchema)
  })
}
