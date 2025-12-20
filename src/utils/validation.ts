import type { InputData, ValidationResult } from '../types'

const MIN_LENGTH = 2
const MAX_LENGTH = 10000
const MIN_VALUE = -1e9
const MAX_VALUE = 1e9

/**
 * 验证输入数据是否合法
 */
export function validateInput(data: InputData): ValidationResult {
  const { nums, target } = data

  // 验证数组长度
  if (!Array.isArray(nums) || nums.length < MIN_LENGTH) {
    return { isValid: false, error: '数组长度必须至少为2' }
  }

  if (nums.length > MAX_LENGTH) {
    return { isValid: false, error: '数组长度不能超过10000' }
  }

  // 验证元素值范围
  for (const num of nums) {
    if (typeof num !== 'number' || !Number.isFinite(num)) {
      return { isValid: false, error: '数组元素必须是有效数字' }
    }
    if (num < MIN_VALUE || num > MAX_VALUE) {
      return { isValid: false, error: '元素值必须在-10^9到10^9之间' }
    }
  }

  // 验证 target 值
  if (typeof target !== 'number' || !Number.isFinite(target)) {
    return { isValid: false, error: '目标值必须是有效数字' }
  }

  // 验证是否存在有效解
  if (!hasSolution(nums, target)) {
    return { isValid: false, error: '输入数据不存在有效解' }
  }

  return { isValid: true }
}

/**
 * 检查是否存在有效解
 */
export function hasSolution(nums: number[], target: number): boolean {
  const seen = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (seen.has(complement)) {
      return true
    }
    seen.set(nums[i], i)
  }
  return false
}

/**
 * 解析数组字符串
 */
export function parseArrayString(str: string): number[] | null {
  try {
    const trimmed = str.trim()
    // 支持 [1,2,3] 或 1,2,3 格式
    const normalized = trimmed.startsWith('[') ? trimmed : `[${trimmed}]`
    const parsed = JSON.parse(normalized)
    if (!Array.isArray(parsed)) return null
    if (!parsed.every((n) => typeof n === 'number')) return null
    return parsed
  } catch {
    return null
  }
}
