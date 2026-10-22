import { createDrawnCounts, type DrawnCounts } from '@/render/drawn'

export type DebugState = {
  tick: number
  running: boolean
  loops: number
  framesTotal: number
  currency: number
  enemies: number
  spawnRate: number
  leaks: number
  kills: number
  stress: number
  hudPublishes: number
  renderCalls: number
  renderTriangles: number
  canvas: {
    cssWidth: number
    cssHeight: number
    dpr: number
    pixelRatio: number
    bufferWidth: number
    bufferHeight: number
  }
  drawn: DrawnCounts
}

declare global {
  interface Window {
    __game?: DebugState
  }
}

let frameCount = 0

/** Module-scoped frame counter, so a leaked loop survives a remount. */
export const countFrame = (): void => {
  frameCount += 1
}

export const getFrameCount = (): number => frameCount

/**
 * Live mutable debug handle for the running game, not an immutable snapshot.
 * `drawn` is owned by the renderer; the App writes only the other fields.
 */
export const createDebugState = (
  drawn: DrawnCounts = createDrawnCounts(),
): DebugState => ({
  tick: 0,
  running: false,
  loops: 0,
  framesTotal: 0,
  currency: 0,
  enemies: 0,
  spawnRate: 0,
  leaks: 0,
  kills: 0,
  stress: 0,
  hudPublishes: 0,
  renderCalls: 0,
  renderTriangles: 0,
  canvas: {
    cssWidth: 0,
    cssHeight: 0,
    dpr: 1,
    pixelRatio: 1,
    bufferWidth: 0,
    bufferHeight: 0,
  },
  drawn,
})
