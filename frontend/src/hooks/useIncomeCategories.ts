import { useMemo } from 'react'
import { Transaction } from '../types'

export interface CategoryData {
  category: string
  amount: number
}

export interface UseIncomeCategoriesResult {
  sortedCategories: CategoryData[]
  totalIncome: number
  isEmpty: boolean
}

/**
 * Custom hook to process and calculate income categories
 * @param transactions - Array of transactions
 * @returns Processed category data with totals and sorted list
 */
export function useIncomeCategories(transactions: Transaction[]): UseIncomeCategoriesResult {
  const { sortedCategories, totalIncome } = useMemo(() => {
    const categoryTotals = transactions
      .filter((transaction) => transaction.type === 'INCOME')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Uncategorized'
        acc[category] = (acc[category] || 0) + transaction.amount
        return acc
      }, {} as Record<string, number>)

    const sorted = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    const total = sorted.reduce((sum, { amount }) => sum + amount, 0)

    return { sortedCategories: sorted, totalIncome: total }
  }, [transactions])

  return {
    sortedCategories,
    totalIncome,
    isEmpty: sortedCategories.length === 0,
  }
}

