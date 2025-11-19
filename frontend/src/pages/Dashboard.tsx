import { Box, Text, VStack, Spinner, HStack, useColorModeValue } from '@chakra-ui/react'
import { usePeriodData } from '../hooks/usePeriodData'
import { hasActiveFilters } from '../utils/filters'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'

// Seções centralizadas
import {
  AddTransactionSection,
  SummaryWithAnalysisSection,
  CategoryAnalysisSection,
  InstallmentPlansSection,
} from '../sections'

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
  const { transactions, monthSummary, loading, loadData, filters } = useDashboardData(selectedDate, selectedPeriod)

  const periodData = usePeriodData(transactions, monthSummary, selectedPeriod, selectedDate)

  return (
    <Box
      minH="100vh"
      px={{ base: 0.5, md: 1, lg: 1.5 }}
      py={{ base: 3, md: 6 }}
    >
      {loading ? (
        <VStack py={20}>
          <Spinner size="xl" />
          <Text>Loading data...</Text>
        </VStack>
      ) : (
        <VStack spacing={2} align="stretch">
          {/* Quick Actions and Active Installments - Side by side on large screens */}
          <Box
            display="flex"
            flexDirection={{ base: 'column', lg: 'row' }}
            gap={2}
            w="full"
          >
            <Box flex={{ base: 'none', lg: '1' }} w={{ base: 'full', lg: '0' }}>
              <AddTransactionSection transactions={transactions} onRefresh={loadData} />
            </Box>
            <Box flex={{ base: 'none', lg: '1' }} w={{ base: 'full', lg: '0' }}>
              <InstallmentPlansSection />
            </Box>
          </Box>

          {!hasActiveFilters(filters) && monthSummary && (
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
                transactions={transactions}
                selectedPeriod={selectedPeriod}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </>
          )}

        </VStack>
      )}
    </Box>
  )
}
