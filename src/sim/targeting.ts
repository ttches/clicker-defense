import { FIELD } from '@/data/balance'
import type { World } from '@/sim/world'

const EPSILON = 1e-9

/** Scratch list of candidate slots, reused every shot. */
let candidates = new Int32Array(256)

/**
 * Choose an enemy to shoot: a uniformly random one among those on screen
 * that bullets already in flight won't kill. Returns a slot, or -1 for no
 * target.
 */
export const pickTarget = (world: World): number => {
  const { enemies } = world
  if (candidates.length < enemies.count) {
    candidates = new Int32Array(enemies.capacity)
  }

  let count = 0
  for (let slot = 0; slot < enemies.count; slot += 1) {
    if (enemies.x[slot] >= FIELD.width) continue
    if (enemies.hp[slot] - enemies.pending[slot] <= EPSILON) continue
    candidates[count] = slot
    count += 1
  }

  if (count === 0) return -1
  return candidates[world.random.combat.int(count)]
}
