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
import { VStack, Text, HStack, Box, Badge, useBreakpointValue, useColorModeValue, Spinner, Center } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles, animations } from '../../ui'

interface IncomeChartProps {
  transactions: any[]
  selectedPeriod: string
}

export default function IncomeChart({ transactions, selectedPeriod }: IncomeChartProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const chartHeight = useBreakpointValue({ base: 250, sm: 280, md: 300, lg: 350 })
  const smallChartHeight = useBreakpointValue({ base: 200, sm: 230, md: 250, lg: 300 })
  
  // Move all useColorModeValue calls to the top
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const spinnerColor = useColorModeValue('blue.500', 'blue.300')
  const gridStroke = useColorModeValue('#E2E8F0', '#4A5568')
  const legendBg = useColorModeValue('gray.50', 'gray.700')
  const legendHoverBg = useColorModeValue('gray.100', 'gray.600')

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
      {/* Estatísticas rápidas - responsivas para iPhone */}
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
            color="green.500"
            mb={1}
          >
            £{totalIncome.toFixed(2)}
          </Text>
          <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={colors.text.secondary}>
            Total Income
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
            {incomeTransactions.length}
          </Text>
          <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={colors.text.secondary}>
            Transactions
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
            £{avgIncome.toFixed(2)}
          </Text>
          <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={colors.text.secondary}>
            Average
          </Text>
        </Box>
      </HStack>

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
          Income Distribution
        </Text>
        <ResponsiveContainer width="100%" height={smallChartHeight}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legenda compacta responsiva */}
        <Box mt={3}>
          <VStack spacing={1} align="stretch">
            {pieData.map((entry, index) => {
              const percentage = ((entry.value / totalIncome) * 100).toFixed(1)
              return (
                <HStack 
                  key={`legend-${index}`}
                  justify="space-between" 
                  align="center"
                  p={2}
                  borderRadius="md"
                  bg={legendBg}
                  _hover={{
                    bg: legendHoverBg,
                    transform: 'translateX(2px)',
                  }}
                  transition="all 0.2s ease"
                  sx={{
                    animation: `${animations.slideIn} ${0.8 + index * 0.1}s ease-out`,
                  }}
                >
                  <HStack spacing={2} align="center" minW={0} flex={1}>
                    <Box
                      w={3}
                      h={3}
                      borderRadius="sm"
                      bg={entry.color}
                      flexShrink={0}
                    />
                    <Text 
                      fontSize={{ base: 'xs', sm: 'sm' }}
                      fontWeight="500"
                      color={colors.text.primary}
                      isTruncated
                    >
                      {entry.name}
                    </Text>
                  </HStack>
                  <HStack spacing={2} align="center" flexShrink={0}>
                    <Text 
                      fontSize={{ base: 'xs', sm: 'sm' }}
                      fontWeight="bold"
                      color={colors.text.primary}
                    >
                      £{entry.value.toFixed(2)}
                    </Text>
                    <Text 
                      fontSize={{ base: 'xs', sm: 'sm' }}
                      color={colors.text.secondary}
                      fontWeight="500"
                    >
                      {percentage}%
                    </Text>
                  </HStack>
                </HStack>
              )
            })}
          </VStack>
        </Box>
      </Box>

      {/* Gráfico de linha - tendência temporal */}
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
          Income Timeline
        </Text>
        <ResponsiveContainer width="100%" height={smallChartHeight}>
          <LineChart data={timelineData}>
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
              formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Amount']}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#38A169" 
              strokeWidth={3}
              dot={{ fill: '#38A169', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#38A169', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

    </VStack>
  )
}
