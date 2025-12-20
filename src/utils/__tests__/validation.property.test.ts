import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { validateInput, hasSolution } from '../validation'

/**
 * **Feature: two-sum-visualizer, Property 7: 数据验证正确性**
 * **Validates: Requirements 7.5, 7.6**
 *
 * For any 输入数据，验证函数应正确判断：数组长度是否在有效范围内，
 * 元素值是否在有效范围内，是否存在有效解。对于不合法输入应返回错误信息。
 */
describe('Property 7: 数据验证正确性', () => {
  // 生成有效解的数组
  const validInputArb = fc
    .tuple(
      fc.integer({ min: 0, max: 9998 }), // 数组长度 - 2
      fc.integer({ min: -1e8, max: 1e8 }), // 第一个数
      fc.integer({ min: -1e8, max: 1e8 }) // 第二个数
    )
    .chain(([extraLen, a, b]) => {
      const target = a + b
      const baseArray = [a, b]
      return fc
        .array(fc.integer({ min: -1e8, max: 1e8 }), { minLength: extraLen, maxLength: extraLen })
        .map((extra) => ({
          nums: [...baseArray, ...extra],
          target,
        }))
    })

  it('对于有效输入应返回 isValid: true', () => {
    fc.assert(
      fc.property(validInputArb, (data) => {
        const result = validateInput(data)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      }),
      { numRuns: 100 }
    )
  })

  it('对于数组长度小于2的输入应返回错误', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -1e8, max: 1e8 }), { minLength: 0, maxLength: 1 }),
        fc.integer(),
        (nums, target) => {
          const result = validateInput({ nums, target })
          expect(result.isValid).toBe(false)
          expect(result.error).toBe('数组长度必须至少为2')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('对于元素值超出范围的输入应返回错误', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer({ min: 1e9 + 1, max: 1e10 }), fc.integer({ min: -1e10, max: -1e9 - 1 })),
        (outOfRangeValue) => {
          const result = validateInput({
            nums: [outOfRangeValue, 1],
            target: outOfRangeValue + 1,
          })
          expect(result.isValid).toBe(false)
          expect(result.error).toBe('元素值必须在-10^9到10^9之间')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('对于无有效解的输入应返回错误', () => {
    // 生成一个不可能有解的数组：所有元素相同且 target 不等于 2*element
    fc.assert(
      fc.property(
        fc.integer({ min: -1e8, max: 1e8 }),
        fc.integer({ min: 2, max: 100 }),
        (element, len) => {
          const nums = Array(len).fill(element)
          const target = element * 2 + 1 // 确保无解
          const result = validateInput({ nums, target })
          expect(result.isValid).toBe(false)
          expect(result.error).toBe('输入数据不存在有效解')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('hasSolution 对于有解的数组应返回 true', () => {
    fc.assert(
      fc.property(validInputArb, (data) => {
        expect(hasSolution(data.nums, data.target)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })
})
