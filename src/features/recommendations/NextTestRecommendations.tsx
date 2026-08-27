import React, { useEffect, useState } from 'react'
import { Compass } from 'lucide-react'
import { testRepository } from '@/services/test.service'
import { TestCard } from '@/features/tests/TestCard'
import { useHistoryStore } from '@/store/history.store'
import { getRecommendations, recommendationReasonLabel, Recommendation } from '@/services/recommendation.service'

export interface NextTestRecommendationsProps {
  currentTestSlug: string
  className?: string
}

export const NextTestRecommendations: React.FC<NextTestRecommendationsProps> = ({
  currentTestSlug,
  className,
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const results = useHistoryStore((state) => state.results)

  useEffect(() => {
    let isMounted = true
    const loadRecommendations = async () => {
      const currentTest = await testRepository.getTestBySlug(currentTestSlug)
      if (!currentTest) return
      const allTests = await testRepository.getAllTests()
      const questionEntries = await Promise.all(allTests.map(async (test) => [
        test.id,
        await testRepository.getQuestionsForTest(test.id),
      ] as const))
      const questionsByTestId = Object.fromEntries(questionEntries)
      const next = getRecommendations({
        currentTest,
        allTests,
        currentQuestions: questionsByTestId[currentTest.id],
        results,
        questionsByTestId,
        limit: 3,
      })
      if (isMounted) setRecommendations(next)
    }
    loadRecommendations()
    return () => {
      isMounted = false
    }
  }, [currentTestSlug, results])

  if (recommendations.length === 0) return null

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50">
            Recommended Next Tests
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map(({ test, reason }) => (
          <div key={test.id}>
            <p className="mb-2 text-xs font-medium text-surface-500">{recommendationReasonLabel(reason)}</p>
            <TestCard test={test} />
          </div>
        ))}
      </div>
    </div>
  )
}
