import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong while loading this page.',
  onRetry,
}) => (
  <div role="alert" className="mx-auto max-w-md px-4 py-20 text-center">
    <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
    <h2 className="mt-4 text-lg font-semibold text-surface-900 dark:text-surface-100">We could not load this</h2>
    <p className="mt-2 text-sm text-surface-500">{message}</p>
    {onRetry && (
      <Button className="mt-5" variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />}>
        Try again
      </Button>
    )}
  </div>
)
