import { Box, Divider, HStack, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { PeriodData } from '../../hooks/usePeriodData'
import { PeriodType } from '../../types'
import SummaryCardsGrid from './SummaryCardsGrid'
import PeriodNavigator from './PeriodNavigator'
import { SectionCard } from '../ui'
import { AlertCircle } from '../ui/icons'

interface SummaryContainerProps {
  periodData: PeriodData
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
  navigatePeriod?: (direction: 'prev' | 'next') => void
  goToToday?: () => void
  formatLabel?: () => string
  /**
   * When provided, the Income/Expenses cards navigate to the Categories page
   * (with the matching tab) instead of opening the breakdown modal.
   */
  onNavigateCategory?: (tab: 'expenses' | 'incomes') => void
  /**
   * When provided, the Transactions card navigates to the Transactions page.
   */
  onViewTransactions?: () => void
  /**
   * When provided, the Balance card navigates to the Goals page (which hosts
   * the balance break-even content). With all four callbacks wired, the cards
   * are pure CTAs and no modal is rendered.
   */
  onViewBalance?: () => void
}

const fallbackFormatLabel = (date: Date, period: PeriodType) => {
  if (period === 'month') {
    return date
      .toLocaleString('en-GB', { month: 'short', year: 'numeric' })
      .toUpperCase()
  }
  if (period === 'day') {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  if (period === 'week') {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
    return `${fmt(start)} - ${fmt(end)}`
  }
  if (period === 'year') {
    return date.getFullYear().toString()
  }
  return 'Unknown Period'
}

const fallbackNavigatePeriod = (
  date: Date,
  period: PeriodType,
  direction: 'prev' | 'next',
): Date => {
  const next = new Date(date)
  const offset = direction === 'next' ? 1 : -1
  switch (period) {
    case 'day':
      next.setDate(date.getDate() + offset)
      break
    case 'week':
      next.setDate(date.getDate() + offset * 7)
      break
    case 'month':
      next.setMonth(date.getMonth() + offset)
      break
    case 'year':
      next.setFullYear(date.getFullYear() + offset)
      break
  }
  return next
}

export default function SummaryContainer({
  periodData,
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
  navigatePeriod: externalNavigatePeriod,
  goToToday: externalGoToToday,
  formatLabel: externalFormatLabel,
  onNavigateCategory,
  onViewTransactions,
  onViewBalance,
}: SummaryContainerProps) {
  const { transactions, income, expense, balance } = periodData

  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const infoBg = useColorModeValue('blue.50', 'rgba(37,99,235,0.10)')
  const infoBorder = useColorModeValue('blue.100', 'rgba(96,165,250,0.20)')
  const infoColor = useColorModeValue('blue.700', 'blue.200')
  const infoMuted = useColorModeValue('blue.600', 'blue.300')

  const navigatePeriod =
    externalNavigatePeriod ??
    ((direction: 'prev' | 'next') =>
      onDateChange(fallbackNavigatePeriod(selectedDate, selectedPeriod, direction)))

  const goToToday = externalGoToToday ?? (() => onDateChange(new Date()))

  const formatLabel =
    externalFormatLabel ??
    (() => fallbackFormatLabel(selectedDate, selectedPeriod))

  const handleCardClick = (cardId: string) => {
    if (onNavigateCategory && (cardId === 'income' || cardId === 'expenses')) {
      onNavigateCategory(cardId === 'income' ? 'incomes' : 'expenses')
      return
    }
    if (onViewTransactions && cardId === 'transactions') {
      onViewTransactions()
      return
    }
    if (onViewBalance && cardId === 'balance') {
      onViewBalance()
      return
    }
  }

  return (
    <SectionCard staticOnHover>
      <VStack spacing={0} align="stretch" w="full">
        {/* Period Navigator as the integrated header */}
        <Box px={{ base: 4, sm: 5 }} pt={{ base: 4, sm: 5 }} pb={{ base: 3, sm: 4 }}>
          <PeriodNavigator
            selectedPeriod={selectedPeriod}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            onPeriodChange={onPeriodChange}
            onNavigatePeriod={navigatePeriod}
            onGoToToday={goToToday}
            formatLabel={formatLabel}
            isEmbedded
          />
        </Box>

        <Divider borderColor={dividerColor} />

        {/* Summary Cards */}
        <Box px={{ base: 4, sm: 5 }} py={{ base: 4, sm: 5 }}>
          <VStack align="stretch" spacing={3}>
            <HStack
              spacing={2.5}
              px={3}
              py={2.5}
              bg={infoBg}
              border="1px solid"
              borderColor={infoBorder}
              borderRadius="lg"
              color={infoColor}
              align="flex-start"
            >
              <Icon as={AlertCircle} boxSize={4} mt={0.5} flexShrink={0} />
              <Text fontSize="xs" lineHeight="1.45" color={infoMuted}>
                This overview follows payment dates, showing income received and bills due in the selected period. Purchase activity is shown separately in Transactions and Categories.
              </Text>
            </HStack>

            <SummaryCardsGrid
              transactions={transactions}
              income={income}
              expense={expense}
              balance={balance}
              selectedPeriod={selectedPeriod}
              onCardClick={handleCardClick}
            />
          </VStack>
        </Box>
      </VStack>
    </SectionCard>
  )
}
