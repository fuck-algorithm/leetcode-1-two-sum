import type { InputData } from '../types'

const MIN_LENGTH = 2
const MAX_LENGTH = 10
const MIN_VALUE = -100
const MAX_VALUE = 100

/**
 * 生成随机整数
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成合法的随机测试数据
 * 确保生成的数据有唯一有效解
 */
export function generateRandomData(): InputData {
  const length = randomInt(MIN_LENGTH, MAX_LENGTH)

  // 先确定答案的两个位置和值
  const answerIdx1 = randomInt(0, length - 1)
  let answerIdx2 = randomInt(0, length - 1)
  while (answerIdx2 === answerIdx1) {
    answerIdx2 = randomInt(0, length - 1)
  }

  const value1 = randomInt(MIN_VALUE, MAX_VALUE)
  const value2 = randomInt(MIN_VALUE, MAX_VALUE)
  const target = value1 + value2

  // 生成数组，确保只有这一对解
  const nums: number[] = []
  const usedValues = new Set<number>()
  usedValues.add(value1)
  usedValues.add(value2)

  for (let i = 0; i < length; i++) {
    if (i === answerIdx1) {
      nums.push(value1)
    } else if (i === answerIdx2) {
      nums.push(value2)
    } else {
      // 生成一个不会与已有值形成另一个解的数
      let val: number
      do {
        val = randomInt(MIN_VALUE, MAX_VALUE)
      } while (usedValues.has(target - val) || usedValues.has(val))
      usedValues.add(val)
      nums.push(val)
    }
  }

  return { nums, target }
}
