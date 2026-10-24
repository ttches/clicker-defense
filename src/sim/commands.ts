import { pushEvent } from '@/sim/events'
import { towerCost } from '@/sim/economy'
import type { World } from '@/sim/world'

/**
 * Player input. The UI queues commands; the sim applies them at the start of
 * the next tick, so the same commands on the same ticks replay the same game.
 */
export type Command =
  { type: 'fireDown' } | { type: 'fireUp' } | { type: 'buyTower' }

export const enqueue = (world: World, command: Command): void => {
  world.commands.push(command)
}

const buyTower = (world: World): void => {
  const cost = towerCost(world.towers)
  // A small tolerance so floating-point sums of bounties never block a buy.
  if (world.currency + 1e-9 < cost) return
  world.currency = Math.max(0, world.currency - cost)
  world.towers += 1
  pushEvent(world.events, { type: 'bought', towers: world.towers })
}

export const applyCommands = (world: World): void => {
  for (const command of world.commands) {
    switch (command.type) {
      case 'fireDown':
        world.manual.holders += 1
        world.manual.tapQueued = true
        break
      case 'fireUp':
        world.manual.holders = Math.max(0, world.manual.holders - 1)
        break
      case 'buyTower':
        buyTower(world)
        break
    }
  }
  world.commands.length = 0
}
