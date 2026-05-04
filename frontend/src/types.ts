export type TransactionType = 'INCOME' | 'EXPENSE'

// Period types for navigation
export type PeriodType = 'day' | 'week' | 'month' | 'year'

// Search filters type (moved from useSearchFilters hook)
export interface SearchFilters {
  text: string
  type: 'income' | 'expense' | null
  category: string
  startDate: string
  endDate: string
}

// Transação padrão
export interface Transaction {
  id?: number // opcional apenas na criação
  dateTime: string // ISO date (yyyy-MM-dd)
  type: TransactionType
  category: string
  description: string
  amount: number
  userId?: number // opcional porque o backend não retorna no DTO de busca
  installmentPlanId?: number // ID do plano de parcelamento (se houver)
  recurringTransactionId?: number // ID da recorrencia (se houver)
  isInstallment?: boolean // Indica se faz parte de um parcelamento
  isRecurring?: boolean // Indica se foi gerada por uma recorrencia
  installmentNumber?: number // Número da parcela (1, 2, 3, etc.)
  isFutureInstallment?: boolean // Indica se é uma parcela futura calculada
}

// DTO do /transactions/search (não retorna userId)
export type TransactionSearch = Omit<Transaction, 'userId'>

// Resumo mensal
export interface MonthlySummary {
  year: number
  month: number // 1-12
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: { category: string; income: number; expense: number }[]
}

// Usuário autenticado (AuthResponse do backend)
export interface User {
  id: number
  name: string
  email: string
  token: string
}

// Auth Requests
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

// Plano de parcelamento
export interface InstallmentPlan {
  id: number
  totalInstallments: number
  totalAmount: number
  installmentValue: number
  transactions: InstallmentTransaction[]
}

export interface InstallmentTransaction {
  id: number
  description: string
  amount: number
  category: string
  date: string // yyyy-MM-dd
  installmentNumber: number
}

export interface CreateInstallmentPlanRequest {
  totalInstallments: number
  installmentValue: number
  category: string
  description: string
  startDate: string // yyyy-MM-dd
  /** Local wall-clock, no TZ — e.g. `2026-05-03T14:30:00` (Java LocalDateTime). Avoid `…Z`. */
  startDateTime?: string
}

export interface RecurringTransaction {
  id: number
  type: TransactionType
  category: string
  description: string
  amount: number
  frequency: 'MONTHLY'
  startDate: string
  endDate?: string
  nextRunDate: string
  dayOfMonth: number
  active: boolean
}

export interface CreateRecurringTransactionRequest {
  type: TransactionType
  category: string
  description: string
  amount: number
  startDate: string
  endDate?: string
  dayOfMonth?: number
}

// Search component interfaces
export interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (filters: SearchFilters) => void
}

export interface SearchResultsModalProps {
  isOpen: boolean
  onClose: () => void
  searchFilters: SearchFilters
  user?: {
    id: number
    name: string
    email: string
    token: string
  }
}

export interface SearchFiltersProps {
  filters: SearchFilters
  onUpdateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void
  onTypeChange: (type: 'income' | 'expense' | null) => void
  availableCategories: string[]
}

export interface SearchFooterProps {
  onClearAll: () => void
  onSearch: () => void
}

export interface SearchHeaderProps {
  onClose: () => void
}

export interface SearchSummaryHeaderProps {
  searchFilters: SearchFilters
}

export interface CategoryResultCardProps {
  category: string
  transactions: Transaction[]
  type: 'INCOME' | 'EXPENSE'
  isExpanded: boolean
  onToggle: () => void
}

export interface CategoryResultsListProps {
  transactions: Transaction[]
  searchFilters: SearchFilters
}
