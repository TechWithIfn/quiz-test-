import { questionsRepository } from './questions.repository.js'
import type { ApiQuestion, QuestionType } from '../../types/domain.js'

export const questionsService = {
  async getByTestId(testId: string, type?: QuestionType): Promise<ApiQuestion[]> {
    return questionsRepository.findByTestId(testId, type)
  },

  async getByTopicSlug(topicSlug: string, limit = 50): Promise<ApiQuestion[]> {
    return questionsRepository.findByTopicSlug(topicSlug, limit)
  },
}
