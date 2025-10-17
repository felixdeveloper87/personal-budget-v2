import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { VStack, Text, HStack, Box, useBreakpointValue, useColorModeValue, Spinner, Center } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { animations } from '../../ui'
import { Transaction } from '../../../types'

interface BalanceChartProps {
  transactions: Transaction[]
  selectedPeriod: string
  currentBalance: number
}

export default function BalanceChart({ transactions, selectedPeriod, currentBalance }: BalanceChartProps) {
  const colors = useThemeColors()
  const chartHeight = useBreakpointValue({ base: 200, sm: 230, md: 250, lg: 300 })
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const spinnerColor = useColorModeValue('blue.500', 'blue.300')
  const gridStroke = useColorModeValue('#E2E8F0', '#4A5568')

  // Processar dados de transações
  const { balanceData, totalIncome, totalExpenses, dailyComparison } = useMemo(() => {
    const sortedTransactions = transactions.sort((a, b) => 
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    )

    const balanceData = sortedTransactions.reduce((acc, transaction, index) => {
      const date = new Date(transaction.dateTime).toLocaleDateString('en-GB', { 
        month: 'short', 
        day: 'numeric' 
      })
      
      const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0
      const newBalance = previousBalance + (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount)
      
      acc.push({
        date,
        balance: newBalance,
        income: transaction.type === 'INCOME' ? transaction.amount : 0,
        expense: transaction.type === 'EXPENSE' ? transaction.amount : 0,
      })
      
      return acc
    }, [] as any[])

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const dailyComparison = balanceData.map(item => ({
      date: item.date,
      income: item.income,
      expense: item.expense,
      net: item.income - item.expense
    }))

    return { balanceData, totalIncome, totalExpenses, dailyComparison }
  }, [transactions])

  // Loading state
  if (transactions.length === 0) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="lg" color={spinnerColor} thickness="3px" />
          <Text color={colors.text.secondary} fontSize="sm">
            Loading balance data...
          </Text>
        </VStack>
      </Center>
    )
  }

  return (
    <VStack 
      spacing={{ base: 4, sm: 5, md: 6 }} 
      align="stretch"
      sx={{
        animation: animations.slideIn,
        '@keyframes slideIn': {
          from: { 
            opacity: 0, 
            transform: 'translateY(20px) scale(0.95)' 
          },
          to: { 
            opacity: 1, 
            transform: 'translateY(0) scale(1)' 
          }
        }
      }}
    >
      {/* Estatísticas principais */}
      <HStack 
        spacing={{ base: 3, sm: 4, md: 6 }} 
        justify="center" 
        wrap="wrap"
        gap={{ base: 2, sm: 3 }}
      >
        {[
          {
            value: `£${currentBalance.toFixed(2)}`,
            label: 'Current Balance',
            color: currentBalance >= 0 ? 'green.500' : 'red.500',
            delay: '0.3s'
          },
          {
            value: `${totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : '0.0'}%`,
            label: 'Savings Rate',
            color: 'blue.500',
            delay: '0.4s'
          },
          {
            value: `£${totalIncome.toFixed(2)}`,
            label: 'Total Income',
            color: 'purple.500',
            delay: '0.5s'
          }
        ].map((stat, index) => (
          <Box 
            key={stat.label}
            textAlign="center" 
            minW={{ base: "60px", sm: "80px", md: "100px", lg: "120px" }}
            p={{ base: 2, sm: 3, md: 4 }}
            borderRadius="xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            shadow="sm"
            _hover={{
              shadow: 'md',
              transform: 'translateY(-2px)',
            }}
            transition="all 0.2s ease"
            sx={{
              animation: `${animations.slideIn} ${stat.delay} ease-out`,
            }}
          >
            <Text 
              fontSize={{ base: "sm", sm: "lg", md: "xl", lg: "2xl" }} 
              fontWeight="bold" 
              color={stat.color}
              mb={1}
            >
              {stat.value}
            </Text>
            <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={colors.text.secondary}>
              {stat.label}
            </Text>
          </Box>
        ))}
      </HStack>

      {/* Gráficos */}
      {[
        {
          title: 'Balance Trend',
          data: balanceData,
          chart: (
            <LineChart data={balanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: colors.text.secondary }}
                axisLine={{ stroke: colors.border }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: colors.text.secondary }}
                axisLine={{ stroke: colors.border }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '12px',
                  boxShadow: 'lg',
                  fontSize: '14px',
                  color: colors.text.primary
                }}
                labelStyle={{
                  color: colors.text.primary,
                  fontWeight: '600'
                }}
                formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Balance']}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke={currentBalance >= 0 ? "#38A169" : "#E53E3E"}
                strokeWidth={3}
                dot={{ 
                  fill: currentBalance >= 0 ? "#38A169" : "#E53E3E", 
                  strokeWidth: 2, 
                  r: 5 
                }}
                activeDot={{ 
                  r: 7, 
                  stroke: currentBalance >= 0 ? "#38A169" : "#E53E3E", 
                  strokeWidth: 2 
                }}
              />
            </LineChart>
          ),
          delay: '0.6s'
        },
        {
          title: 'Daily Income vs Expenses',
          data: dailyComparison,
          chart: (
            <BarChart data={dailyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: colors.text.secondary }}
                axisLine={{ stroke: colors.border }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: colors.text.secondary }}
                axisLine={{ stroke: colors.border }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '12px',
                  boxShadow: 'lg',
                  fontSize: '14px',
                  color: colors.text.primary
                }}
                labelStyle={{
                  color: colors.text.primary,
                  fontWeight: '600'
                }}
                formatter={(value, name) => [`£${Number(value).toFixed(2)}`, name === 'income' ? 'Income' : 'Expense']}
              />
              <Bar 
                dataKey="income" 
                fill="#38A169" 
                name="Income"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expense" 
                fill="#E53E3E" 
                name="Expense"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ),
          delay: '0.7s'
        }
      ].map((chart, index) => (
        <Box
          key={chart.title}
          p={6}
          borderRadius="2xl"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          shadow="sm"
          _hover={{ shadow: 'md' }}
          transition="all 0.2s ease"
          sx={{
            animation: `${animations.slideIn} ${chart.delay} ease-out`,
          }}
        >
          <Text 
            fontSize={{ base: "md", sm: "lg" }} 
            fontWeight="semibold" 
            mb={{ base: 3, sm: 4 }} 
            color={colors.text.label}
          >
            {chart.title}
          </Text>
          <ResponsiveContainer width="100%" height={chartHeight}>
            {chart.chart}
          </ResponsiveContainer>
        </Box>
      ))}

    </VStack>
  )
}
