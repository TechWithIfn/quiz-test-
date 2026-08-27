import { beforeEach, describe, expect, it } from 'vitest'
import { APP_CONFIG } from '@/config/constants'
import { StorageService } from '@/services/storage.service'
import { useHistoryStore } from '@/store/history.store'
import { useQuizStore } from '@/store/quiz.store'
import { mistakeRepository } from '@/services/mistake.service'

describe('Browser-Local Persistence & Privacy Audit', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useHistoryStore.setState({ results: [], bookmarks: [] })
    useQuizStore.getState().resetQuizSession()
    mistakeRepository.clear()
  })

  it('saves and loads versioned data cleanly', () => {
    StorageService.setItem(APP_CONFIG.storageKeys.history, [{ attemptId: 'attempt-1' }])
    expect(StorageService.getItem(APP_CONFIG.storageKeys.history, [])).toEqual([{ attemptId: 'attempt-1' }])
    expect(window.localStorage.getItem(APP_CONFIG.storageKeys.history)).toContain('"version":1')
  })

  it('verifies that no personal identifiers or tracking telemetry are stored', () => {
    // Save state
    StorageService.setItem(APP_CONFIG.storageKeys.history, [{
      attemptId: 'att-1',
      testId: 'test-1',
      testSlug: 'sql-test',
      testTitle: 'SQL Test',
      totalQuestions: 5,
      answeredQuestions: 5,
      unansweredQuestions: 0,
      correctAnswers: 5,
      incorrectAnswers: 0,
      flaggedQuestions: 0,
      scorePoints: 5,
      maxPoints: 5,
      scorePercentage: 100,
      passed: true,
      passingScorePercentage: 70,
      totalTimeSeconds: 300,
      timeTakenSeconds: 120,
      categoryBreakdown: {},
      startedAt: '2026-01-01',
      completedAt: '2026-01-01',
      answers: {},
    }])

    const raw = window.localStorage.getItem(APP_CONFIG.storageKeys.history) || ''
    expect(raw).not.toContain('name')
    expect(raw).not.toContain('email')
    expect(raw).not.toContain('phone')
    expect(raw).not.toContain('ip')
    expect(raw).not.toContain('fingerprint')
    expect(raw).not.toContain('advertising')
  })

  it('discards corrupted and incompatible values without throwing', () => {
    window.localStorage.setItem(APP_CONFIG.storageKeys.history, '{bad json')
    expect(StorageService.getItem(APP_CONFIG.storageKeys.history, [])).toEqual([])

    window.localStorage.setItem(APP_CONFIG.storageKeys.history, JSON.stringify({ version: 99, data: [{ attemptId: 'old' }] }))
    expect(StorageService.getItem(APP_CONFIG.storageKeys.history, [])).toEqual([])
    expect(window.localStorage.getItem(APP_CONFIG.storageKeys.history)).toBeNull()
  })

  it('clears all user data while preserving unrelated/static keys', () => {
    // Set user data across all stores
    StorageService.setItem(APP_CONFIG.storageKeys.history, [{ attemptId: 'h1' }])
    StorageService.setItem(APP_CONFIG.storageKeys.bookmarks, [{ testSlug: 'b1' }])
    StorageService.setItem(APP_CONFIG.storageKeys.mistakes, [{ id: 'm1' }])
    StorageService.setItem(APP_CONFIG.storageKeys.activeAttempt, { id: 'act1' })
    StorageService.setItem(APP_CONFIG.storageKeys.activeQuestions, [{ id: 'q1' }])
    window.localStorage.setItem('static-question-bank', 'preserve-static-content')

    StorageService.clearLocalData()

    // Assert user keys are deleted
    expect(window.localStorage.getItem(APP_CONFIG.storageKeys.history)).toBeNull()
    expect(window.localStorage.getItem(APP_CONFIG.storageKeys.bookmarks)).toBeNull()
    expect(window.localStorage.getItem(APP_CONFIG.storageKeys.mistakes)).toBeNull()
    expect(window.localStorage.getItem(APP_CONFIG.storageKeys.activeAttempt)).toBeNull()
    expect(window.localStorage.getItem(APP_CONFIG.storageKeys.activeQuestions)).toBeNull()

    // Assert non-app static keys are untouched
    expect(window.localStorage.getItem('static-question-bank')).toBe('preserve-static-content')
  })
})