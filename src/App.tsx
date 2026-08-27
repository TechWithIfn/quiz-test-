import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'

// Critical Path Pages (Direct / Eager for instantaneous landing & search)
import { HomePage } from '@/pages/HomePage'
import { TestsCatalogPage } from '@/pages/TestsCatalogPage'
import { TestDetailPage } from '@/pages/TestDetailPage'

// Feature & Secondary Pages (Lazy-loaded chunks)
const QuizTakingPage = lazy(() => import('@/pages/QuizTakingPage').then(m => ({ default: m.QuizTakingPage })))
const QuizResultPage = lazy(() => import('@/pages/QuizResultPage').then(m => ({ default: m.QuizResultPage })))
const QuizReviewPage = lazy(() => import('@/pages/QuizReviewPage').then(m => ({ default: m.QuizReviewPage })))
const PracticeMistakesPage = lazy(() => import('@/pages/PracticeMistakesPage').then(m => ({ default: m.PracticeMistakesPage })))
const PracticeQuestionPage = lazy(() => import('@/pages/PracticeQuestionPage').then(m => ({ default: m.PracticeQuestionPage })))
const AboutPage = lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })))
const ValidateTestPage = lazy(() => import('@/pages/ValidateTestPage').then(m => ({ default: m.ValidateTestPage })))
const CreateTestPage = lazy(() => import('@/pages/CreateTestPage').then(m => ({ default: m.CreateTestPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20 min-h-[40vh]">
      <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Full-width quiz taking focus view */}
          <Route path="/quiz/:testSlug" element={<QuizTakingPage />} />

          {/* Standard layout routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tests" element={<TestsCatalogPage />} />
            <Route path="/tests/:slug" element={<TestDetailPage />} />
            <Route path="/quiz/:testSlug/result" element={<QuizResultPage />} />
            <Route path="/quiz/:testSlug/review" element={<QuizReviewPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/practice/mistakes" element={<PracticeMistakesPage />} />
            <Route path="/practice/:testSlug/:questionId" element={<PracticeQuestionPage />} />
            <Route path="/contribute/validate" element={<ValidateTestPage />} />
            <Route path="/tests/create" element={<CreateTestPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
