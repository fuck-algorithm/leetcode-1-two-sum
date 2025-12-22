import { useState, useEffect } from 'react'
import type { HeaderProps } from '../types'
import { getGitHubStars } from '../utils/indexedDB'
import styles from './Header.module.css'

export function Header({ title, leetcodeUrl, githubUrl }: HeaderProps) {
  const [stars, setStars] = useState<number>(0)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    // 从GitHub URL中提取owner和repo
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (match) {
      const [, owner, repo] = match
      getGitHubStars(owner, repo).then(setStars)
    }
  }, [githubUrl])

  // 关闭模态框时停止视频播放
  const handleCloseModal = () => {
    setShowVideo(false)
  }

  return (
    <>
      <header className={styles.header}>
        <a
          href={leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.title}
        >
          {title}
        </a>
        <div className={styles.rightSection}>
          <button
            className={styles.videoButton}
            onClick={() => setShowVideo(true)}
            aria-label="观看讲解视频"
            title="观看讲解视频"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            讲解视频
          </button>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.github}
            aria-label="GitHub 仓库"
            title="点击去GitHub仓库Star支持一下"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className={styles.starCount}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
              </svg>
              {stars}
            </span>
          </a>
        </div>
      </header>

      {/* 视频模态框 */}
      {showVideo && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={handleCloseModal}
              aria-label="关闭视频"
            >
              ✕
            </button>
            <video
              className={styles.video}
              controls
              autoPlay
              src="/video.mp4"
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        </div>
      )}
    </>
  )
}
