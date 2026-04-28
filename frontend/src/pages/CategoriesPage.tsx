import {
  Box,
  Flex,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Layers, LineChart } from 'lucide-react'

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
 * Dedicated page for the category breakdown that used to live inside the
 * Dashboard. Mirrors the visual contract of `ChartsPage` (period navigator
 * card + section card with header + content) so the user feels at home.
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
  const overviewBadgeBg = useColorModeValue('purple.50', 'rgba(139,92,246,0.14)')
  const overviewBadgeColor = useColorModeValue('purple.600', 'purple.300')
  const pageBg = useColorModeValue('gray.50', '#060606')
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400')

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
          <>
            <SectionCard>
              <Flex
                direction={{ base: 'column', xl: 'row' }}
                align={{ base: 'stretch', xl: 'center' }}
                justify="space-between"
                gap={{ base: 3, md: 4 }}
                p={{ base: 4, sm: 5 }}
                w="full"
              >
                <Box
                  flexShrink={0}
                  maxW={{ xl: '320px' }}
                  w={{ base: 'full', xl: 'auto' }}
                >
                  <SectionHeader
                    icon={LineChart}
                    title="Period"
                    caption="Browse categories by day, week, month or year"
                    accent="violet"
                    rightSlot={
                      <Box
                        px={2.5}
                        py={1}
                        borderRadius="full"
                        bg={overviewBadgeBg}
                        color={overviewBadgeColor}
                        fontSize="xs"
                        fontWeight={700}
                        letterSpacing="0.04em"
                        textTransform="uppercase"
                      >
                        {periodLabel}
                      </Box>
                    }
                  />
                </Box>

                <Box flex={1} w="full">
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
              </Flex>
            </SectionCard>

            <SectionCard staticOnHover>
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
            </SectionCard>
          </>
        )}
      </VStack>
    </Box>
  )
}
