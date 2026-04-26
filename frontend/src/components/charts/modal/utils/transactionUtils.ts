import { Transaction } from '../../../../types'

export interface CategoryData {
  category: string
  amount: number
  count: number
}

export interface DailyData {
  date: string
  income: number
  expense: number
  total?: number
}

export interface BalanceData {
  date: string
  balance: number
  income: number
  expense: number
}

/**
 * Process transactions by category
 */
export function processTransactionsByCategory(
  transactions: Transaction[]
): CategoryData[] {
  return transactions.reduce((acc: CategoryData[], transaction) => {
    const category = transaction.category || 'Uncategorized'
    const existing = acc.find((item) => item.category === category)
    
    if (existing) {
      existing.amount += transaction.amount
      existing.count += 1
    } else {
      acc.push({
        category,
        amount: transaction.amount,
        count: 1,
      })
    }
    
    return acc
  }, []).sort((a, b) => b.amount - a.amount)
}

/**
 * Process transactions by date (daily aggregation)
 */
export function processTransactionsByDate(
  transactions: Transaction[]
): DailyData[] {
  const dailyData = transactions.reduce((acc: DailyData[], transaction) => {
    const date = new Date(transaction.dateTime).toLocaleDateString('en-GB', { 
      month: 'short', 
      day: 'numeric' 
    })
    const existing = acc.find((item) => item.date === date)
    
    if (existing) {
      if (transaction.type === 'INCOME') {
        existing.income += transaction.amount
      } else {
        existing.expense += transaction.amount
      }
    } else {
      acc.push({
        date,
        income: transaction.type === 'INCOME' ? transaction.amount : 0,
        expense: transaction.type === 'EXPENSE' ? transaction.amount : 0,
      })
    }
    
    return acc
  }, [])
  
  // Sort by original transaction dates for proper chronological order
  return dailyData.sort((a, b) => {
    const transactionsA = transactions.filter(t => {
      const date = new Date(t.dateTime).toLocaleDateString('en-GB', { 
        month: 'short', 
        day: 'numeric' 
      })
      return date === a.date
    })
    const transactionsB = transactions.filter(t => {
      const date = new Date(t.dateTime).toLocaleDateString('en-GB', { 
        month: 'short', 
        day: 'numeric' 
      })
      return date === b.date
    })
    
    if (transactionsA.length > 0 && transactionsB.length > 0) {
      return new Date(transactionsA[0].dateTime).getTime() - new Date(transactionsB[0].dateTime).getTime()
    }
    return 0
  })
}

/**
 * Process balance data over time
 */
export function processBalanceData(
  transactions: Transaction[]
): { balanceData: BalanceData[]; totalIncome: number; totalExpenses: number; dailyComparison: DailyData[] } {
  const sortedTransactions = transactions.sort((a, b) => 
    new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  )

  const balanceData = sortedTransactions.reduce((acc: BalanceData[], transaction, index) => {
    const date = new Date(transaction.dateTime).toLocaleDateString('en-GB', { 
      month: 'short', 
      day: 'numeric' 
    })
    
    const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0
    const newBalance = previousBalance + (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount)
    
    acc.push({
      date,
      balance: newBalance,
      income: transaction.type === 'INCOME' ? transaction.amount : 0,
      expense: transaction.type === 'EXPENSE' ? transaction.amount : 0,
    })
    
    return acc
  }, [])

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const dailyComparison = balanceData.map(item => ({
    date: item.date,
    income: item.income,
    expense: item.expense,
    net: item.income - item.expense,
  }))

  return { balanceData, totalIncome, totalExpenses, dailyComparison }
}

/**
 * Calculate totals and averages
 */
export function calculateTotals(transactions: Transaction[]): {
  total: number
  average: number
  count: number
} {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0)
  const count = transactions.length
  const average = count > 0 ? total / count : 0
  
  return { total, average, count }
}

/**
 * Process categories with detailed transactions
 */
export interface CategoryWithTransactions {
  category: string
  total: number
  transactions: Transaction[]
}

export function processCategoriesWithTransactions(
  transactions: Transaction[]
): { sortedCategories: CategoryWithTransactions[]; total: number } {
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Uncategorized'
    if (!acc[category]) acc[category] = { total: 0, transactions: [] }
    acc[category].total += transaction.amount
    acc[category].transactions.push(transaction)
    return acc
  }, {} as Record<string, { total: number; transactions: Transaction[] }>)

  // Sort transactions within each category by date (newest first)
  Object.values(categoryTotals).forEach(cat =>
    cat.transactions.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
  )

  const sortedCategories = Object.entries(categoryTotals)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.total - a.total)

  const total = sortedCategories.reduce((sum, cat) => sum + cat.total, 0)
  return { sortedCategories, total }
}

