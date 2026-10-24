import { describe, expect, it } from 'vitest'
import { CLICK } from '@/data/balance'
import { enqueue, type Command } from '@/sim/commands'
import { hashRun, hydrateRun, serializeRun } from '@/sim/save'
import { createRun, step, type World } from '@/sim/world'

const TPS = 60

const advance = (world: World, ticks: number): void => {
  for (let tick = 0; tick < ticks; tick += 1) {
    step(world)
    world.events.length = 0
  }
}

/** Replay a script of commands keyed by tick. */
const play = (
  seed: number,
  ticks: number,
  script: Record<number, Command[]>,
): World => {
  const world = createRun(seed)
  for (let tick = 0; tick < ticks; tick += 1) {
    for (const command of script[tick] ?? []) enqueue(world, command)
    step(world)
    world.events.length = 0
  }
  return world
}

const leakShare = (world: World): number =>
  world.stats.leaks / Math.max(1, world.stats.kills + world.stats.leaks)

/** Fixed tower count, optionally holding fire, for `seconds`. */
const hold = (towers: number, holding: boolean, seconds: number, seed = 1) => {
  const world = createRun(seed)
  world.towers = towers
  if (holding) enqueue(world, { type: 'fireDown' })
  advance(world, seconds * TPS)
  return world
}

const script: Record<number, Command[]> = {
  10: [{ type: 'fireDown' }],
  900: [{ type: 'buyTower' }],
  1500: [{ type: 'fireUp' }],
  1600: [{ type: 'fireDown' }, { type: 'fireUp' }],
  2400: [{ type: 'buyTower' }],
}

describe('determinism', () => {
  it('replays identically for the same seed and inputs', () => {
    expect(hashRun(play(7, 3000, script))).toBe(hashRun(play(7, 3000, script)))
  })

  it('differs across seeds', () => {
    expect(hashRun(play(7, 3000, script))).not.toBe(
      hashRun(play(8, 3000, script)),
    )
  })

  it('continues identically after save and load', () => {
    const original = play(3, 1200, script)
    const restored = hydrateRun(
      JSON.parse(JSON.stringify(serializeRun(original))),
    )
    expect(hashRun(restored)).toBe(hashRun(original))
    advance(original, 1200)
    advance(restored, 1200)
    expect(hashRun(restored)).toBe(hashRun(original))
  })
})

describe('manual fire', () => {
  it('repeats every hold interval while held', () => {
    const world = createRun(1)
    enqueue(world, { type: 'fireDown' })
    advance(world, 600)
    expect(world.stats.shots).toBe(Math.ceil(600 / CLICK.holdIntervalTicks))
  })

  it('caps tapping at twice the hold rate', () => {
    const world = createRun(1)
    for (let tick = 0; tick < 600; tick += 1) {
      enqueue(world, { type: 'fireDown' })
      enqueue(world, { type: 'fireUp' })
      step(world)
    }
    expect(world.stats.shots).toBe(Math.ceil(600 / CLICK.tapIntervalTicks))
  })

  it('stops when released', () => {
    const world = createRun(1)
    enqueue(world, { type: 'fireDown' })
    enqueue(world, { type: 'fireUp' })
    advance(world, 600)
    expect(world.stats.shots).toBe(1)
  })
})

describe('M0 acceptance', () => {
  it('earns the first tower (3) from ~15 s of holding', () => {
    const world = createRun(1)
    enqueue(world, { type: 'fireDown' })
    while (world.currency < 3 && world.tick < 60 * TPS) advance(world, 1)
    const seconds = world.tick / TPS
    expect(seconds).toBeGreaterThan(10)
    expect(seconds).toBeLessThan(20)
  })

  it('holds the line by holding fire with no towers', () => {
    expect(leakShare(hold(0, true, 300))).toBeLessThan(0.02)
  })

  it('pays the bounty only on kills, and never on leaks', () => {
    const world = hold(0, false, 120)
    expect(world.stats.kills).toBe(0)
    expect(world.currency).toBe(0)
    expect(world.stats.leaks).toBeGreaterThan(0)
  })
})

describe('M1 acceptance', () => {
  it('buying a tower costs 3 × 1.15^n and fails when short', () => {
    const world = createRun(1)
    world.currency = 3.4
    enqueue(world, { type: 'buyTower' })
    enqueue(world, { type: 'buyTower' })
    step(world)
    expect(world.towers).toBe(1)
    expect(world.currency).toBeCloseTo(0.4)
  })

  it('1 tower leaks without holding, about breaks even holding', () => {
    expect(leakShare(hold(1, false, 300))).toBeGreaterThan(0.3)
    expect(leakShare(hold(1, true, 300))).toBeLessThan(0.1)
  })

  it('2 towers leak without holding, comfortable holding', () => {
    expect(leakShare(hold(2, false, 300))).toBeGreaterThan(0.05)
    expect(leakShare(hold(2, true, 300))).toBeLessThan(0.02)
  })

  it('3 towers hold without clicking', () => {
    expect(leakShare(hold(3, false, 300))).toBeLessThan(0.02)
  })
})
