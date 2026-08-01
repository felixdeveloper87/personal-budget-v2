import type { Transaction } from '../../types'
import { getTransactionDate, type TransactionDateBasis } from '../../utils/transactionDates'

/* -------------------------------------------------------------------------- */
/* Merchant grouping                                                           */
/* -------------------------------------------------------------------------- */

export interface MerchantStat {
  /** Normalised grouping key (lowercased, whitespace-collapsed description). */
  key: string
  /** Human-friendly display name. */
  name: string
  total: number
  count: number
}

const normaliseKey = (raw: string): string => raw.trim().toLowerCase().replace(/\s+/g, ' ')

/** "lidl" → "Lidl"; descriptions typed with any capitals are kept as-is. */
const displayName = (raw: string): string => {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (trimmed !== trimmed.toLowerCase()) return trimmed
  return trimmed.replace(/(^|\s)\S/g, (ch) => ch.toUpperCase())
}

/**
 * Groups expense transactions by description ("merchant") and returns them
 * sorted by total spend, descending. Transactions without a description fall
 * back to their category so nothing silently disappears.
 */
export function merchantStats(transactions: Transaction[]): MerchantStat[] {
  const map = new Map<string, MerchantStat>()
  for (const t of transactions) {
    if (t.type !== 'EXPENSE') continue
    const raw = t.description?.trim() ? t.description : t.category
    const key = normaliseKey(raw)
    if (!key) continue
    const existing = map.get(key)
    if (existing) {
      existing.total += t.amount
      existing.count += 1
    } else {
      map.set(key, { key, name: displayName(raw), total: t.amount, count: 1 })
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}

/* -------------------------------------------------------------------------- */
/* Daily spending pace                                                         */
/* -------------------------------------------------------------------------- */

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Cumulative total for one transaction type per day of the given month
 * (index 0 = day 1). Days without activity carry the running total forward.
 */
export function cumulativeDailyAmount(
  transactions: Transaction[],
  year: number,
  month: number,
  basis: TransactionDateBasis,
  type: Transaction['type'],
): number[] {
  const days = daysInMonth(year, month)
  const daily = new Array<number>(days).fill(0)
  for (const t of transactions) {
    if (t.type !== type) continue
    const d = getTransactionDate(t, basis)
    if (d.getFullYear() === year && d.getMonth() === month) {
      daily[d.getDate() - 1] += t.amount
    }
  }
  let running = 0
  return daily.map((v) => (running += v))
}
