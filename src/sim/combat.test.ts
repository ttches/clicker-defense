import { describe, expect, it } from 'vitest'
import { CLICK, ENEMY, TOWER, WORLD } from '@/data/balance'
import {
  findTarget,
  fireAtTarget,
  FIRE_COMMANDS,
  NO_COMMANDS,
  type SimEvents,
} from '@/sim/combat'
import { bountyFor } from '@/sim/economy'
import {
  createRun,
  hashRun,
  hydrateRun,
  serializeRun,
  spawnEnemy,
  stepRun,
  type RunState,
} from '@/sim/run'

const spawnAt = (
  run: RunState,
  x: number,
  hp: number = ENEMY.baseHp,
): number => {
  const slot = spawnEnemy(run)
  const { columns } = run.enemies
  columns.x[slot] = x
  columns.hp[slot] = hp
  columns.maxHp[slot] = hp
  return slot
}

const sink = (): SimEvents => ({ shots: [], kills: [] })

/** Fires on ticks where run.tick % every === 0. */
const stepScheduled = (
  run: RunState,
  ticks: number,
  every = 7,
  events?: SimEvents,
): void => {
  for (let index = 0; index < ticks; index += 1) {
    const commands = run.tick % every === 0 ? FIRE_COMMANDS : NO_COMMANDS
    stepRun(run, commands, events)
  }
}

describe('findTarget', () => {
  it('picks the global front-most enemy across lanes', () => {
    const run = createRun(1)
    spawnAt(run, 1200)
    spawnAt(run, 500)
    spawnAt(run, 900)

    expect(findTarget(run)).toBe(1)
  })

  it('returns -1 when the field is empty', () => {
    expect(findTarget(createRun(1))).toBe(-1)
  })

  it('prioritises bosses even when they are farther back', () => {
    const run = createRun(2)
    spawnAt(run, 500)
    const boss = spawnAt(run, 1200)
    run.enemies.columns.boss[boss] = 1

    expect(findTarget(run)).toBe(boss)
  })
})

describe('fireAtTarget', () => {
  it('hits the front-most enemy first, then the next', () => {
    const run = createRun(3)
    const far = spawnAt(run, 1200)
    const front = spawnAt(run, 500)
    const middle = spawnAt(run, 900)
    const { columns } = run.enemies
    const frontId = columns.id[front]
    const middleId = columns.id[middle]
    const farId = columns.id[far]

    for (let shot = 0; shot < 5; shot += 1) {
      fireAtTarget(run, 1, 'click')
    }

    expect(columns.hp[front]).toBe(5)
    expect(columns.hp[middle]).toBe(ENEMY.baseHp)
    expect(columns.hp[far]).toBe(ENEMY.baseHp)

    for (let shot = 0; shot < 5; shot += 1) {
      fireAtTarget(run, 1, 'click')
    }

    expect(run.enemies.count).toBe(2)
    expect(run.enemies.indexOfId(frontId)).toBe(-1)
    expect(findTarget(run)).toBe(run.enemies.indexOfId(middleId))

    fireAtTarget(run, 1, 'click')

    expect(columns.hp[run.enemies.indexOfId(middleId)]).toBe(ENEMY.baseHp - 1)
    expect(columns.hp[run.enemies.indexOfId(farId)]).toBe(ENEMY.baseHp)
  })

  it('damages a boss before a nearer grunt', () => {
    const run = createRun(4)
    const grunt = spawnAt(run, 500)
    const boss = spawnAt(run, 1200)
    run.enemies.columns.boss[boss] = 1

    fireAtTarget(run, 1, 'click')

    expect(run.enemies.columns.hp[boss]).toBe(ENEMY.baseHp - 1)
    expect(run.enemies.columns.hp[grunt]).toBe(ENEMY.baseHp)
  })

  it('returns false and does nothing without a target', () => {
    const run = createRun(5)
    const events = sink()

    expect(fireAtTarget(run, 1, 'click', events)).toBe(false)
    expect(events.shots).toHaveLength(0)
    expect(events.kills).toHaveLength(0)
    expect(run.currency).toBe(0)
    expect(run.stats.kills).toBe(0)
  })

  it('pays bounty once and grants no extra on overkill', () => {
    const run = createRun(6)
    const slot = spawnAt(run, 1000, 1)
    const bounty = run.enemies.columns.bounty[slot]

    fireAtTarget(run, 5, 'click')

    expect(run.enemies.count).toBe(0)
    expect(run.stats.kills).toBe(1)
    expect(bounty).toBe(bountyFor(ENEMY.baseHp))
    expect(run.currency).toBe(bounty)

    fireAtTarget(run, 5, 'click')

    expect(run.stats.kills).toBe(1)
    expect(run.currency).toBe(bounty)
  })

  it('reports geometry at the pre-hit target position', () => {
    const run = createRun(7)
    const slot = spawnAt(run, 1234)
    const { columns } = run.enemies
    const targetY = columns.y[slot]
    const events = sink()

    stepRun(run, FIRE_COMMANDS, events)

    expect(events.shots).toHaveLength(1)
    const [shot] = events.shots
    expect(shot.kind).toBe('click')
    expect(shot.fromX).toBe(ENEMY.lineX)
    expect(shot.toX).toBe(1234)
    expect(shot.toY).toBe(targetY)
    expect(shot.fromY).toBeGreaterThanOrEqual(0)
    expect(shot.fromY).toBeLessThanOrEqual(WORLD.height)
  })

  it('reports a kill event with the payout position', () => {
    const run = createRun(17)
    const slot = spawnAt(run, 777, 1)
    const targetY = run.enemies.columns.y[slot]
    const events = sink()

    fireAtTarget(run, 1, 'click', events)

    expect(events.kills).toEqual([
      { x: 777, y: targetY, bounty: bountyFor(ENEMY.baseHp) },
    ])
  })
})

