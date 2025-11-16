import axios from 'axios'
import {
  Transaction,
  MonthlySummary,
  User,
  LoginRequest,
  RegisterRequest,
  InstallmentPlan,
  CreateInstallmentPlanRequest
} from './types'

// ----------------------------------------------------
// 🌐 Create main Axios instance
// ----------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

// ----------------------------------------------------
// 🧠 Axios Interceptors
// ----------------------------------------------------

// 🔹 Request Interceptor:
// Automatically attach Authorization header if user token exists.
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const { token } = JSON.parse(storedUser)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch {
        // If parsing fails, clear corrupted storage
        localStorage.removeItem('user')
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 🔹 Response Interceptor:
// Automatically handle expired or invalid tokens (HTTP 401).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid or expired → clear session and redirect
      localStorage.removeItem('user')

      // Prevent infinite redirect loop if already on auth page
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)

// ----------------------------------------------------
// 🔐 AUTH ENDPOINTS
// ----------------------------------------------------

// Login → POST /auth/login
export async function login(credentials: LoginRequest): Promise<User> {
  const { data } = await api.post<User>('/auth/login', credentials)
  return data
}

// Register → POST /auth/register
export async function register(payload: RegisterRequest): Promise<User> {
  const { data } = await api.post<User>('/auth/register', payload)
  return data
}

// ----------------------------------------------------
// 💸 TRANSACTION ENDPOINTS
// ----------------------------------------------------

// Get all transactions → GET /transactions
export async function listTransactions(): Promise<Transaction[]> {
  const { data } = await api.get<Transaction[]>('/transactions')
  return data
}

// Create a transaction → POST /transactions
export async function createTransaction(tx: Transaction): Promise<Transaction> {
  const { data } = await api.post<Transaction>('/transactions', tx)
  return data
}

// Update a transaction → PUT /transactions/:id
export async function updateTransaction(id: number, tx: Transaction): Promise<Transaction> {
  const { data } = await api.put<Transaction>(`/transactions/${id}`, tx)
  return data
}

// Delete a transaction → DELETE /transactions/:id
export async function deleteTransaction(id: number): Promise<void> {
  await api.delete(`/transactions/${id}`)
}

// Get monthly summary → GET /summary/month?year=&month=
export async function getMonthlySummary(date: Date): Promise<MonthlySummary> {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const { data } = await api.get<MonthlySummary>('/summary/month', {
    params: { year, month }
  })
  return data
}

// Search transactions → GET /transactions/search
export async function searchTransactions(filters: {
  text?: string
  type?: 'income' | 'expense'
  category?: string
  startDate?: string
  endDate?: string
}): Promise<Transaction[]> {
  const { data } = await api.get<Transaction[]>('/transactions/search', {
    params: filters
  })
  return data
}

// ----------------------------------------------------
// 📊 INSTALLMENT PLAN ENDPOINTS
// ----------------------------------------------------

// Get all installment plans → GET /installment-plans
export async function listInstallmentPlans(): Promise<InstallmentPlan[]> {
  const { data } = await api.get<InstallmentPlan[]>('/installment-plans')
  return data
}

// Create installment plan → POST /installment-plans
export async function createInstallmentPlan(
  request: CreateInstallmentPlanRequest
): Promise<InstallmentPlan> {
  const { data } = await api.post<InstallmentPlan>('/installment-plans', request)
  return data
}

// Get installment plan by ID → GET /installment-plans/:id
export async function getInstallmentPlan(id: number): Promise<InstallmentPlan> {
  const { data } = await api.get<InstallmentPlan>(`/installment-plans/${id}`)
  return data
}

// Delete installment plan → DELETE /installment-plans/:id
export async function deleteInstallmentPlan(id: number): Promise<void> {
  await api.delete(`/installment-plans/${id}`)
}

export default api
