import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { generateSteps, getResultFromSteps } from '../stepGenerator'

/**
 * **Feature: two-sum-visualizer, Property 8: 算法步骤生成正确性**
 * **Validates: Requirements 6.1, 6.2, 6.3**
 *
 * For any 合法的输入数据（nums和target），生成的步骤序列的最后一步
 * 应包含正确的结果（两个下标i和j，使得nums[i] + nums[j] === target）。
 */
describe('Property 8: 算法步骤生成正确性', () => {
  // 生成有效解的数组
  const validInputArb = fc
    .tuple(
      fc.integer({ min: 0, max: 20 }), // 额外元素数量
      fc.integer({ min: -100, max: 100 }), // 第一个数
      fc.integer({ min: -100, max: 100 }) // 第二个数
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

  it('生成的步骤序列最后一步应包含正确的结果', () => {
    fc.assert(
      fc.property(validInputArb, ({ nums, target }) => {
        const steps = generateSteps(nums, target)
        const result = getResultFromSteps(steps)

        // 应该找到结果
        expect(result).not.toBeNull()

        if (result) {
          const [i, j] = result
          // 验证结果正确性
          expect(nums[i] + nums[j]).toBe(target)
          // 验证索引不同
          expect(i).not.toBe(j)
          // 验证索引在有效范围内
          expect(i).toBeGreaterThanOrEqual(0)
          expect(i).toBeLessThan(nums.length)
          expect(j).toBeGreaterThanOrEqual(0)
          expect(j).toBeLessThan(nums.length)
        }
      }),
      { numRuns: 100 }
    )
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

  it('高亮的元素索引应在有效范围内', () => {
    fc.assert(
      fc.property(validInputArb, ({ nums, target }) => {
        const steps = generateSteps(nums, target)

        for (const step of steps) {
          for (const idx of step.highlightedIndices) {
            expect(idx).toBeGreaterThanOrEqual(0)
            expect(idx).toBeLessThan(nums.length)
          }
        }
      }),
      { numRuns: 100 }
    )
  })

  it('HashMap 状态应正确反映算法执行过程', () => {
    fc.assert(
      fc.property(validInputArb, ({ nums, target }) => {
        const steps = generateSteps(nums, target)

        // HashMap 应该逐步增长（除了找到结果后）
        let prevSize = 0
        for (const step of steps) {
          // HashMap 大小应该单调不减
          expect(step.hashMapState.length).toBeGreaterThanOrEqual(prevSize)
          prevSize = step.hashMapState.length
        }
      }),
      { numRuns: 100 }
    )
  })
})
