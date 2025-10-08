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
