import * as THREE from 'three'
import { CAPS } from '@/data/balance'
import { CAMERA } from '@/engine/config'
import type { ViewBounds } from '@/engine/camera'
import { clamp } from '@/engine/math'
import { createFlatMaterial } from '@/render/materials'
import { ENEMY_COLOR, ENEMY_HURT_COLOR } from '@/render/palette'
import { RENDER_ORDER } from '@/render/render-order'
import type { RenderableWorld } from '@/sim/view'

const ENEMY_RADIUS = 16
const ENEMY_WIDTH = 0.92
const ENEMY_TALL = 1.08
const BOUNDS_RADIUS = ENEMY_RADIUS * ENEMY_TALL
const TRIANGLE_SEGMENTS = 3

const matrix = new THREE.Matrix4()
const baseColor = new THREE.Color(ENEMY_COLOR)
const hurtColor = new THREE.Color(ENEMY_HURT_COLOR)
const mixedColor = new THREE.Color()

/** One instanced triangle per enemy, pointing along the direction of travel. */
export class EnemyLayer {
  public readonly mesh: THREE.InstancedMesh
  private readonly geometry: THREE.CircleGeometry
  private readonly material: THREE.MeshBasicMaterial
  private readonly colors = new Float32Array(CAPS.enemies * 3)
  private visibleCount = 0

  public constructor() {
    this.geometry = new THREE.CircleGeometry(1, TRIANGLE_SEGMENTS)
    this.geometry.rotateZ(Math.PI)
    // White base: instanceColor is the single colour authority (r186 multiplies
    // the two, so tinting the material would darken every enemy twice).
    this.material = createFlatMaterial(0xffffff)
    this.mesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      CAPS.enemies,
    )
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(this.colors, 3)
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = RENDER_ORDER.enemies
  }

  public get visible(): number {
    return this.visibleCount
  }

  public update(world: RenderableWorld, bounds: ViewBounds): void {
    const count = Math.min(world.count, CAPS.enemies)
    let maxScale = 1
    for (let index = 0; index < count; index += 1) {
      if (world.scale[index] > maxScale) maxScale = world.scale[index]
    }
    const margin = BOUNDS_RADIUS * maxScale + CAMERA.cullMargin
    let visible = 0

    for (let index = 0; index < count; index += 1) {
      const x = world.x[index]
      const y = world.y[index]
      if (x < bounds.left - margin || x > bounds.right + margin) continue
      if (y < bounds.top - margin || y > bounds.bottom + margin) continue

      const scale = world.scale[index]
      matrix.makeScale(
        ENEMY_RADIUS * scale * ENEMY_WIDTH,
        ENEMY_RADIUS * scale * ENEMY_TALL,
        1,
      )
      matrix.setPosition(x, y, 0)
      this.mesh.setMatrixAt(visible, matrix)

      const maxHp = world.maxHp[index]
      const health = maxHp > 0 ? clamp(world.hp[index] / maxHp, 0, 1) : 1
      mixedColor.copy(baseColor).lerp(hurtColor, 1 - health)
      mixedColor.toArray(this.colors, visible * 3)
      visible += 1
    }

    this.visibleCount = visible
    this.mesh.count = visible
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }

  public dispose(): void {
    this.geometry.dispose()
    this.material.dispose()
    this.mesh.dispose()
  }
}
