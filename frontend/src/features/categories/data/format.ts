import { fmtCurrency } from '../../dashboard/components/format'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** £ formatter for major-unit amounts (always positive magnitude — callers add the sign). */
export const gbp = (amount: number, dp = 0): string =>
  fmtCurrency(amount, { minimumFractionDigits: dp, maximumFractionDigits: dp })

/** "23 Jun" — day + 3-letter month from an ISO date (with or without time). */
export const shortDate = (iso: string): string => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  void y
  return `${d} ${MONTHS[(m - 1) % 12].slice(0, 3)}`
}

/** Hex → rgba() with the given alpha, for the tinted icon tiles. */
export const hexA = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
