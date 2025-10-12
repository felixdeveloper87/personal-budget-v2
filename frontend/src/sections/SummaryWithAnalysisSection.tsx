import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Card,
  CardBody,
  Heading,
  useColorModeValue,
  useDisclosure,
  SimpleGrid,
  Divider,
  Icon,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react'
import {
  Activity,
  Zap,
  Calendar,
  RotateCcw,
  CalendarDays,
  CalendarRange,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useThemeColors } from '../hooks/useThemeColors'
import { PeriodData } from '../hooks/usePeriodData'
import { PeriodType } from '../components/ui/PeriodNavigator'
import { SummaryCardsGrid, CategoryAnalysisTabs } from '../components/summary'
import SummaryCardModal from '../components/transactions/SummaryCardModal'

type CardId = 'transactions' | 'income' | 'expenses' | 'balance'

interface SummaryWithAnalysisSectionProps {
  periodData: PeriodData
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
}

export default function SummaryWithAnalysisSection({
  periodData,
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
}: SummaryWithAnalysisSectionProps) {
  const { transactions, income, expense, balance, label } = periodData
  const colors = useThemeColors()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null)
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>('expenses')

  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId as CardId)
    onOpen()
  }

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    const offset = direction === 'next' ? 1 : -1

    switch (selectedPeriod) {
      case 'day':
        newDate.setDate(selectedDate.getDate() + offset)
        break
      case 'week':
        newDate.setDate(selectedDate.getDate() + offset * 7)
        break
      case 'month':
        newDate.setMonth(selectedDate.getMonth() + offset)
        break
      case 'year':
        newDate.setFullYear(selectedDate.getFullYear() + offset)
        break
    }

    onDateChange(newDate)
  }

  const goToToday = () => onDateChange(new Date())

  const formatLabel = () => {
    if (selectedPeriod === 'month')
      return selectedDate.toLocaleString('en-GB', {
        month: 'short',
        year: 'numeric',
      })
    if (selectedPeriod === 'day')
      return selectedDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    if (selectedPeriod === 'week') {
      const start = new Date(selectedDate)
      const day = start.getDay()
      const diff = start.getDate() - day + (day === 0 ? -6 : 1)
      start.setDate(diff)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      const fmt = (d: Date) =>
        d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
      return `${fmt(start)} - ${fmt(end)}`
    }
    return label
  }

  const periods = [
    { type: 'day' as PeriodType, label: 'Day', icon: Calendar },
    { type: 'week' as PeriodType, label: 'Week', icon: CalendarDays },
    { type: 'month' as PeriodType, label: 'Month', icon: CalendarRange },
    { type: 'year' as PeriodType, label: 'Year', icon: Activity },
  ]

  return (
    <>
      <Box w="full" px={{ base: 1, md: 2 }}>
        <Card
          borderRadius="2xl"
          border="1px solid"
          borderColor={colors.border}
          bg={colors.cardBg}
          backdropFilter="blur(16px)"
          shadow="xl"
        >
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* HEADER */}
              <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'flex-start', md: 'center' }}
                justify="space-between"
                gap={4}
              >
                <HStack spacing={4}>
                  <Box
                    p={3}
                    borderRadius="2xl"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      'linear-gradient(135deg, #60a5fa, #3b82f6)'
                    )}
                    boxShadow="md"
                  >
                    <Icon as={Activity} color="white" boxSize={5} />
                  </Box>

                  <VStack align="start" spacing={1}>
                    <Heading
                      size="lg"
                      bg={useColorModeValue(
                        'linear-gradient(135deg, #1e293b, #475569)',
                        'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                      )}
                      bgClip="text"
                      fontWeight="800"
                    >
                      Financial Overview
                    </Heading>
                    <Text
                      fontSize="md"
                      color={useColorModeValue('#1e293b', 'white')}
                      fontWeight="600"
                    >
                      Complete overview with category analysis
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={3}>
                  <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="700"
                    color={colors.text.primary}
                    whiteSpace="nowrap"
                  >
                    {formatLabel()}
                  </Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    leftIcon={<RotateCcw size={14} />}
                    onClick={goToToday}
                  >
                    Today
                  </Button>
                </HStack>
              </Flex>

              {/* PERIOD SELECTOR */}
              <VStack spacing={3} align="stretch">
                {isMobile ? (
                  <SimpleGrid columns={4} spacing={2}>
                    {periods.map(({ type, label, icon: IconComp }) => {
                      const selected = selectedPeriod === type
                      return (
                        <Button
                          key={type}
                          size="sm"
                          borderRadius="xl"
                          onClick={() => onPeriodChange(type)}
                          bg={
                            selected
                              ? useColorModeValue(
                                  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                  'linear-gradient(135deg, #60a5fa, #3b82f6)'
                                )
                              : colors.bgSecondary
                          }
                          color={selected ? 'white' : colors.text.primary}
                          _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                        >
                          <VStack spacing={0.5}>
                            <IconComp size={14} />
                            <Text fontSize="2xs" fontWeight="600">
                              {label}
                            </Text>
                          </VStack>
                        </Button>
                      )
                    })}
                  </SimpleGrid>
                ) : (
                  <HStack spacing={2}>
                    {periods.map(({ type, label, icon: IconComp }) => {
                      const selected = selectedPeriod === type
                      return (
                        <Button
                          key={type}
                          flex={1}
                          borderRadius="xl"
                          leftIcon={<IconComp size={16} />}
                          onClick={() => onPeriodChange(type)}
                          bg={
                            selected
                              ? useColorModeValue(
                                  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                  'linear-gradient(135deg, #60a5fa, #3b82f6)'
                                )
                              : colors.bgSecondary
                          }
                          color={selected ? 'white' : colors.text.primary}
                          _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                        >
                          {label}
                        </Button>
                      )
                    })}
                  </HStack>
                )}

                <HStack spacing={2} justify="space-between">
                  <IconButton
                    aria-label="Previous period"
                    icon={<ArrowLeft size={18} />}
                    onClick={() => navigatePeriod('prev')}
                    variant="outline"
                    colorScheme="blue"
                  />
                  <IconButton
                    aria-label="Next period"
                    icon={<ArrowRight size={18} />}
                    onClick={() => navigatePeriod('next')}
                    variant="outline"
                    colorScheme="blue"
                  />
                </HStack>
              </VStack>

              {/* SUMMARY GRID */}
              <SummaryCardsGrid
                transactions={transactions}
                income={income}
                expense={expense}
                balance={balance}
                onCardClick={handleCardClick}
              />

              <Divider />

              {/* CATEGORY ANALYSIS HEADER */}
              <HStack spacing={{ base: 3, sm: 4 }} align="center" justify="space-between">
                <HStack spacing={{ base: 3, sm: 4 }} align="center">
                  <Box
                    p={{ base: 2.5, sm: 3 }}
                    borderRadius="2xl"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      'linear-gradient(135deg, #a78bfa, #8b5cf6)'
                    )}
                    boxShadow="lg"
                    sx={{
                      animation: 'glow 3s ease-in-out infinite',
                      '@keyframes glow': {
                        '0%,100%': { boxShadow: '0 0 5px rgba(139,92,246,0.3)' },
                        '50%': {
                          boxShadow:
                            '0 0 20px rgba(139,92,246,0.6), 0 0 30px rgba(139,92,246,0.4)',
                        },
                      },
                    }}
                  >
                    <Icon as={BarChart3} boxSize={{ base: 5, sm: 6 }} color="white" />
                  </Box>
                  <HStack spacing={4} align="center">
                    <VStack align={{ base: 'center', md: 'start' }} spacing={0}>
                      <Heading
                        size={{ base: 'md', sm: 'lg' }}
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #1e293b, #475569)',
                          'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                        )}
                        bgClip="text"
                        fontWeight="800"
                      >
                        Category Analysis
                      </Heading>
                      <Text
                        fontSize={{ base: '2xs', sm: 'xs' }}
                        color={useColorModeValue('gray.500', 'gray.400')}
                        fontWeight="400"
                        opacity={0.8}
                      >
                        Detailed category breakdown and insights
                      </Text>
                    </VStack>
                    
                    {/* Botões Expenses/Incomes */}
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        variant={activeTab === 'expenses' ? 'solid' : 'outline'}
                        colorScheme="red"
                        leftIcon={<Icon as={TrendingDown} boxSize={3} />}
                        borderRadius="lg"
                        fontSize="xs"
                        fontWeight="600"
                        px={3}
                        py={2}
                        h="auto"
                        bg={activeTab === 'expenses' ? 'red.50' : 'transparent'}
                        color={activeTab === 'expenses' ? 'red.600' : 'gray.600'}
                        borderColor={activeTab === 'expenses' ? 'red.200' : 'gray.300'}
                        _hover={{
                          bg: activeTab === 'expenses' ? 'red.100' : 'red.50',
                          color: 'red.600',
                          borderColor: 'red.300'
                        }}
                        onClick={() => setActiveTab('expenses')}
                      >
                        Expenses
                      </Button>
                      <Button
                        size="sm"
                        variant={activeTab === 'incomes' ? 'solid' : 'outline'}
                        colorScheme="green"
                        leftIcon={<Icon as={TrendingUp} boxSize={3} />}
                        borderRadius="lg"
                        fontSize="xs"
                        fontWeight="600"
                        px={3}
                        py={2}
                        h="auto"
                        bg={activeTab === 'incomes' ? 'green.50' : 'transparent'}
                        color={activeTab === 'incomes' ? 'green.600' : 'gray.600'}
                        borderColor={activeTab === 'incomes' ? 'green.200' : 'gray.300'}
                        _hover={{
                          bg: activeTab === 'incomes' ? 'green.100' : 'green.50',
                          color: 'green.600',
                          borderColor: 'green.300'
                        }}
                        onClick={() => setActiveTab('incomes')}
                      >
                        Incomes
                      </Button>
                    </HStack>
                  </HStack>
                </HStack>
              </HStack>

              {/* CATEGORY ANALYSIS */}
              <CategoryAnalysisTabs
                transactions={transactions}
                selectedPeriod={selectedPeriod}
                showHeader={false}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </VStack>
          </CardBody>
        </Card>
      </Box>

      {/* MODAL */}
      <SummaryCardModal
        isOpen={isOpen}
        onClose={onClose}
        selectedCard={selectedCard}
        cardLabel={selectedCard || 'transactions'}
        transactions={transactions}
        selectedPeriod={label}
        currentBalance={balance}
      />
    </>
  )
}
