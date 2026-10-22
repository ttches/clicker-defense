export type Popup = {
  id: number
  x: number
  y: number
  text: string
  bornAt: number
}

export const POPUP_TTL_MS = 900

type Listener = () => void

let popups: readonly Popup[] = []
let nextId = 1
let pushed = 0
const listeners = new Set<Listener>()

const notify = (): void => {
  for (const listener of listeners) listener()
}

export const pushPopup = (
  x: number,
  y: number,
  text: string,
  now: number,
): void => {
  popups = [...popups, { id: nextId, x, y, text, bornAt: now }]
  nextId += 1
  pushed += 1
  notify()
}

export const getPopupsPushed = (): number => pushed

export const prunePopups = (now: number): void => {
  let kept = 0
  for (const popup of popups) {
    if (now - popup.bornAt < POPUP_TTL_MS) kept += 1
  }
  if (kept === popups.length) return

  const next: Popup[] = []
  for (const popup of popups) {
    if (now - popup.bornAt < POPUP_TTL_MS) next.push(popup)
  }
  popups = next
  notify()
}

export const getPopups = (): readonly Popup[] => popups

export const subscribePopups = (listener: Listener): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
