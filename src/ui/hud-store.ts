import { ENEMY } from '@/data/balance'
import { nextTowerCost, safety, spawnRate, towerDps } from '@/sim/economy'

export type HudValues = {
  currency: number
  enemies: number
  spawnRate: number
  leaks: number
  kills: number
  towers: number
  towerCost: number
  affordable: boolean
  dpsGain: number
  spawnGainPercent: number
  safetyBefore: number
  safetyAfter: number
  towerX: number
  towerY: number
}

const initial: HudValues = {
  currency: 0,
  enemies: 0,
  spawnRate: 0,
  leaks: 0,
  kills: 0,
  towers: 0,
  towerCost: nextTowerCost(0),
  affordable: false,
  dpsGain: towerDps(1) - towerDps(0),
  spawnGainPercent: (spawnRate(1) / spawnRate(0) - 1) * 100,
  safetyBefore: safety(0, ENEMY.baseHp, false),
  safetyAfter: safety(1, ENEMY.baseHp, false),
  towerX: 0,
  towerY: 0,
}

let values = initial
const listeners = new Set<() => void>()

export const publishHud = (next: HudValues): void => {
  values = next
  for (const listener of listeners) listener()
}

export const subscribeHud = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getHudValues = (): HudValues => values
