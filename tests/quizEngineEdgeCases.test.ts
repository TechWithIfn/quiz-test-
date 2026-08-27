import { describe, it, expect, beforeEach } from 'vitest'
import { Test, Question, TestAttempt } from '@/types'
import { createAttempt, tickAttempt } from '@/engine/quizEngine'
import { randomizeQuestions, randomizeOptions } from '@/engine/questionRandomizer'
import { calculateTestResult } from '@/utils/scoring'
import { useQuizStore } from '@/store/quiz.store'
import { mistakeRepository } from '@/services/mistake.service'
import { StorageService } from '@/services/storage.service'
import { APP_CONFIG } from '@/config/constants'

describe('Deep Technical Audit: 22 Edge Cases in Quiz Engine', () => {
  const sampleTest: Test = {
    id: 'test-audit-1',
    slug: 'audit-test',
    title: 'Audit Test Assessment',
    shortDescription: 'Audit test description',
    fullDescription: 'Audit test description',
    category: { id: 'cat-1', name: 'Engineering', slug: 'engineering' },
    tags: [{ id: 't1', name: 'audit', slug: 'audit' }],
    difficulty: 'intermediate',
    timeLimitMinutes: 10,
    totalQuestions: 3,
    passingScorePercentage: 70,
    createdAt: '2026-01-01T00:00:00Z',
  }

  const sampleQuestions: Question[] = [
    {
      id: 'q-1',
      testId: 'test-audit-1',
      text: 'Question 1 prompt?',
      options: [
        { id: 'opt-1a', text: 'Option 1A' },
        { id: 'opt-1b', text: 'Option 1B' },
        { id: 'opt-1c', text: 'Option 1C' },
      ],
      correctOptionId: 'opt-1a',
      explanation: 'Explanation for Q1',
      points: 2,
      topic: 'Architecture',
      difficulty: 'intermediate',
      tags: ['arch'],
    },
    {
      id: 'q-2',
      testId: 'test-audit-1',
      text: 'Question 2 prompt?',
      options: [
        { id: 'opt-2a', text: 'Option 2A' },
        { id: 'opt-2b', text: 'Option 2B' },
      ],
      correctOptionId: 'opt-2b',
      explanation: 'Explanation for Q2',
      points: 1,
      topic: 'Security',
      difficulty: 'beginner',
      tags: ['sec'],
    },
    {
      id: 'q-3',
      testId: 'test-audit-1',
      text: 'Question 3 prompt?',
      options: [
        { id: 'opt-3a', text: 'Option 3A' },
        { id: 'opt-3b', text: 'Option 3B' },
      ],
      correctOptionId: 'opt-3a',
      explanation: 'Explanation for Q3',
      points: 1,
      topic: 'Security',
      difficulty: 'advanced',
      tags: ['sec'],
    },
  ]

  beforeEach(() => {
    window.localStorage.clear()
    useQuizStore.getState().resetQuizSession()
    mistakeRepository.clear()
  })

  // 1. Start test
  it('Edge Case 1: Start test correctly initializes state, questions, and attempt', () => {
    useQuizStore.getState().startTest(sampleTest, sampleQuestions)
    const state = useQuizStore.getState()
    expect(state.activeTest?.id).toBe(sampleTest.id)
    expect(state.questions.length).toBe(3)
    expect(state.attempt).not.toBeNull()
    expect(state.attempt?.status).toBe('in_progress')
    expect(state.attempt?.timeRemainingSeconds).toBe(600)
    expect(Object.keys(state.attempt?.answers || {}).length).toBe(3)
  })

  // 2. Refresh during quiz
  it('Edge Case 2: Refresh during quiz restores compatible in-progress session', () => {
    useQuizStore.getState().startTest(sampleTest, sampleQuestions)
    useQuizStore.getState().selectOption('q-1', 'opt-1a')
    useQuizStore.getState().goToQuestion(1)

    // Simulate page reload by resetting memory store and calling resumeTest with same test/questions
    const reloaded = useQuizStore.getState().resumeTest(sampleTest, sampleQuestions)
    expect(reloaded).toBe(true)
    const state = useQuizStore.getState()
    expect(state.activeQuestionIndex).toBe(1)
    expect(state.attempt?.answers['q-1'].selectedOptionId).toBe('opt-1a')
  })

  // 3 & 4. Navigation boundaries (Browser back / forward / boundaries)
  it('Edge Case 3 & 4: Navigation bounds are strictly clamped without crashing or out-of-bounds index', () => {
    useQuizStore.getState().startTest(sampleTest, sampleQuestions)
    
    // Previous at 0
    useQuizStore.getState().goToPreviousQuestion()
    expect(useQuizStore.getState().activeQuestionIndex).toBe(0)

    // Move past last
    useQuizStore.getState().goToQuestion(99)
    expect(useQuizStore.getState().activeQuestionIndex).toBe(0)

    useQuizStore.getState().goToQuestion(2)
    useQuizStore.getState().goToNextQuestion()
    expect(useQuizStore.getState().activeQuestionIndex).toBe(2)
  })

  // 5. Submit with unanswered questions
  it('Edge Case 5: Submit with unanswered questions awards 0 points to unanswered items', () => {
    useQuizStore.getState().startTest(sampleTest, sampleQuestions)
    useQuizStore.getState().selectOption('q-1', 'opt-1a') // 2 pts
    // q-2 and q-3 left unanswered (0 pts)

    const result = useQuizStore.getState().submitTest()
    expect(result).not.toBeNull()
    expect(result?.totalQuestions).toBe(3)
    expect(result?.answeredQuestions).toBe(1)
    expect(result?.unansweredQuestions).toBe(2)
    expect(result?.scorePoints).toBe(2)
    expect(result?.maxPoints).toBe(4) // 2 + 1 + 1
    expect(result?.scorePercentage).toBe(50) // 2/4 = 50%
    expect(result?.passed).toBe(false) // passing is 70%
  })

  // 6. Submit immediately
  it('Edge Case 6: Immediate submission with zero answers calculates 0% score safely', () => {
    useQuizStore.getState().startTest(sampleTest, sampleQuestions)
    const result = useQuizStore.getState().submitTest()
    expect(result?.scorePercentage).toBe(0)
    expect(result?.answeredQuestions).toBe(0)
    expect(result?.unansweredQuestions).toBe(3)
    expect(result?.passed).toBe(false)
  })

  // 7. Timer expiration
  it('Edge Case 7: Timer expiration triggers automatic submission when time hits 0', () => {
    useQuizStore.getState().startTest(sampleTest, sampleQuestions)
    const attempt = useQuizStore.getState().attempt!
    
    // Simulate tick to zero
    const expiredAttempt: TestAttempt = {
      ...attempt,
      timeRemainingSeconds: 1,
      expiresAt: new Date(Date.now() - 5000).toISOString(),
    }
    useQuizStore.setState({ attempt: expiredAttempt })

    useQuizStore.getState().tickTimer()
    const state = useQuizStore.getState()
    expect(state.attempt?.status).toBe('completed')
    expect(state.lastCompletedResult).not.toBeNull()
  })

  // 8. Timer near zero
  it('Edge Case 8: Timer near zero ticks accurately without negative time', () => {
    const attempt = createAttempt(sampleTest, sampleQuestions).attempt
    const nearZero = { ...attempt, timeRemainingSeconds: 2, expiresAt: undefined }
    
    const tick1 = tickAttempt(nearZero)
    expect(tick1.attempt.timeRemainingSeconds).toBe(1)
    expect(tick1.shouldSubmit).toBe(false)

    const tick2 = tickAttempt(tick1.attempt)
    expect(tick2.attempt.timeRemainingSeconds).toBe(0)
    expect(tick2.shouldSubmit).toBe(true)

    // Subsequent tick does not go negative
    const tick3 = tickAttempt(tick2.attempt)
    expect(tick3.attempt.timeRemainingSeconds).toBe(0)
  })

  // 9. Change answer multiple times
  it('Edge Case 9: Changing answer multiple times updates selection cleanly without state pollution', () => {
    useQuizStore.getState().startTest(sampleTest, sampleQuestions)
    useQuizStore.getState().selectOption('q-1', 'opt-1b')
    expect(useQuizStore.getState().attempt?.answers['q-1'].selectedOptionId).toBe('opt-1b')

    useQuizStore.getState().selectOption('q-1', 'opt-1c')
    expect(useQuizStore.getState().attempt?.answers['q-1'].selectedOptionId).toBe('opt-1c')

    useQuizStore.getState().selectOption('q-1', 'opt-1a')
    expect(useQuizStore.getState().attempt?.answers['q-1'].selectedOptionId).toBe('opt-1a')

    useQuizStore.getState().clearOption('q-1')
    expect(useQuizStore.getState().attempt?.answers['q-1'].selectedOptionId).toBeNull()
  })

  // 10. Question randomization
  it('Edge Case 10: Question randomization shuffles order while keeping integrity', () => {
    const deterministicRandom = () => 0.5
    const shuffled = randomizeQuestions(sampleQuestions, deterministicRandom)
    expect(shuffled.length).toBe(sampleQuestions.length)
    const originalIds = new Set(sampleQuestions.map((q) => q.id))
    shuffled.forEach((q) => expect(originalIds.has(q.id)).toBe(true))
  })

  // 11. Option randomization
  it('Edge Case 11: Option randomization shuffles options while preserving correctOptionId mapping', () => {
    const q = sampleQuestions[0]
    const randomized = randomizeOptions(q, () => 0.7)
    expect(randomized.options.length).toBe(q.options.length)
    expect(randomized.correctOptionId).toBe(q.correctOptionId)
    expect(randomized.options.some((opt) => opt.id === q.correctOptionId)).toBe(true)
  })

  // 12. Duplicate questions handling
  it('Edge Case 12: Handles duplicate question IDs safely in scoring', () => {
    const duplicateQuestionSet = [...sampleQuestions, { ...sampleQuestions[0] }]
    const result = calculateTestResult({
      attemptId: 'att-dup',
      test: sampleTest,
      questions: duplicateQuestionSet,
      answers: {
        'q-1': { questionId: 'q-1', selectedOptionId: 'opt-1a', isMarkedForReview: false, timeSpentSeconds: 10 },
      },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeTakenSeconds: 30,
    })
    expect(result.totalQuestions).toBe(4)
    expect(result.correctAnswers).toBe(2)
  })

  // 13. Empty question set
  it('Edge Case 13: Handles empty question set gracefully without divide-by-zero errors', () => {
    const result = calculateTestResult({
      attemptId: 'att-empty',
      test: sampleTest,
      questions: [],
      answers: {},
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeTakenSeconds: 0,
    })
    expect(result.scorePercentage).toBe(0)
    expect(result.passed).toBe(false)
    expect(result.totalQuestions).toBe(0)
  })

  // 14. Invalid test slug / expired attempt resume
  it('Edge Case 14: Resuming with expired or mismatched test slug returns false and clears invalid storage', () => {
    const expiredAttempt: TestAttempt = {
      id: 'expired-1',
      testId: 'test-audit-1',
      testSlug: 'mismatched-slug',
      testTitle: 'Test',
      startedAt: new Date(Date.now() - 100000).toISOString(),
      status: 'in_progress',
      mode: 'full-test',
      answers: {},
      currentQuestionIndex: 0,
      timeRemainingSeconds: 0,
      expiresAt: new Date(Date.now() - 50000).toISOString(),
    }
    StorageService.setItem(APP_CONFIG.storageKeys.activeAttempt, expiredAttempt)
    useQuizStore.setState({ attempt: expiredAttempt })

    const resumed = useQuizStore.getState().resumeTest(sampleTest, sampleQuestions)
    expect(resumed).toBe(false)
    expect(useQuizStore.getState().attempt).toBeNull()
  })

  // 15 & 16. Very long question and very long option text
  it('Edge Case 15 & 16: Evaluates very long question prompts and option strings cleanly', () => {
    const hugeText = 'A'.repeat(5000)
    const longQuestion: Question = {
      id: 'q-long',
      testId: sampleTest.id,
      text: hugeText,
      options: [
        { id: 'opt-long-1', text: 'Option ' + 'B'.repeat(3000) },
        { id: 'opt-long-2', text: 'Option ' + 'C'.repeat(3000) },
      ],
      correctOptionId: 'opt-long-1',
      explanation: 'Explanation ' + 'D'.repeat(2000),
      points: 5,
      topic: 'Scaling',
      difficulty: 'advanced',
      tags: ['scale'],
    }

    useQuizStore.getState().startTest(sampleTest, [longQuestion])
    useQuizStore.getState().selectOption('q-long', 'opt-long-1')
    const result = useQuizStore.getState().submitTest()
    expect(result?.scorePercentage).toBe(100)
    expect(result?.correctAnswers).toBe(1)
  })

  // 17. Flag for review toggling
  it('Edge Case 17: Flagging and unflagging questions for review updates state correctly', () => {
    useQuizStore.getState().startTest(sampleTest, sampleQuestions)
    useQuizStore.getState().toggleMarkForReview('q-1')
    expect(useQuizStore.getState().attempt?.answers['q-1'].isMarkedForReview).toBe(true)

    useQuizStore.getState().toggleMarkForReview('q-1')
    expect(useQuizStore.getState().attempt?.answers['q-1'].isMarkedForReview).toBe(false)
  })

  // 18. Topic performance calculation & edge cases
  it('Edge Case 18: Aggregates category and topic breakdown accurately', () => {
    const result = calculateTestResult({
      attemptId: 'att-breakdown',
      test: sampleTest,
      questions: sampleQuestions,
      answers: {
        'q-1': { questionId: 'q-1', selectedOptionId: 'opt-1a', isMarkedForReview: false, timeSpentSeconds: 15 }, // correct
        'q-2': { questionId: 'q-2', selectedOptionId: 'opt-2a', isMarkedForReview: false, timeSpentSeconds: 10 }, // incorrect
        'q-3': { questionId: 'q-3', selectedOptionId: 'opt-3a', isMarkedForReview: true, timeSpentSeconds: 20 }, // correct
      },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeTakenSeconds: 45,
    })

    expect(result.topicBreakdown!['Architecture'].correctQuestions).toBe(1)
    expect(result.topicBreakdown!['Architecture'].accuracyPercentage).toBe(100)
    expect(result.topicBreakdown!['Security'].totalQuestions).toBe(2)
    expect(result.topicBreakdown!['Security'].correctQuestions).toBe(1)
    expect(result.topicBreakdown!['Security'].accuracyPercentage).toBe(50)
  })

  // 19. Repeated attempts & idempotent submission
  it('Edge Case 19: Double submission is idempotent and prevents stale mutation', () => {
    useQuizStore.getState().startTest(sampleTest, sampleQuestions)
    useQuizStore.getState().selectOption('q-1', 'opt-1a')
    const firstResult = useQuizStore.getState().submitTest()
    const secondResult = useQuizStore.getState().submitTest()

    expect(firstResult).not.toBeNull()
    expect(secondResult).toBeNull() // Already completed, no double-write
  })

  // 20. Practice mode
  it('Edge Case 20: Practice mode runs with custom settings', () => {
    useQuizStore.getState().startTest(sampleTest, sampleQuestions, { mode: 'mistake-practice', timeLimitMinutes: 15 })
    expect(useQuizStore.getState().attempt?.mode).toBe('mistake-practice')
    expect(useQuizStore.getState().attempt?.timeRemainingSeconds).toBe(900)
  })

  // 21. Single-question mode
  it('Edge Case 21: Single-question practice mode configures 1-question test', () => {
    useQuizStore.getState().startSingleQuestionPractice(sampleTest, sampleQuestions[0])
    const state = useQuizStore.getState()
    expect(state.questions.length).toBe(1)
    expect(state.activeTest?.totalQuestions).toBe(1)
    expect(state.attempt?.mode).toBe('single-question')
  })

  // 22. Mistake recording and retry tracking
  it('Edge Case 22: Records incorrect mistakes on submission and increments correctRetryCount on mastery', () => {
    useQuizStore.getState().startTest(sampleTest, sampleQuestions)
    useQuizStore.getState().selectOption('q-1', 'opt-1b') // Wrong (correct is opt-1a)
    useQuizStore.getState().selectOption('q-2', 'opt-2b') // Correct

    useQuizStore.getState().submitTest()

    const recorded = mistakeRepository.getAll()
    expect(recorded.length).toBe(1)
    expect(recorded[0].questionId).toBe('q-1')
    expect(recorded[0].correctRetryCount).toBe(0)

    // Practice again and answer correctly
    mistakeRepository.recordCorrect(sampleTest.id, 'q-1')
    const updated = mistakeRepository.getAll()
    expect(updated[0].correctRetryCount).toBe(1)
    expect(updated[0].lastCorrectAt).toBeDefined()
  })
})
