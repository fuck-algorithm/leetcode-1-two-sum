import Prism from 'prismjs'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-javascript'
import type { CodeLanguage } from '../types'

/**
 * Prism.js 语言名称映射
 * 将应用内的语言标识符映射到 Prism.js 使用的语言名称
 */
export const PRISM_LANGUAGE_MAP: Record<CodeLanguage, string> = {
  java: 'java',
  python: 'python',
  golang: 'go',
  javascript: 'javascript',
}

/**
 * 支持的语言列表
 */
export const SUPPORTED_LANGUAGES: CodeLanguage[] = ['java', 'python', 'golang', 'javascript']

/**
 * 转义 HTML 特殊字符，防止 XSS 攻击
 * @param text - 需要转义的文本
 * @returns 转义后的安全文本
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char)
}

/**
 * 检查指定语言的语法是否已加载
 * @param language - 编程语言
 * @returns 是否已加载
 */
export function isLanguageLoaded(language: CodeLanguage): boolean {
  const prismLang = PRISM_LANGUAGE_MAP[language]
  return !!Prism.languages[prismLang]
}

/**
 * 获取所有已加载的语言
 * @returns 已加载的语言列表
 */
export function getLoadedLanguages(): CodeLanguage[] {
  return SUPPORTED_LANGUAGES.filter(isLanguageLoaded)
}

/**
 * 高亮单行代码
 * @param line - 代码行字符串
 * @param language - 编程语言
 * @returns 带有 token span 标签的 HTML 字符串
 */
export function highlightLine(line: string, language: CodeLanguage): string {
  // 空行返回不可见空格以保持行高
  if (!line.trim()) return '&nbsp;'

  try {
    const prismLang = PRISM_LANGUAGE_MAP[language]
    const grammar = Prism.languages[prismLang]

    if (grammar) {
      return Prism.highlight(line, grammar, prismLang)
    }

    // 语法未加载时，返回转义后的纯文本
    return escapeHtml(line)
  } catch {
    // 解析错误时，返回转义后的纯文本
    return escapeHtml(line)
  }
}

/**
 * 高亮整段代码
 * @param code - 完整代码字符串
 * @param language - 编程语言
 * @returns 带有 token span 标签的 HTML 字符串
 */
export function highlightCode(code: string, language: CodeLanguage): string {
  if (!code) return ''

  try {
    const prismLang = PRISM_LANGUAGE_MAP[language]
    const grammar = Prism.languages[prismLang]

    if (grammar) {
      return Prism.highlight(code, grammar, prismLang)
    }

    // 语法未加载时，返回转义后的纯文本
    return escapeHtml(code)
  } catch {
    // 解析错误时，返回转义后的纯文本
    return escapeHtml(code)
  }
}

/**
 * 获取 Prism.js 实例（用于测试）
 */
export function getPrismInstance(): typeof Prism {
  return Prism
}
