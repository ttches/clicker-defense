import { CAPS, CLICK, DEFAULT_SEED, ENEMY, TOWER, WORLD } from '@/data/balance'
import { SIMULATION } from '@/engine/config'
import { clamp, XorShift32 } from '@/engine/math'
import {
  fireAtTarget,
  MAX_EVENTS,
  NO_COMMANDS,
  type Command,
  type SimEvents,
} from '@/sim/combat'
import { bountyFor, nextTowerCost, spawnRate } from '@/sim/economy'
import { buyTower } from '@/sim/purchase'
import {
  createBulletStore,
  createEnemyStore,
  NO_SLOT,
  type Store,
} from '@/sim/store'
import {
  ENEMY_KIND,
  type BulletColumns,
  type ColumnArray,
  type EnemyColumns,
} from '@/sim/types'

export type RunStats = {
  spawned: number
  kills: number
  leaks: number
  overflowLeaks: number
}

export type RunState = {
  readonly seed: number
  tick: number
  currency: number
  /** Fractional progress toward the next spawn, in [0, 1). */
  spawnProgress: number
  /** Ticks remaining before a click can fire again. */
  clickCooldown: number
  /** Accumulated tower fire ticks, always below TOWER.fireIntervalTicks. */
  towerFireTicks: number
  towerCount: number
  readonly enemies: Store<EnemyColumns>
  readonly bullets: Store<BulletColumns>
  readonly spawnRng: XorShift32
  readonly combatRng: XorShift32
  readonly visualRng: XorShift32
  readonly stats: RunStats
}

export type SerializedRun = {
  version: 1
  seed: number
  tick: number
  currency: number
  spawnProgress: number
  clickCooldown: number
  towerFireTicks: number
  towerCount: number
  rng: { spawn: number; combat: number; visual: number }
  nextId: { enemies: number; bullets: number }
  stats: RunStats
  enemies: Array<{
    id: number
    x: number
    y: number
    hp: number
    maxHp: number
    scale: number
    kind: number
    boss: number
    bounty: number
    speed: number
    lane: number
  }>
  bullets: Array<{
    id: number
    x: number
    y: number
    vx: number
    vy: number
    damage: number
    ttlTicks: number
    targetId: number
    kind: number
  }>
}

/** Absorbs float drift at the one-per-tick accumulation boundary. */
const SPAWN_DRIFT = 1e-9

/** Reused removal buffer; stepRun is single-threaded and non-reentrant. */
const leakedSlots: number[] = []

const HASH_OFFSET = 0x811c9dc5
const HASH_PRIME = 0x01000193

const mixHash = (hash: number, value: number): number =>
  Math.imul((hash ^ (value >>> 0)) >>> 0, HASH_PRIME) >>> 0

const numberScratch = new Float64Array(1)
const numberBits = new Uint32Array(numberScratch.buffer)

/** Exact IEEE-754 bits, so distinct states cannot collide by quantisation. */
const mixNumber = (hash: number, value: number): number => {
  numberScratch[0] = value
  return mixHash(mixHash(hash, numberBits[0]), numberBits[1])
}

const mixColumns = (
  hash: number,
  columns: Readonly<Record<string, ColumnArray>>,
  count: number,
): number => {
  let next = hash
  for (const column of Object.values(columns)) {
    if (column instanceof Float32Array) {
      const bits = new Uint32Array(
        column.buffer,
        column.byteOffset,
        column.length,
      )
      for (let index = 0; index < count; index += 1) {
        next = mixHash(next, bits[index])
      }
    } else {
      for (let index = 0; index < count; index += 1) {
        next = mixHash(next, column[index])
      }
    }
  }
  return next
}

export const createRun = (seed = DEFAULT_SEED): RunState => {
  const spawnRng = new XorShift32(seed)
  const combatRng = new XorShift32(seed ^ 0x9e3779b9)
  const visualRng = new XorShift32(seed ^ 0x85ebca6b)

  return {
    seed: spawnRng.state,
    tick: 0,
    currency: 0,
    spawnProgress: 0,
    clickCooldown: 0,
    towerFireTicks: 0,
    towerCount: 0,
    enemies: createEnemyStore(CAPS.enemies),
    bullets: createBulletStore(CAPS.bullets),
    spawnRng,
    combatRng,
    visualRng,
    stats: { spawned: 0, kills: 0, leaks: 0, overflowLeaks: 0 },
  }
}

