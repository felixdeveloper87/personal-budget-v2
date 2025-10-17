import { useMemo } from 'react'
import { Transaction } from '../types'

interface TransactionInsights {
  totalTransactions: number
  averageTransaction: number
  highestTransaction: Transaction | null
  lowestTransaction: Transaction | null
  mostActiveDay: string | null
  mostActiveMonth: string | null
  totalIncome: number
  totalExpense: number
  netBalance: number
  mostUsedCategory: string | null
  transactionTrend: 'increasing' | 'decreasing' | 'stable'
  averageIncomePerDay: number
  averageExpensePerDay: number
  insights: string[]
}

export function useTransactionInsights(transactions: Transaction[], selectedPeriod: string) {
  return useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalTransactions: 0,
        averageTransaction: 0,
        highestTransaction: null,
        lowestTransaction: null,
        mostActiveDay: null,
        mostActiveMonth: null,
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        mostUsedCategory: null,
        transactionTrend: 'stable' as const,
        averageIncomePerDay: 0,
        averageExpensePerDay: 0,
        insights: ['No transactions found for this period']
      }
    }

    // Basic analysis
    const totalTransactions = transactions.length
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
    const averageTransaction = totalAmount / totalTransactions

    // Highest and lowest transactions
    const highestTransaction = transactions.reduce((max, t) => 
      t.amount > max.amount ? t : max, transactions[0])
    const lowestTransaction = transactions.reduce((min, t) => 
      t.amount < min.amount ? t : min, transactions[0])

    // Analysis by day of week
    const dayCounts: { [key: string]: number } = {}
    transactions.forEach(t => {
      const day = new Date(t.dateTime).toLocaleDateString('en-US', { weekday: 'long' })
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })
    const mostActiveDay = Object.entries(dayCounts).reduce((a, b) => 
      dayCounts[a[0]] > dayCounts[b[0]] ? a : b)[0]

    // Analysis by month
    const monthCounts: { [key: string]: number } = {}
    transactions.forEach(t => {
      const month = new Date(t.dateTime).toLocaleDateString('en-US', { month: 'long' })
      monthCounts[month] = (monthCounts[month] || 0) + 1
    })
    const mostActiveMonth = Object.entries(monthCounts).reduce((a, b) => 
      monthCounts[a[0]] > monthCounts[b[0]] ? a : b)[0]

    // Income and expense analysis
    const incomeTransactions = transactions.filter(t => t.type === 'INCOME')
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE')
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    const netBalance = totalIncome - totalExpense

    // Most used category
    const categoryCounts: { [key: string]: number } = {}
    transactions.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1
    })
    const mostUsedCategory = Object.entries(categoryCounts).reduce((a, b) => 
      categoryCounts[a[0]] > categoryCounts[b[0]] ? a : b)[0]?.[0]

    // Transaction trend (comparing first and second half of period)
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    const midPoint = Math.floor(sortedTransactions.length / 2)
    const firstHalf = sortedTransactions.slice(0, midPoint)
    const secondHalf = sortedTransactions.slice(midPoint)
    
    const firstHalfAvg = firstHalf.reduce((sum, t) => sum + t.amount, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, t) => sum + t.amount, 0) / secondHalf.length
    
    let transactionTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (secondHalfAvg > firstHalfAvg * 1.1) transactionTrend = 'increasing'
    else if (secondHalfAvg < firstHalfAvg * 0.9) transactionTrend = 'decreasing'

    // Generate insights based on data
    const insights: string[] = []

    // General insights
    if (totalTransactions > 0) {
      insights.push(`You made ${totalTransactions} transaction${totalTransactions > 1 ? 's' : ''} in this period`)
    }

    if (averageTransaction > 0) {
      insights.push(`Average transaction value: £${averageTransaction.toFixed(2)}`)
    }

    if (mostActiveDay) {
      insights.push(`${mostActiveDay.charAt(0).toUpperCase() + mostActiveDay.slice(1)} was the most active day`)
    }

    if (mostActiveMonth) {
      insights.push(`${mostActiveMonth.charAt(0).toUpperCase() + mostActiveMonth.slice(1)} was the most active month`)
    }

    if (highestTransaction) {
      const type = highestTransaction.type === 'INCOME' ? 'received' : 'spent'
      const date = new Date(highestTransaction.dateTime).toLocaleDateString('en-US')
      insights.push(`On ${date} you ${type} £${highestTransaction.amount.toFixed(2)}`)
    }

    if (mostUsedCategory) {
      insights.push(`Most used category: ${mostUsedCategory}`)
    }

    // Trend insights
    if (transactionTrend === 'increasing') {
      insights.push('📈 Your transactions are increasing over time')
    } else if (transactionTrend === 'decreasing') {
      insights.push('📉 Your transactions are decreasing over time')
    }

    // Balance insights
    if (netBalance > 0) {
      insights.push(`💰 Positive balance: £${netBalance.toFixed(2)}`)
    } else if (netBalance < 0) {
      insights.push(`⚠️ Negative balance: £${Math.abs(netBalance).toFixed(2)}`)
    }

    // Calculate average income per day with actual income
    const getAverageIncomePerDay = () => {
      if (incomeTransactions.length === 0) return 0
      
      // Get unique days that had income transactions
      const incomeDays = new Set(
        incomeTransactions.map(t => 
          new Date(t.dateTime).toLocaleDateString('en-US')
        )
      )
      
      return totalIncome / incomeDays.size
    }

    // Calculate average expense per day with actual expenses
    const getAverageExpensePerDay = () => {
      if (expenseTransactions.length === 0) return 0
      
      // Get unique days that had expense transactions
      const expenseDays = new Set(
        expenseTransactions.map(t => 
          new Date(t.dateTime).toLocaleDateString('en-US')
        )
      )
      
      return totalExpense / expenseDays.size
    }

    return {
      totalTransactions,
      averageTransaction,
      highestTransaction,
      lowestTransaction,
      mostActiveDay,
      mostActiveMonth,
      totalIncome,
      totalExpense,
      netBalance,
      mostUsedCategory,
      transactionTrend,
      averageIncomePerDay: getAverageIncomePerDay(),
      averageExpensePerDay: getAverageExpensePerDay(),
      insights
    }
  }, [transactions, selectedPeriod])
}
