import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Box, Button, Flex, HStack, Icon, IconButton, Input, NumberInput, NumberInputField, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'

import { deleteCategoryBudget, getCashFlowForecast, listCategoryBudgets, updateExpensePlan, updateIncomePlan, upsertCategoryBudget } from '../../api'
import type { CashFlowForecast, CashFlowForecastMonth, CategoryBudget } from '../../types'
import { ToastService } from '../../services/toast'
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, DollarSign, Layers, Plus, ShoppingCart, TrendingDown, TrendingUp, Wallet } from '../../components/ui/icons'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodData } from '../../hooks/usePeriodData'
import { useI18n } from '../../i18n'

import '../dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../dashboard/components/motion'

const monthValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const monthDate = (value: string) => {
  const [year, month] = value.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

interface PlanningPageProps {
  onPageChange?: (page: AppPage) => void
}

export default function PlanningPage({ onPageChange }: PlanningPageProps) {
  const { t, formatCurrency, formatDate } = useI18n()
  const monthLabel = useCallback(
    (value?: string) => value
      ? formatDate(monthDate(value), { month: 'long', year: 'numeric' })
      : t('planning.previousMonth'),
    [formatDate, t],
  )
  const [selectedMonth, setSelectedMonth] = useState(monthValue(new Date()))
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [forecast, setForecast] = useState<CashFlowForecast | null>(null)
  const [category, setCategory] = useState('')
  const [limitAmount, setLimitAmount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [incomePlan, setIncomePlan] = useState(0)
  const [savingIncomePlan, setSavingIncomePlan] = useState(false)
  const [expensePlan, setExpensePlan] = useState(0)
  const [savingExpensePlan, setSavingExpensePlan] = useState(false)
  const [isDraggingForecast, setIsDraggingForecast] = useState(false)
  const forecastCarouselRef = useRef<HTMLDivElement>(null)
  const forecastDragRef = useRef({ startX: 0, scrollLeft: 0 })

  const currentMonth = useMemo(() => new Date(), [])
  const { transactions, monthSummary, loading: currentMonthLoading } = useDashboardData(currentMonth, 'month')
  const currentMonthData = usePeriodData(transactions, monthSummary, 'month', currentMonth, 'cash-flow')
  const selectedDate = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number)
    return new Date(year, month - 1, 1)
  }, [selectedMonth])

  const load = useCallback(async () => {
    try {
      const [budgetItems, forecastData] = await Promise.all([listCategoryBudgets(selectedDate), getCashFlowForecast()])
      setBudgets(budgetItems)
      setForecast(forecastData)
      setIncomePlan(forecastData.plannedMonthlyIncome ?? 0)
      setExpensePlan(forecastData.plannedMonthlyVariableExpense ?? 0)
    } catch (err) {
      ToastService.apiError(err, { title: t('planning.toast.loadFailed'), dedupeKey: 'planning-load-failed' })
    }
  }, [selectedDate, t])

  useEffect(() => { void load() }, [load])

  const saveBudget = async () => {
    if (!category.trim() || limitAmount <= 0) return
    setSaving(true)
    try {
      await upsertCategoryBudget({ category: category.trim(), year: selectedDate.getFullYear(), month: selectedDate.getMonth() + 1, limitAmount })
      setCategory('')
      setLimitAmount(0)
      await load()
      ToastService.success({ title: t('planning.toast.budgetSaved'), dedupeKey: 'budget-saved' })
    } catch (err) {
      ToastService.apiError(err, { title: t('planning.toast.budgetSaveFailed'), dedupeKey: 'budget-save-failed' })
    } finally {
      setSaving(false)
    }
  }

  const removeBudget = async (budget: CategoryBudget) => {
    try {
      await deleteCategoryBudget(budget.id)
      await load()
    } catch (err) {
      ToastService.apiError(err, { title: t('planning.toast.budgetDeleteFailed'), dedupeKey: `budget-delete-failed:${budget.id}` })
    }
  }

  const saveIncomePlan = async () => {
    setSavingIncomePlan(true)
    try {
      const forecastData = await updateIncomePlan(incomePlan > 0 ? incomePlan : null)
      setForecast(forecastData)
      setIncomePlan(forecastData.plannedMonthlyIncome ?? 0)
      ToastService.success({ title: incomePlan > 0 ? t('planning.toast.incomeSaved') : t('planning.toast.incomeCleared'), dedupeKey: 'income-plan-saved' })
    } catch (err) {
      ToastService.apiError(err, { title: t('planning.toast.incomeSaveFailed'), dedupeKey: 'income-plan-save-failed' })
    } finally {
      setSavingIncomePlan(false)
    }
  }

  const saveExpensePlan = async () => {
    setSavingExpensePlan(true)
    try {
      const forecastData = await updateExpensePlan(expensePlan > 0 ? expensePlan : null)
      setForecast(forecastData)
      setExpensePlan(forecastData.plannedMonthlyVariableExpense ?? 0)
      ToastService.success({ title: expensePlan > 0 ? t('planning.toast.expenseSaved') : t('planning.toast.expenseCleared'), dedupeKey: 'expense-plan-saved' })
    } catch (err) {
      ToastService.apiError(err, { title: t('planning.toast.expenseSaveFailed'), dedupeKey: 'expense-plan-save-failed' })
    } finally {
      setSavingExpensePlan(false)
    }
  }

  const firstNegativeMonth = forecast?.months.find((item) => item.negative)
  const firstPositiveMonth = forecast?.months.find((item) => item.projectedClosingBalance > 0)
  const horizons = forecast ? [
    { label: t('planning.horizon.months', { count: 3 }), month: forecast.months[2] },
    { label: t('planning.horizon.months', { count: 6 }), month: forecast.months[5] },
    { label: t('planning.horizon.months', { count: 12 }), month: forecast.months[11] },
  ].filter((item): item is { label: string; month: CashFlowForecastMonth } => Boolean(item.month)) : []
  const basisCount = forecast?.projectionBasisMonths.length ?? 0
  const basisLabel = forecast?.projectionBasisMonths.map(monthLabel).join(', ')
  const variableLabel = basisCount > 0
    ? t('planning.variableAverage', { count: basisCount })
    : t('planning.variable')
  const exceededBudgets = budgets.filter((budget) => budget.exceeded).length
  const monthlyPositive = currentMonthData.balance >= 0

  const scrollForecast = (direction: -1 | 1) => {
    const carousel = forecastCarouselRef.current
    if (!carousel) return
    const card = carousel.querySelector<HTMLElement>('[data-forecast-card]')
    carousel.scrollBy({ left: direction * ((card?.offsetWidth ?? carousel.clientWidth * 0.85) + 12), behavior: 'smooth' })
  }

  const startForecastDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const carousel = forecastCarouselRef.current
    if (!carousel) return
    forecastDragRef.current = { startX: event.clientX, scrollLeft: carousel.scrollLeft }
    setIsDraggingForecast(true)
    carousel.setPointerCapture(event.pointerId)
  }
  const moveForecastDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingForecast || event.pointerType !== 'mouse') return
    const carousel = forecastCarouselRef.current
    if (!carousel) return
    event.preventDefault()
    carousel.scrollLeft = forecastDragRef.current.scrollLeft - (event.clientX - forecastDragRef.current.startX)
  }
  const stopForecastDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const carousel = forecastCarouselRef.current
    if (carousel?.hasPointerCapture(event.pointerId)) carousel.releasePointerCapture(event.pointerId)
    setIsDraggingForecast(false)
  }

  return (
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 3, md: 7 }}>
      <MotionBox variants={containerV} initial="hidden" animate="show">
        <VStack align="stretch" spacing={{ base: 3, md: 5 }}>

          <MotionBox variants={riseV}>
            {currentMonthLoading ? <Box h="250px" borderRadius="22px" bg="var(--pb-surface-2)" /> : <PlanningHero monthlyPositive={monthlyPositive} balance={currentMonthData.balance} income={currentMonthData.income} expense={currentMonthData.expense} forecast={forecast} firstNegativeMonth={firstNegativeMonth} firstPositiveMonth={firstPositiveMonth} onOpenGoals={() => onPageChange?.('goals')} />}
          </MotionBox>

          <MotionBox variants={riseV}>
            <SectionLabel>{t('planning.signals')}</SectionLabel>
          </MotionBox>

          <MotionBox variants={riseV}>
            <PlanPanel eyebrow={t('planning.projection.eyebrow')} title={t('planning.projection.title')} caption={t('planning.projection.caption')} rightSlot={forecast?.months.length ? <HStack spacing={2}><ForecastNav label={t('planning.projection.previous')} icon={ChevronLeft} onClick={() => scrollForecast(-1)} /><ForecastNav label={t('planning.projection.next')} icon={ChevronRight} onClick={() => scrollForecast(1)} /></HStack> : undefined}>
              {forecast?.months.length ? <Box ref={forecastCarouselRef} onPointerDown={startForecastDrag} onPointerMove={moveForecastDrag} onPointerUp={stopForecastDrag} onPointerCancel={stopForecastDrag} onLostPointerCapture={() => setIsDraggingForecast(false)} display="flex" gap={3} overflowX="auto" overflowY="hidden" pb={2} cursor={isDraggingForecast ? 'grabbing' : 'grab'} scrollSnapType={isDraggingForecast ? 'none' : 'x mandatory'} userSelect={isDraggingForecast ? 'none' : 'auto'} sx={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>{(forecast?.months ?? []).map((month) => <ForecastCard key={month.month} month={month} hasIncomePlan={forecast?.hasIncomePlan ?? false} />)}</Box> : <EmptyPlan icon={TrendingUp} title={t('planning.projection.emptyTitle')} body={t('planning.projection.emptyBody')} />}
            </PlanPanel>
          </MotionBox>

          {horizons.length > 0 && <><MotionBox variants={riseV}><SectionLabel>{t('planning.keyHorizons')}</SectionLabel></MotionBox><SimpleGrid columns={3} spacing={{ base: '0.5rem', md: '0.8rem' }}>{horizons.map(({ label, month }) => <MotionBox key={label} variants={riseV}><Horizon label={label} month={month} /></MotionBox>)}</SimpleGrid></>}

          <SimpleGrid columns={{ base: 2, xl: 4 }} spacing={{ base: '0.6rem', md: '0.8rem' }}>
            <MotionBox variants={riseV}><Signal icon={Wallet} label={t('planning.signal.startingBalance')} value={forecast ? formatCurrency(forecast.currentTotalBalance) : '—'} note={t('planning.signal.connectedAccounts')} /></MotionBox>
            <MotionBox variants={riseV}><Signal icon={DollarSign} label={t('planning.signal.incomeAssumption')} value={forecast?.hasIncomePlan ? formatCurrency(forecast.plannedMonthlyIncome ?? 0) : forecast ? formatCurrency(forecast.averageMonthlyIncome) : '—'} note={forecast?.hasIncomePlan ? t('planning.signal.monthlyTarget') : t('planning.signal.transactionHistory')} accent="income" /></MotionBox>
            <MotionBox variants={riseV}><Signal icon={TrendingDown} label={t('planning.signal.expenseAssumption')} value={forecast?.hasExpensePlan ? formatCurrency(forecast.plannedMonthlyVariableExpense ?? 0) : forecast ? formatCurrency(forecast.averageMonthlyVariableExpense) : '—'} note={forecast?.hasExpensePlan ? t('planning.signal.dayToDayEstimate') : basisCount ? t(basisCount === 1 ? 'planning.signal.variableSpend.one' : 'planning.signal.variableSpend.other', { count: basisCount }) : t('planning.signal.noHistory')} accent="expense" /></MotionBox>
            <MotionBox variants={riseV}><Signal icon={firstNegativeMonth ? AlertTriangle : CheckCircle2} label={t('planning.signal.runway')} value={firstNegativeMonth ? monthLabel(firstNegativeMonth.month) : t('planning.twelveMonthsPlus')} note={firstNegativeMonth ? t('planning.signal.firstNegative') : t('planning.signal.noNegative')} accent={firstNegativeMonth ? 'expense' : 'income'} /></MotionBox>
          </SimpleGrid>

          <MotionBox variants={riseV}>
            <SectionLabel>{t('planning.buildPlan')}</SectionLabel>
          </MotionBox>
          <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={{ base: 3, md: 5 }}>
            <MotionBox variants={riseV}>
              <PlanPanel eyebrow={t('planning.income.eyebrow')} title={t('planning.income.title')} caption={t('planning.income.caption')}>
                <Flex gap={3} align="end" flexDirection={{ base: 'column', sm: 'row' }}>
                  <Box flex={1} w="full"><FieldLabel>{t('planning.income.expected')}</FieldLabel><NumberInput min={0} precision={2} value={incomePlan} onChange={(_, value) => setIncomePlan(value || 0)}><NumberInputField bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="12px" h="44px" /></NumberInput></Box>
                  <ActionButton label={incomePlan > 0 ? t('planning.income.save') : t('planning.useHistory')} icon={DollarSign} primary={incomePlan > 0} onClick={saveIncomePlan} isLoading={savingIncomePlan} />
                </Flex>
                <PlanHint accent="brand">{forecast?.hasIncomePlan ? t('planning.income.activeTarget', { amount: formatCurrency(forecast.plannedMonthlyIncome ?? 0) }) : t('planning.currentAverage', { amount: formatCurrency(forecast?.averageMonthlyIncome ?? 0) })}</PlanHint>
              </PlanPanel>
            </MotionBox>

            <MotionBox variants={riseV}>
              <PlanPanel eyebrow={t('planning.expense.eyebrow')} title={t('planning.expense.title')} caption={t('planning.expense.caption')}>
                <Flex gap={3} align="end" flexDirection={{ base: 'column', sm: 'row' }}>
                  <Box flex={1} w="full"><FieldLabel>{t('planning.expense.estimated')}</FieldLabel><NumberInput min={0} precision={2} value={expensePlan} onChange={(_, value) => setExpensePlan(value || 0)}><NumberInputField bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="12px" h="44px" /></NumberInput></Box>
                  <ActionButton label={expensePlan > 0 ? t('planning.expense.save') : t('planning.useHistory')} icon={ShoppingCart} primary={expensePlan > 0} onClick={saveExpensePlan} isLoading={savingExpensePlan} />
                </Flex>
                <PlanHint accent="brand">{forecast?.hasExpensePlan ? t('planning.expense.activeEstimate', { amount: formatCurrency(forecast.plannedMonthlyVariableExpense ?? 0) }) : t('planning.currentAverage', { amount: formatCurrency(forecast?.averageMonthlyVariableExpense ?? 0) })}</PlanHint>
              </PlanPanel>
            </MotionBox>

            <MotionBox variants={riseV}>
              <PlanPanel eyebrow={t('planning.budget.eyebrow')} title={t('planning.budget.title')} caption={t('planning.budget.caption')} rightSlot={<Input aria-label={t('planning.budget.month')} type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} maxW="150px" h="36px" bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="10px" />}>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}><Box><FieldLabel>{t('planning.budget.category')}</FieldLabel><Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder={t('planning.budget.categoryPlaceholder')} h="44px" bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="12px" /></Box><Box><FieldLabel>{t('planning.budget.monthlyLimit')}</FieldLabel><NumberInput min={0} precision={2} value={limitAmount} onChange={(_, value) => setLimitAmount(value || 0)}><NumberInputField h="44px" bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="12px" /></NumberInput></Box></SimpleGrid>
                <ActionButton label={t('planning.budget.addLimit')} icon={Plus} primary onClick={saveBudget} isLoading={saving} disabled={!category.trim() || limitAmount <= 0} />
              </PlanPanel>
            </MotionBox>
          </SimpleGrid>

          <MotionBox variants={riseV}>
            <PlanPanel eyebrow={t('planning.budget.limits')} title={budgets.length ? t('planning.budget.monthTitle', { month: monthLabel(selectedMonth) }) : t('planning.budget.yourBudgets')} caption={budgets.length ? (exceededBudgets ? t(exceededBudgets === 1 ? 'planning.budget.attention.one' : 'planning.budget.attention.other', { count: exceededBudgets }) : t('planning.budget.withinRange')) : t('planning.budget.addCategories')}>
              {budgets.length ? <VStack align="stretch" spacing="0.65rem">{budgets.map((budget) => <BudgetRow key={budget.id} budget={budget} onRemove={() => removeBudget(budget)} />)}</VStack> : <EmptyPlan icon={Layers} title={t('planning.budget.emptyTitle')} body={t('planning.budget.emptyBody')} />}
            </PlanPanel>
          </MotionBox>

          {false && <MotionBox variants={riseV}>
            <PlanPanel eyebrow={t('planning.projection.eyebrow')} title={t('planning.projection.title')} caption={forecast?.hasProjectionBasis ? t('planning.projection.basisCaption', { months: basisLabel ?? '' }) : t('planning.projection.noBasisCaption')} rightSlot={forecast?.months.length ? <HStack spacing={2}><ForecastNav label={t('planning.projection.previous')} icon={ChevronLeft} onClick={() => scrollForecast(-1)} /><ForecastNav label={t('planning.projection.next')} icon={ChevronRight} onClick={() => scrollForecast(1)} /></HStack> : undefined}>
              {forecast?.months.length ? <Box ref={forecastCarouselRef} onPointerDown={startForecastDrag} onPointerMove={moveForecastDrag} onPointerUp={stopForecastDrag} onPointerCancel={stopForecastDrag} onLostPointerCapture={() => setIsDraggingForecast(false)} display="flex" gap={3} overflowX="auto" overflowY="hidden" pb={2} cursor={isDraggingForecast ? 'grabbing' : 'grab'} scrollSnapType={isDraggingForecast ? 'none' : 'x mandatory'} userSelect={isDraggingForecast ? 'none' : 'auto'} sx={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>{(forecast?.months ?? []).map((month) => <ForecastCard key={month.month} month={month} hasIncomePlan={forecast?.hasIncomePlan ?? false} />)}</Box> : <EmptyPlan icon={TrendingUp} title={t('planning.projection.collectingTitle')} body={t('planning.projection.collectingBody')} />}
            </PlanPanel>
          </MotionBox>}

          {false && horizons.length > 0 && <><MotionBox variants={riseV}><SectionLabel>{t('planning.keyHorizons')}</SectionLabel></MotionBox><SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: '0.6rem', md: '0.8rem' }}>{horizons.map(({ label, month }) => <MotionBox key={month.month} variants={riseV}><Horizon label={label} month={month} /></MotionBox>)}</SimpleGrid></>}
        </VStack>
      </MotionBox>
    </Box>
  )
}

