export type DrawnCounts = {
  background: number
  enemies: number
}

export const createDrawnCounts = (): DrawnCounts => ({
  background: 0,
  enemies: 0,
})
