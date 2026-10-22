import { describe, expect, it } from 'vitest'
import { CAPS, ENEMY } from '@/data/balance'
import { createRun, laneY } from '@/sim/run'
import { stressEnemies } from '@/ui/stress'

describe('stressEnemies', () => {
  it('fills the requested count with valid lanes and spread positions', () => {
    const run = createRun(7)

    expect(stressEnemies(run, 120)).toBe(120)
    expect(run.enemies.count).toBe(120)
    expect(run.stats.spawned).toBe(120)

    const columns = run.enemies.columns
    for (let index = 0; index < 120; index += 1) {
      const lane = columns.lane[index]
      expect(lane).toBe(index % ENEMY.lanes)
      expect(columns.y[index]).toBeCloseTo(laneY(lane), 5)
      expect(columns.x[index]).toBeGreaterThan(ENEMY.lineX)
      expect(columns.x[index]).toBeLessThanOrEqual(ENEMY.spawnX)
    }
  })

  it('clamps to capacity without overflow leaks', () => {
    const run = createRun(7)

    expect(stressEnemies(run, CAPS.enemies + 50)).toBe(CAPS.enemies)
    expect(run.stats.spawned).toBe(CAPS.enemies)
    expect(run.stats.overflowLeaks).toBe(0)
  })
})
