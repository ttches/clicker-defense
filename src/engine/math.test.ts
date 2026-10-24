import { describe, expect, it } from 'vitest'
import { deriveSeed, XorShift32 } from '@/engine/math'

describe('XorShift32', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = new XorShift32(42)
    const b = new XorShift32(42)
    for (let index = 0; index < 100; index += 1) {
      expect(a.nextUint32()).toBe(b.nextUint32())
    }
  })

  it('resumes from a saved state', () => {
    const a = new XorShift32(7)
    a.unit()
    const b = new XorShift32()
    b.setState(a.getState())
    expect(b.unit()).toBe(a.unit())
  })

  it('keeps unit() in [0, 1) and int() in range', () => {
    const random = new XorShift32(1)
    for (let index = 0; index < 1000; index += 1) {
      const unit = random.unit()
      expect(unit).toBeGreaterThanOrEqual(0)
      expect(unit).toBeLessThan(1)
      const value = random.int(24)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(24)
    }
  })
})

describe('deriveSeed', () => {
  it('gives different streams different seeds', () => {
    const seeds = new Set([0, 1, 2, 3].map((stream) => deriveSeed(99, stream)))
    expect(seeds.size).toBe(4)
  })
})
