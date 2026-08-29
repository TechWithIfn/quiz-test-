import { prisma } from '../../db/client.js'
import type { ApiCategory, ApiTopic, ApiTest } from '../../types/domain.js'
import { toApiTest, toApiCategory, toApiTopic, testListInclude } from '../../utils/mappers.js'
import type { Prisma } from '@prisma/client'
import type { SearchQuery } from '../../validators/search.validator.js'
import { tokenize } from './relevance.js'

// Bound the candidate set fetched from the database. Relevance ranking happens
// in the service layer over this bounded set, which keeps queries cheap and
// prevents an unbounded/expensive scan for very common terms.
const SEARCH_CANDIDATE_CAP = 200

function fieldConditions(token: string): Prisma.TestWhereInput[] {
  const insensitive = { contains: token, mode: 'insensitive' as const }
  return [
    { title: insensitive },
    { shortDescription: insensitive },
    { description: insensitive },
    { slug: insensitive },
    { testTags: { some: { tag: { name: insensitive } } } },
    { category: { name: insensitive } },
  ]
}

export const searchRepository = {
  // Returns a bounded candidate set of published tests plus any matching
  // categories/topics. Relevance ranking is applied by the service.
  async search(args: SearchQuery): Promise<{
    tests: ApiTest[]
    categories: ApiCategory[]
    topics: ApiTopic[]
  }> {
    const tokens = tokenize(args.q)

    const tokenOr: Prisma.TestWhereInput[] = tokens.map((token) => ({ OR: fieldConditions(token) }))

    const testWhere: Prisma.TestWhereInput = {
      status: 'published',
      AND: [
        args.category ? { category: { slug: args.category } } : {},
        args.difficulty ? { difficulty: args.difficulty } : {},
        tokenOr.length > 0 ? { OR: tokenOr } : {},
      ],
    }

    const testsPromise =
      args.type === 'tests' || args.type === 'all'
        ?           prisma.test.findMany({
            where: testWhere,
            include: testListInclude,
            orderBy: { featured: 'desc' },
            take: SEARCH_CANDIDATE_CAP,
          })
        : Promise.resolve([])

    const categoriesPromise =
      args.type === 'categories' || args.type === 'all'
        ? prisma.category.findMany({
            where: {
              OR: [
                { name: { contains: args.q, mode: 'insensitive' } },
                { description: { contains: args.q, mode: 'insensitive' } },
              ],
            },
            take: 20,
          })
        : Promise.resolve([])

    const topicsPromise =
      args.type === 'topics' || args.type === 'all'
        ? prisma.topic.findMany({
            where: {
              status: 'published',
              OR: [
                { name: { contains: args.q, mode: 'insensitive' } },
                { slug: { contains: args.q, mode: 'insensitive' } },
              ],
            },
            include: { category: true },
            take: 20,
          })
        : Promise.resolve([])

    const [testRows, categoryRows, topicRows] = await Promise.all([
      testsPromise,
      categoriesPromise,
      topicsPromise,
    ])

    return {
      tests: testRows.map(toApiTest),
      categories: categoryRows.map(toApiCategory),
      topics: topicRows.map((t) =>
        toApiTopic(t, { questionCount: 0, testCount: 0 }, t.category ?? undefined),
      ),
    }
  },
}
