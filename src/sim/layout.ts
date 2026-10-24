import { FIELD } from '@/data/balance'

/** Where the player's own gun and the drawn towers sit, left of the line. */

export const GUN = { x: 140, y: FIELD.height / 2, size: 44 } as const

export const TOWER_SIZE = 36

/** How far right of a gun or tower center its bullets start. */
export const MUZZLE_OFFSET = 26

/** Spacing between drawn tower slots, above and below the gun. */
const SLOT_SPACING = 60

/** Towers drawn on the field; past this the HUD shows the count as ×N. */
export const VISIBLE_TOWERS = 12

/**
 * Center of tower slot `index` (0-based): alternating above and below the
 * gun, moving outward.
 */
export const towerSlot = (index: number): { x: number; y: number } => {
  const ring = Math.floor(index / 2) + 1
  const side = index % 2 === 0 ? -1 : 1
  return { x: GUN.x, y: GUN.y + side * ring * SLOT_SPACING }
}
