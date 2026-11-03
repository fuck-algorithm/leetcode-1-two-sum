export const CELL_WIDTH = 70
export const CELL_HEIGHT = 55
export const CELL_GAP = 20
export const ARRAY_X = 0
export const ARRAY_Y = 220
export const HASHMAP_X = 0
export const HASHMAP_Y = 370
export const HASHMAP_ROW_PITCH = 110
export const CALCULATION_GAP = 40
export const CALCULATION_WIDTH = 260
export const POINTER_AREA_HEIGHT = 80

export interface Bounds {
  left: number
  top: number
  right: number
  bottom: number
}

export function getCalculationX(arrayLength: number): number {
  return arrayLength * (CELL_WIDTH + CELL_GAP) + CALCULATION_GAP
}

export function getSceneBounds(arrayLength: number): Bounds {
  const pitch = CELL_WIDTH + CELL_GAP
  const pointerLabelOverhang = 65
  const sceneLeft = -pointerLabelOverhang
  const sceneTop = ARRAY_Y - POINTER_AREA_HEIGHT / 2 - 35
  const arrayRight = arrayLength * pitch + pointerLabelOverhang
  const calculationRight = getCalculationX(arrayLength) + CALCULATION_WIDTH
  const hashMapRight = HASHMAP_X + CELL_WIDTH + pointerLabelOverhang
  return {
    left: sceneLeft,
    top: sceneTop,
    right: Math.max(arrayRight, calculationRight, hashMapRight),
    bottom: HASHMAP_Y + Math.max(0, arrayLength - 1) * HASHMAP_ROW_PITCH + CELL_HEIGHT + 45,
  }
}

export interface Point {
  x: number
  y: number
}

export interface PointerLabelPosition extends Point {
  width: number
  height: number
}

/** Places pointer badges in collision-free rows while keeping them near their cells. */
export function layoutPointerLabels(
  targets: number[],
  labels: string[],
  minX: number,
  maxX: number,
): PointerLabelPosition[] {
  const placed: PointerLabelPosition[] = []
  const rowPitch = 24
  const height = 20

  labels.forEach((label, index) => {
    const width = label.length * 8 + 16
    const preferredX = targets[index] ?? minX
    const candidates = Array.from({ length: placed.length + 1 }, (_, row) => -row * rowPitch)
    const y = candidates.find((candidateY) => {
      const left = Math.max(minX, Math.min(maxX - width, preferredX - width / 2))
      const right = left + width
      return placed.every((other) => {
        const separated = right + 8 <= other.x || other.x + other.width + 8 <= left
          || candidateY + height + 4 <= other.y || other.y + other.height + 4 <= candidateY
        return separated
      })
    }) ?? -placed.length * rowPitch
    const x = Math.max(minX, Math.min(maxX - width, preferredX - width / 2))
    placed.push({ x, y, width, height })
  })

  return placed
}

export function getArrayCellPosition(index: number): Point {
  return { x: ARRAY_X + index * (CELL_WIDTH + CELL_GAP), y: ARRAY_Y }
}

export function getHashMapEntryPosition(index: number): Point {
  return { x: HASHMAP_X, y: HASHMAP_Y + index * HASHMAP_ROW_PITCH }
}
