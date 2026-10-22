export type DrawnCounts = {
  background: number
  enemies: number
  tracers: number
  towers: number
}

export const createDrawnCounts = (): DrawnCounts => ({
  background: 0,
  enemies: 0,
  tracers: 0,
  towers: 0,
})
