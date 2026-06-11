import { useState } from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodData } from '../hooks/usePeriodData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'
import type { TransactionDateBasis } from '../utils/transactionDates'
import PeriodNavigator from '../components/summary/PeriodNavigator'
import TransactionsChart from '../components/charts/modal/TransactionsChart'
import { SectionCard, PageHeader, PageSkeleton, DateBasisToggle } from '../components/ui'
import { AlertCircle, ReceiptText } from '../components/ui/icons'

const BASIS_INFO: Record<TransactionDateBasis, string> = {
  activity:
    'Behaviour view — grouped by purchase date to reveal spending habits and patterns. Card purchases and installments count on the day you bought.',
  'cash-flow':
    'Payments view — grouped by payment date, showing what actually hits your account each day, including card bills and installments from earlier purchases.',
}

export default function TransactionsPage() {
  const [dateBasis, setDateBasis] = useState<TransactionDateBasis>('activity')

  const {
    selectedDate,
    selectedPeriod,
    onDateChange,
    onPeriodChange,
    navigatePeriod,
    goToToday,
    formatLabel,
  } = usePeriodNavigator()

  const { transactions, monthSummary, loading } = useDashboardData(
    selectedDate,
    selectedPeriod,
  )
  const periodData = usePeriodData(
    transactions,
    monthSummary,
    selectedPeriod,
    selectedDate,
    dateBasis,
  )

  // ── Theme tokens ──────────────────────────────────────────────────────
  const infoBg = useColorModeValue('blue.50', 'rgba(37,99,235,0.10)')
  const infoBorder = useColorModeValue('blue.100', 'rgba(96,165,250,0.20)')
  const infoColor = useColorModeValue('blue.600', 'blue.300')

  return (
    <Box px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }} maxW="1400px" mx="auto">
      <VStack spacing={{ base: 4, md: 5 }} align="stretch">
        {/* ── Page header ─────────────────────────────────────────── */}
        <PageHeader
          icon={ReceiptText}
          title="Transactions"
          subtitle="Activity and spending patterns for the selected period."
        />

        {/* ── Command bar ─────────────────────────────────────────── */}
        <SectionCard staticOnHover>
          {/* View toggle */}
          <Box px={{ base: 3, sm: 5 }} pt={{ base: 3, sm: 4 }}>
            <HStack spacing={3} align="center">
              <Text fontSize="xs" fontWeight={700} color={infoColor}>
                View as
              </Text>
              <DateBasisToggle value={dateBasis} onChange={setDateBasis} />
            </HStack>
          </Box>

          {/* Info note — updates with the active view */}
          <Box px={{ base: 3, sm: 5 }} pt={2}>
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
              <Text fontSize="xs" lineHeight="1.45">
                {BASIS_INFO[dateBasis]}
              </Text>
            </HStack>
          </Box>

          {/* Period navigator */}
          <Box px={{ base: 3, sm: 5 }} pt={3} pb={{ base: 3, sm: 4 }}>
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
        </SectionCard>

        {/* ── Chart + ledger ──────────────────────────────────────── */}
        <SectionCard staticOnHover>
          <Box px={{ base: 3, sm: 4, md: 5 }} py={{ base: 4, sm: 5 }}>
            {loading ? (
              <PageSkeleton />
            ) : (
              <TransactionsChart
                transactions={periodData.transactions}
                periodType={selectedPeriod}
                selectedDate={selectedDate}
                dateBasis={dateBasis}
              />
            )}
          </Box>
        </SectionCard>
      </VStack>
    </Box>
  )
}