function PlanningHero({ monthlyPositive, balance, income, expense, forecast, firstNegativeMonth, firstPositiveMonth, onOpenGoals }: { monthlyPositive: boolean; balance: number; income: number; expense: number; forecast: CashFlowForecast | null; firstNegativeMonth: CashFlowForecastMonth | undefined; firstPositiveMonth: CashFlowForecastMonth | undefined; onOpenGoals: () => void }) {
  const { t, formatCurrency, formatDate } = useI18n()
  const monthLabel = (value: string) => formatDate(monthDate(value), { month: 'long', year: 'numeric' })
  const signedMoney = (value: number) => `${value >= 0 ? '+' : ''}${formatCurrency(value)}`
  const projected = forecast?.currentTotalBalance
  const startingNegative = (forecast?.currentTotalBalance ?? 0) < 0
  const recoveryMonth = startingNegative
    ? forecast?.months.find((month) => month.projectedClosingBalance > 0)
    : firstPositiveMonth
  const statusTitle = startingNegative
    ? recoveryMonth
      ? t('planning.hero.recoverTitle', { month: monthLabel(recoveryMonth.month) })
      : t('planning.hero.negativeTitle')
    : monthlyPositive
      ? t('planning.hero.onTrackTitle')
      : t('planning.hero.needsRecoveryTitle')
  const statusBody = startingNegative
    ? recoveryMonth
      ? t('planning.hero.recoverBody', { amount: formatCurrency(forecast?.currentTotalBalance ?? 0), month: monthLabel(recoveryMonth.month) })
      : t('planning.hero.negativeBody')
    : monthlyPositive
      ? t('planning.hero.positiveBody', { income: formatCurrency(income), expense: formatCurrency(expense), balance: formatCurrency(balance) })
      : t('planning.hero.recoveryBody', { expense: formatCurrency(expense), gap: formatCurrency(Math.abs(balance)) })
  const attention = startingNegative || !monthlyPositive
  return (
    <Box
      overflow="hidden"
      position="relative"
      borderRadius={{ base: '16px', md: '22px' }}
      bg="var(--pb-hero)"
      color="var(--pb-hero-ink)"
      boxShadow="var(--pb-shadow-lift)"
      border="1px solid var(--pb-hero-line)"
      p="clamp(1rem, 4vw, 2rem)"
    >
      <Box position="absolute" w="340px" h="340px" border="1px solid var(--pb-hero-line)" borderRadius="full" right="-85px" top="-190px" />
      <Box position="absolute" w="230px" h="230px" border="1px solid var(--pb-hero-line)" borderRadius="full" right="90px" bottom="-175px" />
      <Flex position="relative" zIndex={1} direction={{ base: 'column', lg: 'row' }} justify="space-between" gap={{ base: 4, lg: 6 }}>
        <Box maxW="620px">
          <HStack spacing={2} mb={{ base: 2, md: 3 }}>
            <Flex
              w={7}
              h={7}
              align="center"
              justify="center"
              borderRadius="full"
              bg={attention ? 'var(--pb-tint-coral)' : 'var(--pb-tint-income)'}
              color={attention ? 'var(--pb-coral)' : 'var(--pb-income)'}
            >
              <Icon as={attention ? AlertTriangle : CheckCircle2} boxSize={4} weight="fill" />
            </Flex>
            <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.18em" textTransform="uppercase" opacity={0.76}>
              {startingNegative
                ? t('planning.hero.recoveryOutlook')
                : monthlyPositive
                  ? t('planning.hero.monthOnTrack')
                  : t('planning.hero.attentionNeeded')}
            </Text>
          </HStack>
          <Text fontSize={{ base: 'xl', md: '3xl' }} fontWeight={500} lineHeight="1.15" letterSpacing="-0.03em">{statusTitle}</Text>
          <Text fontSize="sm" lineHeight="1.55" opacity={0.82} mt={{ base: 2, md: 3 }}>{statusBody}</Text>
          {attention && (
            <Button
              mt={{ base: 3, md: 5 }}
              size="sm"
              rightIcon={<Icon as={ArrowRight} boxSize={4} />}
              onClick={onOpenGoals}
              bg="var(--pb-gold)"
              color="var(--pb-on-accent)"
              _hover={{ bg: 'var(--pb-gold-2)' }}
            >
              {t('planning.hero.openBreakEven')}
            </Button>
          )}
        </Box>
        <SimpleGrid columns={2} spacing={{ base: 2.5, md: 5 }} minW={{ lg: '330px' }}>
          <HeroMetric label={t('planning.hero.thisMonth')} value={signedMoney(balance)} />
          <HeroMetric label={t('planning.hero.currentBalance')} value={projected === undefined ? '—' : formatCurrency(projected)} note={t('planning.hero.liveStartingPoint')} />
          <HeroMetric label={t('planning.hero.recovery')} value={startingNegative ? recoveryMonth ? monthLabel(recoveryMonth.month) : t('planning.hero.notProjected') : t('planning.hero.alreadyPositive')} note={startingNegative ? t('planning.hero.firstPositive') : undefined} />
          <HeroMetric label={t('planning.signal.runway')} value={firstNegativeMonth ? monthLabel(firstNegativeMonth.month) : t('planning.twelveMonthsPlus')} note={firstNegativeMonth ? t('planning.hero.firstNegativeMonth') : t('planning.hero.planPositive')} />
        </SimpleGrid>
      </Flex>
    </Box>
  )
}

