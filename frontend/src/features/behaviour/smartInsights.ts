import type { TxnVM } from '../transactions/transactions.types'

/**
 * "Patterns" insights for the Expenses page. Every insight only fires when it
 * has enough data to be fair — an in-progress month is compared like-for-like
 * (same day of the previous month), projections wait for a week of data, and
 * outliers need real history in the category. The page shows the top three by
 * relevance and hides the section when none qualify.
 */

export type PeriodKind = 'day' | 'week' | 'month' | 'year'

export type InsightSide = 'expense' | 'income'

export type SmartInsight =
  | {
      kind: 'pace'
      /** Expense (default): less is good. Income: more is good. */
      side?: InsightSide
      /** true while the period is still running ("so far"), false once it ended. */
      inProgress: boolean
      spent: number
      previous: number
      /** Start of the previous period, used for its label (month / year). */
      previousStart: Date
      /** Day of month reached so far (month view). */
      dayReached: number
    }
  | { kind: 'projection'; side?: InsightSide; projected: number; previousTotal: number; previousStart: Date; daysElapsed: number }
  | { kind: 'outlier'; amount: number; merchant: string; category: string; ratio: number }
  | { kind: 'small'; count: number; total: number; share: number; limit: number }
  | { kind: 'noSpend'; days: number; daysElapsed: number; inProgress: boolean }
  | { kind: 'newSource'; name: string; total: number }
  | { kind: 'bestWeekday'; weekday: number; average: number; liftPct: number }
  | { kind: 'topSource'; name: string; share: number; total: number }
  | { kind: 'perEarningDay'; average: number; days: number }

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

/* -------------------------------------------------------------------------- */
/* Earnings page                                                              */
/* -------------------------------------------------------------------------- */

const NEW_SOURCE_LOOKBACK_DAYS = 120
const WEEKDAY_LOOKBACK_DAYS = 90
const WEEKDAY_MIN_EARNING_DAYS = 12
const WEEKDAY_MIN_LIFT = 0.25

const sourceKey = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ')

/** Same rules as the expense insights, tuned for income: more is good, and the
    interesting signals are new sources, the best-paying weekday, concentration
    on one source and earnings per day with income. */
