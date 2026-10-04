import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, Grid, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { FileText, Lightbulb } from 'lucide-react'

import { usePeriodNavigator } from '../../hooks/usePeriodNavigator'
import { getReport } from '../../api'
import type {
  ReportCategoryBreakdown,
  ReportPaymentMethodBreakdown,
  ReportResponse,
  ReportTransactionItem,
} from '../../types'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import { useReportFormat } from '../../components/reports/useReportFormat'
import '../dashboard/theme/pb-tokens.css'

import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import PeriodNavBar from '../dashboard/components/PeriodNavBar'
import { NuSection } from '../dashboard/components/nu'
import NuHero from '../dashboard/components/NuHero'
import { CommitmentLogo, NuEmpty, NuPill, NuStatStrip } from '../commitments/components/nuCommitments'

function fileDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function ReportsPage() {
  const { t, formatNumber } = useI18n()
  const reduce = useReducedMotion() ?? false
  const { currency, date, insights, periodLabel: localizedPeriodLabel } = useReportFormat()
  const {
    selectedDate,
    selectedPeriod,
    onPeriodChange,
    navigatePeriod,
    goToToday,
    formatLabel,
    isCurrentPeriod,
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

  const reportInsights = useMemo(() => (report ? insights(report) : []), [insights, report])
  const navLabel = formatLabel()
  const balance = report?.balance ?? 0

  return (
    <Box minH="100vh">
      {/* Purple page header — same pattern as Payments and Earnings. */}
      <NuHero
        title={t('nav.reports.label')}
        action={(
          <Flex
            as="button"
            type="button"
            onClick={handleExport}
            align="center"
            gap={2}
            h="36px"
            px={4}
            flexShrink={0}
            borderRadius="full"
            bg="white"
            color="var(--nu-brand, #820ad1)"
            fontSize="sm"
            fontWeight={700}
            transition="transform .15s ease, box-shadow .15s ease"
            _hover={{ transform: 'translateY(-1px)', boxShadow: '0 6px 16px -8px rgba(0,0,0,.35)' }}
            _focusVisible={{ outline: '2px solid white', outlineOffset: '3px' }}
          >
            <FileText size={16} strokeWidth={2.4} aria-hidden="true" />
            {t('reports.exportPdf')}
          </Flex>
        )}
      >
        <Flex mt={{ base: 3, md: 4 }} direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'flex-end' }} justify="space-between" gap={{ base: 4, md: 8 }}>
          <Box minW={0}>
            <Text fontSize="sm" color="rgba(255,255,255,0.82)">
              {t('reports.balance')} · {report ? localizedPeriodLabel(report) : navLabel}
            </Text>
            {loading && !report ? (
              <Skeleton mt={1} height="44px" maxW="240px" borderRadius="10px" startColor="rgba(255,255,255,0.18)" endColor="rgba(255,255,255,0.3)" />
            ) : (
              <>
                <Text
                  fontSize={{ base: '2rem', md: '2.5rem' }} fontWeight={700} letterSpacing="-0.02em" lineHeight={1.1}
                  color={balance < 0 ? '#ffc2b8' : 'white'} noOfLines={1} sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {report ? currency(report.balance) : '—'}
                </Text>
                {report && (
                  <Text mt={1} fontSize="sm" color="rgba(255,255,255,0.82)" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {t('reports.income')} <Text as="span" color="#9ff0c8" fontWeight={600}>{currency(report.totalIncome)}</Text>
                    {' · '}
                    {t('reports.expenses')} <Text as="span" color="#ffc2b8" fontWeight={600}>{currency(report.totalExpense)}</Text>
                  </Text>
                )}
              </>
            )}
          </Box>
          <Box flexShrink={0} minW={{ md: '420px' }}>
            <PeriodNavBar
              embedded
              allowedPeriods={['week', 'month', 'year']}
              selectedPeriod={selectedPeriod}
              label={navLabel}
              isCurrent={isCurrentPeriod}
              onPeriodChange={onPeriodChange}
              onNavigate={navigatePeriod}
              onGoToToday={goToToday}
            />
          </Box>
        </Flex>
      </NuHero>

      {/* White sheet with rounded top tucked over the purple header. */}
      <Box maxW="appContent" mx="auto" px={{ base: 0, md: 4, lg: 6 }} mt="-24px" pb={{ base: 0, md: 7 }} position="relative">
        <MotionBox
          className="nu-dashboard"
          variants={containerV}
          initial={reduce ? false : 'hidden'}
          animate="show"
          bg="var(--nu-page)"
          borderTopRadius="24px"
          borderBottomRadius={{ base: 0, md: '24px' }}
          overflow="hidden"
          boxShadow={{ base: 'none', md: '0 1px 2px rgba(31,31,36,0.04), 0 18px 48px -24px rgba(31,31,36,0.18)' }}
        >
          {loading && !report ? (
            <Box px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
              <VStack align="stretch" spacing={4}>
                <Skeleton height="84px" borderRadius="16px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
                <Skeleton height="220px" borderRadius="16px" startColor="var(--pb-surface-2)" endColor="var(--pb-surface-3)" />
              </VStack>
            </Box>
          ) : !report ? (
            <Box px={{ base: 4, md: 6 }} py={{ base: 6, md: 7 }}>
              <NuEmpty icon={<FileText size={20} strokeWidth={2.2} aria-hidden="true" />} title={t('reports.noData')} body={t('reports.retryHint')} />
            </Box>
          ) : (
            <Box opacity={loading ? 0.55 : 1} transition="opacity .15s ease">
              <MotionBox variants={riseV} px={{ base: 4, md: 6 }} pt={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
                <NuStatStrip
                  stats={[
                    {
                      label: t('reports.income'),
                      value: currency(report.totalIncome),
                      tone: report.totalIncome > 0 ? 'positive' : undefined,
                    },
                    { label: t('reports.expenses'), value: currency(report.totalExpense) },
                    { label: t('reports.averageExpense'), value: currency(report.averageExpense) },
                  ]}
                />
                <Text mt={2} fontSize="xs" color="var(--pb-ink-soft)">
                  {t(`reports.incomingRecords_${report.incomeCount === 1 ? 'one' : 'other'}`, { count: formatNumber(report.incomeCount) })}
                  {' · '}
                  {t(`reports.outgoingRecords_${report.expenseCount === 1 ? 'one' : 'other'}`, { count: formatNumber(report.expenseCount) })}
                  {' · '}
                  {date(report.startDate)} — {date(report.endDate)}
                </Text>
              </MotionBox>

              <MotionBox variants={riseV}>
                <NuSection title={t('reports.executiveSummary')} subtitle={`${date(report.startDate)} — ${date(report.endDate)}`}>
                  {reportInsights.length === 0 ? (
                    <Text fontSize="sm" color="var(--pb-ink-soft)">{t('reports.noInsights')}</Text>
                  ) : (
                    <Box>
                      {reportInsights.map((insight) => (
                        <Flex key={insight} align="flex-start" gap={3} py={3} borderBottom="1px solid var(--pb-hair)" _last={{ borderBottom: 0 }}>
                          <Flex w="32px" h="32px" flexShrink={0} align="center" justify="center" borderRadius="full" bg="var(--nu-brand-tint)" color="var(--nu-brand)">
                            <Lightbulb size={16} strokeWidth={2.2} aria-hidden="true" />
                          </Flex>
                          <Text pt="5px" fontSize="sm" color="var(--pb-ink)" lineHeight={1.5}>{insight}</Text>
                        </Flex>
                      ))}
                    </Box>
                  )}
                </NuSection>
              </MotionBox>

              <MotionBox variants={riseV}>
                <NuSection
                  title={t('reports.commitments')}
                  subtitle={t('reports.commitmentsCaption')}
                  action={<NuPill>{currency(report.installmentExpenseTotal + report.recurringExpenseTotal)}</NuPill>}
                >
                  <NuStatStrip
                    stats={[
                      { label: t('reports.installments'), value: currency(report.installmentExpenseTotal) },
                      { label: t('reports.recurring'), value: currency(report.recurringExpenseTotal) },
                    ]}
                  />
                </NuSection>
              </MotionBox>

              <MotionBox variants={riseV}>
                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }}>
                  <NuSection title={t('reports.expenseCategories')}>
                    <CategoryBars items={report.expenseCategories} tone="expense" />
                  </NuSection>
                  <NuSection title={t('reports.incomeCategories')} borderLeft={{ lg: '1px solid var(--pb-hair)' }}>
                    <CategoryBars items={report.incomeCategories} tone="income" />
                  </NuSection>
                </Grid>
              </MotionBox>

              {report.paymentMethods.length > 0 && (
                <MotionBox variants={riseV}>
                  <NuSection title={t('reports.paymentMethods')} subtitle={t('reports.paymentBreakdown')}>
                    <PaymentMethodBars items={report.paymentMethods} />
                  </NuSection>
                </MotionBox>
              )}

              <MotionBox variants={riseV}>
                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }}>
                  <NuSection title={t('reports.largestExpenses')}>
                    <TransactionList transactions={report.topExpenses} tone="expense" />
                  </NuSection>
                  <NuSection title={t('reports.largestIncome')} borderLeft={{ lg: '1px solid var(--pb-hair)' }}>
                    <TransactionList transactions={report.topIncome} tone="income" />
                  </NuSection>
                </Grid>
              </MotionBox>
            </Box>
          )}
        </MotionBox>
      </Box>
    </Box>
  )
}