function HeroMetric({ label, value, note }: { label: string; value: string; note?: string }) { return <Box><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.14em" textTransform="uppercase" opacity={0.68}>{label}</Text><Text className="num" fontSize={{ base: 'lg', md: 'xl' }} fontWeight={500} mt="2px" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Text>{note && <Text fontSize="10px" opacity={0.68} mt="2px">{note}</Text>}</Box> }

function Signal({ icon: IconComp, label, value, note, accent = 'brand' }: { icon: typeof Wallet; label: string; value: string; note: string; accent?: 'brand' | 'income' | 'expense' }) {
  const colour = accent === 'income' ? 'var(--pb-income)' : accent === 'expense' ? 'var(--pb-coral)' : 'var(--pb-forest-2)'
  const tint = accent === 'income' ? 'var(--pb-tint-income)' : accent === 'expense' ? 'var(--pb-tint-coral)' : 'var(--pb-tint-green)'
  return <Box h="full" p={{ base: 3, md: 4 }} borderRadius="16px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="0 1px 2px rgba(15,23,42,.04)"><Flex align="center" justify="space-between" mb={{ base: 2, md: 4 }}><Flex w={8} h={8} align="center" justify="center" borderRadius="12px" bg={tint} color={colour}><IconComp size={16} weight="duotone" color={colour} /></Flex></Flex><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.14em" textTransform="uppercase" color="var(--pb-ink-faint)">{label}</Text><Text className="num" fontSize={{ base: 'md', md: 'lg' }} fontWeight={500} color="var(--pb-ink)" mt="3px" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Text><Text fontSize="xs" color="var(--pb-ink-soft)" mt="3px">{note}</Text></Box>
}

function SectionLabel({ children }: { children: ReactNode }) { return <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)" pl="0.15rem">{children}</Text> }

function PlanPanel({ eyebrow, title, caption, rightSlot, children }: { eyebrow: string; title: string; caption: string; rightSlot?: ReactNode; children: ReactNode }) { return <Box h="full" p={{ base: 3, md: 5 }} borderRadius={{ base: '16px', md: '22px' }} bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="var(--pb-shadow)"><Flex justify="space-between" align="start" gap={3} mb={{ base: 3, md: 5 }}><Box><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.16em" textTransform="uppercase" color="var(--pb-forest-2)">{eyebrow}</Text><Text fontSize={{ base: 'md', md: 'lg' }} fontWeight={600} letterSpacing="-0.015em" color="var(--pb-ink)" mt="3px">{title}</Text><Text fontSize="sm" color="var(--pb-ink-soft)" lineHeight="1.45" mt="3px">{caption}</Text></Box>{rightSlot}</Flex><VStack align="stretch" spacing={{ base: 3, md: 4 }}>{children}</VStack></Box> }

function FieldLabel({ children }: { children: ReactNode }) { return <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.13em" textTransform="uppercase" color="var(--pb-ink-faint)" mb={1.5}>{children}</Text> }

function ActionButton({ label, icon, primary, onClick, isLoading, disabled }: { label: string; icon: typeof Plus; primary?: boolean; onClick: () => void; isLoading?: boolean; disabled?: boolean }) { return <Button leftIcon={<Icon as={icon} boxSize={4} />} onClick={onClick} isLoading={isLoading} isDisabled={disabled} h="44px" px={4} borderRadius="12px" fontWeight={500} color={primary ? 'var(--pb-on-accent)' : 'var(--pb-ink-soft)'} bg={primary ? 'var(--pb-forest-2)' : 'var(--pb-surface-2)'} border="1px solid" borderColor={primary ? 'transparent' : 'var(--pb-hair)'} _hover={{ bg: primary ? 'var(--pb-forest)' : 'var(--pb-surface-3)' }}>{label}</Button> }

function PlanHint({ accent, children }: { accent: 'brand' | 'income'; children: ReactNode }) { return <Box px={3} py={2.5} borderRadius="10px" bg={accent === 'income' ? 'var(--pb-tint-income)' : 'var(--pb-tint-green)'}><Text fontSize="xs" color="var(--pb-ink-soft)">{children}</Text></Box> }

function BudgetRow({ budget, onRemove }: { budget: CategoryBudget; onRemove: () => void }) { const { t, formatCurrency, categoryLabel } = useI18n(); const colour = budget.exceeded ? 'var(--pb-coral-2)' : budget.percentageUsed >= 80 ? 'var(--pb-gold-2)' : 'var(--pb-income-2)'; return <Box p={{ base: 3, md: 3.5 }} borderRadius="14px" bg="var(--pb-surface-2)" border="1px solid" borderColor={budget.exceeded ? 'var(--pb-tint-coral)' : 'var(--pb-hair)'}><Flex justify="space-between" align="start" gap={3}><Box minW={0}><Text fontWeight={600} fontSize="sm" color="var(--pb-ink)">{categoryLabel(budget.category)}</Text><Text fontSize="xs" color="var(--pb-ink-soft)" mt="2px">{t('planning.budget.spentOfLimit', { spent: formatCurrency(budget.spentAmount), limit: formatCurrency(budget.limitAmount) })}</Text></Box><HStack spacing={2}><Text fontFamily="var(--pb-mono)" fontSize="10px" color={budget.exceeded ? 'var(--pb-coral)' : 'var(--pb-ink-soft)'}>{budget.percentageUsed.toFixed(0)}%</Text><Button size="xs" variant="ghost" color="var(--pb-coral)" onClick={onRemove}>{t('planning.budget.remove')}</Button></HStack></Flex><Box h="6px" mt={2.5} bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden"><Box h="full" w={`${Math.min(100, budget.percentageUsed)}%`} bg={colour} borderRadius="full" /></Box>{budget.exceeded && <Text fontSize="xs" color="var(--pb-coral)" mt={2}>{t('planning.budget.overLimit', { amount: formatCurrency(Math.abs(budget.remainingAmount)) })}</Text>}</Box> }

function EmptyPlan({ icon, title, body }: { icon: typeof Layers; title: string; body: string }) { return <Flex direction="column" align="center" textAlign="center" py={8} px={4} border="1px dashed var(--pb-hair-2)" borderRadius="15px"><Flex w={11} h={11} align="center" justify="center" borderRadius="12px" bg="var(--pb-surface-2)" color="var(--pb-ink-faint)" mb={3}><Icon as={icon} boxSize={5} weight="duotone" /></Flex><Text fontWeight={600} color="var(--pb-ink)">{title}</Text><Text fontSize="sm" color="var(--pb-ink-soft)" maxW="430px" mt={1}>{body}</Text></Flex> }

function ForecastNav({ label, icon, onClick }: { label: string; icon: typeof ChevronLeft; onClick: () => void }) { return <IconButton aria-label={label} icon={<Icon as={icon} boxSize={4} />} size="sm" variant="ghost" borderRadius="10px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" color="var(--pb-ink-soft)" onClick={onClick} _hover={{ bg: 'var(--pb-surface-3)', color: 'var(--pb-ink)' }} /> }

function ForecastCard({ month, hasIncomePlan }: { month: CashFlowForecastMonth; hasIncomePlan: boolean }) {
  const { t, formatCurrency, formatDate } = useI18n()
  const monthLabel = (value: string) => formatDate(monthDate(value), { month: 'long', year: 'numeric' })
  const signedMoney = (value: number) => `${value >= 0 ? '+' : ''}${formatCurrency(value)}`
  const confidence = month.confidencePercent
  const current = month.month === monthValue(new Date())
  const colour = month.negative ? 'var(--pb-coral)' : 'var(--pb-ink)'
  const scheduledIncome = month.fixedIncome ?? 0
  const scheduledOutgoings = (month.installmentExpense ?? 0) + (month.fixedExpense ?? 0)
  const incomeReceived = month.incomeReceivedSoFar ?? 0
  const expensesPaid = month.expensesPaidSoFar ?? 0
  const projectedIncome = incomeReceived + scheduledIncome + (month.estimatedIncome ?? 0)
  const projectedOutgoings = expensesPaid + scheduledOutgoings + (month.estimatedVariableExpense ?? 0)
  const incomeProgress = projectedIncome > 0 ? Math.min(100, (incomeReceived / projectedIncome) * 100) : 0
  const expensesProgress = projectedOutgoings > 0 ? Math.min(100, (expensesPaid / projectedOutgoings) * 100) : 0

  return <Box data-forecast-card flex={{ base: '0 0 80%', sm: '0 0 58%', lg: '0 0 calc(33.333% - 8px)' }} minW={0} p={{ base: 3, md: 4 }} borderRadius="16px" scrollSnapAlign="start" bg={current ? 'var(--pb-tint-green)' : 'var(--pb-surface-2)'} border="1px solid" borderColor={month.negative ? 'var(--pb-tint-coral)' : current ? 'var(--pb-hair-2)' : 'var(--pb-hair)'}>
    <Flex justify="space-between" align="start" gap={3}>
      <Box><Text fontWeight={600} fontSize={{ base: 'sm', md: 'md' }} color="var(--pb-ink)">{monthLabel(month.month)}</Text><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-ink-faint)" mt="4px">{confidence === 100 ? t('planning.forecast.allScheduled') : hasIncomePlan ? t('planning.forecast.percentScheduled', { percentage: confidence }) : t('planning.forecast.noScheduled')}</Text></Box>
      <Box textAlign="right"><Text className="num" fontSize={{ base: 'md', md: 'lg' }} fontWeight={600} color={colour} style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(month.projectedClosingBalance)}</Text><Text fontSize="xs" color={month.netCashFlow >= 0 ? 'var(--pb-income)' : 'var(--pb-coral)'} mt="2px">{t('planning.forecast.net', { amount: signedMoney(month.netCashFlow) })}</Text></Box>
    </Flex>
    <SimpleGrid columns={2} spacing={3} mt={{ base: 3, md: 4 }}>
      <Box><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-ink-faint)">{t('planning.forecast.income')}</Text><Text fontSize="sm" fontWeight={600} color="var(--pb-income)" mt="2px">{formatCurrency(current ? projectedIncome : scheduledIncome + month.estimatedIncome)}</Text><Text fontSize="10px" color="var(--pb-ink-soft)" mt="2px" noOfLines={1}>{current ? t('planning.forecast.projectedThisMonth') : month.estimatedIncome > 0 ? t('planning.forecast.scheduledIncomePlan') : t('planning.forecast.scheduled')}</Text></Box>
      <Box><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-ink-faint)">{t('planning.forecast.outgoings')}</Text><Text fontSize="sm" fontWeight={600} color="var(--pb-coral)" mt="2px">{formatCurrency(current ? projectedOutgoings : scheduledOutgoings + month.estimatedVariableExpense)}</Text><Text fontSize="10px" color="var(--pb-ink-soft)" mt="2px" noOfLines={1}>{current ? t('planning.forecast.paidScheduled') : month.estimatedVariableExpense > 0 ? t('planning.forecast.scheduledEstimate') : t('planning.forecast.scheduled')}</Text></Box>
    </SimpleGrid>
    {current && <Box mt={{ base: 3, md: 4 }} p={{ base: 2.5, md: 3 }} borderRadius="10px" bg="var(--pb-surface)">
      <Flex justify="space-between" gap={3}><Text fontSize="xs" color="var(--pb-ink-soft)">{t('planning.forecast.incomeReceived')}</Text><Text className="num" fontSize="xs" fontWeight={600} color="var(--pb-income)">{t('planning.forecast.amountOfTotal', { amount: formatCurrency(incomeReceived), total: formatCurrency(projectedIncome) })}</Text></Flex>
      <Box h="6px" mt={2} bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden"><Box h="full" w={`${incomeProgress}%`} bg="var(--pb-income-2)" borderRadius="full" /></Box>
      <Flex justify="space-between" gap={3} mt={2.5}><Text fontSize="xs" color="var(--pb-ink-soft)">{t('planning.forecast.outgoingsPaid')}</Text><Text className="num" fontSize="xs" fontWeight={600} color="var(--pb-coral)">{t('planning.forecast.amountOfTotal', { amount: formatCurrency(expensesPaid), total: formatCurrency(projectedOutgoings) })}</Text></Flex>
      <Box h="6px" mt={2} bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden"><Box h="full" w={`${expensesProgress}%`} bg="var(--pb-coral-2)" borderRadius="full" /></Box>
    </Box>}
    <Box h="5px" mt={{ base: 3, md: 4 }} bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden"><Box h="full" w={`${confidence}%`} bg={confidence >= 66 ? 'var(--pb-income-2)' : confidence >= 33 ? 'var(--pb-gold-2)' : 'var(--pb-ink-faint)'} borderRadius="full" /></Box>
  </Box>
}

