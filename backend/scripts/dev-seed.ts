/**
 * DEV-only seed — original demo content.
 *
 * This dataset is hand-written sample content for local development and is
 * clearly marked as a demo. It is NOT derived from any external source and
 * contains no personal data. The production content import lives in
 * scripts/seed.ts (run via `npm run db:seed-prod`).
 *
 * Run:  npm run db:seed
 */
import { prisma } from '../src/db/client.js'
import { env } from '../src/config/env.js'

const DEMO_TEST_SLUGS = ['demo-quick-think', 'demo-word-play']
const DEMO_TOPIC_SLUGS = ['numbers', 'words']

async function resetDemo(): Promise<void> {
  await prisma.testQuestion.deleteMany({ where: { test: { slug: { in: DEMO_TEST_SLUGS } } } })
  const questionIds = await prisma.question.findMany({
    where: { testQuestions: { some: { test: { slug: { in: DEMO_TEST_SLUGS } } } } },
    select: { id: true },
  })
  await prisma.question.deleteMany({ where: { id: { in: questionIds.map((q) => q.id) } } })
  await prisma.test.deleteMany({ where: { slug: { in: DEMO_TEST_SLUGS } } })
  await prisma.topic.deleteMany({
    where: { slug: { in: DEMO_TOPIC_SLUGS }, categoryId: { not: null } },
  })
}

