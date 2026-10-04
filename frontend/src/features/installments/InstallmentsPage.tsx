import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, HStack, Spinner, Text } from '@chakra-ui/react'
import { CalendarClock, CheckCircle2, CreditCard } from 'lucide-react'

import { listInstallmentPlans } from '../../api'
import type { InstallmentPlan } from '../../types'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { isInstallmentPlanCompleted } from '../../components/installments/InstallmentPlanCard'
import InstallmentPlanDrawer from '../../components/installments/InstallmentPlanDrawer'
import { getInstallmentPlanTitle } from '../../utils/installments'
import { ToastService } from '../../services/toast'

import '../dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import Segmented from '../dashboard/components/Segmented'
import { NuSection } from '../dashboard/components/nu'
import { CommitmentLogo, NuEmpty, NuListRow, NuPill, NuProgress, NuStatStrip } from '../commitments/components/nuCommitments'
import { useI18n } from '../../i18n'

type InstallmentView = 'plans' | 'statements'

interface InstallmentsPageProps {
  onPageChange?: (page: AppPage) => void
  /** When hosted inside the Commitments page's white sheet: drop the page chrome. */
  embedded?: boolean
  /** Notify the host so a shared summary can refresh after a reload/edit. */
  onDataChange?: () => void
}

/**
 * Total installment amount actually due in the current calendar month — sums the
 * active plans' transactions dated this month. Matches the current month's
 * statement, so the "Monthly load" / "Committed monthly" figures stay in sync
 * with the Monthly statements view (an active plan whose next payment is a later
 * month contributes nothing here, even though it counts as an active plan).
 */
export function currentMonthInstallmentTotal(plans: InstallmentPlan[]): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  let total = 0
  for (const plan of plans) {
    if (isInstallmentPlanCompleted(plan)) continue
    for (const tx of plan.transactions) {
      const due = new Date(`${tx.date}T00:00:00`)
      if (due.getFullYear() === year && due.getMonth() === month) total += tx.amount
    }
  }
  return total
}

