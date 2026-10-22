import { MAX_FRAME_SECONDS } from '@/engine/config'

export type LoopScheduler = {
  request: (callback: (timeMs: number) => void) => number
  cancel: (id: number) => void
  now: () => number
}

export type LoopCallbacks = {
  step: () => void
  frame: (steps: number) => void
}

export type Loop = {
  start: () => void
  stop: () => void
  readonly running: boolean
}

const activeLoops = new Set<object>()

/** Loops currently started anywhere in the process; 1 means no leak. */
export const activeLoopCount = (): number => activeLoops.size

const defaultScheduler: LoopScheduler = {
  request: (callback) => requestAnimationFrame(callback),
  cancel: (id) => cancelAnimationFrame(id),
  now: () => performance.now(),
}

/**
 * Fixed-timestep loop decoupled from the display refresh rate. `step` runs once
 * per fixed slice; `frame` runs once per scheduled frame with the step count.
 */
export const createLoop = (
  fixedStepSeconds: number,
  callbacks: LoopCallbacks,
  scheduler: LoopScheduler = defaultScheduler,
): Loop => {
  if (!Number.isFinite(fixedStepSeconds) || fixedStepSeconds <= 0) {
    throw new RangeError(
      `fixedStepSeconds must be positive and finite: ${fixedStepSeconds}`,
    )
  }

  let frameHandle: number | null = null
  let accumulator = 0
  let previousTime = 0
  let running = false
  const token = {}

  const tick = (timeMs: number): void => {
    if (!running) return
    frameHandle = null

    const elapsed = (timeMs - previousTime) / 1000
    accumulator += Math.min(Math.max(elapsed, 0), MAX_FRAME_SECONDS)
    previousTime = timeMs

    let steps = 0
    while (running && accumulator >= fixedStepSeconds) {
      callbacks.step()
      accumulator -= fixedStepSeconds
      steps += 1
    }

    callbacks.frame(steps)
    if (running && frameHandle === null) frameHandle = scheduler.request(tick)
  }

  const start = (): void => {
    if (running) return
    running = true
    activeLoops.add(token)
    previousTime = scheduler.now()
    accumulator = 0
    frameHandle = scheduler.request(tick)
  }

  const stop = (): void => {
    if (!running) return
    running = false
    activeLoops.delete(token)
    if (frameHandle !== null) {
      scheduler.cancel(frameHandle)
      frameHandle = null
    }
  }

  return {
    start,
    stop,
    get running(): boolean {
      return running
    },
  }
}
