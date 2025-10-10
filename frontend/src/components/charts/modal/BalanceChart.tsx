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
import { VStack, Text, HStack, Box, Badge, Stat, StatNumber, StatHelpText, useBreakpointValue } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface BalanceChartProps {
  transactions: any[]
  selectedPeriod: string
  currentBalance: number
}

export default function BalanceChart({ transactions, selectedPeriod, currentBalance }: BalanceChartProps) {
  const colors = useThemeColors()
  const chartHeight = useBreakpointValue({ base: 250, sm: 280, md: 300, lg: 350 })
  const smallChartHeight = useBreakpointValue({ base: 200, sm: 230, md: 250, lg: 300 })

  // Calcular saldo acumulado ao longo do tempo
  const balanceData = transactions
    .sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .reduce((acc: any[], transaction: any, index: number) => {
      const date = new Date(transaction.dateTime).toLocaleDateString('en-US', { 
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

  return (
    <VStack spacing={{ base: 4, sm: 5, md: 6 }} align="stretch">
      {/* Estatísticas principais - responsivas para iPhone */}
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
            color={currentBalance >= 0 ? "green.500" : "red.500"}
          >
            £{currentBalance.toFixed(2)}
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Current Balance
          </Text>
        </Box>
        <Box textAlign="center" minW={{ base: "80px", sm: "100px", lg: "120px" }}>
          <Text 
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="blue.500"
          >
            {savingsRate.toFixed(1)}%
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Savings Rate
          </Text>
        </Box>
        <Box textAlign="center" minW={{ base: "80px", sm: "100px", lg: "120px" }}>
          <Text 
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color="purple.500"
          >
            £{balanceRange.toFixed(2)}
          </Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color={colors.text.secondary}>
            Balance Range
          </Text>
        </Box>
      </HStack>

      {/* Gráfico de área - evolução do saldo */}
      {/* <Box>
        <Text 
          fontSize={{ base: "md", sm: "lg" }} 
          fontWeight="semibold" 
          mb={{ base: 3, sm: 4 }} 
          color={colors.text.label}
        >
          Balance Evolution Over Time
        </Text>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={balanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
              formatter={(value) => [`£${value}`, 'Balance']}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke={currentBalance >= 0 ? "#38A169" : "#E53E3E"}
              fill={currentBalance >= 0 ? "#38A169" : "#E53E3E"}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box> */}

      {/* Gráfico de linha - saldo com pontos de inflexão */}
      <Box>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
              formatter={(value) => [`£${value}`, 'Balance']}
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
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Gráfico de barras - receitas vs despesas diárias */}
      <Box>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
              formatter={(value, name) => [`£${value}`, name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Net']}
            />
            <Bar dataKey="income" fill="#38A169" name="Income" />
            <Bar dataKey="expense" fill="#E53E3E" name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Análise de saúde financeira */}
      <Box>
        <Text 
          fontSize={{ base: "md", sm: "lg" }} 
          fontWeight="semibold" 
          mb={{ base: 3, sm: 4 }} 
          color={colors.text.label}
        >
          Financial Health Analysis
        </Text>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" p={3} bg={colors.cardBg} borderRadius="md">
            <Text fontWeight="medium">Savings Rate</Text>
            <HStack spacing={2}>
              <Badge colorScheme={savingsRate > 20 ? "green" : savingsRate > 10 ? "yellow" : "red"}>
                {savingsRate.toFixed(1)}%
              </Badge>
              <Text fontSize="sm" color={colors.text.secondary}>
                {savingsRate > 20 ? "Excellent" : savingsRate > 10 ? "Good" : "Needs Improvement"}
              </Text>
            </HStack>
          </HStack>

          <HStack justify="space-between" p={3} bg={colors.cardBg} borderRadius="md">
            <Text fontWeight="medium">Balance Trend</Text>
            <HStack spacing={2}>
              <Badge colorScheme={currentBalance >= 0 ? "green" : "red"}>
                {currentBalance >= 0 ? "Positive" : "Negative"}
              </Badge>
              <Text fontSize="sm" color={colors.text.secondary}>
                {currentBalance >= 0 ? "Growing wealth" : "Spending more than earning"}
              </Text>
            </HStack>
          </HStack>

          <HStack justify="space-between" p={3} bg={colors.cardBg} borderRadius="md">
            <Text fontWeight="medium">Financial Stability</Text>
            <HStack spacing={2}>
              <Badge colorScheme={balanceRange > 0 ? "green" : "gray"}>
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
