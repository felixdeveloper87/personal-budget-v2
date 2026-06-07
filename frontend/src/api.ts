import axios from 'axios'
import {
  Transaction,
  MonthlySummary,
  User,
  UserPlan,
  LoginRequest,
  RegisterRequest,
  InstallmentPlan,
  CreateInstallmentPlanRequest,
  UpdateInstallmentPlanRequest,
  RecurringTransaction,
  CreateRecurringTransactionRequest,
  UpdateRecurringTransactionRequest,
  AdminUserRow,
  PaymentMethod,
  PaymentMethodRequest,
  PeriodType,
  ReportResponse,
  FinancialAccount,
  FinancialAccountRequest,
  AccountSummary,
  AccountTransfer,
  AccountTransferRequest,
  LegacyTransactionAssignmentRequest,
  SavingsGoal,
  SavingsGoalRequest,
  CategoryBudget,
  CategoryBudgetRequest,
  CashFlowForecast,
} from './types'
import { AUTH_SESSION_INVALID_EVENT } from './utils/jwtExpiry'
import { ToastService } from './services/toast'

function mapAuthToUser(payload: Record<string, unknown>): User {
  const userId =
    typeof payload.userId === 'number'
      ? payload.userId
      : typeof payload.id === 'number'
        ? payload.id
        : 0
  const planRaw = payload.plan
  const plan: UserPlan =
    planRaw === 'PREMIUM' || planRaw === 'STANDARD' ? planRaw : 'STANDARD'
  return {
    id: userId,
    name: String(payload.name ?? ''),
    email: String(payload.email ?? ''),
    token: String(payload.token ?? ''),
    plan,
    admin: Boolean(payload.admin),
  }
}

export type RegisterOutcome =
  | { status: 'pending'; message?: string }
  | { status: 'active'; user: User }

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
      const url = String(error.config?.url ?? '')
      // Wrong password on login returns 401 — must not wipe an existing session
      const isPublicAuthAttempt =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/google')
      if (!isPublicAuthAttempt) {
        localStorage.removeItem('user')
        ToastService.warning({
          title: 'Session expired',
          description: 'Please sign in again to continue.',
          dedupeKey: 'session-expired',
        })
        window.dispatchEvent(new CustomEvent(AUTH_SESSION_INVALID_EVENT))
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
  const { data } = await api.post<Record<string, unknown>>('/auth/login', credentials)
  return mapAuthToUser(data)
}

/** Google GIS ID token → app JWT, or pending approval for new users (same as register). */
export async function loginWithGoogle(idToken: string): Promise<RegisterOutcome> {
  const { data } = await api.post<Record<string, unknown>>('/auth/google', { idToken })
  if (data.pendingApproval === true) {
    return {
      status: 'pending',
      message: typeof data.approvalMessage === 'string' ? data.approvalMessage : undefined,
    }
  }
  return { status: 'active', user: mapAuthToUser(data) }
}

// Register → POST /auth/register (pendente de aprovação admin = sem token)
export async function register(payload: RegisterRequest): Promise<RegisterOutcome> {
  const { data } = await api.post<Record<string, unknown>>('/auth/register', payload)
  if (data.pendingApproval === true) {
    return {
      status: 'pending',
      message: typeof data.approvalMessage === 'string' ? data.approvalMessage : undefined,
    }
  }
  return { status: 'active', user: mapAuthToUser(data) }
}

// ----------------------------------------------------
// ADMIN
// ----------------------------------------------------

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const { data } = await api.get<AdminUserRow[]>('/admin/users')
  return data
}

export async function approveAdminUser(id: number): Promise<AdminUserRow> {
  const { data } = await api.patch<AdminUserRow>(`/admin/users/${id}/approve`)
  return data
}

export async function updateAdminUserPlan(id: number, plan: UserPlan): Promise<AdminUserRow> {
  const { data } = await api.patch<AdminUserRow>(`/admin/users/${id}/plan`, { plan })
  return data
}

