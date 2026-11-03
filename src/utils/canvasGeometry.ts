import type { ArrowConnection } from '../types'
import {
  ARRAY_Y,
  CELL_HEIGHT,
  CELL_WIDTH,
  getArrayCellPosition,
  getHashMapEntryPosition,
  HASHMAP_Y,
} from './canvasLayout'

export interface Point { x: number; y: number }
export interface ArrowGeometry {
  start: Point
  control1: Point
  control2: Point
  end: Point
}

const ARRAY_LANE_Y = ARRAY_Y + CELL_HEIGHT + 38
const HASHMAP_LANE_Y = HASHMAP_Y - 18

/** Route data flows through reserved whitespace lanes, never through labels or nodes. */
export function getArrowGeometry(
  arrow: ArrowConnection,
  calculationX: number,
): ArrowGeometry {
  const arrayCell = (index: number) => getArrayCellPosition(index)
  const mapCell = (index: number) => getHashMapEntryPosition(index)
  const arrayCenter = (index: number) => {
    const cell = arrayCell(index)
    return { x: cell.x + CELL_WIDTH / 2, y: cell.y + CELL_HEIGHT / 2 }
  }
  const arraySide = (index: number, side: 'left' | 'right'): Point => {
    const cell = arrayCell(index)
    return {
      x: side === 'left' ? cell.x - 4 : cell.x + CELL_WIDTH + 4,
      y: cell.y + CELL_HEIGHT / 2,
    }
  }
  const mapRight = (index: number): Point => {
    const entry = mapCell(index)
    return { x: entry.x + CELL_WIDTH + 4, y: entry.y + CELL_HEIGHT / 2 }
  }
  const mapLeft = (index: number): Point => {
    const entry = mapCell(index)
    return { x: entry.x - 4, y: entry.y + CELL_HEIGHT / 2 }
  }
  const calculationLeft = { x: calculationX - 15, y: ARRAY_Y + 25 }
  const calculationRight = { x: calculationX + 245, y: ARRAY_Y + 25 }

  if (arrow.fromType === 'array' && arrow.toType === 'calculation') {
    const cell = arrayCell(arrow.fromIndex)
    const start = { x: cell.x + CELL_WIDTH - 5, y: cell.y + CELL_HEIGHT + 4 }
    return {
      start,
      control1: { x: start.x, y: ARRAY_LANE_Y },
      control2: { x: calculationLeft.x - 40, y: ARRAY_LANE_Y },
      end: calculationLeft,
    }
  }

  if (arrow.fromType === 'array' && arrow.toType === 'hashmap') {
    const cell = arrayCell(arrow.fromIndex)
    const entry = mapCell(arrow.toIndex)
    const centerX = cell.x + CELL_WIDTH / 2
    const side = centerX <= entry.x + CELL_WIDTH / 2 ? 'right' : 'left'
    const start = arraySide(arrow.fromIndex, side)
    const end = mapRight(arrow.toIndex)
    const laneY = ARRAY_LANE_Y
    return {
      start,
      control1: { x: start.x + (side === 'right' ? 22 : -22), y: laneY },
      control2: { x: end.x + 34, y: laneY },
      end,
    }
  }

  if (arrow.fromType === 'calculation' && arrow.toType === 'hashmap') {
    const end = mapRight(arrow.toIndex)
    return {
      start: calculationRight,
      control1: { x: calculationRight.x + 40, y: HASHMAP_LANE_Y },
      control2: { x: end.x + 44, y: HASHMAP_LANE_Y },
      end,
    }
  }

  if (arrow.fromType === 'hashmap' && arrow.toType === 'array') {
    const start = mapRight(arrow.fromIndex)
    const cell = arrayCell(arrow.toIndex)
    const end = arraySide(arrow.toIndex, 'left')
    const outerRightLane = Math.max(start.x, cell.x + CELL_WIDTH) + 64
    const upperArrayLane = ARRAY_Y - 25
    return {
      start,
      control1: { x: outerRightLane, y: start.y },
      control2: { x: outerRightLane, y: upperArrayLane },
      end,
    }
  }

  const start = arrow.fromType === 'array'
    ? arrayCenter(arrow.fromIndex)
    : arrow.fromType === 'hashmap'
      ? mapRight(arrow.fromIndex)
      : calculationRight
  const end = arrow.toType === 'array'
    ? arrayCenter(arrow.toIndex)
    : arrow.toType === 'hashmap'
      ? mapLeft(arrow.toIndex)
      : calculationLeft

  return {
    start,
    control1: { x: start.x + (end.x - start.x) * 0.35, y: start.y + (end.y - start.y) * 0.35 },
    control2: { x: start.x + (end.x - start.x) * 0.65, y: start.y + (end.y - start.y) * 0.65 },
    end,
  }
}
