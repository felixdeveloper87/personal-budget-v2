import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  useColorModeValue,
  Divider,
  Collapse,
  Button,
  useDisclosure
} from '@chakra-ui/react'
import { TrendingUp, TrendingDown, Calendar, DollarSign, BarChart3, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { useTransactionInsights } from '../../hooks/useTransactionInsights'
import { Transaction } from '../../types'

interface InsightsCardProps {
  transactions: Transaction[]
  selectedPeriod: string
  cardType: 'transactions' | 'income' | 'expenses' | 'balance'
}

export default function InsightsCard({ transactions, selectedPeriod, cardType }: InsightsCardProps) {
  const { isOpen, onToggle } = useDisclosure()
  const insights = useTransactionInsights(transactions, selectedPeriod)
  
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(30, 41, 59, 0.8)')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const iconColor = useColorModeValue('blue.500', 'blue.300')
  const badgeColor = useColorModeValue('blue.100', 'blue.900')
  const badgeTextColor = useColorModeValue('blue.700', 'blue.200')

  const getCardSpecificInsights = () => {
    const specificInsights: string[] = []
    
    switch (cardType) {
      case 'transactions':
        if (insights.totalTransactions > 0) {
          specificInsights.push(`Total of ${insights.totalTransactions} transactions`)
          if (insights.mostActiveDay) {
            specificInsights.push(`${insights.mostActiveDay} is your most active day`)
          }
          if (insights.mostUsedCategory) {
            specificInsights.push(`Favorite category: ${insights.mostUsedCategory}`)
          }
        }
        break
        
      case 'income':
        if (insights.totalIncome > 0) {
          specificInsights.push(`Total income: £${insights.totalIncome.toFixed(2)}`)
          if (insights.highestTransaction && insights.highestTransaction.type === 'INCOME') {
            const date = new Date(insights.highestTransaction.dateTime).toLocaleDateString('en-US')
            specificInsights.push(`Highest income: £${insights.highestTransaction.amount.toFixed(2)} on ${date}`)
          }
          // Only show average if it's not a single day and there are multiple income days
          if (insights.averageIncomePerDay > 0 && selectedPeriod !== 'day') {
            const periodLabel = selectedPeriod === 'week' ? 'per day' : 
                              selectedPeriod === 'month' ? 'per day' : 
                              selectedPeriod === 'year' ? 'per day' : 'average'
            specificInsights.push(`Average income ${periodLabel}: £${insights.averageIncomePerDay.toFixed(2)}`)
          }
        }
        break
        
      case 'expenses':
        if (insights.totalExpense > 0) {
          specificInsights.push(`Total expenses: £${insights.totalExpense.toFixed(2)}`)
          if (insights.highestTransaction && insights.highestTransaction.type === 'EXPENSE') {
            const date = new Date(insights.highestTransaction.dateTime).toLocaleDateString('en-US')
            specificInsights.push(`Highest expense: £${insights.highestTransaction.amount.toFixed(2)} on ${date}`)
          }
          // Only show average if it's not a single day and there are multiple expense days
          if (insights.averageExpensePerDay > 0 && selectedPeriod !== 'day') {
            const periodLabel = selectedPeriod === 'week' ? 'per day' : 
                              selectedPeriod === 'month' ? 'per day' : 
                              selectedPeriod === 'year' ? 'per day' : 'average'
            specificInsights.push(`Average expense ${periodLabel}: £${insights.averageExpensePerDay.toFixed(2)}`)
          }
        }
        break
        
      case 'balance':
        if (insights.netBalance !== 0) {
          if (insights.netBalance > 0) {
            specificInsights.push(`Positive balance: £${insights.netBalance.toFixed(2)}`)
          } else {
            specificInsights.push(`Negative balance: £${Math.abs(insights.netBalance).toFixed(2)}`)
          }
          specificInsights.push(`Income: £${insights.totalIncome.toFixed(2)}`)
          specificInsights.push(`Expenses: £${insights.totalExpense.toFixed(2)}`)
        }
        break
    }
    
    return specificInsights
  }

  const cardSpecificInsights = getCardSpecificInsights()
  const hasInsights = cardSpecificInsights.length > 0

  if (!hasInsights) return null

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      p={4}
      backdropFilter="blur(10px)"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        borderColor: useColorModeValue('blue.200', 'blue.400')
      }}
      transition="all 0.2s ease"
    >
      <VStack spacing={3} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Icon as={Lightbulb} boxSize={4} color={iconColor} />
            <Text
              fontSize="sm"
              fontWeight="600"
              color={textColor}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              Period Insights
            </Text>
          </HStack>
          
          <Button
            size="xs"
            variant="ghost"
            onClick={onToggle}
            rightIcon={<Icon as={isOpen ? ChevronUp : ChevronDown} boxSize={3} />}
            color={textColor}
            _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
          >
            {isOpen ? 'Less' : 'Show more'}
          </Button>
        </HStack>

        {/* Insights principais (sempre visíveis) */}
        <VStack spacing={2} align="stretch">
          {cardSpecificInsights.slice(0, 2).map((insight, index) => (
            <HStack key={index} spacing={2}>
              <Icon 
                as={cardType === 'income' ? TrendingUp : 
                    cardType === 'expenses' ? TrendingDown : 
                    cardType === 'balance' ? DollarSign : BarChart3} 
                boxSize={3} 
                color={iconColor} 
              />
              <Text fontSize="xs" color={textColor} fontFamily="system-ui, -apple-system, sans-serif">
                {insight}
              </Text>
            </HStack>
          ))}
        </VStack>

        {/* Insights adicionais (colapsáveis) */}
        <Collapse in={isOpen} animateOpacity>
          <VStack spacing={2} align="stretch">
            <Divider />
            {cardSpecificInsights.slice(2).map((insight, index) => (
              <HStack key={index + 2} spacing={2}>
                <Icon 
                  as={Calendar} 
                  boxSize={3} 
                  color={useColorModeValue('gray.400', 'gray.500')} 
                />
                <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} fontFamily="system-ui, -apple-system, sans-serif">
                  {insight}
                </Text>
              </HStack>
            ))}
            
            {/* Badge de tendência */}
            {insights.transactionTrend !== 'stable' && (
              <Badge
                colorScheme={insights.transactionTrend === 'increasing' ? 'green' : 'red'}
                variant="subtle"
                size="sm"
                alignSelf="flex-start"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {insights.transactionTrend === 'increasing' ? '📈 Growing trend' : '📉 Declining trend'}
              </Badge>
            )}
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  )
}
