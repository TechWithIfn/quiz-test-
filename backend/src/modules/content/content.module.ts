import type { FastifyPluginAsync } from 'fastify'
import { contentService } from './content.service.js'
import { ok } from '../../utils/response.js'
import { governanceSchema } from '../../validators/response.validator.js'

export const contentModule: FastifyPluginAsync = async (fastify) => {
  // Content governance: publishing state and current content version.
  fastify.get('/governance', async () => {
    const governance = await contentService.getGovernance()
    return ok(governance, undefined, governanceSchema)
  })
}
