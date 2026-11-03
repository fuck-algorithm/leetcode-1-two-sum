import { describe, expect, it } from 'vitest'
import { getArrayCellPosition, getHashMapEntryPosition, getCalculationX, getSceneBounds, layoutPointerLabels, CELL_GAP, CELL_HEIGHT, CELL_WIDTH, HASHMAP_ROW_PITCH } from '../canvasLayout'

describe('canvas layout coordinates', () => {
  it('places same-cell pointer labels on separate rows with a visible gap', () => {
    const labels = layoutPointerLabels([150, 150, 150], ['补数 2', '当前 7', '目标'], -65, 350)
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i]
        const b = labels[j]
        const overlapX = a.x < b.x + b.width + 8 && a.x + a.width + 8 > b.x
        const overlapY = a.y < b.y + b.height + 4 && a.y + a.height + 4 > b.y
        expect(overlapX && overlapY).toBe(false)
      }
    }
  })
  it('keeps every array cell in one stable row with a visible gap', () => {
    const cells = Array.from({ length: 10 }, (_, index) => getArrayCellPosition(index))

    for (let index = 0; index < cells.length - 1; index++) {
      expect(cells[index + 1].x - cells[index].x - CELL_WIDTH).toBe(CELL_GAP)
      expect(cells[index + 1].y).toBe(cells[index].y)
    }
  })

  it('places the calculation card after the array with a clear gap', () => {
    for (const length of [2, 4, 8, 100]) {
      const lastCell = getArrayCellPosition(length - 1)
      const cardX = getCalculationX(length)
      expect(cardX - (lastCell.x + CELL_WIDTH)).toBeGreaterThanOrEqual(40)
    }
  })

  it('scene bounds include every array, card, and hash-map row', () => {
    for (const length of [2, 4, 8]) {
      const bounds = getSceneBounds(length)
      const lastCell = getArrayCellPosition(length - 1)
      const lastEntry = getHashMapEntryPosition(length - 1)
      expect(bounds.right).toBeGreaterThanOrEqual(getCalculationX(length) + 260)
      expect(bounds.bottom).toBeGreaterThanOrEqual(lastCell.y + CELL_HEIGHT)
      expect(bounds.bottom).toBeGreaterThanOrEqual(lastEntry.y + CELL_HEIGHT)
    }
  })

  it('lays each hash entry on its own fixed row without overlap', () => {
    const entries = Array.from({ length: 10 }, (_, index) => getHashMapEntryPosition(index))
    const arrayCell = getArrayCellPosition(0)

    for (let index = 0; index < entries.length - 1; index++) {
      expect(entries[index + 1].x).toBe(entries[index].x)
      expect(entries[index + 1].y - entries[index].y).toBe(HASHMAP_ROW_PITCH)
      expect(entries[index + 1].y - entries[index].y).toBeGreaterThanOrEqual(CELL_HEIGHT + 40)
    }

    expect(entries[0].y).toBeGreaterThan(arrayCell.y + 120)
  })
})
