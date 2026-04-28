import type { ReactNode } from 'react'
import {
  Badge,
  Box,
  Divider,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  BarChart3,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { usePeriodData } from '../hooks/usePeriodData'
import { usePeriodNavigator } from '../hooks/usePeriodNavigator'
import { useDashboardData } from '../hooks/useDashboardData'

import PeriodNavigator from '../components/summary/PeriodNavigator'
import {
  TransactionsChart,
  IncomeChart,
  ExpensesChart,
  BalanceChart,
} from '../components/charts/modal'
import { ChartHeaderStats } from '../components/charts/modal/components'
import type { ChartHeaderStatsVariant } from '../components/charts/modal/components'
import {
  ChartsPageHeader,
  ChartsPageSkeleton,
} from '../components/charts/page'
import {
  SectionCard,
  type SectionHeaderAccent,
} from '../components/ui'

interface AccentTokens {
  bgLight: string
  bgDark: string
  fgLight: string
  fgDark: string
}

const ACCENT_TOKENS: Record<SectionHeaderAccent, AccentTokens> = {
  blue: {
    bgLight: 'blue.50',
    bgDark: 'rgba(59,130,246,0.14)',
    fgLight: 'blue.600',
    fgDark: 'blue.300',
  },
  green: {
    bgLight: 'green.50',
    bgDark: 'rgba(34,197,94,0.14)',
    fgLight: 'green.600',
    fgDark: 'green.300',
  },
  red: {
    bgLight: 'red.50',
    bgDark: 'rgba(239,68,68,0.14)',
    fgLight: 'red.600',
    fgDark: 'red.300',
  },
  violet: {
    bgLight: 'purple.50',
    bgDark: 'rgba(139,92,246,0.14)',
    fgLight: 'purple.600',
    fgDark: 'purple.300',
  },
  pink: {
    bgLight: 'pink.50',
    bgDark: 'rgba(236,72,153,0.14)',
    fgLight: 'pink.600',
    fgDark: 'pink.300',
  },
  amber: {
    bgLight: 'orange.50',
    bgDark: 'rgba(249,115,22,0.14)',
    fgLight: 'orange.600',
    fgDark: 'orange.300',
  },
  neutral: {
    bgLight: 'gray.100',
    bgDark: 'whiteAlpha.100',
    fgLight: 'gray.700',
    fgDark: 'gray.200',
  },
}

interface ChartShellProps {
  icon: LucideIcon
  title: string
  caption: string
  accent: SectionHeaderAccent
  badgeScheme: string
  periodLabel: string
  /**
   * Optional KPI row rendered inline between the title block and the
   * period badge. On smaller screens the row wraps below the title.
   */
  headerStats?: ReactNode
  children: ReactNode
}

function ChartShell({
  icon,
  title,
  caption,
  accent,
  badgeScheme,
  periodLabel,
  headerStats,
  children,
}: ChartShellProps) {
  const tokens = ACCENT_TOKENS[accent]
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const chipBg = useColorModeValue(tokens.bgLight, tokens.bgDark)
  const chipFg = useColorModeValue(tokens.fgLight, tokens.fgDark)
  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  const periodBadge = (
    <Badge
      variant="subtle"
      colorScheme={badgeScheme}
      borderRadius="full"
      px={2.5}
      py={1}
      fontSize="xs"
      fontWeight={700}
      textTransform="uppercase"
      letterSpacing="0.04em"
      flexShrink={0}
    >
      {periodLabel}
    </Badge>
  )

  return (
    <SectionCard staticOnHover>
      <Box p={{ base: 4, sm: 5, md: 6 }}>
        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align={{ base: 'stretch', lg: 'center' }}
            justify={{ lg: 'space-between' }}
            gap={{ base: 3, lg: 5 }}
            w="full"
          >
            {/* Top row on mobile / left on desktop: brand block + (mobile) badge */}
            <HStack
              spacing={3}
              align="center"
              minW={0}
              flexShrink={0}
            >
              <Box
                w={9}
                h={9}
                borderRadius="lg"
                bg={chipBg}
                color={chipFg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={icon} boxSize={4} strokeWidth={2.25} />
              </Box>
              <VStack
                align="flex-start"
                spacing={0}
                minW={0}
                flex={1}
              >
                <Text
                  fontWeight={700}
                  fontSize="md"
                  color={titleColor}
                  lineHeight="1.2"
                  noOfLines={1}
                >
                  {title}
                </Text>
                <Text fontSize="xs" color={captionColor} noOfLines={1}>
                  {caption}
                </Text>
              </VStack>
              <Box display={{ base: 'block', lg: 'none' }}>{periodBadge}</Box>
            </HStack>

            {/* Stats — inline on desktop, wrapped row below on mobile */}
            {headerStats && (
              <Box flex={{ lg: 1 }} minW={0}>
                <HStack justify={{ base: 'flex-start', lg: 'center' }}>
                  {headerStats}
                </HStack>
              </Box>
            )}

            {/* Period badge — visible only on desktop (already shown on mobile) */}
            <Box display={{ base: 'none', lg: 'block' }}>{periodBadge}</Box>
          </Flex>
          <Divider borderColor={dividerColor} />
          {children}
        </VStack>
      </Box>
    </SectionCard>
  )
}

const STATS_VARIANTS: Record<
  'transactions' | 'income' | 'expenses' | 'balance',
  ChartHeaderStatsVariant
> = {
  transactions: 'transactions',
  income: 'income',
  expenses: 'expenses',
  balance: 'balance',
}

export default function ChartsPage() {
  const {
    selectedDate,
    selectedPeriod,
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
  )

  const periodLabel = formatLabel()
  const pageBg = useColorModeValue('gray.50', '#060606')

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
        <ChartsPageHeader periodLabel={periodLabel} onGoToToday={goToToday} />

        {loading ? (
          <ChartsPageSkeleton />
        ) : (
          <>
            {/* Period Navigator as a standalone integrated card */}
            <SectionCard staticOnHover>
              <Box px={{ base: 4, sm: 5 }} py={{ base: 4, sm: 5 }}>
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
            </SectionCard>

            <ChartShell
              icon={BarChart3}
              title="Transactions"
              caption="Daily activity across income and expenses"
              accent="blue"
              badgeScheme="blue"
              periodLabel={periodLabel}
              headerStats={
                <ChartHeaderStats
                  transactions={periodData.transactions}
                  variant={STATS_VARIANTS.transactions}
                />
              }
            >
              <TransactionsChart
                transactions={periodData.transactions}
                selectedPeriod={periodData.label}
                showPeriodBadge={false}
                periodType={selectedPeriod}
                selectedDate={selectedDate}
              />
            </ChartShell>

            <ChartShell
              icon={TrendingUp}
              title="Income"
              caption="Where money is coming from"
              accent="green"
              badgeScheme="green"
              periodLabel={periodLabel}
              headerStats={
                <ChartHeaderStats
                  transactions={periodData.transactions}
                  variant={STATS_VARIANTS.income}
                />
              }
            >
              <IncomeChart
                transactions={periodData.transactions}
                selectedPeriod={periodData.label}
                showPeriodBadge={false}
                periodType={selectedPeriod}
                selectedDate={selectedDate}
              />
            </ChartShell>

            <ChartShell
              icon={TrendingDown}
              title="Expenses"
              caption="Where money is going"
              accent="red"
              badgeScheme="red"
              periodLabel={periodLabel}
              headerStats={
                <ChartHeaderStats
                  transactions={periodData.transactions}
                  variant={STATS_VARIANTS.expenses}
                />
              }
            >
              <ExpensesChart
                transactions={periodData.transactions}
                selectedPeriod={periodData.label}
                showPeriodBadge={false}
                periodType={selectedPeriod}
                selectedDate={selectedDate}
              />
            </ChartShell>

            <ChartShell
              icon={DollarSign}
              title="Balance"
              caption="How your balance evolves over time"
              accent="violet"
              badgeScheme="purple"
              periodLabel={periodLabel}
              headerStats={
                <ChartHeaderStats
                  transactions={periodData.transactions}
                  variant={STATS_VARIANTS.balance}
                  currentBalance={periodData.balance}
                />
              }
            >
              <BalanceChart
                transactions={periodData.transactions}
                selectedPeriod={periodData.label}
                currentBalance={periodData.balance}
                showPeriodBadge={false}
              />
            </ChartShell>
          </>
        )}
      </VStack>
    </Box>
  )
}
