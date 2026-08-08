import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  CalendarClock,
  DollarSign,
  FileText,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from '../../components/ui/icons'
import type { LucideIcon } from '../../components/ui/icons'
import PeriodNavigator from '../../components/summary/PeriodNavigator'
import { SectionCard, SectionHeader } from '../../components/ui'
import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { getReport } from '../../api'
import type {
  PeriodType,
  ReportCategoryBreakdown,
  ReportPaymentMethodBreakdown,
  ReportResponse,
  ReportTransactionItem,
} from '../../types'
import { ToastService } from '../../services/toast'
import { formatAccountMovement } from '../../components/reports/format'

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const numberFormatter = new Intl.NumberFormat('en-GB')

function formatCurrency(value: number) {
  return currencyFormatter.format(Number(value) || 0)
}

function formatDate(value: string) {
  if (!value) return '-'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function fileDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface MetricCardProps {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  accent: ReportTone
}

type ReportTone = 'brand' | 'income' | 'expense' | 'commitment'

const REPORT_TONES: Record<ReportTone, { color: string; strong: string; tint: string }> = {
  brand: {
    color: 'var(--pb-forest-2)',
    strong: 'var(--pb-forest)',
    tint: 'var(--pb-tint-green)',
  },
  income: {
    color: 'var(--pb-income)',
    strong: 'var(--pb-income-2)',
    tint: 'var(--pb-tint-income)',
  },
  expense: {
    color: 'var(--pb-coral)',
    strong: 'var(--pb-coral-2)',
    tint: 'var(--pb-tint-coral)',
  },
  commitment: {
    color: 'var(--pb-gold)',
    strong: 'var(--pb-gold-2)',
    tint: 'var(--pb-tint-gold)',
  },
}

function MetricCard({ label, value, detail, icon, accent }: MetricCardProps) {
  const { color: accentColor, tint: chipBg } = REPORT_TONES[accent]

  return (
    <Box
      border="1px solid"
      borderColor="var(--pb-hair)"
      borderRadius="xl"
      bg="var(--pb-surface-2)"
      p={4}
      minH="126px"
    >
      <HStack justify="space-between" align="flex-start" spacing={3}>
        <VStack align="flex-start" spacing={1} minW={0}>
          <Text fontSize="xs" color="var(--pb-ink-soft)" fontWeight={700} textTransform="uppercase">
            {label}
          </Text>
          <Text fontSize={{ base: 'lg', md: 'xl' }} color="var(--pb-ink)" fontWeight={800} noOfLines={1}>
            {value}
          </Text>
          <Text fontSize="xs" color="var(--pb-ink-soft)" noOfLines={2}>
            {detail}
          </Text>
        </VStack>
        <Box
          w={9}
          h={9}
          borderRadius="lg"
          bg={chipBg}
          color={accentColor}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={4} weight="duotone" />
        </Box>
      </HStack>
    </Box>
  )
}

function CategoryBars({
  title,
  items,
  tone,
}: {
  title: string
  items: ReportCategoryBreakdown[]
  tone: 'income' | 'expense'
}) {
  const fillColor = REPORT_TONES[tone].strong

  return (
    <VStack align="stretch" spacing={3}>
      <Text fontSize="sm" fontWeight={800} color="var(--pb-ink)">
        {title}
      </Text>
      {items.length === 0 ? (
        <Text fontSize="sm" color="var(--pb-ink-soft)">
          No data for this period.
        </Text>
      ) : (
        items.slice(0, 6).map((item) => (
          <Box key={item.category}>
            <HStack justify="space-between" spacing={3} mb={1}>
              <Text fontSize="sm" color="var(--pb-ink)" fontWeight={600} noOfLines={1}>
                {item.category}
              </Text>
              <Text fontSize="xs" color="var(--pb-ink-soft)" flexShrink={0}>
                {formatCurrency(item.amount)} - {item.percentage}%
              </Text>
            </HStack>
            <Box h="8px" bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden">
              <Box h="full" w={`${Math.min(item.percentage, 100)}%`} bg={fillColor} borderRadius="full" />
            </Box>
          </Box>
        ))
      )}
    </VStack>
  )
}

function PaymentMethodBars({ items }: { items: ReportPaymentMethodBreakdown[] }) {
  if (items.length === 0) return null

  return (
    <VStack align="stretch" spacing={3}>
      <Text fontSize="sm" fontWeight={800} color="var(--pb-ink)">
        Payment methods
      </Text>
      {items.slice(0, 6).map((item) => (
        <Box key={item.name}>
          <HStack justify="space-between" spacing={3} mb={1}>
            <Text fontSize="sm" color="var(--pb-ink)" fontWeight={600} noOfLines={1}>
              {item.name}
            </Text>
            <HStack spacing={2} flexShrink={0}>
              <Text fontSize="xs" color="var(--pb-ink)" fontWeight={700}>
                {formatCurrency(item.amount)}
              </Text>
              <Text fontSize="xs" color="var(--pb-ink-soft)">
                {item.percentage}%
              </Text>
            </HStack>
          </HStack>
          <Box h="8px" bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden">
            <Box
              h="full"
              w={`${Math.min(item.percentage, 100)}%`}
              bg="var(--pb-forest-2)"
              borderRadius="full"
            />
          </Box>
          <Text fontSize="xs" color="var(--pb-ink-soft)" mt={0.5}>
            {item.transactionCount} {item.transactionCount === 1 ? 'transaction' : 'transactions'}
          </Text>
        </Box>
      ))}
    </VStack>
  )
}

function TransactionTable({
  title,
  transactions,
  tone,
}: {
  title: string
  transactions: ReportTransactionItem[]
  tone: 'income' | 'expense'
}) {
  const amountColor = REPORT_TONES[tone].color

  return (
    <VStack align="stretch" spacing={3}>
      <Text fontSize="sm" fontWeight={800} color="var(--pb-ink)">
        {title}
      </Text>
      {transactions.length === 0 ? (
        <Text fontSize="sm" color="var(--pb-ink-soft)">
          No transactions for this period.
        </Text>
      ) : (
        <VStack
          align="stretch"
          spacing={0}
          border="1px solid"
          borderColor="var(--pb-hair)"
          borderRadius="xl"
          bg="var(--pb-surface-2)"
          overflow="hidden"
        >
          {transactions.slice(0, 5).map((tx) => (
            <Flex
              key={tx.id}
              align="center"
              justify="space-between"
              gap={3}
              px={3}
              py={2.5}
              borderBottom="1px solid"
              borderColor="var(--pb-hair)"
              _last={{ borderBottom: 0 }}
            >
              <VStack align="flex-start" spacing={0} minW={0}>
                <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)" noOfLines={1}>
                  {tx.description || tx.category}
                </Text>
                <Text fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
                  {formatDate(tx.paymentDate)} - {tx.category}
                </Text>
                {formatAccountMovement(tx) ? (
                  <Text fontSize="xs" color="var(--pb-forest-2)" noOfLines={1}>
                    {formatAccountMovement(tx)}
                  </Text>
                ) : null}
              </VStack>
              <Text fontSize="sm" fontWeight={800} color={amountColor} flexShrink={0}>
                {formatCurrency(tx.amount)}
              </Text>
            </Flex>
          ))}
        </VStack>
      )}
    </VStack>
  )
}

