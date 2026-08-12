import type { Transaction } from '../../types'
import { getTransactionDateSource } from '../../utils/transactionDates'
import type { AppLocale } from '../../i18n'
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
      paymentMethodId: t.paymentMethodId ?? null,
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

/** All conditions AND-ed. `selectedDay` filters against the active view axis
 * (purchase date in Behaviour, settlement date in Payments) so it matches the
 * day the user tapped on the chart. */
export function matches(t: TxnVM, state: TxState): boolean {
  // Payments is an outflow-only lens — income never belongs in the schedule.
  if (state.view === 'payments' && t.type !== 'out') return false
  if (state.selectedDay && groupKey(t, state.view) !== state.selectedDay) return false
  if (state.filter === 'in' && t.type !== 'in') return false
  if (state.filter === 'out' && t.type !== 'out') return false
  if (state.filter === 'deferred' && !t.deferred) return false
  if (state.month != null) {
    const d = parseISO(groupKey(t, state.view))
    if (d.getMonth() !== state.month) return false
    if (state.year != null && d.getFullYear() !== state.year) return false
  }
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

/* -------------------------------------------------------------------------- */
/* Search query parsing                                                        */
/* -------------------------------------------------------------------------- */

/** Month name / abbreviation → month index (0 = January). */
const MONTH_TOKENS: Record<string, number> = {
  jan: 0, january: 0,
  janeiro: 0,
  feb: 1, february: 1,
  fev: 1, fevereiro: 1,
  mar: 2, march: 2,
  março: 2, marco: 2,
  apr: 3, april: 3,
  abr: 3, abril: 3,
  may: 4,
  maio: 4,
  jun: 5, june: 5,
  junho: 5,
  jul: 6, july: 6,
  julho: 6,
  aug: 7, august: 7,
  ago: 7, agosto: 7,
  sep: 8, sept: 8, september: 8,
  set: 8, setembro: 8,
  oct: 9, october: 9,
  out: 9, outubro: 9,
  nov: 10, november: 10,
  novembro: 10,
  dec: 11, december: 11,
  dez: 11, dezembro: 11,
}

export interface ParsedQuery {
  text: string // free-text remainder (merchant / category match)
  month: number | null // 0..11 if a month token was present
  year: number | null // 4-digit year if present alongside a month
}

/**
 * Split a raw search string into a free-text remainder plus optional month/year
 * tokens, so "Lidl june" → { text: "lidl", month: 5, year: null } and
 * "Lidl june 2025" → { text: "lidl", month: 5, year: 2025 }. A month token
 * matches that month in any year unless a 4-digit year is also given. The year
 * is only honoured when a month is present (a bare "2025" stays free text).
 */
export function parseSearchQuery(raw: string): ParsedQuery {
  let month: number | null = null
  let year: number | null = null
  const rest: string[] = []

  for (const tok of raw.trim().toLowerCase().split(/\s+/)) {
    if (!tok) continue
    if (month === null && tok in MONTH_TOKENS) {
      month = MONTH_TOKENS[tok]
      continue
    }
    if (year === null && /^\d{4}$/.test(tok)) {
      year = Number(tok)
      continue
    }
    rest.push(tok)
  }

  // A 4-digit token is only a year filter when paired with a month; otherwise
  // it is part of the free-text query (e.g. an amount or reference number).
  if (month === null && year !== null) {
    rest.push(String(year))
    year = null
  }

  return { text: rest.join(' '), month, year }
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

/**
 * Payments-only: collapse each credit card's charges within a day group into a
 * single statement (fatura) row showing the invoice total due that day. Credit
 * card charges already settle on their statement's due date, so every charge of
 * one statement lands on the same group key — folding them by card here turns a
 * wall of line items into one invoice line. The per-charge detail lives on the
 * Cards page, so the synthetic row links there (see `statement`) rather than
 * opening a transaction drawer. Group totals are untouched (the sum is equal).
 */
export function collapseCardStatements(
  groups: LedgerGroup[],
  cardNames: Map<number, string>,
): LedgerGroup[] {
  if (cardNames.size === 0) return groups
  return groups.map((g) => {
    const passthrough: TxnVM[] = []
    const byCard = new Map<number, TxnVM[]>()
    for (const r of g.rows) {
      const isCardCharge =
        r.type === 'out' && r.paymentMethodId != null && cardNames.has(r.paymentMethodId)
      if (!isCardCharge) {
        passthrough.push(r)
        continue
      }
      const arr = byCard.get(r.paymentMethodId!)
      if (arr) arr.push(r)
      else byCard.set(r.paymentMethodId!, [r])
    }
    if (byCard.size === 0) return g

    const statementRows: TxnVM[] = []
    for (const [cardId, rows] of byCard) {
      const name = cardNames.get(cardId) ?? 'Credit card'
      statementRows.push({
        id: `stmt-${cardId}-${g.key}`,
        merchant: name,
        category: 'Credit card statement',
        iconKey: 'tag',
        account: name,
        type: 'out',
        amount: rows.reduce((sum, r) => sum + r.amount, 0),
        purchaseDate: g.key,
        settlementDate: g.key,
        deferred: false,
        paymentMethodId: cardId,
        statement: { cardId, count: rows.length },
      })
    }

    const merged = [...passthrough, ...statementRows].sort((a, b) => b.amount - a.amount)
    return { ...g, rows: merged }
  })
}

/* -------------------------------------------------------------------------- */
/* Reducer                                                                     */
/* -------------------------------------------------------------------------- */

export function txReducer(state: TxState, action: TxAction): TxState {
  switch (action.type) {
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

export function weekdayName(weekday: number, locale: AppLocale = 'en-GB'): string {
  if (weekday < 0 || weekday > 6) return ''
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date(2024, 0, 7 + weekday))
}

/** "Tuesday 11 June" */
export function fmtDayLong(iso: string, locale: AppLocale = 'en-GB'): string {
  return parseISO(iso).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** "11 Jun" */
export function fmtShort(iso: string, locale: AppLocale = 'en-GB'): string {
  return parseISO(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

/** "11 June 2026" */
export function fmtLong(iso: string, locale: AppLocale = 'en-GB'): string {
  return parseISO(iso).toLocaleDateString(locale, {
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
