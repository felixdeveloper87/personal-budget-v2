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
import { VStack, Text, HStack, Box, Badge, useColorModeValue } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { animations } from '../../ui'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useChartColors, useChartDimensions } from './hooks'
import { ChartCard, ChartLoadingState } from './components'
import { processTransactionsByDate } from './utils'

interface TransactionsChartProps {
  transactions: any[]
  selectedPeriod: string
}

export default function TransactionsChart({ transactions, selectedPeriod }: TransactionsChartProps) {
  const colors = useThemeColors()
  const chartColors = useChartColors()
  const { chartHeight } = useChartDimensions()
  
  // Processar dados usando utilitários centralizados
  const dailyData = useMemo(
    () => processTransactionsByDate(transactions),
    [transactions]
  )

  // Calcular contagens
  const { totalTransactions, incomeCount, expenseCount } = useMemo(() => {
    const total = transactions.length
    const income = transactions.filter(t => t.type === 'INCOME').length
    const expense = transactions.filter(t => t.type === 'EXPENSE').length
    return { totalTransactions: total, incomeCount: income, expenseCount: expense }
  }, [transactions])

  // Loading state
  if (transactions.length === 0) {
    return <ChartLoadingState message="Loading transaction data..." />
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
          icon={TrendingUp}
          value={incomeCount}
          label="Income"
          gradient={chartColors.incomeGradient}
          color={chartColors.incomeColor}
          hoverBorderColor={chartColors.incomeHoverBorder}
          delay={0}
          minW={{ base: "70px", sm: "85px", lg: "100px" }}
        />
        <ChartCard
          icon={TrendingDown}
          value={expenseCount}
          label="Expenses"
          gradient={chartColors.expenseGradient}
          color={chartColors.expenseColor}
          hoverBorderColor={chartColors.expenseHoverBorder}
          delay={0.1}
          minW={{ base: "70px", sm: "85px", lg: "100px" }}
        />
        <ChartCard
          icon={Activity}
          value={totalTransactions}
          label="Total"
          gradient={chartColors.transactionsGradient}
          color={chartColors.transactionsColor}
          hoverBorderColor={chartColors.transactionsHoverBorder}
          delay={0.2}
          minW={{ base: "70px", sm: "85px", lg: "100px" }}
        />
      </HStack>

      {/* Modern Bar Chart */}
      <Box
        position="relative"
        p={{ base: 5, sm: 6, md: 8 }}
        borderRadius="2xl"
        overflow="hidden"
      >
        {/* Header */}
        <HStack justify="space-between" align="center" mb={{ base: 4, sm: 6 }}>
          <VStack align="start" spacing={1}>
            <Text 
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
              fontWeight="700" 
              color={colors.text.primary}
              letterSpacing="-0.02em"
            >
              Daily Activity
            </Text>
            <Text 
              fontSize={{ base: "xs", sm: "sm" }} 
              color={colors.text.secondary}
              fontWeight="500"
            >
              Transaction overview by day
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
            data={dailyData}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.incomeColor} stopOpacity={1}/>
                <stop offset="100%" stopColor={chartColors.incomeColor} stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
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
              fill="url(#incomeGradient)" 
              name="Income"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
            <Bar 
              dataKey="expense" 
              fill="url(#expenseGradient)" 
              name="Expenses"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </VStack>
  )
}
