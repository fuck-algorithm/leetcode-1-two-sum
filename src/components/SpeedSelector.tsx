import { useState, useRef, useEffect } from 'react'
import type { PlaybackRate } from '../types'
import { PLAYBACK_RATES } from '../hooks/useAlgorithmPlayer'
import styles from './SpeedSelector.module.css'

interface SpeedSelectorProps {
  value: PlaybackRate
  onChange: (rate: PlaybackRate) => void
}

export function SpeedSelector({ value, onChange }: SpeedSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (rate: PlaybackRate) => {
    onChange(rate)
    setIsOpen(false)
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <span className={styles.label}>速率:</span>
      <div className={styles.selector}>
        <button
          className={styles.trigger}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={styles.value}>{value}x</span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className={styles.dropdown} role="listbox">
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                className={`${styles.option} ${rate === value ? styles.selected : ''}`}
                onClick={() => handleSelect(rate)}
                role="option"
                aria-selected={rate === value}
              >
                {rate}x
                {rate === value && <span className={styles.checkmark}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
