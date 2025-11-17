import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { VStack, Text, HStack, Box, Badge } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { animations } from '../../ui'
import { Transaction } from '../../../types'
import { Wallet, TrendingUp, Percent } from 'lucide-react'
import { useChartColors, useChartDimensions } from './hooks'
import { ChartCard, ChartLoadingState } from './components'
import { processBalanceData } from './utils'

interface BalanceChartProps {
  transactions: Transaction[]
  selectedPeriod: string
  currentBalance: number
}

export default function BalanceChart({ transactions, selectedPeriod, currentBalance }: BalanceChartProps) {
  const colors = useThemeColors()
  const chartColors = useChartColors(currentBalance)
  const { chartHeight } = useChartDimensions()

  // Processar dados usando utilitários centralizados
  const { balanceData, totalIncome, totalExpenses, dailyComparison } = useMemo(
    () => processBalanceData(transactions),
    [transactions]
  )

  // Calcular savings rate
  const savingsRate = useMemo(
    () => totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : '0.0',
    [totalIncome, totalExpenses]
  )

  // Loading state
  if (transactions.length === 0) {
    return <ChartLoadingState message="Loading balance data..." />
  }

  return (
    <VStack 
      spacing={{ base: 4, sm: 5, md: 6 }} 
      align="stretch"
    >
      {/* Modern Statistics Cards */}
      <HStack 
        spacing={{ base: 2, sm: 3, md: 4 }} 
        justify="center" 
        wrap="wrap"
        gap={{ base: 2, sm: 2 }}
      >
        <ChartCard
          icon={Wallet}
          value={`£${currentBalance.toFixed(2)}`}
          label="Current Balance"
          gradient={chartColors.balanceGradient}
          color={chartColors.balanceColor}
          hoverBorderColor={chartColors.balanceHoverBorder}
          delay={0}
        />
        <ChartCard
          icon={Percent}
          value={`${savingsRate}%`}
          label="Savings Rate"
          gradient={chartColors.savingsGradient}
          color={chartColors.savingsColor}
          hoverBorderColor={chartColors.savingsHoverBorder}
          delay={0.1}
        />
        <ChartCard
          icon={TrendingUp}
          value={`£${totalIncome.toFixed(2)}`}
          label="Total Income"
          gradient={chartColors.averageGradient}
          color={chartColors.averageColor}
          hoverBorderColor={chartColors.averageHoverBorder}
          delay={0.2}
        />
      </HStack>

      {/* Modern Balance Trend Chart */}
      <Box
        position="relative"
        p={{ base: 5, sm: 6, md: 8 }}
        overflow="hidden"
      >
        <HStack justify="space-between" align="center" mb={{ base: 4, sm: 6 }}>
          <VStack align="start" spacing={1}>
            <Text 
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
              fontWeight="700" 
              color={colors.text.primary}
              letterSpacing="-0.02em"
            >
              Balance Trend
            </Text>
            <Text 
              fontSize={{ base: "xs", sm: "sm" }} 
              color={colors.text.secondary}
              fontWeight="500"
            >
              Balance evolution over time
            </Text>
          </VStack>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg={chartColors.balanceBadgeBg}
            color={chartColors.balanceBadgeColor}
            fontSize="xs"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            {selectedPeriod}
          </Badge>
        </HStack>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart 
            data={balanceData}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="balanceLineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.balanceColor} stopOpacity={0.3}/>
                <stop offset="100%" stopColor={chartColors.balanceColor} stopOpacity={0}/>
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
                fontWeight: 500
              }}
              axisLine={{ 
                stroke: chartColors.borderColor,
                strokeWidth: 1
              }}
              tickLine={false}
            />
            <YAxis 
              tick={{ 
                fontSize: 11, 
                fill: colors.text.secondary,
                fontWeight: 500
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: chartColors.cardBg,
                border: `1px solid ${chartColors.borderColor}`,
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)',
                fontSize: '13px',
                padding: '12px 16px'
              }}
              labelStyle={{
                color: colors.text.primary,
                fontWeight: '700',
                fontSize: '12px',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              itemStyle={{
                color: colors.text.primary,
                fontWeight: '600',
                padding: '4px 0'
              }}
              formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Balance']}
              cursor={{ stroke: chartColors.balanceColor, strokeWidth: 2, strokeDasharray: '5 5' }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke={chartColors.balanceColor}
              strokeWidth={3}
              dot={{ 
                fill: chartColors.balanceColor, 
                strokeWidth: 2, 
                r: 5,
                stroke: chartColors.cardBg
              }}
              activeDot={{ 
                r: 7, 
                stroke: chartColors.balanceColor, 
                strokeWidth: 2,
                fill: chartColors.cardBg
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Modern Daily Comparison Chart */}
      <Box
        position="relative"
        p={{ base: 5, sm: 6, md: 8 }}
        overflow="hidden"
      >
        <HStack justify="space-between" align="center" mb={{ base: 4, sm: 6 }}>
          <VStack align="start" spacing={1}>
            <Text 
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
              fontWeight="700" 
              color={colors.text.primary}
              letterSpacing="-0.02em"
            >
              Daily Comparison
            </Text>
            <Text 
              fontSize={{ base: "xs", sm: "sm" }} 
              color={colors.text.secondary}
              fontWeight="500"
            >
              Income vs expenses by day
            </Text>
          </VStack>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg={chartColors.blueBadgeBg}
            color={chartColors.blueBadgeColor}
            fontSize="xs"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            {selectedPeriod}
          </Badge>
        </HStack>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart 
            data={dailyComparison}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="incomeBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.incomeColor} stopOpacity={1}/>
                <stop offset="100%" stopColor={chartColors.incomeColor} stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="expenseBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.expenseColor} stopOpacity={1}/>
                <stop offset="100%" stopColor={chartColors.expenseColor} stopOpacity={0.8}/>
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
                fontWeight: 500
              }}
              axisLine={{ 
                stroke: chartColors.borderColor,
                strokeWidth: 1
              }}
              tickLine={false}
            />
            <YAxis 
              tick={{ 
                fontSize: 11, 
                fill: colors.text.secondary,
                fontWeight: 500
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: chartColors.cardBg,
                border: `1px solid ${chartColors.borderColor}`,
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)',
                fontSize: '13px',
                padding: '12px 16px'
              }}
              labelStyle={{
                color: colors.text.primary,
                fontWeight: '700',
                fontSize: '12px',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              itemStyle={{
                color: colors.text.primary,
                fontWeight: '600',
                padding: '4px 0'
              }}
              formatter={(value, name) => [`£${Number(value).toFixed(2)}`, name === 'income' ? 'Income' : 'Expense']}
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '24px',
                fontSize: '13px',
                fontWeight: '600'
              }}
              iconType="circle"
            />
            <Bar 
              dataKey="income" 
              fill="url(#incomeBarGradient)" 
              name="Income"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
            <Bar 
              dataKey="expense" 
              fill="url(#expenseBarGradient)" 
              name="Expense"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

    </VStack>
  )
}