/** Name · amount · share pill over a thin bar — one row per category. */
function ShareRow({ name, amount, percentage, caption, color }: { name: string; amount: string; percentage: number; caption?: string; color: string }) {
  const { formatNumber } = useI18n()
  return (
    <Box py={3} borderBottom="1px solid var(--pb-hair)" _last={{ borderBottom: 0 }}>
      <Flex justify="space-between" align="center" gap={3}>
        <Box minW={0}>
          <Text fontSize="15px" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{name}</Text>
          {caption && <Text mt="1px" fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>{caption}</Text>}
        </Box>
        <Flex align="center" gap={2} flexShrink={0}>
          <Text px={2} py="1px" borderRadius="full" bg="var(--nu-brand-tint)" color="var(--nu-brand)" fontSize="11px" fontWeight={700} lineHeight="16px" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatNumber(percentage)}%
          </Text>
          <Text fontSize="15px" fontWeight={700} color="var(--pb-ink)" sx={{ fontVariantNumeric: 'tabular-nums' }}>{amount}</Text>
        </Flex>
      </Flex>
      <Box mt={2} h="4px" borderRadius="full" bg="var(--nu-track)" overflow="hidden">
        <Box h="full" w={`${Math.min(percentage, 100)}%`} borderRadius="full" bg={color} />
      </Box>
    </Box>
  )
}

