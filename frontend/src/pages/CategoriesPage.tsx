import {
  Box,
  Divider,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Layers } from '../components/ui/icons'

import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodData } from '../hooks/usePeriodData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'

import PeriodNavigator from '../components/summary/PeriodNavigator'
import {
  CategoriesPageHeader,
  CategoryAnalysisHeader,
  CategoryAnalysisTabs,
} from '../components/categories'
import { ChartsPageSkeleton } from '../components/charts/page'
import { SectionCard, SectionHeader } from '../components/ui'

/**
 * Dedicated page for the category breakdown. The period navigator is
 * integrated directly as the header of the category analysis card,
 * giving users a single unified surface to work with.
 */
export default function CategoriesPage() {
  const {
    selectedDate,
    selectedPeriod,
    onPeriodChange,
    navigatePeriod,
    goToToday,
    formatLabel,
    activeTab,
    setActiveTab,
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
  )

  const periodLabel = formatLabel()
  const pageBg = useColorModeValue('gray.50', '#060606')
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400')
  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  const hasData = periodData.transactions.length > 0

  return (
    <Box
      minH="100vh"
      bg={pageBg}
      px={{ base: 2, md: 4, lg: 6 }}
      py={{ base: 3, md: 5 }}
      maxW="1600px"
      mx="auto"
    >
      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
        <CategoriesPageHeader
          periodLabel={periodLabel}
          onGoToToday={goToToday}
        />

        {loading ? (
          <ChartsPageSkeleton />
        ) : (
          <SectionCard staticOnHover>
            <VStack spacing={0} align="stretch" w="full">
              {/* Period Navigator as integrated header */}
              <Box
                px={{ base: 4, sm: 5 }}
                pt={{ base: 4, sm: 5 }}
                pb={{ base: 3, sm: 4 }}
              >
                <PeriodNavigator
                  selectedPeriod={selectedPeriod}
                  selectedDate={selectedDate}
                  onPeriodChange={onPeriodChange}
                  onNavigatePeriod={navigatePeriod}
                  onGoToToday={goToToday}
                  formatLabel={formatLabel}
                  isEmbedded
                />
              </Box>

              <Divider borderColor={dividerColor} />

              {/* Category content */}
              <Box p={{ base: 4, sm: 5, md: 6 }}>
                {hasData ? (
                  <VStack spacing={5} align="stretch">
                    <CategoryAnalysisHeader
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                    />
                    <CategoryAnalysisTabs
                      transactions={periodData.transactions}
                      selectedPeriod={selectedPeriod}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                    />
                  </VStack>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    <SectionHeader
                      icon={Layers}
                      title="Categories"
                      caption="Your category insights appear here"
                      accent="neutral"
                    />
                    <Text fontSize="sm" color={emptyTextColor}>
                      Add transactions in this range to see how your money
                      breaks down by category.
                    </Text>
                  </VStack>
                )}
              </Box>
            </VStack>
          </SectionCard>
        )}
      </VStack>
    </Box>
  )
}
