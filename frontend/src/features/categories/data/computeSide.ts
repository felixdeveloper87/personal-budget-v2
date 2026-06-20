import type { Category, ComputedCategory, ViewMode } from './types'

/**
 * Resolve a side's categories for the active view (the "two clocks"), then rank
 * them and compute each one's share. Pure — never mutates the source.
 *
 * - Behaviour → the full purchased total.
 * - Payments  → total minus the portion that settles outside the period
 *   (`total − deferred`); a fully-deferred category vanishes from the list.
 */
export function computeSide(
  categories: Category[],
  view: ViewMode,
): { rows: ComputedCategory[]; total: number } {
  const rows = categories
    .map((c): ComputedCategory => {
      const amount = view === 'payments' ? c.total - c.deferred : c.total
      const shownCount = view === 'payments' ? c.count - c.deferredCount : c.count
      return { ...c, amount, shownCount, pct: 0 }
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const total = rows.reduce((s, c) => s + c.amount, 0) || 1
  rows.forEach((c) => {
    c.pct = (c.amount / total) * 100
  })
  return { rows, total }
}
