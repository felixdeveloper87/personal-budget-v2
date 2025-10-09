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
import { VStack, Text, HStack, Box, Badge, Progress } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface ExpensesChartProps {
  transactions: any[]
  selectedPeriod: string
}

export default function ExpensesChart({ transactions, selectedPeriod }: ExpensesChartProps) {
  const colors = useThemeColors()

  // Filtrar apenas transações de despesas
  const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE')

  // Dados para gráfico de barras - despesas por categoria
  const categoryData = expenseTransactions.reduce((acc: any[], transaction: any) => {
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
  const timelineData = expenseTransactions
    .sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .reduce((acc: any[], transaction: any) => {
      const date = new Date(transaction.dateTime).toLocaleDateString('en-US', { 
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

  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  const avgExpense = expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0

  return (
    <VStack spacing={6} align="stretch">
      {/* Estatísticas rápidas */}
      <HStack spacing={6} justify="center">
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="red.500">
            £{totalExpenses.toFixed(2)}
          </Text>
          <Text fontSize="sm" color={colors.text.secondary}>Total Expenses</Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
            {expenseTransactions.length}
          </Text>
          <Text fontSize="sm" color={colors.text.secondary}>Transactions</Text>
        </Box>
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="purple.500">
            £{avgExpense.toFixed(2)}
          </Text>
          <Text fontSize="sm" color={colors.text.secondary}>Average</Text>
        </Box>
      </HStack>

      {/* Gráfico de barras - despesas por categoria */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4} color={colors.text.label}>
          Expenses by Category
        </Text>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
              formatter={(value, name) => [`£${value}`, 'Amount']}
            />
            <Bar dataKey="amount" fill="#E53E3E" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Gráfico de pizza - distribuição por categoria */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4} color={colors.text.label}>
          Expense Distribution
        </Text>
        <ResponsiveContainer width="100%" height={250}>
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
        <Text fontSize="lg" fontWeight="semibold" mb={4} color={colors.text.label}>
          Expense Timeline
        </Text>
        <ResponsiveContainer width="100%" height={250}>
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
              stroke="#E53E3E" 
              strokeWidth={2}
              dot={{ fill: '#E53E3E', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Lista de categorias com detalhes e progresso */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4} color={colors.text.label}>
          Category Breakdown
        </Text>
        <VStack spacing={3} align="stretch">
          {categoryData.map((item, index) => {
            const percentage = (item.amount / totalExpenses) * 100
            return (
              <Box key={item.category} p={3} bg={colors.cardBg} borderRadius="md">
                <HStack justify="space-between" mb={2}>
                  <HStack spacing={3}>
                    <Box w={3} h={3} bg={pieData[index]?.color} borderRadius="sm" />
                    <Text fontWeight="medium">{item.category}</Text>
                    <Badge colorScheme="red" size="sm">{item.count} transactions</Badge>
                  </HStack>
                  <Text fontWeight="bold" color="red.500">
                    £{item.amount.toFixed(2)}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Progress 
                    value={percentage} 
                    colorScheme="red" 
                    size="sm" 
                    flex={1}
                    borderRadius="md"
                  />
                  <Text fontSize="sm" color={colors.text.secondary} minW="50px">
                    {percentage.toFixed(1)}%
                  </Text>
                </HStack>
              </Box>
            )
          })}
        </VStack>
      </Box>
    </VStack>
  )
}
