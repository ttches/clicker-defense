import { describe, expect, it } from 'vitest'
import {
  createFitCamera,
  screenToWorld,
  viewBounds,
  worldToScreen,
} from '@/engine/camera'

const WORLD = { width: 1920, height: 1080 }

const fit = (width: number, height: number) =>
  createFitCamera({ width, height }, WORLD)

describe('createFitCamera', () => {
  it('shows the whole world at 1920x1080', () => {
    const camera = fit(1920, 1080)

    expect(camera.x).toBe(960)
    expect(camera.y).toBe(540)
    expect(camera.zoom).toBe(1)
    expect(viewBounds(camera)).toEqual({
      left: 0,
      top: 0,
      right: 1920,
      bottom: 1080,
    })
  })

  it('letterboxes a wider viewport while staying centered', () => {
    const camera = fit(3840, 1080)
    const bounds = viewBounds(camera)

    expect(camera.zoom).toBe(1)
    expect(bounds.left).toBe(-960)
    expect(bounds.right).toBe(2880)
    expect(bounds.top).toBe(0)
    expect(bounds.bottom).toBe(1080)
    expect(camera.x).toBe(960)
    expect(camera.y).toBe(540)
  })

  it('accepts an arbitrary world size', () => {
    const camera = createFitCamera(
      { width: 1600, height: 900 },
      {
        width: 3200,
        height: 900,
      },
    )

    expect(camera.zoom).toBe(0.5)
    expect(camera.x).toBe(1600)
    expect(camera.y).toBe(450)
  })
})

describe('screenToWorld / worldToScreen', () => {
  it('round-trips a point with y increasing downward', () => {
    const camera = fit(800, 600)
    const world = screenToWorld(camera, 120, 70)
    const screen = worldToScreen(camera, world.x, world.y)

    expect(screen.x).toBeCloseTo(120, 10)
    expect(screen.y).toBeCloseTo(70, 10)
    expect(world.x).toBeLessThan(camera.x)
    expect(world.y).toBeLessThan(camera.y)
  })

  it('maps the top-left pixel above and left of the center', () => {
    const camera = fit(960, 540)
    const topLeft = screenToWorld(camera, 0, 0)
    const bottomRight = screenToWorld(camera, 960, 540)

    expect(topLeft).toEqual({ x: 0, y: 0 })
    expect(bottomRight).toEqual({ x: 1920, y: 1080 })
  })
})

describe('degenerate viewports', () => {
  it('clamps a zero viewport instead of producing NaN', () => {
    const camera = fit(0, 0)
    const bounds = viewBounds(camera)
    const screen = worldToScreen(camera, 0, 0)

    expect(camera.viewport).toEqual({ width: 1, height: 1 })
    expect(camera.zoom).toBeGreaterThan(0)
    for (const value of [
      camera.x,
      camera.y,
      camera.zoom,
      bounds.left,
      bounds.top,
      bounds.right,
      bounds.bottom,
      screen.x,
      screen.y,
    ]) {
      expect(Number.isFinite(value)).toBe(true)
    }
  })

  it('clamps a negative viewport instead of producing NaN', () => {
    const camera = fit(-800, -600)
    const world = screenToWorld(camera, 10, 10)

    expect(camera.viewport).toEqual({ width: 1, height: 1 })
    expect(Number.isFinite(world.x)).toBe(true)
    expect(Number.isFinite(world.y)).toBe(true)
  })

  it('clamps a degenerate world size instead of producing NaN', () => {
    const camera = createFitCamera(
      { width: 800, height: 600 },
      {
        width: 0,
        height: 0,
      },
    )

    expect(camera.x).toBe(0.5)
    expect(camera.y).toBe(0.5)
    expect(Number.isFinite(camera.zoom)).toBe(true)
  })
})
