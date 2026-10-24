import { SIMULATION } from '@/engine/config'
import { INCOME } from '@/data/balance'

/**
 * Currency earned per second over a rolling window, kept in one-second
 * buckets. The HUD reads a short window; offline (M6) will read the full one.
 */
export type IncomeWindow = {
  buckets: number[]
  /** Whole sim second the newest bucket belongs to. */
  second: number
}

export const createIncomeWindow = (): IncomeWindow => ({
  buckets: Array.from({ length: INCOME.windowSeconds }, () => 0),
  second: 0,
})

const size = (window: IncomeWindow): number => window.buckets.length

/** Move the newest bucket up to `tick`, clearing any skipped seconds. */
const advance = (window: IncomeWindow, tick: number): void => {
  const second = Math.floor(tick / SIMULATION.ticksPerSecond)
  const gap = Math.min(second - window.second, size(window))
  for (let step = 1; step <= gap; step += 1) {
    window.buckets[(window.second + step) % size(window)] = 0
  }
  if (second > window.second) window.second = second
}

export const addIncome = (
  window: IncomeWindow,
  tick: number,
  amount: number,
): void => {
  advance(window, tick)
  window.buckets[window.second % size(window)] += amount
}

/**
 * Average income per second over the last `seconds` full seconds (the
 * current, partial second is left out so the rate doesn't flicker).
 */
export const recentRate = (
  window: IncomeWindow,
  tick: number,
  seconds: number,
): number => {
  advance(window, tick)
  const span = Math.min(seconds, size(window) - 1, window.second)
  if (span <= 0) return 0
  let total = 0
  for (let back = 1; back <= span; back += 1) {
    total += window.buckets[(window.second - back) % size(window)]
  }
  return total / span
}
