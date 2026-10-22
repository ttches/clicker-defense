import { ENEMY, WORLD } from '@/data/balance'
import type { RunState } from '@/sim/run'

export type Command = { readonly kind: 'fire' }

export type ShotEvent = {
  kind: 'click' | 'tower'
  fromX: number
  fromY: number
  toX: number
  toY: number
}

export type KillEvent = {
  x: number
  y: number
  bounty: number
}

/** Visual sink. The caller clears both arrays once per render frame. */
export type SimEvents = {
  shots: ShotEvent[]
  kills: KillEvent[]
}

export const FIRE_COMMANDS: readonly Command[] = [{ kind: 'fire' }]

export const NO_COMMANDS: readonly Command[] = []

const MAX_EVENTS = 512

/**
 * Bosses outrank grunts; within a group the front-most (smallest x) wins.
 * Linear over slots because target counts are small at pre-alpha scale.
 */
export const findTarget = (run: RunState): number => {
  const { columns, count } = run.enemies
  let best = -1
  let bestX = Number.POSITIVE_INFINITY

  for (let slot = 0; slot < count; slot += 1) {
    if (columns.boss[slot] !== 1) continue
    const x = columns.x[slot]
    if (x < bestX) {
      best = slot
      bestX = x
    }
  }
  if (best !== -1) return best

  for (let slot = 0; slot < count; slot += 1) {
    const x = columns.x[slot]
    if (x < bestX) {
      best = slot
      bestX = x
    }
  }
  return best
}

/**
 * Damage lands at fire time. Overkill never raises the payout: bounty comes
 * from the enemy's stored value and is granted exactly once, on removal.
 */
export const fireAtTarget = (
  run: RunState,
  damage: number,
  kind: 'click' | 'tower',
  events?: SimEvents,
): boolean => {
  const slot = findTarget(run)
  if (slot === -1) return false

  const { columns } = run.enemies
  const toX = columns.x[slot]
  const toY = columns.y[slot]
  columns.hp[slot] -= damage

  if (events && events.shots.length < MAX_EVENTS) {
    events.shots.push({
      kind,
      fromX: ENEMY.lineX,
      fromY: run.visualRng.range(0, WORLD.height),
      toX,
      toY,
    })
  }

  if (columns.hp[slot] <= 0) {
    const bounty = columns.bounty[slot]
    run.currency += bounty
    run.stats.kills += 1
    if (events && events.kills.length < MAX_EVENTS) {
      events.kills.push({ x: toX, y: toY, bounty })
    }
    run.enemies.remove(slot)
  }

  return true
}
