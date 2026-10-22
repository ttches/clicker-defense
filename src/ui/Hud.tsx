import { useSyncExternalStore } from 'react'
import { getHudValues, subscribeHud, type HudValues } from '@/ui/hud-store'
import styles from './Hud.module.css'

const fixed = (value: number): string => value.toFixed(2)

type RowProps = {
  label: string
  field: keyof HudValues
  value: string
}

const Row = ({ label, field, value }: RowProps) => (
  <div className={styles.row}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value} data-hud={field}>
      {value}
    </span>
  </div>
)

export const Hud = () => {
  const { currency, enemies, spawnRate, leaks, kills } = useSyncExternalStore(
    subscribeHud,
    getHudValues,
  )

  return (
    <aside className={styles.hud} aria-label="Run stats">
      <Row label="Currency" field="currency" value={fixed(currency)} />
      <Row label="Enemies" field="enemies" value={String(enemies)} />
      <Row label="Spawn/s" field="spawnRate" value={fixed(spawnRate)} />
      <Row label="Leaks" field="leaks" value={String(leaks)} />
      <Row label="Kills" field="kills" value={String(kills)} />
    </aside>
  )
}
