import { beforeEach, describe, expect, it } from 'vitest'
import { mistakeRepository } from '@/services/mistake.service'
import { createAttempt } from '@/engine/quizEngine'
import { useQuizStore } from '@/store/quiz.store'
import { Question, Test } from '@/types'

const mistake = {
  questionId: 'question-1',
  testId: 'test-1',
  testSlug: 'test-one',
  testTitle: 'Test One',
  selectedOptionId: 'wrong-option',
  correctOptionId: 'right-option',
  attemptId: 'attempt-1',
  questionNumber: 2,
}

const sampleTest: Test = {
  id: 'test-1',
  slug: 'test-one',
  title: 'Test One',
  shortDescription: 'Test One Description',
  fullDescription: 'Full Test One Description',
  category: { id: 'cat-1', name: 'Category 1', slug: 'category-1' },
  tags: [],
  difficulty: 'beginner',
  timeLimitMinutes: 10,
  totalQuestions: 2,
  passingScorePercentage: 70,
  createdAt: '2026-01-01',
}

const sampleQuestions: Question[] = [
  {
    id: 'question-1',
    testId: 'test-1',
    text: 'Question 1',
    type: 'single-choice',
    options: [
      { id: 'wrong-option', text: 'Wrong' },
      { id: 'right-option', text: 'Right' },
    ],
    correctOptionId: 'right-option',
    explanation: 'Detailed explanation for Question 1.',
    points: 1,
    topic: 'Topic 1',
    tags: ['topic1'],
  },
  {
    id: 'question-2',
    testId: 'test-1',
    text: 'Question 2',
    type: 'single-choice',
    options: [
      { id: 'opt-2a', text: 'A' },
      { id: 'opt-2b', text: 'B' },
    ],
    correctOptionId: 'opt-2a',
    explanation: 'Detailed explanation for Question 2.',
    points: 1,
    topic: 'Topic 2',
    tags: ['topic2'],
  },
]

describe('local mistake repository & practice system', () => {
  beforeEach(() => {
    mistakeRepository.clear()
    useQuizStore.getState().resetQuizSession()
  })

  it('stores mistake context without personal information', () => {
    mistakeRepository.recordIncorrect(mistake)
    const saved = mistakeRepository.getAll()

    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({ ...mistake, correctRetryCount: 0 })
    expect(saved[0].recordedAt).toBeTruthy()
    expect(saved[0]).not.toHaveProperty('name')
    expect(saved[0]).not.toHaveProperty('email')
    expect(saved[0]).not.toHaveProperty('class')
    expect(saved[0]).not.toHaveProperty('grade')
  })

  it('deduplicates the same question within one attempt', () => {
    mistakeRepository.recordIncorrect(mistake)
    mistakeRepository.recordIncorrect({ ...mistake, selectedOptionId: 'another-wrong-option' })

    expect(mistakeRepository.getAll()).toHaveLength(1)
  })

  it('tracks a correct retry for the missed question', () => {
    mistakeRepository.recordIncorrect(mistake)
    mistakeRepository.recordCorrect(mistake.testId, mistake.questionId)

    expect(mistakeRepository.getAll()[0].correctRetryCount).toBe(1)
    expect(mistakeRepository.getAll()[0].lastCorrectAt).toBeTruthy()
  })

  it('creates a single-question practice session without affecting full test setup', () => {
    const q1 = sampleQuestions[0]
    useQuizStore.getState().startSingleQuestionPractice(sampleTest, q1)

    const state = useQuizStore.getState()
    expect(state.activeTest?.totalQuestions).toBe(1)
    expect(state.questions).toHaveLength(1)
    expect(state.questions[0].id).toBe(q1.id)
    expect(state.attempt?.mode).toBe('single-question')
    expect(state.attempt?.status).toBe('in_progress')
  })

  it('supports separate QuizMode options via createAttempt', () => {
    const fullTestAttempt = createAttempt(sampleTest, sampleQuestions, { mode: 'full-test' })
    expect(fullTestAttempt.attempt.mode).toBe('full-test')
    expect(fullTestAttempt.questions).toHaveLength(2)

    const singleQAttempt = createAttempt(sampleTest, [sampleQuestions[0]], { mode: 'single-question' })
    expect(singleQAttempt.attempt.mode).toBe('single-question')
    expect(singleQAttempt.questions).toHaveLength(1)

    const mistakeAttempt = createAttempt(sampleTest, [sampleQuestions[0]], { mode: 'mistake-practice' })
    expect(mistakeAttempt.attempt.mode).toBe('mistake-practice')
  })
})
