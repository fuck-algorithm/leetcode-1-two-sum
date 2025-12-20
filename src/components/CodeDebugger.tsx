import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-java'
import type { CodeDebuggerProps, VariableState } from '../types'
import styles from './CodeDebugger.module.css'

export function CodeDebugger({ code, currentLine, variables }: CodeDebuggerProps) {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code])

  const lines = code.split('\n')

  const getVariablesForLine = (lineNum: number): VariableState[] => {
    return variables.filter((v) => v.line === lineNum)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>代码调试器</div>
      <div className={styles.codeArea}>
        {lines.map((line, index) => {
          const lineNum = index + 1
          const isCurrentLine = lineNum === currentLine
          const lineVariables = getVariablesForLine(lineNum)

          return (
            <div
              key={index}
              className={`${styles.line} ${isCurrentLine ? styles.currentLine : ''}`}
            >
              <span className={styles.lineNumber}>{lineNum}</span>
              <span className={styles.lineContent}>
                <code
                  ref={index === 0 ? codeRef : undefined}
                  className="language-java"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(line, Prism.languages.java, 'java'),
                  }}
                />
              </span>
              {lineVariables.length > 0 && (
                <span className={styles.variables}>
                  {lineVariables.map((v, i) => (
                    <span key={i} className={styles.variable}>
                      {v.name} = {v.value}
                    </span>
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
