import { describe, expect, it } from 'vitest'
import { formatNumber, formatPercent, formatRatio } from '@/ui/format'

describe('formatNumber', () => {
  it('scales precision with size', () => {
    expect(formatNumber(1.234)).toBe('1.23')
    expect(formatNumber(12.34)).toBe('12.3')
    expect(formatNumber(123.4)).toBe('123')
    expect(formatNumber(1234)).toBe('1.23K')
    expect(formatNumber(4_560_000)).toBe('4.56M')
  })
})

describe('formatRatio', () => {
  it('shows two decimals and infinity', () => {
    expect(formatRatio(1.5)).toBe('1.50×')
    expect(formatRatio(Infinity)).toBe('∞')
  })
})

describe('formatPercent', () => {
  it('signs and trims', () => {
    expect(formatPercent(0.03)).toBe('+3%')
    expect(formatPercent(1.5)).toBe('+150%')
    expect(formatPercent(0.025)).toBe('+2.5%')
  })
})
