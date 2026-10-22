export const WORLD = { width: 1920, height: 1080 } as const

export const CAPS = { enemies: 2048, bullets: 2048 } as const

export const ENEMY = {
  baseHp: 10,
  baseSpawnPerSecond: 0.2,
  firstTowerSpawnPerSecond: 0.5,
  creepPerTower: 0.03,
  walkTicks: 720,
  lineX: 80,
  spawnX: 1840,
} as const

export const BOUNTY = { base: 0.25, perHp: 0.075 } as const

export const TOWER = {
  baseCost: 3,
  costGrowth: 1.15,
  bulletDamage: 1,
  fireIntervalTicks: 30,
} as const

export const CLICK = { damage: 1, intervalTicks: 20 } as const

/** M2/M5 upgrade curves; settled data, inert until those milestones wire it. */
export const UPGRADES = {
  damage: { dpsMultiplier: 1.2, baseCost: 10, costGrowth: 1.55 },
  speed: { tiers: 3, rateMultiplier: 1.25, baseCost: 40, costGrowth: 2.5 },
  spawnReduction: {
    creepReductionPerLevel: 0.0025,
    creepFloor: 0.005,
    baseCost: 25,
    costGrowth: 2,
  },
} as const

export const DEFAULT_SEED = 0x00c0ffee
