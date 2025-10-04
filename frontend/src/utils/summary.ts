import { MonthlySummary } from '../types'

export function convertMonthlySummary(summary: any): MonthlySummary {
  if (!summary) {
    return {
      year: 0,
      month: 0,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      byCategory: [],
    }
  }

  return {
    year: summary.year || 0,
    month: summary.month || 0,
    totalIncome: Number(summary.totalIncome) || 0,
    totalExpense: Number(summary.totalExpense) || 0,
    balance: Number(summary.balance) || 0,
    byCategory:
      summary.byCategory?.map((cat: any) => ({
        category: cat.category || '',
        income: Number(cat.income) || 0,
        expense: Number(cat.expense) || 0,
      })) || [],
  }
}
