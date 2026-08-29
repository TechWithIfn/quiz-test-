import { apiClient } from './client'
import type { ApiCategory, ApiGovernance } from './types'

export const categoriesApi = {
  async list(): Promise<ApiCategory[]> {
    return apiClient.request<ApiCategory[]>('/api/categories')
  },
}

export const governanceApi = {
  async get(): Promise<ApiGovernance> {
    return apiClient.request<ApiGovernance>('/api/content/governance')
  },
}
