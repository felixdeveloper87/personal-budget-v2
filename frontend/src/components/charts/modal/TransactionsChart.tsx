import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { VStack, HStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useChartColors, useChartDimensions } from './hooks'
import { ChartCard, ChartPlotShell, ChartEmptyState } from './components'
import { processTransactionsByDate } from './utils'
import { getRechartsTooltipProps } from './utils/chartTooltip'

export interface TransactionsChartProps {
  transactions: any[]
  selectedPeriod: string
  /**
   * When false, period pills inside the plot are hidden (e.g. the Charts page
   * already shows the range in the section header).
   */
  showPeriodBadge?: boolean
}

export default function TransactionsChart({
  transactions,
  selectedPeriod,
  showPeriodBadge = true,
}: TransactionsChartProps) {
  const colors = useThemeColors()
  const chartColors = useChartColors()
  const { chartHeight } = useChartDimensions()
  const tooltipProps = getRechartsTooltipProps(chartColors, colors.text.primary)

  const dailyData = useMemo(
    () => processTransactionsByDate(transactions),
    [transactions],
  )

  const { totalTransactions, incomeCount, expenseCount } = useMemo(() => {
    const total = transactions.length
    const income = transactions.filter((t) => t.type === 'INCOME').length
    const expense = transactions.filter((t) => t.type === 'EXPENSE').length
    return { totalTransactions: total, incomeCount: income, expenseCount: expense }
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <ChartEmptyState
        title="No transactions in this range"
        description="Pick another period or log income and expenses to see activity here."
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
          icon={TrendingUp}
          value={incomeCount}
          label="Income"
          gradient={chartColors.incomeGradient}
          color={chartColors.incomeColor}
          hoverBorderColor={chartColors.incomeHoverBorder}
          delay={0}
          minW={{ base: '70px', sm: '85px', lg: '100px' }}
        />
        <ChartCard
          icon={TrendingDown}
          value={expenseCount}
          label="Expenses"
          gradient={chartColors.expenseGradient}
          color={chartColors.expenseColor}
          hoverBorderColor={chartColors.expenseHoverBorder}
          delay={0.1}
          minW={{ base: '70px', sm: '85px', lg: '100px' }}
        />
        <ChartCard
          icon={Activity}
          value={totalTransactions}
          label="Total"
          gradient={chartColors.transactionsGradient}
          color={chartColors.transactionsColor}
          hoverBorderColor={chartColors.transactionsHoverBorder}
          delay={0.2}
          minW={{ base: '70px', sm: '85px', lg: '100px' }}
        />
      </HStack>

      <ChartPlotShell
        title="Daily activity"
        caption="Count of income vs expense entries per day"
        selectedPeriod={selectedPeriod}
        showPeriodBadge={showPeriodBadge}
        badgeBg={chartColors.blueBadgeBg}
        badgeColor={chartColors.blueBadgeColor}
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={dailyData}
            margin={{ top: 8, right: 8, left: -12, bottom: 4 }}
          >
            <defs>
              <linearGradient id="txnIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.incomeColor} stopOpacity={1} />
                <stop offset="100%" stopColor={chartColors.incomeColor} stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="txnExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.expenseColor} stopOpacity={1} />
                <stop offset="100%" stopColor={chartColors.expenseColor} stopOpacity={0.85} />
              </linearGradient>
            </defs>
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
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                fontWeight: 600,
              }}
              iconType="circle"
            />
            <Bar
              dataKey="income"
              fill="url(#txnIncomeGrad)"
              name="Income"
              radius={[6, 6, 0, 0]}
              maxBarSize={52}
            />
            <Bar
              dataKey="expense"
              fill="url(#txnExpenseGrad)"
              name="Expenses"
              radius={[6, 6, 0, 0]}
              maxBarSize={52}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartPlotShell>
    </VStack>
  )
}
