import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { generateSteps, TWO_SUM_CODE } from '../../utils/stepGenerator'

/**
 * **Feature: two-sum-visualizer, Property 4: 代码调试器状态一致性**
 * **Validates: Requirements 4.1, 4.2**
 *
 * For any 算法步骤，代码调试器高亮的行号应与步骤中指定的currentLine一致，
 * 显示的变量值应与步骤中的variables状态一致。
 */
describe('Property 4: 代码调试器状态一致性', () => {
  const codeLines = TWO_SUM_CODE.split('\n')
  const totalLines = codeLines.length

  // 生成有效输入的 arbitrary
  const validInputArb = fc
    .tuple(
      fc.integer({ min: 0, max: 10 }),
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

  it('每个步骤的 currentLine 应在代码行范围内', () => {
    fc.assert(
      fc.property(validInputArb, ({ nums, target }) => {
        const steps = generateSteps(nums, target)

        for (const step of steps) {
          expect(step.currentLine).toBeGreaterThanOrEqual(1)
          expect(step.currentLine).toBeLessThanOrEqual(totalLines)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('每个步骤的变量状态应包含有效的行号', () => {
    fc.assert(
      fc.property(validInputArb, ({ nums, target }) => {
        const steps = generateSteps(nums, target)

        for (const step of steps) {
          for (const variable of step.variables) {
            expect(variable.line).toBeGreaterThanOrEqual(1)
            expect(variable.line).toBeLessThanOrEqual(totalLines)
          }
        }
      }),
      { numRuns: 100 }
    )
  })

  it('变量值应与步骤描述一致', () => {
    fc.assert(
      fc.property(validInputArb, ({ nums, target }) => {
        const steps = generateSteps(nums, target)

        for (const step of steps) {
          // 检查变量 i 的值
          const iVar = step.variables.find((v) => v.name === 'i')
          if (iVar) {
            const iValue = parseInt(iVar.value)
            expect(iValue).toBeGreaterThanOrEqual(0)
            expect(iValue).toBeLessThan(nums.length)
          }

          // 检查变量 complement 的值
          const complementVar = step.variables.find((v) => v.name === 'complement')
          if (complementVar && iVar) {
            const i = parseInt(iVar.value)
            const expectedComplement = target - nums[i]
            expect(parseInt(complementVar.value)).toBe(expectedComplement)
          }
        }
      }),
      { numRuns: 100 }
    )
  })

  it('步骤的变量状态应随算法进展而更新', () => {
    fc.assert(
      fc.property(validInputArb, ({ nums, target }) => {
        const steps = generateSteps(nums, target)

        // 跳过初始化步骤
        const iterationSteps = steps.filter((s) => s.variables.some((v) => v.name === 'i'))

        // 检查 i 的值是否递增
        let lastI = -1
        for (const step of iterationSteps) {
          const iVar = step.variables.find((v) => v.name === 'i')
          if (iVar) {
            const currentI = parseInt(iVar.value)
            expect(currentI).toBeGreaterThanOrEqual(lastI)
            lastI = currentI
          }
        }
      }),
      { numRuns: 100 }
    )
  })
})
