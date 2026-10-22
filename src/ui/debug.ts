import type { DrawnCounts } from '@/render/drawn'

export type DebugState = {
  tick: number
  running: boolean
  loops: number
  framesTotal: number
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
export const createDebugState = (): DebugState => ({
  tick: 0,
  running: false,
  loops: 0,
  framesTotal: 0,
  canvas: {
    cssWidth: 0,
    cssHeight: 0,
    dpr: 1,
    pixelRatio: 1,
    bufferWidth: 0,
    bufferHeight: 0,
  },
  drawn: { background: 0 },
})
