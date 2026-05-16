export type TransactionType = 'INCOME' | 'EXPENSE'
export type PaymentMethodType = 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER'

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
  transactionDate?: string // yyyy-MM-dd: real purchase date
  paymentDate?: string // yyyy-MM-dd: financial/budget impact date
  type: TransactionType
  category: string
  description: string
  amount: number
  paymentMethodId?: number | null
  paymentMethodName?: string | null
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

export interface PaymentMethod {
  id: number
  name: string
  type: PaymentMethodType
  issuer?: string | null
  active: boolean
  statementClosingDay?: number | null
  paymentDay?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface PaymentMethodRequest {
  name: string
  type: PaymentMethodType
  issuer?: string | null
  active: boolean
  statementClosingDay?: number | null
  paymentDay?: number | null
}

// Resumo mensal
export interface MonthlySummary {
  year: number
  month: number // 1-12
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: { category: string; income: number; expense: number }[]
}

export interface ReportCategoryBreakdown {
  category: string
  amount: number
  percentage: number
  transactionCount: number
}

export interface ReportPaymentMethodBreakdown {
  name: string
  amount: number
  percentage: number
  transactionCount: number
}

export interface ReportTimeBucket {
  label: string
  startDate: string
  endDate: string
  income: number
  expense: number
  balance: number
  transactionCount: number
}

export interface ReportTransactionItem {
  id: number
  paymentDate: string
  type: TransactionType
  category: string
  description: string
  amount: number
  paymentMethodName?: string | null
  installment: boolean
  recurring: boolean
}

export interface ReportResponse {
  period: PeriodType
  periodLabel: string
  referenceDate: string
  startDate: string
  endDate: string
  generatedAt: string
  totalIncome: number
  totalExpense: number
  balance: number
  averageExpense: number
  installmentExpenseTotal: number
  recurringExpenseTotal: number
  transactionCount: number
  incomeCount: number
  expenseCount: number
  insights: string[]
  incomeCategories: ReportCategoryBreakdown[]
  expenseCategories: ReportCategoryBreakdown[]
  paymentMethods: ReportPaymentMethodBreakdown[]
  buckets: ReportTimeBucket[]
  topIncome: ReportTransactionItem[]
  topExpenses: ReportTransactionItem[]
}

// Usuário autenticado (AuthResponse do backend)
export type UserPlan = 'STANDARD' | 'PREMIUM'

export interface User {
  id: number
  name: string
  email: string
  token: string
  plan: UserPlan
  /** Painel admin (definido no backend / banco). */
  admin: boolean
}

export interface AdminUserRow {
  id: number
  email: string
  name: string
  createdAt: string
  approved: boolean
  admin: boolean
  plan: UserPlan
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

export interface UpdateInstallmentPlanRequest {
  installmentValue?: number
  totalAmount?: number
  startDate: string
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

export interface UpdateRecurringTransactionRequest {
  amount: number
  startDate: string
  dayOfMonth: number
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
