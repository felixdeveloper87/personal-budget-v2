import { Box, VStack } from '@chakra-ui/react'
import { usePeriodData } from '../hooks/usePeriodData'
import { hasActiveFilters } from '../utils/filters'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'

import {
  AddTransactionSection,
  SummaryWithAnalysisSection,
  CategoryAnalysisSection,
  InstallmentPlansSection,
} from '../sections'
import { DashboardHeader, DashboardSkeleton } from '../components/dashboard'

export default function Dashboard() {
  const {
    selectedDate,
    selectedPeriod,
    onDateChange,
    onPeriodChange,
    navigatePeriod,
    goToToday,
    formatLabel,
    activeTab,
    setActiveTab,
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
            <Box
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

            {!filtersActive && monthSummary && (
              <>
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

                <CategoryAnalysisSection
                  transactions={periodData.transactions}
                  selectedPeriod={selectedPeriod}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
