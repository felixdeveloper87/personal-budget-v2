import type { LucideIcon } from '../ui/icons'
import type { Transaction } from '../../types'

export type DiscoverAccent = 'neutral' | 'blue' | 'amber' | 'green' | 'red'

export type DiscoverModalId =
  | 'savings-rate'
  | 'spending-alert'
  | 'category-breakdown'
  | 'getting-started'
  | 'upcoming-payments'
  | 'mom-comparison'

export interface DiscoverCardDelta {
  label: string
  direction: 'up' | 'down'
  tone: 'positive' | 'negative' | 'neutral'
}

export interface DiscoverCardItem {
  id: string
  title: string
  description: string
  icon: LucideIcon
  accent: DiscoverAccent
  cta: string
  modalId: DiscoverModalId
  badge?: string
  featured?: boolean
  priority: number
  /** Concrete number shown prominently on the card, e.g. "£412.50". */
  value?: string
  /** Period-over-period change shown next to the value. */
  delta?: DiscoverCardDelta
}

export interface DiscoverPreviousPeriod {
  income: number
  expense: number
  transactions: Transaction[]
  /** e.g. "last month", "last week" — adapts to the selected period. */
  label: string
}

export interface DiscoverInsightsContext {
  totalIncome: number
  totalExpense: number
  netBalance: number
  savingsRate: number
  mostUsedCategory: string | null
  totalTransactions: number
  averageExpensePerDay: number
  transactions: Transaction[]
  previousPeriod?: DiscoverPreviousPeriod
  upcomingPayments?: Transaction[]
}
