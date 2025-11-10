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
import { VStack, Text, HStack, Box, useBreakpointValue, useColorModeValue, Spinner, Center, Badge, Icon } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { animations } from '../../ui'
import { Transaction } from '../../../types'
import { Wallet, TrendingUp, Percent } from 'lucide-react'

interface BalanceChartProps {
  transactions: Transaction[]
  selectedPeriod: string
  currentBalance: number
}

export default function BalanceChart({ transactions, selectedPeriod, currentBalance }: BalanceChartProps) {
  const colors = useThemeColors()
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
  const balanceGradient = useColorModeValue(
    currentBalance >= 0 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    currentBalance >= 0
      ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
      : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
  )
  const savingsGradient = useColorModeValue(
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
  )
  const incomeGradient = useColorModeValue(
    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
  )
  
  // Modern colors
  const balanceColor = useColorModeValue(
    currentBalance >= 0 ? '#10b981' : '#ef4444',
    currentBalance >= 0 ? '#22c55e' : '#f87171'
  )
  const savingsColor = useColorModeValue('#3b82f6', '#60a5fa')
  const incomeColor = useColorModeValue('#8b5cf6', '#a78bfa')
  
  // Hover border colors
  const balanceHoverBorderLight = currentBalance >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
  const balanceHoverBorderDark = currentBalance >= 0 ? 'rgba(34, 197, 94, 0.4)' : 'rgba(248, 113, 113, 0.4)'
  const balanceHoverBorder = useColorModeValue(balanceHoverBorderLight, balanceHoverBorderDark)
  const savingsHoverBorder = useColorModeValue('rgba(59, 130, 246, 0.3)', 'rgba(96, 165, 250, 0.4)')
  const incomeHoverBorder = useColorModeValue('rgba(139, 92, 246, 0.3)', 'rgba(167, 139, 250, 0.4)')
  
  // Badge colors
  const balanceBadgeBgLight = currentBalance >= 0 ? 'green.50' : 'red.50'
  const balanceBadgeBgDark = currentBalance >= 0 ? 'green.900' : 'red.900'
  const balanceBadgeBg = useColorModeValue(balanceBadgeBgLight, balanceBadgeBgDark)
  const balanceBadgeColorLight = currentBalance >= 0 ? 'green.600' : 'red.600'
  const balanceBadgeColorDark = currentBalance >= 0 ? 'green.300' : 'red.300'
  const balanceBadgeColor = useColorModeValue(balanceBadgeColorLight, balanceBadgeColorDark)
  const blueBadgeBg = useColorModeValue('blue.50', 'blue.900')
  const blueBadgeColor = useColorModeValue('blue.600', 'blue.300')

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
      {/* Modern Statistics Cards */}
      <HStack 
        spacing={{ base: 2, sm: 3, md: 4 }} 
        justify="center" 
        wrap="wrap"
        gap={{ base: 2, sm: 2 }}
      >
        {/* Current Balance Card */}
        <Box 
          position="relative"
          minW={{ base: "60px", sm: "75px", lg: "90px" }}
          p={{ base: 2.5, sm: 3 }}
          borderRadius="lg"
          bg={cardBg}
          background={cardBgGradient}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: currentBalance >= 0 
              ? '0 10px 25px rgba(16, 185, 129, 0.15), 0 4px 10px rgba(0,0,0,0.1)'
              : '0 10px 25px rgba(239, 68, 68, 0.15), 0 4px 10px rgba(0,0,0,0.1)',
            borderColor: balanceHoverBorder,
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          sx={{
            animation: `${animations.slideIn} 0.3s ease-out`,
          }}
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="2px"
            bg={balanceGradient}
          />
          <VStack spacing={1} align="center">
            <HStack spacing={1} align="center">
              <Icon as={Wallet} boxSize={3.5} color={balanceColor} />
              <Text 
                fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
                fontWeight="800" 
                bgGradient={balanceGradient}
                bgClip="text"
                lineHeight="1"
              >
                £{currentBalance.toFixed(2)}
              </Text>
            </HStack>
            <Text 
              fontSize={{ base: "2xs", sm: "2xs" }} 
              fontWeight="600"
              color={colors.text.secondary}
              letterSpacing="0.5px"
              textTransform="uppercase"
            >
              Current Balance
            </Text>
          </VStack>
        </Box>

        {/* Savings Rate Card */}
        <Box 
          position="relative"
          minW={{ base: "60px", sm: "75px", lg: "90px" }}
          p={{ base: 2.5, sm: 3 }}
          borderRadius="lg"
          bg={cardBg}
          background={cardBgGradient}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15), 0 4px 10px rgba(0,0,0,0.1)',
            borderColor: savingsHoverBorder,
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          sx={{
            animation: `${animations.slideIn} 0.4s ease-out`,
          }}
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="2px"
            bg={savingsGradient}
          />
          <VStack spacing={1} align="center">
            <HStack spacing={1} align="center">
              <Icon as={Percent} boxSize={3.5} color={savingsColor} />
              <Text 
                fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
                fontWeight="800" 
                bgGradient={savingsGradient}
                bgClip="text"
                lineHeight="1"
              >
                {totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : '0.0'}%
              </Text>
            </HStack>
            <Text 
              fontSize={{ base: "2xs", sm: "2xs" }} 
              fontWeight="600"
              color={colors.text.secondary}
              letterSpacing="0.5px"
              textTransform="uppercase"
            >
              Savings Rate
            </Text>
          </VStack>
        </Box>

        {/* Total Income Card */}
        <Box 
          position="relative"
          minW={{ base: "60px", sm: "75px", lg: "90px" }}
          p={{ base: 2.5, sm: 3 }}
          borderRadius="lg"
          bg={cardBg}
          background={cardBgGradient}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 25px rgba(139, 92, 246, 0.15), 0 4px 10px rgba(0,0,0,0.1)',
            borderColor: incomeHoverBorder,
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          sx={{
            animation: `${animations.slideIn} 0.5s ease-out`,
          }}
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="2px"
            bg={incomeGradient}
          />
          <VStack spacing={1} align="center">
            <HStack spacing={1} align="center">
              <Icon as={TrendingUp} boxSize={3.5} color={incomeColor} />
              <Text 
                fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
                fontWeight="800" 
                bgGradient={incomeGradient}
                bgClip="text"
                lineHeight="1"
              >
                £{totalIncome.toFixed(2)}
              </Text>
            </HStack>
            <Text 
              fontSize={{ base: "2xs", sm: "2xs" }} 
              fontWeight="600"
              color={colors.text.secondary}
              letterSpacing="0.5px"
              textTransform="uppercase"
            >
              Total Income
            </Text>
          </VStack>
        </Box>
      </HStack>

      {/* Modern Balance Trend Chart */}
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
            bg={balanceBadgeBg}
            color={balanceBadgeColor}
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
                <stop offset="0%" stopColor={balanceColor} stopOpacity={0.3}/>
                <stop offset="100%" stopColor={balanceColor} stopOpacity={0}/>
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
              formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Balance']}
              cursor={{ stroke: balanceColor, strokeWidth: 2, strokeDasharray: '5 5' }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke={balanceColor}
              strokeWidth={3}
              dot={{ 
                fill: balanceColor, 
                strokeWidth: 2, 
                r: 5,
                stroke: cardBg
              }}
              activeDot={{ 
                r: 7, 
                stroke: balanceColor, 
                strokeWidth: 2,
                fill: cardBg
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Modern Daily Comparison Chart */}
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
          animation: `${animations.slideIn} 0.7s ease-out`,
        }}
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
            bg={blueBadgeBg}
            color={blueBadgeColor}
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
                <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="expenseBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
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
