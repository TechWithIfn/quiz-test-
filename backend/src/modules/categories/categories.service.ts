import { categoriesRepository } from './categories.repository.js'
import type { ApiCategory, ApiTest, Paginated } from '../../types/domain.js'
import { ApiError } from '../../utils/httpErrors.js'

export const categoriesService = {
  async list(): Promise<ApiCategory[]> {
    return categoriesRepository.findAll()
  },

  async getBySlug(slug: string): Promise<ApiCategory> {
    const category = await categoriesRepository.findBySlug(slug)
    if (!category) throw ApiError.notFound('Category', 'CATEGORY_NOT_FOUND')
    return category
  },

  async getTests(
    slug: string,
    limit: number,
    offset: number,
  ): Promise<{ category: ApiCategory; tests: Paginated<ApiTest> }> {
    const category = await categoriesRepository.findBySlug(slug)
    if (!category) throw ApiError.notFound('Category', 'CATEGORY_NOT_FOUND')
    const result = await categoriesRepository.findTestsByCategorySlug(slug, limit, offset)
    return {
      category,
      tests: { ...result, limit, offset },
    }
  },
}
