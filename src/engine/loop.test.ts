import { describe, expect, it } from 'vitest'
import { FIXED_STEP, MAX_FRAME_SECONDS } from '@/engine/config'
import { createLoop, type Loop, type LoopScheduler } from '@/engine/loop'

const createFakeScheduler = () => {
  let time = 0
  let nextId = 1
  const pending = new Map<number, (timeMs: number) => void>()
  let cancelled = 0

  const scheduler: LoopScheduler = {
    request: (callback) => {
      const id = nextId
      nextId += 1
      pending.set(id, callback)
      return id
    },
    cancel: (id) => {
      cancelled += 1
      pending.delete(id)
    },
    now: () => time,
  }

  return {
    scheduler,
    advance: (deltaMs: number): void => {
      time += deltaMs
      const callbacks = [...pending.values()]
      pending.clear()
      for (const callback of callbacks) callback(time)
    },
    pendingCount: (): number => pending.size,
    cancelledCount: (): number => cancelled,
  }
}

describe('createLoop', () => {
  it('runs exactly 60 steps for one second of frames', () => {
    const fake = createFakeScheduler()
    let steps = 0
    let frames = 0
    let reported = 0

    const loop = createLoop(
      FIXED_STEP,
      {
        step: () => {
          steps += 1
        },
        frame: (count) => {
          frames += 1
          reported += count
        },
      },
      fake.scheduler,
    )

    loop.start()
    for (let index = 0; index < 100; index += 1) fake.advance(10)

    expect(steps).toBe(60)
    expect(frames).toBe(100)
    expect(reported).toBe(60)
    loop.stop()
  })

  it('clamps a long frame delta to MAX_FRAME_SECONDS', () => {
    const fake = createFakeScheduler()
    let steps = 0
    let reported = 0

    const loop = createLoop(
      FIXED_STEP,
      {
        step: () => {
          steps += 1
        },
        frame: (count) => {
          reported = count
        },
      },
      fake.scheduler,
    )

    loop.start()
    fake.advance(MAX_FRAME_SECONDS * 1000)

    expect(steps).toBe(MAX_FRAME_SECONDS / FIXED_STEP)
    expect(reported).toBe(6)
    loop.stop()
  })

  it('ignores a second start', () => {
    const fake = createFakeScheduler()
    let steps = 0

    const loop = createLoop(
      FIXED_STEP,
      {
        step: () => {
          steps += 1
        },
        frame: () => {},
      },
      fake.scheduler,
    )

    loop.start()
    loop.start()
    expect(fake.pendingCount()).toBe(1)

    for (let index = 0; index < 100; index += 1) fake.advance(10)
    expect(steps).toBe(60)
    loop.stop()
  })

  it('stops scheduling when stopped inside frame', () => {
    const fake = createFakeScheduler()
    let frames = 0
    let loop: Loop

    loop = createLoop(
      FIXED_STEP,
      {
        step: () => {},
        frame: () => {
          frames += 1
          loop.stop()
        },
      },
      fake.scheduler,
    )

    loop.start()
    fake.advance(10)

    expect(frames).toBe(1)
    expect(loop.running).toBe(false)
    expect(fake.pendingCount()).toBe(0)

    fake.advance(10)
    expect(frames).toBe(1)
  })

  it('stops scheduling when stopped inside step', () => {
    const fake = createFakeScheduler()
    let steps = 0
    let loop: Loop

    loop = createLoop(
      FIXED_STEP,
      {
        step: () => {
          steps += 1
          loop.stop()
        },
        frame: () => {},
      },
      fake.scheduler,
    )

    loop.start()
    fake.advance(100)

    expect(steps).toBe(1)
    expect(fake.pendingCount()).toBe(0)
  })

  it('cancels once and tolerates repeated stops', () => {
    const fake = createFakeScheduler()
    const loop = createLoop(
      FIXED_STEP,
      { step: () => {}, frame: () => {} },
      fake.scheduler,
    )

    loop.start()
    loop.stop()
    loop.stop()

    expect(loop.running).toBe(false)
    expect(fake.pendingCount()).toBe(0)
    expect(fake.cancelledCount()).toBe(1)
  })

  it('rejects a non-positive or non-finite fixed step', () => {
    const fake = createFakeScheduler()
    const callbacks = { step: () => {}, frame: () => {} }

    expect(() => createLoop(0, callbacks, fake.scheduler)).toThrow(RangeError)
    expect(() => createLoop(-1, callbacks, fake.scheduler)).toThrow(RangeError)
    expect(() => createLoop(Number.NaN, callbacks, fake.scheduler)).toThrow(
      RangeError,
    )
  })

  it('still frames and reschedules when no step is due', () => {
    const fake = createFakeScheduler()
    let steps = 0
    let frames = 0
    let reported = -1

    const loop = createLoop(
      FIXED_STEP,
      {
        step: () => {
          steps += 1
        },
        frame: (count) => {
          frames += 1
          reported = count
        },
      },
      fake.scheduler,
    )

    loop.start()
    fake.advance(5)

    expect(steps).toBe(0)
    expect(frames).toBe(1)
    expect(reported).toBe(0)
    expect(fake.pendingCount()).toBe(1)
    loop.stop()
  })

  it('does not double-schedule when restarted inside frame', () => {
    const fake = createFakeScheduler()
    let frames = 0
    let loop: Loop

    loop = createLoop(
      FIXED_STEP,
      {
        step: () => {},
        frame: () => {
          frames += 1
          if (frames === 1) {
            loop.stop()
            loop.start()
          }
        },
      },
      fake.scheduler,
    )

    loop.start()
    fake.advance(10)

    expect(frames).toBe(1)
    expect(loop.running).toBe(true)
    expect(fake.pendingCount()).toBe(1)

    fake.advance(10)
    expect(frames).toBe(2)
    loop.stop()
  })

  it('resets fractional time when restarted', () => {
    const fake = createFakeScheduler()
    let steps = 0
    let frames = 0

    const loop = createLoop(
      FIXED_STEP,
      {
        step: () => {
          steps += 1
        },
        frame: () => {
          frames += 1
        },
      },
      fake.scheduler,
    )

    loop.start()
    fake.advance(15)
    loop.stop()
    loop.start()
    fake.advance(5)

    expect(frames).toBe(2)
    expect(steps).toBe(0)

    fake.advance(12)
    expect(steps).toBe(1)
    loop.stop()
  })
})
