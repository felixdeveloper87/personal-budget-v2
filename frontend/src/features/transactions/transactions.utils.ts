import type { Transaction } from '../../types'
import { getTransactionDateSource } from '../../utils/transactionDates'
import type {
  HabitInsight,
  IconKey,
  MomentumInsight,
  RhythmInsight,
  TxAction,
  TxFilter,
  TxnVM,
  TxState,
  TxView,
} from './transactions.types'

/* -------------------------------------------------------------------------- */
/* Adapter: backend Transaction -> page view-model                             */
/* -------------------------------------------------------------------------- */

const ICON_RULES: Array<{ key: IconKey; test: RegExp }> = [
  { key: 'cart', test: /grocer|supermarket|market|food shop/ },
  { key: 'cup', test: /dining|restaurant|coffee|cafe|café|eat|bar|pub|food|takeaway|lunch|dinner/ },
  { key: 'car', test: /transport|transit|fuel|petrol|uber|taxi|cab|travel|train|bus|car|parking|toll/ },
  { key: 'bag', test: /shop|cloth|retail|amazon|apparel|store|fashion/ },
  { key: 'play', test: /subscri|stream|netflix|spotify|media|music|cinema|entertain|game/ },
  { key: 'pill', test: /health|pharma|medic|gym|fitness|dental|doctor|wellness|hospital/ },
  { key: 'bolt', test: /util|electric|water|gas|internet|broadband|phone|mobile|energy|bill/ },
  { key: 'house', test: /hous|rent|mortgage|home|council|accommodation/ },
  { key: 'brief', test: /salary|payroll|wage|income|freelance|bonus|invoice/ },
  { key: 'refund', test: /refund|reimburs|return|cashback|rebate/ },
]

/** Best-effort category → icon key. Falls back by transaction direction. */
export function iconKeyForCategory(category: string, type: 'in' | 'out'): IconKey {
  const c = (category ?? '').toLowerCase()
  for (const rule of ICON_RULES) {
    if (rule.test.test(c)) return rule.key
  }
  return type === 'in' ? 'brief' : 'tag'
}

function accountLabel(t: Transaction): string {
  return t.accountName || t.paymentMethodName || 'Unassigned'
}

/** Maps the live-app Transaction list into the page's view-model. */
export function toViewModel(transactions: Transaction[]): TxnVM[] {
  return transactions.map((t, i) => {
    const purchaseDate = getTransactionDateSource(t, 'activity').slice(0, 10)
    const settlementDate = getTransactionDateSource(t, 'cash-flow').slice(0, 10)
    const type: 'in' | 'out' = t.type === 'INCOME' ? 'in' : 'out'
    return {
      id: t.id != null ? String(t.id) : `tmp-${i}`,
      merchant: t.description || t.category || 'Transaction',
      category: t.category || 'Uncategorised',
      iconKey: iconKeyForCategory(t.category, type),
      account: accountLabel(t),
      type,
      amount: Math.abs(t.amount),
      purchaseDate,
      settlementDate,
      deferred: settlementDate.slice(0, 7) !== purchaseDate.slice(0, 7),
    }
  })
}

/* -------------------------------------------------------------------------- */
/* Derived insights (drive the three pattern cards + chart highlight bands)    */
/* -------------------------------------------------------------------------- */

// 1. RHYTHM — weekday with the highest total spend.
export function deriveRhythm(txns: TxnVM[]): RhythmInsight | null {
  const byWd = Array.from({ length: 7 }, () => ({ sum: 0, n: 0 }))
  let any = false
  for (const t of txns) {
    if (t.type !== 'out') continue
    any = true
    const wd = parseISO(t.purchaseDate).getDay()
    byWd[wd].sum += t.amount
    byWd[wd].n++
  }
  if (!any) return null
  let best = 0
  for (let i = 1; i < 7; i++) if (byWd[i].sum > byWd[best].sum) best = i
  return { weekday: best, total: byWd[best].sum, count: byWd[best].n }
}

// 2. HABIT — category with the most transactions.
export function deriveHabit(txns: TxnVM[]): HabitInsight | null {
  const byCat: Record<string, { sum: number; n: number }> = {}
  for (const t of txns) {
    if (t.type !== 'out') continue
    if (!byCat[t.category]) byCat[t.category] = { sum: 0, n: 0 }
    byCat[t.category].sum += t.amount
    byCat[t.category].n++
  }
  const entries = Object.entries(byCat)
  if (entries.length === 0) return null
  const best = entries.reduce((a, b) => (b[1].n > a[1].n ? b : a))
  return { category: best[0], total: best[1].sum, count: best[1].n }
}

