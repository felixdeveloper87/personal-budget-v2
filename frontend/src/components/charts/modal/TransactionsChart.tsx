import { VStack } from '@chakra-ui/react'
import type { PeriodType } from '../../../types'
import { ChartEmptyState, PeriodBucketBarChart } from './components'

export interface TransactionsChartProps {
  transactions: any[]
  selectedPeriod: string
  /**
   * When false, period pills inside the plot are hidden (e.g. the Charts page
   * already shows the range in the section header).
   */
  showPeriodBadge?: boolean
  /**
   * When `periodType` and `selectedDate` are provided, the compact period
   * bucket bar chart (today / this week / this month / this year) is
   * rendered. Without these props the chart has nothing to show — the
   * summary KPIs are now hoisted into the section/modal header.
   */
  periodType?: PeriodType
  selectedDate?: Date
}

export default function TransactionsChart({
  transactions,
  periodType,
  selectedDate,
}: TransactionsChartProps) {
  if (transactions.length === 0) {
    return (
      <ChartEmptyState
        title="No transactions in this range"
        description="Pick another period or log income and expenses to see activity here."
      />
    )
  }

  if (!periodType || !selectedDate) {
    return (
      <ChartEmptyState
        title="Pick a period to see activity"
        description="Switch between day, week, month or year to visualise transactions."
      />
    )
  }

  return (
    <VStack spacing={{ base: 4, sm: 5 }} align="stretch">
      <PeriodBucketBarChart
        transactions={transactions}
        periodType={periodType}
        selectedDate={selectedDate}
        filter="ALL"
        accent="violet"
      />
    </VStack>
  )
}