function ReportsPageHeader({
  periodLabel,
  onGoToToday,
  onExport,
}: {
  periodLabel: string
  onGoToToday: () => void
  onExport: () => void
}) {
  return (
    <Flex w="full" minW={0} justify={{ base: 'stretch', sm: 'flex-end' }} px={{ base: 1, sm: 2 }}>
        <HStack spacing={2} justify={{ base: 'flex-start', sm: 'flex-end' }}>
          <HStack
            spacing={2}
            bg="var(--pb-surface-2)"
            border="1px solid"
            borderColor="var(--pb-hair)"
            borderRadius="full"
            px={3}
            py={1.5}
            display={{ base: 'none', lg: 'flex' }}
          >
            <Box w="6px" h="6px" borderRadius="full" bg="var(--pb-forest-2)" />
            <Text fontSize="xs" fontWeight={600} color="var(--pb-ink-soft)" noOfLines={1}>
              {periodLabel}
            </Text>
          </HStack>
          <Button
            size="sm"
            h="36px"
            borderRadius="lg"
            leftIcon={<Icon as={RotateCcw} boxSize={3.5} />}
            bg="var(--pb-surface-2)"
            color="var(--pb-ink-soft)"
            border="1px solid"
            borderColor="var(--pb-hair)"
            _hover={{ bg: 'var(--pb-surface-3)', color: 'var(--pb-ink)' }}
            _active={{ bg: 'var(--pb-surface-3)' }}
            _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
            onClick={onGoToToday}
          >
            Today
          </Button>
          <Button
            size="sm"
            h="36px"
            borderRadius="lg"
            leftIcon={<Icon as={FileText} boxSize={3.5} />}
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            border="1px solid"
            borderColor="var(--pb-forest-2)"
            _hover={{ bg: 'var(--pb-forest)', borderColor: 'var(--pb-forest)' }}
            _active={{ bg: 'var(--pb-forest)' }}
            _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
            onClick={onExport}
          >
            Export PDF
          </Button>
        </HStack>
      </Flex>
  )
}

