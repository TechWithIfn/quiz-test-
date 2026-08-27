import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/store/theme.store'
import { Button } from './Button'

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { mode, toggleTheme } = useThemeStore()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
    >
      {mode === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-surface-600 transition-transform duration-200 hover:-rotate-12" />
      )}
    </Button>
  )
}
