import type { Transaction } from '../types'
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

  const onDate =
    transaction.paymentDate && formatDateBR(transaction.paymentDate) !== 'Invalid Date'
      ? ` on ${formatDateBR(transaction.paymentDate)}`
      : ''

  if (transaction.type === 'INCOME') {
    return `${scheduled ? 'Will be paid' : 'Paid'} into ${transaction.accountName}${onDate}`
  }

  return `${scheduled ? 'Will be debited' : 'Debited'} from ${transaction.accountName}${onDate}`
}
