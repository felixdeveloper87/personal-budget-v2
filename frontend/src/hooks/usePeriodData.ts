import { useMemo } from 'react'
import { Transaction, MonthlySummary } from '../types'
import { PeriodType } from '../types'
import { getTransactionDate, type TransactionDateBasis } from '../utils/transactionDates'

export function getPreviousPeriodDate(date: Date, period: PeriodType): Date {
  const prev = new Date(date)
  switch (period) {
    case 'day':
      prev.setDate(date.getDate() - 1)
      break
    case 'week':
      prev.setDate(date.getDate() - 7)
      break
    case 'month':
      prev.setDate(1)
      prev.setMonth(prev.getMonth() - 1)
      break
    case 'year':
      prev.setFullYear(prev.getFullYear() - 1)
      break
  }
  return prev
}

export interface PeriodData {
  startDate: Date
  endDate: Date
  label: string
  transactions: Transaction[]
  income: number
  expense: number
  balance: number
}

export function usePeriodData(
  transactions: Transaction[],
  monthlySummary: MonthlySummary | null,
  selectedPeriod: PeriodType,
  selectedDate: Date,
  dateBasis: TransactionDateBasis = 'cash-flow',
): PeriodData {
  return useMemo(() => {
    // Force recalculation by creating new date objects
    const now = new Date(selectedDate.getTime())
    let startDate: Date
    let endDate: Date
    let label: string

    switch (selectedPeriod) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        label = now.toLocaleDateString('en-GB', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
        break

      case 'week':
        const dayOfWeek = now.getDay()
        const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - adjustedDayOfWeek)
        startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate())
        
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endDate = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate(), 23, 59, 59)
        
        label = `Week of ${startDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}`
        break

      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        label = now.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })
        break

      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        label = now.getFullYear().toString()
        break

      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        label = now.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })
    }

    // ✅ Filtro ajustado: trabalha apenas com "tx.dateTime"
    const periodTransactions = transactions.filter(tx => {
      const txDate = getTransactionDate(tx, dateBasis)
      return txDate >= startDate && txDate <= endDate
    })
    

    // ✅ Totais coerentes
    const income = periodTransactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const expense = periodTransactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const balance = income - expense

    return {
      startDate,
      endDate,
      label,
      transactions: periodTransactions,
      income,
      expense,
      balance
    }
  }, [transactions, selectedPeriod, selectedDate, dateBasis])
}
