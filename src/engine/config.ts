export const SIMULATION = {
  updatesPerSecond: 60,
} as const

export const FIXED_STEP = 1 / SIMULATION.updatesPerSecond

export const MAX_FRAME_SECONDS = 0.1

export const DPR_CAP = 2

export const CAMERA = {
  cullMargin: 32,
} as const
