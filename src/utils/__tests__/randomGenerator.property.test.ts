import { describe, it, expect } from 'vitest'
import { generateRandomData } from '../randomGenerator'
import { hasSolution } from '../validation'

/**
 * **Feature: two-sum-visualizer, Property 6: 随机数据合法性**
 * **Validates: Requirements 7.4**
 *
 * For any 随机生成的测试数据，应满足：数组长度在2到10000之间，
 * 数组元素在-10^9到10^9之间，存在唯一有效解。
 */
describe('Property 6: 随机数据合法性', () => {
  it('生成的数据应满足所有合法性要求', () => {
    // 运行100次测试
    for (let i = 0; i < 100; i++) {
      const data = generateRandomData()

      // 数组长度在2到10000之间
      expect(data.nums.length).toBeGreaterThanOrEqual(2)
      expect(data.nums.length).toBeLessThanOrEqual(10000)

      // 数组元素在有效范围内
      for (const num of data.nums) {
        expect(num).toBeGreaterThanOrEqual(-1e9)
        expect(num).toBeLessThanOrEqual(1e9)
      }

      // 存在有效解
      expect(hasSolution(data.nums, data.target)).toBe(true)
    }
  })

  it('生成的数据应有唯一有效解', () => {
    for (let i = 0; i < 100; i++) {
      const data = generateRandomData()
      const solutions: [number, number][] = []

      // 找出所有解
      for (let j = 0; j < data.nums.length; j++) {
        for (let k = j + 1; k < data.nums.length; k++) {
          if (data.nums[j] + data.nums[k] === data.target) {
            solutions.push([j, k])
          }
        }
      }

      // 应该恰好有一个解
      expect(solutions.length).toBe(1)
    }
  })
})
