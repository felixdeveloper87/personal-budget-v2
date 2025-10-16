import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { VStack, Text, HStack, Box, useBreakpointValue, useColorModeValue, Spinner, Center } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles, animations } from '../../ui'

interface TransactionsChartProps {
  transactions: any[]
  selectedPeriod: string
}

export default function TransactionsChart({ transactions, selectedPeriod }: TransactionsChartProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const chartHeight = useBreakpointValue({ base: 250, sm: 280, md: 300, lg: 350 })
  const smallChartHeight = useBreakpointValue({ base: 200, sm: 230, md: 250, lg: 300 })
  
  // Move all useColorModeValue calls to the top
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const spinnerColor = useColorModeValue('blue.500', 'blue.300')
  const gridStroke = useColorModeValue('#E2E8F0', '#4A5568')

  // Dados para o gráfico de barras - transações por dia
  const dailyData = transactions.reduce((acc: any[], transaction: any) => {
    const date = new Date(transaction.dateTime).toLocaleDateString('en-GB', { 
      month: 'short', 
      day: 'numeric' 
    })
    const existing = acc.find((item: any) => item.date === date)
    
    if (existing) {
      if (transaction.type === 'INCOME') {
        existing.income += transaction.amount
      } else {
        existing.expense += transaction.amount
      }
    } else {
      acc.push({
        date,
        income: transaction.type === 'INCOME' ? transaction.amount : 0,
        expense: transaction.type === 'EXPENSE' ? transaction.amount : 0
      })
    }
    
    return acc
  }, []).sort((a: any, b: any) => {
    // Sort by the original transaction dates for proper chronological order
    const transactionsA = transactions.filter(t => {
      const date = new Date(t.dateTime).toLocaleDateString('en-GB', { 
        month: 'short', 
        day: 'numeric' 
      })
      return date === a.date
    })
    const transactionsB = transactions.filter(t => {
      const date = new Date(t.dateTime).toLocaleDateString('en-GB', { 
        month: 'short', 
        day: 'numeric' 
      })
      return date === b.date
    })
    
    if (transactionsA.length > 0 && transactionsB.length > 0) {
      return new Date(transactionsA[0].dateTime).getTime() - new Date(transactionsB[0].dateTime).getTime()
    }
    return 0
  })

  // Dados para o gráfico de pizza - distribuição por tipo
  const typeData = [
    { name: 'Income', value: transactions.filter(t => t.type === 'INCOME').length, color: '#38A169' },
    { name: 'Expenses', value: transactions.filter(t => t.type === 'EXPENSE').length, color: '#E53E3E' }
  ]

  const totalTransactions = transactions.length
  const incomeCount = transactions.filter(t => t.type === 'INCOME').length
  const expenseCount = transactions.filter(t => t.type === 'EXPENSE').length

  // Loading state
  if (transactions.length === 0) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="lg" color={spinnerColor} thickness="3px" />
          <Text color={colors.text.secondary} fontSize="sm">
            Loading transaction data...
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
      {/* Estatísticas rápidas - responsivas para iPhone */}
      <HStack 
        spacing={{ base: 3, sm: 4, md: 6 }} 
        justify="center" 
        wrap="wrap"
        gap={{ base: 2, sm: 3 }}
      >
        <Box 
          textAlign="center" 
          minW={{ base: "70px", sm: "90px", lg: "110px" }}
          p={4}
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
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="green.500"
            mb={1}
          >
            {incomeCount}
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Income
          </Text>
        </Box>
        <Box 
          textAlign="center" 
          minW={{ base: "70px", sm: "90px", lg: "110px" }}
          p={4}
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
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="red.500"
            mb={1}
          >
            {expenseCount}
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Expenses
          </Text>
        </Box>
        <Box 
          textAlign="center" 
          minW={{ base: "70px", sm: "90px", lg: "110px" }}
          p={4}
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
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="blue.500"
            mb={1}
          >
            {totalTransactions}
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Total
          </Text>
        </Box>
      </HStack>

      {/* Gráfico de barras - transações por dia */}
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
          Daily Transaction Activity
        </Text>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={dailyData}>
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
                fontSize: '14px'
              }}
              labelStyle={{
                color: colors.text.primary,
                fontWeight: '600'
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px'
              }}
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
              name="Expenses"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </VStack>
  )
}
