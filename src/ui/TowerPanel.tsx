import { useSyncExternalStore } from 'react'
import { formatCurrency, formatSafety } from '@/ui/format'
import { getHudValues, subscribeHud } from '@/ui/hud-store'
import styles from './TowerPanel.module.css'

type TowerPanelProps = {
  onBuy: () => void
}

export const TowerPanel = ({ onBuy }: TowerPanelProps) => {
  const {
    towers,
    towerCost,
    affordable,
    dpsGain,
    spawnGainPercent,
    safetyBefore,
    safetyAfter,
  } = useSyncExternalStore(subscribeHud, getHudValues)

  return (
    <aside
      className={styles.panel}
      data-panel="tower"
      aria-label="Tower purchase"
    >
      <header className={styles.heading}>Tower ×{towers}</header>
      <div className={styles.row}>
        <span className={styles.label}>Cost</span>
        <span className={styles.value} data-tower="cost">
          {formatCurrency(towerCost)}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>DPS</span>
        <span className={styles.value} data-tower="dps">
          +{dpsGain.toFixed(1)}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Spawn</span>
        <span className={styles.value} data-tower="spawn">
          +{spawnGainPercent.toFixed(1)}%
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Safety</span>
        <span
          className={
            safetyAfter < 1 ? `${styles.value} ${styles.danger}` : styles.value
          }
          data-tower="safety"
          data-danger={safetyAfter < 1}
        >
          {formatSafety(safetyBefore)}× → {formatSafety(safetyAfter)}×
        </span>
      </div>
      <button
        type="button"
        className={styles.buy}
        data-buy="tower"
        disabled={!affordable}
        onClick={onBuy}
      >
        Buy
      </button>
    </aside>
  )
}
