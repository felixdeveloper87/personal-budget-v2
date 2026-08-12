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
import { useI18n } from '../../i18n'
import { useReportFormat } from '../../components/reports/useReportFormat'

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
  const { t } = useI18n()
  const { categoryLabel, currency } = useReportFormat()
  const fillColor = REPORT_TONES[tone].strong

  return (
    <VStack align="stretch" spacing={3}>
      <Text fontSize="sm" fontWeight={800} color="var(--pb-ink)">
        {title}
      </Text>
      {items.length === 0 ? (
        <Text fontSize="sm" color="var(--pb-ink-soft)">
          {t('reports.noPeriodData')}
        </Text>
      ) : (
        items.slice(0, 6).map((item) => (
          <Box key={item.category}>
            <HStack justify="space-between" spacing={3} mb={1}>
              <Text fontSize="sm" color="var(--pb-ink)" fontWeight={600} noOfLines={1}>
                {categoryLabel(item.category)}
              </Text>
              <Text fontSize="xs" color="var(--pb-ink-soft)" flexShrink={0}>
                {currency(item.amount)} — {item.percentage}%
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
  const { t } = useI18n()
  const { currency, count } = useReportFormat()
  if (items.length === 0) return null

  return (
    <VStack align="stretch" spacing={3}>
      <Text fontSize="sm" fontWeight={800} color="var(--pb-ink)">
        {t('reports.paymentMethods')}
      </Text>
      {items.slice(0, 6).map((item) => (
        <Box key={item.name}>
          <HStack justify="space-between" spacing={3} mb={1}>
            <Text fontSize="sm" color="var(--pb-ink)" fontWeight={600} noOfLines={1}>
              {item.name}
            </Text>
            <HStack spacing={2} flexShrink={0}>
              <Text fontSize="xs" color="var(--pb-ink)" fontWeight={700}>
                {currency(item.amount)}
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
            {count(item.transactionCount, 'transaction')}
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
  const { t } = useI18n()
  const { accountMovement, categoryLabel, currency, date } = useReportFormat()
  const amountColor = REPORT_TONES[tone].color

  return (
    <VStack align="stretch" spacing={3}>
      <Text fontSize="sm" fontWeight={800} color="var(--pb-ink)">
        {title}
      </Text>
      {transactions.length === 0 ? (
        <Text fontSize="sm" color="var(--pb-ink-soft)">
          {t('reports.noTransactions')}
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
                  {tx.description || categoryLabel(tx.category)}
                </Text>
                <Text fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
                  {date(tx.paymentDate)} — {categoryLabel(tx.category)}
                </Text>
                {accountMovement(tx) ? (
                  <Text fontSize="xs" color="var(--pb-forest-2)" noOfLines={1}>
                    {accountMovement(tx)}
                  </Text>
                ) : null}
              </VStack>
              <Text fontSize="sm" fontWeight={800} color={amountColor} flexShrink={0}>
                {currency(tx.amount)}
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
  const { t } = useI18n()
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
            {t('reports.today')}
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
            {t('reports.exportPdf')}
          </Button>
        </HStack>
      </Flex>
  )
}

export default function ReportsPage() {
  const { t, formatNumber } = useI18n()
  const { currency, date, insights, periodLabel: localizedPeriodLabel } = useReportFormat()
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
            title: t('reports.loadError'),
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
  }, [selectedPeriod, selectedDate, t])

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
        label: t('reports.income'),
        value: currency(report.totalIncome),
        detail: t(`reports.incomingRecords_${report.incomeCount === 1 ? 'one' : 'other'}`, {
          count: formatNumber(report.incomeCount),
        }),
        icon: TrendingUp,
        accent: 'income' as const,
      },
      {
        label: t('reports.expenses'),
        value: currency(report.totalExpense),
        detail: t(`reports.outgoingRecords_${report.expenseCount === 1 ? 'one' : 'other'}`, {
          count: formatNumber(report.expenseCount),
        }),
        icon: TrendingDown,
        accent: 'expense' as const,
      },
      {
        label: t('reports.balance'),
        value: currency(report.balance),
        detail: t('reports.incomeMinusExpenses'),
        icon: DollarSign,
        accent: balanceTone,
      },
      {
        label: t('reports.averageExpense'),
        value: currency(report.averageExpense),
        detail: t(`reports.totalTransactions_${report.transactionCount === 1 ? 'one' : 'other'}`, {
          count: formatNumber(report.transactionCount),
        }),
        icon: Wallet,
        accent: 'brand' as const,
      },
    ]
  }, [currency, formatNumber, report, t])

  const periodLabel = report ? localizedPeriodLabel(report) : formatLabel()

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
                    {t('reports.preparing')}
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
                          title={t('reports.executiveSummary')}
                          caption={`${date(report.startDate)} — ${date(report.endDate)}`}
                          accent="teal"
                        />
                        <VStack align="stretch" spacing={2}>
                          {insights(report).map((insight) => (
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
                          title={t('reports.commitments')}
                          caption={t('reports.commitmentsCaption')}
                          accent="amber"
                        />
                        <SimpleGrid columns={2} spacing={3}>
                          <MetricCard
                            label={t('reports.installments')}
                            value={currency(report.installmentExpenseTotal)}
                            detail={t('reports.installmentExpense')}
                            icon={CalendarClock}
                            accent="commitment"
                          />
                          <MetricCard
                            label={t('reports.recurring')}
                            value={currency(report.recurringExpenseTotal)}
                            detail={t('reports.fixedExpense')}
                            icon={Wallet}
                            accent="commitment"
                          />
                        </SimpleGrid>
                      </VStack>
                    </SectionCard>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                    <CategoryBars title={t('reports.expenseCategories')} items={report.expenseCategories} tone="expense" />
                    <CategoryBars title={t('reports.incomeCategories')} items={report.incomeCategories} tone="income" />
                  </SimpleGrid>

                  {report.paymentMethods.length > 0 && (
                    <SectionCard bare>
                      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
                        <PaymentMethodBars items={report.paymentMethods} />
                      </SimpleGrid>
                    </SectionCard>
                  )}

                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                    <TransactionTable title={t('reports.largestExpenses')} transactions={report.topExpenses} tone="expense" />
                    <TransactionTable title={t('reports.largestIncome')} transactions={report.topIncome} tone="income" />
                  </SimpleGrid>
                </VStack>
              ) : (
                <Text fontSize="sm" color="var(--pb-ink-soft)">
                  {t('reports.noData')}
                </Text>
              )}
            </Box>
          </VStack>
        </SectionCard>
      </VStack>
    </Box>
  )
}
