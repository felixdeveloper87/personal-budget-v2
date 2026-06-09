import type { Transaction } from '../types'

export type TransactionDateBasis = 'activity' | 'cash-flow'

export function getTransactionDateSource(
  transaction: Transaction,
  basis: TransactionDateBasis,
): string {
  if (basis === 'activity') {
    return transaction.transactionDate || transaction.dateTime
  }

  return transaction.paymentDate || transaction.transactionDate || transaction.dateTime
}

export function parseTransactionDateSource(source: string): Date {
  return source.length === 10
    ? new Date(`${source}T00:00:00`)
    : new Date(source)
}

export function getTransactionDate(
  transaction: Transaction,
  basis: TransactionDateBasis,
): Date {
  return parseTransactionDateSource(getTransactionDateSource(transaction, basis))
}

export function hasDifferentPaymentDate(transaction: Transaction): boolean {
  if (!transaction.paymentDate) return false

  const activityDate = getTransactionDateSource(transaction, 'activity').slice(0, 10)
  return transaction.paymentDate.slice(0, 10) !== activityDate
}
