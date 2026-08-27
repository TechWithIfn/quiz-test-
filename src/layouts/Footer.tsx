import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, ShieldCheck, Heart } from 'lucide-react'
import { APP_CONFIG } from '@/config/constants'
import { GithubIcon } from '@/components/icons/GithubIcon'
import { ClearDataModal } from '@/components/ui/ClearDataModal'

export const Footer: React.FC = () => {
  const [showClearModal, setShowClearModal] = React.useState(false)

  return (
    <footer className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Zap className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="font-bold text-base text-surface-900 dark:text-surface-50">
                {APP_CONFIG.name}
              </span>
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-400 max-w-sm leading-relaxed">
              Open-source, privacy-first testing engine. Search any subject, assess yourself instantly, and learn from deep explanations with zero signup friction.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Client-Side • No Cookies • No Tracking • No Login</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-surface-600 dark:text-surface-400">
              <li>
                <Link to="/tests" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  All Tests
                </Link>
              </li>
              <li>
                <Link to="/practice/mistakes" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Practice Mistakes
                </Link>
              </li>
              <li>
                <Link to="/contribute/validate" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Validate a Test
                </Link>
              </li>
              <li>
                <Link to="/tests/create" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Create a Test
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  onClick={() => setShowClearModal(true)}
                >
                  Clear My Local Data
                </button>
              </li>
              <li>
                <Link to="/tests?cat=programming" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Programming
                </Link>
              </li>
              <li>
                <Link to="/tests?cat=data-analytics" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Data & Analytics
                </Link>
              </li>
              <li>
                <Link to="/tests?cat=web-development" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Web Development
                </Link>
              </li>
            </ul>
          </div>

          {/* Project & Community */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
              Open Source
            </h4>
            <ul className="space-y-2 text-xs text-surface-600 dark:text-surface-400">
              <li>
                <Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Philosophy & Architecture
                </Link>
              </li>
              {APP_CONFIG.githubUrl && (
                <li>
                  <a
                    href={APP_CONFIG.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub Repository</span>
                  </a>
                </li>
              )}
              <li>
                <Link to="/about#contributing" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Contribute Questions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-surface-100 dark:border-surface-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-surface-500">
          <p>© {new Date().getFullYear()} QuizFlow. Released under the MIT License.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>for learners worldwide.</span>
          </div>
        </div>
      </div>

      <ClearDataModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
      />
    </footer>
  )
}
