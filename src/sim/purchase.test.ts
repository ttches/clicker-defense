import { describe, expect, it } from 'vitest'
import { ENEMY, TOWER } from '@/data/balance'
import {
  BUY_TOWER_COMMAND,
  BUY_TOWER_COMMANDS,
  FIRE_COMMANDS,
  NO_COMMANDS,
  type Command,
  type SimEvents,
} from '@/sim/combat'
import { nextTowerCost, safety, spawnRate, towerDps } from '@/sim/economy'
import { buyTower, previewTowerBuy } from '@/sim/purchase'
import { createRun, spawnEnemy, stepRun, type RunState } from '@/sim/run'

const sink = (): SimEvents => ({ shots: [], kills: [], purchases: [] })

const spawnAt = (run: RunState, x: number): number => {
  const slot = spawnEnemy(run)
  run.enemies.columns.x[slot] = x
  return slot
}

const TWO_BUYS: readonly Command[] = [BUY_TOWER_COMMAND, BUY_TOWER_COMMAND]

describe('tower cost ladder', () => {
  it('grows 3 / 3.45 / 3.9675 / 4.562625', () => {
    expect(nextTowerCost(0)).toBeCloseTo(3, 10)
    expect(nextTowerCost(1)).toBeCloseTo(3.45, 10)
    expect(nextTowerCost(2)).toBeCloseTo(3.9675, 10)
    expect(nextTowerCost(3)).toBeCloseTo(4.562625, 10)
  })

  it('refuses a purchase below cost and spends exactly at cost', () => {
    const poor = createRun(1)
    poor.currency = 2.99

    expect(previewTowerBuy(poor, false).affordable).toBe(false)
    expect(buyTower(poor)).toBe(false)
    expect(poor.currency).toBe(2.99)
    expect(poor.towerCount).toBe(0)

    poor.currency = 3

    expect(previewTowerBuy(poor, false).affordable).toBe(true)
    expect(buyTower(poor)).toBe(true)
    expect(poor.currency).toBe(0)
    expect(poor.towerCount).toBe(1)
  })
})

describe('purchase effects', () => {
  it('raises the count, the spawn rate and the DPS', () => {
    const run = createRun(2)
    run.currency = 100

    expect(spawnRate(run.towerCount)).toBeCloseTo(0.2, 10)
    expect(towerDps(run.towerCount)).toBe(0)

    expect(buyTower(run)).toBe(true)
    expect(run.towerCount).toBe(1)
    expect(spawnRate(run.towerCount)).toBeCloseTo(0.5, 10)
    expect(towerDps(run.towerCount)).toBeCloseTo(2, 10)

    expect(buyTower(run)).toBe(true)
    expect(run.towerCount).toBe(2)
    expect(spawnRate(run.towerCount)).toBeCloseTo(0.515, 10)
    expect(towerDps(run.towerCount)).toBeCloseTo(4, 10)
  })
})

describe('preview equals reality', () => {
  it.each([0, 1, 2])(
    'matches the actual state after buying from %i',
    (count) => {
      for (const holding of [false, true]) {
        const run = createRun(3)
        run.towerCount = count
        run.currency = 100

        const preview = previewTowerBuy(run, holding)
        const before = run.towerCount
        const newCount = before + 1

        expect(buyTower(run)).toBe(true)
        expect(preview.cost).toBe(nextTowerCost(before))
        expect(preview.affordable).toBe(true)
        expect(preview.towerCountBefore).toBe(before)
        expect(preview.towerCountAfter).toBe(newCount)
        expect(preview.dpsBefore).toBe(towerDps(before))
        expect(preview.dpsAfter).toBe(towerDps(newCount))
        expect(preview.spawnRateBefore).toBe(spawnRate(before))
        expect(preview.spawnRateAfter).toBe(spawnRate(newCount))
        expect(preview.safetyBefore).toBe(safety(before, ENEMY.baseHp, holding))
        expect(preview.safetyAfter).toBe(
          safety(newCount, ENEMY.baseHp, holding),
        )
      }
    },
  )

  it('reports affordability without changing the run', () => {
    const run = createRun(4)
    run.currency = 1

    const preview = previewTowerBuy(run, false)

    expect(preview.affordable).toBe(false)
    expect(run.currency).toBe(1)
    expect(run.towerCount).toBe(0)
  })

  it('observed tower damage matches the previewed DPS', () => {
    for (const count of [0, 1, 2]) {
      const run = createRun(30 + count)
      run.towerCount = count
      run.currency = 100
      const preview = previewTowerBuy(run, false)
      const slot = spawnAt(run, 1700)
      run.enemies.columns.hp[slot] = 1000
      run.enemies.columns.maxHp[slot] = 1000

      expect(buyTower(run)).toBe(true)
      for (let tick = 0; tick < 60; tick += 1) stepRun(run, NO_COMMANDS)

      expect(1000 - run.enemies.columns.hp[slot]).toBeCloseTo(
        preview.dpsAfter,
        5,
      )
    }
  })
})

