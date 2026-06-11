import type { Transaction } from '../../../../types'

export interface CategoryWithTransactions {
  category: string
  total: number
  transactions: Transaction[]
}

export function processCategoriesWithTransactions(
  transactions: Transaction[],
): { sortedCategories: CategoryWithTransactions[]; total: number } {
  const categories = new Map<string, CategoryWithTransactions>()

  for (const transaction of transactions) {
    const category = transaction.category || 'Uncategorized'
    const current = categories.get(category)

    if (current) {
      current.total += transaction.amount
      current.transactions.push(transaction)
    } else {
      categories.set(category, {
        category,
        total: transaction.amount,
        transactions: [transaction],
      })
    }
  }

  const sortedCategories = [...categories.values()]
    .map((category) => ({
      ...category,
      transactions: [...category.transactions].sort(
        (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
      ),
    }))
    .sort((a, b) => b.total - a.total)

  return {
    sortedCategories,
    total: sortedCategories.reduce((sum, category) => sum + category.total, 0),
  }
}
