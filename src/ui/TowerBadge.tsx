import { useSyncExternalStore } from 'react'
import { getHudValues, subscribeHud } from '@/ui/hud-store'
import styles from './TowerBadge.module.css'

/** The count for the single rendered turret silhouette. */
export const TowerBadge = () => {
  const { towers, towerX, towerY } = useSyncExternalStore(
    subscribeHud,
    getHudValues,
  )

  if (towers === 0) return null

  return (
    <div
      className={styles.badge}
      style={{ left: towerX, top: towerY }}
      data-tower-badge="count"
      aria-hidden="true"
    >
      ×{towers}
    </div>
  )
}
