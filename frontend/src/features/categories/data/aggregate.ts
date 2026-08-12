import type { Transaction } from '../../../types'
import { getTransactionDateSource } from '../../../utils/transactionDates'
import { colorForCategory, iconForCategory } from './categoryMeta'
import type { Category, CategoryTxn, Side } from './types'

/** Aggregate transactions already filtered for the selected period and view. */
export function aggregateSide(transactions: Transaction[], side: Side): Category[] {
  const type = side === 'expense' ? 'EXPENSE' : 'INCOME'
  const groups = new Map<string, Category>()

  for (const tx of transactions) {
    if (tx.type !== type) continue

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
        sample: [],
      }
      groups.set(key, cat)
    }

    cat.count += 1
    cat.total += tx.amount

    const description = tx.description?.trim()
    const sampleTxn: CategoryTxn = {
      id: String(tx.id ?? `${key}-${cat.sample.length}`),
      merchant: description || name,
      merchantIsCategory: !description,
      amount: tx.amount,
      purchaseDate: getTransactionDateSource(tx, 'activity').slice(0, 10),
      settlesDate: getTransactionDateSource(tx, 'cash-flow').slice(0, 10),
      account: tx.accountName || tx.paymentMethodName || '—',
    }
    cat.sample.push(sampleTxn)
  }

  for (const cat of groups.values()) {
    cat.sample.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
  }

  return [...groups.values()]
}
