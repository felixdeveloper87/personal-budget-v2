import { useMemo, useState } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { useEd, Guilloche } from '../editorial'
import { usePeriodData, getPreviousPeriodDate } from '../hooks/usePeriodData'
import { hasActiveFilters } from '../utils/filters'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'
import type { TransactionDateBasis } from '../utils/transactionDates'

import {
  AddTransactionSection,
  SummaryWithAnalysisSection,
  InstallmentPlansSection,
  RecurringTransactionsSection,
  DiscoverSection,
} from '../sections'
import { DashboardHeader, DashboardSkeleton } from '../components/dashboard'
import type { AppPage } from '../components/layout/header/navigation.config'

export interface DashboardProps {
  /**
   * Optional handler used by in-dashboard CTAs (e.g. DiscoverSection)
   * to navigate to other pages without a router.
   */
  onPageChange?: (page: AppPage) => void
  /**
   * Navigate to the Categories page with a tab preselected — used by the
   * Income/Expenses summary cards instead of opening the breakdown modal.
   */
}

export default function Dashboard({ onPageChange }: DashboardProps) {
  const {
    selectedDate,
    selectedPeriod,
    onDateChange,
    onPeriodChange,
    navigatePeriod,
    goToToday,
    formatLabel,
  } = usePeriodNavigator()
  const { transactions, monthSummary, loading, loadData, filters } =
    useDashboardData(selectedDate, selectedPeriod)

  // Home defaults to "Payments" (cash-flow): what hits the account in the
  // period — card bills and installments included. The toggle flips the
  // overview to "Behaviour" (purchase dates) without leaving the page.
  const [dateBasis, setDateBasis] = useState<TransactionDateBasis>('cash-flow')

  const periodData = usePeriodData(
    transactions,
    monthSummary,
    selectedPeriod,
    selectedDate,
    dateBasis,
  )

  // Previous period (same basis) so "For you" can compare against it.
  const previousDate = useMemo(
    () => getPreviousPeriodDate(selectedDate, selectedPeriod),
    [selectedDate, selectedPeriod],
  )
  const previousPeriodData = usePeriodData(
    transactions,
    null,
    selectedPeriod,
    previousDate,
    dateBasis,
  )

  const filtersActive = hasActiveFilters(filters)
  const hasOverview = !filtersActive && !!monthSummary
  const ed = useEd()

  return (
    <Box
      position="relative"
      minH="100vh"
      px={{ base: 2, md: 4, lg: 6 }}
      py={{ base: 4, md: 7 }}
      maxW="appContent"
      mx="auto"
      overflow="hidden"
    >
      {/* Guilloché engraving behind the greeting — echoes the landing identity. */}
      {ed && (
        <Box
          aria-hidden
          position="absolute"
          top={{ base: '-80px', md: '-140px' }}
          left="50%"
          transform="translateX(-50%)"
          w={{ base: '140%', md: '900px' }}
          h={{ base: '320px', md: '480px' }}
          pointerEvents="none"
          zIndex={0}
        >
          <Guilloche n={30} rx={300} ry={120} opacity={0.22} />
        </Box>
      )}

      <VStack spacing={{ base: 3, md: 4 }} align="stretch" position="relative" zIndex={1}>
        <DashboardHeader
          income={monthSummary?.totalIncome}
          expense={monthSummary?.totalExpense}
        />

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <VStack spacing={{ base: 3, md: 4 }} align="stretch">
            {hasOverview && (
              <Box order={{ base: 1, lg: 2 }}>
                <SummaryWithAnalysisSection
                  periodData={periodData}
                  dateBasis={dateBasis}
                  onDateBasisChange={setDateBasis}
                  selectedPeriod={selectedPeriod}
                  selectedDate={selectedDate}
                  onDateChange={onDateChange}
                  onPeriodChange={onPeriodChange}
                  navigatePeriod={navigatePeriod}
                  goToToday={goToToday}
                  formatLabel={formatLabel}
                  onViewTransactions={() => onPageChange?.('transactions')}
                />
              </Box>
            )}

            <Box
              order={{ base: 2, lg: 1 }}
              display="grid"
              gridTemplateColumns={{ base: '1fr', lg: 'repeat(3, minmax(0, 1fr))' }}
              gap={{ base: 3, md: 4 }}
              w="full"
            >
              <AddTransactionSection
                transactions={transactions}
                onRefresh={loadData}
              />
              <InstallmentPlansSection onPageChange={onPageChange} />
              <RecurringTransactionsSection onPageChange={onPageChange} />
            </Box>

            <Box order={{ base: 3, lg: 3 }}>
              <DiscoverSection
                transactions={periodData.transactions}
                allTransactions={transactions}
                previousPeriodData={previousPeriodData}
                selectedPeriod={selectedPeriod}
                income={periodData.income}
                expense={periodData.expense}
                balance={periodData.balance}
              />
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