function CategoryBars({ items, tone }: { items: ReportCategoryBreakdown[]; tone: 'income' | 'expense' }) {
  const { t } = useI18n()
  const { categoryLabel, currency } = useReportFormat()
  if (items.length === 0) {
    return <Text fontSize="sm" color="var(--pb-ink-soft)">{t('reports.noPeriodData')}</Text>
  }
  return (
    <Box>
      {items.slice(0, 6).map((item) => (
        <ShareRow
          key={item.category}
          name={categoryLabel(item.category)}
          amount={currency(item.amount)}
          percentage={item.percentage}
          color={tone === 'income' ? 'var(--nu-positive)' : 'var(--nu-brand)'}
        />
      ))}
    </Box>
  )
}

function PaymentMethodBars({ items }: { items: ReportPaymentMethodBreakdown[] }) {
  const { currency, count } = useReportFormat()
  return (
    <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }} columnGap={10}>
      {items.slice(0, 6).map((item) => (
        <ShareRow
          key={item.name}
          name={item.name}
          caption={count(item.transactionCount, 'transaction')}
          amount={currency(item.amount)}
          percentage={item.percentage}
          color="var(--nu-brand)"
        />
      ))}
    </Grid>
  )
}

function TransactionList({ transactions, tone }: { transactions: ReportTransactionItem[]; tone: 'income' | 'expense' }) {
  const { t } = useI18n()
  const { accountMovement, categoryLabel, currency, date } = useReportFormat()
  if (transactions.length === 0) {
    return <Text fontSize="sm" color="var(--pb-ink-soft)">{t('reports.noTransactions')}</Text>
  }
  return (
    <Box>
      {transactions.slice(0, 5).map((tx) => {
        const title = tx.description || categoryLabel(tx.category)
        const movement = accountMovement(tx)
        return (
          <Flex key={tx.id} align="center" gap={3} minH="68px" py={3} borderBottom="1px solid var(--pb-hair)" _last={{ borderBottom: 0 }}>
            <CommitmentLogo name={title} category={tx.category} />
            <Box minW={0} flex={1}>
              <Text fontSize="15px" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{title}</Text>
              <Text mt="2px" fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
                {date(tx.paymentDate)} · {categoryLabel(tx.category)}
              </Text>
              {movement && <Text mt="1px" fontSize="xs" color="var(--pb-ink-faint)" noOfLines={1}>{movement}</Text>}
            </Box>
            <Text
              fontSize="15px" fontWeight={700} flexShrink={0}
              color={tone === 'income' ? 'var(--nu-positive)' : 'var(--pb-ink)'}
              sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {tone === 'income' ? '+' : '−'}{currency(tx.amount)}
            </Text>
          </Flex>
        )
      })}
    </Box>
  )
}
