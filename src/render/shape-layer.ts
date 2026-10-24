import * as THREE from 'three'
import type { Rgb } from '@/render/palette'

export type ShapeLayerOptions = {
  capacity: number
  renderOrder: number
  /** Additive blending: glows, and fades out by darkening the color. */
  additive?: boolean
}

/**
 * One instanced draw of a unit shape (eco-evo's instanced layer pattern):
 * per-instance position, scale, rotation and color. Call `begin`, `push` each
 * instance, then `end` once per frame.
 */
export class ShapeLayer {
  public readonly mesh: THREE.InstancedMesh
  private readonly material: THREE.MeshBasicMaterial
  private readonly colors: Float32Array
  private readonly capacity: number
  private readonly matrix = new THREE.Matrix4()
  private readonly geometry: THREE.BufferGeometry
  private count = 0

  public constructor(
    geometry: THREE.BufferGeometry,
    options: ShapeLayerOptions,
  ) {
    this.geometry = geometry
    this.capacity = options.capacity
    this.colors = new Float32Array(options.capacity * 3)
    this.material = new THREE.MeshBasicMaterial({
      toneMapped: false,
      side: THREE.DoubleSide,
      transparent: options.additive ?? false,
      blending: options.additive
        ? THREE.AdditiveBlending
        : THREE.NormalBlending,
      depthTest: false,
      depthWrite: false,
    })
    this.mesh = new THREE.InstancedMesh(
      geometry,
      this.material,
      options.capacity,
    )
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(this.colors, 3)
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = options.renderOrder
    this.mesh.count = 0
  }

  public begin(): void {
    this.count = 0
  }

  /** Add one instance. Extra instances past capacity are skipped. */
  public push(
    x: number,
    y: number,
    scaleX: number,
    scaleY: number,
    rotation: number,
    color: Rgb,
    brightness = 1,
  ): void {
    if (this.count >= this.capacity) return
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)
    // prettier-ignore
    this.matrix.set(
      cos * scaleX, -sin * scaleY, 0, x,
      sin * scaleX, cos * scaleY, 0, y,
      0, 0, 1, 0,
      0, 0, 0, 1,
    )
    this.mesh.setMatrixAt(this.count, this.matrix)
    const offset = this.count * 3
    this.colors[offset] = color[0] * brightness
    this.colors[offset + 1] = color[1] * brightness
    this.colors[offset + 2] = color[2] * brightness
    this.count += 1
  }

  public end(): void {
    this.mesh.count = this.count
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }

  public dispose(): void {
    this.geometry.dispose()
    this.material.dispose()
    this.mesh.dispose()
  }
}

/** Unit square centered on the origin (scale = width, height). */
export const squareGeometry = (): THREE.BufferGeometry =>
  new THREE.PlaneGeometry(1, 1)

/** Unit-diameter circle centered on the origin (scale = diameter). */
export const circleGeometry = (segments = 20): THREE.BufferGeometry =>
  new THREE.CircleGeometry(0.5, segments)
