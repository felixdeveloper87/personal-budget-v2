import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Box, Button, Collapse, Flex, HStack, Icon, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'

import { listInstallmentPlans, listRecurringTransactions } from '../api'
import type { InstallmentPlan, RecurringTransaction } from '../types'
import type { AppPage } from '../components/layout/header/navigation.config'
import InstallmentPlanCard, { isInstallmentPlanCompleted } from '../components/installments/InstallmentPlanCard'
import RecurringTransactionCard from '../components/recurring/RecurringTransactionCard'
import { PageHeader } from '../components/ui'
import { CalendarClock, CheckCircle2, ChevronDown, ChevronUp, CreditCard, DollarSign, Plus, Repeat, TrendingDown, TrendingUp, Wallet } from '../components/ui/icons'
import { ToastService } from '../services/toast'

import '../features/dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../features/dashboard/components/motion'
import PaperFooter from '../features/dashboard/components/PaperFooter'

interface InstallmentsPageProps {
  onPageChange?: (page: AppPage) => void
}

const money = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

export default function InstallmentsPage({ onPageChange }: InstallmentsPageProps) {
  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [recurringItems, setRecurringItems] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activePlansOpen, setActivePlansOpen] = useState(true)
  const [fixedOpen, setFixedOpen] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [planItems, recurring] = await Promise.all([listInstallmentPlans(), listRecurringTransactions()])
      setPlans(planItems)
      setRecurringItems(recurring)
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not load commitments', dedupeKey: 'commitments-page-load-failed' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const summary = useMemo(() => {
    const activePlans = plans.filter((plan) => !isInstallmentPlanCompleted(plan))
    const completedPlans = plans.filter(isInstallmentPlanCompleted)
    const now = Date.now()
    const remaining = activePlans.reduce((sum, plan) => sum + plan.transactions.filter((item) => new Date(item.date).getTime() >= now).reduce((total, item) => total + item.amount, 0), 0)
    const installmentMonthly = activePlans.reduce((sum, plan) => sum + plan.installmentValue, 0)

    const activeFixed = recurringItems.filter((item) => item.active).sort((a, b) => b.amount - a.amount)
    const stoppedFixed = recurringItems.filter((item) => !item.active).sort((a, b) => a.description.localeCompare(b.description))
    const fixedIncome = activeFixed.filter((item) => item.type === 'INCOME').reduce((sum, item) => sum + item.amount, 0)
    const fixedExpenses = activeFixed.filter((item) => item.type === 'EXPENSE').reduce((sum, item) => sum + item.amount, 0)

    return { activePlans, completedPlans, remaining, installmentMonthly, activeFixed, stoppedFixed, fixedIncome, fixedExpenses, monthlyNet: fixedIncome - fixedExpenses - installmentMonthly }
  }, [plans, recurringItems])

  return (
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <MotionBox variants={containerV} initial="hidden" animate="show">
        <VStack align="stretch" spacing={{ base: 4, md: 5 }}>
          <MotionBox variants={riseV}>
            <PageHeader
              icon={CalendarClock}
              title="Commitments"
              subtitle="Keep instalments and fixed payments together in one monthly view."
              rightSlot={<ActionButton label="Add from Home" icon={Plus} primary onClick={() => onPageChange?.('dashboard')} />}
            />
          </MotionBox>

          {loading ? <Flex justify="center" py={20}><Spinner color="var(--pb-forest-2)" /></Flex> : <>
            <MotionBox variants={riseV}><CommitmentsHero summary={summary} /></MotionBox>

            <MotionBox variants={riseV}><SectionLabel>Monthly commitments</SectionLabel></MotionBox>
            <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing="0.8rem">
              <MotionBox variants={riseV}><Metric icon={CreditCard} label="Instalments" value={money(summary.installmentMonthly)} note={`${summary.activePlans.length} active plan${summary.activePlans.length !== 1 ? 's' : ''}`} /></MotionBox>
              <MotionBox variants={riseV}><Metric icon={TrendingDown} label="Fixed expenses" value={money(summary.fixedExpenses)} note={`${summary.activeFixed.filter((item) => item.type === 'EXPENSE').length} active rule${summary.activeFixed.filter((item) => item.type === 'EXPENSE').length !== 1 ? 's' : ''}`} accent="expense" /></MotionBox>
              <MotionBox variants={riseV}><Metric icon={TrendingUp} label="Fixed income" value={money(summary.fixedIncome)} note="Recurring monthly income" accent="income" /></MotionBox>
              <MotionBox variants={riseV}><Metric icon={Wallet} label="Monthly net" value={money(summary.monthlyNet)} note="Income less committed outgoings" accent={summary.monthlyNet < 0 ? 'expense' : 'brand'} /></MotionBox>
            </SimpleGrid>

            <MotionBox variants={riseV}>
              <CommitmentPanel icon={CreditCard} title="Active instalments" caption={`${summary.activePlans.length} purchase plan${summary.activePlans.length !== 1 ? 's' : ''} still in progress`} open={activePlansOpen} onToggle={() => setActivePlansOpen((value) => !value)}>
                {summary.activePlans.length ? <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="0.9rem">{summary.activePlans.map((plan) => <InstallmentPlanCard key={plan.id} plan={plan} onDeleted={load} variant="active" />)}</SimpleGrid> : <EmptyState icon={CreditCard} title="No active instalments" body="New plans created from a transaction will appear here with their remaining payments." />}
              </CommitmentPanel>
            </MotionBox>

            <MotionBox variants={riseV}>
              <CommitmentPanel icon={Repeat} title="Fixed payments & income" caption={`${summary.activeFixed.length} active recurring rule${summary.activeFixed.length !== 1 ? 's' : ''}`} open={fixedOpen} onToggle={() => setFixedOpen((value) => !value)}>
                {summary.activeFixed.length ? <SimpleGrid columns={{ base: 1, md: 2 }} spacing="0.9rem">{summary.activeFixed.map((item) => <RecurringTransactionCard key={item.id} recurringTransaction={item} onChanged={load} />)}</SimpleGrid> : <EmptyState icon={Repeat} title="No fixed payments" body="Create a recurring transaction from Home to add bills, subscriptions, rent or a regular income." />}
              </CommitmentPanel>
            </MotionBox>

            {(summary.completedPlans.length > 0 || summary.stoppedFixed.length > 0) && <MotionBox variants={riseV}>
              <CommitmentPanel icon={CheckCircle2} title="History" caption={`${summary.completedPlans.length} completed plan${summary.completedPlans.length !== 1 ? 's' : ''} · ${summary.stoppedFixed.length} stopped rule${summary.stoppedFixed.length !== 1 ? 's' : ''}`} open={historyOpen} onToggle={() => setHistoryOpen((value) => !value)} muted>
                <VStack align="stretch" spacing={5}>
                  {summary.completedPlans.length > 0 && <Box><SectionLabel>Completed instalments</SectionLabel><SimpleGrid mt={3} columns={{ base: 1, md: 2, xl: 3 }} spacing="0.9rem">{summary.completedPlans.map((plan) => <InstallmentPlanCard key={plan.id} plan={plan} onDeleted={load} variant="past" />)}</SimpleGrid></Box>}
                  {summary.stoppedFixed.length > 0 && <Box><SectionLabel>Stopped fixed payments</SectionLabel><SimpleGrid mt={3} columns={{ base: 1, md: 2 }} spacing="0.9rem">{summary.stoppedFixed.map((item) => <RecurringTransactionCard key={item.id} recurringTransaction={item} onChanged={load} />)}</SimpleGrid></Box>}
                </VStack>
              </CommitmentPanel>
            </MotionBox>}
          </>}

          <MotionBox variants={riseV}><PaperFooter /></MotionBox>
        </VStack>
      </MotionBox>
    </Box>
  )
}

