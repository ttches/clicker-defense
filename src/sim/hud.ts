import { INCOME } from '@/data/balance'
import {
  holdDps,
  incomingHp,
  previewTower,
  safety,
  spawnRate,
  towerDps,
  type TowerPreview,
} from '@/sim/economy'
import { recentRate } from '@/sim/income'
import type { World } from '@/sim/world'

/** Plain numbers the React HUD shows, read from the live world a few times a second. */
export type HudSnapshot = {
  currency: number
  incomePerSecond: number
  towers: number
  spawnRate: number
  incoming: number
  towerDps: number
  holdDps: number
  /** Towers alone vs incoming. */
  safety: number
  /** Towers plus holding fire vs incoming. */
  safetyHolding: number
  holding: boolean
  kills: number
  leaks: number
  onScreen: number
  tower: TowerPreview & { affordable: boolean }
}

export const readHud = (world: World): HudSnapshot => {
  const incoming = incomingHp(world.towers)
  const preview = previewTower(world.towers)
  return {
    currency: world.currency,
    incomePerSecond: recentRate(world.income, world.tick, INCOME.hudSeconds),
    towers: world.towers,
    spawnRate: spawnRate(world.towers),
    incoming,
    towerDps: towerDps(world.towers),
    holdDps: holdDps(),
    safety: safety(towerDps(world.towers), incoming),
    safetyHolding: safety(towerDps(world.towers) + holdDps(), incoming),
    holding: world.manual.holders > 0,
    kills: world.stats.kills,
    leaks: world.stats.leaks,
    onScreen: world.enemies.count,
    tower: { ...preview, affordable: world.currency + 1e-9 >= preview.cost },
  }
}
