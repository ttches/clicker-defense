import { FIELD } from '@/data/balance'

/**
 * A fixed camera that fits the whole field inside the canvas, centered, with
 * extra space shown on the longer side. Y increases downward. Adapted from
 * eco-evo's camera, minus panning and zoom (not needed yet).
 */
export type View = {
  /** Canvas size in CSS pixels. */
  readonly cssWidth: number
  readonly cssHeight: number
  /** CSS pixels per world unit. */
  readonly scale: number
  /** Visible world rectangle. */
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

export const fitView = (cssWidth: number, cssHeight: number): View => {
  const width = Math.max(1, cssWidth)
  const height = Math.max(1, cssHeight)
  const scale = Math.min(width / FIELD.width, height / FIELD.height)
  const halfWidth = width / scale / 2
  const halfHeight = height / scale / 2
  const centerX = FIELD.width / 2
  const centerY = FIELD.height / 2
  return {
    cssWidth: width,
    cssHeight: height,
    scale,
    left: centerX - halfWidth,
    right: centerX + halfWidth,
    top: centerY - halfHeight,
    bottom: centerY + halfHeight,
  }
}

/** World point → CSS pixels relative to the canvas's top-left corner. */
export const worldToCss = (
  view: View,
  x: number,
  y: number,
): { x: number; y: number } => ({
  x: (x - view.left) * view.scale,
  y: (y - view.top) * view.scale,
})