function CommitmentsHero({ summary }: { summary: { installmentMonthly: number; fixedExpenses: number; fixedIncome: number; monthlyNet: number; remaining: number } }) {
  const outgoings = summary.installmentMonthly + summary.fixedExpenses
  return <Box overflow="hidden" position="relative" borderRadius="22px" bg="linear-gradient(125deg, var(--pb-forest) 0%, var(--pb-forest-2) 58%, var(--pb-line) 100%)" color="#f6f8fb" boxShadow="var(--pb-shadow-lift)" p="clamp(1.25rem, 4vw, 2rem)"><Box position="absolute" w="310px" h="310px" border="1px solid rgba(255,255,255,.15)" borderRadius="full" right="-70px" top="-175px" /><Flex position="relative" zIndex={1} direction={{ base: 'column', lg: 'row' }} justify="space-between" gap={6}><Box maxW="580px"><Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.18em" textTransform="uppercase" opacity={0.76}>Monthly commitment load</Text><Text className="num" fontSize={{ base: '2.4rem', md: '3.25rem' }} fontWeight={500} lineHeight="1" letterSpacing="-0.035em" mt={2} style={{ fontVariantNumeric: 'tabular-nums' }}>{money(outgoings)}</Text><Text fontSize="sm" opacity={0.82} mt={3}>Instalments and fixed expenses that your monthly plan needs to cover.</Text></Box><SimpleGrid columns={2} spacing={{ base: 3, md: 5 }} minW={{ lg: '310px' }}><HeroMetric label="Fixed income" value={money(summary.fixedIncome)} /><HeroMetric label="Monthly net" value={money(summary.monthlyNet)} /><HeroMetric label="Instalments left" value={money(summary.remaining)} /><HeroMetric label="Fixed expenses" value={money(summary.fixedExpenses)} /></SimpleGrid></Flex></Box>
}

