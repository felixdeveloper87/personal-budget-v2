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
import { VStack, Text, HStack, Box, Badge, useBreakpointValue } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface IncomeChartProps {
  transactions: any[]
  selectedPeriod: string
}

export default function IncomeChart({ transactions, selectedPeriod }: IncomeChartProps) {
  const colors = useThemeColors()
  const chartHeight = useBreakpointValue({ base: 250, sm: 280, md: 300, lg: 350 })
  const smallChartHeight = useBreakpointValue({ base: 200, sm: 230, md: 250, lg: 300 })

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

  return (
    <VStack spacing={{ base: 4, sm: 5, md: 6 }} align="stretch">
      {/* Estatísticas rápidas - responsivas para iPhone */}
      <HStack 
        spacing={{ base: 3, sm: 4, md: 6 }} 
        justify="center" 
        wrap="wrap"
        gap={{ base: 2, sm: 3 }}
      >
        <Box textAlign="center" minW={{ base: "80px", sm: "100px", lg: "120px" }}>
          <Text 
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="green.500"
          >
            £{totalIncome.toFixed(2)}
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Total Income
          </Text>
        </Box>
        <Box textAlign="center" minW={{ base: "80px", sm: "100px", lg: "120px" }}>
          <Text 
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="blue.500"
          >
            {incomeTransactions.length}
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Transactions
          </Text>
        </Box>
        <Box textAlign="center" minW={{ base: "80px", sm: "100px", lg: "120px" }}>
          <Text 
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="purple.500"
          >
            £{avgIncome.toFixed(2)}
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Average
          </Text>
        </Box>
      </HStack>

      <Box>
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
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
              formatter={(value) => [`£${value}`, 'Amount']}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Gráfico de linha - tendência temporal */}
      <Box>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
              formatter={(value) => [`£${value}`, 'Amount']}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#38A169" 
              strokeWidth={2}
              dot={{ fill: '#38A169', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

    </VStack>
  )
}