/** Vertical centre of a lane, in world units. */
export const laneY = (lane: number): number =>
  ((lane + 0.5) * WORLD.height) / ENEMY.lanes

const assertNever = (value: never): never => {
  throw new Error(`unhandled command: ${String(value)}`)
}

export const spawnEnemy = (run: RunState): number => {
  const slot = run.enemies.alloc()
  if (slot === NO_SLOT) {
    run.stats.overflowLeaks += 1
    run.stats.leaks += 1
    return NO_SLOT
  }

  const { columns } = run.enemies
  const lane = clamp(
    Math.floor(run.spawnRng.unit() * ENEMY.lanes),
    0,
    ENEMY.lanes - 1,
  )

  columns.x[slot] = ENEMY.spawnX
  columns.y[slot] = laneY(lane)
  columns.lane[slot] = lane
  columns.maxHp[slot] = ENEMY.baseHp
  columns.hp[slot] = ENEMY.baseHp
  columns.scale[slot] = 1
  columns.kind[slot] = ENEMY_KIND.grunt
  columns.boss[slot] = 0
  columns.bounty[slot] = bountyFor(ENEMY.baseHp)
  columns.speed[slot] = (ENEMY.spawnX - ENEMY.lineX) / ENEMY.walkTicks
  run.stats.spawned += 1

  return slot
}

export const stepRun = (
  run: RunState,
  commands: readonly Command[] = NO_COMMANDS,
  events?: SimEvents,
): void => {
  if (run.clickCooldown > 0) run.clickCooldown -= 1

  // Purchases resolve in command order before spawns, so a tower bought this
  // tick both raises the spawn rate and gets its shot this same tick.
  let wantsFire = false
  for (const command of commands) {
    switch (command.kind) {
      case 'buyTower': {
        const cost = nextTowerCost(run.towerCount)
        if (buyTower(run) && events && events.purchases.length < MAX_EVENTS) {
          events.purchases.push({
            kind: 'tower',
            cost,
            towerCount: run.towerCount,
          })
        }
        break
      }
      case 'fire':
        wantsFire = true
        break
      default:
        assertNever(command)
    }
  }

  run.spawnProgress += spawnRate(run.towerCount) / SIMULATION.updatesPerSecond

  while (run.spawnProgress >= 1 - SPAWN_DRIFT) {
    spawnEnemy(run)
    run.spawnProgress -= 1
  }
  if (run.spawnProgress < 0) run.spawnProgress = 0

  // Multiple fire commands coalesce; a tap into an empty field still burns
  // the cooldown, so rapid tapping cannot beat the hold rate.
  if (wantsFire && run.clickCooldown === 0) {
    fireAtTarget(run, CLICK.damage, 'click', events)
    run.clickCooldown = CLICK.intervalTicks
  }

  // Due tower shots are never banked: if the field is empty they are lost.
  run.towerFireTicks += run.towerCount
  while (run.towerFireTicks >= TOWER.fireIntervalTicks) {
    run.towerFireTicks -= TOWER.fireIntervalTicks
    fireAtTarget(run, TOWER.bulletDamage, 'tower', events)
  }

  const { columns } = run.enemies
  leakedSlots.length = 0
  for (let index = run.enemies.count - 1; index >= 0; index -= 1) {
    columns.x[index] -= columns.speed[index]
    if (columns.x[index] <= ENEMY.lineX) leakedSlots.push(index)
  }
  // Descending order, so each swap-remove only moves already-processed slots.
  for (const slot of leakedSlots) {
    run.enemies.remove(slot)
    run.stats.leaks += 1
  }

  run.tick += 1
}

/**
 * Deterministic hash of simulation state. Visual randomness is deliberately
 * excluded, so cosmetic changes (tracers, particles) cannot move the hash.
 */
export const hashRun = (run: RunState): number => {
  let hash = mixHash(HASH_OFFSET, run.tick)
  hash = mixNumber(hash, run.currency)
  hash = mixNumber(hash, run.spawnProgress)
  hash = mixHash(hash, run.clickCooldown)
  hash = mixHash(hash, run.towerFireTicks)
  hash = mixHash(hash, run.towerCount)
  hash = mixHash(hash, run.spawnRng.state)
  hash = mixHash(hash, run.combatRng.state)
  hash = mixHash(hash, run.enemies.nextId)
  hash = mixHash(hash, run.bullets.nextId)
  hash = mixHash(hash, run.stats.spawned)
  hash = mixHash(hash, run.stats.kills)
  hash = mixHash(hash, run.stats.leaks)
  hash = mixHash(hash, run.stats.overflowLeaks)

  hash = mixHash(hash, run.enemies.count)
  hash = mixColumns(hash, run.enemies.columns, run.enemies.count)
  hash = mixHash(hash, run.bullets.count)
  hash = mixColumns(hash, run.bullets.columns, run.bullets.count)

  return hash >>> 0
}

