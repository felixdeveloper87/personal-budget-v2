import type { Category, ComputedCategory } from './types'

/** Rank a side's category totals and calculate each category's share. */
export function computeSide(categories: Category[]): { rows: ComputedCategory[]; total: number } {
  const rows = categories
    .map((category): ComputedCategory => ({
      ...category,
      amount: category.total,
      shownCount: category.count,
      pct: 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const total = rows.reduce((sum, category) => sum + category.amount, 0) || 1
  rows.forEach((category) => {
    category.pct = (category.amount / total) * 100
  })

  return { rows, total }
}
