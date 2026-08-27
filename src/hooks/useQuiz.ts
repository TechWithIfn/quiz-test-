import { useQuizStore } from '@/store/quiz.store'
import { useQuizTimer } from './useQuizTimer'

/** Presentation-facing facade over the framework-agnostic quiz state machine. */
export function useQuiz() {
  const quiz = useQuizStore()
  useQuizTimer({
    isRunning: quiz.attempt?.status === 'in_progress',
    onTick: quiz.tickTimer,
  })
  return quiz
}
