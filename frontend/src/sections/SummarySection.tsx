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
  Box,
  Icon,
} from '@chakra-ui/react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Sparkles,
} from 'lucide-react'
import { PeriodData } from '../hooks/usePeriodData'
import { useThemeColors } from '../hooks/useThemeColors'
import { useMemo, useState } from 'react'
import SummaryCardModal from '../components/transactions/SummaryCardModal'

// 🎨 Animações personalizadas
const pulse = 'pulse 2s ease-in-out infinite'
const float = 'float 3s ease-in-out infinite'
const shimmer = 'shimmer 3s ease-in-out infinite'

// ✅ Tipagem explícita dos tipos válidos de card
type CardId = 'transactions' | 'income' | 'expenses' | 'balance'

interface SummarySectionProps {
  periodData: PeriodData
}

/**
 * 💰 SummarySection - Financial Summary com UI/UX Aprimorada
 * - Design fluido e intuitivo
 * - Animações e micro-interações
 * - Responsivo para mobile e desktop
 */
export default function SummarySection({ periodData }: SummarySectionProps) {
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
      <Box position="relative">
        {/* Barra colorida animada no topo */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="3px"
          background="linear-gradient(90deg, #3b82f6, #10b981, #ef4444, #8b5cf6)"
          backgroundSize="200% 100%"
          borderRadius="2xl 2xl 0 0"
          zIndex={1}
          sx={{
            animation: `${shimmer} 3s ease-in-out infinite`,
          }}
        />
        <Card
          bg={colors.cardBg}
          shadow="lg"
          borderRadius="2xl"
          border="1px"
          borderColor={colors.border}
        >
          <CardBody p={{ base: 4, sm: 5, md: 6 }}>
            <VStack spacing={4} align="stretch">
              {/* Header compacto */}
              <HStack spacing={3} align="center" justify="center">
                <Icon as={PieChart} boxSize={5} color="blue.500" />
                <Text fontSize="lg" fontWeight="600" color={colors.text.label}>
                  Financial Summary
                </Text>
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                  borderRadius="full"
                  px={3}
                  fontSize="xs"
                >
                  {label}
                </Badge>
              </HStack>

              <Divider />

              {/* Stats Grid 2x2 compacto */}
              <SimpleGrid
                columns={{ base: 2, sm: 2, md: 4 }}
                spacing={{ base: 3, sm: 4, md: 6 }}
                w="full"
              >
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon
                  const isSelected = selectedCard === stat.id
                  
                  return (
                    <Card
                      key={stat.id}
                      bg={isSelected 
                        ? `linear-gradient(135deg, ${stat.bgColor}, ${stat.darkBgColor})`
                        : stat.bgColor
                      }
                      border="1px solid"
                      borderColor={isSelected ? stat.color : 'transparent'}
                      borderRadius="xl"
                      shadow="sm"
                      cursor="pointer"
                      transition="all 0.2s ease"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${stat.color}30`,
                        borderColor: stat.color,
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                      onClick={() => handleCardClick(stat.id)}
                      position="relative"
                      overflow="hidden"
                      animation={isSelected ? `${pulse} 2s ease-in-out infinite` : 'none'}
                    >
                      <CardBody p={3}>
                        <VStack spacing={2} align="center">
                          <Box
                            p={2}
                            borderRadius="full"
                            bg={isSelected ? `${stat.color}20` : `${stat.color}10`}
                            animation={isSelected ? `${float} 2s ease-in-out infinite` : 'none'}
                          >
                            <IconComponent size={16} color={stat.color} />
                          </Box>
                          <Stat textAlign="center">
                            <StatNumber
                              fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
                              fontWeight="700"
                              color={stat.color}
                              lineHeight="shorter"
                            >
                              {stat.displayValue}
                            </StatNumber>
                            <StatHelpText
                              fontSize="xs"
                              fontWeight="500"
                              color={isSelected ? stat.color : colors.text.label}
                              m={0}
                            >
                              {stat.label}
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
      </Box>

      {/* Modal com dados detalhados */}
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
