import { useMemo } from 'react'
import { Transaction } from '../types'

export interface CategoryData {
  category: string
  amount: number
}

export interface UseExpenseCategoriesResult {
  sortedCategories: CategoryData[]
  totalExpenses: number
  isEmpty: boolean
}

/**
 * Custom hook to process and calculate expense categories
 * @param transactions - Array of transactions
 * @returns Processed category data with totals and sorted list
 */
export function useExpenseCategories(transactions: Transaction[]): UseExpenseCategoriesResult {
  const { sortedCategories, totalExpenses } = useMemo(() => {
    const categoryTotals = transactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Uncategorized'
        acc[category] = (acc[category] || 0) + transaction.amount
        return acc
      }, {} as Record<string, number>)

    const sorted = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    const total = sorted.reduce((sum, { amount }) => sum + amount, 0)

    return { sortedCategories: sorted, totalExpenses: total }
  }, [transactions])

  return {
    sortedCategories,
    totalExpenses,
    isEmpty: sortedCategories.length === 0,
  }
}

