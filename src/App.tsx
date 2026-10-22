import { useCallback, useEffect, useRef } from 'react'
import { CLICK, ENEMY, WORLD } from '@/data/balance'
import type { Camera } from '@/engine/camera'
import { createFitCamera, worldToScreen } from '@/engine/camera'
import { FIXED_STEP } from '@/engine/config'
import { activeLoopCount, createLoop } from '@/engine/loop'
import { Renderer } from '@/render/renderer'
import { TOWER_ANCHOR } from '@/render/tower-layer'
import {
  BUY_TOWER_COMMAND,
  FIRE_COMMAND,
  type Command,
  type ShotEvent,
  type SimEvents,
} from '@/sim/combat'
import { safety, spawnRate, towerDps } from '@/sim/economy'
import { previewTowerBuy } from '@/sim/purchase'
import { createRun, stepRun } from '@/sim/run'
import { createRenderView } from '@/sim/view'
import { countFrame, createDebugState, getFrameCount } from '@/ui/debug'
import { formatCurrency } from '@/ui/format'
import { createFireInput } from '@/ui/fire-input'
import { Hud } from '@/ui/Hud'
import { publishHud } from '@/ui/hud-store'
import { Popups } from '@/ui/Popups'
import {
  getPopups,
  getPopupsPushed,
  prunePopups,
  pushPopup,
} from '@/ui/popup-store'
import { Stage } from '@/ui/Stage'
import { stressEnemies } from '@/ui/stress'
import { TowerBadge } from '@/ui/TowerBadge'
import { TowerPanel } from '@/ui/TowerPanel'

type Measurement = {
  width: number
  height: number
  dpr: number
}

const HUD_INTERVAL_MS = 100

const NO_SHOTS: readonly ShotEvent[] = []

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
  // One-shot command queue shared by the frame loop and the purchase panel.
  const commandsRef = useRef<Command[]>([])

  const onBuy = useCallback((): void => {
    commandsRef.current.push(BUY_TOWER_COMMAND)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const run = createRun()
    const commands = commandsRef.current
    commands.length = 0
    const view = createRenderView(run.enemies)
    const renderer = new Renderer(canvas)
    const fire = createFireInput()
    const detachFire = fire.attach(canvas)
    // Frame-scoped visual sink; cleared on every frame that consumes it.
    const events: SimEvents = { shots: [], kills: [], purchases: [] }
    const debug = createDebugState(renderer.drawn)
    window.__game = debug

    const params = new URLSearchParams(location.search)
    const stressParam = params.get('stress')
    const requested = Number(stressParam)
    const stress =
      import.meta.env.DEV && stressParam !== null && Number.isFinite(requested)
        ? stressEnemies(run, requested)
        : 0
    debug.stress = stress

    const bankParam = params.get('bank')
    const bank = Number(bankParam)
    if (
      import.meta.env.DEV &&
      bankParam !== null &&
      Number.isFinite(bank) &&
      bank > 0
    ) {
      run.currency = bank
    }

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
      debug.towers = run.towerCount
      debug.dps = towerDps(run.towerCount)
      debug.safety = safety(run.towerCount, ENEMY.baseHp, fire.isHolding())
      debug.tracersSpawned = renderer.stats.tracersSpawned
      debug.clickCooldown = run.clickCooldown
      debug.clickIntervalTicks = CLICK.intervalTicks
      debug.renderCalls = renderer.stats.calls
      debug.renderTriangles = renderer.stats.triangles
      debug.tracersSeen = renderer.stats.tracersSeen
    }

    const publishStats = (now: number): void => {
      lastHudPublish = now
      const stats = readStats()
      const preview = previewTowerBuy(run, fire.isHolding())
      const anchor = camera
        ? worldToScreen(camera, TOWER_ANCHOR.x, TOWER_ANCHOR.y + 34)
        : null
      publishHud({
        currency: stats.currency,
        enemies: stats.enemies,
        spawnRate: stats.spawnRate,
        leaks: stats.leaks,
        kills: stats.kills,
        towers: run.towerCount,
        towerCost: preview.cost,
        affordable: preview.affordable,
        dpsGain: preview.dpsGain,
        spawnGainPercent: preview.spawnGainPercent,
        safetyBefore: preview.safetyBefore,
        safetyAfter: preview.safetyAfter,
        towerX: anchor?.x ?? 0,
        towerY: anchor?.y ?? 0,
      })
      prunePopups(now)
      debug.popups = getPopups().length
      debug.popupsPushed = getPopupsPushed()
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
        if (fire.consume()) commands.push(FIRE_COMMAND)
        try {
          stepRun(run, commands, events)
        } finally {
          // Commands are one-shot: a persisted buy must never re-purchase.
          commands.length = 0
        }
      },
      frame: (steps) => {
        countFrame()
        debug.framesTotal = getFrameCount()
        debug.loops = activeLoopCount()
        syncDebug()

        const now = performance.now()
        if (now - lastHudPublish >= HUD_INTERVAL_MS) publishStats(now)

        if (steps > 0 && started && camera) {
          try {
            renderer.draw(
              camera,
              view,
              events.shots,
              steps * FIXED_STEP,
              run.towerCount,
            )
            for (const kill of events.kills) {
              const screen = worldToScreen(camera, kill.x, kill.y)
              pushPopup(
                screen.x,
                screen.y,
                `+${formatCurrency(kill.bounty)}`,
                now,
              )
            }
            if (events.purchases.length > 0) {
              const spent = events.purchases.reduce(
                (total, purchase) => total + purchase.cost,
                0,
              )
              const screen = worldToScreen(
                camera,
                TOWER_ANCHOR.x,
                TOWER_ANCHOR.y - 50,
              )
              const stack = getPopups().length
              pushPopup(
                screen.x,
                screen.y - stack * 16,
                `-${formatCurrency(spent)}`,
                now,
              )
            }
          } finally {
            // Documented sink contract: drain after a frame consumed it.
            events.shots.length = 0
            events.kills.length = 0
            events.purchases.length = 0
          }
        }
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
      renderer.draw(camera, view, NO_SHOTS, 0, run.towerCount)
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
      renderer.draw(camera, view, NO_SHOTS, 0, run.towerCount)
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
      commands.length = 0
      renderer.dispose()
      if (window.__game === debug) delete window.__game
    }
  }, [])

  return (
    <Stage
      canvasRef={canvasRef}
      overlay={
        <>
          <Hud />
          <TowerBadge />
          <TowerPanel onBuy={onBuy} />
          <Popups />
        </>
      }
    />
  )
}
