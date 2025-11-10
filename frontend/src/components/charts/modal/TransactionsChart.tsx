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
import { VStack, Text, HStack, Box, useBreakpointValue, useColorModeValue, Spinner, Center, Badge } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles, animations } from '../../ui'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { Icon } from '@chakra-ui/react'

interface TransactionsChartProps {
  transactions: any[]
  selectedPeriod: string
}

export default function TransactionsChart({ transactions, selectedPeriod }: TransactionsChartProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const chartHeight = useBreakpointValue({ base: 280, sm: 320, md: 360, lg: 400 })
  
  // Modern color palette
  const cardBg = useColorModeValue('white', '#0a0a0a')
  const cardBgGradient = useColorModeValue(
    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)'
  )
  const borderColor = useColorModeValue('rgba(226, 232, 240, 0.8)', 'rgba(75, 85, 99, 0.3)')
  const spinnerColor = useColorModeValue('blue.500', 'blue.300')
  const gridStroke = useColorModeValue('rgba(226, 232, 240, 0.5)', 'rgba(75, 85, 99, 0.2)')
  
  // Modern gradient colors
  const incomeGradient = useColorModeValue(
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
  )
  const expenseGradient = useColorModeValue(
    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
  )
  const totalGradient = useColorModeValue(
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
  )
  
  // Modern bar colors
  const incomeColor = useColorModeValue('#10b981', '#22c55e')
  const expenseColor = useColorModeValue('#ef4444', '#f87171')
  
  // Stat card colors
  const incomeCardBg = useColorModeValue('rgba(16, 185, 129, 0.08)', 'rgba(34, 197, 94, 0.12)')
  const expenseCardBg = useColorModeValue('rgba(239, 68, 68, 0.08)', 'rgba(248, 113, 113, 0.12)')
  const totalCardBg = useColorModeValue('rgba(59, 130, 246, 0.08)', 'rgba(96, 165, 250, 0.12)')

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
      {/* Modern Statistics Cards */}
      <HStack 
        spacing={{ base: 2, sm: 3, md: 4 }} 
        justify="center" 
        wrap="wrap"
        gap={{ base: 2, sm: 2 }}
      >
        {/* Income Card */}
        <Box 
          position="relative"
          minW={{ base: "70px", sm: "85px", lg: "100px" }}
          p={{ base: 3, sm: 3.5 }}
          borderRadius="xl"
          bg={cardBg}
          background={cardBgGradient}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15), 0 4px 10px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('rgba(16, 185, 129, 0.3)', 'rgba(34, 197, 94, 0.4)'),
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          sx={{
            animation: `${animations.slideIn} 0.3s ease-out`,
          }}
          overflow="hidden"
        >
          {/* Accent bar */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="2px"
            bg={incomeGradient}
          />
          <VStack spacing={1.5} align="center">
            <HStack spacing={1.5} align="center">
              <Icon as={TrendingUp} boxSize={4} color={incomeColor} />
              <Text 
                fontSize={{ base: "xl", sm: "2xl", md: "3xl" }} 
                fontWeight="800" 
                bgGradient={incomeGradient}
                bgClip="text"
                lineHeight="1"
              >
                {incomeCount}
              </Text>
            </HStack>
            <Text 
              fontSize={{ base: "2xs", sm: "xs" }} 
              fontWeight="600"
              color={colors.text.secondary}
              letterSpacing="0.5px"
              textTransform="uppercase"
            >
              Income
            </Text>
          </VStack>
        </Box>

        {/* Expense Card */}
        <Box 
          position="relative"
          minW={{ base: "70px", sm: "85px", lg: "100px" }}
          p={{ base: 3, sm: 3.5 }}
          borderRadius="xl"
          bg={cardBg}
          background={cardBgGradient}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15), 0 4px 10px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('rgba(239, 68, 68, 0.3)', 'rgba(248, 113, 113, 0.4)'),
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          sx={{
            animation: `${animations.slideIn} 0.4s ease-out`,
          }}
          overflow="hidden"
        >
          {/* Accent bar */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="2px"
            bg={expenseGradient}
          />
          <VStack spacing={1.5} align="center">
            <HStack spacing={1.5} align="center">
              <Icon as={TrendingDown} boxSize={4} color={expenseColor} />
              <Text 
                fontSize={{ base: "xl", sm: "2xl", md: "3xl" }} 
                fontWeight="800" 
                bgGradient={expenseGradient}
                bgClip="text"
                lineHeight="1"
              >
                {expenseCount}
              </Text>
            </HStack>
            <Text 
              fontSize={{ base: "2xs", sm: "xs" }} 
              fontWeight="600"
              color={colors.text.secondary}
              letterSpacing="0.5px"
              textTransform="uppercase"
            >
              Expenses
            </Text>
          </VStack>
        </Box>

        {/* Total Card */}
        <Box 
          position="relative"
          minW={{ base: "70px", sm: "85px", lg: "100px" }}
          p={{ base: 3, sm: 3.5 }}
          borderRadius="xl"
          bg={cardBg}
          background={cardBgGradient}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15), 0 4px 10px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('rgba(59, 130, 246, 0.3)', 'rgba(96, 165, 250, 0.4)'),
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          sx={{
            animation: `${animations.slideIn} 0.5s ease-out`,
          }}
          overflow="hidden"
        >
          {/* Accent bar */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="2px"
            bg={totalGradient}
          />
          <VStack spacing={1.5} align="center">
            <HStack spacing={1.5} align="center">
              <Icon as={Activity} boxSize={4} color={useColorModeValue('#3b82f6', '#60a5fa')} />
              <Text 
                fontSize={{ base: "xl", sm: "2xl", md: "3xl" }} 
                fontWeight="800" 
                bgGradient={totalGradient}
                bgClip="text"
                lineHeight="1"
              >
                {totalTransactions}
              </Text>
            </HStack>
            <Text 
              fontSize={{ base: "2xs", sm: "xs" }} 
              fontWeight="600"
              color={colors.text.secondary}
              letterSpacing="0.5px"
              textTransform="uppercase"
            >
              Total
            </Text>
          </VStack>
        </Box>
      </HStack>

      {/* Modern Bar Chart */}
      <Box
        position="relative"
        p={{ base: 5, sm: 6, md: 8 }}
        borderRadius="2xl"
        bg={cardBg}
        background={cardBgGradient}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)"
        _hover={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)',
        }}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        sx={{
          animation: `${animations.slideIn} 0.6s ease-out`,
        }}
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
            bg={useColorModeValue('blue.50', 'blue.900')}
            color={useColorModeValue('blue.600', 'blue.300')}
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
                <stop offset="0%" stopColor={useColorModeValue('#10b981', '#22c55e')} stopOpacity={1}/>
                <stop offset="100%" stopColor={useColorModeValue('#059669', '#16a34a')} stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={useColorModeValue('#ef4444', '#f87171')} stopOpacity={1}/>
                <stop offset="100%" stopColor={useColorModeValue('#dc2626', '#ef4444')} stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridStroke}
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
                stroke: borderColor,
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
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
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
