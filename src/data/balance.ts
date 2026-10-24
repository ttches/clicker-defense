/**
 * Every gameplay tuning number, in one place. Values come from
 * `design/pre-alpha-spec.md`; when you change one while playtesting, log it in
 * the tuning log in `design/build-plan.md`.
 *
 * Times are in seconds unless the name says ticks. Distances are world units
 * (the field is `FIELD.width` x `FIELD.height`).
 */

// ---------------------------------------------------------------------------
// The field
// ---------------------------------------------------------------------------

export const FIELD = {
  width: 1600,
  height: 900,
  /** Enemies that reach this x leak (are removed, no bounty). */
  lineX: 200,
  /** Enemies appear just past the right edge. */
  spawnX: 1640,
  /** Vertical bands enemies walk in; only used to spread them out. */
  lanes: 24,
  laneTop: 90,
  laneBottom: 810,
  /** Random vertical offset inside a lane, as a fraction of lane height. */
  laneJitter: 0.3,
} as const

// ---------------------------------------------------------------------------
// Enemies
// ---------------------------------------------------------------------------

export const ENEMY = {
  baseHp: 10,
  /** Seconds to walk from `spawnX` to `lineX`. */
  crossSeconds: 12,
  radius: 13,
} as const

/** Paid on kill; set by max HP, so overkill never increases it. */
export const BOUNTY = {
  base: 0.25,
  perHp: 0.075,
} as const

// ---------------------------------------------------------------------------
// Spawning
// ---------------------------------------------------------------------------

export const SPAWN = {
  /** Enemies per second before the first tower. */
  base: 0.2,
  /** Enemies per second once the first tower is built. */
  firstTower: 0.5,
  /** Spawn rate multiplier per tower after the first: (1 + creep)^(n - 1). */
  creepPerTower: 0.03,
  /**
   * Each gap between spawns is the mean gap times a random factor in this
   * range, so the stream is uneven without bunching badly.
   */
  gapJitter: [0.6, 1.4],
} as const

// ---------------------------------------------------------------------------
// Firing
// ---------------------------------------------------------------------------

export const TOWER = {
  baseCost: 3,
  costGrowth: 1.15,
  shotDamage: 1,
  /** 1 damage every 0.5 s = 2 DPS per tower. */
  shotsPerSecond: 2,
} as const

export const CLICK = {
  shotDamage: 1,
  /** Holding fires every 20 ticks (0.33 s at 60 Hz, about 3 DPS). */
  holdIntervalTicks: 20,
  /** Tapping is capped at twice the hold rate. */
  tapIntervalTicks: 10,
} as const

export const BULLET = {
  /** World units per second. Fast enough to feel snappy, slow enough to see. */
  speed: 1800,
} as const

/**
 * Targeting: every shot (tower or click) picks a uniformly random enemy on
 * screen, skipping any that bullets already in flight will kill. There are no
 * knobs yet; see `src/sim/targeting.ts`.
 */

// ---------------------------------------------------------------------------
// Entity caps
// ---------------------------------------------------------------------------

export const CAPS = {
  maxEnemies: 4096,
  maxBullets: 2048,
} as const

// ---------------------------------------------------------------------------
// Income tracking
// ---------------------------------------------------------------------------

export const INCOME = {
  /** One-second buckets kept for the recent income rate (M6 uses 2 minutes). */
  windowSeconds: 120,
  /** Window the HUD shows as "income/s". */
  hudSeconds: 10,
} as const
