import { Box, Text, VStack, Spinner } from '@chakra-ui/react'
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
  AllTransactionsSection,
} from '../sections'

export default function Dashboard() {
  const { selectedDate, selectedPeriod, onDateChange, onPeriodChange } = usePeriodNavigator()
  const { transactions, monthSummary, loading, loadData, filters } = useDashboardData(selectedDate)

  const periodData = usePeriodData(transactions, monthSummary, selectedPeriod, selectedDate)

  return (
    <Box px={{ base: 4, md: 8, lg: 12 }} py={{ base: 4, md: 8 }}>
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

          {monthSummary && (
            <ChartsSection
              income={periodData.income}
              expense={periodData.expense}
              balance={periodData.balance}
              transactions={periodData.transactions}
              selectedPeriod={selectedPeriod}
            />
          )}

          <AllTransactionsSection
            transactions={transactions}
            hasFilters={hasActiveFilters(filters)}
            onRefresh={loadData}
          />

        </VStack>
      )}
    </Box>
  )
}
