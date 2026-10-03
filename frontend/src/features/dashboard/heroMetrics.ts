import type { Transaction } from '../../types'

/** Same rules as the mobile app (mobile/src/utils/variableSpending.ts, monthToDate.ts). */

function isCommitment(transaction: Transaction) {
  return Boolean(transaction.isInstallment)
    || transaction.installmentPlanId != null
    || Boolean(transaction.isRecurring)
    || transaction.recurringTransactionId != null
}

/** Purchase date; date-only values are a local calendar date, not midnight UTC. */
function occurredOn(transaction: Transaction) {
  const source = transaction.transactionDate ?? transaction.dateTime
  return source.length === 10 ? new Date(`${source}T00:00:00`) : new Date(source)
}

function sumThroughDay(
  transactions: Transaction[],
  include: (transaction: Transaction) => boolean,
  year: number,
  month: number,
  lastDay: number,
) {
  let totalCents = 0
  for (const transaction of transactions) {
    if (transaction.status === 'PLANNED' || !include(transaction)) continue
    const occurred = occurredOn(transaction)
    if (occurred.getFullYear() !== year || occurred.getMonth() !== month || occurred.getDate() > lastDay) continue
    const amount = Number(transaction.amount)
    if (Number.isFinite(amount)) totalCents += Math.round(amount * 100)
  }
  return totalCents / 100
}

/** Everyday (variable) spending so far this month, excluding installments and fixed payments. */
export function getVariableSpending(transactions: Transaction[], date: Date) {
  const elapsedDays = date.getDate()
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const spent = sumThroughDay(
    transactions,
    (transaction) => transaction.type === 'EXPENSE' && !isCommitment(transaction),
    date.getFullYear(),
    date.getMonth(),
    elapsedDays,
  )
  const dailyAverage = spent / elapsedDays
  const projection = dailyAverage * daysInMonth
  return {
    spent,
    dailyAverage,
    projection,
    elapsedDays,
    daysInMonth,
    share: projection > 0 ? Math.min(1, Math.max(0, spent / projection)) : 0,
  }
}

/** Like-for-like: day 1..N of this month vs day 1..N of last month (N clamped to last month's length). */
export function getMonthToDateComparison(transactions: Transaction[], type: Transaction['type'], date: Date) {
  const day = date.getDate()
  const previousYear = date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear()
  const previousMonth = (date.getMonth() + 11) % 12
  const previousDays = new Date(previousYear, previousMonth + 1, 0).getDate()
  const ofType = (transaction: Transaction) => transaction.type === type

  return {
    current: sumThroughDay(transactions, ofType, date.getFullYear(), date.getMonth(), day),
    previous: sumThroughDay(transactions, ofType, previousYear, previousMonth, Math.min(day, previousDays)),
  }
}
