import { useMemo } from 'react'
import type {
  InstallmentPlan,
  PeriodType,
  RecurringTransaction,
  Transaction,
  TransactionType,
} from '../types'
import { calculateFutureInstallments } from '../utils/installments'

export interface ForecastPoint {
  date: string
  label: string
  balance: number
  income: number
  expense: number
  projected: boolean
}

export interface ForecastEvent {
  id: string
  date: string
  label: string
  type: TransactionType
  amount: number
  category: string
  description: string
  source: 'planned' | 'recurring' | 'installment' | 'predicted-income'
}

export interface CashflowForecast {
  monthLabel: string
  points: ForecastPoint[]
  currentBalance: number
  projectedBalance: number
  projectedChange: number
  upcomingIncomeTotal: number
  upcomingExpenseTotal: number
  predictedIncomeTotal: number
  nextIncome: ForecastEvent | null
  upcomingEvents: ForecastEvent[]
  riskDay: ForecastPoint | null
  lowBalanceDay: ForecastPoint | null
}

const LOW_BALANCE_THRESHOLD = 500

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

function dateFromString(value: string): Date {
  return value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value)
}

function transactionDate(transaction: Transaction): Date {
  return dateFromString(transaction.paymentDate || transaction.transactionDate || transaction.dateTime)
}

function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatPeriodLabel(date: Date, periodType: PeriodType): string {
  switch (periodType) {
    case 'day':
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    case 'week': {
      const { start, end } = getPeriodRange(date, 'week')
      return `${formatDay(start)} - ${formatDay(end)}`
    }
    case 'year':
      return date.getFullYear().toString()
    case 'month':
    default:
      return formatMonth(date)
  }
}

function getPeriodRange(date: Date, periodType: PeriodType): { start: Date; end: Date } {
  switch (periodType) {
    case 'day':
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      }
    case 'week': {
      const start = startOfDay(date)
      const day = start.getDay()
      const shift = day === 0 ? -6 : 1 - day
      start.setDate(start.getDate() + shift)
      const end = endOfDay(new Date(start))
      end.setDate(start.getDate() + 6)
      return { start, end }
    }
    case 'year':
      return {
        start: startOfDay(new Date(date.getFullYear(), 0, 1)),
        end: endOfDay(new Date(date.getFullYear(), 11, 31)),
      }
    case 'month':
    default:
      return {
        start: startOfDay(new Date(date.getFullYear(), date.getMonth(), 1)),
        end: endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
      }
  }
}

function isSameDate(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b)
}

function isWithin(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end
}

function transactionToEvent(transaction: Transaction, source: ForecastEvent['source']): ForecastEvent {
  const date = transactionDate(transaction)

  return {
    id: `${source}-${transaction.id ?? transaction.description}-${dateKey(date)}`,
    date: dateKey(date),
    label: formatDay(date),
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category || 'Uncategorized',
    description: transaction.description || transaction.category || 'Transaction',
    source,
  }
}

function recurringToEvent(
  recurring: RecurringTransaction,
  eventDate: Date,
): ForecastEvent {
  return {
    id: `recurring-${recurring.id}-${dateKey(eventDate)}`,
    date: dateKey(eventDate),
    label: formatDay(eventDate),
    type: recurring.type,
    amount: recurring.amount,
    category: recurring.category || 'Fixed payment',
    description: recurring.description || recurring.category || 'Fixed payment',
    source: 'recurring',
  }
}

function predictedIncomeToEvent(transaction: Transaction, eventDate: Date): ForecastEvent {
  return {
    id: `predicted-income-${transaction.id ?? transaction.description}-${dateKey(eventDate)}`,
    date: dateKey(eventDate),
    label: formatDay(eventDate),
    type: 'INCOME',
    amount: transaction.amount,
    category: transaction.category || 'Income',
    description: transaction.description
      ? `${transaction.description} estimate`
      : 'Income estimate',
    source: 'predicted-income',
  }
}

