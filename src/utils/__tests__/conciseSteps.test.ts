import { describe, expect, it } from 'vitest'
import { generateSteps } from '../stepGenerator'

describe('concise Two Sum animation steps', () => {
  it('compresses the standard example into meaningful visual beats', () => {
    const steps = generateSteps([2, 7, 11, 15], 9)

    expect(steps).toHaveLength(6)
    expect(steps.map((step) => step.actionLabel)).toEqual([
      '目标',
      '找 7',
      '记住 2',
      '找 2',
      '配对成功',
      '答案：0、1',
    ])
    expect(steps[2].hashMapState).toEqual([{ key: 2, value: 0, isNew: true }])
    expect(steps[4].highlightedIndices).toEqual([0, 1])
    expect(steps[5].calculation?.expression).toBe('2 + 7')
  })

  it('keeps duplicate values at distinct indices and returns their pair', () => {
    const steps = generateSteps([3, 3], 6)
    const answer = steps.at(-1)

    expect(answer?.highlightedIndices).toEqual([0, 1])
    expect(answer?.actionLabel).toBe('答案：0、1')
    expect(steps[2].hashMapState).toEqual([{ key: 3, value: 0, isNew: true }])
  })

  it('keeps each step focused on at most two array items', () => {
    const steps = generateSteps([2, 7, 11, 15], 9)

    expect(steps.every((step) => step.highlightedIndices.length <= 2)).toBe(true)
  })
})
