import { Question, Test, TestCategory } from '@/types'
import type { ITestRepository } from './test.service'
import { categoriesApi, testsApi } from '@/lib/api'
import { mapCategory, mapQuestion } from '@/lib/api/adapter'

/**
 * API-backed implementation of ITestRepository.
 *
 * The backend is the authoritative source of truth; this adapter only maps the
 * API contract onto the frontend's runtime `Test`/`Question` shapes. It is now
 * the active `testRepository` singleton (see test.service.ts), replacing the
 * static file-based repository as the production content source.
 */

export class ApiTestRepository implements ITestRepository {
  async getAllTests(): Promise<Test[]> {
    return testsApi.list()
  }

  async getFeaturedTests(): Promise<Test[]> {
    return testsApi.featured()
  }

  async getTestBySlug(slug: string): Promise<Test | null> {
    return testsApi.getBySlug(slug)
  }

  async getTestById(id: string): Promise<Test | null> {
    return testsApi.getById(id)
  }

  async getQuestionsForTest(testId: string): Promise<Question[]> {
    const test = await testsApi.getById(testId)
    if (!test) return []
    const { questions } = await testsApi.getQuestions(test.slug)
    return questions.map(mapQuestion)
  }

  async getCategories(): Promise<TestCategory[]> {
    const data = await categoriesApi.list()
    return data.map(mapCategory)
  }

  async getRelatedTests(currentSlug: string, limit = 3): Promise<Test[]> {
    return testsApi.getRelated(currentSlug, limit)
  }
}
