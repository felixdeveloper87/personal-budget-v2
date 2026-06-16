import type { PaymentMethod, Transaction } from '../types'

// A credit-card statement (fatura): the set of transactions that fall within a
// single billing cycle, defined by the card's closing day. Mirrors the backend
// CreditCardBillingService so the cycle/payment dates stay consistent.

export type StatementStatus = 'open' | 'closed' | 'upcoming'

export interface CardStatement {
  /** Stable key, the statement's billing month: `YYYY-MM`. */
  key: string
  /** First day included in this cycle (day after the previous closing). */
  periodStart: Date
  /** Day the statement closes (last purchase day of the cycle). */
  closingDate: Date
  /** Day the balance is due. */
  paymentDate: Date
  status: StatementStatus
  total: number
  transactions: Transaction[]
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Days in a given month (month is 0-based). */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** A local Date at the given day, clamped to the month's length. */
function atClampedDay(year: number, month: number, day: number): Date {
  return new Date(year, month, Math.min(day, daysInMonth(year, month)))
}

/** Local midnight today, for status comparisons. */
function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Parse the date portion (yyyy-MM-dd) of a transaction into a local Date. */
function transactionDay(tx: Transaction): Date | null {
  const raw = tx.transactionDate ?? tx.paymentDate ?? tx.dateTime
  if (!raw) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

/**
 * Resolve the statement payment (due) date for a charge made on `purchaseDate`.
 * Mirrors the backend CreditCardBillingService.resolvePaymentDate so the preview
 * shown when creating an installment matches what the server will schedule.
 * Returns null if the card is missing its closing/payment days.
 */
export function resolveCardPaymentDate(purchaseDate: Date, card: PaymentMethod): Date | null {
  const closingDay = card.statementClosingDay
  const paymentDay = card.paymentDay
  if (!closingDay || !paymentDay) return null

  const year = purchaseDate.getFullYear()
  const month = purchaseDate.getMonth()
  const closingDate = atClampedDay(year, month, closingDay)

  // After the closing day → rolls into next month's statement.
  let stYear = year
  let stMonth = month
  if (purchaseDate.getTime() > closingDate.getTime()) {
    stMonth += 1
    if (stMonth > 11) {
      stMonth = 0
      stYear += 1
    }
  }

  // Payment falls in the statement month when the due day is on/after the closing
  // day, otherwise in the following month.
  let payYear = stYear
  let payMonth = stMonth
  if (paymentDay < closingDay) {
    payMonth += 1
    if (payMonth > 11) {
      payMonth = 0
      payYear += 1
    }
  }
  return atClampedDay(payYear, payMonth, paymentDay)
}

/**
 * Group a card's transactions into billing statements. Only expenses charged to
 * the given credit card are considered. Returns statements sorted newest-first.
 */
export function buildCardStatements(
  card: PaymentMethod,
  transactions: Transaction[],
): CardStatement[] {
  const closingDay = card.statementClosingDay ?? 1
  const paymentDay = card.paymentDay ?? closingDay

  const charges = transactions.filter(
    (tx) =>
      tx.paymentMethodId === card.id &&
      tx.type === 'EXPENSE',
  )

  const byMonth = new Map<string, Transaction[]>()

  for (const tx of charges) {
    const day = transactionDay(tx)
    if (!day) continue

    const txYear = day.getFullYear()
    const txMonth = day.getMonth()
    const closingThisMonth = atClampedDay(txYear, txMonth, closingDay)

    // After the closing day → rolls into next month's statement.
    let stYear = txYear
    let stMonth = txMonth
    if (day.getTime() > closingThisMonth.getTime()) {
      stMonth += 1
      if (stMonth > 11) {
        stMonth = 0
        stYear += 1
      }
    }

    const key = `${stYear}-${String(stMonth + 1).padStart(2, '0')}`
    const bucket = byMonth.get(key)
    if (bucket) bucket.push(tx)
    else byMonth.set(key, [tx])
  }

  const today = startOfToday()

  const statements: CardStatement[] = []
  for (const [key, txs] of byMonth) {
    const [stYear, stMonthOneBased] = key.split('-').map(Number)
    const stMonth = stMonthOneBased - 1

    const closingDate = atClampedDay(stYear, stMonth, closingDay)
    // Period start is the day after the *previous* cycle's closing.
    const prevClosing = atClampedDay(
      stMonth === 0 ? stYear - 1 : stYear,
      stMonth === 0 ? 11 : stMonth - 1,
      closingDay,
    )
    const start = new Date(prevClosing.getTime() + DAY_MS)

    // Payment month: if the payment day comes on/after the closing day it falls
    // in the same statement month, otherwise the following month.
    let payYear = stYear
    let payMonth = stMonth
    if (paymentDay < closingDay) {
      payMonth += 1
      if (payMonth > 11) {
        payMonth = 0
        payYear += 1
      }
    }
    const paymentDate = atClampedDay(payYear, payMonth, paymentDay)

    const total = txs.reduce((sum, tx) => sum + tx.amount, 0)
    const sortedTxs = [...txs].sort(
      (a, b) => (transactionDay(b)?.getTime() ?? 0) - (transactionDay(a)?.getTime() ?? 0),
    )

    statements.push({
      key,
      periodStart: start,
      closingDate,
      paymentDate,
      status: closingDate.getTime() < today.getTime() ? 'closed' : 'open',
      total,
      transactions: sortedTxs,
    })
  }

  // Newest first.
  statements.sort((a, b) => b.closingDate.getTime() - a.closingDate.getTime())

  // Among the non-closed statements, only the earliest closing one is the
  // current "open" statement; later ones are future ("upcoming").
  const openOnes = statements
    .filter((s) => s.status === 'open')
    .sort((a, b) => a.closingDate.getTime() - b.closingDate.getTime())
  openOnes.forEach((s, index) => {
    if (index > 0) s.status = 'upcoming'
  })

  return statements
}
