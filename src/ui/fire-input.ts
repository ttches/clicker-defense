export type FireInput = {
  attach: (canvas: HTMLCanvasElement) => () => void
  consume: () => boolean
  isHolding: () => boolean
}

/**
 * Tap/hold plumbing only. The simulation's integer tick counter owns the
 * cadence, so there is no timer here: a primary-pointer press queues one shot
 * and each active pointer keeps requesting shots every tick.
 */
export const createFireInput = (): FireInput => {
  const active = new Set<number>()
  let queued = false
  let canvas: HTMLCanvasElement | null = null

  const releaseCapture = (pointerId: number): void => {
    if (canvas?.hasPointerCapture(pointerId)) {
      canvas.releasePointerCapture(pointerId)
    }
  }

  const onDown = (event: PointerEvent): void => {
    if (event.button !== 0 || !event.isPrimary) return
    active.add(event.pointerId)
    queued = true
    try {
      canvas?.setPointerCapture(event.pointerId)
    } catch {
      // Capture is best-effort; the window release listener is the fallback.
    }
  }

  const onRelease = (event: PointerEvent): void => {
    active.delete(event.pointerId)
    releaseCapture(event.pointerId)
  }

  const onLeave = (event: PointerEvent): void => {
    if (!canvas?.hasPointerCapture(event.pointerId)) {
      active.delete(event.pointerId)
    }
  }

  const detach = (): void => {
    if (!canvas) return
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointerup', onRelease)
    canvas.removeEventListener('pointercancel', onRelease)
    canvas.removeEventListener('lostpointercapture', onRelease)
    canvas.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('pointerup', onRelease)
    window.removeEventListener('pointercancel', onRelease)
    for (const pointerId of active) releaseCapture(pointerId)
    active.clear()
    canvas = null
  }

  const attach = (next: HTMLCanvasElement): (() => void) => {
    detach()
    canvas = next
    next.addEventListener('pointerdown', onDown)
    next.addEventListener('pointerup', onRelease)
    next.addEventListener('pointercancel', onRelease)
    next.addEventListener('lostpointercapture', onRelease)
    next.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerup', onRelease)
    window.addEventListener('pointercancel', onRelease)
    return detach
  }

  const consume = (): boolean => {
    const firing = active.size > 0 || queued
    queued = false
    return firing
  }

  const isHolding = (): boolean => active.size > 0

  return { attach, consume, isHolding }
}
