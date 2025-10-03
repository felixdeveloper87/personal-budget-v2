import axios from 'axios'
import { Transaction, MonthlySummary, User, LoginRequest, RegisterRequest } from './types'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || '/api' 
})

// Auth API
export async function login(credentials: LoginRequest): Promise<User> {
  const { data } = await api.post('/auth/login', credentials)
  return data
}

export async function register(data: RegisterRequest): Promise<User> {
  const { data: response } = await api.post('/auth/register', data)
  return response
}

// Transaction API
export async function listTransactions(token: string): Promise<Transaction[]> {
  const { data } = await api.get('/transactions', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data
}

export async function createTransaction(tx: Transaction, token: string): Promise<Transaction> {
  const { data } = await api.post('/transactions', tx, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data
}

export async function deleteTransaction(id: number, token: string): Promise<void> {
  await api.delete(`/transactions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
}

export async function getMonthlySummary(date: Date, token: string): Promise<MonthlySummary> {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const { data } = await api.get('/summary/month', { 
    params: { year, month },
    headers: { Authorization: `Bearer ${token}` }
  })
  return data
}

export async function searchTransactions(
  filters: {
    text?: string
    type?: 'income' | 'expense'
    category?: string
    startDate?: string
    endDate?: string
  },
  token: string
): Promise<Transaction[]> {
  const { data } = await api.get('/transactions/search', {
    params: filters,
    headers: { Authorization: `Bearer ${token}` }
  })
  return data
}


