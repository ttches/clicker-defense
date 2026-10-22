import * as THREE from 'three'
import { viewBounds, type Camera } from '@/engine/camera'
import { DPR_CAP, FIXED_STEP } from '@/engine/config'
import { BackgroundLayer } from '@/render/background'
import { createDrawnCounts } from '@/render/drawn'
import { EnemyLayer } from '@/render/enemy-layer'
import { WORLD_BACKGROUND } from '@/render/palette'
import { TowerLayer } from '@/render/tower-layer'
import { TracerLayer } from '@/render/tracer-layer'
import type { ShotEvent } from '@/sim/combat'
import type { RenderableWorld } from '@/sim/view'

export class Renderer {
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.OrthographicCamera
  private readonly background = new BackgroundLayer()
  private readonly enemies = new EnemyLayer()
  private readonly tracers = new TracerLayer()
  private readonly towers = new TowerLayer()
  public readonly drawn = createDrawnCounts()
  public readonly stats = {
    calls: 0,
    triangles: 0,
    tracersSpawned: 0,
    tracersSeen: 0,
  }

  public constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(WORLD_BACKGROUND, 1)
    this.camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10)
    this.scene.add(
      this.background.mesh,
      this.enemies.mesh,
      this.tracers.mesh,
      this.towers.mesh,
    )
  }

  public resize(cssWidth: number, cssHeight: number, dpr: number): void {
    this.renderer.setPixelRatio(Math.min(dpr, DPR_CAP))
    this.renderer.setSize(cssWidth, cssHeight, false)
  }

  public draw(
    camera: Camera,
    world: RenderableWorld,
    shots: readonly ShotEvent[],
    deltaSeconds: number,
    towerCount: number,
  ): void {
    const bounds = viewBounds(camera)
    // Y is down, so top < bottom: the negative Y scale flips triangle winding.
    // Every material rendered here must therefore be THREE.DoubleSide.
    this.camera.left = bounds.left
    this.camera.right = bounds.right
    this.camera.top = bounds.top
    this.camera.bottom = bounds.bottom
    this.camera.updateProjectionMatrix()

    this.enemies.update(world, bounds)
    this.towers.update(towerCount)
    this.tracers.spawn(shots)
    // Cosmetic lifetime is frame-clamped: a 0.1 s hitch must not consume a
    // 0.12 s tracer inside the same draw.
    this.tracers.update(Math.min(deltaSeconds, FIXED_STEP))
    this.renderer.render(this.scene, this.camera)
    const info = this.renderer.info.render
    this.stats.calls = info.calls
    this.stats.triangles = info.triangles
    this.stats.tracersSpawned = this.tracers.spawned
    this.stats.tracersSeen += this.tracers.visible
    this.drawn.background += 1
    this.drawn.enemies = this.enemies.visible
    this.drawn.tracers = this.tracers.visible
    this.drawn.towers = this.towers.visible
  }

  /** Ratio actually applied after the DPR cap. */
  public get pixelRatio(): number {
    return this.renderer.getPixelRatio()
  }

  public dispose(): void {
    this.background.dispose()
    this.enemies.dispose()
    this.tracers.dispose()
    this.towers.dispose()
    this.renderer.dispose()
  }
}
