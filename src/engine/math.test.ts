import { describe, expect, it } from 'vitest'
import { clamp, hashUnit, lerp, XorShift32 } from '@/engine/math'

const draw = (random: XorShift32, count: number): number[] =>
  Array.from({ length: count }, () => random.nextUint32())

describe('XorShift32', () => {
  it('matches the pinned sequence for a known seed', () => {
    const random = new XorShift32(123)
    expect(draw(random, 5)).toEqual([
      31682556, 4018661298, 2101636938, 3842487452, 1628673942,
    ])
  })

  it('is deterministic for a given seed', () => {
    expect(draw(new XorShift32(123), 8)).toEqual(draw(new XorShift32(123), 8))
  })

  it('resumes the same sequence from a serialized state', () => {
    const original = new XorShift32(123)
    draw(original, 7)
    const saved = original.state
    const expected = draw(original, 6)

    const resumed = new XorShift32(1)
    resumed.state = saved

    expect(draw(resumed, 6)).toEqual(expected)
    expect(resumed.state).toBe(original.state)
  })

  it('substitutes the default seed for a zero seed', () => {
    expect(draw(new XorShift32(0), 4)).toEqual(
      draw(new XorShift32(0x00c0ffee), 4),
    )
    expect(new XorShift32(0).state).toBe(0x00c0ffee)
  })

  it('keeps zero out of the state setter', () => {
    const random = new XorShift32(123)
    random.state = 0
    expect(random.state).toBe(0x00c0ffee)
  })

  it('produces units within [0, 1)', () => {
    const random = new XorShift32()
    for (let index = 0; index < 1000; index += 1) {
      const unit = random.unit()
      expect(unit).toBeGreaterThanOrEqual(0)
      expect(unit).toBeLessThan(1)
    }
  })

  it('respects range bounds', () => {
    const random = new XorShift32()
    for (let index = 0; index < 1000; index += 1) {
      const value = random.range(-5, 12)
      expect(value).toBeGreaterThanOrEqual(-5)
      expect(value).toBeLessThan(12)
    }
  })
})

describe('clamp', () => {
  it('limits values to the inclusive bounds', () => {
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(4, 0, 10)).toBe(4)
    expect(clamp(42, 0, 10)).toBe(10)
  })
})

describe('lerp', () => {
  it('interpolates between two values', () => {
    expect(lerp(0, 10, 0)).toBe(0)
    expect(lerp(0, 10, 0.5)).toBe(5)
    expect(lerp(0, 10, 1)).toBe(10)
  })
})

describe('hashUnit', () => {
  it('is deterministic and stays in [0, 1)', () => {
    for (let value = -1000; value <= 1000; value += 1) {
      const unit = hashUnit(value)
      expect(unit).toBeGreaterThanOrEqual(0)
      expect(unit).toBeLessThan(1)
      expect(hashUnit(value)).toBe(unit)
    }
  })
})
