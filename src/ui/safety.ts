export type SafetyLevel = 'danger' | 'warning' | 'safe'

/** Below 1 leaks; just above 1 is a knife-edge. */
export const safetyLevel = (value: number): SafetyLevel =>
  value < 1 ? 'danger' : value < 1.2 ? 'warning' : 'safe'
