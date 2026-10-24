const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No']

/** Currency-style: 2 decimals under 10, 1 under 100, then whole or K/M/B. */
export const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return '∞'
  const sign = value < 0 ? '-' : ''
  const size = Math.abs(value)
  if (size < 10) return sign + size.toFixed(2)
  if (size < 100) return sign + size.toFixed(1)
  if (size < 1000) return sign + Math.floor(size).toString()
  const tier = Math.min(Math.floor(Math.log10(size) / 3), SUFFIXES.length - 1)
  const scaled = size / 1000 ** tier
  const digits = scaled < 10 ? 2 : scaled < 100 ? 1 : 0
  return `${sign}${scaled.toFixed(digits)}${SUFFIXES[tier]}`
}

/** Safety ratio, e.g. "1.25×". */
export const formatRatio = (value: number): string =>
  Number.isFinite(value) ? `${value.toFixed(2)}×` : '∞'

/** Fractional change as a signed percent, e.g. 0.03 → "+3%". */
export const formatPercent = (fraction: number): string => {
  const percent = fraction * 100
  const text = Math.abs(percent) >= 10 ? percent.toFixed(0) : percent.toFixed(1)
  return `${percent >= 0 ? '+' : ''}${text.replace(/\.0$/, '')}%`
}
