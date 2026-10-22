import { describe, expect, it } from 'vitest'
import { CAPS, DEFAULT_SEED, ENEMY, WORLD } from '@/data/balance'
import { SIMULATION } from '@/engine/config'
import { XorShift32 } from '@/engine/math'
import {
  createRun,
  hashRun,
  hydrateRun,
  laneY,
  serializeRun,
  spawnEnemy,
  stepRun,
} from '@/sim/run'
import { NO_SLOT } from '@/sim/store'

const stepTimes = (run: ReturnType<typeof createRun>, ticks: number): void => {
  for (let tick = 0; tick < ticks; tick += 1) stepRun(run)
}

const spawnCadence = Math.round(
  SIMULATION.updatesPerSecond / ENEMY.baseSpawnPerSecond,
)

describe('createRun', () => {
  it('stores the effective seed and starts empty', () => {
    const run = createRun()
    expect(run.seed).toBe(new XorShift32(DEFAULT_SEED).state)
    expect(run.tick).toBe(0)
    expect(run.currency).toBe(0)
    expect(run.spawnProgress).toBe(0)
    expect(run.towerCount).toBe(0)
    expect(run.enemies.count).toBe(0)
    expect(run.bullets.count).toBe(0)
    expect(run.stats).toEqual({
      spawned: 0,
      kills: 0,
      leaks: 0,
      overflowLeaks: 0,
    })
  })

  it('substitutes a zero seed the same way as XorShift32', () => {
    expect(createRun(0).seed).toBe(new XorShift32(0).state)
  })
})

describe('laneY', () => {
  it('centres lanes in the field', () => {
    expect(laneY(0)).toBeCloseTo(WORLD.height / (ENEMY.lanes * 2), 6)
    expect(laneY(ENEMY.lanes - 1)).toBeCloseTo(
      WORLD.height - WORLD.height / (ENEMY.lanes * 2),
      6,
    )
  })
})

describe('determinism', () => {
  it('produces the same hash for the same seed over 600 ticks', () => {
    const first = createRun(1234)
    const second = createRun(1234)
    stepTimes(first, 600)
    stepTimes(second, 600)

    expect(hashRun(first)).toBe(hashRun(second))
  })

  it('differs across seeds', () => {
    const first = createRun(1234)
    const second = createRun(1235)
    stepTimes(first, 600)
    stepTimes(second, 600)

    expect(hashRun(first)).not.toBe(hashRun(second))
  })

  it('changes when currency or tick is perturbed', () => {
    const run = createRun(77)
    stepTimes(run, 10)
    const base = hashRun(run)

    run.currency += 1
    expect(hashRun(run)).not.toBe(base)
    run.currency -= 1
    expect(hashRun(run)).toBe(base)

    run.tick += 1
    expect(hashRun(run)).not.toBe(base)
  })

  it('is identical for two fresh runs regardless of wall-clock', () => {
    const first = createRun()
    const second = createRun()
    expect(hashRun(first)).toBe(hashRun(second))
    stepTimes(first, 100)
    stepTimes(second, 100)
    expect(hashRun(first)).toBe(hashRun(second))
  })

  it('changes when an id counter changes', () => {
    const run = createRun(8)
    const base = hashRun(run)

    run.bullets.nextId += 1
    expect(hashRun(run)).not.toBe(base)
    run.bullets.nextId -= 1
    expect(hashRun(run)).toBe(base)
  })

  it('ignores visual-only randomness', () => {
    const run = createRun(12)
    const base = hashRun(run)

    run.visualRng.nextUint32()
    expect(hashRun(run)).toBe(base)
  })
})

describe('spawn cadence', () => {
  it(`lands the first auto-spawn on tick ${spawnCadence}`, () => {
    const run = createRun(5)
    stepTimes(run, spawnCadence - 1)

    expect(run.stats.spawned).toBe(0)
    expect(run.enemies.count).toBe(0)

    stepRun(run)

    expect(run.tick).toBe(spawnCadence)
    expect(run.stats.spawned).toBe(1)
    expect(run.enemies.count).toBe(1)
  })

  it('spawns ten enemies over ten cadence intervals', () => {
    const run = createRun(5)
    stepTimes(run, spawnCadence * 10)

    expect(run.tick).toBe(spawnCadence * 10)
    expect(run.stats.spawned).toBe(10)
    expect(run.stats.overflowLeaks).toBe(0)
  })
})

describe('walking and leaks', () => {
  it('leaks at the line on tick 720 after a manual spawn', () => {
    const run = createRun(9)
    const slot = spawnEnemy(run)
    const id = run.enemies.columns.id[slot]
    const speed = run.enemies.columns.speed[slot]
    const startX = run.enemies.columns.x[slot]

    expect(slot).toBe(0)
    expect(startX).toBe(ENEMY.spawnX)

    stepRun(run)
    expect(run.enemies.columns.x[slot]).toBeCloseTo(startX - speed, 3)

    for (let tick = 1; tick < ENEMY.walkTicks - 1; tick += 1) stepRun(run)
    expect(run.tick).toBe(ENEMY.walkTicks - 1)
    expect(run.enemies.indexOfId(id)).toBeGreaterThanOrEqual(0)
    expect(run.enemies.columns.x[slot]).toBeCloseTo(
      ENEMY.spawnX - (ENEMY.walkTicks - 1) * speed,
      1,
    )

    stepRun(run)

    expect(run.tick).toBe(ENEMY.walkTicks)
    expect(run.enemies.indexOfId(id)).toBe(-1)
    expect(run.stats.leaks).toBe(1)
    expect(run.stats.spawned).toBe(
      1 + Math.floor(ENEMY.walkTicks / spawnCadence),
    )
  })

  it('keeps earlier auto-spawns alive while the manual one leaks', () => {
    const run = createRun(9)
    const slot = spawnEnemy(run)
    const id = run.enemies.columns.id[slot]
    stepTimes(run, ENEMY.walkTicks)

    expect(run.enemies.indexOfId(id)).toBe(-1)
    expect(run.stats.spawned).toBe(
      1 + Math.floor(ENEMY.walkTicks / spawnCadence),
    )
    expect(run.enemies.count).toBe(Math.floor(ENEMY.walkTicks / spawnCadence))
    expect(run.stats.leaks).toBe(1)
  })
})

