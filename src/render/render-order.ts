/**
 * Draw order for world layers. Depth writes are off, so `renderOrder` is the
 * only ordering axis; add new layers here rather than inventing literals.
 */
export const RENDER_ORDER = {
  ground: -3,
  edge: -2,
  enemies: 0,
  tracers: 1,
} as const
