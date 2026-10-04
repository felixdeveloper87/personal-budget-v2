import type { TxnVM } from '../transactions/transactions.types'

/**
 * "Patterns" insights for the Expenses page. Every insight only fires when it
 * has enough data to be fair — an in-progress month is compared like-for-like
 * (same day of the previous month), projections wait for a week of data, and
 * outliers need real history in the category. The page shows the top three by
 * relevance and hides the section when none qualify.
 */

export type PeriodKind = 'day' | 'week' | 'month' | 'year'

export type SmartInsight =
  | {
      kind: 'pace'
      /** true while the period is still running ("so far"), false once it ended. */
      inProgress: boolean
      spent: number
      previous: number
      /** Start of the previous period, used for its label (month / year). */
      previousStart: Date
      /** Day of month reached so far (month view). */
      dayReached: number
    }
  | { kind: 'projection'; projected: number; previousTotal: number; previousStart: Date; daysElapsed: number }
  | { kind: 'outlier'; amount: number; merchant: string; category: string; ratio: number }
  | { kind: 'small'; count: number; total: number; share: number; limit: number }
  | { kind: 'noSpend'; days: number; daysElapsed: number; inProgress: boolean }

const DAY_MS = 86_400_000
const SMALL_PURCHASE_LIMIT = 10
const OUTLIER_LOOKBACK_DAYS = 120
const OUTLIER_MIN_HISTORY = 5
const OUTLIER_MIN_RATIO = 3
const OUTLIER_MIN_AMOUNT = 20
const PROJECTION_MIN_DAYS = 7
const MAX_INSIGHTS = 3

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const daysBetween = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS)

function sumBetween(txns: TxnVM[], fromIso: string, toIso: string) {
  let total = 0
  for (const txn of txns) {
    if (txn.purchaseDate >= fromIso && txn.purchaseDate <= toIso) total += txn.amount
  }
  return total
}

/** Same position in the previous period: one month / week / year back. */
function shiftBack(date: Date, period: PeriodKind): Date {
  const d = new Date(date)
  if (period === 'week') d.setDate(d.getDate() - 7)
  else if (period === 'year') d.setFullYear(d.getFullYear() - 1)
  else if (period === 'month') {
    const day = d.getDate()
    d.setDate(1)
    d.setMonth(d.getMonth() - 1)
    // Clamp 31 Mar → 28/29 Feb instead of rolling into March.
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    d.setDate(Math.min(day, lastDay))
  }
  return d
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function deriveSmartInsights({
  allExpenses,
  period,
  start,
  end,
  today = new Date(),
}: {
  /** Every expense the user has (full history), already filtered to real purchases. */
  allExpenses: TxnVM[]
  period: PeriodKind
  start: Date
  end: Date
  today?: Date
}): SmartInsight[] {
  const out: Array<{ score: number; insight: SmartInsight }> = []
  const periodStart = startOfDay(start)
  const periodEnd = startOfDay(end)
  const todayDay = startOfDay(today)
  if (periodStart > todayDay) return [] // future period — nothing to say yet

  const inProgress = todayDay <= periodEnd
  const cutoff = inProgress ? todayDay : periodEnd
  const startIso = iso(periodStart)
  const cutoffIso = iso(cutoff)
  const daysElapsed = daysBetween(periodStart, cutoff) + 1
  const totalDays = daysBetween(periodStart, periodEnd) + 1
  const current = allExpenses.filter((t) => t.purchaseDate >= startIso && t.purchaseDate <= cutoffIso)
  const spent = current.reduce((sum, t) => sum + t.amount, 0)

  // 1. Pace: like-for-like against the same point of the previous period.
  if (period !== 'day') {
    const previousStart = shiftBack(periodStart, period)
    const previousCutoff = inProgress ? shiftBack(cutoff, period) : new Date(periodStart.getTime() - DAY_MS)
    const previous = sumBetween(allExpenses, iso(previousStart), iso(previousCutoff))
    if (previous > 0 && (spent > 0 || daysElapsed >= 3)) {
      const diffPct = Math.abs(spent - previous) / previous
      out.push({
        score: 60 + Math.min(30, diffPct * 30),
        insight: { kind: 'pace', inProgress, spent, previous, previousStart, dayReached: cutoff.getDate() },
      })
    }
  }

  // 2. Projection: month in progress with at least a week of data.
  if (period === 'month' && inProgress && daysElapsed >= PROJECTION_MIN_DAYS && daysElapsed < totalDays && spent > 0) {
    const previousStart = shiftBack(periodStart, 'month')
    const previousEnd = new Date(periodStart.getTime() - DAY_MS)
    const previousTotal = sumBetween(allExpenses, iso(previousStart), iso(previousEnd))
    out.push({
      score: 70,
      insight: {
        kind: 'projection',
        projected: (spent / daysElapsed) * totalDays,
        previousTotal,
        previousStart,
        daysElapsed,
      },
    })
  }

  // 3. Outlier: a purchase far above what the user usually pays in that category.
  const lookbackIso = iso(new Date(periodStart.getTime() - OUTLIER_LOOKBACK_DAYS * DAY_MS))
  const history = new Map<string, number[]>()
  for (const txn of allExpenses) {
    if (txn.purchaseDate >= lookbackIso && txn.purchaseDate < startIso) {
      const list = history.get(txn.category) ?? []
      list.push(txn.amount)
      history.set(txn.category, list)
    }
  }
  let outlier: Extract<SmartInsight, { kind: 'outlier' }> | null = null
  for (const txn of current) {
    const past = history.get(txn.category)
    if (!past || past.length < OUTLIER_MIN_HISTORY || txn.amount < OUTLIER_MIN_AMOUNT) continue
    const typical = median(past)
    if (typical <= 0) continue
    const ratio = txn.amount / typical
    if (ratio >= OUTLIER_MIN_RATIO && (!outlier || ratio > outlier.ratio)) {
      outlier = { kind: 'outlier', amount: txn.amount, merchant: txn.merchant, category: txn.category, ratio }
    }
  }
  if (outlier) out.push({ score: 90, insight: outlier })

  // 4. Small purchases that add up.
  const small = current.filter((t) => t.amount < SMALL_PURCHASE_LIMIT)
  const smallTotal = small.reduce((sum, t) => sum + t.amount, 0)
  if (small.length >= 5 && smallTotal >= 20 && spent > 0) {
    out.push({
      score: 50,
      insight: { kind: 'small', count: small.length, total: smallTotal, share: (smallTotal / spent) * 100, limit: SMALL_PURCHASE_LIMIT },
    })
  }

  // 5. Days without spending (positive reinforcement).
  if (period !== 'day' && daysElapsed >= 3) {
    const spendDays = new Set(current.map((t) => t.purchaseDate))
    const noSpend = daysElapsed - spendDays.size
    if (noSpend >= 1) {
      out.push({ score: 40 + Math.min(15, noSpend), insight: { kind: 'noSpend', days: noSpend, daysElapsed, inProgress } })
    }
  }

  return out
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_INSIGHTS)
    .map((entry) => entry.insight)
}
