import { Transaction } from '../../../types'

export interface CategoryIncomeChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

export interface CategoryIncomeItemProps {
  category: string
  amount: number
  percentage: number
  color: string
  onClick: () => void
  isExpanded?: boolean
  transactions?: Transaction[]
}