describe('swap-remove during motion', () => {
  it('removes one enemy backwards without disturbing the others', () => {
    const run = createRun(11)
    const first = spawnEnemy(run)
    const second = spawnEnemy(run)
    const third = spawnEnemy(run)
    const columns = run.enemies.columns
    const speed = columns.speed[first]

    columns.x[first] = 500
    columns.x[second] = ENEMY.lineX + 0.5
    columns.x[third] = 150
    columns.hp[first] = 3
    columns.hp[third] = 7

    const firstId = columns.id[first]
    const leakedId = columns.id[second]
    const thirdId = columns.id[third]

    stepRun(run)

    expect(run.enemies.count).toBe(2)
    expect(run.enemies.indexOfId(leakedId)).toBe(-1)
    expect(run.enemies.indexOfId(firstId)).toBeGreaterThanOrEqual(0)
    expect(run.enemies.indexOfId(thirdId)).toBeGreaterThanOrEqual(0)
    expect(run.stats.leaks).toBe(1)

    const firstSlot = run.enemies.indexOfId(firstId)
    const thirdSlot = run.enemies.indexOfId(thirdId)

    expect(columns.hp[firstSlot]).toBe(3)
    expect(columns.hp[thirdSlot]).toBe(7)
    expect(columns.x[firstSlot]).toBeCloseTo(500 - speed, 3)
    expect(columns.x[thirdSlot]).toBeCloseTo(150 - speed, 3)
  })
})

describe('capacity overflow', () => {
  it('counts dropped spawns as leaks and overflow leaks', () => {
    const run = createRun(13)

    for (let spawn = 0; spawn < CAPS.enemies; spawn += 1) {
      expect(spawnEnemy(run)).toBe(spawn)
    }

    expect(spawnEnemy(run)).toBe(NO_SLOT)
    expect(run.enemies.count).toBe(CAPS.enemies)
    expect(run.stats.spawned).toBe(CAPS.enemies)
    expect(run.stats.overflowLeaks).toBe(1)
    expect(run.stats.leaks).toBe(1)
  })
})

describe('RNG streams', () => {
  it('updates only the spawn stream in a headless run', () => {
    const run = createRun(21)
    const combatState = run.combatRng.state
    const visualState = run.visualRng.state
    const spawnState = run.spawnRng.state

    stepTimes(run, 600)

    expect(run.spawnRng.state).not.toBe(spawnState)
    expect(run.combatRng.state).toBe(combatState)
    expect(run.visualRng.state).toBe(visualState)
  })
})

describe('serialization', () => {
  it('round-trips a run at tick 900 and stays in sync', () => {
    const run = createRun(2024)
    stepTimes(run, 900)

    const saved = serializeRun(run)
    const restored = hydrateRun(saved)

    expect(hashRun(restored)).toBe(hashRun(run))
    const ids = Array.from(run.enemies.columns.id.slice(0, run.enemies.count))
    const restoredIds = Array.from(
      restored.enemies.columns.id.slice(0, restored.enemies.count),
    )
    expect(restoredIds).toEqual(ids)
    expect(restored.enemies.count).toBe(run.enemies.count)
    expect(restored.enemies.nextId).toBe(run.enemies.nextId)

    stepTimes(run, 300)
    stepTimes(restored, 300)

    expect(restored.tick).toBe(run.tick)
    expect(hashRun(restored)).toBe(hashRun(run))
  })

  it('survives a JSON round-trip', () => {
    const run = createRun(33)
    stepTimes(run, 640)
    const cloned = JSON.parse(JSON.stringify(serializeRun(run)))

    expect(hashRun(hydrateRun(cloned))).toBe(hashRun(run))
  })

  it('rejects an invalid snapshot', () => {
    const data = serializeRun(createRun(3))

    expect(() => hydrateRun({ ...data, spawnProgress: 1 })).toThrow(RangeError)
    expect(() => hydrateRun({ ...data, currency: Number.NaN })).toThrow(
      RangeError,
    )
    expect(() =>
      hydrateRun({ ...data, nextId: { ...data.nextId, enemies: 0 } }),
    ).toThrow(RangeError)
  })

  it('round-trips bullet rows', () => {
    const run = createRun(44)
    const slot = run.bullets.alloc()
    const columns = run.bullets.columns
    columns.id[slot] = 91
    columns.x[slot] = 12
    columns.y[slot] = 34
    columns.vx[slot] = -1
    columns.vy[slot] = 0.5
    columns.damage[slot] = 1
    columns.ttlTicks[slot] = 30
    columns.targetId[slot] = 7
    columns.kind[slot] = 0
    run.bullets.nextId = 92

    const restored = hydrateRun(serializeRun(run))

    expect(restored.bullets.count).toBe(1)
    expect(restored.bullets.columns.id[0]).toBe(91)
    expect(restored.bullets.columns.x[0]).toBe(12)
    expect(restored.bullets.columns.targetId[0]).toBe(7)
    expect(restored.bullets.nextId).toBe(run.bullets.nextId)
    expect(hashRun(restored)).toBe(hashRun(run))
  })
})
