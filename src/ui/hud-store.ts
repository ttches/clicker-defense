export type HudValues = {
  currency: number
  enemies: number
  spawnRate: number
  leaks: number
  kills: number
}

const initial: HudValues = {
  currency: 0,
  enemies: 0,
  spawnRate: 0,
  leaks: 0,
  kills: 0,
}

let values = initial
const listeners = new Set<() => void>()

export const publishHud = (next: HudValues): void => {
  values = next
  for (const listener of listeners) listener()
}

export const subscribeHud = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getHudValues = (): HudValues => values