export default function ReportsPage() {
  const {
    selectedDate,
    selectedPeriod,
    onDateChange,
    onPeriodChange,
    navigatePeriod,
    goToToday,
    formatLabel,
  } = usePeriodNavigator()
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getReport(selectedPeriod, selectedDate)
      .then((data) => {
        if (active) setReport(data)
      })
      .catch((err) => {
        if (active) {
          setReport(null)
          ToastService.apiError(err, {
            title: 'Could not load report',
            dedupeKey: 'report-load-failed',
          })
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [selectedPeriod, selectedDate])

  const handleExport = useCallback(() => {
    const params = new URLSearchParams({
      period: selectedPeriod,
      date: fileDate(selectedDate),
      autoPrint: 'true',
    })
    window.open(`/reports/print?${params.toString()}`, '_blank', 'noopener,noreferrer')
  }, [selectedPeriod, selectedDate])

  const metrics = useMemo(() => {
    if (!report) return []
    const balanceTone: ReportTone = report.balance > 0
      ? 'income'
      : report.balance < 0
        ? 'expense'
        : 'brand'

    return [
      {
        label: 'Income',
        value: formatCurrency(report.totalIncome),
        detail: `${numberFormatter.format(report.incomeCount)} incoming records`,
        icon: TrendingUp,
        accent: 'income' as const,
      },
      {
        label: 'Expenses',
        value: formatCurrency(report.totalExpense),
        detail: `${numberFormatter.format(report.expenseCount)} outgoing records`,
        icon: TrendingDown,
        accent: 'expense' as const,
      },
      {
        label: 'Balance',
        value: formatCurrency(report.balance),
        detail: 'Income minus expenses',
        icon: DollarSign,
        accent: balanceTone,
      },
      {
        label: 'Average expense',
        value: formatCurrency(report.averageExpense),
        detail: `${numberFormatter.format(report.transactionCount)} total transactions`,
        icon: Wallet,
        accent: 'brand' as const,
      },
    ]
  }, [report])

  const periodLabel = report?.periodLabel || formatLabel()

  return (
    <Box
      minH="100vh"
      bg="var(--pb-paper)"
      px={{ base: 2, md: 4, lg: 6 }}
      py={{ base: 4, md: 7 }}
      maxW="appContent"
      mx="auto"
    >
      <VStack spacing={{ base: 3, md: 4 }} align="stretch">
        <ReportsPageHeader
          periodLabel={periodLabel}
          onGoToToday={goToToday}
          onExport={handleExport}
        />

        <SectionCard staticOnHover>
          <VStack spacing={0} align="stretch">
            <Box px={{ base: 4, sm: 5 }} pt={{ base: 4, sm: 5 }} pb={{ base: 3, sm: 4 }}>
              <PeriodNavigator
                selectedPeriod={selectedPeriod as PeriodType}
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                onPeriodChange={onPeriodChange}
                onNavigatePeriod={navigatePeriod}
                onGoToToday={goToToday}
                formatLabel={formatLabel}
                isEmbedded
              />
            </Box>
            <Divider borderColor="var(--pb-hair)" />

            <Box p={{ base: 4, sm: 5, md: 6 }}>
              {loading ? (
                <VStack py={14} spacing={3}>
                  <Spinner color="var(--pb-forest-2)" />
                  <Text fontSize="sm" color="var(--pb-ink-soft)">
                    Preparing report...
                  </Text>
                </VStack>
              ) : report ? (
                <VStack align="stretch" spacing={6}>
                  <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={3}>
                    {metrics.map((metric) => (
                      <MetricCard key={metric.label} {...metric} />
                    ))}
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                    <SectionCard bare>
                      <VStack align="stretch" spacing={4}>
                        <SectionHeader
                          icon={CalendarClock}
                          title="Executive summary"
                          caption={`${formatDate(report.startDate)} - ${formatDate(report.endDate)}`}
                          accent="teal"
                        />
                        <VStack align="stretch" spacing={2}>
                          {report.insights.map((insight) => (
                            <HStack key={insight} spacing={2} align="flex-start">
                              <Badge
                                bg="var(--pb-tint-green)"
                                color="var(--pb-forest-2)"
                                border="1px solid"
                                borderColor="var(--pb-hair)"
                                borderRadius="full"
                                mt="2px"
                              >
                                i
                              </Badge>
                              <Text fontSize="sm" color="var(--pb-ink)">
                                {insight}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </VStack>
                    </SectionCard>

                    <SectionCard bare>
                      <VStack align="stretch" spacing={4}>
                        <SectionHeader
                          icon={Wallet}
                          title="Commitments"
                          caption="Installment and recurring impact"
                          accent="amber"
                        />
                        <SimpleGrid columns={2} spacing={3}>
                          <MetricCard
                            label="Installments"
                            value={formatCurrency(report.installmentExpenseTotal)}
                            detail="Expense total from installments"
                            icon={CalendarClock}
                            accent="commitment"
                          />
                          <MetricCard
                            label="Recurring"
                            value={formatCurrency(report.recurringExpenseTotal)}
                            detail="Expense total from fixed payments"
                            icon={Wallet}
                            accent="commitment"
                          />
                        </SimpleGrid>
                      </VStack>
                    </SectionCard>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                    <CategoryBars title="Expense categories" items={report.expenseCategories} tone="expense" />
                    <CategoryBars title="Income categories" items={report.incomeCategories} tone="income" />
                  </SimpleGrid>

                  {report.paymentMethods.length > 0 && (
                    <SectionCard bare>
                      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
                        <PaymentMethodBars items={report.paymentMethods} />
                      </SimpleGrid>
                    </SectionCard>
                  )}

                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                    <TransactionTable title="Largest expenses" transactions={report.topExpenses} tone="expense" />
                    <TransactionTable title="Largest income" transactions={report.topIncome} tone="income" />
                  </SimpleGrid>
                </VStack>
              ) : (
                <Text fontSize="sm" color="var(--pb-ink-soft)">
                  No report data available.
                </Text>
              )}
            </Box>
          </VStack>
        </SectionCard>
      </VStack>
    </Box>
  )
}
