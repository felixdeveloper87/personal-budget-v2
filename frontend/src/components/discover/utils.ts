import type { Transaction } from '../../types'

export function competenceDate(transaction: Transaction): Date {
  const source = transaction.paymentDate || transaction.transactionDate || transaction.dateTime
  return source.length === 10 ? new Date(`${source}T00:00:00`) : new Date(source)
}

export interface CategoryBreakdownRow {
  name: string
  total: number
  count: number
  percentage: number
}

export interface CategoryComparisonRow extends CategoryBreakdownRow {
  previous: number
  change: number
  changePercent: number
}

export function buildCategoryBreakdown(transactions: Transaction[]): CategoryBreakdownRow[] {
  const expenses = transactions.filter((tx) => tx.type === 'EXPENSE')
  const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0)

  const byCategory = new Map<string, { total: number; count: number }>()
  for (const tx of expenses) {
    const current = byCategory.get(tx.category) ?? { total: 0, count: 0 }
    byCategory.set(tx.category, {
      total: current.total + tx.amount,
      count: current.count + 1,
    })
  }

  return [...byCategory.entries()]
    .map(([name, { total, count }]) => ({
      name,
      total,
      count,
      percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

export function getTopExpenses(transactions: Transaction[], limit = 5): Transaction[] {
  return transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

export function buildCategoryComparison(
  currentTransactions: Transaction[],
  previousTransactions: Transaction[],
): CategoryComparisonRow[] {
  const previousCategories = new Map(
    buildCategoryBreakdown(previousTransactions).map((row) => [row.name, row.total]),
  )

  return buildCategoryBreakdown(currentTransactions)
    .map((row) => {
      const previous = previousCategories.get(row.name) ?? 0
      const change = row.total - previous

      return {
        ...row,
        previous,
        change,
        changePercent: previous > 0 ? (change / previous) * 100 : 100,
      }
    })
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
}

export const UPCOMING_WINDOW_DAYS = 7

/** Expenses whose payment hits the account within the next N days. */
export function getUpcomingPayments(
  transactions: Transaction[],
  days = UPCOMING_WINDOW_DAYS,
): Transaction[] {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start)
  end.setDate(start.getDate() + days)
  end.setHours(23, 59, 59, 999)

  return transactions
    .filter((tx) => {
      if (tx.type !== 'EXPENSE' || !tx.paymentDate) return false
      const due = competenceDate(tx)
      return due >= start && due <= end
    })
    .sort((a, b) => competenceDate(a).getTime() - competenceDate(b).getTime())
}

export function previousPeriodLabel(selectedPeriod: string): string {
  switch (selectedPeriod) {
    case 'day':
      return 'the previous day'
    case 'week':
      return 'last week'
    case 'year':
      return 'last year'
    default:
      return 'last month'
  }
}
