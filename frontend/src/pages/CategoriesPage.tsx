import {
  Box,
  Flex,
  HStack,
  Heading,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { AlertCircle, Layers, TrendingDown, TrendingUp } from '../components/ui/icons'

import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodData } from '../hooks/usePeriodData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'

import PeriodNavigator from '../components/summary/PeriodNavigator'
import ExpensesChart from '../components/charts/modal/ExpensesChart'
import IncomeChart from '../components/charts/modal/IncomeChart'
import { PageSkeleton } from '../components/ui'
import type { Transaction } from '../types'

interface CategoriesPageProps {
  /** Tab to open on first render — used when navigating from the home cards. */
  initialTab?: 'expenses' | 'incomes'
}

/**
 * Dedicated page for the category breakdown — completely redesigned with
 * an integrated header, summary stats, and inline period navigation.
 */
export default function CategoriesPage({ initialTab }: CategoriesPageProps) {
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
  } = usePeriodNavigator(initialTab)
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

  /* ── Surface tokens ── */
  const surface = useColorModeValue(
    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    'linear-gradient(135deg, rgba(18, 18, 22, 0.75) 0%, rgba(10, 10, 12, 0.85) 100%)',
  )
  const border = useColorModeValue('rgba(0, 0, 0, 0.06)', 'rgba(255, 255, 255, 0.04)')
  const headerBg = useColorModeValue(
    'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)',
    'linear-gradient(135deg, rgba(15, 15, 20, 0.6) 0%, rgba(10, 10, 14, 0.5) 100%)',
  )
  const headerBorder = useColorModeValue('rgba(0, 0, 0, 0.04)', 'rgba(255, 255, 255, 0.03)')
  const titleColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const subColor = useColorModeValue('gray.500', 'gray.400')
  const iconBoxBg = useColorModeValue('purple.50', 'rgba(139, 92, 246, 0.12)')
  const iconBoxColor = useColorModeValue('purple.600', 'purple.300')
  const infoBg = useColorModeValue('blue.50', 'rgba(37,99,235,0.10)')
  const infoBorder = useColorModeValue('blue.100', 'rgba(96,165,250,0.20)')
  const infoColor = useColorModeValue('blue.600', 'blue.300')
  const accentGradient = useColorModeValue(
    'linear-gradient(135deg, #7c3aed, #2563eb)',
    'linear-gradient(135deg, #a78bfa, #60a5fa)',
  )

  /* ── Tab tokens ── */
  const tabTrackBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const tabTrackBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')

  const expenseActiveBg = useColorModeValue('white', 'whiteAlpha.200')
  const expenseActiveColor = useColorModeValue('red.600', 'red.300')
  const expenseActiveBorder = useColorModeValue('red.200', 'rgba(239,68,68,0.35)')
  const expenseActiveShadow = useColorModeValue(
    '0 1px 3px rgba(239, 68, 68, 0.08), 0 4px 12px rgba(239, 68, 68, 0.06)',
    '0 1px 3px rgba(239, 68, 68, 0.15)',
  )

  const incomeActiveBg = useColorModeValue('white', 'whiteAlpha.200')
  const incomeActiveColor = useColorModeValue('green.600', 'green.300')
  const incomeActiveBorder = useColorModeValue('green.200', 'rgba(34,197,94,0.35)')
  const incomeActiveShadow = useColorModeValue(
    '0 1px 3px rgba(34, 197, 94, 0.08), 0 4px 12px rgba(34, 197, 94, 0.06)',
    '0 1px 3px rgba(34, 197, 94, 0.15)',
  )

  const tabInactiveColor = useColorModeValue('gray.500', 'gray.400')
  const tabInactiveHoverColor = useColorModeValue('gray.700', 'gray.200')

  /* ── Summary stats ── */
  const incomeTotal = periodData.transactions
    .filter((t: Transaction) => t.type === 'INCOME')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
  const expenseTotal = periodData.transactions
    .filter((t: Transaction) => t.type === 'EXPENSE')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
  const incomeCategories = new Set(
    periodData.transactions.filter((t: Transaction) => t.type === 'INCOME').map((t: Transaction) => t.category),
  ).size
  const expenseCategories = new Set(
    periodData.transactions.filter((t: Transaction) => t.type === 'EXPENSE').map((t: Transaction) => t.category),
  ).size

  const hasData = periodData.transactions.length > 0

  const statValueColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const statLabelColor = useColorModeValue('gray.500', 'gray.400')
  const statCardBg = useColorModeValue('white', 'rgba(255, 255, 255, 0.03)')
  const statCardBorder = useColorModeValue('rgba(0, 0, 0, 0.04)', 'rgba(255, 255, 255, 0.03)')
  const redAccent = useColorModeValue('red.500', 'red.300')
  const greenAccent = useColorModeValue('green.500', 'green.300')
  const cardShadow = useColorModeValue(
    '0 4px 16px -4px rgba(15, 23, 42, 0.06)',
    '0 4px 16px -4px rgba(0, 0, 0, 0.4)',
  )

  const fmt = (n: number) =>
    `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <Box
      px={{ base: 2, md: 4, lg: 6 }}
      py={{ base: 4, md: 7 }}
      maxW="1400px"
      mx="auto"
    >
      <VStack spacing={{ base: 4, md: 5 }} align="stretch">
        {/* ─── Main card ─── */}
        <Box
          w="full"
          borderRadius="2xl"
          bg={surface}
          border="1px solid"
          borderColor={border}
          overflow="hidden"
          boxShadow={cardShadow}
        >
          {/* ─── Header ─── */}
          <Box
            bg={headerBg}
            borderBottom="1px solid"
            borderBottomColor={headerBorder}
            px={{ base: 4, md: 6 }}
            py={{ base: 4, md: 5 }}
            position="relative"
            overflow="hidden"
          >
            {/* Top accent bar */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="2px"
              background={accentGradient}
              opacity={0.5}
            />

            <Flex
              direction="row"
              align="center"
              justify="space-between"
              gap={3}
            >
              {/* Left: icon + title */}
              <HStack spacing={3} align="center">
                <Flex
                  w={{ base: 9, md: 10 }}
                  h={{ base: 9, md: 10 }}
                  align="center"
                  justify="center"
                  borderRadius="xl"
                  bg={iconBoxBg}
                  color={iconBoxColor}
                  flexShrink={0}
                >
                  <Icon as={Layers} boxSize={5} weight="duotone" />
                </Flex>

                <VStack spacing={0} align="flex-start">
                  <Heading
                    as="h1"
                    fontSize={{ base: 'lg', md: 'xl' }}
                    fontWeight={800}
                    color={titleColor}
                    letterSpacing="-0.02em"
                    lineHeight={1.1}
                  >
                    Categories
                  </Heading>
                  <Text
                    fontSize="xs"
                    fontWeight={500}
                    color={subColor}
                    display={{ base: 'none', sm: 'block' }}
                  >
                    See where every pound goes, broken down by category
                  </Text>
                </VStack>
              </HStack>

              {/* Right: Expenses/Incomes toggle */}
              <HStack spacing={2}>
                <HStack
                  spacing={0.5}
                  p={0.5}
                  borderRadius="xl"
                  bg={tabTrackBg}
                  border="1px solid"
                  borderColor={tabTrackBorder}
                >
                  <CategoryTabButton
                    icon={TrendingDown}
                    label="Expenses"
                    isActive={activeTab === 'expenses'}
                    onClick={() => setActiveTab('expenses')}
                    activeBg={expenseActiveBg}
                    activeBorder={expenseActiveBorder}
                    activeColor={expenseActiveColor}
                    activeShadow={expenseActiveShadow}
                    inactiveColor={tabInactiveColor}
                    hoverColor={tabInactiveHoverColor}
                  />
                  <CategoryTabButton
                    icon={TrendingUp}
                    label="Incomes"
                    isActive={activeTab === 'incomes'}
                    onClick={() => setActiveTab('incomes')}
                    activeBg={incomeActiveBg}
                    activeBorder={incomeActiveBorder}
                    activeColor={incomeActiveColor}
                    activeShadow={incomeActiveShadow}
                    inactiveColor={tabInactiveColor}
                    hoverColor={tabInactiveHoverColor}
                  />
                </HStack>
              </HStack>
            </Flex>
          </Box>

          {/* ─── Period Navigator ─── */}
          <Box px={{ base: 4, md: 6 }} pt={{ base: 3, md: 4 }}>
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
                Categories follow daily activity and purchase dates to show spending behaviour.
              </Text>
            </HStack>
          </Box>

          <Box
            px={{ base: 4, md: 6 }}
            pt={3}
            pb={{ base: 3, md: 4 }}
            borderBottom="1px solid"
            borderBottomColor={headerBorder}
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

          {/* ─── Quick stats row ─── */}
          {hasData && !loading && (
            <Box
              px={{ base: 4, md: 6 }}
              py={{ base: 3, md: 4 }}
              borderBottom="1px solid"
              borderBottomColor={headerBorder}
            >
              <Flex gap={3} wrap="wrap">
                <MiniStatCard
                  label="Expense categories"
                  value={String(expenseCategories)}
                  accent={redAccent}
                  bg={statCardBg}
                  border={statCardBorder}
                  valueColor={statValueColor}
                  labelColor={statLabelColor}
                />
                <MiniStatCard
                  label="Total expenses"
                  value={fmt(expenseTotal)}
                  accent={redAccent}
                  bg={statCardBg}
                  border={statCardBorder}
                  valueColor={statValueColor}
                  labelColor={statLabelColor}
                />
                <MiniStatCard
                  label="Income categories"
                  value={String(incomeCategories)}
                  accent={greenAccent}
                  bg={statCardBg}
                  border={statCardBorder}
                  valueColor={statValueColor}
                  labelColor={statLabelColor}
                />
                <MiniStatCard
                  label="Total income"
                  value={fmt(incomeTotal)}
                  accent={greenAccent}
                  bg={statCardBg}
                  border={statCardBorder}
                  valueColor={statValueColor}
                  labelColor={statLabelColor}
                />
              </Flex>
            </Box>
          )}

          {/* ─── Content ─── */}
          <Box px={{ base: 2, sm: 3, md: 4, lg: 5 }} py={{ base: 3, md: 4 }}>
            {loading ? (
              <PageSkeleton />
            ) : hasData ? (
              activeTab === 'expenses' ? (
                <ExpensesChart
                  transactions={periodData.transactions}
                  selectedPeriod={formatLabel()}
                  showPeriodBadge={false}
                  compact
                />
              ) : (
                <IncomeChart
                  transactions={periodData.transactions}
                  selectedPeriod={formatLabel()}
                  showPeriodBadge={false}
                  compact
                />
              )
            ) : (
              <EmptyState />
            )}
          </Box>
        </Box>
      </VStack>
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

interface CategoryTabButtonProps {
  icon: any
  label: string
  isActive: boolean
  onClick: () => void
  activeBg: string
  activeBorder: string
  activeColor: string
  activeShadow: string
  inactiveColor: string
  hoverColor: string
}

function CategoryTabButton({
  icon: IconComponent,
  label,
  isActive,
  onClick,
  activeBg,
  activeBorder,
  activeColor,
  activeShadow,
  inactiveColor,
  hoverColor,
}: CategoryTabButtonProps) {
  return (
    <Box
      as="button"
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap={1.5}
      px={3}
      py={1.5}
      borderRadius="lg"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : inactiveColor}
      border="1px solid"
      borderColor={isActive ? activeBorder : 'transparent'}
      fontWeight={isActive ? 700 : 600}
      fontSize="sm"
      boxShadow={isActive ? activeShadow : 'none'}
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        color: isActive ? activeColor : hoverColor,
      }}
    >
      <Icon as={IconComponent} boxSize={4} weight={isActive ? 'duotone' : 'regular'} />
      <Text as="span" lineHeight={1} display={{ base: 'none', sm: 'inline' }}>
        {label}
      </Text>
    </Box>
  )
}

interface MiniStatCardProps {
  label: string
  value: string
  accent: string
  bg: string
  border: string
  valueColor: string
  labelColor: string
}

function MiniStatCard({ label, value, accent, bg, border, valueColor, labelColor }: MiniStatCardProps) {
  return (
    <Box
      flex="1"
      minW="130px"
      px={4}
      py={3}
      borderRadius="xl"
      bg={bg}
      border="1px solid"
      borderColor={border}
      position="relative"
      overflow="hidden"
    >
      {/* Left accent bar */}
      <Box
        position="absolute"
        left={0}
        top="20%"
        bottom="20%"
        w="3px"
        borderRadius="full"
        bg={accent}
      />
      <VStack spacing={0} align="flex-start">
        <Text fontSize="2xs" fontWeight={700} color={labelColor} textTransform="uppercase" letterSpacing="0.06em">
          {label}
        </Text>
        <Text fontSize="md" fontWeight={800} color={valueColor} letterSpacing="-0.02em">
          {value}
        </Text>
      </VStack>
    </Box>
  )
}

function EmptyState() {
  const textColor = useColorModeValue('gray.500', 'gray.400')
  const iconColor = useColorModeValue('gray.300', 'gray.600')

  return (
    <VStack spacing={3} py={16} align="center">
      <Flex
        w={14}
        h={14}
        align="center"
        justify="center"
        borderRadius="2xl"
        bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
      >
        <Icon as={Layers} boxSize={7} color={iconColor} weight="duotone" />
      </Flex>
      <VStack spacing={1}>
        <Text fontSize="md" fontWeight={700} color={textColor}>
          No data for this period
        </Text>
        <Text fontSize="sm" color={textColor} opacity={0.7} maxW="340px" textAlign="center">
          Add transactions in this date range to see how your money breaks down by category.
        </Text>
      </VStack>
    </VStack>
  )
}
