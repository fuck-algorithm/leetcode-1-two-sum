import type { CodeLanguage } from '../types'

export interface CodeSnippet {
  language: CodeLanguage
  code: string
  // 将通用行号映射到该语言的行号
  lineMapping: Record<number, number>
}

// 通用行号定义（用于步骤生成器）
export const LINE_NUMBERS = {
  FUNCTION_START: 1,
  CREATE_MAP: 2,
  FOR_LOOP: 3,
  CALC_COMPLEMENT: 4,
  CHECK_MAP: 5,
  RETURN_RESULT: 6,
  END_IF: 7,
  PUT_MAP: 8,
  END_FOR: 9,
  RETURN_EMPTY: 10,
  FUNCTION_END: 11,
}

export const CODE_SNIPPETS: Record<CodeLanguage, CodeSnippet> = {
  java: {
    language: 'java',
    code: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    return new int[] {};
}`,
    lineMapping: {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11,
    },
  },
  python: {
    language: 'python',
    code: `def twoSum(nums: List[int], target: int) -> List[int]:
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []`,
    lineMapping: {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 7, 9: 8, 10: 8, 11: 8,
    },
  },
  golang: {
    language: 'golang',
    code: `func twoSum(nums []int, target int) []int {
    hashMap := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if j, ok := hashMap[complement]; ok {
            return []int{j, i}
        }
        hashMap[num] = i
    }
    return []int{}
}`,
    lineMapping: {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11,
    },
  },
  javascript: {
    language: 'javascript',
    code: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    lineMapping: {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11,
    },
  },
}

export const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  java: 'Java',
  python: 'Python',
  golang: 'Go',
  javascript: 'JavaScript',
}

export const LANGUAGE_ICONS: Record<CodeLanguage, string> = {
  java: '☕',
  python: '🐍',
  golang: '🐹',
  javascript: '📜',
}

/**
 * 获取指定语言的代码
 */
export function getCodeForLanguage(language: CodeLanguage): string {
  return CODE_SNIPPETS[language].code
}

/**
 * 将通用行号转换为指定语言的行号
 */
export function mapLineToLanguage(genericLine: number, language: CodeLanguage): number {
  return CODE_SNIPPETS[language].lineMapping[genericLine] || genericLine
}
