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
import { VStack, Text, HStack, Box, Badge, useBreakpointValue, useColorModeValue, Spinner, Center, Icon } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles, animations } from '../../ui'
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react'

interface IncomeChartProps {
  transactions: any[]
  selectedPeriod: string
}

export default function IncomeChart({ transactions, selectedPeriod }: IncomeChartProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const chartHeight = useBreakpointValue({ base: 280, sm: 320, md: 360, lg: 400 })
  const smallChartHeight = useBreakpointValue({ base: 250, sm: 280, md: 300, lg: 350 })
  const pieOuterRadius = useBreakpointValue({ base: 70, sm: 85, md: 100 })
  
  // Modern color palette
  const cardBg = useColorModeValue('white', '#0a0a0a')
  const cardBgGradient = useColorModeValue(
    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)'
  )
  const borderColor = useColorModeValue('rgba(226, 232, 240, 0.8)', 'rgba(75, 85, 99, 0.3)')
  const spinnerColor = useColorModeValue('blue.500', 'blue.300')
  const gridStroke = useColorModeValue('rgba(226, 232, 240, 0.5)', 'rgba(75, 85, 99, 0.2)')
  const legendBg = useColorModeValue('rgba(16, 185, 129, 0.05)', 'rgba(34, 197, 94, 0.1)')
  const legendHoverBg = useColorModeValue('rgba(16, 185, 129, 0.1)', 'rgba(34, 197, 94, 0.15)')
  
  // Modern gradient colors
  const incomeGradient = useColorModeValue(
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
  )
  const transactionsGradient = useColorModeValue(
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
  )
  const averageGradient = useColorModeValue(
    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
  )
  
  // Modern colors
  const incomeColor = useColorModeValue('#10b981', '#22c55e')
  const transactionsColor = useColorModeValue('#3b82f6', '#60a5fa')
  const averageColor = useColorModeValue('#8b5cf6', '#a78bfa')
  
  // Hover border colors
  const incomeHoverBorder = useColorModeValue('rgba(16, 185, 129, 0.3)', 'rgba(34, 197, 94, 0.4)')
  const transactionsHoverBorder = useColorModeValue('rgba(59, 130, 246, 0.3)', 'rgba(96, 165, 250, 0.4)')
  const averageHoverBorder = useColorModeValue('rgba(139, 92, 246, 0.3)', 'rgba(167, 139, 250, 0.4)')
  
  // Badge colors
  const greenBadgeBg = useColorModeValue('green.50', 'green.900')
  const greenBadgeColor = useColorModeValue('green.600', 'green.300')
  const grayBadgeBg = useColorModeValue('gray.100', 'gray.700')

  // Filtrar apenas transações de receita
  const incomeTransactions = transactions.filter(t => t.type === 'INCOME')

  // Dados para gráfico de barras - receitas por categoria
  const categoryData = incomeTransactions.reduce((acc: any[], transaction: any) => {
    const category = transaction.category || 'Uncategorized'
    const existing = acc.find((item: any) => item.category === category)
    
    if (existing) {
      existing.amount += transaction.amount
      existing.count += 1
    } else {
      acc.push({
        category,
        amount: transaction.amount,
        count: 1
      })
    }
    
    return acc
  }, []).sort((a: any, b: any) => b.amount - a.amount)

  // Dados para gráfico de pizza - distribuição por categoria
  const pieData = categoryData.map((item, index) => ({
    name: item.category,
    value: item.amount,
    color: `hsl(${(index * 137.5) % 360}, 70%, 50%)` // Cores diferentes para cada categoria
  }))

  // Dados para gráfico de linha - tendência temporal
  const timelineData = incomeTransactions
    .sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .reduce((acc: any[], transaction: any) => {
      const date = new Date(transaction.dateTime).toLocaleDateString('en-GB', { 
        month: 'short', 
        day: 'numeric' 
      })
      const existing = acc.find((item: any) => item.date === date)
      
      if (existing) {
        existing.amount += transaction.amount
      } else {
        acc.push({
          date,
          amount: transaction.amount
        })
      }
      
      return acc
    }, [])

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const avgIncome = incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0

  // Loading state
  if (incomeTransactions.length === 0) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="lg" color={spinnerColor} thickness="3px" />
          <Text color={colors.text.secondary} fontSize="sm">
            Loading income data...
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
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15), 0 4px 10px rgba(0,0,0,0.1)',
            borderColor: incomeHoverBorder,
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
            bg={incomeGradient}
          />
          <VStack spacing={1} align="center">
            <HStack spacing={1} align="center">
              <Icon as={DollarSign} boxSize={3.5} color={incomeColor} />
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

        {/* Transactions Card */}
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
            borderColor: transactionsHoverBorder,
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
            bg={transactionsGradient}
          />
          <VStack spacing={1} align="center">
            <HStack spacing={1} align="center">
              <Icon as={BarChart3} boxSize={3.5} color={transactionsColor} />
              <Text 
                fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
                fontWeight="800" 
                bgGradient={transactionsGradient}
                bgClip="text"
                lineHeight="1"
              >
                {incomeTransactions.length}
              </Text>
            </HStack>
            <Text 
              fontSize={{ base: "2xs", sm: "2xs" }} 
              fontWeight="600"
              color={colors.text.secondary}
              letterSpacing="0.5px"
              textTransform="uppercase"
            >
              Transactions
            </Text>
          </VStack>
        </Box>

        {/* Average Card */}
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
            borderColor: averageHoverBorder,
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
            bg={averageGradient}
          />
          <VStack spacing={1} align="center">
            <HStack spacing={1} align="center">
              <Icon as={TrendingUp} boxSize={3.5} color={averageColor} />
              <Text 
                fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
                fontWeight="800" 
                bgGradient={averageGradient}
                bgClip="text"
                lineHeight="1"
              >
                £{avgIncome.toFixed(2)}
              </Text>
            </HStack>
            <Text 
              fontSize={{ base: "2xs", sm: "2xs" }} 
              fontWeight="600"
              color={colors.text.secondary}
              letterSpacing="0.5px"
              textTransform="uppercase"
            >
              Average
            </Text>
          </VStack>
        </Box>
      </HStack>

      {/* Modern Pie Chart */}
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
              Income Distribution
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
            bg={greenBadgeBg}
            color={greenBadgeColor}
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
              stroke={cardBg}
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
              const percentage = ((entry.value / totalIncome) * 100).toFixed(1)
              return (
                <HStack 
                  key={`legend-${index}`}
                  justify="space-between" 
                  align="center"
                  p={3}
                  borderRadius="xl"
                  bg={legendBg}
                  border="1px solid"
                  borderColor={borderColor}
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
                      bg={grayBadgeBg}
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
              Income Timeline
            </Text>
            <Text 
              fontSize={{ base: "xs", sm: "sm" }} 
              color={colors.text.secondary}
              fontWeight="500"
            >
              Daily income trend
            </Text>
          </VStack>
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            bg={greenBadgeBg}
            color={greenBadgeColor}
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
              <linearGradient id="incomeLineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={incomeColor} stopOpacity={0.3}/>
                <stop offset="100%" stopColor={incomeColor} stopOpacity={0}/>
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
              formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Amount']}
              cursor={{ stroke: incomeColor, strokeWidth: 2, strokeDasharray: '5 5' }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke={incomeColor}
              strokeWidth={3}
              dot={{ 
                fill: incomeColor, 
                strokeWidth: 2, 
                r: 5,
                stroke: cardBg
              }}
              activeDot={{ 
                r: 7, 
                stroke: incomeColor, 
                strokeWidth: 2,
                fill: cardBg
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

    </VStack>
  )
}
