export type TransactionType = 'INCOME' | 'EXPENSE'
export type PaymentMethodType = 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER'
export type TransactionStatus = 'PLANNED' | 'PENDING' | 'CLEARED' | 'RECONCILED'
export type AccountType = 'CURRENT' | 'SAVINGS' | 'CASH' | 'CREDIT_CARD'

// Period types for navigation
export type PeriodType = 'day' | 'week' | 'month' | 'year'

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
  accountId?: number | null
  accountName?: string | null
  status?: TransactionStatus
  userId?: number // opcional porque o backend não retorna no DTO de busca
  installmentPlanId?: number // ID do plano de parcelamento (se houver)
  recurringTransactionId?: number // ID da recorrencia (se houver)
  isInstallment?: boolean // Indica se faz parte de um parcelamento
  isRecurring?: boolean // Indica se foi gerada por uma recorrencia
  installmentNumber?: number // Número da parcela (1, 2, 3, etc.)
  isFutureInstallment?: boolean // Indica se é uma parcela futura calculada
}

export interface UpdateTransactionRequest {
  dateTime: string
  transactionDate: string
  type: TransactionType
  category: string
  description: string
  amount: number
  paymentMethodId: number | null
  accountId: number
  status: TransactionStatus
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
  /** Optional credit limit (credit cards only). */
  creditLimit?: number | null
  /** Balance account the card statement is debited from (e.g. NatWest card → NatWest account). */
  settlementAccountId?: number | null
  settlementAccountName?: string | null
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
  creditLimit?: number | null
  settlementAccountId?: number | null
}

