import { SIMULATION } from '@/engine/config'
import { CLICK, SPAWN, TOWER } from '@/data/balance'
import { fireBullet } from '@/sim/bullets'
import { spawnEnemy } from '@/sim/enemies'
import { spawnRate } from '@/sim/economy'
import { GUN, MUZZLE_OFFSET, towerSlot, VISIBLE_TOWERS } from '@/sim/layout'
import { pickTarget } from '@/sim/targeting'
import type { World } from '@/sim/world'

const TPS = SIMULATION.ticksPerSecond

/** Spawn enemies at the current rate, with jittered gaps. */
export const tickSpawner = (world: World): void => {
  const { spawn } = world
  spawn.progress += spawnRate(world.towers) / TPS
  while (spawn.progress >= spawn.nextGap) {
    spawn.progress -= spawn.nextGap
    spawn.nextGap = world.random.spawn.range(...SPAWN.gapJitter)
    spawnEnemy(world)
  }
}

/**
 * The player's gun: a tap fires once (at most every `tapIntervalTicks`), and
 * holding repeats every `holdIntervalTicks`. A tap made too soon is kept and
 * fires as soon as the cooldown allows.
 */
export const tickManualFire = (world: World): void => {
  const { manual } = world
  const since = world.tick - manual.lastShotTick
  const tapReady = manual.tapQueued && since >= CLICK.tapIntervalTicks
  const holdReady = manual.holders > 0 && since >= CLICK.holdIntervalTicks
  if (!tapReady && !holdReady) return

  manual.tapQueued = false
  manual.lastShotTick = world.tick
  fireBullet(
    world,
    GUN.x + MUZZLE_OFFSET,
    GUN.y,
    CLICK.shotDamage,
    pickTarget(world),
    'click',
  )
}

/**
 * Towers fire as one pooled stream: `towers × shotsPerSecond` shots per
 * second, each from the next drawn tower in turn. With nothing to shoot, at
 * most one shot is kept ready, so idle time never banks a burst.
 */
export const tickTowerFire = (world: World): void => {
  const { towerFire } = world
  if (world.towers <= 0) return
  towerFire.progress += (world.towers * TOWER.shotsPerSecond) / TPS

  while (towerFire.progress >= 1) {
    const target = pickTarget(world)
    if (target < 0) {
      towerFire.progress = 1
      return
    }
    const origin = towerSlot(
      towerFire.shots % Math.min(world.towers, VISIBLE_TOWERS),
    )
    const fired = fireBullet(
      world,
      origin.x + MUZZLE_OFFSET,
      origin.y,
      TOWER.shotDamage,
      target,
      'tower',
    )
    if (!fired) {
      towerFire.progress = 1
      return
    }
    towerFire.shots += 1
    towerFire.progress -= 1
  }
}
