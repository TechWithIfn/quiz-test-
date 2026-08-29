import { topicsRepository } from './topics.repository.js'
import type { ApiTopic, ApiTest, ApiQuestion } from '../../types/domain.js'
import { ApiError } from '../../utils/httpErrors.js'

export const topicsService = {
  async list(): Promise<ApiTopic[]> {
    return topicsRepository.listAll()
  },

  async getBySlug(
    slug: string,
    limit = 50,
  ): Promise<{ topic: ApiTopic; tests: ApiTest[]; questions: ApiQuestion[] }> {
    const result = await topicsRepository.getBySlug(slug, limit)
    if (!result.topic) throw ApiError.notFound('Topic', 'TOPIC_NOT_FOUND')
    return { topic: result.topic, tests: result.tests, questions: result.questions }
  },
}
