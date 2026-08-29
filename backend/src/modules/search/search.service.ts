import { searchRepository } from './search.repository.js'
import { tokenize, scoreTest } from './relevance.js'
import type { SearchResult } from '../../types/domain.js'
import type { SearchQuery } from '../../validators/search.validator.js'

export const searchService = {
  async search(args: SearchQuery): Promise<SearchResult> {
    const repoResult = await searchRepository.search(args)
    const tokens = tokenize(args.q)

    const ranked = repoResult.tests
      .map((test) => ({ test, score: scoreTest(test, tokens) }))
      .filter((entry) => entry.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          (b.test.featured ? 1 : 0) - (a.test.featured ? 1 : 0) ||
          a.test.title.localeCompare(b.test.title),
      )
      .map((entry) => entry.test)

    const safeOffset = Math.max(0, Math.min(args.offset, ranked.length))
    const page = ranked.slice(safeOffset, safeOffset + args.limit)

    return {
      tests: page,
      categories: repoResult.categories,
      topics: repoResult.topics,
      total: ranked.length,
    }
  },
}
