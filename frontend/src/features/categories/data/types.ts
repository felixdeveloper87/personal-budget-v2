import type { LucideIcon } from '../../../components/ui/icons'

export type Side = 'expense' | 'income'
export type ViewMode = 'behaviour' | 'payments' // the two clocks

/** A representative transaction shown inside a category's expand. */
export interface CategoryTxn {
  id: string
  merchant: string
  amount: number // major units (£), positive magnitude
  purchaseDate: string // ISO yyyy-MM-dd — when you bought it   (Behaviour clock)
  settlesDate: string // ISO yyyy-MM-dd — when it clears        (Payments clock)
  account: string
  deferred: boolean // settlesDate falls outside the period
}

/** A category aggregated for one period on the Behaviour basis. */
export interface Category {
  id: string
  name: string
  icon: LucideIcon
  color: string // hex — drives dot, donut segment, share bar, icon tint
  kind: Side
  count: number // total txns in the period (Behaviour basis)
  total: number // Behaviour total — everything purchased in the period
  deferred: number // portion whose settlesDate falls OUTSIDE the period
  deferredCount: number // how many of those txns are deferred
  sample: CategoryTxn[] // every period txn for this category (rows slice for display)
}

/** A category resolved for the active view (Behaviour/Payments). */
export interface ComputedCategory extends Category {
  amount: number // resolved for the active view
  shownCount: number // resolved count for the active view
  pct: number // share of the side total, 0..100
}