export interface FinancialAccount {
  id: number
  name: string
  type: AccountType
  institution?: string | null
  currency: string
  openingBalance: number
  balanceAnchorAt: string
  currentBalance: number
  overdraftLimit: number
  overdraftUsed: number
  overdraftAvailable: number
  overdraftPercentageUsed: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface FinancialAccountRequest {
  name: string
  type: AccountType
  institution?: string | null
  currency: string
  openingBalance: number
  overdraftLimit: number
  active: boolean
}

export interface AccountSummary {
  totalBalance: number
  unassignedTransactionCount: number
  accounts: FinancialAccount[]
}

export type AccountActivityKind = 'INCOME' | 'EXPENSE' | 'TRANSFER_IN' | 'TRANSFER_OUT'

export interface AccountActivityItem {
  id: number
  date: string
  kind: AccountActivityKind
  description?: string | null
  category?: string | null
  amount: number
  status?: TransactionStatus | null
  paymentMethodName?: string | null
  paymentMethodType?: PaymentMethodType | null
}

export interface AccountDetails {
  account: FinancialAccount
  recentActivity: AccountActivityItem[]
  upcomingActivity: AccountActivityItem[]
}

/** One page of an account's past activity, most recent first. */
export interface AccountActivityPage {
  items: AccountActivityItem[]
  page: number
  size: number
  hasMore: boolean
}

export interface AccountTransfer {
  id: number
  fromAccountId: number
  fromAccountName: string
  toAccountId: number
  toAccountName: string
  amount: number
  transferDate: string
  description?: string | null
  createdAt: string
}

export interface AccountTransferRequest {
  fromAccountId: number
  toAccountId: number
  amount: number
  transferDate: string
  description?: string
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
  accountName?: string | null
  status?: TransactionStatus | null
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

export interface ResetPasswordRequest {
  email: string
  password: string
}

// Plano de parcelamento
export interface InstallmentPlan {
  id: number
  totalInstallments: number
  totalAmount: number
  installmentValue: number
  purchaseDate?: string | null
  accountId?: number | null
  accountName?: string | null
  paymentMethodId?: number | null
  paymentMethodName?: string | null
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
  purchaseDate: string // yyyy-MM-dd
  /** Local wall-clock, no TZ — e.g. `2026-05-03T14:30:00` (Java LocalDateTime). Avoid `…Z`. */
  startDateTime?: string
  accountId: number
  paymentMethodId?: number | null
}

export interface UpdateInstallmentPlanRequest {
  installmentValue?: number
  totalAmount?: number
  startDate: string
  purchaseDate?: string
  startDateTime?: string
  accountId?: number | null
  paymentMethodId?: number | null
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
  accountId?: number | null
  accountName?: string | null
  paymentMethodId?: number | null
  paymentMethodName?: string | null
}

export interface CreateRecurringTransactionRequest {
  type: TransactionType
  category: string
  description: string
  amount: number
  startDate: string
  endDate?: string
  dayOfMonth?: number
  accountId: number
  paymentMethodId?: number | null
}

export interface UpdateRecurringTransactionRequest {
  amount: number
  startDate: string
  dayOfMonth: number
  accountId?: number | null
  paymentMethodId?: number | null
  applyFrom: RecurringUpdateScope
}

export type RecurringUpdateScope = 'CURRENT_MONTH' | 'NEXT_MONTH'

export interface SavingsGoal {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  remainingAmount: number
  progressPercentage: number
  targetDate?: string | null
  color: string
  archived: boolean
}

export interface SavingsGoalRequest {
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string | null
  color: string
}

export interface CategoryBudget {
  id: number
  category: string
  year: number
  month: number
  limitAmount: number
  spentAmount: number
  remainingAmount: number
  percentageUsed: number
  exceeded: boolean
}

export interface CategoryBudgetRequest {
  category: string
  year: number
  month: number
  limitAmount: number
}

export interface CashFlowForecastMonth {
  month: string
  monthEnd: string
  fixedIncome: number
  estimatedIncome: number
  fixedExpense: number
  installmentExpense: number
  estimatedVariableExpense: number
  committedNet: number
  estimatedNet: number
  netCashFlow: number
  projectedClosingBalance: number
  confidencePercent: number
  negative: boolean
  incomeReceivedSoFar: number
  expensesPaidSoFar: number
}

export interface CashFlowForecast {
  currentTotalBalance: number
  projectionBasisMonths: string[]
  hasProjectionBasis: boolean
  averageMonthlyIncome: number
  averageMonthlyVariableExpense: number
  hasIncomePlan: boolean
  plannedMonthlyIncome: number | null
  hasExpensePlan: boolean
  plannedMonthlyVariableExpense: number | null
  months: CashFlowForecastMonth[]
}

export type HouseholdRole = 'OWNER' | 'MEMBER'
export type HouseholdSettlementStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
export type HouseholdAttachmentStatus = 'AVAILABLE' | 'EXPIRED' | 'REMOVED'
export type HouseholdCleaningStatus = 'PENDING' | 'UPCOMING' | 'COMPLETED' | 'MISSED'
export type HouseholdNotificationType =
  | 'EXPENSE_CREATED'
  | 'EXPENSE_UPDATED'
  | 'EXPENSE_VOIDED'
  | 'SETTLEMENT_CREATED'
  | 'SETTLEMENT_CONFIRMED'
  | 'SETTLEMENT_REJECTED'
  | 'SETTLEMENT_CANCELLED'
  | 'MEMBER_JOINED'
  | 'MEMBER_REMOVED'
  | 'CLEANING_WEEK_ASSIGNED'
  | 'CLEANING_DUTY_COMPLETED'
  | 'CLEANING_WEEK_COMPLETED'

export interface HouseholdMember {
  id: number
  userId: number
  name: string
  email: string
  role: HouseholdRole
  totalPaid: number
  totalShare: number
  balance: number
}

export interface HouseholdMemberInvitation {
  id: number
  targetName: string
  targetEmail: string
  createdAt: string
}

export interface HouseholdDebt {
  fromMemberId: number
  fromMemberName: string
  toMemberId: number
  toMemberName: string
  amount: number
}

export interface HouseholdExpenseShare {
  memberId: number
  memberName: string
  amount: number
}

export interface HouseholdAttachment {
  id: number
  originalFilename: string
  contentType: string
  sizeBytes: number
  uploadedByName: string
  status: HouseholdAttachmentStatus
  canDelete: boolean
  createdAt: string
  expiresAt: string
}

export interface HouseholdExpense {
  id: number
  description: string
  category: string
  amount: number
  expenseDate: string
  payerMemberId: number
  payerName: string
  canEdit: boolean
  shares: HouseholdExpenseShare[]
  attachments: HouseholdAttachment[]
  createdAt: string
}

export interface HouseholdSettlement {
  id: number
  fromMemberId: number
  fromMemberName: string
  toMemberId: number
  toMemberName: string
  amount: number
  settlementDate: string
  status: HouseholdSettlementStatus
  canConfirm: boolean
  canReject: boolean
  canCancel: boolean
  canAttach: boolean
  attachments: HouseholdAttachment[]
  createdAt: string
}

export interface HouseholdInvitation {
  id: number
  householdId: number
  householdName: string
  invitedByName: string
  createdAt: string
}

export interface HouseholdCleaningAssignment {
  id: number
  weekStart: string
  weekEnd: string
  assignedMemberId: number
  assignedMemberName: string
  status: HouseholdCleaningStatus
  canComplete: boolean
  completedAt: string | null
  duties: HouseholdCleaningDuty[]
}

export interface HouseholdCleaningDuty {
  key: string
  label: string
  schedule: string | null
  completed: boolean
  canToggle: boolean
  completedAt: string | null
}

export interface HouseholdCleaningRotation {
  configured: boolean
  active: boolean
  canManage: boolean
  startDate: string | null
  participantMemberIds: number[]
  currentWeek: HouseholdCleaningAssignment | null
  upcomingWeeks: HouseholdCleaningAssignment[]
}

export interface HouseholdMonthSummary {
  month: string
  spend: number
  expenseCount: number
}

export interface HouseholdNotification {
  id: number
  type: HouseholdNotificationType
  actorMemberId: number | null
  actorName: string | null
  referenceId: number | null
  subject: string | null
  amount: number | null
  recipientAmount: number | null
  createdAt: string
  readAt: string | null
}

export interface HouseholdDashboard {
  id: number
  name: string
  currency: string
  currentMemberId: number
  currentMemberRole: HouseholdRole
  currentUserBalance: number
  monthSpend: number
  monthSummaries: HouseholdMonthSummary[]
  cleaningRotation: HouseholdCleaningRotation
  members: HouseholdMember[]
  pendingMemberInvitations: HouseholdMemberInvitation[]
  debts: HouseholdDebt[]
  expenses: HouseholdExpense[]
  settlements: HouseholdSettlement[]
  unreadNotificationCount: number
  notifications: HouseholdNotification[]
}

export interface HouseholdPageState {
  household: HouseholdDashboard | null
  pendingInvitations: HouseholdInvitation[]
}

export interface HouseholdExpenseRequest {
  description: string
  category: string
  amount: number
  expenseDate: string
  participantMemberIds: number[]
}

export interface HouseholdSettlementRequest {
  toMemberId: number
  amount: number
  settlementDate: string
}

export interface HouseholdCleaningRotationRequest {
  startDate: string
  active: boolean
  participantMemberIds: number[]
}
