import { XorShift32 } from '@/engine/math'
import { CAPS } from '@/data/balance'
import { BULLET_COLUMNS } from '@/sim/bullets'
import type { Command } from '@/sim/commands'
import { ENEMY_COLUMNS } from '@/sim/enemies'
import type { IncomeWindow } from '@/sim/income'
import { hydratePool, serializePool, type PoolSnapshot } from '@/sim/pool'
import type { Stats, World } from '@/sim/world'

export const SAVE_VERSION = 1

/** JSON-safe copy of a run. Events are not saved; they are only for effects. */
export type RunSnapshot = {
  version: typeof SAVE_VERSION
  seed: number
  tick: number
  currency: number
  towers: number
  spawn: World['spawn']
  towerFire: World['towerFire']
  manual: World['manual']
  stats: Stats
  income: IncomeWindow
  enemies: PoolSnapshot
  nextEnemyId: number
  bullets: PoolSnapshot
  random: { spawn: number; combat: number }
  commands: Command[]
}

export const serializeRun = (world: World): RunSnapshot => ({
  version: SAVE_VERSION,
  seed: world.seed,
  tick: world.tick,
  currency: world.currency,
  towers: world.towers,
  spawn: { ...world.spawn },
  towerFire: { ...world.towerFire },
  manual: { ...world.manual },
  stats: { ...world.stats },
  income: { buckets: [...world.income.buckets], second: world.income.second },
  enemies: serializePool(ENEMY_COLUMNS, world.enemies),
  nextEnemyId: world.nextEnemyId,
  bullets: serializePool(BULLET_COLUMNS, world.bullets),
  random: {
    spawn: world.random.spawn.getState(),
    combat: world.random.combat.getState(),
  },
  commands: world.commands.map((command) => ({ ...command })),
})

const restoreRandom = (state: number): XorShift32 => {
  const random = new XorShift32()
  random.setState(state)
  return random
}

export const hydrateRun = (snapshot: RunSnapshot): World => {
  if (snapshot.version !== SAVE_VERSION) {
    throw new Error(`Unsupported save version ${String(snapshot.version)}`)
  }
  const enemies = hydratePool(ENEMY_COLUMNS, CAPS.maxEnemies, snapshot.enemies)
  const enemySlots = new Map<number, number>()
  for (let slot = 0; slot < enemies.count; slot += 1) {
    enemySlots.set(enemies.id[slot], slot)
  }
  return {
    seed: snapshot.seed,
    tick: snapshot.tick,
    currency: snapshot.currency,
    towers: snapshot.towers,
    spawn: { ...snapshot.spawn },
    towerFire: { ...snapshot.towerFire },
    manual: { ...snapshot.manual },
    stats: { ...snapshot.stats },
    income: {
      buckets: [...snapshot.income.buckets],
      second: snapshot.income.second,
    },
    enemies,
    enemySlots,
    nextEnemyId: snapshot.nextEnemyId,
    bullets: hydratePool(BULLET_COLUMNS, CAPS.maxBullets, snapshot.bullets),
    random: {
      spawn: restoreRandom(snapshot.random.spawn),
      combat: restoreRandom(snapshot.random.combat),
    },
    commands: snapshot.commands.map((command) => ({ ...command })),
    events: [],
  }
}

/** FNV-1a hash of the saved state, for determinism tests. */
export const hashRun = (world: World): string => {
  const text = JSON.stringify(serializeRun(world))
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}
