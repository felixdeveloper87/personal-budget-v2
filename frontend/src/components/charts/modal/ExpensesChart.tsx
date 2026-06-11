import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { VStack, Box, useColorModeValue } from '@chakra-ui/react'
import { useMemo } from 'react'
import type { PeriodType, Transaction } from '../../../types'
import type { TransactionDateBasis } from '../../../utils/transactionDates'
import { TrendingDown } from '../../ui/icons'
import { useChartColors, useChartDimensions } from './hooks'
import {
  ChartPlotShell,
  ChartEmptyState,
  PeriodBucketBarChart,
} from './components'
import CategoryTransactionDropdown from '../../categories/CategoryTransactionDropdown'
import { processCategoriesWithTransactions } from './utils'

export interface ExpensesChartProps {
  transactions: Transaction[]
  selectedPeriod: string
  showPeriodBadge?: boolean
  periodType?: PeriodType
  selectedDate?: Date
  dateBasis?: TransactionDateBasis
  compact?: boolean
}

export default function ExpensesChart({
  transactions,
  selectedPeriod,
  showPeriodBadge = true,
  periodType,
  selectedDate,
  dateBasis = 'cash-flow',
  compact = false,
}: ExpensesChartProps) {
  const chartColors = useChartColors()
  const { smallChartHeight, pieOuterRadius } = useChartDimensions()

  const legendHoverBg = useColorModeValue(
    'rgba(239, 68, 68, 0.08)',
    'rgba(248, 113, 113, 0.12)',
  )

  const expenseTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'EXPENSE'),
    [transactions],
  )

  const { sortedCategories: categoryData, total: totalExpenses } = useMemo(
    () => processCategoriesWithTransactions(expenseTransactions),
    [expenseTransactions],
  )

  const pieData = useMemo(
    () =>
      categoryData.map((item, index) => ({
        name: item.category,
        value: item.total,
        transactions: item.transactions,
        color: `hsl(${(index * 137.5) % 360}, 58%, 52%)`,
      })),
    [categoryData],
  )

  if (expenseTransactions.length === 0) {
    return (
      <ChartEmptyState
        icon={TrendingDown}
        title="No expenses in this period"
        description="Log spending or change the date range to see distribution."
      />
    )
  }

  return (
    <VStack spacing={{ base: 4, sm: 5 }} align="stretch">
      {periodType && selectedDate && (
        <PeriodBucketBarChart
          transactions={transactions}
          periodType={periodType}
          selectedDate={selectedDate}
          filter="EXPENSE"
          accent="red"
          dateBasis={dateBasis}
        />
      )}

      <ChartPlotShell
        title="Expense distribution"
        caption="Share of spending by category"
        selectedPeriod={selectedPeriod}
        showPeriodBadge={showPeriodBadge}
        badgeBg={chartColors.redBadgeBg}
        badgeColor={chartColors.redBadgeColor}
        compact={compact}
      >
        <ResponsiveContainer width="100%" height={compact ? 190 : smallChartHeight}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={compact ? Math.min(pieOuterRadius, 72) : pieOuterRadius}
              innerRadius={Math.round((compact ? Math.min(pieOuterRadius, 72) : pieOuterRadius) * 0.52)}
              paddingAngle={2}
              cornerRadius={4}
              dataKey="value"
              stroke={chartColors.cardBg}
              strokeWidth={2}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <Box mt={compact ? 2 : 4}>
          <VStack spacing={2} align="stretch">
            {pieData.map((entry, index) => {
              const percentage = ((entry.value / totalExpenses) * 100).toFixed(1)
              return (
                <CategoryTransactionDropdown
                  key={`legend-${index}`}
                  category={entry.name}
                  amount={entry.value}
                  percentage={percentage}
                  color={entry.color}
                  transactions={entry.transactions}
                  borderColor={chartColors.borderColor}
                  hoverBg={legendHoverBg}
                  badgeBg={chartColors.grayBadgeBg}
                  accentScheme="red"
                />
              )
            })}
          </VStack>
        </Box>
      </ChartPlotShell>
    </VStack>
  )
}
