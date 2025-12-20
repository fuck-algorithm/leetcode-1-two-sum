import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { Step } from '../types'

export interface AlgorithmPlayerState {
  currentStepIndex: number
  isPlaying: boolean
  totalSteps: number
}

export interface AlgorithmPlayerActions {
  next: () => void
  prev: () => void
  play: () => void
  pause: () => void
  reset: () => void
  seek: (index: number) => void
}

export function useAlgorithmPlayer(
  steps: Step[],
  playInterval = 1000
): [AlgorithmPlayerState, AlgorithmPlayerActions] {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const prevStepsRef = useRef<Step[]>(steps)

  const totalSteps = steps.length

  // 检测 steps 变化并重置状态
  const stepsChanged = steps !== prevStepsRef.current
  if (stepsChanged) {
    prevStepsRef.current = steps
  }

  // 使用 useMemo 来处理 steps 变化时的重置
  const [resetCurrentStep, resetIsPlaying] = useMemo(() => {
    if (stepsChanged) {
      return [0, false]
    }
    return [currentStepIndex, isPlaying]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps])

  // 同步状态（仅在 steps 变化时）
  if (stepsChanged && (currentStepIndex !== 0 || isPlaying !== false)) {
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }

  const next = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1))
  }, [totalSteps])

  const prev = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const play = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const reset = useCallback(() => {
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }, [])

  const seek = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, totalSteps - 1))
      setCurrentStepIndex(clampedIndex)
    },
    [totalSteps]
  )

  // 自动播放逻辑
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, playInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, totalSteps, playInterval])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的按键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          next()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prev()
          break
        case ' ':
          e.preventDefault()
          if (isPlaying) {
            pause()
          } else {
            play()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [next, prev, play, pause, isPlaying])

  const state: AlgorithmPlayerState = {
    currentStepIndex: stepsChanged ? resetCurrentStep : currentStepIndex,
    isPlaying: stepsChanged ? resetIsPlaying : isPlaying,
    totalSteps,
  }

  const actions: AlgorithmPlayerActions = {
    next,
    prev,
    play,
    pause,
    reset,
    seek,
  }

  return [state, actions]
}
