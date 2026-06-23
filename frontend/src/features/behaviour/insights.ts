import type { TxnVM } from '../transactions/transactions.types'

export interface CategoryShift {
  category: string
  current: number
  previous: number
  diff: number // current - previous (signed)
  pct: number | null // % change vs previous; null when there was no prior spend
}

function totalsByCategory(txns: TxnVM[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const t of txns) {
    if (t.type !== 'out') continue
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
  }
  return map
}

/**
 * Compares this period's spend per category to the previous period and returns
 * the category that rose the most and the one that fell the most. Drives the
 * "you're spending more on X" headline insight.
 */
export function deriveCategoryShift(
  current: TxnVM[],
  previous: TxnVM[],
): { riser: CategoryShift | null; faller: CategoryShift | null } {
  const cur = totalsByCategory(current)
  const prev = totalsByCategory(previous)

  const categories = new Set<string>([...cur.keys(), ...prev.keys()])
  const shifts: CategoryShift[] = []
  for (const category of categories) {
    const c = cur.get(category) ?? 0
    const p = prev.get(category) ?? 0
    shifts.push({
      category,
      current: c,
      previous: p,
      diff: c - p,
      pct: p > 0 ? ((c - p) / p) * 100 : null,
    })
  }

  let riser: CategoryShift | null = null
  let faller: CategoryShift | null = null
  for (const s of shifts) {
    if (s.diff > 0 && (!riser || s.diff > riser.diff)) riser = s
    if (s.diff < 0 && (!faller || s.diff < faller.diff)) faller = s
  }
  return { riser, faller }
}

/** Largest single category this period (out only). */
export function deriveTopCategory(txns: TxnVM[]): { category: string; total: number } | null {
  const totals = totalsByCategory(txns)
  let best: { category: string; total: number } | null = null
  for (const [category, total] of totals) {
    if (!best || total > best.total) best = { category, total }
  }
  return best
}

/** Word used in insight copy for the active period ("month", "week", …). */
export function periodWord(period: string): string {
  switch (period) {
    case 'day':
      return 'day'
    case 'week':
      return 'week'
    case 'year':
      return 'year'
    case 'month':
    default:
      return 'month'
  }
}
