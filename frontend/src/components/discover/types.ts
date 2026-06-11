import type { Transaction } from '../../types'
import type { LucideIcon } from '../ui/icons'

export type DiscoverAccent = 'neutral' | 'amber' | 'green' | 'red'

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
  priority: number
  value?: string
  delta?: DiscoverCardDelta
}

export interface DiscoverPreviousPeriod {
  expense: number
  transactions: Transaction[]
  label: string
}

export interface DiscoverInsightsContext {
  totalIncome: number
  totalExpense: number
  netBalance: number
  savingsRate: number
  totalTransactions: number
  transactions: Transaction[]
  previousPeriod: DiscoverPreviousPeriod
  upcomingPayments: Transaction[]
}
