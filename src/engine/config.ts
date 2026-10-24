/** Engine-level settings: the fixed simulation rate. Game tuning lives in `@/data/balance`. */

export const SIMULATION = {
  ticksPerSecond: 60,
} as const

export const FIXED_STEP = 1 / SIMULATION.ticksPerSecond

/** Convert seconds to whole simulation ticks (at least one). */
export const ticksFor = (seconds: number): number =>
  Math.max(1, Math.round(seconds * SIMULATION.ticksPerSecond))
