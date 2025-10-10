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
import { VStack, Text, HStack, Box, useBreakpointValue } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface TransactionsChartProps {
  transactions: any[]
  selectedPeriod: string
}

export default function TransactionsChart({ transactions, selectedPeriod }: TransactionsChartProps) {
  const colors = useThemeColors()
  const chartHeight = useBreakpointValue({ base: 250, sm: 280, md: 300, lg: 350 })
  const smallChartHeight = useBreakpointValue({ base: 200, sm: 230, md: 250, lg: 300 })

  // Dados para o gráfico de barras - transações por dia
  const dailyData = transactions.reduce((acc: any[], transaction: any) => {
    const date = new Date(transaction.dateTime).toLocaleDateString('en-US', { 
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
      const date = new Date(t.dateTime).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      return date === a.date
    })
    const transactionsB = transactions.filter(t => {
      const date = new Date(t.dateTime).toLocaleDateString('en-US', { 
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

  return (
    <VStack spacing={{ base: 4, sm: 5, md: 6 }} align="stretch">
      {/* Estatísticas rápidas - responsivas para iPhone */}
      <HStack 
        spacing={{ base: 3, sm: 4, md: 6 }} 
        justify="center" 
        wrap="wrap"
        gap={{ base: 2, sm: 3 }}
      >
        <Box textAlign="center" minW={{ base: "70px", sm: "90px", lg: "110px" }}>
          <Text 
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="green.500"
          >
            {incomeCount}
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Income
          </Text>
        </Box>
        <Box textAlign="center" minW={{ base: "70px", sm: "90px", lg: "110px" }}>
          <Text 
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="red.500"
          >
            {expenseCount}
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Expenses
          </Text>
        </Box>
        <Box textAlign="center" minW={{ base: "70px", sm: "90px", lg: "110px" }}>
          <Text 
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="blue.500"
          >
            {totalTransactions}
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Total
          </Text>
        </Box>
      </HStack>

      {/* Gráfico de barras - transações por dia */}
      <Box>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="#38A169" name="Income" />
            <Bar dataKey="expense" fill="#E53E3E" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Gráfico de pizza - distribuição por tipo
      <Box>
        <Text 
          fontSize={{ base: "md", sm: "lg" }} 
          fontWeight="semibold" 
          mb={{ base: 3, sm: 4 }} 
          color={colors.text.label}
        >
          Transaction Type Distribution
        </Text>
        <ResponsiveContainer width="100%" height={smallChartHeight}>
          <PieChart>
            <Pie
              data={typeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {typeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box> */}
    </VStack>
  )
}
