import * as THREE from 'three'

/**
 * Flat, unlit material for world meshes. Double-sided because the y-down
 * camera flips triangle winding (see Renderer.draw). Create one per layer and
 * share it across that layer's meshes/instances; never call per entity.
 */
export const createFlatMaterial = (color: number): THREE.MeshBasicMaterial =>
  new THREE.MeshBasicMaterial({
    color,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
