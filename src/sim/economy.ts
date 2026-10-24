import { SIMULATION } from '@/engine/config'
import { BOUNTY, CLICK, ENEMY, SPAWN, TOWER } from '@/data/balance'

/**
 * Pure economy formulas from the pre-alpha spec. No state, no side effects, so
 * the game, the HUD preview, and the tests all use the same math.
 */

export const towerCost = (owned: number): number =>
  TOWER.baseCost * TOWER.costGrowth ** owned

export const enemyHp = (): number => ENEMY.baseHp

export const bountyFor = (maxHp: number): number =>
  BOUNTY.base + BOUNTY.perHp * maxHp

/** Enemies per second for a given tower count. */
export const spawnRate = (towers: number): number =>
  towers <= 0
    ? SPAWN.base
    : SPAWN.firstTower * (1 + SPAWN.creepPerTower) ** (towers - 1)

export const towerDps = (towers: number): number =>
  towers * TOWER.shotDamage * TOWER.shotsPerSecond

/** DPS from holding the fire button. */
export const holdDps = (): number =>
  (CLICK.shotDamage * SIMULATION.ticksPerSecond) / CLICK.holdIntervalTicks

/** Enemy HP arriving per second. */
export const incomingHp = (towers: number): number =>
  spawnRate(towers) * enemyHp()

/** DPS ÷ incoming HP. Above 1 holds the line, below 1 leaks. */
export const safety = (dps: number, incoming: number): number =>
  incoming > 0 ? dps / incoming : Infinity

export type TowerPreview = {
  cost: number
  dpsGain: number
  /** Spawn change as a fraction, e.g. 0.03 for +3%. */
  spawnChange: number
  safetyBefore: number
  safetyAfter: number
  holdingBefore: number
  holdingAfter: number
}

/** What buying one more tower would change. */
export const previewTower = (towers: number): TowerPreview => {
  const next = towers + 1
  const incomingBefore = incomingHp(towers)
  const incomingAfter = incomingHp(next)
  return {
    cost: towerCost(towers),
    dpsGain: towerDps(next) - towerDps(towers),
    spawnChange: spawnRate(next) / spawnRate(towers) - 1,
    safetyBefore: safety(towerDps(towers), incomingBefore),
    safetyAfter: safety(towerDps(next), incomingAfter),
    holdingBefore: safety(towerDps(towers) + holdDps(), incomingBefore),
    holdingAfter: safety(towerDps(next) + holdDps(), incomingAfter),
  }
}
