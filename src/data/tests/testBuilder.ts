import { RawQuestion, RawTest } from '@/types/content'

type QDef = {
  topic: string
  concept?: string
  prompt: string
  options: string[]
  correct: number
  explanation: string
  hint?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime?: number
  codeSnippet?: string
  codeLanguage?: string
  tags?: string[]
}

export function buildExpandedTest(
  key: string,
  slug: string,
  title: string,
  shortDescription: string,
  fullDescription: string,
  category: { id: string; name: string; slug: string; description: string; color: string; icon?: string },
  language: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  estimatedMinutes: number,
  definitions: QDef[],
  options?: {
    passingScorePercentage?: number
    featured?: boolean
    aliases?: string[]
    skills?: string[]
  }
): RawTest {
  const questions: RawQuestion[] = definitions.map((def, idx) => {
    const qNum = idx + 1
    const optIds = ['a', 'b', 'c', 'd', 'e']
    return {
      id: `q-${key}-${qNum}`,
      question: def.prompt,
      type: def.codeSnippet ? 'code-snippet' : 'single-choice',
      codeSnippet: def.codeSnippet,
      codeLanguage: def.codeLanguage,
      options: def.options.map((optText, oIdx) => ({
        id: `opt-${key}-${qNum}-${optIds[oIdx] || oIdx}`,
        text: optText,
      })),
      correctAnswer: `opt-${key}-${qNum}-${optIds[def.correct] || def.correct}`,
      explanation: def.explanation,
      hint: def.hint,
      difficulty: def.difficulty || difficulty,
      topic: def.topic,
      concept: def.concept,
      tags: def.tags || [def.topic, category.name],
      estimatedTime: def.estimatedTime || 45,
      points: 1,
    }
  })

  const derivedTags = Array.from(new Set(definitions.flatMap((d) => d.tags || [d.topic]))).map((name) => ({
    id: `tag-${key}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  }))

  return {
    id: `test-${key}`,
    slug,
    title,
    shortDescription,
    fullDescription,
    category: {
      ...category,
      icon: category.icon || 'BookOpen',
    },
    tags: derivedTags,
    aliases: options?.aliases || [],
    skills: options?.skills || definitions.slice(0, 5).map((d) => d.topic),
    difficulty,
    estimatedMinutes,
    questionCount: questions.length,
    language,
    passingScorePercentage: options?.passingScorePercentage ?? 70,
    featured: options?.featured ?? false,
    createdAt: '2026-03-01T00:00:00.000Z',
    questions,
  }
}
