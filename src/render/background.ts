import * as THREE from 'three'
import { ENEMY, WORLD } from '@/data/balance'
import { createFlatMaterial } from '@/render/materials'
import { GROUND_COLOR, LINE_COLOR, SPAWN_EDGE_COLOR } from '@/render/palette'
import { RENDER_ORDER } from '@/render/render-order'

const EDGE_WIDTH = 6

type Strip = {
  geometry: THREE.PlaneGeometry
  material: THREE.MeshBasicMaterial
  mesh: THREE.Mesh
}

const createStrip = (x: number, color: number): Strip => {
  const geometry = new THREE.PlaneGeometry(EDGE_WIDTH, WORLD.height)
  const material = createFlatMaterial(color)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(x, WORLD.height / 2, 0)
  mesh.renderOrder = RENDER_ORDER.edge
  return { geometry, material, mesh }
}

/** Dark field with the defence line and the spawn edge. */
export class BackgroundLayer {
  public readonly mesh = new THREE.Group()
  private readonly strips: Strip[] = []

  public constructor() {
    const geometry = new THREE.PlaneGeometry(WORLD.width, WORLD.height)
    const material = createFlatMaterial(GROUND_COLOR)
    const ground = new THREE.Mesh(geometry, material)
    ground.position.set(WORLD.width / 2, WORLD.height / 2, 0)
    ground.renderOrder = RENDER_ORDER.ground

    const line = createStrip(ENEMY.lineX, LINE_COLOR)
    const spawn = createStrip(ENEMY.spawnX, SPAWN_EDGE_COLOR)

    this.mesh.add(ground, line.mesh, spawn.mesh)
    this.strips.push({ geometry, material, mesh: ground }, line, spawn)
  }

  public dispose(): void {
    for (const strip of this.strips) {
      strip.geometry.dispose()
      strip.material.dispose()
    }
    this.strips.length = 0
    this.mesh.clear()
  }
}
