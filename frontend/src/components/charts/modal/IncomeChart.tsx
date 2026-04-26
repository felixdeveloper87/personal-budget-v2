import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { VStack, Text, HStack, Box, Badge } from '@chakra-ui/react'
import { useMemo } from 'react'
import type { PeriodType } from '../../../types'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react'
import { useChartColors, useChartDimensions } from './hooks'
import {
  ChartCard,
  ChartPlotShell,
  ChartEmptyState,
  PeriodBucketBarChart,
} from './components'
import {
  processTransactionsByCategory,
  processTimelineData,
  calculateTotals,
} from './utils'
import { getRechartsTooltipProps } from './utils/chartTooltip'

export interface IncomeChartProps {
  transactions: any[]
  selectedPeriod: string
  showPeriodBadge?: boolean
  /**
   * When `periodType` and `selectedDate` are provided, a compact period
   * bucket bar chart of incoming money for the active range is rendered
   * above the category and timeline charts.
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
  const tooltipProps = getRechartsTooltipProps(chartColors, colors.text.primary)

  const incomeTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'INCOME'),
    [transactions],
  )

  const categoryData = useMemo(
    () => processTransactionsByCategory(incomeTransactions),
    [incomeTransactions],
  )

  const timelineData = useMemo(
    () => processTimelineData(incomeTransactions, 'INCOME'),
    [incomeTransactions],
  )

  const { total: totalIncome, average: avgIncome } = useMemo(
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
        description="Record income or pick a different range to see category splits and trends."
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

      <HStack
        spacing={{ base: 2, sm: 3 }}
        justify="center"
        wrap="wrap"
        gap={{ base: 2, sm: 2 }}
      >
        <ChartCard
          icon={DollarSign}
          value={`£${totalIncome.toFixed(2)}`}
          label="Total income"
          gradient={chartColors.incomeGradient}
          color={chartColors.incomeColor}
          hoverBorderColor={chartColors.incomeHoverBorder}
          delay={0}
        />
        <ChartCard
          icon={BarChart3}
          value={incomeTransactions.length}
          label="Transactions"
          gradient={chartColors.transactionsGradient}
          color={chartColors.transactionsColor}
          hoverBorderColor={chartColors.transactionsHoverBorder}
          delay={0.1}
        />
        <ChartCard
          icon={TrendingUp}
          value={`£${avgIncome.toFixed(2)}`}
          label="Average"
          gradient={chartColors.averageGradient}
          color={chartColors.averageColor}
          hoverBorderColor={chartColors.averageHoverBorder}
          delay={0.2}
        />
      </HStack>

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

      <ChartPlotShell
        title="Income timeline"
        caption="Daily income in this range"
        selectedPeriod={selectedPeriod}
        showPeriodBadge={showPeriodBadge}
        badgeBg={chartColors.greenBadgeBg}
        badgeColor={chartColors.greenBadgeColor}
      >
        <ResponsiveContainer width="100%" height={smallChartHeight}>
          <LineChart
            data={timelineData}
            margin={{ top: 8, right: 8, left: -12, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chartColors.gridStroke}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{
                fontSize: 11,
                fill: colors.text.secondary,
                fontWeight: 500,
              }}
              axisLine={{
                stroke: chartColors.borderColor,
                strokeWidth: 1,
              }}
              tickLine={false}
            />
            <YAxis
              tick={{
                fontSize: 11,
                fill: colors.text.secondary,
                fontWeight: 500,
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipProps.contentStyle}
              labelStyle={tooltipProps.labelStyle}
              itemStyle={tooltipProps.itemStyle}
              formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Amount']}
              cursor={{ stroke: chartColors.incomeColor, strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={chartColors.incomeColor}
              strokeWidth={2.5}
              dot={{
                fill: chartColors.incomeColor,
                strokeWidth: 2,
                r: 4,
                stroke: chartColors.cardBg,
              }}
              activeDot={{
                r: 6,
                stroke: chartColors.incomeColor,
                strokeWidth: 2,
                fill: chartColors.cardBg,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartPlotShell>
    </VStack>
  )
}