export default function InstallmentsPage({ embedded = false, onDataChange }: InstallmentsPageProps) {
  const { t, formatCurrency } = useI18n()
  const installmentViews: Array<{ value: InstallmentView; label: string }> = [
    { value: 'plans', label: t('installments.views.plans') },
    { value: 'statements', label: t('installments.views.statements') },
  ]
  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan | null>(null)
  const [view, setView] = useState<InstallmentView>('plans')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setPlans(await listInstallmentPlans())
      onDataChange?.()
    } catch (err) {
      ToastService.apiError(err, { title: t('installments.toast.loadFailed'), dedupeKey: 'installments-page-load-failed' })
    } finally {
      setLoading(false)
    }
  }, [onDataChange, t])

  useEffect(() => { void load() }, [load])

  // Keep the open drawer pointed at the freshest plan data after an edit reloads.
  useEffect(() => {
    setSelectedPlan((current) => (current ? plans.find((plan) => plan.id === current.id) ?? null : null))
  }, [plans])

  const summary = useMemo(() => {
    const active = plans.filter((plan) => !isInstallmentPlanCompleted(plan))
    const completed = plans.filter(isInstallmentPlanCompleted)
    const now = Date.now()
    const remaining = active.reduce((sum, plan) => sum + plan.transactions.filter((item) => new Date(item.date).getTime() >= now).reduce((total, item) => total + item.amount, 0), 0)
    const paid = plans.reduce((sum, plan) => sum + plan.transactions.filter((item) => new Date(item.date).getTime() < now).reduce((total, item) => total + item.amount, 0), 0)
    const monthly = currentMonthInstallmentTotal(plans)
    return { active, completed, remaining, paid, monthly }
  }, [plans])

  const statements = useMemo<StatementMonth[]>(
    () => buildStatements(summary.active, t('installments.planFallback')),
    [summary.active, t],
  )

  const body = (
    <>
      {loading ? (
        <Flex justify="center" py={20}><Spinner color="var(--nu-brand, #820ad1)" /></Flex>
      ) : (
        <MotionBox variants={containerV} initial="hidden" animate="show">
          <MotionBox variants={riseV} px={{ base: 4, md: 6 }} pt={{ base: 5, md: 6 }} pb={{ base: 5, md: 6 }}>
            <NuStatStrip
              stats={[
                { label: t('installments.hero.activePlans'), value: String(summary.active.length) },
                { label: t('installments.hero.stillToPay'), value: formatCurrency(summary.remaining) },
                { label: t('installments.hero.alreadyPaid'), value: formatCurrency(summary.paid) },
              ]}
            />
            <Box mt={4}>
              <Segmented options={installmentViews} value={view} onChange={setView} mobileFullWidth aria-label={t('installments.viewLabel')} />
            </Box>
          </MotionBox>

          {view === 'plans' ? (
            summary.active.length || summary.completed.length ? (
              <>
                {summary.active.length > 0 && (
                  <MotionBox variants={riseV}>
                    <NuSection
                      title={t('installments.plans.title')}
                      subtitle={t('installments.sections.activeCaption')}
                      action={<NuPill>{formatCurrency(summary.monthly)}</NuPill>}
                    >
                      <PlanList plans={summary.active} onOpen={setSelectedPlan} />
                    </NuSection>
                  </MotionBox>
                )}
                {summary.completed.length > 0 && (
                  <MotionBox variants={riseV}>
                    <NuSection title={t('installments.sections.completed')} subtitle={t('installments.sections.completedCaption')}>
                      <PlanList plans={summary.completed} onOpen={setSelectedPlan} />
                    </NuSection>
                  </MotionBox>
                )}
              </>
            ) : (
              <MotionBox variants={riseV} px={{ base: 4, md: 6 }} pb={{ base: 6, md: 7 }}>
                <NuEmpty
                  icon={<CreditCard size={20} strokeWidth={2.2} aria-hidden="true" />}
                  title={t('installments.empty.plansTitle')}
                  body={t('installments.empty.plansBody')}
                />
              </MotionBox>
            )
          ) : statements.length > 0 ? (
            <MotionBox variants={riseV}>
              <InstallmentStatements months={statements} />
            </MotionBox>
          ) : (
            <MotionBox variants={riseV} px={{ base: 4, md: 6 }} pb={{ base: 6, md: 7 }}>
              <NuEmpty
                icon={<CalendarClock size={20} strokeWidth={2.2} aria-hidden="true" />}
                title={t('installments.empty.statementsTitle')}
                body={t('installments.empty.statementsBody')}
              />
            </MotionBox>
          )}
        </MotionBox>
      )}

      <InstallmentPlanDrawer plan={selectedPlan} onClose={() => setSelectedPlan(null)} onChanged={load} />
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

function planTitleOf(plan: InstallmentPlan, fallback: string): string {
  const first = plan.transactions[0]
  return first?.description ? getInstallmentPlanTitle(first.description) : fallback
}

/** Flat list of plans: logo · title · paid/total + card · instalment value, with a progress bar. */
function PlanList({ plans, onOpen }: { plans: InstallmentPlan[]; onOpen: (plan: InstallmentPlan) => void }) {
  const { t, formatCurrency, formatDate } = useI18n()
  const now = Date.now()

  return (
    <Box>
      {plans.map((plan) => {
        const title = planTitleOf(plan, t('installments.planFallback'))
        const sorted = [...plan.transactions].sort((a, b) => a.date.localeCompare(b.date))
        const paid = sorted.filter((tx) => new Date(`${tx.date}T00:00:00`).getTime() < now).length
        const progress = plan.totalInstallments > 0 ? Math.min(100, (paid / plan.totalInstallments) * 100) : 0
        const completed = isInstallmentPlanCompleted(plan)
        const next = sorted.find((tx) => new Date(`${tx.date}T00:00:00`).getTime() >= now)
        const caption = [
          t('installments.paidProgress', { paid, total: plan.totalInstallments }),
          plan.paymentMethodName ?? plan.accountName ?? t('installments.noCard'),
        ].join(' · ')

        return (
          <NuListRow
            key={plan.id}
            onClick={() => onOpen(plan)}
            ariaLabel={`${t('installments.openDetails')}: ${title}`}
            muted={completed}
            leading={completed ? (
              <Flex w="42px" h="42px" align="center" justify="center" borderRadius="full" bg="var(--nu-positive-tint)" color="var(--nu-positive)">
                <CheckCircle2 size={20} strokeWidth={2.2} aria-hidden="true" />
              </Flex>
            ) : (
              <CommitmentLogo name={title} category={plan.transactions[0]?.category} />
            )}
            title={title}
            caption={caption}
            footer={completed ? undefined : <NuProgress value={progress} label={t('installments.paidProgress', { paid, total: plan.totalInstallments })} />}
            amount={formatCurrency(plan.installmentValue)}
            amountCaption={next
              ? t('installments.nextDue', { date: formatDate(next.date, { day: '2-digit', month: 'short' }) })
              : completed ? t('installments.status.completed') : t('installments.perMonth')}
          />
        )
      })}
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Monthly statements                                                          */
/* -------------------------------------------------------------------------- */

interface StatementItem {
  id: number
  description: string
  amount: number
  date: string
  label: string
}

interface StatementMonth {
  key: string
  date: Date
  total: number
  items: StatementItem[]
}

/** Group active-plan installments by the calendar month they fall due, from the
 *  current month onward. Each month becomes a "statement" of what is owed. */
function buildStatements(plans: InstallmentPlan[], fallbackPlanLabel: string): StatementMonth[] {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const map = new Map<string, StatementMonth>()

  for (const plan of plans) {
    const planLabel = plan.paymentMethodName ?? plan.accountName ?? fallbackPlanLabel
    for (const tx of plan.transactions) {
      const due = new Date(`${tx.date}T00:00:00`)
      const monthStart = new Date(due.getFullYear(), due.getMonth(), 1)
      if (monthStart < startOfMonth) continue
      const key = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}`
      const bucket = map.get(key) ?? { key, date: monthStart, total: 0, items: [] }
      bucket.total += tx.amount
      bucket.items.push({
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        date: tx.date,
        label: `${planLabel} · ${tx.installmentNumber}/${plan.totalInstallments}`,
      })
      map.set(key, bucket)
    }
  }

  const months = [...map.values()].sort((a, b) => a.date.getTime() - b.date.getTime())
  for (const m of months) m.items.sort((a, b) => a.date.localeCompare(b.date))
  return months
}

/** Month chips (Nubank fatura tabs) over the selected month's instalment list. */
function InstallmentStatements({ months }: { months: StatementMonth[] }) {
  const { t, locale, formatCurrency, formatDate } = useI18n()
  const [selectedKey, setSelectedKey] = useState<string>(() => months[0]?.key ?? '')

  // Keep the selection valid as data loads/changes; fall back to the first month.
  useEffect(() => {
    if (months.length > 0 && !months.some((m) => m.key === selectedKey)) {
      setSelectedKey(months[0].key)
    }
  }, [months, selectedKey])

  const selected = months.find((m) => m.key === selectedKey) ?? months[0]
  if (!selected) return null

  const monthTitle = formatDate(selected.date, { month: 'long', year: 'numeric' })

  return (
    <NuSection title={t('installments.statements.title')} subtitle={t('installments.statements.subtitle')}>
      <HStack
        as="nav"
        aria-label={t('installments.statements.monthsAria')}
        spacing={2}
        overflowX="auto"
        mx={{ base: -4, md: 0 }}
        px={{ base: 4, md: 0 }}
        pb={1}
        sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
      >
        {months.map((month) => {
          const isActive = month.key === selected.key
          return (
            <Box
              as="button"
              type="button"
              key={month.key}
              onClick={() => setSelectedKey(month.key)}
              aria-pressed={isActive}
              flexShrink={0}
              px={4}
              py={2}
              borderRadius="full"
              bg={isActive ? 'var(--nu-brand)' : 'var(--nu-surface)'}
              color={isActive ? 'white' : 'var(--pb-ink)'}
              fontSize="sm"
              fontWeight={isActive ? 700 : 500}
              textTransform="capitalize"
              transition="background-color .15s ease, color .15s ease"
              _hover={{ bg: isActive ? 'var(--nu-brand-deep)' : 'var(--nu-surface-hover)' }}
              _focusVisible={{ outline: '2px solid var(--nu-brand)', outlineOffset: '2px' }}
            >
              {formatDate(month.date, { month: 'short', year: '2-digit' })}
            </Box>
          )
        })}
      </HStack>

      <Flex mt={5} justify="space-between" align="flex-end" gap={3}>
        <Box minW={0}>
          <Text fontSize="sm" color="var(--pb-ink-soft)">
            {monthTitle.charAt(0).toLocaleUpperCase(locale) + monthTitle.slice(1)}
          </Text>
          <Text fontSize={{ base: '1.6rem', md: '1.9rem' }} fontWeight={700} letterSpacing="-0.02em" lineHeight={1.15} color="var(--pb-ink)" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(selected.total)}
          </Text>
        </Box>
        <Text fontSize="sm" color="var(--pb-ink-soft)" flexShrink={0}>
          {t(selected.items.length === 1 ? 'installments.paymentCount.one' : 'installments.paymentCount.other', { count: selected.items.length })}
        </Text>
      </Flex>

      <Box mt={3}>
        {selected.items.map((item) => {
          const due = new Date(`${item.date}T00:00:00`)
          return (
            <Flex key={item.id} align="center" gap={3} minH="64px" py={3} borderBottom="1px solid var(--pb-hair)" _last={{ borderBottom: 0 }}>
              <Flex direction="column" align="center" justify="center" w="42px" h="42px" flexShrink={0} borderRadius="full" bg="var(--nu-surface)">
                <Text fontSize="15px" fontWeight={700} lineHeight={1} color="var(--pb-ink)">{due.getDate()}</Text>
                <Text fontSize="9px" fontWeight={600} lineHeight={1.2} textTransform="uppercase" color="var(--pb-ink-faint)">
                  {formatDate(due, { month: 'short' }).replace('.', '')}
                </Text>
              </Flex>
              <Box minW={0} flex={1}>
                <Text fontSize="15px" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{getInstallmentPlanTitle(item.description)}</Text>
                <Text mt="2px" fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>{item.label}</Text>
              </Box>
              <Text fontSize="15px" fontWeight={650} color="var(--pb-ink)" flexShrink={0} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(item.amount)}
              </Text>
            </Flex>
          )
        })}
      </Box>
    </NuSection>
  )
}
