import * as THREE from 'three'
import { ENEMY, WORLD } from '@/data/balance'
import { createFlatMaterial } from '@/render/materials'
import { TOWER_BARREL_COLOR, TOWER_BASE_COLOR } from '@/render/palette'
import { RENDER_ORDER } from '@/render/render-order'

export const TOWER_ANCHOR = {
  x: ENEMY.lineX - 36,
  y: WORLD.height / 2,
} as const

const TOWER_X = TOWER_ANCHOR.x
const BASE_WIDTH = 80
const BASE_HEIGHT = 34
const BARREL_WIDTH = 52
const BARREL_HEIGHT = 14
const BARREL_OFFSET_X = 26

/**
 * One turret silhouette represents the tower type. The ×N badge carries the
 * count; the sim owns the actual tower count and this layer only reflects it.
 */
export class TowerLayer {
  public readonly mesh = new THREE.Group()
  private readonly geometries: THREE.PlaneGeometry[] = []
  private readonly materials: THREE.MeshBasicMaterial[] = []
  private visibleCount = 0

  public constructor() {
    const baseGeometry = new THREE.PlaneGeometry(BASE_WIDTH, BASE_HEIGHT)
    const baseMaterial = createFlatMaterial(TOWER_BASE_COLOR)
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.renderOrder = RENDER_ORDER.towers

    const barrelGeometry = new THREE.PlaneGeometry(BARREL_WIDTH, BARREL_HEIGHT)
    const barrelMaterial = createFlatMaterial(TOWER_BARREL_COLOR)
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial)
    barrel.position.x = BARREL_OFFSET_X
    barrel.renderOrder = RENDER_ORDER.towers

    this.mesh.position.set(TOWER_X, TOWER_ANCHOR.y, 0)
    this.mesh.visible = false
    this.mesh.add(base, barrel)
    this.geometries.push(baseGeometry, barrelGeometry)
    this.materials.push(baseMaterial, barrelMaterial)
  }

  public get visible(): number {
    return this.visibleCount
  }

  public readonly update = (towerCount: number): void => {
    const visible = towerCount > 0
    this.mesh.visible = visible
    this.visibleCount = visible ? 1 : 0
  }

  public readonly dispose = (): void => {
    for (const geometry of this.geometries) geometry.dispose()
    for (const material of this.materials) material.dispose()
    this.geometries.length = 0
    this.materials.length = 0
    this.mesh.clear()
  }
}
