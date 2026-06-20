import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Box, Button, Flex, HStack, Icon, IconButton, Input, NumberInput, NumberInputField, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'

import { deleteCategoryBudget, getCashFlowForecast, listCategoryBudgets, updateIncomePlan, upsertCategoryBudget } from '../api'
import type { CashFlowForecast, CashFlowForecastMonth, CategoryBudget } from '../types'
import { ToastService } from '../services/toast'
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, DollarSign, Layers, Plus, TrendingDown, TrendingUp, Wallet } from '../components/ui/icons'
import { PageHeader } from '../components/ui'
import type { AppPage } from '../components/layout/header/navigation.config'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodData } from '../hooks/usePeriodData'

import '../features/dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../features/dashboard/components/motion'
import PaperFooter from '../features/dashboard/components/PaperFooter'

const monthValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const money = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
const signedMoney = (value: number) => `${value >= 0 ? '+' : ''}${money(value)}`
const monthLabel = (value?: string) => {
  if (!value) return 'the previous month'
  const [year, month] = value.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

interface PlanningPageProps {
  onPageChange?: (page: AppPage) => void
}

export default function PlanningPage({ onPageChange }: PlanningPageProps) {
  const [selectedMonth, setSelectedMonth] = useState(monthValue(new Date()))
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [forecast, setForecast] = useState<CashFlowForecast | null>(null)
  const [category, setCategory] = useState('')
  const [limitAmount, setLimitAmount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [incomePlan, setIncomePlan] = useState(0)
  const [savingIncomePlan, setSavingIncomePlan] = useState(false)
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
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not load planning data', dedupeKey: 'planning-load-failed' })
    }
  }, [selectedDate])

  useEffect(() => { void load() }, [load])

  const saveBudget = async () => {
    if (!category.trim() || limitAmount <= 0) return
    setSaving(true)
    try {
      await upsertCategoryBudget({ category: category.trim(), year: selectedDate.getFullYear(), month: selectedDate.getMonth() + 1, limitAmount })
      setCategory('')
      setLimitAmount(0)
      await load()
      ToastService.success({ title: 'Budget saved', dedupeKey: 'budget-saved' })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not save budget', dedupeKey: 'budget-save-failed' })
    } finally {
      setSaving(false)
    }
  }

  const removeBudget = async (budget: CategoryBudget) => {
    try {
      await deleteCategoryBudget(budget.id)
      await load()
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not delete budget', dedupeKey: `budget-delete-failed:${budget.id}` })
    }
  }

  const saveIncomePlan = async () => {
    setSavingIncomePlan(true)
    try {
      const forecastData = await updateIncomePlan(incomePlan > 0 ? incomePlan : null)
      setForecast(forecastData)
      setIncomePlan(forecastData.plannedMonthlyIncome ?? 0)
      ToastService.success({ title: incomePlan > 0 ? 'Expected income saved' : 'Expected income cleared', dedupeKey: 'income-plan-saved' })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not save expected income', dedupeKey: 'income-plan-save-failed' })
    } finally {
      setSavingIncomePlan(false)
    }
  }

  const firstNegativeMonth = forecast?.months.find((item) => item.negative)
  const firstPositiveMonth = forecast?.months.find((item) => item.projectedClosingBalance > 0)
  const horizons = forecast ? [
    { label: '3 months', month: forecast.months[2] },
    { label: '6 months', month: forecast.months[5] },
    { label: '12 months', month: forecast.months[11] },
  ].filter((item): item is { label: string; month: CashFlowForecastMonth } => Boolean(item.month)) : []
  const basisCount = forecast?.projectionBasisMonths.length ?? 0
  const basisLabel = forecast?.projectionBasisMonths.map(monthLabel).join(', ')
  const variableLabel = basisCount > 0 ? `Variable (${basisCount}-mo avg)` : 'Variable'
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
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <MotionBox variants={containerV} initial="hidden" animate="show">
        <VStack align="stretch" spacing={{ base: 4, md: 5 }}>
          <MotionBox variants={riseV}>
            <PageHeader icon={CalendarClock} title="Planning" subtitle="Turn your current position into a confident plan for the months ahead." />
          </MotionBox>

          <MotionBox variants={riseV}>
            {currentMonthLoading ? <Box h="250px" borderRadius="22px" bg="var(--pb-surface-2)" /> : <PlanningHero monthlyPositive={monthlyPositive} balance={currentMonthData.balance} income={currentMonthData.income} expense={currentMonthData.expense} forecast={forecast} firstNegativeMonth={firstNegativeMonth} firstPositiveMonth={firstPositiveMonth} onOpenGoals={() => onPageChange?.('goals')} />}
          </MotionBox>

          <MotionBox variants={riseV} display="none">
            <SectionLabel>Planning signals</SectionLabel>
          </MotionBox>

          <MotionBox variants={riseV}>
            <PlanPanel eyebrow="Projection" title="Your 12-month runway" caption={forecast?.hasProjectionBasis ? `Based on recent activity from ${basisLabel}, recurring commitments, instalments and your income assumption.` : 'Add transaction history, recurring payments or instalments to make this forecast more useful.'} rightSlot={forecast?.months.length ? <HStack spacing={2}><ForecastNav label="Previous forecast month" icon={ChevronLeft} onClick={() => scrollForecast(-1)} /><ForecastNav label="Next forecast month" icon={ChevronRight} onClick={() => scrollForecast(1)} /></HStack> : undefined}>
              {forecast?.months.length ? <Box ref={forecastCarouselRef} onPointerDown={startForecastDrag} onPointerMove={moveForecastDrag} onPointerUp={stopForecastDrag} onPointerCancel={stopForecastDrag} onLostPointerCapture={() => setIsDraggingForecast(false)} display="flex" gap={3} overflowX="auto" overflowY="hidden" pb={2} cursor={isDraggingForecast ? 'grabbing' : 'grab'} scrollSnapType={isDraggingForecast ? 'none' : 'x mandatory'} userSelect={isDraggingForecast ? 'none' : 'auto'} sx={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>{(forecast?.months ?? []).map((month) => <ForecastCard key={month.month} month={month} variableLabel={variableLabel} hasIncomePlan={forecast?.hasIncomePlan ?? false} />)}</Box> : <EmptyPlan icon={TrendingUp} title="Forecast is still collecting data" body="Scheduled commitments will appear here immediately; transaction history makes estimated income and spending more accurate." />}
            </PlanPanel>
          </MotionBox>

          {horizons.length > 0 && <><MotionBox variants={riseV}><SectionLabel>Key horizons</SectionLabel></MotionBox><SimpleGrid columns={{ base: 1, md: 3 }} spacing="0.8rem">{horizons.map(({ label, month }) => <MotionBox key={label} variants={riseV}><Horizon label={label} month={month} /></MotionBox>)}</SimpleGrid></>}

          <SimpleGrid display="none" columns={{ base: 1, sm: 2, xl: 4 }} spacing="0.8rem">
            <MotionBox variants={riseV}><Signal icon={Wallet} label="Starting balance" value={forecast ? money(forecast.currentTotalBalance) : '—'} note="Across your connected accounts" /></MotionBox>
            <MotionBox variants={riseV}><Signal icon={DollarSign} label="Income assumption" value={forecast?.hasIncomePlan ? money(forecast.plannedMonthlyIncome ?? 0) : forecast ? money(forecast.averageMonthlyIncome) : '—'} note={forecast?.hasIncomePlan ? 'Your monthly target' : 'Based on transaction history'} accent="income" /></MotionBox>
            <MotionBox variants={riseV}><Signal icon={TrendingDown} label="Expense assumption" value={forecast ? money(forecast.averageMonthlyVariableExpense) : '—'} note={basisCount ? `Variable spend from the last ${basisCount} active month${basisCount !== 1 ? 's' : ''}` : 'No history available yet'} accent="expense" /></MotionBox>
            <MotionBox variants={riseV}><Signal icon={firstNegativeMonth ? AlertTriangle : CheckCircle2} label="Runway" value={firstNegativeMonth ? monthLabel(firstNegativeMonth.month) : '12 months+'} note={firstNegativeMonth ? 'First projected negative balance' : 'No negative balance forecast'} accent={firstNegativeMonth ? 'expense' : 'income'} /></MotionBox>
          </SimpleGrid>

          <MotionBox variants={riseV}>
            <SectionLabel>Build the plan</SectionLabel>
          </MotionBox>
          <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={{ base: 4, md: 5 }}>
            <MotionBox variants={riseV}>
              <PlanPanel eyebrow="01 · Income" title="Set a reliable monthly income" caption="Use a target when your expected income differs from the historical average.">
                <Flex gap={3} align="end" flexDirection={{ base: 'column', sm: 'row' }}>
                  <Box flex={1} w="full"><FieldLabel>Expected income</FieldLabel><NumberInput min={0} precision={2} value={incomePlan} onChange={(_, value) => setIncomePlan(value || 0)}><NumberInputField bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="12px" h="44px" /></NumberInput></Box>
                  <ActionButton label={incomePlan > 0 ? 'Save income' : 'Use history'} icon={DollarSign} primary={incomePlan > 0} onClick={saveIncomePlan} isLoading={savingIncomePlan} />
                </Flex>
                <PlanHint accent="brand">{forecast?.hasIncomePlan ? `Active target: ${money(forecast.plannedMonthlyIncome ?? 0)} per month.` : `Currently using an average of ${money(forecast?.averageMonthlyIncome ?? 0)} per month.`}</PlanHint>
              </PlanPanel>
            </MotionBox>

            <MotionBox variants={riseV}>
              <PlanPanel eyebrow="02 · Budget" title="Give each category a boundary" caption="Limits make it easier to decide what is safe to spend before the month is over." rightSlot={<Input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} maxW="150px" h="36px" bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="10px" />}>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}><Box><FieldLabel>Category</FieldLabel><Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Groceries" h="44px" bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="12px" /></Box><Box><FieldLabel>Monthly limit</FieldLabel><NumberInput min={0} precision={2} value={limitAmount} onChange={(_, value) => setLimitAmount(value || 0)}><NumberInputField h="44px" bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="12px" /></NumberInput></Box></SimpleGrid>
                <ActionButton label="Add category limit" icon={Plus} primary onClick={saveBudget} isLoading={saving} disabled={!category.trim() || limitAmount <= 0} />
              </PlanPanel>
            </MotionBox>
          </SimpleGrid>

          <MotionBox variants={riseV}>
            <PlanPanel eyebrow="Category limits" title={budgets.length ? `${monthLabel(selectedMonth)} budget` : 'Your category budgets'} caption={budgets.length ? `${exceededBudgets ? `${exceededBudgets} need attention` : 'Every limit is currently within range'}.` : 'Add the categories that matter most to your monthly plan.'}>
              {budgets.length ? <VStack align="stretch" spacing="0.65rem">{budgets.map((budget) => <BudgetRow key={budget.id} budget={budget} onRemove={() => removeBudget(budget)} />)}</VStack> : <EmptyPlan icon={Layers} title="No limits for this month" body="Start with your most variable category, then add more as your plan becomes clearer." />}
            </PlanPanel>
          </MotionBox>

          {false && <MotionBox variants={riseV}>
            <PlanPanel eyebrow="Projection" title="Your 12-month runway" caption={forecast?.hasProjectionBasis ? `Based on recent activity from ${basisLabel}, recurring commitments, instalments and your income assumption.` : 'Add transaction history, recurring payments or instalments to make this forecast more useful.'} rightSlot={forecast?.months.length ? <HStack spacing={2}><ForecastNav label="Previous forecast month" icon={ChevronLeft} onClick={() => scrollForecast(-1)} /><ForecastNav label="Next forecast month" icon={ChevronRight} onClick={() => scrollForecast(1)} /></HStack> : undefined}>
              {forecast?.months.length ? <Box ref={forecastCarouselRef} onPointerDown={startForecastDrag} onPointerMove={moveForecastDrag} onPointerUp={stopForecastDrag} onPointerCancel={stopForecastDrag} onLostPointerCapture={() => setIsDraggingForecast(false)} display="flex" gap={3} overflowX="auto" overflowY="hidden" pb={2} cursor={isDraggingForecast ? 'grabbing' : 'grab'} scrollSnapType={isDraggingForecast ? 'none' : 'x mandatory'} userSelect={isDraggingForecast ? 'none' : 'auto'} sx={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>{(forecast?.months ?? []).map((month) => <ForecastCard key={month.month} month={month} variableLabel={variableLabel} hasIncomePlan={forecast?.hasIncomePlan ?? false} />)}</Box> : <EmptyPlan icon={TrendingUp} title="Forecast is still collecting data" body="Scheduled commitments will appear here immediately; transaction history makes estimated income and spending more accurate." />}
            </PlanPanel>
          </MotionBox>}

          {false && horizons.length > 0 && <><MotionBox variants={riseV}><SectionLabel>Key horizons</SectionLabel></MotionBox><SimpleGrid columns={{ base: 1, md: 3 }} spacing="0.8rem">{horizons.map(({ label, month }) => <MotionBox key={month.month} variants={riseV}><Horizon label={label} month={month} /></MotionBox>)}</SimpleGrid></>}
          <MotionBox variants={riseV}><PaperFooter /></MotionBox>
        </VStack>
      </MotionBox>
    </Box>
  )
}

