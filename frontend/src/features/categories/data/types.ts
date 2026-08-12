import type { LucideIcon } from '../../../components/ui/icons'

export type Side = 'expense' | 'income'
/** A representative transaction shown inside a category's expanded row. */
export interface CategoryTxn {
  id: string
  merchant: string
  /** True when the merchant label falls back to the raw category value. */
  merchantIsCategory?: boolean
  amount: number
  purchaseDate: string
  settlesDate: string
  account: string
}

/** A category aggregated from the transactions in the selected view and period. */
export interface Category {
  id: string
  name: string
  icon: LucideIcon
  color: string
  kind: Side
  count: number
  total: number
  sample: CategoryTxn[]
}

/** A category with its amount, count and percentage ready for display. */
export interface ComputedCategory extends Category {
  amount: number
  shownCount: number
  pct: number
  previousAmount: number
  change: number
  changePct: number | null
  averageAmount: number
  activeDays: number
  topMerchant: string | null
}
