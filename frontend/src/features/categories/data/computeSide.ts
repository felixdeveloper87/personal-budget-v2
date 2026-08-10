import type { Category, CategoryTxn, ComputedCategory } from './types'

/** Rank a side's category totals and calculate each category's share. */
export function computeSide(
  categories: Category[],
  previousCategories: Category[] = [],
): { rows: ComputedCategory[]; total: number } {
  const previousById = new Map(previousCategories.map((category) => [category.id, category.total]))
  const rows = categories
    .map((category): ComputedCategory => withMetrics(category, previousById.get(category.id) ?? 0))
    .sort((a, b) => b.amount - a.amount)

  const total = rows.reduce((sum, category) => sum + category.amount, 0) || 1
  rows.forEach((category) => {
    category.pct = (category.amount / total) * 100
  })

  return { rows, total }
}

function withMetrics(category: Category, previousAmount: number): ComputedCategory {
  const amount = category.total
  return {
    ...category,
    amount,
    shownCount: category.count,
    pct: 0,
    previousAmount,
    change: amount - previousAmount,
    changePct: previousAmount > 0 ? ((amount - previousAmount) / previousAmount) * 100 : null,
    averageAmount: category.count > 0 ? amount / category.count : 0,
    activeDays: new Set(category.sample.map((transaction) => transaction.purchaseDate)).size,
    topMerchant: merchantLeader(category.sample),
  }
}

function merchantLeader(transactions: CategoryTxn[]): string | null {
  if (transactions.length === 0) return null

  const totals = new Map<string, number>()
  for (const transaction of transactions) {
    totals.set(transaction.merchant, (totals.get(transaction.merchant) ?? 0) + transaction.amount)
  }

  return [...totals.entries()]
    .sort(([, a], [, b]) => b - a)[0]?.[0] ?? null
}
