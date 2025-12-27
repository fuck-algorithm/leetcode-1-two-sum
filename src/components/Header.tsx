import { useState, useEffect } from 'react'
import type { HeaderProps } from '../types'
import { getGitHubStars } from '../utils/indexedDB'
import styles from './Header.module.css'

const DEFAULT_BACK_URL = 'https://fuck-algorithm.github.io/leetcode-hot-100/'
const DEFAULT_BACK_TEXT = '← 返回 LeetCode Hot 100'

export function Header({ title, leetcodeUrl, githubUrl, backUrl, backText }: HeaderProps) {
  const [stars, setStars] = useState<number>(0)
  const [showVideo, setShowVideo] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    // 从GitHub URL中提取owner和repo
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (match) {
      const [, owner, repo] = match
      getGitHubStars(owner, repo).then(setStars)
    }
  }, [githubUrl])

  // ESC 键关闭算法思路模态框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showExplanation) {
        setShowExplanation(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showExplanation])

  // 关闭视频模态框
  const handleCloseModal = () => {
    setShowVideo(false)
  }

  // 关闭算法思路模态框
  const handleCloseExplanation = () => {
    setShowExplanation(false)
  }

  return (
    <>
      <header className={styles.header}>
        <a
          href={backUrl || DEFAULT_BACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.backLink}
        >
          {backText || DEFAULT_BACK_TEXT}
        </a>
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
            className={styles.explanationButton}
            onClick={() => setShowExplanation(true)}
            aria-label="查看算法思路"
            title="查看算法思路"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
            </svg>
            算法思路
          </button>
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
              src={`${import.meta.env.BASE_URL}video.mp4`}
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        </div>
      )}

      {/* 算法思路模态框 */}
      {showExplanation && (
        <div className={styles.modalOverlay} onClick={handleCloseExplanation}>
          <div className={styles.explanationModal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={handleCloseExplanation}
              aria-label="关闭算法思路"
            >
              ✕
            </button>
            
            <h2 className={styles.explanationTitle}>🧠 两数之和 - 算法思路</h2>
            
            <div className={styles.explanationContent}>
              {/* 问题描述 */}
              <section className={styles.explanationSection} data-section="problem">
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>📋</span>
                  问题描述
                </h3>
                <p className={styles.sectionContent}>
                  给定一个整数数组 <code>nums</code> 和一个整数目标值 <code>target</code>，
                  请在数组中找出<strong>和为目标值</strong>的那两个整数，并返回它们的数组下标。
                </p>
                <div className={styles.example}>
                  <span className={styles.exampleLabel}>例如：</span>
                  nums = [2, 7, 11, 15], target = 9 → 返回 [0, 1]，因为 2 + 7 = 9
                </div>
              </section>

              {/* 核心思想 */}
              <section className={styles.explanationSection} data-section="idea">
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>💡</span>
                  核心思想
                </h3>
                <p className={styles.sectionContent}>
                  使用<strong>哈希表</strong>（HashMap）来存储已经遍历过的数字及其索引。
                  这样我们只需要遍历一次数组，就能在 O(1) 时间内查找是否存在配对的数字。
                </p>
                <div className={styles.keyPoint}>
                  <span className={styles.keyPointIcon}>🔑</span>
                  关键洞察：对于每个数字 x，我们要找的是 target - x（称为"补数"）
                </div>
              </section>

              {/* 步骤说明 */}
              <section className={styles.explanationSection} data-section="steps">
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>📝</span>
                  步骤说明
                </h3>
                <ol className={styles.stepsList}>
                  <li>创建一个空的哈希表，用于存储 <code>数值 → 索引</code> 的映射</li>
                  <li>遍历数组中的每个元素</li>
                  <li>计算当前元素的<strong>补数</strong>：complement = target - 当前元素</li>
                  <li>检查补数是否已经在哈希表中</li>
                  <li>
                    <span className={styles.found}>✓ 找到了</span>：返回 [补数的索引, 当前索引]
                  </li>
                  <li>
                    <span className={styles.notFound}>✗ 没找到</span>：将当前元素和索引存入哈希表
                  </li>
                  <li>继续遍历，直到找到答案</li>
                </ol>
              </section>

              {/* 复杂度分析 */}
              <section className={styles.explanationSection} data-section="complexity">
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>⚡</span>
                  复杂度分析
                </h3>
                <div className={styles.complexityGrid}>
                  <div className={styles.complexityItem}>
                    <span className={styles.complexityLabel}>⏱️ 时间复杂度</span>
                    <span className={styles.complexityValue}>O(n)</span>
                    <span className={styles.complexityDesc}>只需遍历数组一次</span>
                  </div>
                  <div className={styles.complexityItem}>
                    <span className={styles.complexityLabel}>💾 空间复杂度</span>
                    <span className={styles.complexityValue}>O(n)</span>
                    <span className={styles.complexityDesc}>哈希表最多存储 n 个元素</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
