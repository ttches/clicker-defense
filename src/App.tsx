import { useEffect, useRef } from 'react'
import type { Camera } from '@/engine/camera'
import { createFitCamera } from '@/engine/camera'
import { FIXED_STEP } from '@/engine/config'
import { activeLoopCount, createLoop } from '@/engine/loop'
import { WORLD } from '@/data/balance'
import { Renderer } from '@/render/renderer'
import { countFrame, createDebugState, getFrameCount } from '@/ui/debug'
import { Stage } from './ui/Stage.tsx'

type Measurement = {
  width: number
  height: number
  dpr: number
}

/** CSS size plus the raw device pixel ratio; Renderer applies DPR_CAP. */
const measure = (canvas: HTMLCanvasElement): Measurement => {
  const rect = canvas.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
    dpr: window.devicePixelRatio || 1,
  }
}

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new Renderer(canvas)
    const debug = createDebugState()
    window.__game = debug
    debug.drawn = renderer.drawn

    let size = measure(canvas)
    let camera: Camera | null = null
    let started = false

    const writeCanvas = (): void => {
      debug.canvas.cssWidth = size.width
      debug.canvas.cssHeight = size.height
      debug.canvas.dpr = size.dpr
      debug.canvas.pixelRatio = renderer.pixelRatio
      debug.canvas.bufferWidth = canvas.width
      debug.canvas.bufferHeight = canvas.height
    }

    const loop = createLoop(FIXED_STEP, {
      step: () => {
        debug.tick += 1
      },
      frame: (steps) => {
        countFrame()
        debug.framesTotal = getFrameCount()
        debug.loops = activeLoopCount()
        if (steps > 0 && started && camera) renderer.draw(camera)
      },
    })

    const startIfReady = (): void => {
      if (started) return
      size = measure(canvas)
      if (size.width < 1 || size.height < 1) return
      renderer.resize(size.width, size.height, size.dpr)
      camera = createFitCamera(
        { width: size.width, height: size.height },
        WORLD,
      )
      renderer.draw(camera)
      writeCanvas()
      loop.start()
      debug.running = true
      debug.loops = activeLoopCount()
      started = true
    }

    const resize = (): void => {
      if (!started) {
        startIfReady()
        return
      }
      const next = measure(canvas)
      if (next.width < 1 || next.height < 1) return
      if (
        next.width === size.width &&
        next.height === size.height &&
        next.dpr === size.dpr
      ) {
        return
      }
      size = next
      renderer.resize(next.width, next.height, next.dpr)
      camera = createFitCamera(
        { width: next.width, height: next.height },
        WORLD,
      )
      renderer.draw(camera)
      writeCanvas()
    }

    let resolutionQuery: MediaQueryList | null = null

    const rearmResolution = (): void => {
      watchResolution()
      resize()
    }

    const watchResolution = (): void => {
      resolutionQuery?.removeEventListener('change', rearmResolution)
      const dpr = window.devicePixelRatio || 1
      resolutionQuery = window.matchMedia(`(resolution: ${dpr}dppx)`)
      resolutionQuery.addEventListener('change', rearmResolution)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    window.addEventListener('resize', resize)
    watchResolution()
    startIfReady()

    return () => {
      debug.running = false
      loop.stop()
      observer.disconnect()
      window.removeEventListener('resize', resize)
      resolutionQuery?.removeEventListener('change', rearmResolution)
      resolutionQuery = null
      renderer.dispose()
      if (window.__game === debug) delete window.__game
    }
  }, [])

  return <Stage canvasRef={canvasRef} />
}
