/**
 * IndexedDB 工具函数
 * 用于缓存GitHub Star数和播放速度设置
 */

const DB_NAME = 'leetcode-visualizer'
const DB_VERSION = 1
const STORE_NAME = 'settings'

interface CacheEntry<T> {
  value: T
  timestamp: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
  })

  return dbPromise
}

export async function getCachedValue<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        if (result) {
          resolve({ value: result.value, timestamp: result.timestamp })
        } else {
          resolve(null)
        }
      }
    })
  } catch {
    return null
  }
}

export async function setCachedValue<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put({
        key,
        value,
        timestamp: Date.now(),
      })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch {
    // 静默失败
  }
}

// 缓存有效期：1小时
const CACHE_DURATION = 60 * 60 * 1000

export async function getGitHubStars(owner: string, repo: string): Promise<number> {
  const cacheKey = `github-stars-${owner}-${repo}`

  // 尝试从缓存获取
  const cached = await getCachedValue<number>(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.value
  }

  // 从GitHub API获取
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    if (response.ok) {
      const data = await response.json()
      const stars = data.stargazers_count || 0
      await setCachedValue(cacheKey, stars)
      return stars
    }
  } catch {
    // API调用失败，返回缓存值或默认值
  }

  // 返回缓存值或默认值0
  return cached?.value ?? 0
}

// 播放速度缓存
const PLAYBACK_RATE_KEY = 'playback-rate'

export async function getPlaybackRate(): Promise<number | null> {
  const cached = await getCachedValue<number>(PLAYBACK_RATE_KEY)
  return cached?.value ?? null
}

export async function setPlaybackRate(rate: number): Promise<void> {
  await setCachedValue(PLAYBACK_RATE_KEY, rate)
}
