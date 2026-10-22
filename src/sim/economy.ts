import { BOUNTY, CLICK, ENEMY, TOWER } from '@/data/balance'
import { SIMULATION } from '@/engine/config'

export const bountyFor = (enemyHp: number): number =>
  BOUNTY.base + BOUNTY.perHp * enemyHp

export const spawnRate = (towerCount: number): number =>
  towerCount <= 0
    ? ENEMY.baseSpawnPerSecond
    : ENEMY.firstTowerSpawnPerSecond *
      (1 + ENEMY.creepPerTower) ** (towerCount - 1)

export const towerDps = (towerCount: number): number =>
  (Math.max(0, towerCount) * TOWER.bulletDamage * SIMULATION.updatesPerSecond) /
  TOWER.fireIntervalTicks

export const clickDps = (): number =>
  (SIMULATION.updatesPerSecond / CLICK.intervalTicks) * CLICK.damage

export const incoming = (
  towerCount: number,
  enemyHp: number,
  clusterSize = 1,
): number => {
  if (enemyHp <= 0) return 0
  const rate = spawnRate(towerCount) * clusterSize * enemyHp
  return Number.isFinite(rate) && rate > 0 ? rate : 0
}

export const safety = (
  towerCount: number,
  enemyHp: number,
  holding: boolean,
  clusterSize = 1,
): number => {
  const pressure = incoming(towerCount, enemyHp, clusterSize)
  if (pressure <= 0) return Number.POSITIVE_INFINITY
  const damage = towerDps(towerCount) + (holding ? clickDps() : 0)
  return damage / pressure
}

export const nextTowerCost = (towerCount: number): number =>
  TOWER.baseCost * TOWER.costGrowth ** towerCount

export const incomePerSecond = (
  towerCount: number,
  enemyHp: number,
  holding: boolean,
  clusterSize = 1,
): number => {
  if (enemyHp <= 0) return 0
  const damage = towerDps(towerCount) + (holding ? clickDps() : 0)
  const arrivalRate = spawnRate(towerCount) * clusterSize
  const killRate = Math.min(arrivalRate, damage / enemyHp)
  return killRate * bountyFor(enemyHp)
}

export const timeToAfford = (cost: number, ratePerSecond: number): number => {
  if (!Number.isFinite(ratePerSecond) || ratePerSecond <= 0) {
    return Number.POSITIVE_INFINITY
  }
  return cost / ratePerSecond
}