function hasMatchingRecurringTransaction(
  transactions: Transaction[],
  recurring: RecurringTransaction,
  eventDate: Date,
): boolean {
  return transactions.some((transaction) => {
    if (transaction.recurringTransactionId !== recurring.id) return false
    return isSameDate(transactionDate(transaction), eventDate)
  })
}

function buildRecurringEvents(
  recurringTransactions: RecurringTransaction[],
  transactions: Transaction[],
  anchorDate: Date,
  periodStart: Date,
  periodEnd: Date,
): ForecastEvent[] {
  const events: ForecastEvent[] = []

  recurringTransactions
    .filter((recurring) => recurring.active)
    .forEach((recurring) => {
      const recurringStart = startOfDay(dateFromString(recurring.startDate))
      const recurringEnd = recurring.endDate ? endOfDay(dateFromString(recurring.endDate)) : null
      const cursor = startOfDay(new Date(periodStart.getFullYear(), periodStart.getMonth(), 1))

      while (cursor <= periodEnd) {
        const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
        const eventDay = Math.min(recurring.dayOfMonth || 1, daysInMonth)
        const eventDate = startOfDay(new Date(cursor.getFullYear(), cursor.getMonth(), eventDay))

        if (
          eventDate > anchorDate &&
          isWithin(eventDate, periodStart, periodEnd) &&
          eventDate >= recurringStart &&
          (!recurringEnd || eventDate <= recurringEnd) &&
          !hasMatchingRecurringTransaction(transactions, recurring, eventDate)
        ) {
          events.push(recurringToEvent(recurring, eventDate))
        }

        cursor.setMonth(cursor.getMonth() + 1)
      }
    })

  return events
}

function buildFutureInstallmentEvents(
  installmentPlans: InstallmentPlan[],
  anchorDate: Date,
  periodStart: Date,
  periodEnd: Date,
): ForecastEvent[] {
  return calculateFutureInstallments(installmentPlans)
    .filter((transaction) => {
      const date = transactionDate(transaction)
      return date > anchorDate && isWithin(date, periodStart, periodEnd)
    })
    .map((transaction) => transactionToEvent(transaction, 'installment'))
}

function buildPreviousMonthIncomeEvents(
  transactions: Transaction[],
  existingFutureEvents: ForecastEvent[],
  anchorDate: Date,
  periodStart: Date,
  periodEnd: Date,
  periodType: PeriodType,
): ForecastEvent[] {
  if (periodType !== 'month') return []

  const hasFutureIncome = existingFutureEvents.some((event) => event.type === 'INCOME')
  if (hasFutureIncome) return []

  const previousMonthStart = startOfDay(
    new Date(periodStart.getFullYear(), periodStart.getMonth() - 1, 1),
  )
  const previousMonthEnd = endOfDay(
    new Date(periodStart.getFullYear(), periodStart.getMonth(), 0),
  )
  const daysInTargetMonth = new Date(
    periodStart.getFullYear(),
    periodStart.getMonth() + 1,
    0,
  ).getDate()

  return transactions
    .filter((transaction) => {
      if (transaction.type !== 'INCOME') return false
      const date = transactionDate(transaction)
      return isWithin(date, previousMonthStart, previousMonthEnd)
    })
    .map((transaction) => {
      const previousDate = transactionDate(transaction)
      const targetDay = Math.min(previousDate.getDate(), daysInTargetMonth)
      const eventDate = startOfDay(
        new Date(periodStart.getFullYear(), periodStart.getMonth(), targetDay),
      )

      if (eventDate <= anchorDate || !isWithin(eventDate, periodStart, periodEnd)) {
        return null
      }

      return predictedIncomeToEvent(transaction, eventDate)
    })
    .filter((event): event is ForecastEvent => event !== null)
}

