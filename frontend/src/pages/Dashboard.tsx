import { Box, VStack } from '@chakra-ui/react'
import { usePeriodData } from '../hooks/usePeriodData'
import { hasActiveFilters } from '../utils/filters'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'

import {
  AddTransactionSection,
  SummaryWithAnalysisSection,
  InstallmentPlansSection,
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

  const periodData = usePeriodData(
    transactions,
    monthSummary,
    selectedPeriod,
    selectedDate,
  )

  const filtersActive = hasActiveFilters(filters)
  const hasOverview = !filtersActive && !!monthSummary

  return (
    <Box
      minH="100vh"
      px={{ base: 2, md: 4, lg: 6 }}
      py={{ base: 3, md: 5 }}
      maxW="1600px"
      mx="auto"
    >
      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
        <DashboardHeader />

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <VStack spacing={{ base: 3, md: 4 }} align="stretch">
            {hasOverview && (
              <Box order={{ base: 1, lg: 2 }}>
                <SummaryWithAnalysisSection
                  periodData={periodData}
                  selectedPeriod={selectedPeriod}
                  selectedDate={selectedDate}
                  onDateChange={onDateChange}
                  onPeriodChange={onPeriodChange}
                  navigatePeriod={navigatePeriod}
                  goToToday={goToToday}
                  formatLabel={formatLabel}
                />
              </Box>
            )}

            <Box
              order={{ base: 2, lg: 1 }}
              display="grid"
              gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }}
              gap={{ base: 3, md: 4 }}
              w="full"
            >
              <AddTransactionSection
                transactions={transactions}
                onRefresh={loadData}
              />
              <InstallmentPlansSection />
            </Box>

            <Box order={{ base: 3, lg: 3 }}>
              <DiscoverSection onPageChange={onPageChange} />
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
