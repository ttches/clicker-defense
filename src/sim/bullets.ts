import { FIXED_STEP, SIMULATION } from '@/engine/config'
import { BULLET, ENEMY, FIELD } from '@/data/balance'
import { damageEnemy } from '@/sim/enemies'
import { pushEvent, type ShotSource } from '@/sim/events'
import { allocSlot, removeSlot } from '@/sim/pool'
import type { World } from '@/sim/world'

/**
 * Bullet kinds. Tracers are the only kind in M0; the column exists so homing
 * missiles can be added later without changing the data model.
 */
export const BULLET_KIND = { tracer: 0, missile: 1 } as const

/** Stored in the `source` column. */
export const SOURCE_CODE: Record<ShotSource, number> = { click: 0, tower: 1 }

export const BULLET_COLUMNS = {
  x: Float64Array,
  y: Float64Array,
  /** Unit direction of travel. */
  dirX: Float64Array,
  dirY: Float64Array,
  speed: Float64Array,
  damage: Float64Array,
  /** Enemy id this bullet is flying at, or -1 for none. */
  targetId: Int32Array,
  kind: Uint8Array,
  source: Uint8Array,
  ageTicks: Int32Array,
}

/** Bullets that haven't landed after this long are removed. */
const MAX_AGE_TICKS = 3 * SIMULATION.ticksPerSecond

/** How close counts as a hit, beyond this tick's travel distance. */
const HIT_RADIUS = ENEMY.radius * 0.6

/**
 * Fire a bullet from (x, y). With a target slot, it locks onto that enemy and
 * reserves its damage there; with -1 it flies straight right (a click with
 * nothing to shoot). Returns false if the bullet cap is full.
 */
export const fireBullet = (
  world: World,
  x: number,
  y: number,
  damage: number,
  targetSlot: number,
  source: ShotSource,
): boolean => {
  const { bullets, enemies } = world
  const slot = allocSlot(BULLET_COLUMNS, bullets)
  if (slot < 0) return false

  let dirX = 1
  let dirY = 0
  let targetId = -1
  if (targetSlot >= 0) {
    targetId = enemies.id[targetSlot]
    enemies.pending[targetSlot] += damage
    const dx = enemies.x[targetSlot] - x
    const dy = enemies.y[targetSlot] - y
    const length = Math.hypot(dx, dy) || 1
    dirX = dx / length
    dirY = dy / length
  }

  bullets.x[slot] = x
  bullets.y[slot] = y
  bullets.dirX[slot] = dirX
  bullets.dirY[slot] = dirY
  bullets.speed[slot] = BULLET.speed
  bullets.damage[slot] = damage
  bullets.targetId[slot] = targetId
  bullets.kind[slot] = BULLET_KIND.tracer
  bullets.source[slot] = SOURCE_CODE[source]
  world.stats.shots += 1
  pushEvent(world.events, { type: 'shot', x, y, source })
  return true
}

const outOfField = (x: number, y: number): boolean =>
  x > FIELD.width + 60 || x < -60 || y < -60 || y > FIELD.height + 60

/**
 * Move bullets. A locked bullet steers toward its target's current position
 * and deals damage when it arrives. If the target is gone (it leaked), the
 * bullet keeps flying straight and fizzles.
 */
export const moveBullets = (world: World): void => {
  const { bullets, enemies, enemySlots } = world

  for (let slot = bullets.count - 1; slot >= 0; slot -= 1) {
    const travel = bullets.speed[slot] * FIXED_STEP
    bullets.ageTicks[slot] += 1
    let x = bullets.x[slot]
    let y = bullets.y[slot]

    const targetId = bullets.targetId[slot]
    const target = targetId >= 0 ? (enemySlots.get(targetId) ?? -1) : -1
    if (targetId >= 0 && target < 0) bullets.targetId[slot] = -1

    if (target >= 0) {
      const dx = enemies.x[target] - x
      const dy = enemies.y[target] - y
      const distance = Math.hypot(dx, dy)
      if (distance <= travel + HIT_RADIUS) {
        damageEnemy(world, target, bullets.damage[slot])
        removeSlot(BULLET_COLUMNS, bullets, slot)
        continue
      }
      bullets.dirX[slot] = dx / distance
      bullets.dirY[slot] = dy / distance
    }

    x += bullets.dirX[slot] * travel
    y += bullets.dirY[slot] * travel
    bullets.x[slot] = x
    bullets.y[slot] = y

    if (outOfField(x, y) || bullets.ageTicks[slot] > MAX_AGE_TICKS) {
      removeSlot(BULLET_COLUMNS, bullets, slot)
    }
  }
}
