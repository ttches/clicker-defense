import * as THREE from 'three'
import { viewBounds, type Camera } from '@/engine/camera'
import { DPR_CAP } from '@/engine/config'
import { BackgroundLayer } from '@/render/background'
import { createDrawnCounts } from '@/render/drawn'
import { WORLD_BACKGROUND } from '@/render/palette'

export class Renderer {
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.OrthographicCamera
  private readonly background = new BackgroundLayer()
  public readonly drawn = createDrawnCounts()

  public constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(WORLD_BACKGROUND, 1)
    this.camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10)
    this.scene.add(this.background.mesh)
  }

  public resize(cssWidth: number, cssHeight: number, dpr: number): void {
    this.renderer.setPixelRatio(Math.min(dpr, DPR_CAP))
    this.renderer.setSize(cssWidth, cssHeight, false)
  }

  public draw(camera: Camera): void {
    const bounds = viewBounds(camera)
    // Y is down, so top < bottom: the negative Y scale flips triangle winding.
    // Every material rendered here must therefore be THREE.DoubleSide.
    this.camera.left = bounds.left
    this.camera.right = bounds.right
    this.camera.top = bounds.top
    this.camera.bottom = bounds.bottom
    this.camera.updateProjectionMatrix()

    this.renderer.render(this.scene, this.camera)
    this.drawn.background += 1
  }

  /** Ratio actually applied after the DPR cap. */
  public get pixelRatio(): number {
    return this.renderer.getPixelRatio()
  }

  public dispose(): void {
    this.background.dispose()
    this.renderer.dispose()
  }
}
