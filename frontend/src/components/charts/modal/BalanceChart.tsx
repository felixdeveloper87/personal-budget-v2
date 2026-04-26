import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { VStack, HStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { Transaction } from '../../../types'
import { Wallet, TrendingUp, Percent } from 'lucide-react'
import { useChartColors, useChartDimensions } from './hooks'
import { ChartCard, ChartPlotShell, ChartEmptyState } from './components'
import { processBalanceData } from './utils'
import { getRechartsTooltipProps } from './utils/chartTooltip'

export interface BalanceChartProps {
  transactions: Transaction[]
  selectedPeriod: string
  currentBalance: number
  showPeriodBadge?: boolean
}

export default function BalanceChart({
  transactions,
  selectedPeriod,
  currentBalance,
  showPeriodBadge = true,
}: BalanceChartProps) {
  const colors = useThemeColors()
  const chartColors = useChartColors(currentBalance)
  const { chartHeight } = useChartDimensions()
  const tooltipProps = getRechartsTooltipProps(chartColors, colors.text.primary)

  const { balanceData, totalIncome, totalExpenses } = useMemo(
    () => processBalanceData(transactions),
    [transactions],
  )

  const savingsRate = useMemo(
    () =>
      totalIncome > 0
        ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)
        : '0.0',
    [totalIncome, totalExpenses],
  )

  if (transactions.length === 0) {
    return (
      <ChartEmptyState
        icon={Wallet}
        title="No balance history yet"
        description="Add transactions to see how your balance changes over time."
      />
    )
  }

  return (
    <VStack spacing={{ base: 4, sm: 5 }} align="stretch">
      <HStack
        spacing={{ base: 2, sm: 3 }}
        justify="center"
        wrap="wrap"
        gap={{ base: 2, sm: 2 }}
      >
        <ChartCard
          icon={Wallet}
          value={`£${currentBalance.toFixed(2)}`}
          label="Current balance"
          gradient={chartColors.balanceGradient}
          color={chartColors.balanceColor}
          hoverBorderColor={chartColors.balanceHoverBorder}
          delay={0}
        />
        <ChartCard
          icon={Percent}
          value={`${savingsRate}%`}
          label="Savings rate"
          gradient={chartColors.savingsGradient}
          color={chartColors.savingsColor}
          hoverBorderColor={chartColors.savingsHoverBorder}
          delay={0.1}
        />
        <ChartCard
          icon={TrendingUp}
          value={`£${totalIncome.toFixed(2)}`}
          label="Total income"
          gradient={chartColors.averageGradient}
          color={chartColors.averageColor}
          hoverBorderColor={chartColors.averageHoverBorder}
          delay={0.2}
        />
      </HStack>

      <ChartPlotShell
        title="Balance trend"
        caption="Running balance after each movement in this range"
        selectedPeriod={selectedPeriod}
        showPeriodBadge={showPeriodBadge}
        badgeBg={chartColors.balanceBadgeBg}
        badgeColor={chartColors.balanceBadgeColor}
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart
            data={balanceData}
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
              formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Balance']}
              cursor={{ stroke: chartColors.balanceColor, strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke={chartColors.balanceColor}
              strokeWidth={2.5}
              dot={{
                fill: chartColors.balanceColor,
                strokeWidth: 2,
                r: 4,
                stroke: chartColors.cardBg,
              }}
              activeDot={{
                r: 6,
                stroke: chartColors.balanceColor,
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