function PlanningHero({ monthlyPositive, balance, income, expense, forecast, firstNegativeMonth, firstPositiveMonth, onOpenGoals }: { monthlyPositive: boolean; balance: number; income: number; expense: number; forecast: CashFlowForecast | null; firstNegativeMonth: CashFlowForecastMonth | undefined; firstPositiveMonth: CashFlowForecastMonth | undefined; onOpenGoals: () => void }) {
  const projected = forecast?.months[0]?.projectedClosingBalance
  const startingNegative = (forecast?.currentTotalBalance ?? 0) < 0
  const recoveryMonth = startingNegative
    ? forecast?.months.find((month) => month.projectedClosingBalance > 0)
    : firstPositiveMonth
  const statusTitle = startingNegative
    ? recoveryMonth ? `Your balance is projected to recover in ${monthLabel(recoveryMonth.month)}.` : 'Your balance stays negative in this 12-month forecast.'
    : monthlyPositive ? 'Your income is covering this month’s plan.' : 'This month needs a recovery plan.'
  const statusBody = startingNegative
    ? recoveryMonth ? `The forecast moves from ${money(forecast?.currentTotalBalance ?? 0)} today to a positive closing balance in ${monthLabel(recoveryMonth.month)}.` : 'Review recurring costs, income assumptions and category limits to create a route back above zero.'
    : monthlyPositive ? `${money(income)} coming in against ${money(expense)} going out leaves ${money(balance)} to protect or allocate.` : `${money(expense)} in expenses is ${money(Math.abs(balance))} above income. Rebalance a limit or create a break-even target.`
  const attention = startingNegative || !monthlyPositive
  return <Box overflow="hidden" position="relative" borderRadius="22px" bg="linear-gradient(125deg, var(--pb-forest) 0%, var(--pb-forest-2) 58%, var(--pb-line) 100%)" color="#f6f8fb" boxShadow="var(--pb-shadow-lift)" p="clamp(1.25rem, 4vw, 2rem)"><Box position="absolute" w="340px" h="340px" border="1px solid rgba(255,255,255,.15)" borderRadius="full" right="-85px" top="-190px" /><Box position="absolute" w="230px" h="230px" border="1px solid rgba(255,255,255,.10)" borderRadius="full" right="90px" bottom="-175px" /><Flex position="relative" zIndex={1} direction={{ base: 'column', lg: 'row' }} justify="space-between" gap={6}><Box maxW="620px"><HStack spacing={2} mb={3}><Flex w={7} h={7} align="center" justify="center" borderRadius="full" bg={attention ? 'rgba(246,146,138,.20)' : 'rgba(95,211,148,.20)'}><Icon as={attention ? AlertTriangle : CheckCircle2} boxSize={4} weight="fill" /></Flex><Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.18em" textTransform="uppercase" opacity={0.76}>{startingNegative ? 'Recovery outlook' : monthlyPositive ? 'Month on track' : 'Attention needed'}</Text></HStack><Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={500} lineHeight="1.08" letterSpacing="-0.03em">{statusTitle}</Text><Text fontSize="sm" lineHeight="1.55" opacity={0.82} mt={3}>{statusBody}</Text>{attention && <Button mt={5} size="sm" rightIcon={<Icon as={ArrowRight} boxSize={4} />} onClick={onOpenGoals} bg="#f6f8fb" color="var(--pb-forest)" _hover={{ bg: 'white' }}>Open break-even target</Button>}</Box><SimpleGrid columns={2} spacing={{ base: 3, md: 5 }} minW={{ lg: '330px' }}><HeroMetric label="This month" value={signedMoney(balance)} /><HeroMetric label="Current balance" value={projected === undefined ? '—' : money(projected)} note="Live starting point" /><HeroMetric label="Recovery" value={startingNegative ? recoveryMonth ? monthLabel(recoveryMonth.month) : 'Not projected' : 'Already positive'} note={startingNegative ? 'First positive closing balance' : undefined} /><HeroMetric label="Runway" value={firstNegativeMonth ? monthLabel(firstNegativeMonth.month) : '12 months+'} note={firstNegativeMonth ? 'First negative month' : 'Plan remains positive'} /></SimpleGrid></Flex></Box>
}