// 3. MOMENTUM — category with the biggest spend increase in the 2nd half.
export function deriveMomentum(txns: TxnVM[], midDay = 15): MomentumInsight | null {
  const byCat: Record<string, { h1: number; h2: number }> = {}
  for (const t of txns) {
    if (t.type !== 'out') continue
    const day = Number(t.purchaseDate.slice(8, 10))
    const half = day > midDay ? 'h2' : 'h1'
    if (!byCat[t.category]) byCat[t.category] = { h1: 0, h2: 0 }
    byCat[t.category][half] += t.amount
  }
  const entries = Object.entries(byCat)
  if (entries.length === 0) return null
  const best = entries
    .map(([cat, v]) => ({ category: cat, diff: v.h2 - v.h1 }))
    .reduce((a, b) => (b.diff > a.diff ? b : a))
  if (best.diff <= 0) return null
  return best
}

/* -------------------------------------------------------------------------- */
/* Filtering                                                                   */
/* -------------------------------------------------------------------------- */

/** All conditions AND-ed. `selectedDay` always filters against purchaseDate. */
export function matches(t: TxnVM, state: TxState): boolean {
  if (state.selectedDay && t.purchaseDate !== state.selectedDay) return false
  if (state.filter === 'in' && t.type !== 'in') return false
  if (state.filter === 'out' && t.type !== 'out') return false
  if (state.filter === 'deferred' && !t.deferred) return false
  if (state.q) {
    const q = state.q.toLowerCase()
    if (!t.merchant.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) {
      return false
    }
  }
  return true
}

/** Group key depends on the active view (purchase vs settlement axis). */
export function groupKey(t: TxnVM, view: TxView): string {
  return view === 'behaviour' ? t.purchaseDate : t.settlementDate
}

export interface LedgerGroup {
  key: string
  date: Date
  rows: TxnVM[]
  inTotal: number
  outTotal: number
}

/** Filtered rows → day groups (newest first), rows sorted by amount desc. */
export function buildLedger(txns: TxnVM[], state: TxState): LedgerGroup[] {
  const map = new Map<string, TxnVM[]>()
  for (const t of txns) {
    if (!matches(t, state)) continue
    const key = groupKey(t, state.view)
    const arr = map.get(key)
    if (arr) arr.push(t)
    else map.set(key, [t])
  }
  const groups: LedgerGroup[] = []
  for (const [key, rows] of map) {
    rows.sort((a, b) => b.amount - a.amount)
    let inTotal = 0
    let outTotal = 0
    for (const r of rows) {
      if (r.type === 'in') inTotal += r.amount
      else outTotal += r.amount
    }
    groups.push({ key, date: parseISO(key), rows, inTotal, outTotal })
  }
  groups.sort((a, b) => b.key.localeCompare(a.key))
  return groups
}

/* -------------------------------------------------------------------------- */
/* Reducer                                                                     */
/* -------------------------------------------------------------------------- */

export function txReducer(state: TxState, action: TxAction): TxState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.view }
    case 'SET_Q':
      // A manual edit detaches the highlight from the habit card.
      return { ...state, q: action.q, habitActive: false }
    case 'SET_FILTER':
      return { ...state, filter: action.filter }
    case 'SET_DAY':
      return { ...state, selectedDay: action.day }
    case 'TOGGLE_RHYTHM':
      return { ...state, hlRhythm: !state.hlRhythm }
    case 'TOGGLE_MOMENTUM':
      return { ...state, hlMomentum: !state.hlMomentum }
    case 'TOGGLE_HABIT':
      return state.habitActive
        ? { ...state, habitActive: false, q: '' }
        : { ...state, habitActive: true, q: action.category }
    default:
      return state
  }
}

/* -------------------------------------------------------------------------- */
/* Date helpers / formatting                                                   */
/* -------------------------------------------------------------------------- */

/** Parse a `YYYY-MM-DD` (or longer ISO) string as a local-time date. */
export function parseISO(iso: string): Date {
  return iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso)
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function weekdayName(weekday: number): string {
  return WEEKDAYS[weekday] ?? ''
}

/** "Tuesday 11 June" */
export function fmtDayLong(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** "11 Jun" */
export function fmtShort(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** "11 June 2026" */
export function fmtLong(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Whole days between two ISO dates (settlement − purchase). */
export function daysBetween(fromIso: string, toIso: string): number {
  const ms = parseISO(toIso).getTime() - parseISO(fromIso).getTime()
  return Math.round(ms / 86_400_000)
}

export const FILTER_LABELS: Record<TxFilter, string> = {
  all: 'All',
  in: 'Income',
  out: 'Expenses',
  deferred: 'Deferred',
}
