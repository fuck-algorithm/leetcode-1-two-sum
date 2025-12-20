import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  createInitialState,
  next,
  prev,
  reset,
  seek,
  type PlayerState,
} from '../algorithmPlayerLogic'

/**
 * **Feature: two-sum-visualizer, Property 1: 步骤导航一致性**
 * **Validates: Requirements 2.1, 2.2**
 *
 * For any 算法步骤序列和当前步骤索引，执行"下一步"操作后步骤索引应增加1
 * （除非已在最后一步），执行"上一步"操作后步骤索引应减少1（除非已在第一步）。
 */
describe('Property 1: 步骤导航一致性', () => {
  const stateArb = fc
    .tuple(
      fc.integer({ min: 2, max: 100 }), // totalSteps
      fc.integer({ min: 0, max: 99 }) // currentStepIndex (will be clamped)
    )
    .map(([totalSteps, idx]) => ({
      currentStepIndex: Math.min(idx, totalSteps - 1),
      isPlaying: false,
      totalSteps,
    }))

  it('执行 next 后步骤索引应增加1（除非已在最后一步）', () => {
    fc.assert(
      fc.property(stateArb, (state: PlayerState) => {
        const newState = next(state)

        if (state.currentStepIndex < state.totalSteps - 1) {
          // 不在最后一步时，索引应增加1
          expect(newState.currentStepIndex).toBe(state.currentStepIndex + 1)
        } else {
          // 在最后一步时，索引应保持不变
          expect(newState.currentStepIndex).toBe(state.currentStepIndex)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('执行 prev 后步骤索引应减少1（除非已在第一步）', () => {
    fc.assert(
      fc.property(stateArb, (state: PlayerState) => {
        const newState = prev(state)

        if (state.currentStepIndex > 0) {
          // 不在第一步时，索引应减少1
          expect(newState.currentStepIndex).toBe(state.currentStepIndex - 1)
        } else {
          // 在第一步时，索引应保持不变
          expect(newState.currentStepIndex).toBe(0)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('连续执行 next 和 prev 应回到原位置（除非在边界）', () => {
    fc.assert(
      fc.property(stateArb, (state: PlayerState) => {
        // 不在最后一步时
        if (state.currentStepIndex < state.totalSteps - 1) {
          const afterNext = next(state)
          const afterPrev = prev(afterNext)
          expect(afterPrev.currentStepIndex).toBe(state.currentStepIndex)
        }
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: two-sum-visualizer, Property 2: 重置状态一致性**
 * **Validates: Requirements 2.5**
 *
 * For any 算法演示状态，执行"重置"操作后，当前步骤索引应为0，播放状态应为暂停。
 */
describe('Property 2: 重置状态一致性', () => {
  const stateArb = fc
    .tuple(
      fc.integer({ min: 2, max: 100 }),
      fc.integer({ min: 0, max: 99 }),
      fc.boolean()
    )
    .map(([totalSteps, idx, isPlaying]) => ({
      currentStepIndex: Math.min(idx, totalSteps - 1),
      isPlaying,
      totalSteps,
    }))

  it('执行 reset 后步骤索引应为0，播放状态应为暂停', () => {
    fc.assert(
      fc.property(stateArb, (state: PlayerState) => {
        const newState = reset(state)

        expect(newState.currentStepIndex).toBe(0)
        expect(newState.isPlaying).toBe(false)
        expect(newState.totalSteps).toBe(state.totalSteps)
      }),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: two-sum-visualizer, Property 3: 进度条跳转一致性**
 * **Validates: Requirements 3.2**
 *
 * For any 进度条位置（0到totalSteps-1之间），拖动到该位置后，
 * 当前步骤索引应等于该位置值。
 */
describe('Property 3: 进度条跳转一致性', () => {
  it('seek 到有效位置后步骤索引应等于该位置', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }),
        fc.integer({ min: 0, max: 99 }),
        (totalSteps, targetIndex) => {
          const state = createInitialState(totalSteps)
          const validTarget = Math.min(targetIndex, totalSteps - 1)
          const newState = seek(state, validTarget)

          expect(newState.currentStepIndex).toBe(validTarget)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('seek 到超出范围的位置应被限制在有效范围内', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }),
        fc.integer({ min: -100, max: 200 }),
        (totalSteps, targetIndex) => {
          const state = createInitialState(totalSteps)
          const newState = seek(state, targetIndex)

          // 索引应在有效范围内
          expect(newState.currentStepIndex).toBeGreaterThanOrEqual(0)
          expect(newState.currentStepIndex).toBeLessThan(totalSteps)

          // 如果目标在范围内，应等于目标
          if (targetIndex >= 0 && targetIndex < totalSteps) {
            expect(newState.currentStepIndex).toBe(targetIndex)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