export const serializeRun = (run: RunState): SerializedRun => {
  const enemyColumns = run.enemies.columns
  const enemies: SerializedRun['enemies'] = []
  for (let index = 0; index < run.enemies.count; index += 1) {
    enemies.push({
      id: enemyColumns.id[index],
      x: enemyColumns.x[index],
      y: enemyColumns.y[index],
      hp: enemyColumns.hp[index],
      maxHp: enemyColumns.maxHp[index],
      scale: enemyColumns.scale[index],
      kind: enemyColumns.kind[index],
      boss: enemyColumns.boss[index],
      bounty: enemyColumns.bounty[index],
      speed: enemyColumns.speed[index],
      lane: enemyColumns.lane[index],
    })
  }

  const bulletColumns = run.bullets.columns
  const bullets: SerializedRun['bullets'] = []
  for (let index = 0; index < run.bullets.count; index += 1) {
    bullets.push({
      id: bulletColumns.id[index],
      x: bulletColumns.x[index],
      y: bulletColumns.y[index],
      vx: bulletColumns.vx[index],
      vy: bulletColumns.vy[index],
      damage: bulletColumns.damage[index],
      ttlTicks: bulletColumns.ttlTicks[index],
      targetId: bulletColumns.targetId[index],
      kind: bulletColumns.kind[index],
    })
  }

  return {
    version: 1,
    seed: run.seed,
    tick: run.tick,
    currency: run.currency,
    spawnProgress: run.spawnProgress,
    clickCooldown: run.clickCooldown,
    towerFireTicks: run.towerFireTicks,
    towerCount: run.towerCount,
    rng: {
      spawn: run.spawnRng.state,
      combat: run.combatRng.state,
      visual: run.visualRng.state,
    },
    nextId: {
      enemies: run.enemies.nextId,
      bullets: run.bullets.nextId,
    },
    stats: { ...run.stats },
    enemies,
    bullets,
  }
}

const requireFinite = (value: number, label: string): void => {
  if (!Number.isFinite(value)) {
    throw new RangeError(`hydrate: ${label} must be finite`)
  }
}

const requireInteger = (value: number, label: string, minimum = 0): void => {
  if (!Number.isInteger(value) || value < minimum) {
    throw new RangeError(`hydrate: ${label} must be an integer >= ${minimum}`)
  }
}