describe('click cadence', () => {
  it('fires on ticks 1/21/41/61/81 while held', () => {
    const run = createRun(8)
    const slot = spawnAt(run, 1600, 1000)
    const shotTicks: number[] = []

    for (let index = 0; index < 100; index += 1) {
      const events = sink()
      stepRun(run, FIRE_COMMANDS, events)
      if (events.shots.length > 0) shotTicks.push(run.tick)
    }

    expect(shotTicks).toEqual([1, 21, 41, 61, 81])
    expect(run.enemies.columns.hp[slot]).toBe(995)
    expect(1000 - run.enemies.columns.hp[slot]).toBe(5)
  })

  it('caps tap spam at the hold cadence', () => {
    const run = createRun(9)
    spawnAt(run, 1600, 1000)

    for (let index = 0; index < 100; index += 1) {
      const commands = index % 5 === 0 ? FIRE_COMMANDS : NO_COMMANDS
      stepRun(run, commands)
    }

    expect(1000 - run.enemies.columns.hp[0]).toBe(5)
  })

  it('burns the cooldown on a tap into an empty field', () => {
    const run = createRun(10)
    const events = sink()

    stepRun(run, FIRE_COMMANDS, events)

    expect(events.shots).toHaveLength(0)
    expect(run.clickCooldown).toBe(CLICK.intervalTicks)
  })
})

describe('tower fire', () => {
  it('fires every 30 ticks, independent of commands', () => {
    const run = createRun(11)
    const slot = spawnAt(run, 1600, 1000)
    run.towerCount = 1
    const shotTicks: number[] = []
    const events = sink()

    for (let index = 0; index < 100; index += 1) {
      const before = events.shots.length
      stepRun(run, NO_COMMANDS, events)
      if (events.shots.length > before) shotTicks.push(run.tick)
    }

    expect(shotTicks).toEqual([30, 60, 90])
    expect(events.shots).toHaveLength(3)
    expect(events.shots.every((shot) => shot.kind === 'tower')).toBe(true)
    expect(1000 - run.enemies.columns.hp[slot]).toBe(3)
    expect(run.towerFireTicks).toBe(10)
  })

  it('discards a due shot with no target instead of banking it', () => {
    const run = createRun(12)
    run.towerCount = 1
    run.towerFireTicks = TOWER.fireIntervalTicks - 1
    const events = sink()

    stepRun(run, NO_COMMANDS, events)

    expect(events.shots).toHaveLength(0)
    expect(run.towerFireTicks).toBe(0)

    const slot = spawnAt(run, 1600)
    stepRun(run, NO_COMMANDS, events)

    expect(events.shots).toHaveLength(0)
    expect(run.enemies.columns.hp[slot]).toBe(ENEMY.baseHp)
    expect(run.towerFireTicks).toBe(1)
  })
})

describe('kills and bounty', () => {
  it('kills in one click, pays once, then nothing changes', () => {
    const run = createRun(13)
    spawnAt(run, 1000, 1)

    stepRun(run, FIRE_COMMANDS)

    expect(run.enemies.count).toBe(0)
    expect(run.stats.kills).toBe(1)
    expect(run.currency).toBe(bountyFor(ENEMY.baseHp))

    for (let index = 0; index < 25; index += 1) {
      stepRun(run, FIRE_COMMANDS)
    }

    expect(run.stats.kills).toBe(1)
    expect(run.currency).toBe(bountyFor(ENEMY.baseHp))
  })
})

describe('determinism with commands', () => {
  it('hashes equally with and without event collection', () => {
    const first = createRun(14)
    const second = createRun(14)
    const events = sink()

    stepScheduled(first, 400, 4, events)
    stepScheduled(second, 400, 4)

    expect(events.shots.length).toBeGreaterThan(0)
    expect(hashRun(first)).toBe(hashRun(second))
  })

  it('round-trips mid-fight and stays in sync', () => {
    const run = createRun(15)
    stepScheduled(run, 200, 7)

    const restored = hydrateRun(serializeRun(run))

    expect(restored.clickCooldown).toBe(run.clickCooldown)
    expect(restored.towerFireTicks).toBe(run.towerFireTicks)
    expect(hashRun(restored)).toBe(hashRun(run))

    stepScheduled(run, 300, 7)
    stepScheduled(restored, 300, 7)

    expect(hashRun(restored)).toBe(hashRun(run))
  })
})

describe('M0 pacing', () => {
  it('reaches 3 currency in the expected 15-20 s window', () => {
    const run = createRun()
    let firstTick = 0

    while (run.tick < 1200 && run.currency < 3) {
      stepRun(run, FIRE_COMMANDS)
      if (run.currency >= 3) firstTick = run.tick
    }

    expect(firstTick).toBeGreaterThan(900)
    expect(firstTick).toBeLessThanOrEqual(1200)
    expect(run.stats.kills).toBe(3)
    expect(run.stats.leaks).toBe(0)
    expect(run.currency).toBe(3)
  })
})