async function main(): Promise<void> {
  await resetDemo()

  const category = await prisma.category.upsert({
    where: { slug: 'general-knowledge' },
    create: {
      slug: 'general-knowledge',
      name: 'General Knowledge',
      description: 'Sample demo category for local development.',
      icon: 'sparkles',
      color: '#6366f1',
    },
    update: {},
  })

  const tagDemo = await prisma.tag.upsert({
    where: { slug: 'demo' },
    create: { slug: 'demo', name: 'Demo' },
    update: {},
  })
  const tagSample = await prisma.tag.upsert({
    where: { slug: 'sample' },
    create: { slug: 'sample', name: 'Sample' },
    update: {},
  })

  const topicNumbers = await prisma.topic.upsert({
    where: { slug: 'numbers' },
    create: { slug: 'numbers', name: 'Numbers', categoryId: category.id, status: 'published' },
    update: { categoryId: category.id },
  })
  const topicWords = await prisma.topic.upsert({
    where: { slug: 'words' },
    create: { slug: 'words', name: 'Words', categoryId: category.id, status: 'published' },
    update: { categoryId: category.id },
  })

  const now = new Date()

  // --- Test 1: Demo: Quick Think ---
  const quickThink = await prisma.test.create({
    data: {
      slug: 'demo-quick-think',
      title: 'Demo: Quick Think',
      shortDescription: 'A short demo test with a few warm-up questions.',
      description: 'A short demo test with a few warm-up questions to exercise the API.',
      difficulty: 'beginner',
      estimatedTime: 5,
      questionCount: 3,
      language: 'en',
      passingScorePercentage: 70,
      featured: true,
      status: 'published',
      version: env.CONTENT_VERSION,
      seoTitle: 'Demo: Quick Think',
      seoDescription: 'Sample quiz for local development.',
      canonicalPath: '/demo/quick-think',
      indexable: true,
      publishedAt: now,
      categoryId: category.id,
      testTags: { create: [{ tagId: tagDemo.id }, { tagId: tagSample.id }] },
    },
  })

  const q1 = await prisma.question.create({
    data: {
      questionType: 'SINGLE_CHOICE',
      question: 'What is 7 + 6?',
      explanation: '7 + 6 = 13.',
      difficulty: 'beginner',
      topicId: topicNumbers.id,
      estimatedTime: 30,
      points: 1,
      status: 'published',
      version: env.CONTENT_VERSION,
      options: {
        create: [
          { optionText: '11', optionOrder: 0, isCorrect: false },
          { optionText: '12', optionOrder: 1, isCorrect: false },
          { optionText: '13', optionOrder: 2, isCorrect: true },
          { optionText: '14', optionOrder: 3, isCorrect: false },
        ],
      },
      questionTags: { create: [{ tagId: tagDemo.id }] },
    },
  })

  const q2 = await prisma.question.create({
    data: {
      questionType: 'SINGLE_CHOICE',
      question: 'Which of these words is a noun?',
      explanation: '"run" can be a noun; the others are adverbs or adjectives.',
      difficulty: 'beginner',
      topicId: topicWords.id,
      estimatedTime: 30,
      points: 1,
      status: 'published',
      version: env.CONTENT_VERSION,
      options: {
        create: [
          { optionText: 'quickly', optionOrder: 0, isCorrect: false },
          { optionText: 'run', optionOrder: 1, isCorrect: true },
          { optionText: 'blue', optionOrder: 2, isCorrect: false },
          { optionText: 'happily', optionOrder: 3, isCorrect: false },
        ],
      },
    },
  })

  const q3 = await prisma.question.create({
    data: {
      questionType: 'MULTIPLE_CHOICE',
      question: 'Select the even numbers.',
      explanation: '2 and 4 are even; 3 and 5 are odd.',
      difficulty: 'beginner',
      topicId: topicNumbers.id,
      estimatedTime: 45,
      points: 2,
      status: 'published',
      version: env.CONTENT_VERSION,
      options: {
        create: [
          { optionText: '2', optionOrder: 0, isCorrect: true },
          { optionText: '3', optionOrder: 1, isCorrect: false },
          { optionText: '4', optionOrder: 2, isCorrect: true },
          { optionText: '5', optionOrder: 3, isCorrect: false },
        ],
      },
      questionTags: { create: [{ tagId: tagSample.id }] },
    },
  })

  await prisma.testQuestion.createMany({
    data: [
      { testId: quickThink.id, questionId: q1.id, questionOrder: 0 },
      { testId: quickThink.id, questionId: q2.id, questionOrder: 1 },
      { testId: quickThink.id, questionId: q3.id, questionOrder: 2 },
    ],
  })

  // --- Test 2: Demo: Word Play ---
  const wordPlay = await prisma.test.create({
    data: {
      slug: 'demo-word-play',
      title: 'Demo: Word Play',
      shortDescription: 'A short demo test about words and a tiny code snippet.',
      description: 'A short demo test about words and a tiny code snippet.',
      difficulty: 'intermediate',
      estimatedTime: 8,
      questionCount: 2,
      language: 'en',
      passingScorePercentage: 70,
      featured: false,
      status: 'published',
      version: env.CONTENT_VERSION,
      seoTitle: 'Demo: Word Play',
      seoDescription: 'Sample quiz for local development.',
      canonicalPath: '/demo/word-play',
      indexable: true,
      publishedAt: now,
      categoryId: category.id,
      testTags: { create: [{ tagId: tagDemo.id }] },
    },
  })

  const q4 = await prisma.question.create({
    data: {
      questionType: 'SINGLE_CHOICE',
      question: 'Pick the synonym of "happy".',
      explanation: '"glad" is a synonym of "happy".',
      difficulty: 'intermediate',
      topicId: topicWords.id,
      estimatedTime: 30,
      points: 1,
      status: 'published',
      version: env.CONTENT_VERSION,
      options: {
        create: [
          { optionText: 'sad', optionOrder: 0, isCorrect: false },
          { optionText: 'glad', optionOrder: 1, isCorrect: true },
          { optionText: 'angry', optionOrder: 2, isCorrect: false },
          { optionText: 'tired', optionOrder: 3, isCorrect: false },
        ],
      },
    },
  })

  const q5 = await prisma.question.create({
    data: {
      questionType: 'CODE_SNIPPET',
      question: 'What does this Python snippet print?',
      codeSnippet: 'print(2 ** 3)',
      codeLanguage: 'python',
      explanation: '2 ** 3 is 2 raised to the 3rd power, which is 8.',
      difficulty: 'intermediate',
      topicId: topicWords.id,
      estimatedTime: 60,
      points: 1,
      status: 'published',
      version: env.CONTENT_VERSION,
      options: {
        create: [
          { optionText: '6', optionOrder: 0, isCorrect: false },
          { optionText: '8', optionOrder: 1, isCorrect: true },
          { optionText: '9', optionOrder: 2, isCorrect: false },
          { optionText: '12', optionOrder: 3, isCorrect: false },
        ],
      },
    },
  })

  await prisma.testQuestion.createMany({
    data: [
      { testId: wordPlay.id, questionId: q4.id, questionOrder: 0 },
      { testId: wordPlay.id, questionId: q5.id, questionOrder: 1 },
    ],
  })

  console.log('Dev seed complete (demo content only).')
}

main()
  .catch((error) => {
    console.error('Dev seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
