import { describe, expect, it } from 'vitest'
import { FIELD } from '@/data/balance'
import { fitView, worldToCss } from '@/engine/camera'

describe('fitView', () => {
  it('fits the field exactly at its own aspect ratio', () => {
    const view = fitView(FIELD.width / 2, FIELD.height / 2)
    expect(view.scale).toBeCloseTo(0.5)
    expect(view.left).toBeCloseTo(0)
    expect(view.top).toBeCloseTo(0)
  })

  it('letterboxes a wide canvas on the sides', () => {
    const view = fitView(2000, 450)
    expect(view.scale).toBeCloseTo(0.5)
    expect(view.left).toBeLessThan(0)
    expect(view.right).toBeGreaterThan(FIELD.width)
    expect(view.top).toBeCloseTo(0)
  })

  it('maps world corners to the canvas', () => {
    const view = fitView(800, 450)
    expect(worldToCss(view, FIELD.width, FIELD.height)).toEqual({
      x: 800,
      y: 450,
    })
  })
})
