import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, HStack, Icon, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'

import { listInstallmentPlans } from '../../api'
import type { InstallmentPlan } from '../../types'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { isInstallmentPlanCompleted } from '../../components/installments/InstallmentPlanCard'
import InstallmentPlanDrawer from '../../components/installments/InstallmentPlanDrawer'
import { getInstallmentPlanTitle } from '../../utils/installments'
import { CalendarClock, CheckCircle2, ChevronRight, CreditCard, Plus } from '../../components/ui/icons'
import { ToastService } from '../../services/toast'

import '../dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../dashboard/components/motion'
import Segmented from '../dashboard/components/Segmented'
import { useI18n } from '../../i18n'

type InstallmentView = 'plans' | 'statements'

interface InstallmentsPageProps {
  onPageChange?: (page: AppPage) => void
  /** When hosted inside the Commitments page: drop the page chrome. */
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

export default function InstallmentsPage({ onPageChange, embedded = false, onDataChange }: InstallmentsPageProps) {
  const { t } = useI18n()
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
      <MotionBox variants={containerV} initial="hidden" animate="show">
        <VStack align="stretch" spacing={{ base: 3, md: 3.5 }}>

          {loading ? <Flex justify="center" py={20}><Spinner color="var(--pb-forest-2)" /></Flex> : <>
            <MotionBox variants={riseV}><InstallmentsHero summary={summary} /></MotionBox>

            <MotionBox variants={riseV}>
              <Flex justify="center">
                <Segmented options={installmentViews} value={view} onChange={setView} aria-label={t('installments.viewLabel')} />
              </Flex>
            </MotionBox>

            {view === 'plans' ? (
              <MotionBox variants={riseV}>
                {summary.active.length || summary.completed.length ? (
                  <InstallmentPlansBoard active={summary.active} completed={summary.completed} onOpenPlan={setSelectedPlan} />
                ) : (
                  <EmptyState title={t('installments.empty.plansTitle')} body={t('installments.empty.plansBody')} />
                )}
              </MotionBox>
            ) : (
              <MotionBox variants={riseV}>
                {statements.length > 0 ? (
                  <InstallmentStatements months={statements} />
                ) : (
                  <EmptyState title={t('installments.empty.statementsTitle')} body={t('installments.empty.statementsBody')} />
                )}
              </MotionBox>
            )}
          </>}

        </VStack>
      </MotionBox>

      <InstallmentPlanDrawer plan={selectedPlan} onClose={() => setSelectedPlan(null)} onChanged={load} />
    </>
  )

  if (embedded) return body

  return (
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 3, md: 5 }}>
      {body}
    </Box>
  )
}

function InstallmentsHero({ summary }: { summary: { active: InstallmentPlan[]; remaining: number; paid: number; monthly: number } }) {
  const { t, formatCurrency } = useI18n()
  return <Box overflow="hidden" position="relative" borderRadius="14px" bg="var(--pb-hero)" color="var(--pb-hero-ink)" boxShadow="var(--pb-shadow-lift)" border="1px solid var(--pb-hero-line)" px="clamp(1rem, 2.4vw, 1.4rem)" py="clamp(0.65rem, 1.5vw, 0.95rem)"><Box position="absolute" w="180px" h="180px" border="1px solid var(--pb-hero-line)" borderRadius="full" right="-55px" top="-105px" /><Flex position="relative" zIndex={1} direction={{ base: 'column', lg: 'row' }} justify="space-between" gap={3} align={{ lg: 'center' }}><HStack spacing={3} align="baseline"><Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.16em" textTransform="uppercase" opacity={0.76} whiteSpace="nowrap">{t('installments.hero.monthlyLoad')}</Text><Text className="num" fontSize={{ base: '1.5rem', md: '1.85rem' }} fontWeight={500} lineHeight="1" letterSpacing="-0.035em" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(summary.monthly)}</Text></HStack><SimpleGrid columns={{ base: 2, lg: 3 }} spacing={{ base: 2, md: 3.5 }} minW={{ lg: '300px' }}><HeroMetric label={t('installments.hero.activePlans')} value={String(summary.active.length)} /><HeroMetric label={t('installments.hero.stillToPay')} value={formatCurrency(summary.remaining)} /><HeroMetric label={t('installments.hero.alreadyPaid')} value={formatCurrency(summary.paid)} /></SimpleGrid></Flex></Box>
}

