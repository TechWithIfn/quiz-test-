import React from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, Home, Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto py-24">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-surface-900 dark:text-surface-50">
        404
      </h1>
      <h2 className="mt-2 text-lg font-semibold text-surface-800 dark:text-surface-200">
        Page Not Found
      </h2>
      <p className="mt-2 text-xs sm:text-sm text-surface-500 max-w-sm">
        The test or page you are looking for might have been moved or does not exist.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Home
          </Button>
        </Link>
        <Link to="/tests">
          <Button variant="primary" size="md" leftIcon={<Compass className="w-4 h-4" />}>
            Explore Tests
          </Button>
        </Link>
      </div>
    </div>
  )
}
