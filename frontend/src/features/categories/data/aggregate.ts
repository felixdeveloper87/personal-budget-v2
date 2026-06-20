import type { Transaction } from '../../../types'
import {
  getTransactionDate,
  getTransactionDateSource,
} from '../../../utils/transactionDates'
import { colorForCategory, iconForCategory } from './categoryMeta'
import type { Category, CategoryTxn, Side } from './types'

const within = (d: Date, start: Date, end: Date) => d >= start && d <= end

/**
 * Aggregate raw transactions into the Category model for one side and period.
 *
 * Membership is anchored on the **Behaviour** clock (purchase/activity date in
 * range), matching the prototype. `deferred` captures the slice whose payment
 * date falls outside the period — that's what `computeSide` subtracts under the
 * Payments view.
 *
 * v1 simplification (per the build spec): the Payments view here is
 * "in-period purchases that settle in-period" and does not pull in prior-month
 * purchases that settle this month. The honest settlement-window grouping
 * belongs on the API when this is wired to the backend.
 */
export function aggregateSide(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date,
  side: Side,
): Category[] {
  const type = side === 'expense' ? 'EXPENSE' : 'INCOME'
  const groups = new Map<string, Category>()

  for (const tx of transactions) {
    if (tx.type !== type) continue
    const purchaseDate = getTransactionDate(tx, 'activity')
    if (!within(purchaseDate, startDate, endDate)) continue

    const name = tx.category?.trim() || 'Uncategorised'
    const key = name.toLowerCase()

    let cat = groups.get(key)
    if (!cat) {
      cat = {
        id: key,
        name,
        icon: iconForCategory(name),
        color: colorForCategory(name),
        kind: side,
        count: 0,
        total: 0,
        deferred: 0,
        deferredCount: 0,
        sample: [],
      }
      groups.set(key, cat)
    }

    const settlesIso = getTransactionDateSource(tx, 'cash-flow').slice(0, 10)
    const settlesDate = getTransactionDate(tx, 'cash-flow')
    const isDeferred = !within(settlesDate, startDate, endDate)

    cat.count += 1
    cat.total += tx.amount
    if (isDeferred) {
      cat.deferred += tx.amount
      cat.deferredCount += 1
    }

    const sampleTxn: CategoryTxn = {
      id: String(tx.id ?? `${key}-${cat.sample.length}`),
      merchant: tx.description?.trim() || name,
      amount: tx.amount,
      purchaseDate: getTransactionDateSource(tx, 'activity').slice(0, 10),
      settlesDate: settlesIso,
      account: tx.accountName || tx.paymentMethodName || '—',
      deferred: isDeferred,
    }
    cat.sample.push(sampleTxn)
  }

  // Newest first inside each expand.
  for (const cat of groups.values()) {
    cat.sample.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
  }

  return [...groups.values()]
}
