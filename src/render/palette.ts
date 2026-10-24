/** Render colors as linear RGB triples in [0, 1]. */
export type Rgb = readonly [number, number, number]

const hex = (value: number): Rgb => [
  ((value >> 16) & 0xff) / 255,
  ((value >> 8) & 0xff) / 255,
  (value & 0xff) / 255,
]

export const PALETTE = {
  void: 0x0a0d0c,
  field: hex(0x121a16),
  laneStripe: hex(0x16201b),
  base: hex(0x0e1411),
  line: hex(0xd8574a),
  gunBody: hex(0x2c6e4f),
  gunBarrel: hex(0x4ee08a),
  towerBody: hex(0x34404c),
  towerBarrel: hex(0xa9b8c6),
  towerGhost: hex(0x1a2420),
  enemyOutline: hex(0x2a100e),
  enemyBody: hex(0xc9584c),
  enemyFlash: hex(0xfff1e0),
  healthBack: hex(0x2a100e),
  healthFill: hex(0x7fe08f),
  clickBullet: hex(0x8fe8ff),
  towerBullet: hex(0xffcf5c),
  spark: hex(0xffd08a),
  killFlash: hex(0xfff3c4),
  leakFlash: hex(0xd8574a),
} as const
