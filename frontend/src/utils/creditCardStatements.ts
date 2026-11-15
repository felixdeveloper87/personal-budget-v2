import type { CardStatementResponse, PaymentMethod, Transaction } from '../types'

// A credit-card statement (fatura): the transactions that fall within a single
// billing cycle, defined by the card's closing day. Statements are computed on
// the server (CreditCardStatementCalculator); this module only adapts them and
// previews the due date of a purchase that has not been saved yet.

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

/** Days in a given month (month is 0-based). */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** A local Date at the given day, clamped to the month's length. */
function atClampedDay(year: number, month: number, day: number): Date {
  return new Date(year, month, Math.min(day, daysInMonth(year, month)))
}

/** `yyyy-MM-dd` → local midnight (not UTC, so the day never shifts). */
export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** `Date` → `yyyy-MM-dd` in local time. */
export function toIsoDay(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

/** Adapts a statement from the API (string dates) to the shape the UI renders. */
export function toCardStatement(statement: CardStatementResponse): CardStatement {
  return {
    key: statement.key,
    periodStart: parseLocalDate(statement.periodStart),
    closingDate: parseLocalDate(statement.closingDate),
    paymentDate: parseLocalDate(statement.paymentDate),
    status: statement.status,
    total: Number(statement.total),
    transactions: statement.transactions,
  }
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
