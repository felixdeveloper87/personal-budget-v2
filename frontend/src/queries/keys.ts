import type { SearchFilters } from '../contexts/SearchContext'

/** Every query key in one place, so invalidation and reuse stay consistent. */
export const queryKeys = {
  accountSummary: ['accounts', 'summary'] as const,
  paymentMethods: ['payment-methods'] as const,
  cardsOverview: ['cards', 'overview'] as const,
  cardStatements: (cardId: number) => ['cards', cardId, 'statements'] as const,
  transactionsWindow: (from: string, to: string) => ['transactions', 'window', from, to] as const,
  transactionsSearch: (filters: SearchFilters) => ['transactions', 'search', filters] as const,
  transactionsPages: (filters: SearchFilters | null) => ['transactions', 'pages', filters ?? {}] as const,
  monthlySummary: (monthKey: string) => ['summary', monthKey] as const,
  installmentPlans: ['installment-plans'] as const,
}
