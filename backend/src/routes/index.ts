import type { FastifyInstance } from 'fastify'
import { testsModule } from '../modules/tests/tests.module.js'
import { questionsModule } from '../modules/questions/questions.module.js'
import { categoriesModule } from '../modules/categories/categories.module.js'
import { topicsModule } from '../modules/topics/topics.module.js'
import { searchModule } from '../modules/search/search.module.js'
import { contentModule } from '../modules/content/content.module.js'
import { ok } from '../utils/response.js'

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Health / liveness probe (no auth, no DB required by caller).
  app.get('/health', async () => {
    return ok({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Public, read-only content API.
  await app.register(testsModule, { prefix: '/api/tests' })
  await app.register(questionsModule, { prefix: '/api/questions' })
  await app.register(categoriesModule, { prefix: '/api/categories' })
  await app.register(topicsModule, { prefix: '/api/topics' })
  await app.register(searchModule, { prefix: '/api/search' })
  await app.register(contentModule, { prefix: '/api/content' })

  // Future protected content-management endpoints (editors only) will live
  // under /api/admin and require authentication. NOT implemented in this phase.
}
