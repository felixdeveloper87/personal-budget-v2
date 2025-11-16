import { Transaction } from '../../../types'

export interface CategoryExpenseChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

export interface CategoryExpenseItemProps {
  category: string
  amount: number
  percentage: number
  color: string
  onClick: () => void
}

