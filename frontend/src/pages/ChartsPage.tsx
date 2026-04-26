import type { ReactNode } from 'react'
import {
  Badge,
  Box,
  Divider,
  Flex,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  BarChart3,
  DollarSign,
  LineChart,
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
import {
  ChartsPageHeader,
  ChartsPageSkeleton,
} from '../components/charts/page'
import {
  SectionCard,
  SectionHeader,
  type SectionHeaderAccent,
} from '../components/ui'

interface ChartShellProps {
  icon: LucideIcon
  title: string
  caption: string
  accent: SectionHeaderAccent
  badgeScheme: string
  periodLabel: string
  children: ReactNode
}

function ChartShell({
  icon,
  title,
  caption,
  accent,
  badgeScheme,
  periodLabel,
  children,
}: ChartShellProps) {
  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  return (
    <SectionCard staticOnHover>
      <Box p={{ base: 4, sm: 5, md: 6 }}>
        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <SectionHeader
            icon={icon}
            title={title}
            caption={caption}
            accent={accent}
            rightSlot={
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
              >
                {periodLabel}
              </Badge>
            }
          />
          <Divider borderColor={dividerColor} />
          {children}
        </VStack>
      </Box>
    </SectionCard>
  )
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
  const overviewBadgeBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.14)')
  const overviewBadgeColor = useColorModeValue('blue.600', 'blue.300')
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
                    caption="Browse charts by day, week, month or year"
                    accent="blue"
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
                    onPeriodChange={onPeriodChange}
                    onNavigatePeriod={navigatePeriod}
                    onGoToToday={goToToday}
                    formatLabel={formatLabel}
                    isEmbedded
                  />
                </Box>
              </Flex>
            </SectionCard>

            <ChartShell
              icon={BarChart3}
              title="Transactions"
              caption="Daily activity across income and expenses"
              accent="blue"
              badgeScheme="blue"
              periodLabel={periodLabel}
            >
              <TransactionsChart
                transactions={periodData.transactions}
                selectedPeriod={periodData.label}
                showPeriodBadge={false}
              />
            </ChartShell>

            <ChartShell
              icon={TrendingUp}
              title="Income"
              caption="Where money is coming from"
              accent="green"
              badgeScheme="green"
              periodLabel={periodLabel}
            >
              <IncomeChart
                transactions={periodData.transactions}
                selectedPeriod={periodData.label}
                showPeriodBadge={false}
              />
            </ChartShell>

            <ChartShell
              icon={TrendingDown}
              title="Expenses"
              caption="Where money is going"
              accent="red"
              badgeScheme="red"
              periodLabel={periodLabel}
            >
              <ExpensesChart
                transactions={periodData.transactions}
                selectedPeriod={periodData.label}
                showPeriodBadge={false}
              />
            </ChartShell>

            <ChartShell
              icon={DollarSign}
              title="Balance"
              caption="How your balance evolves over time"
              accent="violet"
              badgeScheme="purple"
              periodLabel={periodLabel}
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
