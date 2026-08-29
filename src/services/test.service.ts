import { Question, Test, TestCategory } from '@/types'
import { contentService, ContentService } from './content.service'
import { customTestRepository } from './custom-test.service'
import { ApiTestRepository } from './api-test.repository'

/**
 * Abstract Test Repository interface.
 * Decouples presentation and runner logic from underlying content files or APIs.
 */
export interface ITestRepository {
  getAllTests(): Promise<Test[]>
  getFeaturedTests(): Promise<Test[]>
  getTestBySlug(slug: string): Promise<Test | null>
  getTestById(id: string): Promise<Test | null>
  getQuestionsForTest(testId: string): Promise<Question[]>
  getCategories(): Promise<TestCategory[]>
  getRelatedTests(currentSlug: string, limit?: number): Promise<Test[]>
}

/**
 * Static File-Based Implementation of ITestRepository
 */
export class StaticContentTestRepository implements ITestRepository {
  private service: ContentService

  constructor(service: ContentService = contentService) {
    this.service = service
  }

  private getCombinedService(): ContentService {
    return new ContentService([...this.service.getRawTests(), ...customTestRepository.getAll()])
  }

  async getAllTests(): Promise<Test[]> {
    return this.getCombinedService().getAllTests()
  }

  async getFeaturedTests(): Promise<Test[]> {
    return this.getCombinedService().getFeaturedTests()
  }

  async getTestBySlug(slug: string): Promise<Test | null> {
    return this.getCombinedService().getTestBySlug(slug)
  }

  async getTestById(id: string): Promise<Test | null> {
    return this.getCombinedService().getTestById(id)
  }

  async getQuestionsForTest(testId: string): Promise<Question[]> {
    return this.getCombinedService().getQuestionsForTest(testId)
  }

  async getCategories(): Promise<TestCategory[]> {
    return this.getCombinedService().getCategories()
  }

  async getRelatedTests(currentSlug: string, limit: number = 3): Promise<Test[]> {
    return this.getCombinedService().getRelatedTests(currentSlug, limit)
  }
}

// Singleton repository instance. The production app is now backed by the API
// (online-only); static file content is kept available for unit tests / dev tools.
export const testRepository: ITestRepository = new ApiTestRepository()
