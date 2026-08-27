import { useEffect } from 'react'

export interface QuizTimerOptions {
  isRunning: boolean
  onTick: () => void
  onExpire?: () => void
  intervalMs?: number
}

export function useQuizTimer({ isRunning, onTick, intervalMs = 1000 }: QuizTimerOptions): void {
  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(onTick, intervalMs)
    const handleVisibilityChange = () => {
      if (!document.hidden) onTick()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [intervalMs, isRunning, onTick])
}
