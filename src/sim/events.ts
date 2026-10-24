/**
 * One-way messages from the sim to the renderer and HUD (effects, floating
 * bounty text). They are not game state: they are never saved, and dropping
 * them changes nothing in the simulation.
 */
export type GameEvent =
  | { type: 'shot'; x: number; y: number; source: ShotSource }
  | { type: 'hit'; x: number; y: number }
  | { type: 'kill'; x: number; y: number; bounty: number }
  | { type: 'leak'; x: number; y: number }
  | { type: 'bought'; towers: number }

export type ShotSource = 'click' | 'tower'

/** Kept small so a world nobody drains (tests, a hidden tab) stays bounded. */
const MAX_EVENTS = 1024

export const pushEvent = (events: GameEvent[], event: GameEvent): void => {
  if (events.length < MAX_EVENTS) events.push(event)
}

/** Take every event raised since the last drain. */
export const drainEvents = (events: GameEvent[]): GameEvent[] =>
  events.splice(0, events.length)
