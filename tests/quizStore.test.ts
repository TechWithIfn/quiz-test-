import { describe, it, expect, beforeEach } from 'vitest'
import { useQuizStore } from '@/store/quiz.store'
import { contentService } from '@/services/content.service'
import { mistakeRepository } from '@/services/mistake.service'

describe('Quiz Store State Machine', () => {
  const tests = contentService.getAllTests()
  const testItem = tests[0]
  const questions = contentService.getQuestionsForTest(testItem.id)

  beforeEach(() => {
    useQuizStore.getState().resetQuizSession()
    mistakeRepository.clear()
  })

  it('initializes a quiz session cleanly', () => {
    const store = useQuizStore.getState()
    store.startTest(testItem, questions)

    const updated = useQuizStore.getState()
    expect(updated.activeTest?.id).toBe(testItem.id)
    expect(updated.questions.length).toBe(questions.length)
    expect(updated.attempt?.status).toBe('in_progress')
    expect(updated.activeQuestionIndex).toBe(0)
  })

  it('selects an answer without writing permanent mistake history', () => {
    const store = useQuizStore.getState()
    store.startTest(testItem, questions)

    const q1 = questions[0]
    const wrongOption = q1.options.find((option) => option.id !== q1.correctOptionId)!
    store.selectOption(q1.id, wrongOption.id)

    const updated = useQuizStore.getState()
    expect(updated.attempt?.answers[q1.id].selectedOptionId).toBe(wrongOption.id)
    expect(mistakeRepository.getAll()).toHaveLength(0)
  })

  it('records only the final wrong answer when submitted', () => {
    const store = useQuizStore.getState()
    store.startTest(testItem, questions)

    const q1 = questions[0]
    const wrongOptions = q1.options.filter((option) => option.id !== q1.correctOptionId)
    store.selectOption(q1.id, wrongOptions[0].id)
    store.selectOption(q1.id, wrongOptions[1]?.id || wrongOptions[0].id)
    store.submitTest()

    const mistakes = mistakeRepository.getAll().filter((mistake) => mistake.questionId === q1.id)
    expect(mistakes).toHaveLength(1)
    expect(mistakes[0].selectedOptionId).toBe(wrongOptions[1]?.id || wrongOptions[0].id)
  })

  it('does not record a mistake when a wrong answer is changed to correct', () => {
    const store = useQuizStore.getState()
    store.startTest(testItem, questions)

    const q1 = questions[0]
    const wrongOption = q1.options.find((option) => option.id !== q1.correctOptionId)!
    store.selectOption(q1.id, wrongOption.id)
    store.selectOption(q1.id, q1.correctOptionId)
    store.submitTest()

    expect(mistakeRepository.getAll()).toHaveLength(0)
  })

  it('keeps mistakes from separate attempts separate', () => {
    const q1 = questions[0]
    const wrongOption = q1.options.find((option) => option.id !== q1.correctOptionId)!

    useQuizStore.getState().startTest(testItem, questions)
    useQuizStore.getState().selectOption(q1.id, wrongOption.id)
    useQuizStore.getState().submitTest()

    useQuizStore.getState().startTest(testItem, questions)
    useQuizStore.getState().selectOption(q1.id, wrongOption.id)
    useQuizStore.getState().submitTest()

    const mistakes = mistakeRepository.getAll().filter((mistake) => mistake.questionId === q1.id)
    expect(mistakes).toHaveLength(2)
    expect(new Set(mistakes.map((mistake) => mistake.attemptId)).size).toBe(2)
  })

  it('marks a previous mistake improved when a later attempt is correct', () => {
    const q1 = questions[0]
    const wrongOption = q1.options.find((option) => option.id !== q1.correctOptionId)!

    useQuizStore.getState().startTest(testItem, questions)
    useQuizStore.getState().selectOption(q1.id, wrongOption.id)
    useQuizStore.getState().submitTest()

    useQuizStore.getState().startTest(testItem, questions)
    useQuizStore.getState().selectOption(q1.id, q1.correctOptionId)
    useQuizStore.getState().submitTest()

    const mistakes = mistakeRepository.getAll().filter((mistake) => mistake.questionId === q1.id)
    expect(mistakes).toHaveLength(1)
    expect(mistakes[0].correctRetryCount).toBe(1)
  })

  it('restores temporary answers after resuming an in-progress attempt', () => {
    const q1 = questions[0]
    const wrongOption = q1.options.find((option) => option.id !== q1.correctOptionId)!
    const store = useQuizStore.getState()
    store.startTest(testItem, questions)
    store.selectOption(q1.id, wrongOption.id)

    useQuizStore.setState({ activeTest: null, questions: [] })
    expect(useQuizStore.getState().resumeTest(testItem, questions)).toBe(true)
    expect(useQuizStore.getState().attempt?.answers[q1.id].selectedOptionId).toBe(wrongOption.id)
    expect(mistakeRepository.getAll()).toHaveLength(0)
  })

  it('toggles mark for review', () => {
    const store = useQuizStore.getState()
    store.startTest(testItem, questions)

    const q1 = questions[0]
    expect(useQuizStore.getState().attempt?.answers[q1.id].isMarkedForReview).toBe(false)

    store.toggleMarkForReview(q1.id)
    expect(useQuizStore.getState().attempt?.answers[q1.id].isMarkedForReview).toBe(true)

    store.toggleMarkForReview(q1.id)
    expect(useQuizStore.getState().attempt?.answers[q1.id].isMarkedForReview).toBe(false)
  })

  it('submits quiz and computes result', () => {
    const store = useQuizStore.getState()
    store.startTest(testItem, questions)

    // Answer first question with correct option
    const q1 = questions[0]
    store.selectOption(q1.id, q1.correctOptionId)

    const result = store.submitTest()
    expect(result).not.toBeNull()
    expect(result?.totalQuestions).toBe(questions.length)
    expect(result?.correctAnswers).toBeGreaterThanOrEqual(1)
    expect(useQuizStore.getState().attempt?.status).toBe('completed')
  })
})
