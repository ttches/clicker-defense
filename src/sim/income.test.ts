import { describe, expect, it } from 'vitest'
import { addIncome, createIncomeWindow, recentRate } from '@/sim/income'

const TPS = 60

describe('income window', () => {
  it('averages full seconds only', () => {
    const window = createIncomeWindow()
    addIncome(window, 0, 2)
    addIncome(window, 1 * TPS, 4)
    addIncome(window, 2 * TPS, 100) // current second, not counted yet
    expect(recentRate(window, 2 * TPS, 10)).toBeCloseTo(3)
  })

  it('forgets income older than the window asked for', () => {
    const window = createIncomeWindow()
    addIncome(window, 0, 50)
    expect(recentRate(window, 20 * TPS, 10)).toBe(0)
  })

  it('clears buckets skipped by a long gap', () => {
    const window = createIncomeWindow()
    addIncome(window, 0, 10)
    addIncome(window, 500 * TPS, 1)
    expect(recentRate(window, 501 * TPS, 120)).toBeCloseTo(1 / 120)
  })
})
