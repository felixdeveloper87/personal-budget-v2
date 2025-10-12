import {
  SimpleGrid,
  Stat,
  StatNumber,
  StatHelpText,
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

/**
 * 📊 SingleRowSummary - Componente base para resumo financeiro
 * - Componente simples e reutilizável
 * - Sem UI/UX complexa (fica nas sections)
 * - Focado na funcionalidade básica
 */
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
      label: 'Transactions',
      icon: BarChart3,
      color: 'blue.500',
      bgColor: 'blue.50',
      darkBgColor: 'blue.900',
      helpText: 'Total transactions',
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
      color: 'purple.500',
      bgColor: 'purple.50',
      darkBgColor: 'purple.900',
      helpText: 'Current balance',
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

            <Text 
              fontSize={{ base: '2xs', sm: 'xs' }}
              color={colors.text.secondary}
              fontWeight="400"
              opacity={0.8}
            >
              Complete financial overview for the selected period
            </Text>

            <Divider />

            <SimpleGrid
              columns={{ base: 2, sm: 4 }}
              spacing={{ base: 3, sm: 4, md: 6 }}
              w="full"
            >
              {stats.map((stat) => {
                const IconComponent = stat.icon
                return (
                  <Stat
                    key={stat.id}
                    textAlign="center"
                    p={{ base: 3, sm: 4, md: 5 }}
                    borderRadius="xl"
                    bg={colors.cardBg}
                    border="1px"
                    borderColor={colors.border}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                      borderColor: stat.color,
                    }}
                    onClick={() => handleCardClick(stat.id)}
                  >
                    <VStack spacing={2}>
                      <IconComponent size={20} color={stat.color} />
                      <StatNumber
                        fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
                        fontWeight="700"
                        color={colors.text.label}
                      >
                        {stat.displayValue}
                      </StatNumber>
                      <StatHelpText
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        fontWeight="500"
                        color={colors.text.secondary}
                        m={0}
                      >
                        {stat.label}
                      </StatHelpText>
                    </VStack>
                  </Stat>
                )
              })}
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

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