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
