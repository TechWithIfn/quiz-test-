import { prisma } from '../../db/client.js'
import type { ApiTest, Paginated } from '../../types/domain.js'
import { toApiTest, testListInclude, testDetailInclude } from '../../utils/mappers.js'
import type { ListTestsQuery } from '../../validators/tests.validator.js'

interface FindManyArgs {
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tag?: string
  featured?: boolean
  sort: ListTestsQuery['sort']
  limit: number
  offset: number
}

function buildOrderBy(sort: FindManyArgs['sort']) {
  switch (sort) {
    case 'newest':
      return { createdAt: 'desc' as const }
    case 'questions-asc':
      return { questionCount: 'asc' as const }
    case 'time-asc':
      return { estimatedTime: 'asc' as const }
    case 'title':
    default:
      return { title: 'asc' as const }
  }
}

export const testsRepository = {
  async findMany(args: FindManyArgs): Promise<Paginated<ApiTest>> {
    const where = {
      status: 'published' as const,
      ...(args.category ? { category: { slug: args.category } } : {}),
      ...(args.difficulty ? { difficulty: args.difficulty } : {}),
      ...(args.featured !== undefined ? { featured: args.featured } : {}),
      ...(args.tag
        ? { testTags: { some: { tag: { slug: args.tag } } } }
        : {}),
    }

    const [rows, total] = await Promise.all([
      prisma.test.findMany({
        where,
        include: testListInclude,
        orderBy: buildOrderBy(args.sort),
        take: args.limit,
        skip: args.offset,
      }),
      prisma.test.count({ where }),
    ])

    return {
      items: rows.map(toApiTest),
      total,
      limit: args.limit,
      offset: args.offset,
    }
  },

  async findBySlug(slug: string): Promise<ApiTest | null> {
    const row = await prisma.test.findFirst({
      where: { slug, status: 'published' },
      include: testDetailInclude,
    })
    return row ? toApiTest(row) : null
  },

  async findFeatured(limit = 6): Promise<ApiTest[]> {
    const rows = await prisma.test.findMany({
      where: { status: 'published', featured: true },
      include: testListInclude,
      orderBy: { title: 'asc' },
      take: limit,
    })
    return rows.map(toApiTest)
  },

  async findRelated(slug: string, limit = 3): Promise<ApiTest[]> {
    const current = await prisma.test.findFirst({
      where: { slug, status: 'published' },
      select: { categoryId: true, title: true },
    })
    if (!current) return []

    // Only real, published tests in the same category are candidates; relevance
    // is then ranked by title-token overlap so genuinely related tests surface
    // first (e.g. "SQL Test" -> "SQL JOIN Test", "SQL GROUP BY Test"). No fake
    // or generated tests are ever returned.
    const rows = await prisma.test.findMany({
      where: { status: 'published', categoryId: current.categoryId, NOT: { slug } },
      include: testListInclude,
      take: 50,
    })

    const currentTokens = current.title.toLowerCase().split(/\s+/).filter(Boolean)
    const overlap = (title: string): number => {
      const words = title.toLowerCase().split(/\s+/)
      return currentTokens.reduce((count, token) => (words.includes(token) ? count + 1 : count), 0)
    }

    return rows
      .map((row) => ({ test: toApiTest(row), score: overlap(row.title) }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          (b.test.featured ? 1 : 0) - (a.test.featured ? 1 : 0) ||
          a.test.title.localeCompare(b.test.title),
      )
      .slice(0, limit)
      .map((entry) => entry.test)
  },
}
