/**
 * Struct-of-arrays entity storage (the eco-evo `store.ts` pattern, made
 * generic): one typed array per field, live entities packed into
 * `[0, count)`, swap-remove to delete. Indices move on removal; keep stable
 * ids in a column when something needs to refer to an entity later.
 */

type ArrayConstructor =
  Float64ArrayConstructor | Int32ArrayConstructor | Uint8ArrayConstructor

export type ColumnSpec = Record<string, ArrayConstructor>

export type Columns<S extends ColumnSpec> = {
  readonly [K in keyof S]: InstanceType<S[K]>
}

export type Pool<S extends ColumnSpec> = Columns<S> & {
  count: number
  readonly capacity: number
}

export const createPool = <S extends ColumnSpec>(
  spec: S,
  capacity: number,
): Pool<S> => {
  const pool: Record<string, unknown> = { count: 0, capacity }
  for (const [key, ArrayType] of Object.entries(spec)) {
    pool[key] = new ArrayType(capacity)
  }
  return pool as Pool<S>
}

const columnsOf = <S extends ColumnSpec>(spec: S): (keyof S & string)[] =>
  Object.keys(spec)

/** Claim the next slot with every column zeroed. Returns -1 when full. */
export const allocSlot = <S extends ColumnSpec>(
  spec: S,
  pool: Pool<S>,
): number => {
  if (pool.count >= pool.capacity) return -1
  const index = pool.count
  for (const key of columnsOf(spec)) pool[key][index] = 0
  pool.count += 1
  return index
}

/**
 * Remove a slot by moving the last live entity into it. Returns the index
 * the moved entity came from (or -1 when nothing moved).
 */
export const removeSlot = <S extends ColumnSpec>(
  spec: S,
  pool: Pool<S>,
  index: number,
): number => {
  const last = pool.count - 1
  pool.count = last
  if (index === last) return -1
  for (const key of columnsOf(spec)) pool[key][index] = pool[key][last]
  return last
}

export type PoolSnapshot = {
  count: number
  columns: Record<string, number[]>
}

export const serializePool = <S extends ColumnSpec>(
  spec: S,
  pool: Pool<S>,
): PoolSnapshot => {
  const columns: Record<string, number[]> = {}
  for (const key of columnsOf(spec)) {
    columns[key] = Array.from(pool[key].subarray(0, pool.count))
  }
  return { count: pool.count, columns }
}

export const hydratePool = <S extends ColumnSpec>(
  spec: S,
  capacity: number,
  snapshot: PoolSnapshot,
): Pool<S> => {
  const pool = createPool(spec, capacity)
  pool.count = Math.min(snapshot.count, capacity)
  for (const key of columnsOf(spec)) {
    const values = snapshot.columns[key] ?? []
    pool[key].set(values.slice(0, pool.count))
  }
  return pool
}
