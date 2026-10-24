import type { HudSnapshot } from '@/sim/hud'
import { formatNumber, formatRatio } from '@/ui/format'
import { safetyLevel } from '@/ui/safety'
import styles from './Hud.module.css'

type HudProps = {
  hud: HudSnapshot
}

type StatProps = {
  label: string
  value: string
  title?: string
}

const Stat = ({ label, value, title }: StatProps) => (
  <div className={styles.stat} title={title}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value}>{value}</span>
  </div>
)

const Hud = ({ hud }: HudProps) => {
  const shown = hud.holding ? hud.safetyHolding : hud.safety
  return (
    <header className={styles.hud}>
      <div className={styles.currency} title="Currency (earned from kills)">
        <span className={styles.coin} aria-hidden="true" />
        <span className={styles.amount}>{formatNumber(hud.currency)}</span>
        <span className={styles.rate}>
          +{formatNumber(hud.incomePerSecond)}/s
        </span>
      </div>
      <div className={styles.stats}>
        <div
          className={styles.safety}
          data-level={safetyLevel(shown)}
          title="Your DPS ÷ incoming enemy HP per second. Under 1× leaks."
        >
          <span className={styles.label}>
            Safety{hud.holding ? ' (holding)' : ''}
          </span>
          <span className={styles.value}>{formatRatio(shown)}</span>
        </div>
        <Stat
          label="DPS"
          value={formatNumber(hud.towerDps + (hud.holding ? hud.holdDps : 0))}
          title={`Towers ${formatNumber(hud.towerDps)} + holding ${formatNumber(hud.holdDps)}`}
        />
        <Stat
          label="Incoming HP/s"
          value={formatNumber(hud.incoming)}
          title="Enemy HP arriving per second"
        />
        <Stat label="Spawn/s" value={hud.spawnRate.toFixed(3)} />
        <Stat label="Kills" value={hud.kills.toString()} />
        <Stat
          label="Leaked"
          value={hud.leaks.toString()}
          title="Enemies that reached the line. No penalty yet, but no bounty."
        />
      </div>
    </header>
  )
}

export default Hud