function HeroMetric({ label, value }: { label: string; value: string }) { return <Box><Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.14em" textTransform="uppercase" opacity={0.68}>{label}</Text><Text className="num" fontSize={{ base: 'md', md: 'lg' }} fontWeight={500} mt="1px" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Text></Box> }

function planTitleOf(plan: InstallmentPlan, fallback: string): string {
  const first = plan.transactions[0]
  return first?.description ? getInstallmentPlanTitle(first.description) : fallback
}

/** Master-detail board for installment plans — a sidebar menu of plans on the
 *  left, the selected plan's schedule on the right (mirrors Monthly statements). */
function InstallmentPlansBoard({
  active,
  completed,
  onOpenPlan,
}: {
  active: InstallmentPlan[]
  completed: InstallmentPlan[]
  onOpenPlan: (plan: InstallmentPlan) => void
}) {
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  const plans = useMemo(() => [...active, ...completed], [active, completed])
  const [selectedId, setSelectedId] = useState<number>(() => plans[0]?.id ?? -1)

  useEffect(() => {
    if (plans.length > 0 && !plans.some((p) => p.id === selectedId)) {
      setSelectedId(plans[0].id)
    }
  }, [plans, selectedId])

  const selected = plans.find((p) => p.id === selectedId) ?? plans[0]
  if (!selected) return null

  const now = Date.now()
  const paidIn = (plan: InstallmentPlan) => plan.transactions.filter((t) => new Date(`${t.date}T00:00:00`).getTime() < now).length
  const selectedPaid = paidIn(selected)
  const selectedProgress = selected.totalInstallments > 0 ? Math.min(100, Math.round((selectedPaid / selected.totalInstallments) * 100)) : 0
  const selectedCaption = [selected.transactions[0]?.category ? categoryLabel(selected.transactions[0].category) : '', selected.paymentMethodName ?? t('installments.noCard'), selected.accountName ?? t('installments.noAccount')].filter(Boolean).join(' · ')
  const rows = [...selected.transactions].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <Box p={{ base: 3, md: 3.5 }} borderRadius="16px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="var(--pb-shadow)">
      <HStack spacing={2.5} mb={3.5}>
        <Flex w={8} h={8} align="center" justify="center" borderRadius="10px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" color="var(--pb-forest-2)">
          <Icon as={CreditCard} boxSize={4} weight="duotone" />
        </Flex>
        <Box>
          <Text fontSize="md" fontWeight={600} color="var(--pb-ink)" lineHeight="1.2">{t('installments.plans.title')}</Text>
          <Text fontSize="xs" color="var(--pb-ink-soft)">{t('installments.plans.select')}</Text>
        </Box>
      </HStack>

      <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 3, md: 4 }} align="stretch">
        {/* Plan menu */}
        <Flex
          as="nav"
          aria-label={t('installments.plans.title')}
          direction={{ base: 'row', md: 'column' }}
          gap={1.5}
          flexShrink={0}
          w={{ base: 'full', md: '230px' }}
          overflowX={{ base: 'auto', md: 'visible' }}
          pb={{ base: 1, md: 0 }}
          sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
        >
          {plans.map((plan) => {
            const isSel = plan.id === selected.id
            const past = isInstallmentPlanCompleted(plan)
            return (
              <Box
                as="button"
                type="button"
                key={plan.id}
                onClick={() => setSelectedId(plan.id)}
                textAlign="left"
                flexShrink={0}
                minW={{ base: '180px', md: 'auto' }}
                px={3}
                py={2.5}
                borderRadius="11px"
                border="1px solid"
                borderColor={isSel ? 'var(--pb-hair-2)' : 'transparent'}
                bg={isSel ? 'var(--pb-surface-2)' : 'transparent'}
                boxShadow={isSel ? 'var(--pb-shadow)' : 'none'}
                opacity={past && !isSel ? 0.7 : 1}
                _hover={{ bg: isSel ? 'var(--pb-surface-2)' : 'var(--pb-surface-3)' }}
                transition="all .15s ease"
              >
                <HStack spacing={1.5} minW={0}>
                  {past && <Icon as={CheckCircle2} boxSize={3} color="var(--pb-income)" flexShrink={0} />}
                  <Text fontSize="sm" fontWeight={isSel ? 600 : 500} color={isSel ? 'var(--pb-ink)' : 'var(--pb-ink-soft)'} noOfLines={1}>
                    {planTitleOf(plan, t('installments.planFallback'))}
                  </Text>
                </HStack>
                <Flex justify="space-between" align="baseline" gap={2} mt={0.5}>
                  <Text fontFamily="var(--pb-mono)" fontSize="9px" color="var(--pb-ink-faint)" letterSpacing="0.06em" whiteSpace="nowrap">
                    {paidIn(plan)}/{plan.totalInstallments}
                  </Text>
                  <Text fontFamily="var(--pb-mono)" fontSize="11px" fontWeight={500} color="var(--pb-ink-soft)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(plan.installmentValue)}
                  </Text>
                </Flex>
              </Box>
            )
          })}
        </Flex>

        {/* Selected plan detail */}
        <Box flex={1} minW={0} borderRadius="13px" border="1px solid var(--pb-hair)" bg="var(--pb-surface-2)" overflow="hidden">
          <Box as="button" type="button" onClick={() => onOpenPlan(selected)} w="full" textAlign="left" _hover={{ bg: 'var(--pb-surface-3)' }} transition="background .16s ease" aria-label={t('installments.openDetails')}>
            <Flex justify="space-between" align="center" gap={3} px={3.5} py={3} borderBottom="1px solid var(--pb-hair)">
              <Box minW={0}>
                <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{planTitleOf(selected, t('installments.planFallback'))}</Text>
                <Text fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>{selectedCaption}</Text>
              </Box>
              <HStack spacing={2} flexShrink={0}>
                <VStack align="flex-end" spacing={0}>
                  <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)">{t('installments.perMonth')}</Text>
                  <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(selected.installmentValue)}</Text>
                </VStack>
                <Icon as={ChevronRight} boxSize={4} color="var(--pb-ink-faint)" />
              </HStack>
            </Flex>
          </Box>

          {/* Progress */}
          <Box px={3.5} pt={3} pb={1}>
            <Flex justify="space-between" align="baseline" mb="4px">
              <Text fontSize="xs" color="var(--pb-ink-soft)">{t('installments.paidProgress', { paid: selectedPaid, total: selected.totalInstallments })}</Text>
              <Text fontSize="xs" fontWeight={700} color="var(--pb-forest-2)">{selectedProgress}%</Text>
            </Flex>
            <Box h="5px" w="full" bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden">
              <Box h="full" w={`${selectedProgress}%`} bg="var(--pb-forest-2)" borderRadius="full" transition="width 0.4s ease" />
            </Box>
          </Box>

          {/* Schedule */}
          <VStack align="stretch" spacing={0} pt={2}>
            {rows.map((tx) => {
              const due = new Date(`${tx.date}T00:00:00`)
              const isPaid = due.getTime() < now
              return (
                <Flex key={tx.id} justify="space-between" align="center" gap={3} px={3.5} py={2.5} borderTop="1px solid var(--pb-hair)">
                  <HStack spacing={3} minW={0}>
                    <Box w={9} flexShrink={0} textAlign="center" borderRight="1px solid var(--pb-hair)" pr={2}>
                      <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" color="var(--pb-ink-faint)" textTransform="uppercase">{formatDate(due, { month: 'short' })}</Text>
                      <Text fontFamily="var(--pb-serif)" fontSize="md" fontWeight={500} color="var(--pb-ink)" lineHeight={1}>{due.getDate()}</Text>
                    </Box>
                    <VStack align="stretch" spacing={0} minW={0}>
                      <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink)" noOfLines={1}>{t('installments.installmentProgress', { number: tx.installmentNumber, total: selected.totalInstallments })}</Text>
                      <Text fontFamily="var(--pb-mono)" fontSize="10px" color={isPaid ? 'var(--pb-income)' : 'var(--pb-ink-faint)'} letterSpacing="0.06em" noOfLines={1}>{isPaid ? t('installments.status.paid') : t('installments.status.upcoming')} · {formatDate(due, { year: 'numeric' })}</Text>
                    </VStack>
                  </HStack>
                  <Text fontFamily="var(--pb-mono)" fontSize="13px" fontWeight={500} color={isPaid ? 'var(--pb-ink-faint)' : 'var(--pb-ink-soft)'} flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(tx.amount)}</Text>
                </Flex>
              )
            })}
          </VStack>
        </Box>
      </Flex>
    </Box>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) { return <Flex direction="column" align="center" textAlign="center" py={9} px={4} border="1px dashed var(--pb-hair-2)" borderRadius="15px"><Flex w={11} h={11} align="center" justify="center" borderRadius="12px" bg="var(--pb-surface-2)" color="var(--pb-ink-faint)" mb={3}><Icon as={CreditCard} boxSize={5} weight="duotone" /></Flex><Text fontWeight={600} color="var(--pb-ink)">{title}</Text><Text fontSize="sm" color="var(--pb-ink-soft)" maxW="430px" mt={1}>{body}</Text></Flex> }