function Horizon({ label, month }: { label: string; month: CashFlowForecastMonth }) { const { t, formatCurrency, formatDate } = useI18n(); const labelMonth = formatDate(monthDate(month.month), { month: 'long', year: 'numeric' }); return <Box p={{ base: 2, md: 4 }} borderRadius={{ base: '12px', md: '16px' }} bg="var(--pb-surface)" border="1px solid" borderColor={month.negative ? 'var(--pb-tint-coral)' : 'var(--pb-hair)'} boxShadow="0 1px 2px rgba(15,23,42,.04)"><Text fontFamily="var(--pb-mono)" fontSize={{ base: '8px', md: '9px' }} letterSpacing="0.14em" textTransform="uppercase" color="var(--pb-ink-faint)" noOfLines={1}>{label}</Text><Text className="num" fontSize={{ base: 'xs', sm: 'sm', md: 'xl' }} fontWeight={500} color={month.negative ? 'var(--pb-coral)' : 'var(--pb-ink)'} mt="4px" noOfLines={1} style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(month.projectedClosingBalance)}</Text><Text fontSize={{ base: '9px', md: 'xs' }} color="var(--pb-ink-soft)" mt="3px" noOfLines={1}>{t('planning.horizon.endOf', { month: labelMonth })}</Text></Box> }
