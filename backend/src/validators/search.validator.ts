import { z } from 'zod'
import { difficultyEnum, paginationQuery, slug } from './common.js'

export const searchQuery = paginationQuery.extend({
  // Bounded query length prevents expensive/unbounded matching.
  q: z.string().trim().min(1).max(100),
  category: slug.optional(),
  difficulty: difficultyEnum.optional(),
  type: z.enum(['tests', 'categories', 'topics', 'all']).default('all'),
})

export type SearchQuery = z.infer<typeof searchQuery>