export function deriveEarningsInsights({
  allIncome,
  period,
  start,
  end,
  today = new Date(),
}: {
  allIncome: TxnVM[]
  period: PeriodKind
  start: Date
  end: Date
  today?: Date
}): SmartInsight[] {
  const out: Array<{ score: number; insight: SmartInsight }> = []
  const periodStart = startOfDay(start)
  const periodEnd = startOfDay(end)
  const todayDay = startOfDay(today)
  if (periodStart > todayDay) return []

  const inProgress = todayDay <= periodEnd
  const cutoff = inProgress ? todayDay : periodEnd
  const startIso = iso(periodStart)
  const cutoffIso = iso(cutoff)
  const daysElapsed = daysBetween(periodStart, cutoff) + 1
  const totalDays = daysBetween(periodStart, periodEnd) + 1
  const current = allIncome.filter((t) => t.purchaseDate >= startIso && t.purchaseDate <= cutoffIso)
  const earned = current.reduce((sum, t) => sum + t.amount, 0)

  // 1. New source — nothing from it in the previous 120 days.
  const lookbackIso = iso(new Date(periodStart.getTime() - NEW_SOURCE_LOOKBACK_DAYS * DAY_MS))
  const seenBefore = new Set(
    allIncome.filter((t) => t.purchaseDate >= lookbackIso && t.purchaseDate < startIso).map((t) => sourceKey(t.merchant)),
  )
  const hadHistory = seenBefore.size > 0
  const newSources = new Map<string, { name: string; total: number }>()
  for (const txn of current) {
    const key = sourceKey(txn.merchant)
    if (!key || seenBefore.has(key)) continue
    const entry = newSources.get(key) ?? { name: txn.merchant.trim(), total: 0 }
    entry.total += txn.amount
    newSources.set(key, entry)
  }
  // Without any history every source looks "new" — only flag once there is a baseline.
  if (hadHistory && newSources.size > 0) {
    const best = [...newSources.values()].sort((a, b) => b.total - a.total)[0]
    out.push({ score: 85, insight: { kind: 'newSource', name: best.name, total: best.total } })
  }

  // 2. Pace vs the same point of the previous period.
  if (period !== 'day') {
    const previousStart = shiftBack(periodStart, period)
    const previousCutoff = inProgress ? shiftBack(cutoff, period) : new Date(periodStart.getTime() - DAY_MS)
    const previous = sumBetween(allIncome, iso(previousStart), iso(previousCutoff))
    if (previous > 0 && (earned > 0 || daysElapsed >= 3)) {
      const diffPct = Math.abs(earned - previous) / previous
      out.push({
        score: 60 + Math.min(30, diffPct * 30),
        insight: { kind: 'pace', side: 'income', inProgress, spent: earned, previous, previousStart, dayReached: cutoff.getDate() },
      })
    }
  }

  // 3. Best-paying weekday over the last 90 days (needs a real sample).
  const weekdayFromIso = iso(new Date(cutoff.getTime() - (WEEKDAY_LOOKBACK_DAYS - 1) * DAY_MS))
  const perDay = new Map<string, number>()
  for (const txn of allIncome) {
    if (txn.purchaseDate >= weekdayFromIso && txn.purchaseDate <= cutoffIso) {
      perDay.set(txn.purchaseDate, (perDay.get(txn.purchaseDate) ?? 0) + txn.amount)
    }
  }
  if (perDay.size >= WEEKDAY_MIN_EARNING_DAYS) {
    const sums = Array.from({ length: 7 }, () => 0)
    const counts = Array.from({ length: 7 }, () => 0)
    for (const [day, total] of perDay) {
      const weekday = new Date(`${day}T00:00:00`).getDay()
      sums[weekday] += total
      counts[weekday] += 1
    }
    const overall = [...perDay.values()].reduce((a, b) => a + b, 0) / perDay.size
    let best = -1
    for (let i = 0; i < 7; i++) {
      if (counts[i] >= 2 && (best === -1 || sums[i] / counts[i] > sums[best] / counts[best])) best = i
    }
    if (best !== -1) {
      const average = sums[best] / counts[best]
      const lift = overall > 0 ? average / overall - 1 : 0
      if (lift >= WEEKDAY_MIN_LIFT) {
        out.push({ score: 75, insight: { kind: 'bestWeekday', weekday: best, average, liftPct: lift * 100 } })
      }
    }
  }

  // 4. Month-end projection.
  if (period === 'month' && inProgress && daysElapsed >= PROJECTION_MIN_DAYS && daysElapsed < totalDays && earned > 0) {
    const previousStart = shiftBack(periodStart, 'month')
    const previousTotal = sumBetween(allIncome, iso(previousStart), iso(new Date(periodStart.getTime() - DAY_MS)))
    out.push({
      score: 70,
      insight: { kind: 'projection', side: 'income', projected: (earned / daysElapsed) * totalDays, previousTotal, previousStart, daysElapsed },
    })
  }

  // 5. Concentration on one source (only meaningful with 2+ sources).
  const bySource = new Map<string, { name: string; total: number }>()
  for (const txn of current) {
    const key = sourceKey(txn.merchant)
    if (!key) continue
    const entry = bySource.get(key) ?? { name: txn.merchant.trim(), total: 0 }
    entry.total += txn.amount
    bySource.set(key, entry)
  }
  if (bySource.size >= 2 && earned > 0) {
    const top = [...bySource.values()].sort((a, b) => b.total - a.total)[0]
    const share = (top.total / earned) * 100
    if (share >= 50) out.push({ score: 55, insight: { kind: 'topSource', name: top.name, share, total: top.total } })
  }

  // 6. Average per day with income.
  const earningDays = new Set(current.map((t) => t.purchaseDate)).size
  if (earningDays >= 3) {
    out.push({ score: 45, insight: { kind: 'perEarningDay', average: earned / earningDays, days: earningDays } })
  }

  return out
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_INSIGHTS)
    .map((entry) => entry.insight)
}
