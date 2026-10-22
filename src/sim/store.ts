import {
  BULLET_COLUMNS,
  ENEMY_COLUMNS,
  type BulletColumns,
  type ColumnArray,
  type ColumnSpec,
  type ColumnsOf,
  type EnemyColumns,
} from '@/sim/types'

/** Returned by `alloc` when the store is at capacity. */
export const NO_SLOT = -1

export type Store<T> = {
  readonly capacity: number
  count: number
  nextId: number
  readonly columns: T
  alloc: () => number
  remove: (index: number) => void
  clear: () => void
  indexOfId: (id: number) => number
}

export const createStore = <S extends ColumnSpec>(
  spec: S,
  capacity: number,
): Store<ColumnsOf<S>> => {
  if (!Number.isInteger(capacity) || capacity < 0) {
    throw new RangeError(`capacity must be a non-negative integer: ${capacity}`)
  }

  const columns: Record<string, ColumnArray> = {}
  for (const [key, ArrayType] of Object.entries(spec)) {
    columns[key] = new ArrayType(capacity)
  }
  const columnValues = Object.values(columns)
  const ids = columns.id as Uint32Array

  const zero = (index: number): void => {
    for (const column of columnValues) column[index] = 0
  }

  const store: Store<ColumnsOf<S>> = {
    capacity,
    count: 0,
    nextId: 1,
    columns: columns as ColumnsOf<S>,
    alloc: () => {
      if (store.count >= capacity) return NO_SLOT
      const index = store.count
      zero(index)
      ids[index] = store.nextId
      store.nextId += 1
      store.count += 1
      return index
    },
    remove: (index) => {
      if (!Number.isInteger(index) || index < 0 || index >= store.count) return
      const last = store.count - 1
      if (index !== last) {
        for (const column of columnValues) column[index] = column[last]
      }
      zero(last)
      store.count = last
    },
    clear: () => {
      for (let index = 0; index < store.count; index += 1) zero(index)
      store.count = 0
    },
    indexOfId: (id) => {
      for (let index = 0; index < store.count; index += 1) {
        if (ids[index] === id) return index
      }
      return -1
    },
  }

  return store
}

export const createEnemyStore = (capacity: number): Store<EnemyColumns> =>
  createStore(ENEMY_COLUMNS, capacity)

export const createBulletStore = (capacity: number): Store<BulletColumns> =>
  createStore(BULLET_COLUMNS, capacity)
