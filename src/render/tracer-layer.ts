import * as THREE from 'three'
import { clamp } from '@/engine/math'
import { createFlatMaterial } from '@/render/materials'
import { TRACER_CLICK_COLOR, TRACER_TOWER_COLOR } from '@/render/palette'
import { RENDER_ORDER } from '@/render/render-order'
import type { ShotEvent } from '@/sim/combat'

export const MAX_TRACERS = 256

export const TRACER_SECONDS = 0.12

const TRACER_LENGTH_MIN = 24
const TRACER_LENGTH_MAX = 48
const TRACER_WIDTH = 3

type TracerSlot = {
  active: boolean
  fromX: number
  fromY: number
  toX: number
  toY: number
  elapsed: number
  kind: ShotEvent['kind']
}

/** Module-level scratch; the layer never allocates per shot or per frame. */
const position = new THREE.Vector3()
const scale = new THREE.Vector3()
const rotation = new THREE.Quaternion()
const matrix = new THREE.Matrix4()
const Z_AXIS = new THREE.Vector3(0, 0, 1)

const clickColor = new THREE.Color(TRACER_CLICK_COLOR)
const towerColor = new THREE.Color(TRACER_TOWER_COLOR)
const clickRgb = clickColor.toArray()
const towerRgb = towerColor.toArray()

const createSlot = (): TracerSlot => ({
  active: false,
  fromX: 0,
  fromY: 0,
  toX: 0,
  toY: 0,
  elapsed: 0,
  kind: 'click',
})

/**
 * Pooled tracer streaks. Damage already landed in the sim at fire time; this
 * layer is cosmetic only and never feeds back into run state.
 */
export class TracerLayer {
  public readonly mesh: THREE.InstancedMesh
  private readonly geometry: THREE.PlaneGeometry
  private readonly material: THREE.MeshBasicMaterial
  private readonly slots: TracerSlot[] = []
  private readonly colors = new Float32Array(MAX_TRACERS * 3)
  private cursor = 0
  private visibleCount = 0
  private spawnedCount = 0

  public constructor() {
    for (let index = 0; index < MAX_TRACERS; index += 1) {
      this.slots.push(createSlot())
    }

    this.geometry = new THREE.PlaneGeometry(1, 1)
    // White base: per-instance colour is the single colour authority.
    this.material = createFlatMaterial(0xffffff)
    this.mesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      MAX_TRACERS,
    )
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(this.colors, 3)
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = RENDER_ORDER.tracers
    this.mesh.count = 0
  }

  public get visible(): number {
    return this.visibleCount
  }

  /** Cumulative accepted tracers; never decreases, used by the smoke gate. */
  public get spawned(): number {
    return this.spawnedCount
  }

  public spawn(shots: readonly ShotEvent[]): void {
    let scanned = 0

    for (let index = 0; index < shots.length; index += 1) {
      let slot = -1
      while (scanned < MAX_TRACERS) {
        const candidate = this.cursor
        this.cursor = (this.cursor + 1) % MAX_TRACERS
        scanned += 1
        if (!this.slots[candidate].active) {
          slot = candidate
          break
        }
      }
      if (slot === -1) return

      const record = this.slots[slot]
      const shot = shots[index]
      record.active = true
      record.fromX = shot.fromX
      record.fromY = shot.fromY
      record.toX = shot.toX
      record.toY = shot.toY
      record.elapsed = 0
      record.kind = shot.kind
      this.spawnedCount += 1
    }
  }

  public update(deltaSeconds: number): void {
    let visible = 0

    for (let index = 0; index < MAX_TRACERS; index += 1) {
      const slot = this.slots[index]
      if (!slot.active) continue

      const dx = slot.toX - slot.fromX
      const dy = slot.toY - slot.fromY
      const progress = clamp(slot.elapsed / TRACER_SECONDS, 0, 1)
      position.set(slot.fromX + dx * progress, slot.fromY + dy * progress, 0)
      rotation.setFromAxisAngle(Z_AXIS, Math.atan2(dy, dx))
      scale.set(
        clamp(Math.hypot(dx, dy), TRACER_LENGTH_MIN, TRACER_LENGTH_MAX),
        TRACER_WIDTH,
        1,
      )
      matrix.compose(position, rotation, scale)
      this.mesh.setMatrixAt(visible, matrix)

      const rgb = slot.kind === 'click' ? clickRgb : towerRgb
      const offset = visible * 3
      this.colors[offset] = rgb[0]
      this.colors[offset + 1] = rgb[1]
      this.colors[offset + 2] = rgb[2]
      visible += 1

      slot.elapsed += deltaSeconds
      if (slot.elapsed >= TRACER_SECONDS) slot.active = false
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
