import type { ControlPanelProps } from '../types'
import styles from './ControlPanel.module.css'

export function ControlPanel({
  currentStep,
  totalSteps,
  isPlaying,
  onPrev,
  onNext,
  onPlay,
  onPause,
  onReset,
  onSeek,
}: ControlPanelProps) {
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const step = Math.round(percentage * (totalSteps - 1))
    onSeek(step)
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button onClick={onReset} className={styles.btn} title="重置">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </button>

        <button
          onClick={onPrev}
          className={styles.btn}
          disabled={currentStep === 0}
          title="上一步 (←)"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          <span className={styles.shortcut}>←</span>
        </button>

        {isPlaying ? (
          <button onClick={onPause} className={styles.playBtn} title="暂停 (空格)">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            <span className={styles.shortcut}>␣</span>
          </button>
        ) : (
          <button onClick={onPlay} className={styles.playBtn} title="播放 (空格)">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className={styles.shortcut}>␣</span>
          </button>
        )}

        <button
          onClick={onNext}
          className={styles.btn}
          disabled={currentStep === totalSteps - 1}
          title="下一步 (→)"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
          <span className={styles.shortcut}>→</span>
        </button>

        <span className={styles.stepInfo}>
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      <div className={styles.progressContainer} onClick={handleProgressClick}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          <div className={styles.progressThumb} style={{ left: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
