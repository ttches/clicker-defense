import { describe, expect, it } from 'vitest'
import { createBulletStore, createEnemyStore, NO_SLOT } from '@/sim/store'
import { createRenderView } from '@/sim/view'

describe('createEnemyStore', () => {
  it('zeroes every column and assigns stable ids on alloc', () => {
    const store = createEnemyStore(4)
    store.columns.x[0] = 99
    store.columns.hp[0] = 99
    store.columns.kind[0] = 9
    store.columns.boss[0] = 1

    expect(store.alloc()).toBe(0)
    expect(store.alloc()).toBe(1)

    expect(store.count).toBe(2)
    expect(store.nextId).toBe(3)
    expect(store.columns.id[0]).toBe(1)
    expect(store.columns.id[1]).toBe(2)

    for (const [key, column] of Object.entries(store.columns)) {
      if (key === 'id') continue
      expect(column[0]).toBe(0)
      expect(column[1]).toBe(0)
    }
  })

  it('never reuses an id after removal', () => {
    const store = createEnemyStore(4)
    store.alloc()
    store.alloc()
    store.remove(1)

    expect(store.alloc()).toBe(1)
    expect(store.columns.id[1]).toBe(3)
    expect(store.indexOfId(2)).toBe(-1)
  })

  it('swap-removes the last entity into the hole', () => {
    const store = createEnemyStore(4)
    store.alloc()
    store.alloc()
    store.alloc()
    store.columns.x[0] = 10
    store.columns.x[1] = 20
    store.columns.x[2] = 30
    store.columns.hp[2] = 7

    store.remove(0)

    expect(store.count).toBe(2)
    expect(store.columns.x[0]).toBe(30)
    expect(store.columns.hp[0]).toBe(7)
    expect(store.columns.id[0]).toBe(3)
    expect(store.columns.x[2]).toBe(0)
    expect(store.columns.id[2]).toBe(0)
    expect(store.indexOfId(1)).toBe(-1)
    expect(store.indexOfId(3)).toBe(0)
  })

  it('removing from the end preserves the remaining entities', () => {
    const store = createEnemyStore(4)
    for (let index = 0; index < 4; index += 1) store.alloc()
    store.columns.x[0] = 1
    store.columns.x[1] = 2
    store.columns.x[2] = 3
    store.columns.x[3] = 4

    store.remove(3)
    store.remove(2)

    expect(store.count).toBe(2)
    expect(Array.from(store.columns.x.slice(0, 2))).toEqual([1, 2])
    expect(store.columns.x[2]).toBe(0)
    expect(store.columns.x[3]).toBe(0)
  })

  it('returns NO_SLOT and does not mutate when full', () => {
    const store = createEnemyStore(2)
    store.alloc()
    store.alloc()
    store.columns.x[0] = 5
    store.columns.hp[1] = 8

    const before = Object.fromEntries(
      Object.entries(store.columns).map(([key, column]) => [
        key,
        Array.from(column),
      ]),
    )

    expect(store.alloc()).toBe(NO_SLOT)
    expect(store.count).toBe(2)
    expect(store.nextId).toBe(3)

    const after = Object.fromEntries(
      Object.entries(store.columns).map(([key, column]) => [
        key,
        Array.from(column),
      ]),
    )
    expect(after).toEqual(before)
  })

  it('ignores a non-integer index instead of deleting the last entity', () => {
    const store = createEnemyStore(4)
    store.alloc()
    store.alloc()
    store.columns.x[0] = 10
    store.columns.x[1] = 20

    store.remove(Number.NaN)
    store.remove(1.5)

    expect(store.count).toBe(2)
    expect(Array.from(store.columns.x.slice(0, 2))).toEqual([10, 20])
    expect(store.indexOfId(1)).toBe(0)
    expect(store.indexOfId(2)).toBe(1)
  })

  it('clears used slots but preserves the id sequence and capacity', () => {
    const store = createEnemyStore(3)
    store.alloc()
    store.alloc()
    store.columns.x[0] = 5
    store.columns.x[1] = 6
    store.clear()

    expect(store.count).toBe(0)
    expect(store.nextId).toBe(3)
    expect(store.capacity).toBe(3)
    expect(store.columns.x[0]).toBe(0)
    expect(store.columns.x[1]).toBe(0)

    expect(store.alloc()).toBe(0)
    expect(store.columns.id[0]).toBe(3)
  })

  it('binds a live render view without copying columns', () => {
    const store = createEnemyStore(8)
    const view = createRenderView(store)

    store.alloc()
    expect(view.count).toBe(1)
    expect(view.x).toBe(store.columns.x)
    expect(view.boss).toBe(store.columns.boss)

    store.columns.hp[0] = 10
    store.columns.boss[0] = 1
    store.alloc()

    expect(view.count).toBe(2)
    expect(view.hp[0]).toBe(10)
    expect(view.boss[0]).toBe(1)
  })
})

describe('createBulletStore', () => {
  it('allocates and swap-removes bullet columns', () => {
    const store = createBulletStore(3)
    store.alloc()
    store.alloc()
    store.columns.damage[0] = 2
    store.columns.targetId[0] = 42
    store.columns.ttlTicks[1] = 30

    expect(store.columns.id[0]).toBe(1)
    expect(store.columns.id[1]).toBe(2)

    store.remove(0)

    expect(store.count).toBe(1)
    expect(store.columns.targetId[0]).toBe(0)
    expect(store.columns.ttlTicks[0]).toBe(30)
    expect(store.columns.id[0]).toBe(2)
  })
})
