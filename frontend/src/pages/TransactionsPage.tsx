import { Box, Divider, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodData } from '../hooks/usePeriodData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'
import PeriodNavigator from '../components/summary/PeriodNavigator'
import TransactionsChart from '../components/charts/modal/TransactionsChart'
import { SectionCard, PageSkeleton } from '../components/ui'

/**
 * Transactions page — period-driven activity view (the content that used to
 * live inside the home "Transactions" summary modal). The flat, month-by-month
 * list now lives under the profile menu as "All transactions".
 */
export default function TransactionsPage() {
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
    'activity',
  )

  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  return (
    <Box px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }} maxW="1400px" mx="auto">
      <VStack spacing={{ base: 4, md: 5 }} align="stretch">
        <Box px={{ base: 1, sm: 2 }}>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={800} color={titleColor}>
            Transactions
          </Text>
          <Text color={captionColor} mt={1} fontSize="sm">
            Activity and spending patterns for the selected period.
          </Text>
        </Box>

        <SectionCard staticOnHover>
          <Box
            px={{ base: 4, sm: 5 }}
            pt={{ base: 4, sm: 5 }}
            pb={{ base: 3, sm: 4 }}
          >
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

          <Divider borderColor={dividerColor} />

          <Box px={{ base: 3, sm: 4, md: 5 }} py={{ base: 4, sm: 5 }}>
            {loading ? (
              <PageSkeleton />
            ) : (
              <TransactionsChart
                transactions={periodData.transactions}
                selectedPeriod={formatLabel()}
                periodType={selectedPeriod}
                selectedDate={selectedDate}
                showPeriodBadge={false}
              />
            )}
          </Box>
        </SectionCard>
      </VStack>
    </Box>
  )
}
