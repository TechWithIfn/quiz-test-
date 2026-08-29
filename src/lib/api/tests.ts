import { apiClient } from './client'
import { mapQuestion, mapTest } from './adapter'
import type { ApiAnswerVerification, ApiQuestion, ApiTest, AnswerSubmission } from './types'
import type { Test } from '@/types'

export const testsApi = {
  async list(params: Record<string, string | number | undefined> = {}): Promise<Test[]> {
    const data = await apiClient.request<ApiTest[]>(`/api/tests${apiClient.buildQuery(params)}`)
    return data.map(mapTest)
  },

  async featured(): Promise<Test[]> {
    const data = await apiClient.request<ApiTest[]>('/api/tests/featured')
    return data.map(mapTest)
  },

  async getBySlug(slug: string): Promise<Test | null> {
    try {
      const data = await apiClient.request<ApiTest>(`/api/tests/${encodeURIComponent(slug)}`)
      return mapTest(data)
    } catch (err) {
      if (err instanceof Error && (err as { status?: number }).status === 404) return null
      throw err
    }
  },

  async getById(id: string): Promise<Test | null> {
    // The API is keyed by slug; resolve the slug via the catalog then fetch.
    const all = await this.list()
    const found = all.find((t) => t.id === id)
    return found ?? null
  },

  async getQuestions(slug: string): Promise<{ test: Test; questions: ReturnType<typeof mapQuestion>[] }> {
    const data = await apiClient.request<{ test: ApiTest; questions: ApiQuestion[] }>(
      `/api/tests/${encodeURIComponent(slug)}/questions`,
    )
    return {
      test: mapTest(data.test),
      questions: data.questions.map(mapQuestion),
    }
  },

  async getRelated(slug: string, limit = 3): Promise<Test[]> {
    const data = await apiClient.request<ApiTest[]>(`/api/tests/${encodeURIComponent(slug)}/related`)
    return data.map(mapTest).slice(0, limit)
  },

  async verifyAnswers(slug: string, submission: AnswerSubmission): Promise<ApiAnswerVerification> {
    return apiClient.request<ApiAnswerVerification>(`/api/tests/${encodeURIComponent(slug)}/answers`, {
      method: 'POST',
      body: JSON.stringify(submission),
    })
  },
}
