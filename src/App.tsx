import { useEffect, useRef } from 'react'
import { CLICK, WORLD } from '@/data/balance'
import type { Camera } from '@/engine/camera'
import { createFitCamera } from '@/engine/camera'
import { FIXED_STEP } from '@/engine/config'
import { activeLoopCount, createLoop } from '@/engine/loop'
import { Renderer } from '@/render/renderer'
import { FIRE_COMMANDS, NO_COMMANDS } from '@/sim/combat'
import { spawnRate } from '@/sim/economy'
import { createRun, stepRun } from '@/sim/run'
import { createRenderView } from '@/sim/view'
import { countFrame, createDebugState, getFrameCount } from '@/ui/debug'
import { createFireInput } from '@/ui/fire-input'
import { Hud } from '@/ui/Hud'
import { publishHud } from '@/ui/hud-store'
import { Stage } from '@/ui/Stage'
import { stressEnemies } from '@/ui/stress'

type Measurement = {
  width: number
  height: number
  dpr: number
}

const HUD_INTERVAL_MS = 100

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

    const run = createRun()
    const view = createRenderView(run.enemies)
    const renderer = new Renderer(canvas)
    const fire = createFireInput()
    const detachFire = fire.attach(canvas)
    const debug = createDebugState(renderer.drawn)
    window.__game = debug

    const stressParam = new URLSearchParams(location.search).get('stress')
    const requested = Number(stressParam)
    const stress =
      import.meta.env.DEV && stressParam !== null && Number.isFinite(requested)
        ? stressEnemies(run, requested)
        : 0
    debug.stress = stress

    let size = measure(canvas)
    let camera: Camera | null = null
    let started = false
    let lastHudPublish = Number.NEGATIVE_INFINITY

    const readStats = () => ({
      tick: run.tick,
      currency: run.currency,
      enemies: run.enemies.count,
      spawnRate: spawnRate(run.towerCount),
      leaks: run.stats.leaks,
      kills: run.stats.kills,
    })

    const syncDebug = (): void => {
      const stats = readStats()
      debug.tick = stats.tick
      debug.currency = stats.currency
      debug.enemies = stats.enemies
      debug.spawnRate = stats.spawnRate
      debug.leaks = stats.leaks
      debug.kills = stats.kills
      debug.clickCooldown = run.clickCooldown
      debug.clickIntervalTicks = CLICK.intervalTicks
      debug.renderCalls = renderer.stats.calls
      debug.renderTriangles = renderer.stats.triangles
    }

    const publishStats = (now: number): void => {
      lastHudPublish = now
      const stats = readStats()
      publishHud({
        currency: stats.currency,
        enemies: stats.enemies,
        spawnRate: stats.spawnRate,
        leaks: stats.leaks,
        kills: stats.kills,
      })
      debug.hudPublishes += 1
    }

    syncDebug()
    publishStats(performance.now())

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
        stepRun(run, fire.consume() ? FIRE_COMMANDS : NO_COMMANDS)
      },
      frame: (steps) => {
        countFrame()
        debug.framesTotal = getFrameCount()
        debug.loops = activeLoopCount()
        syncDebug()

        const now = performance.now()
        if (now - lastHudPublish >= HUD_INTERVAL_MS) publishStats(now)

        if (steps > 0 && started && camera) renderer.draw(camera, view)
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
      renderer.draw(camera, view)
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
      renderer.draw(camera, view)
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
      detachFire()
      observer.disconnect()
      window.removeEventListener('resize', resize)
      resolutionQuery?.removeEventListener('change', rearmResolution)
      resolutionQuery = null
      renderer.dispose()
      if (window.__game === debug) delete window.__game
    }
  }, [])

  return <Stage canvasRef={canvasRef} overlay={<Hud />} />
}