function ActionButton({ label, icon, primary, onClick }: { label: string; icon: typeof Plus; primary?: boolean; onClick: () => void }) { return <Button leftIcon={<Icon as={icon} boxSize={4} />} onClick={onClick} h="44px" px={4} borderRadius="12px" fontWeight={500} color={primary ? 'var(--pb-on-accent)' : 'var(--pb-ink-soft)'} bg={primary ? 'var(--pb-forest-2)' : 'var(--pb-surface-2)'} border="1px solid" borderColor={primary ? 'transparent' : 'var(--pb-hair)'} _hover={{ bg: primary ? 'var(--pb-forest)' : 'var(--pb-surface-3)' }}>{label}</Button> }

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

function InstallmentStatements({ months }: { months: StatementMonth[] }) {
  const { t, formatCurrency, formatDate } = useI18n()
  const [selectedKey, setSelectedKey] = useState<string>(() => months[0]?.key ?? '')

  // Keep the selection valid as data loads/changes; fall back to the first month.
  useEffect(() => {
    if (months.length > 0 && !months.some((m) => m.key === selectedKey)) {
      setSelectedKey(months[0].key)
    }
  }, [months, selectedKey])

  const selected = months.find((m) => m.key === selectedKey) ?? months[0]
  if (!selected) return null

  return (
    <Box p={{ base: 3, md: 3.5 }} borderRadius="16px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="var(--pb-shadow)">
      <HStack spacing={2.5} mb={3.5}>
        <Flex w={8} h={8} align="center" justify="center" borderRadius="10px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" color="var(--pb-forest-2)">
          <Icon as={CalendarClock} boxSize={4} weight="duotone" />
        </Flex>
        <Box>
          <Text fontSize="md" fontWeight={600} color="var(--pb-ink)" lineHeight="1.2">{t('installments.statements.title')}</Text>
          <Text fontSize="xs" color="var(--pb-ink-soft)">{t('installments.statements.subtitle')}</Text>
        </Box>
      </HStack>

      <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 3, md: 4 }} align="stretch">
        {/* Month menu */}
        <Flex
          as="nav"
          aria-label={t('installments.statements.monthsAria')}
          direction={{ base: 'row', md: 'column' }}
          gap={1.5}
          flexShrink={0}
          w={{ base: 'full', md: '210px' }}
          overflowX={{ base: 'auto', md: 'visible' }}
          pb={{ base: 1, md: 0 }}
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
                textAlign="left"
                flexShrink={0}
                minW={{ base: '150px', md: 'auto' }}
                px={3}
                py={2.5}
                borderRadius="11px"
                border="1px solid"
                borderColor={isActive ? 'var(--pb-hair-2)' : 'transparent'}
                bg={isActive ? 'var(--pb-surface-2)' : 'transparent'}
                boxShadow={isActive ? 'var(--pb-shadow)' : 'none'}
                _hover={{ bg: isActive ? 'var(--pb-surface-2)' : 'var(--pb-surface-3)' }}
                transition="all .15s ease"
              >
                <Text fontSize="sm" fontWeight={isActive ? 600 : 500} color={isActive ? 'var(--pb-ink)' : 'var(--pb-ink-soft)'} noOfLines={1}>
                  {formatDate(month.date, { month: 'short', year: 'numeric' })}
                </Text>
                <Flex justify="space-between" align="baseline" gap={2} mt={0.5}>
                  <Text fontFamily="var(--pb-mono)" fontSize="9px" color="var(--pb-ink-faint)" letterSpacing="0.06em" whiteSpace="nowrap">
                    {t(month.items.length === 1 ? 'installments.paymentCount.one' : 'installments.paymentCount.other', { count: month.items.length })}
                  </Text>
                  <Text fontFamily="var(--pb-mono)" fontSize="11px" fontWeight={500} color="var(--pb-ink-soft)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(month.total)}
                  </Text>
                </Flex>
              </Box>
            )
          })}
        </Flex>

        {/* Selected month detail */}
        <Box flex={1} minW={0} borderRadius="13px" border="1px solid var(--pb-hair)" bg="var(--pb-surface-2)" overflow="hidden">
          <Flex justify="space-between" align="center" gap={3} px={3.5} py={3} borderBottom="1px solid var(--pb-hair)">
            <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)">
              {formatDate(selected.date, { month: 'long', year: 'numeric' })}
            </Text>
            <Text className="num" fontSize="sm" fontWeight={600} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(selected.total)}
            </Text>
          </Flex>
          <VStack align="stretch" spacing={0}>
            {selected.items.map((item, index) => {
              const due = new Date(`${item.date}T00:00:00`)
              return (
                <Flex key={item.id} justify="space-between" align="center" gap={3} px={3.5} py={2.5} borderTop={index > 0 ? '1px solid var(--pb-hair)' : undefined}>
                  <HStack spacing={3} minW={0}>
                    <Box w={9} flexShrink={0} textAlign="center" borderRight="1px solid var(--pb-hair)" pr={2}>
                      <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" color="var(--pb-ink-faint)" textTransform="uppercase">{formatDate(due, { month: 'short' })}</Text>
                      <Text fontFamily="var(--pb-serif)" fontSize="md" fontWeight={500} color="var(--pb-ink)" lineHeight={1}>{due.getDate()}</Text>
                    </Box>
                    <VStack align="stretch" spacing={0} minW={0}>
                      <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink)" noOfLines={1}>{item.description}</Text>
                      <Text fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)" letterSpacing="0.06em" noOfLines={1}>{item.label}</Text>
                    </VStack>
                  </HStack>
                  <Text fontFamily="var(--pb-mono)" fontSize="13px" fontWeight={500} color="var(--pb-ink-soft)" flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(item.amount)}</Text>
                </Flex>
              )
            })}
          </VStack>
        </Box>
      </Flex>
    </Box>
  )
}
