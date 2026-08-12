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

/* -------------------------------------------------------------------------- */
/* Earnings (gig income) — daily earnings are behaviour too                    */
/* -------------------------------------------------------------------------- */

export interface EarningsInsight {
  total: number
  /** Distinct days with at least one income entry ("days on the road"). */
  daysWorked: number
  avgPerWorkedDay: number
  /** Weekday (0..6, 0 = Sunday) with the highest earnings, if any. */
  bestWeekday: number | null
  bestWeekdayTotal: number
}

/**
 * Aggregates income entries by day, for users whose earnings arrive daily and
 * vary (gig work): how many days produced income, the average per worked day,
 * and which weekday pays best.
 */
export function deriveEarnings(txns: TxnVM[]): EarningsInsight | null {
  const days = new Set<string>()
  const byWeekday = Array.from({ length: 7 }, () => 0)
  let total = 0

  for (const t of txns) {
    if (t.type !== 'in') continue
    total += t.amount
    days.add(t.purchaseDate)
    byWeekday[new Date(`${t.purchaseDate}T00:00:00`).getDay()] += t.amount
  }
  if (days.size === 0) return null

  let best = 0
  for (let i = 1; i < 7; i++) if (byWeekday[i] > byWeekday[best]) best = i

  return {
    total,
    daysWorked: days.size,
    avgPerWorkedDay: total / days.size,
    bestWeekday: byWeekday[best] > 0 ? best : null,
    bestWeekdayTotal: byWeekday[best],
  }
}

/* -------------------------------------------------------------------------- */
/* "So far" breakdowns — spend per category, earnings per source               */
/* -------------------------------------------------------------------------- */

export interface BreakdownItem {
  name: string
  total: number
  count: number
}

/** Expense totals per category, largest first. */
export function spendByCategory(txns: TxnVM[]): BreakdownItem[] {
  const map = new Map<string, BreakdownItem>()
  for (const t of txns) {
    if (t.type !== 'out') continue
    const existing = map.get(t.category)
    if (existing) {
      existing.total += t.amount
      existing.count += 1
    } else {
      map.set(t.category, { name: t.category, total: t.amount, count: 1 })
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}

/**
 * Income totals per source, largest first. The source is the transaction
 * description ("Uber", "Deliveroo", …), normalised so "uber" and "Uber " fold
 * into one row; falls back to the category when there's no description.
 */
export function earningsBySource(txns: TxnVM[]): BreakdownItem[] {
  const map = new Map<string, BreakdownItem>()
  for (const t of txns) {
    if (t.type !== 'in') continue
    const key = t.merchant.trim().toLowerCase().replace(/\s+/g, ' ')
    if (!key) continue
    const existing = map.get(key)
    if (existing) {
      existing.total += t.amount
      existing.count += 1
    } else {
      map.set(key, { name: t.merchant.trim(), total: t.amount, count: 1 })
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}
