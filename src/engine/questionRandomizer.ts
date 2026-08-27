import { Question, QuestionOption } from '@/types'

export type RandomSource = () => number

function shuffle<T>(items: T[], random: RandomSource): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export interface RandomizedQuiz {
  questions: Question[]
  optionsByQuestionId: Record<string, QuestionOption[]>
}

/** Randomizes order while preserving IDs, answers, and question content. */
export function randomizeQuestions(
  questions: Question[],
  random: RandomSource = Math.random
): Question[] {
  return shuffle(questions, random)
}

/** Single-choice options are safe to shuffle because answers are stored by option ID. */
export function randomizeOptions(
  question: Question,
  random: RandomSource = Math.random
): Question {
  return { ...question, options: shuffle(question.options, random) }
}

export function randomizeQuiz(
  questions: Question[],
  random: RandomSource = Math.random
): RandomizedQuiz {
  const randomizedQuestions = randomizeQuestions(questions, random)
  const optionsByQuestionId: Record<string, QuestionOption[]> = {}
  const questionsWithRandomizedOptions = randomizedQuestions.map((question) => {
    const randomized = randomizeOptions(question, random)
    optionsByQuestionId[question.id] = randomized.options
    return randomized
  })

  return { questions: questionsWithRandomizedOptions, optionsByQuestionId }
}
