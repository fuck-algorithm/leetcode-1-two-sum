import { useMemo } from 'react'
import type { CodeDebuggerProps, VariableState, CodeLanguage } from '../types'
import {
  CODE_SNIPPETS,
  LANGUAGE_LABELS,
  LANGUAGE_ICONS,
  mapLineToLanguage,
} from '../utils/codeSnippets'
import { highlightLine, PRISM_LANGUAGE_MAP } from '../utils/syntaxHighlight'
import styles from './CodeDebugger.module.css'

const LANGUAGES: CodeLanguage[] = ['java', 'python', 'golang', 'javascript']

/**
 * 代码调试器组件
 * 支持多语言代码展示，语法高亮、当前行高亮、变量值展示
 */
export function CodeDebugger({
  language,
  onLanguageChange,
  currentLine,
  variables,
}: CodeDebuggerProps) {
  const code = CODE_SNIPPETS[language].code
  const lines = useMemo(() => code.split('\n'), [code])

  // 将通用行号转换为当前语言的行号
  const mappedCurrentLine = mapLineToLanguage(currentLine, language)

  // 按行号分组变量（转换为当前语言的行号）
  const variablesByLine = useMemo(() => {
    const map = new Map<number, VariableState[]>()
    variables.forEach((v) => {
      const mappedLine = mapLineToLanguage(v.line, language)
      const existing = map.get(mappedLine) || []
      existing.push({ ...v, line: mappedLine })
      map.set(mappedLine, existing)
    })
    return map
  }, [variables, language])

  // 获取所有当前变量的最新值（用于在当前行显示）
  const currentVariables = useMemo(() => {
    const varMap = new Map<string, VariableState>()
    variables.forEach((v) => {
      const mappedLine = mapLineToLanguage(v.line, language)
      varMap.set(v.name, { ...v, line: mappedLine })
    })
    return Array.from(varMap.values())
  }, [variables, language])

  // 获取某行的变量展示
  const getLineVariables = (lineNum: number): VariableState[] => {
    if (lineNum === mappedCurrentLine) {
      return currentVariables
    }
    return variablesByLine.get(lineNum) || []
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>{LANGUAGE_ICONS[language]}</span>
          <span className={styles.headerTitle}>{LANGUAGE_LABELS[language]} 代码调试器</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.headerBadge}>Debug Mode</span>
        </div>
      </div>

      {/* 语言切换标签 */}
      <div className={styles.languageTabs}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            className={`${styles.languageTab} ${lang === language ? styles.activeTab : ''}`}
            onClick={() => onLanguageChange(lang)}
          >
            <span className={styles.tabIcon}>{LANGUAGE_ICONS[lang]}</span>
            <span className={styles.tabLabel}>{LANGUAGE_LABELS[lang]}</span>
          </button>
        ))}
      </div>

      <div className={styles.codeArea}>
        <div className={styles.codeContent}>
          {lines.map((line, index) => {
            const lineNum = index + 1
            const isCurrentLine = lineNum === mappedCurrentLine
            const lineVars = getLineVariables(lineNum)
            const hasBreakpoint = isCurrentLine

            return (
              <div
                key={index}
                className={`${styles.line} ${isCurrentLine ? styles.currentLine : ''}`}
              >
                {/* 断点指示器 */}
                <div className={styles.gutterArea}>
                  <span className={`${styles.breakpoint} ${hasBreakpoint ? styles.active : ''}`}>
                    {hasBreakpoint && '●'}
                  </span>
                  <span className={styles.lineNumber}>{lineNum}</span>
                </div>

                {/* 代码内容 */}
                <div className={styles.codeLineWrapper}>
                  <code
                    className={`${styles.lineContent} language-${PRISM_LANGUAGE_MAP[language]}`}
                    dangerouslySetInnerHTML={{
                      __html: highlightLine(line, language),
                    }}
                  />

                  {/* 变量值展示区域 - 在代码行末尾 */}
                  {lineVars.length > 0 && (
                    <div className={styles.variablesInline}>
                      {lineVars.map((v, i) => (
                        <span key={`${v.name}-${i}`} className={styles.variableTag}>
                          <span className={styles.varName}>{v.name}</span>
                          <span className={styles.varEquals}>=</span>
                          <span className={styles.varValue}>{v.value}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 当前行执行指示器 */}
                {isCurrentLine && <div className={styles.executionIndicator}>▶</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* 变量监视面板 */}
      {currentVariables.length > 0 && (
        <div className={styles.watchPanel}>
          <div className={styles.watchHeader}>
            <span className={styles.watchIcon}>👁</span>
            <span>变量监视</span>
          </div>
          <div className={styles.watchContent}>
            {currentVariables.map((v, i) => (
              <div key={`watch-${v.name}-${i}`} className={styles.watchItem}>
                <span className={styles.watchName}>{v.name}</span>
                <span className={styles.watchValue}>{v.value}</span>
                <span className={styles.watchLine}>行 {v.line}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
