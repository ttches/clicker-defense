export const TAU = Math.PI * 2

export const clamp = (
  value: number,
  minimum: number,
  maximum: number,
): number => Math.min(Math.max(value, minimum), maximum)

export const lerp = (start: number, end: number, amount: number): number =>
  start + (end - start) * amount

const DEFAULT_STATE = 0x00c0ffee

/** Small seeded RNG. Its whole state is one uint32, so it serializes cleanly. */
export class XorShift32 {
  private state: number

  public constructor(seed = DEFAULT_STATE) {
    this.state = seed >>> 0 || DEFAULT_STATE
  }

  public nextUint32(): number {
    let value = this.state
    value ^= value << 13
    value ^= value >>> 17
    value ^= value << 5
    this.state = value >>> 0
    return this.state
  }

  /** Uniform in [0, 1). */
  public unit(): number {
    return (this.nextUint32() & 0x00ffffff) / 0x01000000
  }

  public range(minimum: number, maximum: number): number {
    return minimum + (maximum - minimum) * this.unit()
  }

  /** Uniform integer in [0, count). */
  public int(count: number): number {
    return Math.floor(this.unit() * count)
  }

  public getState(): number {
    return this.state
  }

  public setState(state: number): void {
    this.state = state >>> 0 || DEFAULT_STATE
  }
}

/** Derive an independent stream seed from a base seed and a stream number. */
export const deriveSeed = (seed: number, stream: number): number => {
  let hash = (seed ^ Math.imul(stream + 1, 0x9e3779b9)) >>> 0
  hash = Math.imul(hash ^ (hash >>> 16), 0x7feb352d) >>> 0
  hash = Math.imul(hash ^ (hash >>> 15), 0x846ca68b) >>> 0
  return (hash ^ (hash >>> 16)) >>> 0
}
