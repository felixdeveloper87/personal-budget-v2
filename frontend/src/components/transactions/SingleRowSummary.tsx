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
  Divider,
  useDisclosure,
} from '@chakra-ui/react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
} from 'lucide-react'
import { PeriodData } from '../../hooks/usePeriodData'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useMemo, useState } from 'react'
import SummaryCardModal from './SummaryCardModal'

// ✅ Tipagem explícita dos tipos válidos de card
type CardId = 'transactions' | 'income' | 'expenses' | 'balance'

interface SingleRowSummaryProps {
  periodData: PeriodData
}

export default function SingleRowSummary({ periodData }: SingleRowSummaryProps) {
  const { transactions, income, expense, balance, label } = periodData
  const colors = useThemeColors()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null)

  const { incomeTransactions, expenseTransactions } = useMemo(() => {
    return {
      incomeTransactions: transactions.filter(t => t.type === 'INCOME').length,
      expenseTransactions: transactions.filter(t => t.type === 'EXPENSE').length,
    }
  }, [transactions])

  // ✅ Define stats com tipo inferido corretamente
  const stats: {
    id: CardId
    label: string
    icon: any
    color: string
    bgColor: string
    darkBgColor: string
    helpText: string
    displayValue: string
  }[] = [
    {
      id: 'transactions',
      label: 'Total Transactions',
      icon: BarChart3,
      color: 'blue.500',
      bgColor: 'blue.50',
      darkBgColor: 'blue.900',
      helpText: `${incomeTransactions} income, ${expenseTransactions} expense`,
      displayValue: transactions.length.toString(),
    },
    {
      id: 'income',
      label: 'Income',
      icon: TrendingUp,
      color: 'green.500',
      bgColor: 'green.50',
      darkBgColor: 'green.900',
      helpText: 'Total income',
      displayValue: `£${income.toFixed(2)}`,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: TrendingDown,
      color: 'red.500',
      bgColor: 'red.50',
      darkBgColor: 'red.900',
      helpText: 'Total expenses',
      displayValue: `£${expense.toFixed(2)}`,
    },
    {
      id: 'balance',
      label: 'Balance',
      icon: DollarSign,
      color: balance >= 0 ? 'green.500' : 'red.500',
      bgColor: balance >= 0 ? 'green.50' : 'red.50',
      darkBgColor: balance >= 0 ? 'green.900' : 'red.900',
      helpText: `${balance >= 0 ? 'Positive' : 'Negative'} balance`,
      displayValue: `£${balance.toFixed(2)}`,
    },
  ]

  const handleCardClick = (cardId: CardId) => {
    setSelectedCard(cardId)
    onOpen()
  }

  const selectedLabel =
    selectedCard ? stats.find(s => s.id === selectedCard)?.label ?? undefined : undefined

  return (
    <>
      <Card
        bg={colors.cardBg}
        shadow="lg"
        borderRadius="2xl"
        border="1px"
        borderColor={colors.border}
      >
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
              {stats.map(stat => {
                const IconComponent = stat.icon
                const iconBg = useColorModeValue(stat.bgColor, stat.darkBgColor)

                return (
                  <Card
                    key={stat.id}
                    bg={iconBg}
                    border="1px"
                    borderColor={useColorModeValue('gray.100', 'gray.700')}
                    borderRadius="xl"
                    shadow="sm"
                    cursor="pointer"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'md',
                    }}
                    transition="all 0.2s"
                    onClick={() => handleCardClick(stat.id)}
                  >
                    <CardBody p={6}>
                      <VStack spacing={4} align="center">
                        <HStack spacing={3} align="center">
                          <IconComponent size={20} color={stat.color} />
                          <Text
                            fontSize="sm"
                            fontWeight="600"
                            color={colors.text.label}
                          >
                            {stat.label}
                          </Text>
                        </HStack>
                        <Stat textAlign="center">
                          <StatNumber
                            fontSize="2xl"
                            fontWeight="700"
                            color={stat.color}
                          >
                            {stat.displayValue}
                          </StatNumber>
                          <StatHelpText
                            fontSize="xs"
                            color={colors.text.secondary}
                          >
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

      {/* ✅ Tipagem coerente com SummaryCardModal */}
      <SummaryCardModal
        isOpen={isOpen}
        onClose={onClose}
        selectedCard={selectedCard}
        cardLabel={selectedLabel}
        transactions={transactions}
        selectedPeriod={label}
        currentBalance={balance}
      />
    </>
  )
}
