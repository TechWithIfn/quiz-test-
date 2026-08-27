import { create } from 'zustand'
import { TestResult, ClientBookmark } from '@/types'
import { APP_CONFIG } from '@/config/constants'
import { StorageService } from '@/services/storage.service'

interface HistoryState {
  results: TestResult[]
  bookmarks: ClientBookmark[]
  saveResult: (result: TestResult) => void
  getResultByAttemptId: (attemptId: string) => TestResult | undefined
  getLatestResultForTest: (testSlug: string) => TestResult | undefined
  toggleBookmark: (testSlug: string) => void
  isBookmarked: (testSlug: string) => boolean
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  results: StorageService.getItem<TestResult[]>(APP_CONFIG.storageKeys.history, []),
  bookmarks: StorageService.getItem<ClientBookmark[]>(APP_CONFIG.storageKeys.bookmarks, []),

  saveResult: (result: TestResult) => {
    set((state) => {
      // Keep most recent first, max 100 entries
      const updated = [result, ...state.results.filter(r => r.attemptId !== result.attemptId)].slice(0, 100)
      StorageService.setItem(APP_CONFIG.storageKeys.history, updated)
      return { results: updated }
    })
  },

  getResultByAttemptId: (attemptId: string) => {
    return get().results.find(r => r.attemptId === attemptId)
  },

  getLatestResultForTest: (testSlug: string) => {
    return get().results.find(r => r.testSlug === testSlug)
  },

  toggleBookmark: (testSlug: string) => {
    set((state) => {
      const exists = state.bookmarks.some(b => b.testSlug === testSlug)
      let updated: ClientBookmark[]
      if (exists) {
        updated = state.bookmarks.filter(b => b.testSlug !== testSlug)
      } else {
        updated = [{ testSlug, bookmarkedAt: new Date().toISOString() }, ...state.bookmarks]
      }
      StorageService.setItem(APP_CONFIG.storageKeys.bookmarks, updated)
      return { bookmarks: updated }
    })
  },

  isBookmarked: (testSlug: string) => {
    return get().bookmarks.some(b => b.testSlug === testSlug)
  },

  clearHistory: () => {
    StorageService.removeItem(APP_CONFIG.storageKeys.history)
    set({ results: [] })
  }
}))