export async function deleteAdminUser(id: number): Promise<void> {
  await api.delete(`/admin/users/${id}`)
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

// A single parsed CSV row sent to the bulk-import endpoint.
export interface ImportTransactionRow {
  line?: number
  date: string // yyyy-MM-dd
  type: 'INCOME' | 'EXPENSE'
  category: string
  description: string
  amount: number
  paymentMethodName?: string
}

export interface ImportResult {
  imported: number
  failed: number
  errors: { line: number; message: string }[]
}

// Bulk-import transactions → POST /transactions/import
export async function importTransactions(
  rows: ImportTransactionRow[],
  accountId?: number | null,
): Promise<ImportResult> {
  const { data } = await api.post<ImportResult>('/transactions/import', {
    rows,
    accountId: accountId ?? null,
  })
  return data
}

// Export all transactions as CSV → GET /transactions/export
export async function exportTransactionsCsv(): Promise<Blob> {
  const { data } = await api.get<Blob>('/transactions/export', { responseType: 'blob' })
  return data
}

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  const { data } = await api.get<PaymentMethod[]>('/payment-methods')
  return data
}

export async function createPaymentMethod(request: PaymentMethodRequest): Promise<PaymentMethod> {
  const { data } = await api.post<PaymentMethod>('/payment-methods', request)
  return data
}

export async function updatePaymentMethod(
  id: number,
  request: PaymentMethodRequest
): Promise<PaymentMethod> {
  const { data } = await api.put<PaymentMethod>(`/payment-methods/${id}`, request)
  return data
}

export async function deletePaymentMethod(id: number): Promise<void> {
  await api.delete(`/payment-methods/${id}`)
}

export async function listAccounts(): Promise<FinancialAccount[]> {
  const { data } = await api.get<FinancialAccount[]>('/accounts')
  return data
}

// Permanently delete all of the current user's financial data → DELETE /user/data
export async function deleteAllUserData(): Promise<void> {
  await api.delete('/user/data')
}

export async function getAccountSummary(): Promise<AccountSummary> {
  const { data } = await api.get<AccountSummary>('/accounts/summary')
  return data
}

export async function createAccount(request: FinancialAccountRequest): Promise<FinancialAccount> {
  const { data } = await api.post<FinancialAccount>('/accounts', request)
  return data
}

export async function updateAccount(
  id: number,
  request: FinancialAccountRequest,
): Promise<FinancialAccount> {
  const { data } = await api.put<FinancialAccount>(`/accounts/${id}`, request)
  return data
}

export async function archiveAccount(id: number): Promise<void> {
  await api.delete(`/accounts/${id}`)
}

export async function listAccountTransfers(): Promise<AccountTransfer[]> {
  const { data } = await api.get<AccountTransfer[]>('/accounts/transfers')
  return data
}

export async function createAccountTransfer(
  request: AccountTransferRequest,
): Promise<AccountTransfer> {
  const { data } = await api.post<AccountTransfer>('/accounts/transfers', request)
  return data
}

