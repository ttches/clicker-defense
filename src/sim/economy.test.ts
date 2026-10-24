import { describe, expect, it } from 'vitest'
import {
  bountyFor,
  holdDps,
  incomingHp,
  previewTower,
  spawnRate,
  towerCost,
  towerDps,
} from '@/sim/economy'

describe('economy formulas (pre-alpha spec §2–3)', () => {
  it('prices towers on the 3 × 1.15^n ladder', () => {
    expect(towerCost(0)).toBeCloseTo(3)
    expect(towerCost(1)).toBeCloseTo(3.45)
    expect(towerCost(10)).toBeCloseTo(3 * 1.15 ** 10)
  })

  it('pays about 1 per base enemy', () => {
    expect(bountyFor(10)).toBeCloseTo(1)
  })

  it('matches the early-game table', () => {
    const rows = [
      { towers: 0, spawn: 0.2, incoming: 2, dps: 0 },
      { towers: 1, spawn: 0.5, incoming: 5, dps: 2 },
      { towers: 2, spawn: 0.515, incoming: 5.15, dps: 4 },
      { towers: 3, spawn: 0.53, incoming: 5.3, dps: 6 },
    ]
    for (const row of rows) {
      expect(spawnRate(row.towers)).toBeCloseTo(row.spawn, 2)
      expect(incomingHp(row.towers)).toBeCloseTo(row.incoming, 1)
      expect(towerDps(row.towers)).toBe(row.dps)
    }
    expect(holdDps()).toBe(3)
  })

  it('previews the first tower as the big spawn jump', () => {
    const preview = previewTower(0)
    expect(preview.cost).toBeCloseTo(3)
    expect(preview.dpsGain).toBe(2)
    expect(preview.spawnChange).toBeCloseTo(1.5)
    expect(preview.safetyBefore).toBe(0)
    expect(preview.safetyAfter).toBeCloseTo(0.4)
    expect(preview.holdingBefore).toBeCloseTo(1.5)
    expect(preview.holdingAfter).toBeCloseTo(1)
  })

  it('previews later towers as +3% spawn', () => {
    const preview = previewTower(2)
    expect(preview.spawnChange).toBeCloseTo(0.03)
    expect(preview.safetyAfter).toBeGreaterThan(1)
  })
})
