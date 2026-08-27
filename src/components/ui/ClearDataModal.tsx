import React, { useState } from 'react'
import { Trash2, ShieldCheck, Check } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { StorageService } from '@/services/storage.service'
import { useHistoryStore } from '@/store/history.store'
import { useQuizStore } from '@/store/quiz.store'
import { mistakeRepository } from '@/services/mistake.service'

export interface ClearDataModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({ isOpen, onClose }) => {
  const [includePreferences, setIncludePreferences] = useState(false)
  const [cleared, setCleared] = useState(false)

  const handleClear = () => {
    // Clear all stores in memory and in localStorage
    StorageService.clearLocalData()
    if (!includePreferences) {
      // Re-save default theme if preference preservation was chosen
    }

    useHistoryStore.setState({ results: [], bookmarks: [] })
    useQuizStore.getState().resetQuizSession()
    mistakeRepository.clear()

    setCleared(true)
    setTimeout(() => {
      setCleared(false)
      onClose()
      window.location.reload()
    }, 900)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Clear My Local Data"
      description="Delete test progress, history, mistakes, and bookmarks saved on this device."
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60 text-xs text-surface-600 dark:text-surface-300 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Guarantee</span>
          </div>
          <p>
            No account required. Optional progress is stored in your browser. QuizFlow never collects names, emails, phone numbers, IP addresses, device fingerprints, or advertising trackers.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
            This action will permanently remove:
          </p>
          <ul className="text-xs text-surface-600 dark:text-surface-300 space-y-1.5 list-disc list-inside">
            <li>Completed test attempt results & scores</li>
            <li>Bookmarked tests</li>
            <li>Recorded mistakes and retry counters</li>
            <li>Unfinished/in-progress test session states</li>
            <li>Locally created custom tests (if any)</li>
          </ul>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2.5 text-xs text-surface-700 dark:text-surface-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includePreferences}
              onChange={(e) => setIncludePreferences(e.target.checked)}
              className="rounded border-surface-300 text-brand-600 focus:ring-brand-500 dark:border-surface-700 dark:bg-surface-800"
            />
            <span>Also reset theme & display preferences</span>
          </label>
        </div>

        <div className="pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={cleared}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleClear}
            disabled={cleared}
            leftIcon={cleared ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
          >
            {cleared ? 'Cleared!' : 'Confirm & Clear Data'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