export function useCashflowForecast(
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  installmentPlans: InstallmentPlan[],
  selectedDate: Date,
  periodType: PeriodType = 'month',
): CashflowForecast {
  return useMemo(() => {
    const { start: periodStart, end: periodEnd } = getPeriodRange(selectedDate, periodType)
    const today = startOfDay(new Date())

    const selectedMonthIsPast = periodEnd < today
    const selectedMonthIsFuture = periodStart > today
    const anchorDate = selectedMonthIsPast
      ? periodEnd
      : selectedMonthIsFuture
        ? new Date(periodStart.getTime() - 1)
        : today

    const actualEvents = transactions
      .filter((transaction) => {
        const date = transactionDate(transaction)
        return isWithin(date, periodStart, periodEnd) && date <= anchorDate
      })
      .map((transaction) => transactionToEvent(transaction, 'planned'))

    const plannedFutureEvents = transactions
      .filter((transaction) => {
        const date = transactionDate(transaction)
        return isWithin(date, periodStart, periodEnd) && date > anchorDate
      })
      .map((transaction) => transactionToEvent(transaction, 'planned'))

    const recurringEvents = buildRecurringEvents(
      recurringTransactions,
      transactions,
      anchorDate,
      periodStart,
      periodEnd,
    )

    const installmentEvents = buildFutureInstallmentEvents(
      installmentPlans,
      anchorDate,
      periodStart,
      periodEnd,
    )

    const knownFutureEvents = [
      ...plannedFutureEvents,
      ...recurringEvents,
      ...installmentEvents,
    ]

    const predictedIncomeEvents = buildPreviousMonthIncomeEvents(
      transactions,
      knownFutureEvents,
      anchorDate,
      periodStart,
      periodEnd,
      periodType,
    )

    const allEvents = [
      ...actualEvents,
      ...knownFutureEvents,
      ...predictedIncomeEvents,
    ].sort((a, b) => a.date.localeCompare(b.date))

    const points: ForecastPoint[] = []
    let runningBalance = 0
    const day = new Date(periodStart)

    while (day <= periodEnd) {
      const key = dateKey(day)
      const dayEvents = allEvents.filter((event) => event.date === key)
      const income = dayEvents
        .filter((event) => event.type === 'INCOME')
        .reduce((sum, event) => sum + event.amount, 0)
      const expense = dayEvents
        .filter((event) => event.type === 'EXPENSE')
        .reduce((sum, event) => sum + event.amount, 0)

      runningBalance += income - expense

      points.push({
        date: key,
        label: formatDay(day),
        balance: runningBalance,
        income,
        expense,
        projected: day > anchorDate,
      })

      day.setDate(day.getDate() + 1)
    }

    const currentPoint = [...points].reverse().find((point) => point.date <= dateKey(anchorDate))
    const currentBalance = currentPoint?.balance ?? 0
    const projectedBalance = points[points.length - 1]?.balance ?? currentBalance

    const upcomingEvents = allEvents
      .filter((event) => dateFromString(event.date) > anchorDate)
      .sort((a, b) => a.date.localeCompare(b.date))

    const riskDay = points.find((point) => point.balance < 0) ?? null
    const lowBalanceDay =
      riskDay ??
      points.find((point) => point.balance > 0 && point.balance < LOW_BALANCE_THRESHOLD) ??
      null

    return {
      monthLabel: formatPeriodLabel(selectedDate, periodType),
      points,
      currentBalance,
      projectedBalance,
      projectedChange: projectedBalance - currentBalance,
      upcomingIncomeTotal: upcomingEvents
        .filter((event) => event.type === 'INCOME')
        .reduce((sum, event) => sum + event.amount, 0),
      upcomingExpenseTotal: upcomingEvents
        .filter((event) => event.type === 'EXPENSE')
        .reduce((sum, event) => sum + event.amount, 0),
      predictedIncomeTotal: predictedIncomeEvents.reduce((sum, event) => sum + event.amount, 0),
      nextIncome: upcomingEvents.find((event) => event.type === 'INCOME') ?? null,
      upcomingEvents: upcomingEvents.slice(0, 5),
      riskDay,
      lowBalanceDay,
    }
  }, [installmentPlans, periodType, recurringTransactions, selectedDate, transactions])
}
