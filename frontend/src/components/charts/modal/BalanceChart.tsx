import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'
import { VStack, Text, HStack, Box, Badge, Stat, StatNumber, StatHelpText, useBreakpointValue, useColorModeValue, Spinner, Center } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles, animations } from '../../ui'

interface BalanceChartProps {
  transactions: any[]
  selectedPeriod: string
  currentBalance: number
}

export default function BalanceChart({ transactions, selectedPeriod, currentBalance }: BalanceChartProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const chartHeight = useBreakpointValue({ base: 250, sm: 280, md: 300, lg: 350 })
  const smallChartHeight = useBreakpointValue({ base: 200, sm: 230, md: 250, lg: 300 })
  
  // Move all useColorModeValue calls to the top
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const spinnerColor = useColorModeValue('blue.500', 'blue.300')
  const gridStroke = useColorModeValue('#E2E8F0', '#4A5568')
  const analysisCardBg = useColorModeValue('gray.50', 'gray.700')
  const analysisHoverBg = useColorModeValue('gray.100', 'gray.600')

  // Calcular saldo acumulado ao longo do tempo
  const balanceData = transactions
    .sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .reduce((acc: any[], transaction: any, index: number) => {
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
        day: index + 1
      })
      
      return acc
    }, [])

  // Calcular estatísticas
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
  
  const minBalance = Math.min(...balanceData.map(d => d.balance))
  const maxBalance = Math.max(...balanceData.map(d => d.balance))
  const balanceRange = maxBalance - minBalance

  // Dados para gráfico de barras - receitas vs despesas por dia
  const dailyComparison = balanceData.map((item: any) => ({
    date: item.date,
    income: item.income,
    expense: item.expense,
    net: item.income - item.expense
  }))

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
      {/* Estatísticas principais - responsivas para iPhone */}
      <HStack 
        spacing={{ base: 3, sm: 4, md: 6 }} 
        justify="center" 
        wrap="wrap"
        gap={{ base: 2, sm: 3 }}
      >
        <Box 
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
            animation: `${animations.slideIn} 0.3s ease-out`,
          }}
        >
          <Text 
            fontSize={{ base: "sm", sm: "lg", md: "xl", lg: "2xl" }} 
            fontWeight="bold" 
            color={currentBalance >= 0 ? "green.500" : "red.500"}
            mb={1}
          >
            £{currentBalance.toFixed(2)}
          </Text>
          <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={colors.text.secondary}>
            Current Balance
          </Text>
        </Box>
        <Box 
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
            animation: `${animations.slideIn} 0.4s ease-out`,
          }}
        >
          <Text 
            fontSize={{ base: "sm", sm: "lg", md: "xl", lg: "2xl" }} 
            fontWeight="bold" 
            color="blue.500"
            mb={1}
          >
            {savingsRate.toFixed(1)}%
          </Text>
          <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={colors.text.secondary}>
            Savings Rate
          </Text>
        </Box>
        <Box 
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
            animation: `${animations.slideIn} 0.5s ease-out`,
          }}
        >
          <Text 
            fontSize={{ base: "sm", sm: "lg", md: "xl", lg: "2xl" }} 
            fontWeight="bold" 
            color="purple.500"
            mb={1}
          >
            £{balanceRange.toFixed(2)}
          </Text>
          <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={colors.text.secondary}>
            Balance Range
          </Text>
        </Box>
      </HStack>

      {/* Gráfico de linha - saldo com pontos de inflexão */}
      <Box
        p={6}
        borderRadius="2xl"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        shadow="sm"
        _hover={{
          shadow: 'md',
        }}
        transition="all 0.2s ease"
        sx={{
          animation: `${animations.slideIn} 0.6s ease-out`,
        }}
      >
        <Text 
          fontSize={{ base: "md", sm: "lg" }} 
          fontWeight="semibold" 
          mb={{ base: 3, sm: 4 }} 
          color={colors.text.label}
        >
          Balance Trend
        </Text>
        <ResponsiveContainer width="100%" height={smallChartHeight}>
          <LineChart data={balanceData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridStroke}
            />
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
        </ResponsiveContainer>
      </Box>

      {/* Gráfico de barras - receitas vs despesas diárias */}
      <Box
        p={6}
        borderRadius="2xl"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        shadow="sm"
        _hover={{
          shadow: 'md',
        }}
        transition="all 0.2s ease"
        sx={{
          animation: `${animations.slideIn} 0.7s ease-out`,
        }}
      >
        <Text 
          fontSize={{ base: "md", sm: "lg" }} 
          fontWeight="semibold" 
          mb={{ base: 3, sm: 4 }} 
          color={colors.text.label}
        >
          Daily Income vs Expenses
        </Text>
        <ResponsiveContainer width="100%" height={smallChartHeight}>
          <BarChart data={dailyComparison}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridStroke}
            />
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
              formatter={(value, name) => [`£${Number(value).toFixed(2)}`, name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Net']}
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
        </ResponsiveContainer>
      </Box>

      {/* Análise de saúde financeira */}
      <Box
        p={6}
        borderRadius="2xl"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        shadow="sm"
        _hover={{
          shadow: 'md',
        }}
        transition="all 0.2s ease"
        sx={{
          animation: `${animations.slideIn} 0.8s ease-out`,
        }}
      >
        <Text 
          fontSize={{ base: "md", sm: "lg" }} 
          fontWeight="semibold" 
          mb={{ base: 3, sm: 4 }} 
          color={colors.text.label}
        >
          Financial Health Analysis
        </Text>
        <VStack spacing={3} align="stretch">
          <HStack 
            justify="space-between" 
            p={4} 
            bg={analysisCardBg} 
            borderRadius="lg"
            _hover={{
              bg: analysisHoverBg,
              transform: 'translateX(4px)',
            }}
            transition="all 0.2s ease"
            sx={{
              animation: `${animations.slideIn} 0.9s ease-out`,
            }}
          >
            <Text fontWeight="medium" color={colors.text.primary}>Savings Rate</Text>
            <HStack spacing={2}>
              <Badge 
                colorScheme={savingsRate > 20 ? "green" : savingsRate > 10 ? "yellow" : "red"}
                fontSize="sm"
                px={2}
                py={1}
              >
                {savingsRate.toFixed(1)}%
              </Badge>
              <Text fontSize="sm" color={colors.text.secondary}>
                {savingsRate > 20 ? "Excellent" : savingsRate > 10 ? "Good" : "Needs Improvement"}
              </Text>
            </HStack>
          </HStack>

          <HStack 
            justify="space-between" 
            p={4} 
            bg={analysisCardBg} 
            borderRadius="lg"
            _hover={{
              bg: analysisHoverBg,
              transform: 'translateX(4px)',
            }}
            transition="all 0.2s ease"
            sx={{
              animation: `${animations.slideIn} 1.0s ease-out`,
            }}
          >
            <Text fontWeight="medium" color={colors.text.primary}>Balance Trend</Text>
            <HStack spacing={2}>
              <Badge 
                colorScheme={currentBalance >= 0 ? "green" : "red"}
                fontSize="sm"
                px={2}
                py={1}
              >
                {currentBalance >= 0 ? "Positive" : "Negative"}
              </Badge>
              <Text fontSize="sm" color={colors.text.secondary}>
                {currentBalance >= 0 ? "Growing wealth" : "Spending more than earning"}
              </Text>
            </HStack>
          </HStack>

          <HStack 
            justify="space-between" 
            p={4} 
            bg={analysisCardBg} 
            borderRadius="lg"
            _hover={{
              bg: analysisHoverBg,
              transform: 'translateX(4px)',
            }}
            transition="all 0.2s ease"
            sx={{
              animation: `${animations.slideIn} 1.1s ease-out`,
            }}
          >
            <Text fontWeight="medium" color={colors.text.primary}>Financial Stability</Text>
            <HStack spacing={2}>
              <Badge 
                colorScheme={balanceRange > 0 ? "green" : "gray"}
                fontSize="sm"
                px={2}
                py={1}
              >
                {balanceRange > 0 ? "Stable" : "Volatile"}
              </Badge>
              <Text fontSize="sm" color={colors.text.secondary}>
                {balanceRange > 0 ? "Consistent growth" : "High volatility"}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  )
}
