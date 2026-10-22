import { describe, expect, it } from 'vitest'
import {
  bountyFor,
  clickDps,
  incomePerSecond,
  incoming,
  nextTowerCost,
  safety,
  spawnRate,
  timeToAfford,
  towerDps,
} from '@/sim/economy'

describe('spawnRate', () => {
  it('matches the spec table', () => {
    expect(spawnRate(0)).toBeCloseTo(0.2, 10)
    expect(spawnRate(1)).toBeCloseTo(0.5, 10)
    expect(spawnRate(2)).toBeCloseTo(0.515, 10)
    expect(spawnRate(3)).toBeCloseTo(0.53045, 10)
  })
})

describe('incoming', () => {
  it('multiplies spawn rate by HP', () => {
    expect(incoming(0, 10)).toBeCloseTo(2, 10)
    expect(incoming(1, 10)).toBeCloseTo(5, 10)
    expect(incoming(2, 10)).toBeCloseTo(5.15, 10)
    expect(incoming(3, 10)).toBeCloseTo(5.3045, 10)
  })

  it('applies cluster size to incoming only', () => {
    expect(incoming(1, 10, 3)).toBeCloseTo(15, 10)
  })
})

describe('damage rates', () => {
  it('adds two tower DPS per tower', () => {
    expect(towerDps(0)).toBe(0)
    expect(towerDps(1)).toBeCloseTo(2, 10)
    expect(towerDps(2)).toBeCloseTo(4, 10)
    expect(towerDps(3)).toBeCloseTo(6, 10)
  })

  it('turns a 20-tick hold into exactly three DPS', () => {
    expect(clickDps()).toBe(3)
  })

  it('treats a negative count as no towers', () => {
    expect(towerDps(-1)).toBe(0)
  })
})

describe('safety', () => {
  it('matches the early-game table', () => {
    expect(safety(0, 10, true)).toBeCloseTo(1.5, 10)
    expect(safety(0, 10, false)).toBe(0)
    expect(safety(1, 10, true)).toBe(1)
    expect(safety(1, 10, false)).toBeCloseTo(0.4, 10)
    expect(safety(2, 10, false)).toBeCloseTo(4 / 5.15, 10)
    expect(safety(2, 10, true)).toBeCloseTo(7 / 5.15, 10)
    expect(safety(3, 10, false)).toBeCloseTo(6 / 5.3045, 10)
    expect(safety(3, 10, true)).toBeCloseTo(9 / 5.3045, 10)
    expect(safety(3, 10, false)).toBeGreaterThan(1)
  })

  it('treats no pressure as no danger', () => {
    expect(safety(0, 0, true)).toBe(Number.POSITIVE_INFINITY)
  })

  it('counts every enemy in a cluster', () => {
    expect(safety(3, 10, false, 2)).toBeCloseTo(6 / (5.3045 * 2), 10)
  })
})

describe('nextTowerCost', () => {
  it('grows by 15 percent per owned tower', () => {
    expect(nextTowerCost(0)).toBeCloseTo(3, 10)
    expect(nextTowerCost(1)).toBeCloseTo(3.45, 10)
    expect(nextTowerCost(2)).toBeCloseTo(3.9675, 10)
    expect(nextTowerCost(3)).toBeCloseTo(4.562625, 10)
  })
})

describe('bountyFor', () => {
  it('pays one at ten HP', () => {
    expect(bountyFor(10)).toBeCloseTo(1, 10)
  })

  it('scales with HP', () => {
    expect(bountyFor(25)).toBeCloseTo(2.125, 10)
  })
})

describe('incomePerSecond / timeToAfford', () => {
  it('pays the first tower back in fifteen seconds', () => {
    const income = incomePerSecond(0, 10, true)
    expect(income).toBeCloseTo(0.2, 10)
    expect(timeToAfford(nextTowerCost(0), income)).toBeCloseTo(15, 10)
  })

  it('pays more while holding', () => {
    expect(incomePerSecond(1, 10, true)).toBeCloseTo(0.5, 10)
    expect(incomePerSecond(1, 10, false)).toBeCloseTo(0.2, 10)
  })

  it('is damage-limited when the line cannot kill fast enough', () => {
    expect(incomePerSecond(0, 100, true)).toBeCloseTo((3 / 100) * 7.75, 10)
    expect(incomePerSecond(0, 100, true)).toBeCloseTo(0.2325, 10)
  })

  it('is spawn-limited away from the tie', () => {
    expect(incomePerSecond(3, 10, false)).toBeCloseTo(0.53045, 10)
  })

  it('counts cluster arrivals as spawn-limited income', () => {
    expect(incomePerSecond(0, 10, true, 2)).toBeCloseTo(0.3, 10)
  })

  it('never affords anything without income', () => {
    expect(timeToAfford(3, 0)).toBe(Number.POSITIVE_INFINITY)
  })

  it('handles zero or negative HP without dividing by zero', () => {
    expect(incomePerSecond(0, 0, true)).toBe(0)
    expect(incomePerSecond(0, -10, true)).toBe(0)
    expect(safety(0, 0, true)).toBe(Number.POSITIVE_INFINITY)
    expect(safety(0, -10, true)).toBe(Number.POSITIVE_INFINITY)
    expect(incoming(0, 0)).toBe(0)
  })
})
