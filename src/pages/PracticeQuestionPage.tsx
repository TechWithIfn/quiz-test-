import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  HelpCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react'
import { Question, Test } from '@/types'
import { testRepository } from '@/services/test.service'
import { mistakeRepository } from '@/services/mistake.service'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { OptionItem } from '@/features/quiz/OptionItem'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'
import { ErrorState } from '@/components/ui/ErrorState'

export const PracticeQuestionPage: React.FC = () => {
  const { testSlug, questionId } = useParams<{ testSlug: string; questionId: string }>()

  const [test, setTest] = useState<Test | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    if (!testSlug || !questionId) return
    setIsLoading(true)
    setHasLoadError(false)

    testRepository.getTestBySlug(testSlug).then(async (foundTest) => {
      if (!foundTest) {
        setHasLoadError(true)
        setIsLoading(false)
        return
      }
      setTest(foundTest)
      const questions = await testRepository.getQuestionsForTest(foundTest.id)
      const targetQuestion = questions.find((q) => q.id === questionId)
      if (targetQuestion) {
        setQuestion(targetQuestion)
      } else {
        setHasLoadError(true)
      }
      setIsLoading(false)
    }).catch(() => {
      setHasLoadError(true)
      setIsLoading(false)
    })
  }, [testSlug, questionId])

  const handleCheckAnswer = () => {
    if (!selectedOptionId || !question || !test) return
    setIsAnswerRevealed(true)

    if (selectedOptionId === question.correctOptionId) {
      mistakeRepository.recordCorrect(test.id, question.id)
    } else {
      mistakeRepository.recordIncorrect({
        questionId: question.id,
        testId: test.id,
        testSlug: test.slug,
        testTitle: test.title,
        selectedOptionId,
        correctOptionId: question.correctOptionId,
        attemptId: `single_practice_${Date.now()}`,
        questionNumber: 1,
        topic: question.topic,
        difficulty: question.difficulty,
      })
    }
  }

  const handleTryAgain = () => {
    setSelectedOptionId(null)
    setIsAnswerRevealed(false)
    setShowHint(false)
  }

  if (hasLoadError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          message="Could not load this practice question."
          onRetry={() => window.location.reload()}
        />
        <div className="mt-6 text-center">
          <Link to="/practice/mistakes">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Mistakes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading || !test || !question) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-surface-400">
        <div className="inline-block animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-medium">Loading practice question...</p>
      </div>
    )
  }

  const isCorrect = selectedOptionId === question.correctOptionId

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-surface-200 dark:border-surface-800">
        <Link
          to="/practice/mistakes"
          className="inline-flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-900 dark:hover:text-surface-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mistakes</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="brand" size="sm">
            {test.title}
          </Badge>
          {question.topic && (
            <Badge variant="neutral" size="sm">
              {question.topic}
            </Badge>
          )}
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
            Focused Practice Mode
          </span>
        </div>
      </div>

      {/* Main Question Practice Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-sm space-y-6">
        {/* Question Prompt */}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-surface-50 leading-relaxed">
            <MarkdownRenderer content={question.text} />
          </h1>

          {question.codeSnippet && (
            <CodeBlock
              code={question.codeSnippet}
              language={question.codeLanguage || 'typescript'}
              className="my-4"
            />
          )}
        </div>

        {/* Options */}
        <div className="space-y-3" role="radiogroup">
          {question.options.map((option, index) => {
            const isSelected = selectedOptionId === option.id
            const isOptionCorrect = isAnswerRevealed && option.id === question.correctOptionId
            const isOptionWrong = isAnswerRevealed && isSelected && !isOptionCorrect

            return (
              <div key={option.id} className="relative">
                <OptionItem
                  option={option}
                  questionId={question.id}
                  index={index}
                  isSelected={isSelected}
                  onSelect={() => !isAnswerRevealed && setSelectedOptionId(option.id)}
                  disabled={isAnswerRevealed}
                />

                {isOptionCorrect && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct</span>
                  </div>
                )}

                {isOptionWrong && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
                    <XCircle className="w-4 h-4" />
                    <span>Incorrect</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Hint toggle if question has a hint */}
        {!isAnswerRevealed && question.hint && (
          <div className="pt-2">
            {!showHint ? (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need a hint?</span>
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold">Hint: </span>
                {question.hint}
              </div>
            )}
          </div>
        )}

        {/* Action Button: Check Answer or Try Again / Next Options */}
        <div className="pt-4 border-t border-surface-100 dark:border-surface-800 flex flex-wrap items-center justify-between gap-3">
          {!isAnswerRevealed ? (
            <Button
              variant="primary"
              size="md"
              disabled={!selectedOptionId}
              onClick={handleCheckAnswer}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Check Answer
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={handleTryAgain}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Try Again
              </Button>

              <Link to={`/quiz/${test.slug}`}>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Practice Full Test
                </Button>
              </Link>
            </div>
          )}

          <Link to="/practice/mistakes">
            <Button variant="ghost" size="sm">
              Back to Mistakes
            </Button>
          </Link>
        </div>
      </div>

      {/* Answer & Explanation Box when revealed */}
      {isAnswerRevealed && (
        <div
          className={`p-6 rounded-2xl border ${
            isCorrect
              ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
              : 'border-rose-200 bg-rose-50/50 dark:border-rose-900/60 dark:bg-rose-950/20'
          } shadow-sm space-y-4`}
        >
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                  Great job! You answered correctly.
                </h2>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h2 className="text-base font-bold text-rose-900 dark:text-rose-200">
                  Not quite right yet. Review the explanation below:
                </h2>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-surface-200/60 dark:border-surface-700/60">
            <div className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explanation</span>
            </div>
            <div className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
              <MarkdownRenderer content={question.explanation} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
