import type { ReactNode, RefObject } from 'react'
import styles from './Stage.module.css'

type StageProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  header: ReactNode
  overlay?: ReactNode
  /** Panel beside the field (below it on narrow screens). */
  sidePanel?: ReactNode
}

const Stage = ({ canvasRef, header, overlay, sidePanel }: StageProps) => (
  <main className={styles.stage}>
    <div className={styles.header}>{header}</div>
    <div className={styles.body}>
      <div className={styles.display}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="Battlefield. Click or hold to fire."
        />
        {overlay ? <div className={styles.overlay}>{overlay}</div> : null}
      </div>
      {sidePanel ? <aside className={styles.side}>{sidePanel}</aside> : null}
    </div>
  </main>
)

export default Stage
