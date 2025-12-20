import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { generateSteps } from '../../utils/stepGenerator'

/**
 * **Feature: two-sum-visualizer, Property 5: 画布状态一致性**
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
 *
 * For any 算法步骤，画布上显示的数组元素应与inputData.nums一致，
 * 高亮的元素索引应与步骤中的highlightedIndices一致，
 * HashMap显示应与步骤中的hashMapState一致。
 */
describe('Property 5: 画布状态一致性', () => {
  // 生成有效输入的 arbitrary
  const validInputArb = fc
    .tuple(
      fc.integer({ min: 0, max: 15 }),
      fc.integer({ min: -100, max: 100 }),
      fc.integer({ min: -100, max: 100 })
    )
    .chain(([extraLen, a, b]) => {
      const target = a + b
      const baseArray = [a, b]
      return fc
        .array(fc.integer({ min: -100, max: 100 }), { minLength: extraLen, maxLength: extraLen })
        .map((extra) => ({
          nums: [...baseArray, ...extra],
          target,
        }))
    })

  it('每个步骤的数组状态应与输入数组一致', () => {
    fc.assert(
      fc.property(validInputArb, ({ nums, target }) => {
        const steps = generateSteps(nums, target)

        for (const step of steps) {
          // 数组长度应一致
          expect(step.arrayState.length).toBe(nums.length)

          // 每个元素值应一致
          for (let i = 0; i < nums.length; i++) {
            expect(step.arrayState[i].value).toBe(nums[i])
            expect(step.arrayState[i].index).toBe(i)
          }
        }
      }),
      { numRuns: 100 }
    )
  })

  it('高亮的元素索引应与 highlightedIndices 一致', () => {
    fc.assert(
      fc.property(validInputArb, ({ nums, target }) => {
        const steps = generateSteps(nums, target)

        for (const step of steps) {
          // 检查 arrayState 中的 isHighlighted 与 highlightedIndices 一致
          for (let i = 0; i < step.arrayState.length; i++) {
            const shouldBeHighlighted = step.highlightedIndices.includes(i)
            expect(step.arrayState[i].isHighlighted).toBe(shouldBeHighlighted)
          }
        }
      }),
      { numRuns: 100 }
    )
  })

  it('HashMap 状态应正确反映已访问的元素', () => {
    fc.assert(
      fc.property(validInputArb, ({ nums, target }) => {
        const steps = generateSteps(nums, target)

        for (const step of steps) {
          // HashMap 中的每个条目应该是有效的
          for (const entry of step.hashMapState) {
            // key 应该是数组中的某个值
            expect(nums).toContain(entry.key)
            // value 应该是有效的索引
            expect(entry.value).toBeGreaterThanOrEqual(0)
            expect(entry.value).toBeLessThan(nums.length)
            // key 应该等于对应索引的数组值
            expect(nums[entry.value]).toBe(entry.key)
          }
        }
      }),
      { numRuns: 100 }
    )
  })

  it('注解的目标索引应在有效范围内', () => {
    fc.assert(
      fc.property(validInputArb, ({ nums, target }) => {
        const steps = generateSteps(nums, target)

        for (const step of steps) {
          for (const annotation of step.annotations) {
            // 目标索引应在有效范围内（-1 表示全局注解）
            if (annotation.targetIndex !== -1) {
              expect(annotation.targetIndex).toBeGreaterThanOrEqual(0)
              expect(annotation.targetIndex).toBeLessThan(nums.length)
            }
            // 注解文本不应为空
            expect(annotation.text.length).toBeGreaterThan(0)
          }
        }
      }),
      { numRuns: 100 }
    )
  })
})
