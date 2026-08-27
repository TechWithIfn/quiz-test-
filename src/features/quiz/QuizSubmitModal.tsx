import React from 'react'
import { AlertCircle, CheckCircle2, Bookmark } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Answer, Question } from '@/types'

export interface QuizSubmitModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmSubmit: () => void
  questions: Question[]
  answers: Record<string, Answer>
}

export const QuizSubmitModal: React.FC<QuizSubmitModalProps> = ({
  isOpen,
  onClose,
  onConfirmSubmit,
  questions,
  answers,
}) => {
  const total = questions.length
  let answered = 0
  let flagged = 0

  for (const q of questions) {
    const ans = answers[q.id]
    if (ans && ans.selectedOptionId !== null) {
      answered++
    }
    if (ans?.isMarkedForReview) {
      flagged++
    }
  }

  const unanswered = Math.max(0, total - answered)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Test Assessment?"
      description="Review your attempt summary before final submission."
      maxWidth="md"
    >
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{answered}</div>
            <div className="text-[11px] text-emerald-600/80">Answered</div>
          </div>

          <div className="p-3 rounded-lg bg-surface-100 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 text-center">
            <AlertCircle className="w-5 h-5 text-surface-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-surface-700 dark:text-surface-200">{unanswered}</div>
            <div className="text-[11px] text-surface-500">Unanswered</div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-center">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{flagged}</div>
            <div className="text-[11px] text-amber-600/80">Flagged</div>
          </div>
        </div>

        {unanswered > 0 && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>You still have {unanswered} unanswered question{unanswered > 1 ? 's' : ''}. Unanswered questions will receive 0 points.</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="outline" size="md" onClick={onClose}>
          Return to Test
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onConfirmSubmit}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500"
        >
          Confirm Submission
        </Button>
      </div>
    </Modal>
  )
}
