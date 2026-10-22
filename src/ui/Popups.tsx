import { useSyncExternalStore } from 'react'
import { getPopups, POPUP_TTL_MS, subscribePopups } from '@/ui/popup-store'
import styles from './Popups.module.css'

export const Popups = () => {
  const popups = useSyncExternalStore(subscribePopups, getPopups)

  return (
    <div className={styles.popups} aria-hidden="true">
      {popups.map((popup) => (
        <span
          key={popup.id}
          className={styles.popup}
          style={{
            left: popup.x,
            top: popup.y,
            animationDuration: `${POPUP_TTL_MS}ms`,
          }}
        >
          {popup.text}
        </span>
      ))}
    </div>
  )
}
