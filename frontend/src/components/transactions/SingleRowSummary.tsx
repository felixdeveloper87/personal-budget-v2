import { 
  SimpleGrid, 
  Stat, 
  StatNumber, 
  StatHelpText,
  useColorModeValue,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Divider
} from '@chakra-ui/react'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, PieChart, Calculator, FileText, Wallet } from 'lucide-react'
import { PeriodData } from '../../hooks/usePeriodData'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useMemo } from 'react'

interface SingleRowSummaryProps {
  periodData: PeriodData
}

export default function SingleRowSummary({ periodData }: SingleRowSummaryProps) {
  const { transactions, income, expense, balance, label } = periodData
  const colors = useThemeColors()

  // Calcula qtd de transações de cada tipo
  const { incomeTransactions, expenseTransactions } = useMemo(() => {
    return {
      incomeTransactions: transactions.filter(t => t.type === 'INCOME').length,
      expenseTransactions: transactions.filter(t => t.type === 'EXPENSE').length
    }
  }, [transactions])

  const stats = [
    {
      label: 'Total Transactions',
      icon: BarChart3,
      color: 'blue.500',
      bgColor: 'blue.50',
      darkBgColor: 'blue.900',
      helpText: `${incomeTransactions} income, ${expenseTransactions} expense`,
      displayValue: transactions.length.toString()
    },
    {
      label: 'Income',
      icon: TrendingUp,
      color: 'green.500',
      bgColor: 'green.50',
      darkBgColor: 'green.900',
      helpText: 'Total income',
      displayValue: `£${income.toFixed(2)}`
    },
    {
      label: 'Expenses',
      icon: TrendingDown,
      color: 'red.500',
      bgColor: 'red.50',
      darkBgColor: 'red.900',
      helpText: 'Total expenses',
      displayValue: `£${expense.toFixed(2)}`
    },
    {
      label: 'Balance',
      icon: DollarSign,
      color: balance >= 0 ? 'green.500' : 'red.500',
      bgColor: balance >= 0 ? 'green.50' : 'red.50',
      darkBgColor: balance >= 0 ? 'green.900' : 'red.900',
      helpText: `${balance >= 0 ? 'Positive' : 'Negative'} balance`,
      displayValue: `£${balance.toFixed(2)}`
    }
  ]

  return (
    <Card bg={colors.cardBg} shadow="lg" borderRadius="2xl" border="1px" borderColor={colors.border}>
      <CardBody p={{ base: 6, md: 8 }}>
        <VStack spacing={6} align="stretch">
          <HStack spacing={3} align="center">
            <PieChart size={20} color={colors.text.secondary} />
            <Text fontSize="lg" fontWeight="600" color={colors.text.label}>
              Financial Summary
            </Text>
            <Badge colorScheme="blue" borderRadius="full" px={3}>
              {label}
            </Badge>
          </HStack>
          <Text fontSize="sm" color={colors.text.secondary}>
            Complete financial overview for the selected period
          </Text>
          
          <Divider />
          
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            {stats.map((stat) => {
              const IconComponent = stat.icon
              const iconBg = useColorModeValue(stat.bgColor, stat.darkBgColor)
              
              return (
                <Card 
                  key={stat.label}
                  bg={iconBg} 
                  border="1px" 
                  borderColor={useColorModeValue('gray.100', 'gray.700')}
                  borderRadius="xl"
                  shadow="sm"
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'md'
                  }}
                  transition="all 0.2s"
                >
                  <CardBody p={6}>
                    <VStack spacing={4} align="center">
                      <HStack spacing={3} align="center">
                        <IconComponent size={20} color={stat.color} />
                        <Text fontSize="sm" fontWeight="600" color={colors.text.label}>
                          {stat.label}
                        </Text>
                      </HStack>
                      <Stat textAlign="center">
                        <StatNumber fontSize="2xl" fontWeight="700" color={stat.color}>
                          {stat.displayValue}
                        </StatNumber>
                        <StatHelpText fontSize="xs" color={colors.text.secondary}>
                          {stat.helpText}
                        </StatHelpText>
                      </Stat>
                    </VStack>
                  </CardBody>
                </Card>
              )
            })}
          </SimpleGrid>
        </VStack>
      </CardBody>
    </Card>
  )
}
