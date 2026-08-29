import { prisma } from '../../db/client.js'
import type { ApiCategory, ApiTest } from '../../types/domain.js'
import { toApiCategory, toApiTest, testInclude } from '../../utils/mappers.js'
import type { Prisma } from '@prisma/client'

export const categoriesRepository = {
  async findAll(): Promise<ApiCategory[]> {
    const rows = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
    return rows.map(toApiCategory)
  },

  async findBySlug(slug: string): Promise<ApiCategory | null> {
    const row = await prisma.category.findUnique({ where: { slug } })
    return row ? toApiCategory(row) : null
  },

  async findTestsByCategorySlug(
    slug: string,
    limit: number,
    offset: number,
  ): Promise<{ items: ApiTest[]; total: number }> {
    const where: Prisma.TestWhereInput = { status: 'published', category: { slug } }
    const [rows, total] = await Promise.all([
      prisma.test.findMany({
        where,
        include: testInclude,
        orderBy: { title: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.test.count({ where }),
    ])
    return {
      items: rows.map(toApiTest),
      total,
    }
  },
}
