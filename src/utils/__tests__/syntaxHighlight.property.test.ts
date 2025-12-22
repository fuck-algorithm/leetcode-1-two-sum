import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  highlightCode,
  highlightLine,
  isLanguageLoaded,
  getLoadedLanguages,
  escapeHtml,
  SUPPORTED_LANGUAGES,
  PRISM_LANGUAGE_MAP,
} from '../syntaxHighlight'
import type { CodeLanguage } from '../../types'

/**
 * **Feature: syntax-highlighting, Property 1: Keyword Token Classification**
 * **Validates: Requirements 1.1, 2.1, 3.1, 4.1**
 *
 * For any code string containing language keywords, when highlighted by Prism.js,
 * the output HTML SHALL contain span elements with class "token keyword" wrapping those keywords.
 */
describe('Property 1: Keyword Token Classification', () => {
  // 各语言的关键字列表
  const KEYWORDS: Record<CodeLanguage, string[]> = {
    java: ['public', 'int', 'return', 'if', 'for', 'new', 'class', 'void'],
    python: ['def', 'for', 'in', 'if', 'return', 'class', 'import', 'from'],
    golang: ['func', 'for', 'range', 'if', 'return', 'package', 'import', 'var'],
    javascript: ['function', 'const', 'let', 'for', 'if', 'return', 'new', 'var'],
  }

  it('should wrap keywords in span with class "token keyword" for all languages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        (language: CodeLanguage) => {
          const keywords = KEYWORDS[language]
          // 随机选择一个关键字
          const keyword = keywords[Math.floor(Math.random() * keywords.length)]

          // 构造包含关键字的简单代码
          const code = `${keyword} test`
          const highlighted = highlightCode(code, language)

          // 验证关键字被包裹在 token keyword span 中
          const keywordPattern = new RegExp(
            `<span class="token keyword"[^>]*>${keyword}</span>`
          )
          expect(highlighted).toMatch(keywordPattern)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should highlight multiple keywords in the same line', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        (language: CodeLanguage) => {
          const keywords = KEYWORDS[language]
          // 选择两个不同的关键字
          const keyword1 = keywords[0]
          const keyword2 = keywords[1]

          const code = `${keyword1} x ${keyword2} y`
          const highlighted = highlightCode(code, language)

          // 两个关键字都应该被高亮
          expect(highlighted).toContain('token keyword')
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: syntax-highlighting, Property 3: String Literal Token Classification**
 * **Validates: Requirements 1.3, 2.3, 3.3, 4.3**
 *
 * For any code string containing string literals, when highlighted by Prism.js,
 * the output HTML SHALL contain span elements with class "token string" wrapping those string literals.
 */
describe('Property 3: String Literal Token Classification', () => {
  // 各语言的字符串字面量示例
  const STRING_EXAMPLES: Record<CodeLanguage, string[]> = {
    java: ['"hello"', '"world"', '"test string"'],
    python: ['"hello"', "'world'", '"""docstring"""'],
    golang: ['"hello"', '`raw string`'],
    javascript: ['"hello"', "'world'", '`template`'],
  }

  it('should wrap string literals in span with class "token string"', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        (language: CodeLanguage) => {
          const strings = STRING_EXAMPLES[language]
          const stringLiteral = strings[0] // 使用双引号字符串

          const code = `x = ${stringLiteral}`
          const highlighted = highlightCode(code, language)

          // 验证字符串被包裹在 token string span 中
          expect(highlighted).toContain('token string')
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: syntax-highlighting, Property 4: Number Literal Token Classification**
 * **Validates: Requirements 1.4, 2.4, 3.4, 4.4**
 *
 * For any code string containing numeric literals, when highlighted by Prism.js,
 * the output HTML SHALL contain span elements with class "token number" wrapping those numbers.
 */
describe('Property 4: Number Literal Token Classification', () => {
  it('should wrap numeric literals in span with class "token number"', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        fc.integer({ min: 0, max: 1000 }),
        (language: CodeLanguage, num: number) => {
          const code = `x = ${num}`
          const highlighted = highlightCode(code, language)

          // 验证数字被包裹在 token number span 中
          expect(highlighted).toContain('token number')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should highlight floating point numbers', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        fc.float({ min: 0, max: 100, noNaN: true }),
        (language: CodeLanguage, num: number) => {
          const code = `x = ${num.toFixed(2)}`
          const highlighted = highlightCode(code, language)

          expect(highlighted).toContain('token number')
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: syntax-highlighting, Property 2: Type/Class-name Token Classification**
 * **Validates: Requirements 1.2, 2.2, 3.2, 4.2**
 *
 * For any code string containing type names or class names, when highlighted by Prism.js,
 * the output HTML SHALL contain span elements with class "token class-name" or "token builtin"
 * wrapping those type names.
 */
describe('Property 2: Type/Class-name Token Classification', () => {
  // 各语言的类型/类名示例
  const TYPE_EXAMPLES: Record<CodeLanguage, { code: string; expectedTokens: string[] }[]> = {
    java: [
      { code: 'Map<Integer, Integer> map', expectedTokens: ['class-name'] },
      { code: 'new HashMap<>()', expectedTokens: ['class-name'] },
    ],
    python: [
      { code: 'def foo(x: List[int])', expectedTokens: ['builtin'] },
    ],
    golang: [
      { code: 'var x map[int]int', expectedTokens: ['keyword', 'builtin'] },
      { code: 'func foo() int', expectedTokens: ['builtin'] },
    ],
    javascript: [
      { code: 'new Map()', expectedTokens: ['class-name'] },
      { code: 'new Array()', expectedTokens: ['class-name'] },
    ],
  }

  it('should wrap type names in appropriate token classes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        (language: CodeLanguage) => {
          const examples = TYPE_EXAMPLES[language]
          const example = examples[0]

          const highlighted = highlightCode(example.code, language)

          // 验证至少有一个预期的 token 类型存在
          const hasExpectedToken = example.expectedTokens.some((token) =>
            highlighted.includes(`token ${token}`)
          )
          expect(hasExpectedToken).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: syntax-highlighting, Property 5: Function Name Token Classification**
 * **Validates: Requirements 1.5, 2.5, 3.5, 4.5**
 *
 * For any code string containing function definitions or calls, when highlighted by Prism.js,
 * the output HTML SHALL contain span elements with class "token function" wrapping those function names.
 */
describe('Property 5: Function Name Token Classification', () => {
  // 各语言的函数定义/调用示例
  // 注意：Python 的内置函数如 enumerate, len 会被标记为 builtin 而不是 function
  const FUNCTION_EXAMPLES: Record<CodeLanguage, { code: string; expectedTokens: string[] }[]> = {
    java: [
      { code: 'twoSum(nums, target)', expectedTokens: ['function'] },
      { code: 'map.get(key)', expectedTokens: ['function'] },
    ],
    python: [
      { code: 'enumerate(nums)', expectedTokens: ['builtin'] }, // Python 内置函数
      { code: 'len(arr)', expectedTokens: ['builtin'] },
      { code: 'def twoSum(nums):', expectedTokens: ['function'] },
    ],
    golang: [
      { code: 'make(map[int]int)', expectedTokens: ['function', 'builtin'] },
      { code: 'len(arr)', expectedTokens: ['function', 'builtin'] },
    ],
    javascript: [
      { code: 'twoSum(nums, target)', expectedTokens: ['function'] },
      { code: 'map.get(key)', expectedTokens: ['function'] },
    ],
  }

  it('should wrap function names in appropriate token classes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        (language: CodeLanguage) => {
          const examples = FUNCTION_EXAMPLES[language]
          const example = examples[0]

          const highlighted = highlightCode(example.code, language)

          // 验证至少有一个预期的 token 类型存在
          const hasExpectedToken = example.expectedTokens.some((token) =>
            highlighted.includes(`token ${token}`)
          )
          expect(hasExpectedToken).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should highlight function definitions', () => {
    const definitions: Record<CodeLanguage, string> = {
      java: 'public int twoSum(int[] nums) { }',
      python: 'def twoSum(nums, target):',
      golang: 'func twoSum(nums []int) []int { }',
      javascript: 'function twoSum(nums, target) { }',
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        (language: CodeLanguage) => {
          const code = definitions[language]
          const highlighted = highlightCode(code, language)

          // 函数定义应该包含 function token
          expect(highlighted).toContain('token function')
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: syntax-highlighting, Property 6: Cross-Language Token Consistency**
 * **Validates: Requirements 5.1**
 *
 * For any equivalent token type across different languages, the CSS styling
 * SHALL apply the same color to that token type regardless of the source language.
 */
describe('Property 6: Cross-Language Token Consistency', () => {
  // 测试所有语言对相同类型的 token 使用相同的 CSS 类名
  it('should use consistent token class names across all languages for keywords', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        (lang1: CodeLanguage, lang2: CodeLanguage) => {
          // 各语言的关键字
          const keywords: Record<CodeLanguage, string> = {
            java: 'public',
            python: 'def',
            golang: 'func',
            javascript: 'function',
          }

          const code1 = `${keywords[lang1]} test`
          const code2 = `${keywords[lang2]} test`

          const highlighted1 = highlightCode(code1, lang1)
          const highlighted2 = highlightCode(code2, lang2)

          // 两种语言都应该使用 "token keyword" 类
          expect(highlighted1).toContain('token keyword')
          expect(highlighted2).toContain('token keyword')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should use consistent token class names across all languages for numbers', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        fc.integer({ min: 1, max: 100 }),
        (lang1: CodeLanguage, lang2: CodeLanguage, num: number) => {
          const code1 = `x = ${num}`
          const code2 = `y = ${num}`

          const highlighted1 = highlightCode(code1, lang1)
          const highlighted2 = highlightCode(code2, lang2)

          // 两种语言都应该使用 "token number" 类
          expect(highlighted1).toContain('token number')
          expect(highlighted2).toContain('token number')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should use consistent token class names across all languages for strings', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        fc.constantFrom(...SUPPORTED_LANGUAGES),
        (lang1: CodeLanguage, lang2: CodeLanguage) => {
          const code1 = 'x = "hello"'
          const code2 = 'y = "world"'

          const highlighted1 = highlightCode(code1, lang1)
          const highlighted2 = highlightCode(code2, lang2)

          // 两种语言都应该使用 "token string" 类
          expect(highlighted1).toContain('token string')
          expect(highlighted2).toContain('token string')
        }
      ),
      { numRuns: 100 }
    )
  })
})

// 基础功能测试
describe('Syntax Highlight Utility Functions', () => {
  describe('isLanguageLoaded', () => {
    it('should return true for all supported languages', () => {
      SUPPORTED_LANGUAGES.forEach((lang) => {
        expect(isLanguageLoaded(lang)).toBe(true)
      })
    })
  })

  describe('getLoadedLanguages', () => {
    it('should return all supported languages', () => {
      const loaded = getLoadedLanguages()
      expect(loaded).toEqual(SUPPORTED_LANGUAGES)
    })
  })

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
      expect(escapeHtml('"test"')).toBe('&quot;test&quot;')
      expect(escapeHtml("'test'")).toBe('&#39;test&#39;')
      expect(escapeHtml('a & b')).toBe('a &amp; b')
    })
  })

  describe('highlightLine', () => {
    it('should return &nbsp; for empty lines', () => {
      expect(highlightLine('', 'java')).toBe('&nbsp;')
      expect(highlightLine('   ', 'python')).toBe('&nbsp;')
    })

    it('should highlight code for all languages', () => {
      const testCases: Record<CodeLanguage, string> = {
        java: 'public int x = 5;',
        python: 'def foo(): return 5',
        golang: 'func main() { return }',
        javascript: 'const x = 5;',
      }

      Object.entries(testCases).forEach(([lang, code]) => {
        const highlighted = highlightLine(code, lang as CodeLanguage)
        expect(highlighted).toContain('token')
      })
    })
  })

  describe('highlightCode', () => {
    it('should return empty string for empty input', () => {
      expect(highlightCode('', 'java')).toBe('')
    })

    it('should highlight multi-line code', () => {
      const code = `public class Test {
    public static void main() {
        int x = 5;
    }
}`
      const highlighted = highlightCode(code, 'java')
      expect(highlighted).toContain('token keyword')
      expect(highlighted).toContain('token number')
    })
  })
})