export async function assignLegacyTransactions(
  accountId: number,
  request: LegacyTransactionAssignmentRequest,
): Promise<number> {
  const { data } = await api.post<{ assignedCount: number }>(
    `/accounts/${accountId}/assign-legacy-transactions`,
    request,
  )
  return data.assignedCount
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

function toDateParam(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function getReport(period: PeriodType, date: Date): Promise<ReportResponse> {
  const { data } = await api.get<ReportResponse>('/reports', {
    params: { period, date: toDateParam(date) },
  })
  return data
}

export async function downloadReportPdf(period: PeriodType, date: Date): Promise<Blob> {
  const { data } = await api.get<Blob>('/reports/pdf', {
    params: { period, date: toDateParam(date) },
    responseType: 'blob',
  })
  return data
}

// Update installment plan -> PUT /installment-plans/:id
export async function updateInstallmentPlan(
  id: number,
  request: UpdateInstallmentPlanRequest
): Promise<InstallmentPlan> {
  const { data } = await api.put<InstallmentPlan>(`/installment-plans/${id}`, request)
  return data
}

// Associate an installment plan with a balance account → PATCH /installment-plans/:id/account
export async function assignInstallmentPlanAccount(
  id: number,
  accountId: number,
): Promise<InstallmentPlan> {
  const { data } = await api.patch<InstallmentPlan>(`/installment-plans/${id}/account`, { accountId })
  return data
}

// Delete installment plan → DELETE /installment-plans/:id
export async function deleteInstallmentPlan(id: number): Promise<void> {
  await api.delete(`/installment-plans/${id}`)
}

// ----------------------------------------------------
// RECURRING TRANSACTION ENDPOINTS
// ----------------------------------------------------

// Get all recurring transactions -> GET /recurring-transactions
export async function listRecurringTransactions(): Promise<RecurringTransaction[]> {
  const { data } = await api.get<RecurringTransaction[]>('/recurring-transactions')
  return data
}

// Create recurring transaction -> POST /recurring-transactions
export async function createRecurringTransaction(
  request: CreateRecurringTransactionRequest
): Promise<RecurringTransaction> {
  const { data } = await api.post<RecurringTransaction>('/recurring-transactions', request)
  return data
}

// Update recurring transaction amount -> PATCH /recurring-transactions/:id/amount
export async function updateRecurringTransactionAmount(
  id: number,
  amount: number
): Promise<RecurringTransaction> {
  const { data } = await api.patch<RecurringTransaction>(`/recurring-transactions/${id}/amount`, {
    amount,
  })
  return data
}

// Update recurring transaction -> PUT /recurring-transactions/:id
export async function updateRecurringTransaction(
  id: number,
  request: UpdateRecurringTransactionRequest
): Promise<RecurringTransaction> {
  const { data } = await api.put<RecurringTransaction>(`/recurring-transactions/${id}`, request)
  return data
}

// Associate a recurring rule with a balance account -> PATCH /recurring-transactions/:id/account
export async function assignRecurringTransactionAccount(
  id: number,
  accountId: number,
): Promise<RecurringTransaction> {
  const { data } = await api.patch<RecurringTransaction>(`/recurring-transactions/${id}/account`, { accountId })
  return data
}

// Cancel recurring transaction -> DELETE /recurring-transactions/:id
export async function cancelRecurringTransaction(id: number): Promise<RecurringTransaction> {
  const { data } = await api.delete<RecurringTransaction>(`/recurring-transactions/${id}`)
  return data
}

export async function listSavingsGoals(): Promise<SavingsGoal[]> {
  const { data } = await api.get<SavingsGoal[]>('/goals')
  return data
}

export async function createSavingsGoal(request: SavingsGoalRequest): Promise<SavingsGoal> {
  const { data } = await api.post<SavingsGoal>('/goals', request)
  return data
}

export async function updateSavingsGoal(
  id: number,
  request: SavingsGoalRequest,
): Promise<SavingsGoal> {
  const { data } = await api.put<SavingsGoal>(`/goals/${id}`, request)
  return data
}

export async function contributeToSavingsGoal(
  id: number,
  amount: number,
  note?: string,
): Promise<SavingsGoal> {
  const { data } = await api.post<SavingsGoal>(`/goals/${id}/contributions`, {
    amount,
    contributionDate: toDateParam(new Date()),
    note,
  })
  return data
}

export async function archiveSavingsGoal(id: number): Promise<void> {
  await api.delete(`/goals/${id}`)
}

export async function listCategoryBudgets(date: Date): Promise<CategoryBudget[]> {
  const { data } = await api.get<CategoryBudget[]>('/planning/budgets', {
    params: { year: date.getFullYear(), month: date.getMonth() + 1 },
  })
  return data
}

export async function upsertCategoryBudget(
  request: CategoryBudgetRequest,
): Promise<CategoryBudget> {
  const { data } = await api.put<CategoryBudget>('/planning/budgets', request)
  return data
}

export async function deleteCategoryBudget(id: number): Promise<void> {
  await api.delete(`/planning/budgets/${id}`)
}

export async function getCashFlowForecast(): Promise<CashFlowForecast> {
  const { data } = await api.get<CashFlowForecast>('/planning/forecast')
  return data
}

export async function updateIncomePlan(
  plannedMonthlyIncome: number | null,
): Promise<CashFlowForecast> {
  const { data } = await api.put<CashFlowForecast>('/planning/income-plan', {
    plannedMonthlyIncome,
  })
  return data
}

export default api
