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

const CELL_WIDTH = 70
const CELL_GAP = 20
const HASHMAP_Y_OFFSET = 320
const HASHMAP_CAPTION_GAP = 45
const SCENE_LEFT = -65
const SCENE_TOP = 45
const MIN_SCENE_WIDTH = 700
const SCENE_RIGHT_PADDING = 340
const VIEWPORT_PADDING = 24

/** Fits a stable scene envelope so every step stays centered without camera jumps. */
export function getCanvasViewport({
  width,
  height,
  arrayLength,
  minScale = 0.01,
  maxScale = 1.2,
}: CanvasViewportOptions): CanvasViewport {
  const pitch = CELL_WIDTH + CELL_GAP
  const arrayWidth = arrayLength * pitch
  const sceneRight = Math.max(MIN_SCENE_WIDTH, arrayWidth + SCENE_RIGHT_PADDING)
  const sceneBottom = HASHMAP_Y_OFFSET + Math.max(0, arrayLength - 1) * 48 + CELL_WIDTH + HASHMAP_CAPTION_GAP
  const sceneWidth = sceneRight - SCENE_LEFT
  const sceneHeight = sceneBottom - SCENE_TOP
  const availableWidth = Math.max(0, width - VIEWPORT_PADDING * 2)
  const availableHeight = Math.max(0, height - VIEWPORT_PADDING * 2)
  const fitScale = Math.min(availableWidth / sceneWidth, availableHeight / sceneHeight, maxScale)
  const scale = Math.max(minScale, fitScale)

  return {
    x: (width - sceneWidth * scale) / 2 - SCENE_LEFT * scale,
    y: (height - sceneHeight * scale) / 2 - SCENE_TOP * scale,
    scale,
  }
}
