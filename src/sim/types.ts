/** Sentinel for "no entity" or "no target"; allocated ids start at 1. */
export const NO_TARGET = 0

export const ENEMY_KIND = {
  grunt: 0,
} as const

export type EnemyKind = (typeof ENEMY_KIND)[keyof typeof ENEMY_KIND]

export const BULLET_KIND = {
  tracer: 0,
} as const

export type BulletKind = (typeof BULLET_KIND)[keyof typeof BULLET_KIND]

export type ColumnArray = Uint8Array | Uint16Array | Uint32Array | Float32Array

export type ColumnSpec = {
  readonly id: new (capacity: number) => Uint32Array
  readonly [key: string]: new (capacity: number) => ColumnArray
}

export type ColumnsOf<S extends ColumnSpec> = {
  readonly [K in keyof S]: InstanceType<S[K]>
}

export const ENEMY_COLUMNS = {
  id: Uint32Array,
  x: Float32Array,
  y: Float32Array,
  hp: Float32Array,
  maxHp: Float32Array,
  scale: Float32Array,
  kind: Uint8Array,
  boss: Uint8Array,
  bounty: Float32Array,
  speed: Float32Array,
} as const satisfies ColumnSpec

export type EnemyColumns = ColumnsOf<typeof ENEMY_COLUMNS>

export const BULLET_COLUMNS = {
  id: Uint32Array,
  x: Float32Array,
  y: Float32Array,
  vx: Float32Array,
  vy: Float32Array,
  damage: Float32Array,
  /** Remaining lifetime in simulation ticks. */
  ttlTicks: Uint16Array,
  targetId: Uint32Array,
  kind: Uint8Array,
} as const satisfies ColumnSpec

export type BulletColumns = ColumnsOf<typeof BULLET_COLUMNS>
