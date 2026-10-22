import type { EnemyColumns } from '@/sim/types'

/** Columns the renderer may read; everything else stays sim-internal. */
export type RenderableColumns = Pick<
  EnemyColumns,
  'x' | 'y' | 'hp' | 'maxHp' | 'scale' | 'kind' | 'boss'
>

export type RenderableWorld = RenderableColumns & { readonly count: number }

export type RenderViewSource = {
  readonly count: number
  readonly columns: RenderableColumns
}

/**
 * Bind a live store to the render contract once. The returned object holds the
 * column references and a live `count`, so drawing neither allocates nor casts.
 */
export const createRenderView = (
  source: RenderViewSource,
): RenderableWorld => ({
  get count() {
    return source.count
  },
  x: source.columns.x,
  y: source.columns.y,
  hp: source.columns.hp,
  maxHp: source.columns.maxHp,
  scale: source.columns.scale,
  kind: source.columns.kind,
  boss: source.columns.boss,
})
