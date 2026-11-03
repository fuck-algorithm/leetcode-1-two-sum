export interface CanvasViewport {
  x: number
  y: number
  scale: number
}

interface CanvasViewportOptions {
  width: number
  height: number
  arrayLength: number
  minScale?: number
  maxScale?: number
}

import { getSceneBounds } from './canvasLayout'

const VIEWPORT_PADDING = 24

/** Fits a stable scene envelope so every step stays centered without camera jumps. */
export function getCanvasViewport({
  width,
  height,
  arrayLength,
  minScale = 0.01,
  maxScale = 1.2,
}: CanvasViewportOptions): CanvasViewport {
  const bounds = getSceneBounds(arrayLength)
  const sceneWidth = bounds.right - bounds.left
  const sceneHeight = bounds.bottom - bounds.top
  const availableWidth = Math.max(0, width - VIEWPORT_PADDING * 2)
  const availableHeight = Math.max(0, height - VIEWPORT_PADDING * 2)
  const fitScale = Math.min(availableWidth / sceneWidth, availableHeight / sceneHeight, maxScale)
  const scale = Math.max(minScale, fitScale)

  return {
    x: (width - sceneWidth * scale) / 2 - bounds.left * scale,
    y: (height - sceneHeight * scale) / 2 - bounds.top * scale,
    scale,
  }
}
