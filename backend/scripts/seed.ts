/**
 * Content import / seed.
 *
 * This is the ONE-WAY bridge that moves the existing frontend question banks
 * into PostgreSQL. After running this, the database becomes the authoritative
 * source of truth and the frontend's static question data is removed (see
 * docs/frontend-backend-migration.md, Phase 6).
 *
 * Run:  npm run db:seed   (requires DATABASE_URL and `npm run db:generate`)
 */
import { prisma } from '../src/db/client.js'
import { env } from '../src/config/env.js'
import { ALL_RAW_TESTS } from '@/data/tests'
import type { RawTest, RawQuestion } from '@/types/content'
import type { QuestionType as DbQuestionType } from '@prisma/client'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toDbQuestionType(type: RawQuestion['type']): DbQuestionType {
  switch (type) {
    case 'single-choice':
      return 'SINGLE_CHOICE'
    case 'multiple-choice':
      return 'MULTIPLE_CHOICE'
    case 'code-snippet':
      return 'CODE_SNIPPET'
  }
}

// Slug -> tag id cache so we reuse tags across tests/questions.
const tagCache = new Map<string, string>()

async function getOrCreateTag(name: string): Promise<string> {
  const slug = slugify(name)
  const cached = tagCache.get(slug)
  if (cached) return cached
  const tag = await prisma.tag.upsert({
    where: { slug },
    create: { slug, name },
    update: { name },
  })
  tagCache.set(slug, tag.id)
  return tag.id
}

async function importTest(raw: RawTest): Promise<void> {
  const category = await prisma.category.upsert({
    where: { slug: raw.category.slug },
    create: {
      slug: raw.category.slug,
      name: raw.category.name,
      description: raw.category.description,
      icon: raw.category.icon,
      color: raw.category.color,
    },
    update: {
      name: raw.category.name,
      description: raw.category.description,
      icon: raw.category.icon,
      color: raw.category.color,
    },
  })

  const testTagIds = await Promise.all(raw.tags.map((tag) => getOrCreateTag(tag.name)))

  // Ensure a Topic row exists per distinct question topic, linked to category.
  const topicNames = Array.from(new Set(raw.questions.map((q) => q.topic).filter(Boolean)))
  const topicIdByName = new Map<string, string>()
  await Promise.all(
    topicNames.map(async (name) => {
      const slug = slugify(name)
      const topic = await prisma.topic.upsert({
        where: { slug },
        create: { slug, name, categoryId: category.id, status: 'published' },
        update: { name, categoryId: category.id },
      })
      topicIdByName.set(name, topic.id)
    }),
  )

  const test = await prisma.test.upsert({
    where: { slug: raw.slug },
    create: {
      slug: raw.slug,
      title: raw.title,
      shortDescription: raw.shortDescription,
      description: raw.fullDescription ?? raw.shortDescription,
      difficulty: raw.difficulty,
      estimatedTime: raw.estimatedMinutes,
      questionCount: raw.questions.length,
      language: raw.language,
      passingScorePercentage: raw.passingScorePercentage ?? 70,
      featured: raw.featured ?? false,
      status: 'published',
      version: env.CONTENT_VERSION,
      seoTitle: raw.title,
      seoDescription: raw.shortDescription,
      canonicalPath: null,
      indexable: true,
      publishedAt: new Date(),
      category: { connect: { slug: raw.category.slug } },
    },
    update: {
      title: raw.title,
      shortDescription: raw.shortDescription,
      description: raw.fullDescription ?? raw.shortDescription,
      difficulty: raw.difficulty,
      estimatedTime: raw.estimatedMinutes,
      questionCount: raw.questions.length,
      language: raw.language,
      passingScorePercentage: raw.passingScorePercentage ?? 70,
      featured: raw.featured ?? false,
      version: env.CONTENT_VERSION,
      seoTitle: raw.title,
      seoDescription: raw.shortDescription,
      category: { connect: { slug: raw.category.slug } },
    },
  })

  // Idempotent re-import: drop only the links/questions that belong solely to
  // this test, then recreate them.
  const links = await prisma.testQuestion.findMany({
    where: { test: { slug: raw.slug } },
    select: { questionId: true },
  })
  for (const { questionId } of links) {
    const other = await prisma.testQuestion.count({
      where: { questionId, NOT: { test: { slug: raw.slug } } },
    })
    if (other === 0) {
      await prisma.question.delete({ where: { id: questionId } })
    }
  }
  await prisma.testQuestion.deleteMany({ where: { test: { slug: raw.slug } } })

  const questionTagIds = new Map<string, string[]>()
  for (const q of raw.questions) {
    const ids = await Promise.all((q.tags ?? []).map((name) => getOrCreateTag(name)))
    questionTagIds.set(q.id, ids)
  }

  for (let i = 0; i < raw.questions.length; i++) {
    const q = raw.questions[i]
    const topicId = q.topic ? topicIdByName.get(q.topic) : undefined

    const created = await prisma.question.create({
      data: {
        questionType: toDbQuestionType(q.type),
        question: q.question,
        codeSnippet: q.codeSnippet,
        codeLanguage: q.codeLanguage,
        explanation: q.explanation,
        hint: q.hint,
        difficulty: q.difficulty,
        topicId: topicId ?? null,
        concept: q.concept,
        estimatedTime: q.estimatedTime,
        points: q.points ?? 1,
        status: 'published',
        version: env.CONTENT_VERSION,
        options: {
          create: q.options.map((opt, index) => ({
            optionText: opt.text,
            optionOrder: index,
            isCorrect: opt.id === q.correctAnswer,
            codeSnippet: opt.codeSnippet,
          })),
        },
        questionTags: {
          create: (questionTagIds.get(q.id) ?? []).map((tagId) => ({ tagId })),
        },
      },
    })

    await prisma.testQuestion.create({
      data: { testId: test.id, questionId: created.id, questionOrder: i },
    })
  }

  // (Re)connect test tags.
  await prisma.testTag.deleteMany({ where: { test: { slug: raw.slug } } })
  for (const tagId of testTagIds) {
    await prisma.testTag.create({
      data: { test: { connect: { slug: raw.slug } }, tag: { connect: { id: tagId } } },
    })
  }

  console.log(`  ✓ ${raw.slug} (${raw.questions.length} questions)`)
}

async function main(): Promise<void> {
  console.log(`Importing ${ALL_RAW_TESTS.length} tests into PostgreSQL...`)
  for (const raw of ALL_RAW_TESTS) {
    await importTest(raw)
  }
  console.log('Seed complete.')
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
