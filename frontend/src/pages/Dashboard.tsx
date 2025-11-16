import { Box, Text, VStack, Spinner, HStack, useColorModeValue } from '@chakra-ui/react'
import { GRADIENTS } from '../theme'
import { usePeriodData } from '../hooks/usePeriodData'
import { hasActiveFilters } from '../utils/filters'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'

// Seções centralizadas
import {
  AddTransactionSection,
  SummaryWithAnalysisSection,
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

  // Background with texture
  const bg = useColorModeValue('white', 'black')
  
  // Texture pattern with lines - same as header
  const texturePatternLight = 'data:image/svg+xml,%3Csvg width="6" height="6" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M 0 3 L 3 0 M 3 6 L 6 3 M 0 3 L 3 6" stroke="%23000" stroke-width="0.6" opacity="0.15"/%3E%3C/svg%3E'
  const texturePatternDark = 'data:image/svg+xml,%3Csvg width="6" height="6" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M 0 3 L 3 0 M 3 6 L 6 3 M 0 3 L 3 6" stroke="%23fff" stroke-width="0.6" opacity="0.15"/%3E%3C/svg%3E'
  
  const texturePattern = useColorModeValue(texturePatternLight, texturePatternDark)

  return (
    <Box 
      bg={bg}
      backgroundImage={texturePattern}
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
            <SummaryWithAnalysisSection
              periodData={periodData}
              selectedPeriod={selectedPeriod}
              selectedDate={selectedDate}
              onDateChange={onDateChange}
              onPeriodChange={onPeriodChange}
              navigatePeriod={navigatePeriod}
              goToToday={goToToday}
              formatLabel={formatLabel}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

        </VStack>
      )}
    </Box>
  )
}
