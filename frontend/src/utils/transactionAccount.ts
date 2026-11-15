import type { FinancialAccount, Transaction } from '../types'
import { translateNow } from '../i18n'
import { formatDateBR } from './dateTime'

function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatTransactionAccount(
  transaction: Pick<
    Transaction,
    'type' | 'accountName' | 'status' | 'paymentDate' | 'isFutureInstallment'
  >,
): string | null {
  if (!transaction.accountName) return null

  const scheduled =
    transaction.isFutureInstallment ||
    transaction.status === 'PLANNED' ||
    transaction.status === 'PENDING' ||
    Boolean(transaction.paymentDate && transaction.paymentDate > localDateKey())

  const formattedDate = transaction.paymentDate
    ? formatDateBR(transaction.paymentDate)
    : null
  const invalidDate = translateNow('date.invalid', undefined, 'Invalid date')
  const onDate = formattedDate && formattedDate !== invalidDate
    ? translateNow('transaction.account.onDate', { date: formattedDate })
    : ''

  if (transaction.type === 'INCOME') {
    return translateNow(
      scheduled ? 'transaction.account.income.scheduled' : 'transaction.account.income.paid',
      { account: transaction.accountName, date: onDate },
    )
  }

  return translateNow(
    scheduled ? 'transaction.account.expense.scheduled' : 'transaction.account.expense.paid',
    { account: transaction.accountName, date: onDate },
  )
}

/**
 * Accounts a transaction (income or expense) can be booked against.
 * Savings accounts only move money through transfers, so they are left out;
 * `keepId` keeps an already-linked account visible when editing older records.
 */
export function transactionAccountOptions<T extends Pick<FinancialAccount, 'id' | 'type' | 'active'>>(
  accounts: T[],
  keepId: number | null = null,
): T[] {
  return accounts.filter(
    (account) => (account.active && account.type !== 'SAVINGS') || (keepId !== null && account.id === keepId),
  )
}