function HeroMetric({ label, value }: { label: string; value: string }) { return <Box><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.14em" textTransform="uppercase" opacity={0.68}>{label}</Text><Text className="num" fontSize={{ base: 'lg', md: 'xl' }} fontWeight={500} mt="2px" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Text></Box> }
function SectionLabel({ children }: { children: ReactNode }) { return <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)" pl="0.15rem">{children}</Text> }

function Metric({ icon, label, value, note, accent = 'brand' }: { icon: typeof Wallet; label: string; value: string; note: string; accent?: 'brand' | 'income' | 'expense' }) { const colour = accent === 'income' ? 'var(--pb-income)' : accent === 'expense' ? 'var(--pb-coral)' : 'var(--pb-forest-2)'; const tint = accent === 'income' ? 'var(--pb-tint-income)' : accent === 'expense' ? 'var(--pb-tint-coral)' : 'var(--pb-tint-green)'; return <Box h="full" p={4} borderRadius="16px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="0 1px 2px rgba(15,23,42,.04)"><Flex w={9} h={9} align="center" justify="center" borderRadius="12px" bg={tint} color={colour} mb={4}><Icon as={icon} boxSize={4.5} weight="duotone" /></Flex><Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.14em" textTransform="uppercase" color="var(--pb-ink-faint)">{label}</Text><Text className="num" fontSize="lg" fontWeight={500} color="var(--pb-ink)" mt="3px" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Text><Text fontSize="xs" color="var(--pb-ink-soft)" mt="3px">{note}</Text></Box> }

function CommitmentPanel({ icon, title, caption, open, onToggle, muted, children }: { icon: typeof CreditCard; title: string; caption: string; open: boolean; onToggle: () => void; muted?: boolean; children: ReactNode }) { return <Box p={{ base: 4, md: 5 }} borderRadius="22px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="var(--pb-shadow)" opacity={muted ? 0.86 : 1}><Box as="button" type="button" onClick={onToggle} w="full" textAlign="left" aria-expanded={open} _focusVisible={{ outline: '2px solid var(--pb-forest-2)', outlineOffset: '3px', borderRadius: '12px' }}><Flex justify="space-between" align="center" gap={3}><HStack spacing={3}><Flex w={10} h={10} align="center" justify="center" borderRadius="13px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" color="var(--pb-forest-2)"><Icon as={icon} boxSize={5} weight="duotone" /></Flex><Box><Text fontSize="lg" fontWeight={600} color="var(--pb-ink)">{title}</Text><Text fontSize="sm" color="var(--pb-ink-soft)">{caption}</Text></Box></HStack><Icon as={open ? ChevronUp : ChevronDown} boxSize={5} color="var(--pb-ink-faint)" /></Flex></Box><Collapse in={open} animateOpacity><Box mt={5}>{children}</Box></Collapse></Box> }

function EmptyState({ icon, title, body }: { icon: typeof CreditCard; title: string; body: string }) { return <Flex direction="column" align="center" textAlign="center" py={9} px={4} border="1px dashed var(--pb-hair-2)" borderRadius="15px"><Flex w={11} h={11} align="center" justify="center" borderRadius="12px" bg="var(--pb-surface-2)" color="var(--pb-ink-faint)" mb={3}><Icon as={icon} boxSize={5} weight="duotone" /></Flex><Text fontWeight={600} color="var(--pb-ink)">{title}</Text><Text fontSize="sm" color="var(--pb-ink-soft)" maxW="430px" mt={1}>{body}</Text></Flex> }

function ActionButton({ label, icon, primary, onClick }: { label: string; icon: typeof Plus; primary?: boolean; onClick: () => void }) { return <Button leftIcon={<Icon as={icon} boxSize={4} />} onClick={onClick} h="44px" px={4} borderRadius="12px" fontWeight={500} color={primary ? '#f6f8fb' : 'var(--pb-ink-soft)'} bg={primary ? 'var(--pb-forest-2)' : 'var(--pb-surface-2)'} border="1px solid" borderColor={primary ? 'transparent' : 'var(--pb-hair)'} _hover={{ bg: primary ? 'var(--pb-forest)' : 'var(--pb-surface-3)' }}>{label}</Button> }
