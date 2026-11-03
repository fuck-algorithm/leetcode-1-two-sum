import { describe, expect, it } from 'vitest'
import type { ArrowConnection } from '../../types'
import { getArrowGeometry, getArrowLabelLayout } from '../canvasGeometry'
import {
  ARRAY_Y,
  CELL_HEIGHT,
  CELL_WIDTH,
  getArrayCellPosition,
  getHashMapEntryPosition,
  HASHMAP_ROW_PITCH,
} from '../canvasLayout'

function samplePath(path: ReturnType<typeof getArrowGeometry>) {
  return Array.from({ length: 101 }, (_, index) => {
    const t = index / 100
    const u = 1 - t
    return {
      x: u ** 3 * path.start.x + 3 * u ** 2 * t * path.control1.x + 3 * u * t ** 2 * path.control2.x + t ** 3 * path.end.x,
      y: u ** 3 * path.start.y + 3 * u ** 2 * t * path.control1.y + 3 * u * t ** 2 * path.control2.y + t ** 3 * path.end.y,
    }
  })
}

function intersectsRect(point: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }) {
  return point.x > rect.x && point.x < rect.x + rect.width && point.y > rect.y && point.y < rect.y + rect.height
}

describe('canvas arrow geometry', () => {
  it.each([
    { fromType: 'array', fromIndex: 1, toType: 'calculation', toIndex: 0 },
    { fromType: 'array', fromIndex: 1, toType: 'hashmap', toIndex: 0 },
    { fromType: 'calculation', fromIndex: 0, toType: 'hashmap', toIndex: 1 },
    { fromType: 'hashmap', fromIndex: 1, toType: 'array', toIndex: 0 },
  ] as ArrowConnection[])('keeps a $fromType → $toType path outside unrelated data cells', (arrow) => {
    const path = getArrowGeometry(arrow, 470)
    const samples = samplePath(path).slice(5, -5)
    const unrelatedArray = [0, 1, 2, 3]
      .filter((index) => !(arrow.fromType === 'array' && index === arrow.fromIndex) && !(arrow.toType === 'array' && index === arrow.toIndex))
      .map((index) => ({ ...getArrayCellPosition(index), width: CELL_WIDTH, height: CELL_HEIGHT }))
    const unrelatedMap = [0, 1, 2]
      .filter((index) => !(arrow.fromType === 'hashmap' && index === arrow.fromIndex) && !(arrow.toType === 'hashmap' && index === arrow.toIndex))
      .map((index) => ({ ...getHashMapEntryPosition(index), width: CELL_WIDTH, height: CELL_HEIGHT }))

    const collision = samples
      .map((point) => ({ point, rect: [...unrelatedArray, ...unrelatedMap].find((rect) => intersectsRect(point, rect)) }))
      .find((sample) => sample.rect)
    expect(collision).toBeUndefined()
    expect(path.start.x).not.toBe(path.end.x)
  })

  it('keeps short arrow captions out of the calculation card and array cells', () => {
    const geometry = getArrowGeometry({ fromType: 'array', fromIndex: 1, toType: 'calculation', toIndex: 0 }, 470)
    const label = getArrowLabelLayout(geometry, '还差 2', 470, 4)
    const calculationCard = { x: 455, y: ARRAY_Y - 35, width: 260, height: 90 }
    const cell = { ...getArrayCellPosition(1), width: CELL_WIDTH, height: CELL_HEIGHT }

    expect(intersectsRect(label, calculationCard)).toBe(false)
    expect(intersectsRect(label, cell)).toBe(false)
  })

  it('keeps adjacent arrow captions from colliding', () => {
    const first = getArrowGeometry({ fromType: 'array', fromIndex: 0, toType: 'calculation', toIndex: 0 }, 470)
    const second = getArrowGeometry({ fromType: 'array', fromIndex: 1, toType: 'calculation', toIndex: 1 }, 470)
    const firstLabel = getArrowLabelLayout(first, '还差 7', 470, 4)
    const secondLabel = getArrowLabelLayout(second, '还差 2', 470, 4, [firstLabel])
    const overlaps = firstLabel.x < secondLabel.x + secondLabel.width + 5 &&
      firstLabel.x + firstLabel.width + 5 > secondLabel.x &&
      firstLabel.y < secondLabel.y + secondLabel.height + 5 &&
      firstLabel.y + firstLabel.height + 5 > secondLabel.y

    expect(overlaps).toBe(false)
  })

  it('anchors array arrows at the cell edge and hashmap arrows at the card edge', () => {
    const arrayToCalc = getArrowGeometry({ fromType: 'array', fromIndex: 0, toType: 'calculation', toIndex: 0 }, 470)
    const mapToArray = getArrowGeometry({ fromType: 'hashmap', fromIndex: 0, toType: 'array', toIndex: 0 }, 470)

    expect(arrayToCalc.start.y).toBe(ARRAY_Y + CELL_HEIGHT + 4)
    expect(mapToArray.start.x).toBe(getHashMapEntryPosition(0).x + CELL_WIDTH + 4)
    expect(getHashMapEntryPosition(1).y - getHashMapEntryPosition(0).y).toBeGreaterThan(CELL_HEIGHT)
    expect(HASHMAP_ROW_PITCH).toBeGreaterThan(CELL_HEIGHT)
  })
})
