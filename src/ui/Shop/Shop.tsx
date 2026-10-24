import type { HudSnapshot } from '@/sim/hud'
import { formatNumber, formatPercent, formatRatio } from '@/ui/format'
import { safetyLevel } from '@/ui/safety'
import styles from './Shop.module.css'

type ShopProps = {
  hud: HudSnapshot
  onBuyTower: () => void
}

type ChangeProps = {
  label: string
  before: number
  after: number
}

const SafetyChange = ({ label, before, after }: ChangeProps) => (
  <div className={styles.row}>
    <span className={styles.rowLabel}>{label}</span>
    <span className={styles.change}>
      <span data-level={safetyLevel(before)}>{formatRatio(before)}</span>
      <span className={styles.arrow} aria-label="becomes">
        →
      </span>
      <span data-level={safetyLevel(after)}>{formatRatio(after)}</span>
    </span>
  </div>
)

const warningFor = (tower: HudSnapshot['tower']): string | null => {
  if (tower.holdingAfter < 1) return 'Leaks even while you hold fire.'
  if (tower.safetyAfter < 1) return 'Leaks unless you hold fire.'
  return null
}

const Shop = ({ hud, onBuyTower }: ShopProps) => {
  const { tower } = hud
  const warning = warningFor(tower)
  const first = hud.towers === 0
  const progress = Math.min(1, hud.currency / tower.cost)
  return (
    <div className={styles.shop}>
      <h2 className={styles.heading}>Build</h2>
      <section className={styles.card} aria-label="Tower">
        <div className={styles.titleRow}>
          <span className={styles.title}>Tower</span>
          <span className={styles.count}>×{hud.towers}</span>
        </div>
        <p className={styles.blurb}>
          Fires on its own: 1 damage every 0.5 s.
          {first ? ' The first one draws the horde.' : ''}
        </p>
        <div className={styles.row}>
          <span className={styles.rowLabel}>DPS</span>
          <span className={styles.good}>+{formatNumber(tower.dpsGain)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Spawn rate</span>
          <span className={first ? styles.bad : styles.mild}>
            {formatPercent(tower.spawnChange)}
          </span>
        </div>
        <SafetyChange
          label="Safety (towers)"
          before={tower.safetyBefore}
          after={tower.safetyAfter}
        />
        <SafetyChange
          label="Safety (holding)"
          before={tower.holdingBefore}
          after={tower.holdingAfter}
        />
        {warning ? <p className={styles.warning}>{warning}</p> : null}
        <button
          type="button"
          className={styles.buy}
          disabled={!tower.affordable}
          onClick={onBuyTower}
          title="Buy a tower (B)"
        >
          <span
            className={styles.fill}
            style={{ transform: `scaleX(${progress})` }}
            aria-hidden="true"
          />
          <span className={styles.label}>Buy</span>
          <span className={`${styles.label} ${styles.price}`}>
            <span className={styles.coin} aria-hidden="true" />
            {formatNumber(tower.cost)}
          </span>
        </button>
      </section>
      <p className={styles.help}>
        Click or hold on the field to fire (or hold Space). B buys a tower.
      </p>
    </div>
  )
}

export default Shop
