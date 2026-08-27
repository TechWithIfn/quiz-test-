import { create } from 'zustand'
import { APP_CONFIG } from '@/config/constants'
import { StorageService } from '@/services/storage.service'

type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  const saved = StorageService.getItem<ThemeMode | null>(APP_CONFIG.storageKeys.theme, null)
  if (saved === 'light' || saved === 'dark') {
    return saved
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function applyThemeToDOM(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Initialize on script evaluation
if (typeof window !== 'undefined') {
  applyThemeToDOM(getInitialTheme())
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: getInitialTheme(),
  toggleTheme: () => {
    set((state) => {
      const nextMode = state.mode === 'dark' ? 'light' : 'dark'
      StorageService.setItem(APP_CONFIG.storageKeys.theme, nextMode)
      applyThemeToDOM(nextMode)
      return { mode: nextMode }
    })
  },
  setTheme: (mode: ThemeMode) => {
    StorageService.setItem(APP_CONFIG.storageKeys.theme, mode)
    applyThemeToDOM(mode)
    set({ mode })
  }
}))
