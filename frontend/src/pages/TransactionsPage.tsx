import { useState } from 'react'
import {
  Box,
  Button,
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
import type { TransactionDateBasis } from '../utils/transactionDates'
import PeriodNavigator from '../components/summary/PeriodNavigator'
import TransactionsChart from '../components/charts/modal/TransactionsChart'
import { SectionCard, PageSkeleton } from '../components/ui'
import { AlertCircle, ChartLineUp, ReceiptText } from '../components/ui/icons'

const BASIS_OPTIONS: { value: TransactionDateBasis; label: string; description: string }[] = [
  {
    value: 'activity',
    label: 'Behaviour',
    description: 'Grouped by purchase date — reveals spending habits and patterns.',
  },
  {
    value: 'cash-flow',
    label: 'Payments',
    description: 'Grouped by payment date — shows what actually hits your account each day.',
  },
]

export default function TransactionsPage() {
  const [dateBasis, setDateBasis] = useState<TransactionDateBasis>('activity')

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
    dateBasis,
  )

  // ── Theme tokens ──────────────────────────────────────────────────────
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')

  const infoBg = useColorModeValue('blue.50', 'rgba(37,99,235,0.10)')
  const infoBorder = useColorModeValue('blue.100', 'rgba(96,165,250,0.20)')
  const infoColor = useColorModeValue('blue.600', 'blue.300')

  const toggleTrackBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const toggleActiveBg = useColorModeValue('white', 'rgba(255,255,255,0.12)')
  const toggleActiveBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const toggleActiveShadow = useColorModeValue(
    '0 1px 4px rgba(15,23,42,0.12)',
    '0 1px 4px rgba(0,0,0,0.5)',
  )
  const toggleActiveColor = useColorModeValue('gray.900', 'gray.50')
  const toggleInactiveColor = useColorModeValue('gray.500', 'gray.400')

  const pageIconBg = useColorModeValue(
    'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #2563eb 0%, #6d28d9 100%)',
  )

  const activeOption = BASIS_OPTIONS.find((o) => o.value === dateBasis)!

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

        {/* ── Command bar ─────────────────────────────────────────── */}
        <SectionCard staticOnHover>
          {/* View toggle */}
          <Box px={{ base: 3, sm: 5 }} pt={{ base: 3, sm: 4 }}>
            <HStack spacing={3} align="center">
              <Icon as={ChartLineUp} boxSize={4} color={infoColor} flexShrink={0} />
              <Text fontSize="xs" fontWeight={700} color={infoColor}>
                View as
              </Text>
              <Box
                bg={toggleTrackBg}
                p="3px"
                borderRadius="lg"
                display="inline-flex"
              >
                <HStack spacing={0}>
                  {BASIS_OPTIONS.map((option) => {
                    const active = dateBasis === option.value
                    return (
                      <Button
                        key={option.value}
                        h="30px"
                        px={3}
                        variant="ghost"
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight={active ? 700 : 500}
                        color={active ? toggleActiveColor : toggleInactiveColor}
                        bg={active ? toggleActiveBg : 'transparent'}
                        border={active ? '1px solid' : '1px solid transparent'}
                        borderColor={active ? toggleActiveBorder : 'transparent'}
                        boxShadow={active ? toggleActiveShadow : 'none'}
                        _hover={{ bg: active ? toggleActiveBg : 'transparent', color: toggleActiveColor }}
                        _active={{ transform: 'scale(0.97)' }}
                        transition="all 0.18s ease"
                        onClick={() => setDateBasis(option.value)}
                      >
                        {option.label}
                      </Button>
                    )
                  })}
                </HStack>
              </Box>
            </HStack>
          </Box>

          {/* Info note — updates with the active view */}
          <Box px={{ base: 3, sm: 5 }} pt={2}>
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
                {activeOption.description}
              </Text>
            </HStack>
          </Box>

          {/* Period navigator */}
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
                dateBasis={dateBasis}
              />
            )}
          </Box>
        </SectionCard>
      </VStack>
    </Box>
  )
}
