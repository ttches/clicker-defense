import { deriveSeed, XorShift32 } from '@/engine/math'
import { CAPS } from '@/data/balance'
import { BULLET_COLUMNS, moveBullets } from '@/sim/bullets'
import { applyCommands, type Command } from '@/sim/commands'
import { ENEMY_COLUMNS, moveEnemies } from '@/sim/enemies'
import type { GameEvent } from '@/sim/events'
import { tickManualFire, tickSpawner, tickTowerFire } from '@/sim/firing'
import { createIncomeWindow, type IncomeWindow } from '@/sim/income'
import { createPool, type Pool } from '@/sim/pool'

export const DEFAULT_SEED = 0x5eed1e55

/** Independent RNG streams, so changing one system never shifts another. */
export const RANDOM_STREAMS = { spawn: 0, combat: 1 } as const

export type Stats = {
  spawned: number
  kills: number
  leaks: number
  /** Spawns dropped because the enemy cap was full (also counted as leaks). */
  dropped: number
  earned: number
  shots: number
}

/**
 * The whole state of one run. Everything except `events` is game state and
 * is saved by `serializeRun`.
 */
export type World = {
  readonly seed: number
  tick: number
  currency: number
  towers: number
  spawn: {
    /** Spawns owed since the last one, in units of "one enemy". */
    progress: number
    /** Progress needed for the next spawn (jittered around 1). */
    nextGap: number
  }
  towerFire: {
    /** Tower shots owed; fires while at least 1. */
    progress: number
    /** Shots fired so far, used to rotate which tower fires. */
    shots: number
  }
  manual: {
    /** Pointers or keys currently holding fire. */
    holders: number
    tapQueued: boolean
    lastShotTick: number
  }
  stats: Stats
  income: IncomeWindow
  enemies: Pool<typeof ENEMY_COLUMNS>
  /** Enemy id → current slot. Rebuilt on load. */
  enemySlots: Map<number, number>
  nextEnemyId: number
  bullets: Pool<typeof BULLET_COLUMNS>
  random: { spawn: XorShift32; combat: XorShift32 }
  commands: Command[]
  events: GameEvent[]
}

export const createStats = (): Stats => ({
  spawned: 0,
  kills: 0,
  leaks: 0,
  dropped: 0,
  earned: 0,
  shots: 0,
})

export const createRun = (seed = DEFAULT_SEED): World => {
  const effectiveSeed = seed >>> 0 || DEFAULT_SEED
  return {
    seed: effectiveSeed,
    tick: 0,
    currency: 0,
    towers: 0,
    // The first enemy arrives after half a normal gap.
    spawn: { progress: 0, nextGap: 0.5 },
    towerFire: { progress: 0, shots: 0 },
    manual: { holders: 0, tapQueued: false, lastShotTick: -1000 },
    stats: createStats(),
    income: createIncomeWindow(),
    enemies: createPool(ENEMY_COLUMNS, CAPS.maxEnemies),
    enemySlots: new Map(),
    nextEnemyId: 0,
    bullets: createPool(BULLET_COLUMNS, CAPS.maxBullets),
    random: {
      spawn: new XorShift32(deriveSeed(effectiveSeed, RANDOM_STREAMS.spawn)),
      combat: new XorShift32(deriveSeed(effectiveSeed, RANDOM_STREAMS.combat)),
    },
    commands: [],
    events: [],
  }
}

/** Advance the run by one fixed tick. */
export const step = (world: World): void => {
  applyCommands(world)
  tickSpawner(world)
  moveEnemies(world)
  tickManualFire(world)
  tickTowerFire(world)
  moveBullets(world)
  world.tick += 1
}
