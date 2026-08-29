import { prisma } from '../../db/client.js'
import { env } from '../../config/env.js'

export interface ContentGovernance {
  contentVersion: string
  publishedTests: number
  totalTests: number
  totalQuestions: number
  generatedAt: string
}

// Backend-owned content governance: publishing state and content version.
// Used by the frontend to detect stale caches and by editors to audit state.
export const contentRepository = {
  async getGovernance(): Promise<ContentGovernance> {
    const [publishedTests, totalTests, totalQuestions, maxVersionRow] = await Promise.all([
      prisma.test.count({ where: { status: 'published' } }),
      prisma.test.count(),
      prisma.question.count(),
      prisma.test.findMany({
        where: { status: 'published' },
        select: { version: true },
        orderBy: { updatedAt: 'desc' },
        take: 1,
      }),
    ])

    const maxVersion = maxVersionRow[0]?.version ?? env.CONTENT_VERSION

    return {
      contentVersion: maxVersion,
      publishedTests,
      totalTests,
      totalQuestions,
      generatedAt: new Date().toISOString(),
    }
  },
}
