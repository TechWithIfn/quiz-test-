import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap, BookOpen, Compass, CircleAlert, Menu, X } from 'lucide-react'
import { APP_CONFIG } from '@/config/constants'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { GithubIcon } from '@/components/icons/GithubIcon'
import { cn } from '@/utils/cn'

export const Header: React.FC = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Explore Tests', path: '/tests', icon: BookOpen },
    { label: 'Practice Mistakes', path: '/practice/mistakes', icon: CircleAlert },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-30 w-full border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group focus-ring rounded-lg p-1 min-w-0" aria-label={`${APP_CONFIG.name} Home`}>
            <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-white" aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight text-surface-900 dark:text-surface-50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                {APP_CONFIG.name}
              </span>
              <span className="text-[10px] text-surface-500 font-medium -mt-1 hidden sm:block">
                Instant • No Login • Free
              </span>
            </div>
          </Link>

          {/* Navigation Links (desktop) */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-ring min-h-[40px]',
                    isActive(link.path)
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                      : 'text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {APP_CONFIG.githubUrl && (
              <a
                href={APP_CONFIG.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex p-2 text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus-ring min-w-[40px] min-h-[40px] items-center justify-center"
                title="View on GitHub"
                aria-label="View QuizFlow on GitHub"
              >
                <GithubIcon className="w-4 h-4" aria-hidden="true" />
              </a>
            )}

            <ThemeToggle />

            <Link to="/tests" className="inline-flex">
              <Button size="sm" variant="primary" leftIcon={<Compass className="w-3.5 h-3.5" aria-hidden="true" />}>
                Browse All Tests
              </Button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 focus-ring min-w-[40px] min-h-[40px]"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-header-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-header-menu"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-2 space-y-1"
        >
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-ring min-h-[44px]',
                  isActive(link.path)
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                    : 'text-surface-700 hover:text-surface-900 dark:text-surface-300 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800'
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
