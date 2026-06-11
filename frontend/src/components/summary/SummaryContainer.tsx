import {
  Box,
  Divider,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { PeriodData } from '../../hooks/usePeriodData'
import { PeriodType } from '../../types'
import type { TransactionDateBasis } from '../../utils/transactionDates'
import SummaryStatsStrip from './SummaryStatsStrip'
import PeriodNavigator from './PeriodNavigator'
import { SectionCard, DateBasisToggle } from '../ui'
import { AlertCircle } from '../ui/icons'

const BASIS_INFO: Record<TransactionDateBasis, string> = {
  'cash-flow':
    'Payments view — what hits your account in this period: income received and bills due.',
  activity:
    'Behaviour view — what you actually spent and earned in this period by purchase date.',
}

interface SummaryContainerProps {
  periodData: PeriodData
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
  navigatePeriod?: (direction: 'prev' | 'next') => void
  goToToday?: () => void
  formatLabel?: () => string
  /** Active date basis for the overview ("cash-flow" = payments, "activity" = behaviour). */
  dateBasis?: TransactionDateBasis
  /** When provided, renders the Behaviour | Payments toggle above the stats. */
  onDateBasisChange?: (basis: TransactionDateBasis) => void
  onNavigateCategory?: (tab: 'expenses' | 'incomes') => void
  onViewTransactions?: () => void
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
  dateBasis = 'cash-flow',
  onDateBasisChange,
  onNavigateCategory,
  onViewTransactions,
  onViewBalance,
}: SummaryContainerProps) {
  const { transactions, income, expense, balance } = periodData

  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
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
        {/* Period Navigator */}
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

        {/* Stats area */}
        <Box px={{ base: 4, sm: 5 }} py={{ base: 3, sm: 4 }}>
          <VStack align="stretch" spacing={3}>
            {/* View toggle + contextual note (side by side on desktop) */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 2, md: 4 }}
              align={{ base: 'stretch', md: 'center' }}
            >
              {onDateBasisChange && (
                <HStack spacing={2.5} flexShrink={0}>
                  <Text fontSize="xs" fontWeight={700} color={infoMuted}>
                    View as
                  </Text>
                  <DateBasisToggle value={dateBasis} onChange={onDateBasisChange} />
                </HStack>
              )}

              <HStack spacing={1.5} color={infoMuted} minW={0} align="flex-start">
                <Icon as={AlertCircle} boxSize={3.5} mt="2px" flexShrink={0} />
                <Text fontSize="xs" lineHeight="1.45" opacity={0.9}>
                  {BASIS_INFO[dateBasis]}
                </Text>
              </HStack>
            </Flex>

            {/* Compact stats strip */}
            <SummaryStatsStrip
              txCount={transactions.length}
              income={income}
              expense={expense}
              balance={balance}
              onCardClick={handleCardClick}
            />
          </VStack>
        </Box>
      </VStack>
    </SectionCard>
  )
}
