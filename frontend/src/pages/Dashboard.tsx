import { Box, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { BarChart3 } from 'lucide-react'
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
import { SectionCard, SectionHeader } from '../components/ui'

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
  const hasOverview = !filtersActive && !!monthSummary
  const hasCategoryData = periodData.transactions.length > 0
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400')

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
              {hasCategoryData ? (
                <CategoryAnalysisSection
                  transactions={periodData.transactions}
                  selectedPeriod={selectedPeriod}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              ) : (
                <SectionCard staticOnHover>
                  <Box p={{ base: 4, sm: 5 }}>
                    <SectionHeader
                      icon={BarChart3}
                      title="Categories"
                      caption="Your category insights appear here"
                      accent="neutral"
                    />
                    <Text mt={3} fontSize="sm" color={emptyTextColor}>
                      Add transactions or clear filters to see category analysis.
                    </Text>
                  </Box>
                </SectionCard>
              )}
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
