import { Box, Text, VStack, Spinner, useColorModeValue } from '@chakra-ui/react'
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
  const { selectedDate, selectedPeriod, onDateChange, onPeriodChange } = usePeriodNavigator()
  const { transactions, monthSummary, loading, loadData, filters } = useDashboardData(selectedDate, selectedPeriod)

  const periodData = usePeriodData(transactions, monthSummary, selectedPeriod, selectedDate)

  // Usar o mesmo gradiente do tema
  const bg = useColorModeValue(GRADIENTS.light, GRADIENTS.dark)

  return (
    <Box 
      bg={bg}
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
        <VStack spacing={3} align="stretch">
          <AddTransactionSection transactions={transactions} onRefresh={loadData} />

          {/* Active Installment Plans - Right after Add Transaction */}
          <InstallmentPlansSection />

          {!hasActiveFilters(filters) && monthSummary && (
            <SummaryWithAnalysisSection
              periodData={periodData}
              selectedPeriod={selectedPeriod}
              selectedDate={selectedDate}
              onDateChange={onDateChange}
              onPeriodChange={onPeriodChange}
            />
          )}

        </VStack>
      )}
    </Box>
  )
}