export const hydrateRun = (data: SerializedRun): RunState => {
  if (data.version !== 1) {
    throw new RangeError(`unsupported run version: ${data.version}`)
  }

  requireInteger(data.tick, 'tick')
  requireInteger(data.towerCount, 'towerCount')
  requireFinite(data.currency, 'currency')
  if (data.currency < 0) {
    throw new RangeError('hydrate: currency must be non-negative')
  }
  requireFinite(data.spawnProgress, 'spawnProgress')
  if (data.spawnProgress < 0 || data.spawnProgress >= 1) {
    throw new RangeError('hydrate: spawnProgress must be in [0, 1)')
  }
  requireInteger(data.clickCooldown, 'clickCooldown')
  if (data.clickCooldown > CLICK.intervalTicks) {
    throw new RangeError('hydrate: clickCooldown out of range')
  }
  requireInteger(data.towerFireTicks, 'towerFireTicks')
  if (data.towerFireTicks >= TOWER.fireIntervalTicks) {
    throw new RangeError('hydrate: towerFireTicks out of range')
  }
  requireInteger(data.stats.spawned, 'stats.spawned')
  requireInteger(data.stats.kills, 'stats.kills')
  requireInteger(data.stats.leaks, 'stats.leaks')
  requireInteger(data.stats.overflowLeaks, 'stats.overflowLeaks')

  for (const [name, value] of Object.entries(data.rng)) {
    requireInteger(value, `rng.${name}`, 1)
    if (value > 0xffffffff) {
      throw new RangeError(`hydrate: rng.${name} exceeds uint32`)
    }
  }

  requireInteger(data.nextId.enemies, 'nextId.enemies', 1)
  requireInteger(data.nextId.bullets, 'nextId.bullets', 1)
  if (data.enemies.length > CAPS.enemies) {
    throw new RangeError('hydrate: too many enemies')
  }
  if (data.bullets.length > CAPS.bullets) {
    throw new RangeError('hydrate: too many bullets')
  }

  let maxEnemyId = 0
  const enemyIds = new Set<number>()
  for (const row of data.enemies) {
    requireInteger(row.id, 'enemy.id', 1)
    for (const [key, value] of Object.entries(row)) {
      requireFinite(value, `enemy.${key}`)
    }
    requireInteger(row.lane, 'enemy.lane')
    if (row.lane >= ENEMY.lanes) {
      throw new RangeError('hydrate: enemy.lane out of range')
    }
    if (row.hp < 0 || row.maxHp <= 0 || row.speed < 0) {
      throw new RangeError('hydrate: enemy health or speed out of range')
    }
    if (row.hp > row.maxHp || row.bounty < 0) {
      throw new RangeError('hydrate: enemy bounty or hp out of range')
    }
    if (row.boss !== 0 && row.boss !== 1) {
      throw new RangeError('hydrate: enemy.boss must be 0 or 1')
    }
    if (enemyIds.has(row.id)) {
      throw new RangeError('hydrate: duplicate enemy id')
    }
    enemyIds.add(row.id)
    maxEnemyId = Math.max(maxEnemyId, row.id)
  }
  if (data.nextId.enemies <= maxEnemyId) {
    throw new RangeError('hydrate: enemies.nextId must exceed every id')
  }

  let maxBulletId = 0
  const bulletIds = new Set<number>()
  for (const row of data.bullets) {
    requireInteger(row.id, 'bullet.id', 1)
    for (const [key, value] of Object.entries(row)) {
      requireFinite(value, `bullet.${key}`)
    }
    requireInteger(row.ttlTicks, 'bullet.ttlTicks')
    requireInteger(row.targetId, 'bullet.targetId')
    requireInteger(row.kind, 'bullet.kind')
    if (bulletIds.has(row.id)) {
      throw new RangeError('hydrate: duplicate bullet id')
    }
    bulletIds.add(row.id)
    maxBulletId = Math.max(maxBulletId, row.id)
  }
  if (data.nextId.bullets <= maxBulletId) {
    throw new RangeError('hydrate: bullets.nextId must exceed every id')
  }

  const run = createRun(data.seed)
  run.tick = data.tick
  run.currency = data.currency
  run.spawnProgress = data.spawnProgress
  run.clickCooldown = data.clickCooldown
  run.towerFireTicks = data.towerFireTicks
  run.towerCount = data.towerCount
  run.spawnRng.state = data.rng.spawn
  run.combatRng.state = data.rng.combat
  run.visualRng.state = data.rng.visual
  run.stats.spawned = data.stats.spawned
  run.stats.kills = data.stats.kills
  run.stats.leaks = data.stats.leaks
  run.stats.overflowLeaks = data.stats.overflowLeaks

  const enemyColumns = run.enemies.columns
  for (const row of data.enemies) {
    const slot = run.enemies.alloc()
    if (slot === NO_SLOT) throw new RangeError('enemy store overflow')
    enemyColumns.id[slot] = row.id
    enemyColumns.x[slot] = row.x
    enemyColumns.y[slot] = row.y
    enemyColumns.hp[slot] = row.hp
    enemyColumns.maxHp[slot] = row.maxHp
    enemyColumns.scale[slot] = row.scale
    enemyColumns.kind[slot] = row.kind
    enemyColumns.boss[slot] = row.boss
    enemyColumns.bounty[slot] = row.bounty
    enemyColumns.speed[slot] = row.speed
    enemyColumns.lane[slot] = row.lane
  }
  run.enemies.nextId = data.nextId.enemies

  const bulletColumns = run.bullets.columns
  for (const row of data.bullets) {
    const slot = run.bullets.alloc()
    if (slot === NO_SLOT) throw new RangeError('bullet store overflow')
    bulletColumns.id[slot] = row.id
    bulletColumns.x[slot] = row.x
    bulletColumns.y[slot] = row.y
    bulletColumns.vx[slot] = row.vx
    bulletColumns.vy[slot] = row.vy
    bulletColumns.damage[slot] = row.damage
    bulletColumns.ttlTicks[slot] = row.ttlTicks
    bulletColumns.targetId[slot] = row.targetId
    bulletColumns.kind[slot] = row.kind
  }
  run.bullets.nextId = data.nextId.bullets

  return run
}
