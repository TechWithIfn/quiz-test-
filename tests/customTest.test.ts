import { beforeEach, describe, expect, it } from 'vitest'
import { RawTest } from '@/types/content'
import { ContentValidatorService } from '@/services/content-validator.service'
import { customTestRepository } from '@/services/custom-test.service'

const customTest: RawTest = {
  id: 'custom-test-1', slug: 'custom-test-one', title: 'Custom Test', shortDescription: 'A custom test',
  category: { id: 'custom', name: 'Custom', slug: 'custom' }, tags: [], difficulty: 'beginner',
  estimatedMinutes: 5, questionCount: 1, language: 'general', createdAt: '2026-01-01',
  questions: [{ id: 'custom-q-1', question: 'Choose one', type: 'single-choice', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctAnswer: 'a', explanation: 'A is correct because it is the selected answer.', difficulty: 'beginner', topic: 'Basics', tags: [] }],
}

describe('custom test authoring', () => {
  beforeEach(() => customTestRepository.delete(customTest.id))

  it('validates and persists a custom test locally', () => {
    expect(ContentValidatorService.validateAll([customTest]).valid).toBe(true)
    customTestRepository.save(customTest)
    expect(customTestRepository.getAll()).toContainEqual(customTest)
  })

  it('removes a custom test without affecting other content', () => {
    customTestRepository.save(customTest)
    customTestRepository.delete(customTest.id)
    expect(customTestRepository.getAll().some((test) => test.id === customTest.id)).toBe(false)
  })

  it('rejects malformed serialized submissions', () => {
    const result = ContentValidatorService.validateSerialized('{ invalid')
    expect(result.valid).toBe(false)
    expect(result.errors[0].field).toBe('submission')
  })
})
