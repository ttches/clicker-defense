/** Viewport size in CSS pixels. */
export type Viewport = {
  width: number
  height: number
}

/**
 * Camera center in world coordinates, CSS pixels per world unit, and the
 * viewport it renders into. Y increases downward.
 */
export type Camera = {
  x: number
  y: number
  zoom: number
  viewport: Viewport
}

export type ViewBounds = {
  left: number
  top: number
  right: number
  bottom: number
}

export type WorldSize = {
  readonly width: number
  readonly height: number
}

const dimension = (value: number): number =>
  Number.isFinite(value) ? Math.max(1, value) : 1

/** Centered on the world, zoomed until the whole world fits the viewport. */
export const createFitCamera = (
  viewport: Viewport,
  world: WorldSize,
): Camera => {
  const safe: Viewport = {
    width: dimension(viewport.width),
    height: dimension(viewport.height),
  }
  const worldWidth = dimension(world.width)
  const worldHeight = dimension(world.height)
  return {
    x: worldWidth / 2,
    y: worldHeight / 2,
    zoom: Math.min(safe.width / worldWidth, safe.height / worldHeight),
    viewport: safe,
  }
}

/** World-space rectangle currently visible through the viewport. */
export const viewBounds = (camera: Camera): ViewBounds => {
  const halfWidth = camera.viewport.width / camera.zoom / 2
  const halfHeight = camera.viewport.height / camera.zoom / 2
  return {
    left: camera.x - halfWidth,
    top: camera.y - halfHeight,
    right: camera.x + halfWidth,
    bottom: camera.y + halfHeight,
  }
}

/** Convert viewport pixels (origin top-left) to world coordinates. */
export const screenToWorld = (
  camera: Camera,
  screenX: number,
  screenY: number,
): { x: number; y: number } => {
  const bounds = viewBounds(camera)
  return {
    x: bounds.left + screenX / camera.zoom,
    y: bounds.top + screenY / camera.zoom,
  }
}

/** Convert world coordinates to viewport pixels (origin top-left). */
export const worldToScreen = (
  camera: Camera,
  worldX: number,
  worldY: number,
): { x: number; y: number } => {
  const bounds = viewBounds(camera)
  return {
    x: (worldX - bounds.left) * camera.zoom,
    y: (worldY - bounds.top) * camera.zoom,
  }
}
