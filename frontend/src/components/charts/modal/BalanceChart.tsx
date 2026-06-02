import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { PeriodType, Transaction } from '../../../types'
import { Wallet } from '../../ui/icons'
import { useChartColors, useChartDimensions } from './hooks'
import { ChartEmptyState, ChartPlotShell } from './components'
import { processBalanceData } from './utils'
import { getRechartsTooltipProps } from './utils/chartTooltip'
import CashflowForecastPanel from './CashflowForecastPanel'

export interface BalanceChartProps {
  transactions: Transaction[]
  forecastTransactions?: Transaction[]
  selectedPeriod: string
  currentBalance: number
  showPeriodBadge?: boolean
  periodType?: PeriodType
  selectedDate?: Date
}

export default function BalanceChart({
  transactions,
  forecastTransactions,
  selectedPeriod,
  currentBalance,
  showPeriodBadge = true,
  periodType,
  selectedDate,
}: BalanceChartProps) {
  const colors = useThemeColors()
  const chartColors = useChartColors(currentBalance)
  const { chartHeight } = useChartDimensions()
  const tooltipProps = getRechartsTooltipProps(chartColors, colors.text.primary)

  const { balanceData } = useMemo(
    () => processBalanceData(transactions),
    [transactions],
  )

  return (
    <VStack spacing={{ base: 4, sm: 5 }} align="stretch">
      {transactions.length === 0 ? (
        <ChartEmptyState
          icon={Wallet}
          title="No balance history yet"
          description="Add transactions to see how your balance changes over time."
        />
      ) : (
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
                formatter={(value) => [`\u00a3${Number(value).toFixed(2)}`, 'Balance']}
                cursor={{
                  stroke: chartColors.balanceColor,
                  strokeWidth: 1.5,
                  strokeDasharray: '4 4',
                }}
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
      )}

      {periodType && selectedDate && (
        <CashflowForecastPanel
          transactions={forecastTransactions ?? transactions}
          selectedDate={selectedDate}
          periodType={periodType}
        />
      )}
    </VStack>
  )
}
