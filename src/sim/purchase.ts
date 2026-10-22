import { ENEMY } from '@/data/balance'
import { nextTowerCost, safety, spawnRate, towerDps } from '@/sim/economy'
import type { RunState } from '@/sim/run'

export type TowerPreview = {
  cost: number
  affordable: boolean
  towerCountBefore: number
  towerCountAfter: number
  dpsBefore: number
  dpsAfter: number
  dpsGain: number
  spawnRateBefore: number
  spawnRateAfter: number
  spawnGainPercent: number
  safetyBefore: number
  safetyAfter: number
}

export const canAffordTower = (run: RunState): boolean =>
  run.currency >= nextTowerCost(run.towerCount)

export const buyTower = (run: RunState): boolean => {
  if (!canAffordTower(run)) return false
  run.currency -= nextTowerCost(run.towerCount)
  run.towerCount += 1
  return true
}

export const previewTowerBuy = (
  run: RunState,
  holding: boolean,
  enemyHp: number = ENEMY.baseHp,
  clusterSize = 1,
): TowerPreview => {
  const cost = nextTowerCost(run.towerCount)
  const towerCountBefore = run.towerCount
  const towerCountAfter = towerCountBefore + 1
  const dpsBefore = towerDps(towerCountBefore)
  const dpsAfter = towerDps(towerCountAfter)
  const spawnRateBefore = spawnRate(towerCountBefore)
  const spawnRateAfter = spawnRate(towerCountAfter)

  return {
    cost,
    affordable: canAffordTower(run),
    towerCountBefore,
    towerCountAfter,
    dpsBefore,
    dpsAfter,
    dpsGain: dpsAfter - dpsBefore,
    spawnRateBefore,
    spawnRateAfter,
    spawnGainPercent: (spawnRateAfter / spawnRateBefore - 1) * 100,
    safetyBefore: safety(towerCountBefore, enemyHp, holding, clusterSize),
    safetyAfter: safety(towerCountAfter, enemyHp, holding, clusterSize),
  }
}
