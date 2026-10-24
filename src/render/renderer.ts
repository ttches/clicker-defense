import * as THREE from 'three'
import type { View } from '@/engine/camera'
import { CAPS, ENEMY, FIELD } from '@/data/balance'
import { SOURCE_CODE } from '@/sim/bullets'
import type { GameEvent } from '@/sim/events'
import {
  GUN,
  MUZZLE_OFFSET,
  TOWER_SIZE,
  towerSlot,
  VISIBLE_TOWERS,
} from '@/sim/layout'
import type { World } from '@/sim/world'
import { Effects } from '@/render/effects'
import { PALETTE } from '@/render/palette'
import {
  circleGeometry,
  ShapeLayer,
  squareGeometry,
} from '@/render/shape-layer'

/** Ticks an enemy stays flashed after a hit. */
const HIT_FLASH_TICKS = 4
const TRACER_LENGTH = 34
const TRACER_WIDTH = 3

/**
 * Draws the world with a handful of instanced layers (eco-evo's renderer
 * pattern). The HUD and floating text are DOM, drawn by React.
 */
export class Renderer {
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10)
  private readonly background = new ShapeLayer(squareGeometry(), {
    capacity: 64,
    renderOrder: 0,
  })
  private readonly structures = new ShapeLayer(squareGeometry(), {
    capacity: 64,
    renderOrder: 1,
  })
  private readonly enemyOutlines = new ShapeLayer(circleGeometry(), {
    capacity: CAPS.maxEnemies,
    renderOrder: 2,
  })
  private readonly enemyBodies = new ShapeLayer(circleGeometry(), {
    capacity: CAPS.maxEnemies,
    renderOrder: 3,
  })
  private readonly healthBars = new ShapeLayer(squareGeometry(), {
    capacity: CAPS.maxEnemies * 2,
    renderOrder: 4,
  })
  private readonly bullets = new ShapeLayer(squareGeometry(), {
    capacity: CAPS.maxBullets,
    renderOrder: 5,
    additive: true,
  })
  private readonly particles = new ShapeLayer(circleGeometry(10), {
    capacity: 2048,
    renderOrder: 6,
    additive: true,
  })
  private readonly effects = new Effects()

  public constructor(canvas: HTMLCanvasElement, view: View) {
    THREE.ColorManagement.enabled = false
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(PALETTE.void, 1)
    // Palette hex values are display colors; don't let three.js re-encode them.
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace
    this.resize(view)
    this.scene.add(
      this.background.mesh,
      this.structures.mesh,
      this.enemyOutlines.mesh,
      this.enemyBodies.mesh,
      this.healthBars.mesh,
      this.bullets.mesh,
      this.particles.mesh,
    )
  }

  /** Native resolution: CSS size × devicePixelRatio. */
  public resize(view: View): void {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setSize(view.cssWidth, view.cssHeight, false)
  }

  public emit(events: readonly GameEvent[]): void {
    for (const event of events) this.effects.emit(event)
  }

  public draw(world: World, view: View, frameSeconds: number): void {
    // Y-down: top is the smaller world y.
    this.camera.left = view.left
    this.camera.right = view.right
    this.camera.top = view.top
    this.camera.bottom = view.bottom
    this.camera.updateProjectionMatrix()

    this.drawBackground()
    this.drawStructures(world)
    this.drawEnemies(world)
    this.drawBullets(world)
    this.effects.update(frameSeconds)
    this.particles.begin()
    this.effects.draw(this.particles)
    this.particles.end()

    this.renderer.render(this.scene, this.camera)
  }

  private drawBackground(): void {
    const layer = this.background
    layer.begin()
    const { width, height, lineX, lanes, laneTop, laneBottom } = FIELD
    const fieldWidth = width - lineX
    layer.push(
      lineX + fieldWidth / 2,
      height / 2,
      fieldWidth,
      height,
      0,
      PALETTE.field,
    )
    layer.push(lineX / 2, height / 2, lineX, height, 0, PALETTE.base)
    const laneHeight = (laneBottom - laneTop) / lanes
    for (let lane = 0; lane < lanes; lane += 2) {
      const y = laneTop + (lane + 0.5) * laneHeight
      layer.push(
        lineX + fieldWidth / 2,
        y,
        fieldWidth,
        laneHeight,
        0,
        PALETTE.laneStripe,
      )
    }
    layer.push(lineX, height / 2, 3, height, 0, PALETTE.line)
    layer.end()
  }

  private drawStructures(world: World): void {
    const layer = this.structures
    layer.begin()
    for (let slot = 0; slot < VISIBLE_TOWERS; slot += 1) {
      const { x, y } = towerSlot(slot)
      if (slot >= world.towers) {
        layer.push(x, y, TOWER_SIZE, TOWER_SIZE, 0, PALETTE.towerGhost)
        continue
      }
      layer.push(x, y, TOWER_SIZE, TOWER_SIZE, 0, PALETTE.towerBody)
      layer.push(
        x + MUZZLE_OFFSET / 2,
        y,
        MUZZLE_OFFSET,
        8,
        0,
        PALETTE.towerBarrel,
      )
    }
    layer.push(GUN.x, GUN.y, GUN.size, GUN.size, Math.PI / 4, PALETTE.gunBody)
    layer.push(
      GUN.x + MUZZLE_OFFSET / 2,
      GUN.y,
      MUZZLE_OFFSET + 4,
      10,
      0,
      PALETTE.gunBarrel,
    )
    layer.end()
  }

  private drawEnemies(world: World): void {
    const { enemies, tick } = world
    const outlines = this.enemyOutlines
    const bodies = this.enemyBodies
    const bars = this.healthBars
    outlines.begin()
    bodies.begin()
    bars.begin()
    const diameter = ENEMY.radius * 2
    for (let slot = 0; slot < enemies.count; slot += 1) {
      const x = enemies.x[slot]
      const y = enemies.y[slot]
      const flashed = tick - enemies.hitTick[slot] <= HIT_FLASH_TICKS
      outlines.push(x, y, diameter + 5, diameter + 5, 0, PALETTE.enemyOutline)
      bodies.push(
        x,
        y,
        diameter,
        diameter,
        0,
        flashed ? PALETTE.enemyFlash : PALETTE.enemyBody,
      )

      const health = enemies.hp[slot] / enemies.maxHp[slot]
      if (health >= 1) continue
      const barWidth = diameter + 4
      const barY = y - ENEMY.radius - 8
      bars.push(x, barY, barWidth, 5, 0, PALETTE.healthBack)
      const fill = barWidth * Math.max(0, health)
      bars.push(x - (barWidth - fill) / 2, barY, fill, 3, 0, PALETTE.healthFill)
    }
    outlines.end()
    bodies.end()
    bars.end()
  }

  private drawBullets(world: World): void {
    const { bullets } = world
    const layer = this.bullets
    layer.begin()
    for (let slot = 0; slot < bullets.count; slot += 1) {
      const dirX = bullets.dirX[slot]
      const dirY = bullets.dirY[slot]
      // Center the tracer behind the bullet's head.
      const x = bullets.x[slot] - dirX * TRACER_LENGTH * 0.5
      const y = bullets.y[slot] - dirY * TRACER_LENGTH * 0.5
      const color =
        bullets.source[slot] === SOURCE_CODE.click
          ? PALETTE.clickBullet
          : PALETTE.towerBullet
      layer.push(
        x,
        y,
        TRACER_LENGTH,
        TRACER_WIDTH,
        Math.atan2(dirY, dirX),
        color,
      )
    }
    layer.end()
  }

  public dispose(): void {
    for (const layer of [
      this.background,
      this.structures,
      this.enemyOutlines,
      this.enemyBodies,
      this.healthBars,
      this.bullets,
      this.particles,
    ]) {
      layer.dispose()
    }
    this.renderer.dispose()
  }
}
