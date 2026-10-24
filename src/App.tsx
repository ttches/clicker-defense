import { useCallback, useEffect, useRef, useState } from 'react'
import { fitView, worldToCss, type View } from '@/engine/camera'
import { FIXED_STEP } from '@/engine/config'
import { createLoop } from '@/engine/loop'
import { FIELD } from '@/data/balance'
import { Renderer } from '@/render/renderer'
import { enqueue, type Command } from '@/sim/commands'
import { drainEvents } from '@/sim/events'
import { readHud, type HudSnapshot } from '@/sim/hud'
import { GUN } from '@/sim/layout'
import { createRun, step } from '@/sim/world'
import { formatNumber } from '@/ui/format'
import { FloatingText } from '@/ui/FloatingText/floating-text'
import Hud from '@/ui/Hud/Hud'
import Shop from '@/ui/Shop/Shop'
import Stage from '@/ui/Stage/Stage'
import styles from './App.module.css'

/** How often the React HUD refreshes from the live sim, in ms. */
const HUD_REFRESH_MS = 100

/** Cap on bounty labels started per frame, so a big wave can't flood the DOM. */
const MAX_LABELS_PER_FRAME = 6

const seedFromUrl = (): number | undefined => {
  const value = new URLSearchParams(window.location.search).get('seed')
  const seed = value === null ? Number.NaN : Number.parseInt(value, 10)
  return Number.isFinite(seed) ? seed : undefined
}

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  // Created once and mutated in place by the sim loop, never replaced.
  const [world] = useState(() => createRun(seedFromUrl()))
  const [hud, setHud] = useState<HudSnapshot>(() => readHud(world))
  const [view, setView] = useState<View>(() => fitView(1, 1))
  /** Pointers and keys currently holding fire, so each release is matched. */
  const holdersRef = useRef(new Set<string>())

  const send = useCallback(
    (command: Command) => enqueue(world, command),
    [world],
  )

  const pressFire = useCallback(
    (holder: string) => {
      if (holdersRef.current.has(holder)) return
      holdersRef.current.add(holder)
      send({ type: 'fireDown' })
    },
    [send],
  )

  const releaseFire = useCallback(
    (holder: string) => {
      if (!holdersRef.current.delete(holder)) return
      send({ type: 'fireUp' })
    },
    [send],
  )

  const releaseAll = useCallback(() => {
    for (const holder of [...holdersRef.current]) releaseFire(holder)
  }, [releaseFire])

  const buyTower = useCallback(() => send({ type: 'buyTower' }), [send])

  // Loop, renderer, resize, and tab visibility.
  useEffect(() => {
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!canvas || !overlay) return

    const measure = (): View => {
      const rect = canvas.getBoundingClientRect()
      return fitView(rect.width, rect.height)
    }
    let currentView = measure()
    setView(currentView)
    const renderer = new Renderer(canvas, currentView)
    const labels = new FloatingText(overlay)

    const resizeObserver = new ResizeObserver(() => {
      currentView = measure()
      renderer.resize(currentView)
      setView(currentView)
    })
    resizeObserver.observe(canvas)

    let lastFrame = performance.now()
    let lastHud = 0
    const loop = createLoop(FIXED_STEP, {
      step: () => step(world),
      frame: () => {
        const now = performance.now()
        const frameSeconds = Math.min((now - lastFrame) / 1000, 0.1)
        lastFrame = now

        const events = drainEvents(world.events)
        renderer.emit(events)
        let started = 0
        for (const event of events) {
          if (event.type !== 'kill' || started >= MAX_LABELS_PER_FRAME) continue
          const point = worldToCss(currentView, event.x, event.y - 18)
          labels.show(`+${formatNumber(event.bounty)}`, point.x, point.y)
          started += 1
        }
        renderer.draw(world, currentView, frameSeconds)

        if (now - lastHud >= HUD_REFRESH_MS) {
          lastHud = now
          setHud(readHud(world))
        }
      },
    })
    loop.start()

    // Hidden tabs pause the run; that time is dropped for now (M6 turns it
    // into offline income).
    const handleVisibility = (): void => {
      if (document.hidden) {
        loop.stop()
        releaseAll()
      } else {
        lastFrame = performance.now()
        loop.start()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', releaseAll)

    return () => {
      loop.stop()
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', releaseAll)
      resizeObserver.disconnect()
      labels.dispose()
      renderer.dispose()
    }
  }, [world, releaseAll])

  // Pointer fire on the canvas.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const down = (event: PointerEvent): void => {
      if (event.button !== 0) return
      event.preventDefault()
      canvas.setPointerCapture(event.pointerId)
      pressFire(`pointer:${event.pointerId}`)
    }
    const up = (event: PointerEvent): void => {
      releaseFire(`pointer:${event.pointerId}`)
    }
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    canvas.addEventListener('lostpointercapture', up)
    return () => {
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      canvas.removeEventListener('lostpointercapture', up)
    }
  }, [pressFire, releaseFire])

  // Keyboard: hold Space to fire, B to buy a tower.
  useEffect(() => {
    const isTyping = (target: EventTarget | null): boolean =>
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        ['INPUT', 'TEXTAREA'].includes(target.tagName))

    const down = (event: KeyboardEvent): void => {
      if (isTyping(event.target)) return
      if (event.code === 'Space') {
        event.preventDefault()
        if (!event.repeat) pressFire('key:space')
      } else if (event.code === 'KeyB' && !event.repeat) {
        buyTower()
      }
    }
    const up = (event: KeyboardEvent): void => {
      if (event.code === 'Space') releaseFire('key:space')
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [pressFire, releaseFire, buyTower])

  const towerLabel = worldToCss(view, GUN.x, FIELD.height - 28)
  const hintPoint = worldToCss(view, (FIELD.lineX + FIELD.width) / 2, 40)

  const overlay = (
    <div ref={overlayRef} className={styles.labels}>
      {hud.towers > 0 ? (
        <span
          className={`${styles.fieldLabel} ${styles.towerCount}`}
          style={{ left: towerLabel.x, top: towerLabel.y }}
        >
          towers ×{hud.towers}
        </span>
      ) : null}
      {hud.kills < 3 ? (
        <span
          className={`${styles.fieldLabel} ${styles.hint}`}
          style={{ left: hintPoint.x, top: hintPoint.y }}
        >
          Click or hold to fire
        </span>
      ) : null}
    </div>
  )

  return (
    <Stage
      canvasRef={canvasRef}
      header={<Hud hud={hud} />}
      overlay={overlay}
      sidePanel={<Shop hud={hud} onBuyTower={buyTower} />}
    />
  )
}

export default App
