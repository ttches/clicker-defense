import { CAPS, ENEMY } from '@/data/balance'
import { SIMULATION } from '@/engine/config'
import { laneY, spawnEnemy, type RunState } from '@/sim/run'
import { NO_SLOT } from '@/sim/store'

// Two seconds of travel, so the one-second smoke window cannot leak.
const START_MARGIN = Math.ceil(
  ((ENEMY.spawnX - ENEMY.lineX) / ENEMY.walkTicks) *
    SIMULATION.updatesPerSecond *
    2,
)

/** Fills the lane with a fixed wave; used by the `?stress=` smoke pass. */
export const stressEnemies = (run: RunState, requested: number): number => {
  const target = Math.min(Math.max(0, Math.floor(requested)), CAPS.enemies)
  const startX = ENEMY.lineX + START_MARGIN
  const span = ENEMY.spawnX - startX
  const { columns } = run.enemies
  let spawned = 0

  for (let index = 0; index < target; index += 1) {
    const slot = spawnEnemy(run)
    if (slot === NO_SLOT) break
    const lane = index % ENEMY.lanes
    const fraction = target > 1 ? index / (target - 1) : 0
    columns.x[slot] = startX + span * fraction
    columns.y[slot] = laneY(lane)
    columns.lane[slot] = lane
    spawned += 1
  }

  return spawned
}
