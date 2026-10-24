import { FIXED_STEP } from '@/engine/config'
import { ENEMY, FIELD } from '@/data/balance'
import { bountyFor, enemyHp } from '@/sim/economy'
import { pushEvent } from '@/sim/events'
import { addIncome } from '@/sim/income'
import { allocSlot, removeSlot } from '@/sim/pool'
import type { World } from '@/sim/world'

export const ENEMY_COLUMNS = {
  /** Stable id; bullets lock onto this, since slots move on removal. */
  id: Int32Array,
  x: Float64Array,
  y: Float64Array,
  hp: Float64Array,
  maxHp: Float64Array,
  /** Damage carried by bullets already flying at this enemy. */
  pending: Float64Array,
  /** World units per second, walking left. */
  speed: Float64Array,
  bounty: Float64Array,
  /** Tick of the most recent hit, for the hit flash. */
  hitTick: Int32Array,
}

const WALK_SPEED = (FIELD.spawnX - FIELD.lineX) / ENEMY.crossSeconds

const laneHeight = (FIELD.laneBottom - FIELD.laneTop) / FIELD.lanes

/** Add one enemy at the right edge in a random lane. */
export const spawnEnemy = (world: World): void => {
  const { enemies } = world
  const slot = allocSlot(ENEMY_COLUMNS, enemies)
  world.stats.spawned += 1
  if (slot < 0) {
    // Over the cap: drop it, but count it as a leak so the economy stays honest.
    world.stats.dropped += 1
    world.stats.leaks += 1
    return
  }
  const random = world.random.spawn
  const lane = random.int(FIELD.lanes)
  const jitter = random.range(-FIELD.laneJitter, FIELD.laneJitter)
  const hp = enemyHp()
  const id = world.nextEnemyId
  world.nextEnemyId += 1

  enemies.id[slot] = id
  enemies.x[slot] = FIELD.spawnX
  enemies.y[slot] = FIELD.laneTop + (lane + 0.5 + jitter) * laneHeight
  enemies.hp[slot] = hp
  enemies.maxHp[slot] = hp
  enemies.speed[slot] = WALK_SPEED
  enemies.bounty[slot] = bountyFor(hp)
  enemies.hitTick[slot] = -1000
  world.enemySlots.set(id, slot)
}

const removeEnemy = (world: World, slot: number): void => {
  const { enemies, enemySlots } = world
  enemySlots.delete(enemies.id[slot])
  const movedFrom = removeSlot(ENEMY_COLUMNS, enemies, slot)
  if (movedFrom >= 0) enemySlots.set(enemies.id[slot], slot)
}

/** Walk every enemy left; any that reach the line leak (no bounty, no harm). */
export const moveEnemies = (world: World): void => {
  const { enemies } = world
  for (let slot = enemies.count - 1; slot >= 0; slot -= 1) {
    enemies.x[slot] -= enemies.speed[slot] * FIXED_STEP
    if (enemies.x[slot] > FIELD.lineX) continue
    world.stats.leaks += 1
    pushEvent(world.events, {
      type: 'leak',
      x: FIELD.lineX,
      y: enemies.y[slot],
    })
    removeEnemy(world, slot)
  }
}

/** Apply a bullet's damage. Kills pay the enemy's bounty. */
export const damageEnemy = (
  world: World,
  slot: number,
  damage: number,
): void => {
  const { enemies } = world
  enemies.hp[slot] -= damage
  enemies.pending[slot] = Math.max(0, enemies.pending[slot] - damage)
  enemies.hitTick[slot] = world.tick
  const x = enemies.x[slot]
  const y = enemies.y[slot]
  pushEvent(world.events, { type: 'hit', x, y })
  if (enemies.hp[slot] > 1e-9) return

  const bounty = enemies.bounty[slot]
  world.currency += bounty
  world.stats.kills += 1
  world.stats.earned += bounty
  addIncome(world.income, world.tick, bounty)
  pushEvent(world.events, { type: 'kill', x, y, bounty })
  removeEnemy(world, slot)
}
