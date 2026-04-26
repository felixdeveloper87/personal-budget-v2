import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { VStack, Text, HStack, Box, Badge } from '@chakra-ui/react'
import { useMemo } from 'react'
import type { PeriodType } from '../../../types'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { TrendingUp } from 'lucide-react'
import { useChartColors, useChartDimensions } from './hooks'
import {
  ChartPlotShell,
  ChartEmptyState,
  PeriodBucketBarChart,
} from './components'
import { processTransactionsByCategory, calculateTotals } from './utils'

export interface IncomeChartProps {
  transactions: any[]
  selectedPeriod: string
  showPeriodBadge?: boolean
  /**
   * When `periodType` and `selectedDate` are provided, a compact period
   * bucket bar chart of incoming money for the active range is rendered
   * above the category distribution chart.
   */
  periodType?: PeriodType
  selectedDate?: Date
}

export default function IncomeChart({
  transactions,
  selectedPeriod,
  showPeriodBadge = true,
  periodType,
  selectedDate,
}: IncomeChartProps) {
  const colors = useThemeColors()
  const chartColors = useChartColors()
  const { smallChartHeight, pieOuterRadius } = useChartDimensions()

  const incomeTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'INCOME'),
    [transactions],
  )

  const categoryData = useMemo(
    () => processTransactionsByCategory(incomeTransactions),
    [incomeTransactions],
  )

  const { total: totalIncome } = useMemo(
    () => calculateTotals(incomeTransactions),
    [incomeTransactions],
  )

  const pieData = useMemo(
    () =>
      categoryData.map((item, index) => ({
        name: item.category,
        value: item.amount,
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
        />
      )}

      <ChartPlotShell
        title="Income distribution"
        caption="Share of income by category"
        selectedPeriod={selectedPeriod}
        showPeriodBadge={showPeriodBadge}
        badgeBg={chartColors.greenBadgeBg}
        badgeColor={chartColors.greenBadgeColor}
      >
        <ResponsiveContainer width="100%" height={smallChartHeight}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={pieOuterRadius}
              innerRadius={Math.round(pieOuterRadius * 0.52)}
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

        <Box mt={4}>
          <VStack spacing={2} align="stretch">
            {pieData.map((entry, index) => {
              const percentage = ((entry.value / totalIncome) * 100).toFixed(1)
              return (
                <HStack
                  key={`legend-${index}`}
                  justify="space-between"
                  align="center"
                  p={3}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={chartColors.borderColor}
                  transition="background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease"
                  _hover={{
                    bg: chartColors.legendHoverBg,
                    transform: 'translateX(2px)',
                    borderColor: entry.color,
                  }}
                >
                  <HStack spacing={3} align="center" minW={0} flex={1}>
                    <Box
                      w={3.5}
                      h={3.5}
                      borderRadius="sm"
                      bg={entry.color}
                      flexShrink={0}
                    />
                    <Text
                      fontSize="sm"
                      fontWeight={600}
                      color={colors.text.primary}
                      isTruncated
                    >
                      {entry.name}
                    </Text>
                  </HStack>
                  <HStack spacing={3} align="center" flexShrink={0}>
                    <Text fontSize="sm" fontWeight={700} color={colors.text.primary}>
                      £{entry.value.toFixed(2)}
                    </Text>
                    <Badge
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      bg={chartColors.grayBadgeBg}
                      color={colors.text.primary}
                      fontSize="xs"
                      fontWeight={600}
                    >
                      {percentage}%
                    </Badge>
                  </HStack>
                </HStack>
              )
            })}
          </VStack>
        </Box>
      </ChartPlotShell>
    </VStack>
  )
}
