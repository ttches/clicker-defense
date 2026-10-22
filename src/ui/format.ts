export const formatCurrency = (value: number): string => value.toFixed(2)

export const formatSafety = (value: number): string =>
  Number.isFinite(value) ? value.toFixed(2) : '∞'
