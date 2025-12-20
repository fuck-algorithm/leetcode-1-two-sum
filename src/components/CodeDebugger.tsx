import { useMemo } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-java'
import type { CodeDebuggerProps, VariableState } from '../types'
import styles from './CodeDebugger.module.css'

/**
 * 代码调试器组件
 * 展示Java代码，支持语法高亮、当前行高亮、变量值展示
 */
export function CodeDebugger({ code, currentLine, variables }: CodeDebuggerProps) {
  const lines = useMemo(() => code.split('\n'), [code])

  // 按行号分组变量
  const variablesByLine = useMemo(() => {
    const map = new Map<number, VariableState[]>()
    variables.forEach((v) => {
      const existing = map.get(v.line) || []
      existing.push(v)
      map.set(v.line, existing)
    })
    return map
  }, [variables])

  // 获取所有当前变量的最新值（用于在当前行显示）
  const currentVariables = useMemo(() => {
    const varMap = new Map<string, VariableState>()
    // 按照变量出现的顺序，后面的会覆盖前面的（保持最新值）
    variables.forEach((v) => {
      varMap.set(v.name, v)
    })
    return Array.from(varMap.values())
  }, [variables])

  // 高亮单行代码
  const highlightLine = (line: string): string => {
    if (!line.trim()) return '&nbsp;'
    try {
      return Prism.highlight(line, Prism.languages.java, 'java')
    } catch {
      return line
    }
  }

  // 获取某行的变量展示
  const getLineVariables = (lineNum: number): VariableState[] => {
    // 如果是当前执行行，显示所有当前变量
    if (lineNum === currentLine) {
      return currentVariables
    }
    // 否则显示该行定义的变量
    return variablesByLine.get(lineNum) || []
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>☕</span>
        <span className={styles.headerTitle}>Java 代码调试器</span>
        <span className={styles.headerBadge}>Debug Mode</span>
      </div>

      <div className={styles.codeArea}>
        <div className={styles.codeContent}>
          {lines.map((line, index) => {
            const lineNum = index + 1
            const isCurrentLine = lineNum === currentLine
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
                    className={`${styles.lineContent} language-java`}
                    dangerouslySetInnerHTML={{
                      __html: highlightLine(line),
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
