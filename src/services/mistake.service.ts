import { MistakeRecord } from '@/types'
import { APP_CONFIG } from '@/config/constants'
import { StorageService } from './storage.service'

export interface MistakeRepository {
  getAll(): MistakeRecord[]
  recordIncorrect(input: Omit<MistakeRecord, 'id' | 'recordedAt' | 'correctRetryCount'>): void
  recordCorrect(testId: string, questionId: string): void
  clear(): void
}

class LocalMistakeRepository implements MistakeRepository {
  getAll(): MistakeRecord[] {
    return StorageService.getItem<MistakeRecord[]>(APP_CONFIG.storageKeys.mistakes, [])
  }

  recordIncorrect(input: Omit<MistakeRecord, 'id' | 'recordedAt' | 'correctRetryCount'>): void {
    const mistakes = this.getAll()
    const existing = mistakes.find((mistake) => mistake.attemptId === input.attemptId && mistake.questionId === input.questionId)
    if (existing) return

    StorageService.setItem(APP_CONFIG.storageKeys.mistakes, [
      {
        ...input,
        id: `mistake_${input.attemptId}_${input.questionId}`,
        recordedAt: new Date().toISOString(),
        correctRetryCount: 0,
      },
      ...mistakes,
    ].slice(0, 200))
  }

  recordCorrect(testId: string, questionId: string): void {
    const mistakes = this.getAll()
    let changed = false
    const updated = mistakes.map((mistake) => {
      if (mistake.testId !== testId || mistake.questionId !== questionId) return mistake
      changed = true
      return {
        ...mistake,
        lastCorrectAt: new Date().toISOString(),
        correctRetryCount: mistake.correctRetryCount + 1,
      }
    })
    if (changed) StorageService.setItem(APP_CONFIG.storageKeys.mistakes, updated)
  }

  clear(): void {
    StorageService.removeItem(APP_CONFIG.storageKeys.mistakes)
  }
}

export const mistakeRepository: MistakeRepository = new LocalMistakeRepository()