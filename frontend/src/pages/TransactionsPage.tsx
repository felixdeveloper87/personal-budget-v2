import {
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodData } from '../hooks/usePeriodData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'
import PeriodNavigator from '../components/summary/PeriodNavigator'
import TransactionsChart from '../components/charts/modal/TransactionsChart'
import { SectionCard, PageSkeleton } from '../components/ui'
import { AlertCircle, ReceiptText } from '../components/ui/icons'

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
  const infoBg = useColorModeValue('blue.50', 'rgba(37,99,235,0.10)')
  const infoBorder = useColorModeValue('blue.100', 'rgba(96,165,250,0.20)')
  const infoColor = useColorModeValue('blue.600', 'blue.300')
  const pageIconBg = useColorModeValue(
    'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #2563eb 0%, #6d28d9 100%)',
  )

  return (
    <Box px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }} maxW="1400px" mx="auto">
      <VStack spacing={{ base: 4, md: 5 }} align="stretch">
        {/* ── Page header ─────────────────────────────────────────── */}
        <HStack px={{ base: 1, sm: 2 }} spacing={3} align="center">
          <Flex
            w="40px"
            h="40px"
            borderRadius="xl"
            align="center"
            justify="center"
            bg={pageIconBg}
            color="white"
            boxShadow="0 4px 12px -4px rgba(59,130,246,0.5)"
            flexShrink={0}
          >
            <Icon as={ReceiptText} boxSize={5} weight="duotone" />
          </Flex>
          <Box>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={800} color={titleColor}>
              Transactions
            </Text>
            <Text color={captionColor} fontSize="sm">
              Activity and spending patterns for the selected period.
            </Text>
          </Box>
        </HStack>

        {/* ── Command bar: period navigator + KPIs ────────────────── */}
        <SectionCard staticOnHover>
          <Box px={{ base: 3, sm: 5 }} pt={{ base: 3, sm: 4 }}>
            <HStack
              spacing={2.5}
              px={3}
              py={2.5}
              bg={infoBg}
              border="1px solid"
              borderColor={infoBorder}
              borderRadius="lg"
              color={infoColor}
              align="flex-start"
            >
              <Icon as={AlertCircle} boxSize={4} mt={0.5} flexShrink={0} />
              <Text fontSize="xs" lineHeight="1.45">
                This view follows daily activity and purchase dates to reveal your spending
                behaviour. Card payment dates remain in the Home cash-flow overview.
              </Text>
            </HStack>
          </Box>

          <Box px={{ base: 3, sm: 5 }} pt={3} pb={{ base: 3, sm: 4 }}>
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

        </SectionCard>

        {/* ── Chart + ledger ──────────────────────────────────────── */}
        <SectionCard staticOnHover>
          <Box px={{ base: 3, sm: 4, md: 5 }} py={{ base: 4, sm: 5 }}>
            {loading ? (
              <PageSkeleton />
            ) : (
              <TransactionsChart
                transactions={periodData.transactions}
                periodType={selectedPeriod}
                selectedDate={selectedDate}
              />
            )}
          </Box>
        </SectionCard>
      </VStack>
    </Box>
  )
}
