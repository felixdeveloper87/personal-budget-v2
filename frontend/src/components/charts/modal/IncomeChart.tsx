import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { VStack, Box } from '@chakra-ui/react'
import { useMemo } from 'react'
import type { PeriodType, Transaction } from '../../../types'
import type { TransactionDateBasis } from '../../../utils/transactionDates'
import { TrendingUp } from '../../ui/icons'
import { useChartColors, useChartDimensions } from './hooks'
import {
  ChartPlotShell,
  ChartEmptyState,
  IncomeInsights,
  PeriodBucketBarChart,
} from './components'
import CategoryTransactionDropdown from '../../categories/CategoryTransactionDropdown'
import { processCategoriesWithTransactions } from './utils'

export interface IncomeChartProps {
  transactions: Transaction[]
  selectedPeriod: string
  showPeriodBadge?: boolean
  periodType?: PeriodType
  selectedDate?: Date
  dateBasis?: TransactionDateBasis
  compact?: boolean
}

export default function IncomeChart({
  transactions,
  selectedPeriod,
  showPeriodBadge = true,
  periodType,
  selectedDate,
  dateBasis = 'cash-flow',
  compact = false,
}: IncomeChartProps) {
  const chartColors = useChartColors()
  const { smallChartHeight, pieOuterRadius } = useChartDimensions()

  const incomeTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'INCOME'),
    [transactions],
  )

  const { sortedCategories: categoryData, total: totalIncome } = useMemo(
    () => processCategoriesWithTransactions(incomeTransactions),
    [incomeTransactions],
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

  if (incomeTransactions.length === 0) {
    return (
      <ChartEmptyState
        icon={TrendingUp}
        title="No income in this period"
        description="Record income or pick a different range to see category splits."
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
          filter="INCOME"
          accent="green"
          dateBasis={dateBasis}
        />
      )}

      <ChartPlotShell
        title="Income distribution"
        caption="Share of income by category"
        selectedPeriod={selectedPeriod}
        showPeriodBadge={showPeriodBadge}
        badgeBg={chartColors.greenBadgeBg}
        badgeColor={chartColors.greenBadgeColor}
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
              const percentage = ((entry.value / totalIncome) * 100).toFixed(1)
              return (
                <CategoryTransactionDropdown
                  key={`legend-${index}`}
                  category={entry.name}
                  amount={entry.value}
                  percentage={percentage}
                  color={entry.color}
                  transactions={entry.transactions}
                  borderColor={chartColors.borderColor}
                  hoverBg={chartColors.legendHoverBg}
                  badgeBg={chartColors.grayBadgeBg}
                  accentScheme="green"
                />
              )
            })}
          </VStack>
        </Box>
      </ChartPlotShell>

      <IncomeInsights transactions={incomeTransactions} />
    </VStack>
  )
}
