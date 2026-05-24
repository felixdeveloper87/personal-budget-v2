import type { LucideIcon } from '../ui/icons'
import type { Transaction } from '../../types'

export type DiscoverAccent = 'violet' | 'blue' | 'amber' | 'green' | 'red'

export type DiscoverModalId =
  | 'savings-rate'
  | 'budget-split'
  | 'emergency-fund'
  | 'compound-interest'
  | 'spending-alert'
  | 'category-breakdown'
  | 'getting-started'
  | 'category-guide'

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
}
