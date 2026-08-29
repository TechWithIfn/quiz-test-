import { apiClient } from './client'
import type { ApiSearchResult } from './types'
import type { SearchFilterState } from '@/types'

/** Map the frontend filter state onto backend search query params. */
function searchParams(filters: SearchFilterState): Record<string, string | number | undefined> {
  return {
    q: filters.query,
    category: filters.categorySlug && filters.categorySlug !== 'all' ? filters.categorySlug : undefined,
    difficulty:
      filters.difficulty && filters.difficulty !== 'all-levels' ? filters.difficulty : undefined,
    tag: filters.tagSlug,
    sortBy: filters.sortBy,
    limit: 50,
  }
}

/**
 * Frontend search now proxies to the backend (`GET /api/search`) which queries
 * PostgreSQL — there is no local question bank involved (Prompt 11 §9).
 */
export const searchApi = {
  async query(filters: SearchFilterState): Promise<ApiSearchResult> {
    return apiClient.request<ApiSearchResult>(`/api/search${apiClient.buildQuery(searchParams(filters))}`)
  },
}
