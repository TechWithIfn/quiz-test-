import { describe, it, expect, vi } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { buildImportPlan } from '../src/content/plan.js'
import { applyImportPlan, importContentFromDir } from '../src/content/import.js'
import { checkDatabaseIntegrity } from '../src/content/integrity.js'
import { validateContentDir } from '../src/content/validate.js'

const here = path.dirname(fileURLToPath(import.meta.url))

function makeModel() {
  return {
    upsert: vi.fn().mockResolvedValue(undefined),
    deleteMany: vi.fn().mockResolvedValue(undefined),
    createMany: vi.fn().mockResolvedValue(undefined),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  }
}

function fakePrisma() {
  const transaction = vi.fn().mockResolvedValue(undefined)
  return {
    $transaction: transaction,
    category: makeModel(),
    tag: makeModel(),
    topic: makeModel(),
    question: makeModel(),
    option: makeModel(),
    test: makeModel(),
    testQuestion: makeModel(),
    testTag: makeModel(),
    questionTag: makeModel(),
  } as never
}

describe('content import plan', () => {
  it('maps validated content to DB-ready structures with versioning', () => {
    const root = path.resolve(here, '..', '..', 'content')
    const { entities } = validateContentDir(root)
    expect(entities).toBeDefined()
    const plan = buildImportPlan(entities!)

    const publishedTest = plan.tests.find((t) => t.status === 'published')!
    expect(publishedTest.publishedAt).not.toBeNull()
    expect(publishedTest.version).toBe('1.0.0')

    const draftTest = plan.tests.find((t) => t.status === 'draft')!
    expect(draftTest.publishedAt).toBeNull()

    // Option ids are namespaced to stay globally unique.
    const q = plan.questions[0]
    expect(q.options[0].id).toBe(`${q.id}__${q.options[0].id.split('__')[1]}`)
    expect(q.status).toBe('published')

    // Tag ids are derived from slug.
    expect(plan.tags.every((t) => t.id === `tag_${t.slug}`)).toBe(true)
  })
})

describe('content import (transactional, fail-safe)', () => {
  it('applies the plan inside a single transaction', async () => {
    const root = path.resolve(here, '..', '..', 'content')
    const { entities } = validateContentDir(root)
    const plan = buildImportPlan(entities!)
    const prisma = fakePrisma()

    await applyImportPlan(prisma as never, plan)

    expect((prisma as any).$transaction).toHaveBeenCalledTimes(1)
    expect((prisma as any).test.upsert).toHaveBeenCalled()
    expect((prisma as any).option.createMany).toHaveBeenCalled()
    expect((prisma as any).testQuestion.createMany).toHaveBeenCalled()
  })

  it('never writes to the database when validation fails (fail-safe)', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'quizflow-content-'))
    fs.mkdirSync(path.join(dir, 'tests'))
    // Two tests with the same slug -> invalid. No DB writes should occur.
    fs.writeFileSync(
      path.join(dir, 'tests', 'a.json'),
      JSON.stringify({
        id: 't1',
        slug: 'dup',
        title: 'A',
        shortDescription: '',
        difficulty: 'beginner',
        categorySlug: 'x',
        questionIds: ['q1'],
        original: true,
      }),
    )
    fs.writeFileSync(
      path.join(dir, 'tests', 'b.json'),
      JSON.stringify({
        id: 't2',
        slug: 'dup',
        title: 'B',
        shortDescription: '',
        difficulty: 'beginner',
        categorySlug: 'x',
        questionIds: ['q1'],
        original: true,
      }),
    )

    const prisma = fakePrisma()
    const outcome = await importContentFromDir(dir, prisma as never)

    expect(outcome.valid).toBe(false)
    expect(outcome.imported).toBeUndefined()
    expect((prisma as any).$transaction).not.toHaveBeenCalled()
  })
})

describe('database integrity check', () => {
  it('reports no issues for a clean database', async () => {
    const prisma = fakePrisma()
    const report = await checkDatabaseIntegrity(prisma as never)
    expect(report.issues).toHaveLength(0)
    expect(report.counts).toHaveProperty('tests')
  })
})
