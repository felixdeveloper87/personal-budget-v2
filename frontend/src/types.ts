export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Transaction {
  id?: number
  date: string // ISO date
  type: TransactionType
  category: string
  description?: string
  amount: number
}

export interface MonthlySummary {
  year: number
  month: number // 1-12
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: { category: string; income: number; expense: number }[]
}

export interface User {
  userId: number
  name: string
  email: string
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

