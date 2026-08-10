import { useMemo } from 'react'
import { Grid } from '@chakra-ui/react'
import { getAllExpenseCategoryLabels } from '../../../constants/transactionCategories'
import type { Transaction } from '../../../types'
import { getTransactionDate, type TransactionDateBasis } from '../../../utils/transactionDates'
import CashPace from './SpendingPace'

interface CategorySpendingPacesProps {
  transactions: Transaction[]
  selectedDate: Date
  dateBasis: TransactionDateBasis
}

interface CategorySeries {
  key: string
  name: string
  transactions: Transaction[]
  currentTotal: number
  previousTotal: number
}

const categoryKey = (category: string): string => category.trim().toLowerCase()

const isMonth = (date: Date, year: number, month: number): boolean =>
  date.getFullYear() === year && date.getMonth() === month

/** One Spending Pace chart for every expense category active this or last month. */
export default function CategorySpendingPaces({
  transactions,
  selectedDate,
  dateBasis,
}: CategorySpendingPacesProps) {
  const categories = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const previousDate = new Date(year, month - 1, 1)
    const groups = new Map<string, CategorySeries>(
      getAllExpenseCategoryLabels().map((name) => [
        categoryKey(name),
        {
          key: categoryKey(name),
          name,
          transactions: [],
          currentTotal: 0,
          previousTotal: 0,
        },
      ]),
    )

    for (const transaction of transactions) {
      if (transaction.type !== 'EXPENSE') continue

      const transactionDate = getTransactionDate(transaction, dateBasis)
      const isCurrent = isMonth(transactionDate, year, month)
      const isPrevious = isMonth(
        transactionDate,
        previousDate.getFullYear(),
        previousDate.getMonth(),
      )
      if (!isCurrent && !isPrevious) continue

      const name = transaction.category.trim() || 'Uncategorised'
      const key = categoryKey(name)
      const existing = groups.get(key)
      const group = existing ?? {
        key,
        name,
        transactions: [],
        currentTotal: 0,
        previousTotal: 0,
      }

      // Prefer the spelling used in the current month for the visible title.
      if (isCurrent) group.name = name
      group.transactions.push(transaction)
      if (isCurrent) group.currentTotal += transaction.amount
      if (isPrevious) group.previousTotal += transaction.amount
      groups.set(key, group)
    }

    return [...groups.values()].sort(
      (a, b) =>
        b.currentTotal - a.currentTotal
        || b.previousTotal - a.previousTotal
        || a.name.localeCompare(b.name),
    )
  }, [transactions, selectedDate, dateBasis])

  return (
    <Grid
      templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
      gap={{ base: 4, md: 5 }}
      alignItems="stretch"
    >
      {categories.map((category) => (
        <CashPace
          key={category.key}
          transactions={category.transactions}
          selectedDate={selectedDate}
          dateBasis={dateBasis}
          kind="expense"
          title={category.name}
          includeCommitments
        />
      ))}
    </Grid>
  )
}
