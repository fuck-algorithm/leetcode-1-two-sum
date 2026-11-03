import type { ArrowConnection } from '../types'
import {
  ARRAY_Y,
  CELL_HEIGHT,
  CELL_WIDTH,
  getArrayCellPosition,
  getHashMapEntryPosition,
} from './canvasLayout'

export interface Point { x: number; y: number }
export interface ArrowGeometry {
  start: Point
  control1: Point
  control2: Point
  end: Point
}

const ARRAY_LANE_Y = ARRAY_Y + CELL_HEIGHT + 42

/** Route each data flow through whitespace lanes instead of over cells or labels. */
export function getArrowGeometry(
  arrow: ArrowConnection,
  calculationX: number,
): ArrowGeometry {
  const arrayAnchor = (index: number): Point => {
    const cell = getArrayCellPosition(index)
    return { x: cell.x + CELL_WIDTH / 2, y: cell.y + CELL_HEIGHT + 4 }
  }
  const mapAnchor = (index: number): Point => {
    const entry = getHashMapEntryPosition(index)
    return { x: entry.x + CELL_WIDTH + 4, y: entry.y + CELL_HEIGHT / 2 }
  }
  const calculationLeft = { x: calculationX - 15, y: ARRAY_Y + 35 }
  const calculationBottom = { x: calculationX + 115, y: ARRAY_Y + 55 }
  let start: Point
  let end: Point

  if (arrow.fromType === 'array') start = arrayAnchor(arrow.fromIndex)
  else if (arrow.fromType === 'hashmap') start = mapAnchor(arrow.fromIndex)
  else start = calculationBottom

  if (arrow.toType === 'array') end = arrayAnchor(arrow.toIndex)
  else if (arrow.toType === 'hashmap') end = mapAnchor(arrow.toIndex)
  else end = calculationLeft

  if (arrow.fromType === 'array' && arrow.toType === 'calculation') {
    return {
      start,
      control1: { x: start.x, y: ARRAY_LANE_Y },
      control2: { x: end.x - 32, y: ARRAY_LANE_Y },
      end,
    }
  }

  if (arrow.fromType === 'array' && arrow.toType === 'hashmap') {
    const target = getHashMapEntryPosition(arrow.toIndex)
    const targetCenterY = target.y + CELL_HEIGHT / 2
    const approachX = target.x + CELL_WIDTH / 2
    return {
      start,
      control1: { x: start.x, y: targetCenterY + 18 },
      control2: { x: approachX, y: targetCenterY + 18 },
      end: { x: target.x + CELL_WIDTH / 2, y: targetCenterY },
    }
  }

  if (arrow.fromType === 'calculation' && arrow.toType === 'hashmap') {
    const target = getHashMapEntryPosition(arrow.toIndex)
    const targetCenterY = target.y + CELL_HEIGHT / 2
    return {
      start,
      control1: { x: end.x + 150, y: targetCenterY - 35 },
      control2: { x: end.x + 30, y: targetCenterY - 35 },
      end: { x: target.x + CELL_WIDTH + 4, y: targetCenterY },
    }
  }

  if (arrow.fromType === 'hashmap' && arrow.toType === 'array') {
    return {
      start,
      control1: { x: start.x + 36, y: ARRAY_LANE_Y + 42 },
      control2: { x: end.x, y: ARRAY_LANE_Y },
      end,
    }
  }

  return {
    start,
    control1: { x: start.x + (end.x - start.x) * 0.35, y: start.y + (end.y - start.y) * 0.35 },
    control2: { x: start.x + (end.x - start.x) * 0.65, y: start.y + (end.y - start.y) * 0.65 },
    end,
  }
}
