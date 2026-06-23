/**
 * View-model + UI state types for the editorial Transactions page.
 *
 * The live app stores `amount` in **pounds** (major units) and splits the two
 * dates across `transactionDate` (purchase) and `paymentDate` (settlement). The
 * adapter in `transactions.utils.ts` normalises a backend `Transaction` into the
 * `TxnVM` shape the page renders from. See the "two clocks" concept in the brief.
 */

export type IconKey =
  | 'cart'
  | 'cup'
  | 'car'
  | 'bag'
  | 'play'
  | 'pill'
  | 'bolt'
  | 'house'
  | 'brief'
  | 'refund'
  | 'tag'

/** Normalised transaction the page renders from. Amounts are positive pounds. */
export interface TxnVM {
  id: string
  merchant: string
  category: string
  iconKey: IconKey
  account: string
  type: 'in' | 'out'
  amount: number // always positive, in pounds (major units)
  purchaseDate: string // "YYYY-MM-DD" — when bought
  settlementDate: string // "YYYY-MM-DD" — when it clears
  deferred: boolean // settlementDate month !== purchaseDate month
}

export type TxView = 'behaviour' | 'payments'
export type TxFilter = 'all' | 'in' | 'out' | 'deferred'

export interface TxState {
  view: TxView
  q: string // free-text search (merchant or category)
  filter: TxFilter
  selectedDay: string | null // ISO date from chart click; null = all days
  hlRhythm: boolean // highlight best-spend weekday bands on chart
  hlMomentum: boolean // highlight the 2nd-half band on chart
  habitActive: boolean // ledger filtered to the top habit category
}

export const initialTxState: TxState = {
  view: 'behaviour',
  q: '',
  filter: 'all',
  selectedDay: null,
  hlRhythm: false,
  hlMomentum: false,
  habitActive: false,
}

export type TxAction =
  | { type: 'SET_Q'; q: string }
  | { type: 'SET_FILTER'; filter: TxFilter }
  | { type: 'SET_DAY'; day: string | null }
  | { type: 'TOGGLE_RHYTHM' }
  | { type: 'TOGGLE_MOMENTUM' }
  | { type: 'TOGGLE_HABIT'; category: string }

/** Derived insight shapes (computed once per data load). */
export interface RhythmInsight {
  weekday: number // 0..6 (0 = Sunday)
  total: number
  count: number
}
export interface HabitInsight {
  category: string
  total: number
  count: number
}
export interface MomentumInsight {
  category: string
  diff: number // h2 - h1, positive means accelerating
}
