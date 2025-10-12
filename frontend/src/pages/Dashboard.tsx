import { Box, Text, VStack, Spinner, useColorModeValue } from '@chakra-ui/react'
import { usePeriodData } from '../hooks/usePeriodData'
import { hasActiveFilters } from '../utils/filters'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'

// Seções centralizadas
import {
  AddTransactionSection,
  PeriodNavigatorSection,
  SummarySection,
  ChartsSection,
  InstallmentPlansSection,
} from '../sections'

export default function Dashboard() {
  const { selectedDate, selectedPeriod, onDateChange, onPeriodChange } = usePeriodNavigator()
  const { transactions, monthSummary, loading, loadData, filters } = useDashboardData(selectedDate, selectedPeriod)

  const periodData = usePeriodData(transactions, monthSummary, selectedPeriod, selectedDate)

  // Usar o mesmo gradiente do header
  const bg = useColorModeValue(
    'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
  )

  return (
    <Box 
      bg={bg}
      minH="100vh"
      px={{ base: 4, md: 8, lg: 12 }} 
      py={{ base: 4, md: 8 }}
    >
      {loading ? (
        <VStack py={20}>
          <Spinner size="xl" />
          <Text>Loading data...</Text>
        </VStack>
      ) : (
        <VStack spacing={6} align="stretch">
          <AddTransactionSection transactions={transactions} onRefresh={loadData} />

          {!hasActiveFilters(filters) && (
            <PeriodNavigatorSection
              selectedPeriod={selectedPeriod}
              selectedDate={selectedDate}
              onDateChange={onDateChange}
              onPeriodChange={onPeriodChange}
              label={periodData.label}
            />
          )}

          {monthSummary && <SummarySection periodData={periodData} />}

          {/* Active Installment Plans - After summary, before charts */}
          <InstallmentPlansSection />

          {monthSummary && (
            <ChartsSection
              income={periodData.income}
              expense={periodData.expense}
              balance={periodData.balance}
              transactions={periodData.transactions}
              selectedPeriod={selectedPeriod}
            />
          )}

        </VStack>
      )}
    </Box>
  )
}
