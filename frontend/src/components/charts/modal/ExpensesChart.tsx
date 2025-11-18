import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { VStack, Text, HStack, Box, Badge, useColorModeValue } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { animations } from '../../ui'
import { DollarSign, TrendingDown, BarChart3 } from 'lucide-react'
import { useChartColors, useChartDimensions } from './hooks'
import { ChartCard, ChartLoadingState } from './components'
import { processTransactionsByCategory, processTimelineData, calculateTotals } from './utils'

interface ExpensesChartProps {
  transactions: any[]
  selectedPeriod: string
}

export default function ExpensesChart({ transactions, selectedPeriod }: ExpensesChartProps) {
  const colors = useThemeColors()
  const chartColors = useChartColors()
  const { smallChartHeight, pieOuterRadius } = useChartDimensions()
  
  // Legend colors específicas para expenses (vermelho)
  const legendBg = useColorModeValue('rgba(239, 68, 68, 0.05)', 'rgba(248, 113, 113, 0.1)')
  const legendHoverBg = useColorModeValue('rgba(239, 68, 68, 0.1)', 'rgba(248, 113, 113, 0.15)')

  // Filtrar apenas transações de despesas
  const expenseTransactions = useMemo(
    () => transactions.filter(t => t.type === 'EXPENSE'),
    [transactions]
  )

  // Processar dados usando utilitários centralizados
  const categoryData = useMemo(
    () => processTransactionsByCategory(expenseTransactions),
    [expenseTransactions]
  )

  const timelineData = useMemo(
    () => processTimelineData(expenseTransactions, 'EXPENSE'),
    [expenseTransactions]
  )

  const { total: totalExpenses, average: avgExpense } = useMemo(
    () => calculateTotals(expenseTransactions),
    [expenseTransactions]
  )

  // Dados para gráfico de pizza - distribuição por categoria
  const pieData = useMemo(
    () => categoryData.map((item, index) => ({
      name: item.category,
      value: item.amount,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)` // Cores diferentes para cada categoria
    })),
    [categoryData]
  )

  // Loading state
  if (expenseTransactions.length === 0) {
    return <ChartLoadingState message="Loading expense data..." />
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
          icon={DollarSign}
          value={`£${totalExpenses.toFixed(2)}`}
          label="Total Expenses"
          gradient={chartColors.expenseGradient}
          color={chartColors.expenseColor}
          hoverBorderColor={chartColors.expenseHoverBorder}
          delay={0}
        />
        <ChartCard
          icon={BarChart3}
          value={expenseTransactions.length}
          label="Transactions"
          gradient={chartColors.transactionsGradient}
          color={chartColors.transactionsColor}
          hoverBorderColor={chartColors.transactionsHoverBorder}
          delay={0.1}
        />
        <ChartCard
          icon={TrendingDown}
          value={`£${avgExpense.toFixed(2)}`}
          label="Average"
          gradient={chartColors.averageGradient}
          color={chartColors.averageColor}
          hoverBorderColor={chartColors.averageHoverBorder}
          delay={0.2}
        />
      </HStack>

      {/* Modern Pie Chart */}
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
              Expense Distribution
            </Text>
            <Text 
              fontSize={{ base: "xs", sm: "sm" }} 
              color={colors.text.secondary}
              fontWeight="500"
            >
              Breakdown by category
            </Text>
          </VStack>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg={chartColors.redBadgeBg}
            color={chartColors.redBadgeColor}
            fontSize="xs"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            {selectedPeriod}
          </Badge>
        </HStack>
        <ResponsiveContainer width="100%" height={smallChartHeight}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={pieOuterRadius}
              fill="#8884d8"
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
        
        {/* Modern Legend */}
        <Box mt={4}>
          <VStack spacing={2} align="stretch">
            {pieData.map((entry, index) => {
              const percentage = ((entry.value / totalExpenses) * 100).toFixed(1)
              return (
                <HStack 
                  key={`legend-${index}`}
                  justify="space-between" 
                  align="center"
                  p={3}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={chartColors.borderColor}
                  _hover={{
                    bg: legendHoverBg,
                    transform: 'translateX(4px)',
                    borderColor: entry.color,
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  sx={{
                    animation: `${animations.slideIn} ${0.8 + index * 0.1}s ease-out`,
                  }}
                >
                  <HStack spacing={3} align="center" minW={0} flex={1}>
                    <Box
                      w={4}
                      h={4}
                      borderRadius="md"
                      bg={entry.color}
                      flexShrink={0}
                      boxShadow="0 2px 4px rgba(0,0,0,0.1)"
                    />
                    <Text 
                      fontSize={{ base: 'sm', sm: 'md' }}
                      fontWeight="600"
                      color={colors.text.primary}
                      isTruncated
                    >
                      {entry.name}
                    </Text>
                  </HStack>
                  <HStack spacing={3} align="center" flexShrink={0}>
                    <Text 
                      fontSize={{ base: 'sm', sm: 'md' }}
                      fontWeight="700"
                      color={colors.text.primary}
                    >
                      £{entry.value.toFixed(2)}
                    </Text>
                    <Badge
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      bg={chartColors.grayBadgeBg}
                      color={colors.text.primary}
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {percentage}%
                    </Badge>
                  </HStack>
                </HStack>
              )
            })}
          </VStack>
        </Box>
      </Box>

      {/* Modern Line Chart */}
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
              Expense Timeline
            </Text>
            <Text 
              fontSize={{ base: "xs", sm: "sm" }} 
              color={colors.text.secondary}
              fontWeight="500"
            >
              Daily expense trend
            </Text>
          </VStack>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg={chartColors.redBadgeBg}
            color={chartColors.redBadgeColor}
            fontSize="xs"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.5px"
          >
            {selectedPeriod}
          </Badge>
        </HStack>
        <ResponsiveContainer width="100%" height={smallChartHeight}>
          <LineChart 
            data={timelineData}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="expenseLineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.expenseColor} stopOpacity={0.3}/>
                <stop offset="100%" stopColor={chartColors.expenseColor} stopOpacity={0}/>
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
              formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Amount']}
              cursor={{ stroke: chartColors.expenseColor, strokeWidth: 2, strokeDasharray: '5 5' }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke={chartColors.expenseColor}
              strokeWidth={3}
              dot={{ 
                fill: chartColors.expenseColor, 
                strokeWidth: 2, 
                r: 5,
                stroke: chartColors.cardBg
              }}
              activeDot={{ 
                r: 7, 
                stroke: chartColors.expenseColor, 
                strokeWidth: 2,
                fill: chartColors.cardBg
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

    </VStack>
  )
}