function HeroMetric({ label, value, note }: { label: string; value: string; note?: string }) { return <Box><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.14em" textTransform="uppercase" opacity={0.68}>{label}</Text><Text className="num" fontSize={{ base: 'lg', md: 'xl' }} fontWeight={500} mt="2px" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Text>{note && <Text fontSize="10px" opacity={0.68} mt="2px">{note}</Text>}</Box> }

function Signal({ icon: IconComp, label, value, note, accent = 'brand' }: { icon: typeof Wallet; label: string; value: string; note: string; accent?: 'brand' | 'income' | 'expense' }) {
  const colour = accent === 'income' ? 'var(--pb-income)' : accent === 'expense' ? 'var(--pb-coral)' : 'var(--pb-forest-2)'
  const tint = accent === 'income' ? 'var(--pb-tint-income)' : accent === 'expense' ? 'var(--pb-tint-coral)' : 'var(--pb-tint-green)'
  return <Box h="full" p={4} borderRadius="16px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="0 1px 2px rgba(15,23,42,.04)"><Flex align="center" justify="space-between" mb={4}><Flex w={9} h={9} align="center" justify="center" borderRadius="12px" bg={tint} color={colour}><IconComp size={18} weight="duotone" color={colour} /></Flex></Flex><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.14em" textTransform="uppercase" color="var(--pb-ink-faint)">{label}</Text><Text className="num" fontSize="lg" fontWeight={500} color="var(--pb-ink)" mt="3px" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Text><Text fontSize="xs" color="var(--pb-ink-soft)" mt="3px">{note}</Text></Box>
}

function SectionLabel({ children }: { children: ReactNode }) { return <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)" pl="0.15rem">{children}</Text> }

function PlanPanel({ eyebrow, title, caption, rightSlot, children }: { eyebrow: string; title: string; caption: string; rightSlot?: ReactNode; children: ReactNode }) { return <Box h="full" p={{ base: 4, md: 5 }} borderRadius="22px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="var(--pb-shadow)"><Flex justify="space-between" align="start" gap={3} mb={5}><Box><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.16em" textTransform="uppercase" color="var(--pb-forest-2)">{eyebrow}</Text><Text fontSize="lg" fontWeight={600} letterSpacing="-0.015em" color="var(--pb-ink)" mt="3px">{title}</Text><Text fontSize="sm" color="var(--pb-ink-soft)" lineHeight="1.45" mt="3px">{caption}</Text></Box>{rightSlot}</Flex><VStack align="stretch" spacing={4}>{children}</VStack></Box> }

function FieldLabel({ children }: { children: ReactNode }) { return <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.13em" textTransform="uppercase" color="var(--pb-ink-faint)" mb={1.5}>{children}</Text> }

function ActionButton({ label, icon, primary, onClick, isLoading, disabled }: { label: string; icon: typeof Plus; primary?: boolean; onClick: () => void; isLoading?: boolean; disabled?: boolean }) { return <Button leftIcon={<Icon as={icon} boxSize={4} />} onClick={onClick} isLoading={isLoading} isDisabled={disabled} h="44px" px={4} borderRadius="12px" fontWeight={500} color={primary ? '#f6f8fb' : 'var(--pb-ink-soft)'} bg={primary ? 'var(--pb-forest-2)' : 'var(--pb-surface-2)'} border="1px solid" borderColor={primary ? 'transparent' : 'var(--pb-hair)'} _hover={{ bg: primary ? 'var(--pb-forest)' : 'var(--pb-surface-3)' }}>{label}</Button> }

function PlanHint({ accent, children }: { accent: 'brand' | 'income'; children: ReactNode }) { return <Box px={3} py={2.5} borderRadius="10px" bg={accent === 'income' ? 'var(--pb-tint-income)' : 'var(--pb-tint-green)'}><Text fontSize="xs" color="var(--pb-ink-soft)">{children}</Text></Box> }

function BudgetRow({ budget, onRemove }: { budget: CategoryBudget; onRemove: () => void }) { const colour = budget.exceeded ? 'var(--pb-coral-2)' : budget.percentageUsed >= 80 ? 'var(--pb-gold-2)' : 'var(--pb-income-2)'; return <Box p={3.5} borderRadius="14px" bg="var(--pb-surface-2)" border="1px solid" borderColor={budget.exceeded ? 'var(--pb-tint-coral)' : 'var(--pb-hair)'}><Flex justify="space-between" align="start" gap={3}><Box minW={0}><Text fontWeight={600} color="var(--pb-ink)">{budget.category}</Text><Text fontSize="xs" color="var(--pb-ink-soft)" mt="2px">{money(budget.spentAmount)} of {money(budget.limitAmount)}</Text></Box><HStack spacing={2}><Text fontFamily="var(--pb-mono)" fontSize="10px" color={budget.exceeded ? 'var(--pb-coral)' : 'var(--pb-ink-soft)'}>{budget.percentageUsed.toFixed(0)}%</Text><Button size="xs" variant="ghost" color="var(--pb-coral)" onClick={onRemove}>Remove</Button></HStack></Flex><Box h="6px" mt={3} bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden"><Box h="full" w={`${Math.min(100, budget.percentageUsed)}%`} bg={colour} borderRadius="full" /></Box>{budget.exceeded && <Text fontSize="xs" color="var(--pb-coral)" mt={2}>Over limit by {money(Math.abs(budget.remainingAmount))}</Text>}</Box> }

function EmptyPlan({ icon, title, body }: { icon: typeof Layers; title: string; body: string }) { return <Flex direction="column" align="center" textAlign="center" py={8} px={4} border="1px dashed var(--pb-hair-2)" borderRadius="15px"><Flex w={11} h={11} align="center" justify="center" borderRadius="12px" bg="var(--pb-surface-2)" color="var(--pb-ink-faint)" mb={3}><Icon as={icon} boxSize={5} weight="duotone" /></Flex><Text fontWeight={600} color="var(--pb-ink)">{title}</Text><Text fontSize="sm" color="var(--pb-ink-soft)" maxW="430px" mt={1}>{body}</Text></Flex> }

function ForecastNav({ label, icon, onClick }: { label: string; icon: typeof ChevronLeft; onClick: () => void }) { return <IconButton aria-label={label} icon={<Icon as={icon} boxSize={4} />} size="sm" variant="ghost" borderRadius="10px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" color="var(--pb-ink-soft)" onClick={onClick} _hover={{ bg: 'var(--pb-surface-3)', color: 'var(--pb-ink)' }} /> }

function ForecastCard({ month, variableLabel, hasIncomePlan }: { month: CashFlowForecastMonth; variableLabel: string; hasIncomePlan: boolean }) { const confidence = month.confidencePercent; const current = month.month === monthValue(new Date()); const colour = month.negative ? 'var(--pb-coral)' : 'var(--pb-ink)'; return <Box data-forecast-card flex={{ base: '0 0 88%', sm: '0 0 62%', lg: '0 0 calc(33.333% - 8px)' }} minW={0} p={4} borderRadius="16px" scrollSnapAlign="start" bg={current ? 'var(--pb-tint-green)' : 'var(--pb-surface-2)'} border="1px solid" borderColor={month.negative ? 'var(--pb-tint-coral)' : current ? 'var(--pb-hair-2)' : 'var(--pb-hair)'}><Flex justify="space-between" align="start" gap={3}><Box><Text fontWeight={600} color="var(--pb-ink)">{monthLabel(month.month)}</Text><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-ink-faint)" mt="4px">{current ? 'Live starting point' : `${confidence}% committed`}</Text></Box><Box textAlign="right"><Text className="num" fontSize="lg" fontWeight={600} color={colour} style={{ fontVariantNumeric: 'tabular-nums' }}>{money(month.projectedClosingBalance)}</Text>{!current && <Text fontSize="xs" color={month.netCashFlow >= 0 ? 'var(--pb-income)' : 'var(--pb-coral)'} mt="2px">{signedMoney(month.netCashFlow)} net</Text>}</Box></Flex>{current ? <Box mt={4} px={3} py={2.5} borderRadius="10px" bg="var(--pb-surface)"><Text fontSize="xs" color="var(--pb-ink-soft)">This is your live account balance today. Future cards apply recurring costs, instalments and estimated activity from here.</Text></Box> : <><SimpleGrid columns={2} spacing={3} mt={4}><Box><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-ink-faint)">Income</Text><Text fontSize="sm" fontWeight={600} color="var(--pb-income)" mt="2px">{money(month.fixedIncome + month.estimatedIncome)}</Text><Text fontSize="10px" color="var(--pb-ink-soft)" mt="2px">Recurring + {hasIncomePlan ? 'planned' : 'estimated'}</Text></Box><Box><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-ink-faint)">Outgoings</Text><Text fontSize="sm" fontWeight={600} color="var(--pb-coral)" mt="2px">{money(month.installmentExpense + month.fixedExpense + month.estimatedVariableExpense)}</Text><Text fontSize="10px" color="var(--pb-ink-soft)" mt="2px">Recurring + {variableLabel}</Text></Box></SimpleGrid><Box h="5px" mt={4} bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden"><Box h="full" w={`${confidence}%`} bg={confidence >= 66 ? 'var(--pb-income-2)' : confidence >= 33 ? 'var(--pb-gold-2)' : 'var(--pb-ink-faint)'} borderRadius="full" /></Box></>}</Box> }

function Horizon({ label, month }: { label: string; month: CashFlowForecastMonth }) { return <Box p={4} borderRadius="16px" bg="var(--pb-surface)" border="1px solid" borderColor={month.negative ? 'var(--pb-tint-coral)' : 'var(--pb-hair)'} boxShadow="0 1px 2px rgba(15,23,42,.04)"><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.14em" textTransform="uppercase" color="var(--pb-ink-faint)">{label}</Text><Text className="num" fontSize="xl" fontWeight={500} color={month.negative ? 'var(--pb-coral)' : 'var(--pb-ink)'} mt="4px" style={{ fontVariantNumeric: 'tabular-nums' }}>{money(month.projectedClosingBalance)}</Text><Text fontSize="xs" color="var(--pb-ink-soft)" mt="3px">End of {monthLabel(month.month)}</Text></Box> }
