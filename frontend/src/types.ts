export type TransactionType = 'INCOME' | 'EXPENSE'

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
  isInstallment?: boolean // Indica se faz parte de um parcelamento
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
}