describe('preview deltas', () => {
  it('shows +2 DPS and +150% spawn for the first tower', () => {
    const preview = previewTowerBuy(createRun(5), false)

    expect(preview.dpsGain).toBeCloseTo(2, 10)
    expect(preview.spawnGainPercent).toBeCloseTo(150, 10)
    expect(preview.safetyBefore).toBe(0)
    expect(preview.safetyAfter).toBeCloseTo(0.4, 10)
  })

  it('raises safety while the count is below the peak', () => {
    const run = createRun(6)
    run.towerCount = 1

    const preview = previewTowerBuy(run, false)

    expect(preview.dpsGain).toBeCloseTo(2, 10)
    expect(preview.spawnGainPercent).toBeCloseTo(3, 10)
    expect(preview.safetyBefore).toBeCloseTo(0.4, 10)
    expect(preview.safetyAfter).toBeCloseTo(4 / 5.15, 10)
    expect(preview.safetyAfter).toBeGreaterThan(preview.safetyBefore)
  })

  it('drops safety for the first tower only while holding', () => {
    const preview = previewTowerBuy(createRun(12), true)

    expect(preview.safetyBefore).toBeCloseTo(1.5, 10)
    expect(preview.safetyAfter).toBeCloseTo(1, 10)
    expect(preview.safetyAfter).toBeLessThan(preview.safetyBefore)
  })

  it('drops safety once the spawn creep outruns added DPS', () => {
    const run = createRun(13)
    run.towerCount = 34

    const preview = previewTowerBuy(run, false)

    expect(preview.safetyAfter).toBeLessThan(preview.safetyBefore)
  })
})

describe('command pipeline', () => {
  it('buys every affordable command in one tick', () => {
    const run = createRun(7)
    run.currency = 10

    stepRun(run, TWO_BUYS)

    expect(run.towerCount).toBe(2)
    expect(run.currency).toBeCloseTo(10 - 3 - 3.45, 10)

    stepRun(run, BUY_TOWER_COMMANDS)

    expect(run.towerCount).toBe(2)
    expect(run.currency).toBeCloseTo(3.55, 10)
  })

  it('buys before firing so the new tower counts that tick', () => {
    const run = createRun(8)
    run.currency = 3
    run.towerFireTicks = TOWER.fireIntervalTicks - 1
    const slot = spawnAt(run, 1600)
    const events = sink()

    stepRun(run, [BUY_TOWER_COMMAND, { kind: 'fire' }], events)

    expect(run.towerCount).toBe(1)
    expect(events.shots.map((shot) => shot.kind)).toEqual(['click', 'tower'])
    expect(run.enemies.columns.hp[slot]).toBe(ENEMY.baseHp - 2)
  })
})

describe('first-tower spawn jump', () => {
  it('applies the post-purchase rate on the buying tick', () => {
    const run = createRun(9)
    run.currency = 3

    stepRun(run, BUY_TOWER_COMMANDS)

    expect(run.towerCount).toBe(1)
    expect(spawnRate(run.towerCount)).toBeCloseTo(0.5, 10)
    expect(run.spawnProgress).toBeCloseTo(0.5 / 60, 10)
    expect(run.currency).toBe(0)
  })
})

describe('M1 acceptance', () => {
  it('shows the 1/2/3-tower leak gradient over 3600 ticks', () => {
    const ticks = 3600
    const leaks = [1, 2, 3].map((towers) => {
      const run = createRun()
      run.towerCount = towers
      for (let tick = 0; tick < ticks; tick += 1) {
        stepRun(run, NO_COMMANDS)
      }
      expect(run.stats.kills).toBeGreaterThan(0)
      return run.stats.leaks
    })

    // The walk delay plus a small damage deficit means a shorter window cannot
    // separate 2 towers from 3: the queue has to fill for ~2 walk lengths.
    expect(leaks[0]).toBeGreaterThan(leaks[1])
    expect(leaks[1]).toBeGreaterThan(0)
    expect(leaks[2]).toBe(0)
  })
})

describe('M1 pacing', () => {
  it('waits 5-10 s for tower 2 while holding', () => {
    const run = createRun()

    while (run.tick < 1200 && run.currency < nextTowerCost(0)) {
      stepRun(run, FIRE_COMMANDS)
    }
    expect(run.currency).toBeGreaterThanOrEqual(nextTowerCost(0))
    expect(run.tick).toBeGreaterThan(1000)
    expect(run.tick).toBeLessThanOrEqual(1200)
    expect(buyTower(run)).toBe(true)

    const boughtTick = run.tick
    const target = nextTowerCost(1)

    while (run.tick - boughtTick < 1200 && run.currency < target) {
      stepRun(run, FIRE_COMMANDS)
    }

    const wait = run.tick - boughtTick
    expect(wait).toBeGreaterThanOrEqual(300)
    expect(wait).toBeLessThanOrEqual(600)
  })
})
