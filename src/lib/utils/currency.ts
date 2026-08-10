import type { Currency } from '@/types'

export interface ExchangeRates {
  USD_TO_LKR: number
  CNY_TO_LKR: number
  USD_TO_CNY: number
}

export const DEFAULT_RATES: ExchangeRates = {
  USD_TO_LKR: 305,
  CNY_TO_LKR: 42,
  USD_TO_CNY: 7.24,
}

export function convertToLKR(
  amount: number,
  fromCurrency: Currency,
  rates: ExchangeRates = DEFAULT_RATES
): number {
  switch (fromCurrency) {
    case 'LKR':
      return amount
    case 'USD':
      return amount * rates.USD_TO_LKR
    case 'CNY':
      return amount * rates.CNY_TO_LKR
    default:
      return amount
  }
}

export function convertFromLKR(
  amount: number,
  toCurrency: Currency,
  rates: ExchangeRates = DEFAULT_RATES
): number {
  switch (toCurrency) {
    case 'LKR':
      return amount
    case 'USD':
      return amount / rates.USD_TO_LKR
    case 'CNY':
      return amount / rates.CNY_TO_LKR
    default:
      return amount
  }
}

export function calculateMarginPct(landedCost: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0
  return ((sellingPrice - landedCost) / sellingPrice) * 100
}

export function formatCurrency(amount: number, currency: Currency = 'LKR'): string {
  const symbols: Record<Currency, string> = {
    LKR: 'Rs ',
    USD: '$',
    CNY: '¥',
  }
  const symbol = symbols[currency]
  if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}K`
  }
  return `${symbol}${amount.toFixed(0)}`
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toFixed(0)
}
