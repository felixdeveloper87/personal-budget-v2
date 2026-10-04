import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, Spinner } from '@chakra-ui/react'
import { CalendarClock } from 'lucide-react'

import { listRecurringTransactions } from '../../api'
import type { RecurringTransaction } from '../../types'
import type { AppPage } from '../../components/layout/header/navigation.config'
import RecurringTransactionDrawer from '../../components/recurring/RecurringTransactionDrawer'
import MerchantLogo from '../../components/ui/MerchantLogo'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'

import '../dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import { NuSection } from '../dashboard/components/nu'
import { NuEmpty, NuListRow, NuPill, NuStatStrip } from '../commitments/components/nuCommitments'

interface FixedPaymentsPageProps {
  onPageChange?: (page: AppPage) => void
  /** When hosted inside the Commitments page's white sheet: drop the page chrome. */
  embedded?: boolean
  onDataChange?: () => void
}

export default function FixedPaymentsPage({
  embedded = false,
  onDataChange,
}: FixedPaymentsPageProps) {
  const { t, locale, formatCurrency } = useI18n()
  const [items, setItems] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<RecurringTransaction | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await listRecurringTransactions())
      onDataChange?.()
    } catch (err) {
      ToastService.apiError(err, {
        title: t('fixedPayments.toast.loadFailed'),
        dedupeKey: 'fixed-payments-page-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [onDataChange, t])

  useEffect(() => { void load() }, [load])

  useEffect(() => {
    setSelectedItem((current) => (current ? items.find((i) => i.id === current.id) ?? null : null))
  }, [items])

  const summary = useMemo(() => {
    const active: RecurringTransaction[] = []
    const cancelled: RecurringTransaction[] = []
    let income = 0
    let expenses = 0
    for (const item of items) {
      if (item.active) {
        active.push(item)
        if (item.type === 'INCOME') income += item.amount
        else expenses += item.amount
      } else {
        cancelled.push(item)
      }
    }
    // Calendar order — what leaves first sits on top, like a bill schedule.
    active.sort((a, b) => a.dayOfMonth - b.dayOfMonth || b.amount - a.amount)
    cancelled.sort((a, b) => a.description.localeCompare(b.description, locale))
    return { active, cancelled, income, expenses, net: income - expenses }
  }, [items, locale])

  const body = (
    <>
      {loading ? (
        <Flex justify="center" py={20}><Spinner color="var(--nu-brand, #820ad1)" /></Flex>
      ) : (
        <MotionBox variants={containerV} initial="hidden" animate="show">
          <MotionBox variants={riseV} px={{ base: 4, md: 6 }} pt={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
            <NuStatStrip
              stats={[
                { label: t('fixedPayments.hero.activeRules'), value: String(summary.active.length) },
                { label: t('fixedPayments.hero.fixedIncome'), value: formatCurrency(summary.income), tone: summary.income > 0 ? 'positive' : undefined },
                { label: t('fixedPayments.hero.monthlyNet'), value: formatCurrency(summary.net), tone: summary.net < 0 ? 'negative' : summary.net > 0 ? 'positive' : undefined },
              ]}
            />
          </MotionBox>

          {summary.active.length === 0 && summary.cancelled.length === 0 ? (
            <MotionBox variants={riseV} px={{ base: 4, md: 6 }} pb={{ base: 6, md: 7 }}>
              <NuEmpty
                icon={<CalendarClock size={20} strokeWidth={2.2} aria-hidden="true" />}
                title={t('fixedPayments.empty.title')}
                body={t('fixedPayments.empty.description')}
              />
            </MotionBox>
          ) : (
            <>
              {summary.active.length > 0 && (
                <MotionBox variants={riseV}>
                  <NuSection
                    title={t('fixedPayments.sections.active')}
                    subtitle={t('fixedPayments.sections.activeCaption')}
                    action={<NuPill>{formatCurrency(summary.expenses)}</NuPill>}
                  >
                    <FixedPaymentList items={summary.active} onOpen={setSelectedItem} />
                  </NuSection>
                </MotionBox>
              )}
              {summary.cancelled.length > 0 && (
                <MotionBox variants={riseV}>
                  <NuSection title={t('fixedPayments.sections.cancelled')} subtitle={t('fixedPayments.sections.cancelledCaption')}>
                    <FixedPaymentList items={summary.cancelled} onOpen={setSelectedItem} />
                  </NuSection>
                </MotionBox>
              )}
            </>
          )}
        </MotionBox>
      )}

      <RecurringTransactionDrawer
        recurringTransaction={selectedItem}
        onClose={() => setSelectedItem(null)}
        onChanged={load}
      />
    </>
  )

  if (embedded) return body

  return (
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 0, md: 4, lg: 6 }} py={{ base: 0, md: 5 }}>
      <Box className="nu-dashboard" bg="var(--nu-page)" borderRadius={{ base: 0, md: '24px' }} overflow="hidden">
        {body}
      </Box>
    </Box>
  )
}

function FixedPaymentList({ items, onOpen }: { items: RecurringTransaction[]; onOpen: (item: RecurringTransaction) => void }) {
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  return (
    <Box>
      {items.map((item) => {
        const isIncome = item.type === 'INCOME'
        const caption = item.active
          ? [t('fixedPayments.day', { day: item.dayOfMonth }), categoryLabel(item.category), item.paymentMethodName ?? item.accountName].filter(Boolean).join(' · ')
          : [t('fixedPayments.status.cancelled'), categoryLabel(item.category)].filter(Boolean).join(' · ')
        const next = item.active && item.nextRunDate
          ? formatDate(item.nextRunDate, { day: '2-digit', month: 'short' })
          : null
        return (
          <NuListRow
            key={item.id}
            onClick={() => onOpen(item)}
            ariaLabel={`${t('fixedPayments.openDetails')}: ${item.description}`}
            muted={!item.active}
            leading={<MerchantLogo name={item.description} category={item.category} size={42} borderRadius="50%" />}
            title={item.description}
            caption={caption}
            amount={`${isIncome ? '+' : '−'}${formatCurrency(item.amount)}`}
            amountColor={isIncome ? 'var(--nu-positive)' : 'var(--pb-ink)'}
            amountCaption={next ? `${t('fixedPayments.detail.nextPayment')} · ${next}` : t('fixedPayments.monthly')}
          />
        )
      })}
    </Box>
  )
}
