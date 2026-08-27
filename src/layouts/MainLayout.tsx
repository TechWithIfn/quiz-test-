import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { SkipToContent } from '@/components/ui/SkipToContent'

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50 transition-colors">
      <SkipToContent />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
