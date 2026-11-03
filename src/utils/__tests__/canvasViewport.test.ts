import { describe, expect, it } from 'vitest'
import { getCanvasViewport } from '../canvasViewport'
import { getSceneBounds } from '../canvasLayout'

describe('getCanvasViewport', () => {
  it.each([
    { width: 1044, height: 673 },
    { width: 372, height: 405 },
    { width: 1400, height: 920 },
  ])('centers the complete scene in a $width × $height viewport', ({ width, height }) => {
    const viewport = getCanvasViewport({ width, height, arrayLength: 4 })
    const bounds = getSceneBounds(4)
    const centerX = viewport.x + ((bounds.left + bounds.right) / 2) * viewport.scale
    const centerY = viewport.y + ((bounds.top + bounds.bottom) / 2) * viewport.scale

    expect(centerX).toBeCloseTo(width / 2, 8)
    expect(centerY).toBeCloseTo(height / 2, 8)
  })

  it('uses one stable viewport for the same input regardless of current step', () => {
    const first = getCanvasViewport({ width: 1044, height: 673, arrayLength: 4 })
    const later = getCanvasViewport({ width: 1044, height: 673, arrayLength: 4 })

    expect(later).toEqual(first)
  })

  it('fits large inputs without exceeding the maximum scale', () => {
    const viewport = getCanvasViewport({ width: 1044, height: 673, arrayLength: 100 })

    expect(viewport.scale).toBeLessThanOrEqual(1.2)
    expect(viewport.scale).toBeGreaterThan(0)
  })
})
