export const TAU = Math.PI * 2

const DEFAULT_SEED = 0x00c0ffee

export const clamp = (
  value: number,
  minimum: number,
  maximum: number,
): number => Math.min(Math.max(value, minimum), maximum)

export const lerp = (start: number, end: number, amount: number): number =>
  start + (end - start) * amount

/** Deterministic 32-bit hash of a number, mapped to [0, 1). */
export const hashUnit = (value: number): number => {
  let hash = (value + 0x9e3779b9) >>> 0
  hash = Math.imul(hash ^ (hash >>> 16), 0x7feb352d) >>> 0
  hash = Math.imul(hash ^ (hash >>> 15), 0x846ca68b) >>> 0
  hash = (hash ^ (hash >>> 16)) >>> 0
  return hash / 4294967296
}

export class XorShift32 {
  private stateValue: number

  public constructor(seed = DEFAULT_SEED) {
    this.stateValue = seed >>> 0 || DEFAULT_SEED
  }

  /** Full generator state, safe to serialize and restore. */
  public get state(): number {
    return this.stateValue
  }

  public set state(value: number) {
    this.stateValue = value >>> 0 || DEFAULT_SEED
  }

  public nextUint32(): number {
    let value = this.stateValue
    value ^= value << 13
    value ^= value >>> 17
    value ^= value << 5
    this.stateValue = value >>> 0
    return this.stateValue
  }

  public unit(): number {
    return (this.nextUint32() & 0x00ffffff) / 0x01000000
  }

  public range(minimum: number, maximum: number): number {
    return minimum + (maximum - minimum) * this.unit()
  }
}
