import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from 'react'
import { Box, Button, Collapse, Flex, HStack, Icon, IconButton, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'

import { listInstallmentPlans } from '../api'
import type { InstallmentPlan } from '../types'
import type { AppPage } from '../components/layout/header/navigation.config'
import InstallmentPlanCard, { isInstallmentPlanCompleted } from '../components/installments/InstallmentPlanCard'
import InstallmentPlanDrawer from '../components/installments/InstallmentPlanDrawer'
import { PageHeader } from '../components/ui'
import { CalendarClock, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CreditCard, Plus } from '../components/ui/icons'
import { ToastService } from '../services/toast'

import '../features/dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../features/dashboard/components/motion'
import PaperFooter from '../features/dashboard/components/PaperFooter'

interface InstallmentsPageProps {
  onPageChange?: (page: AppPage) => void
}

const money = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
const monthName = (date: Date) => date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })

export default function InstallmentsPage({ onPageChange }: InstallmentsPageProps) {
  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeOpen, setActiveOpen] = useState(true)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan | null>(null)
  const outlookRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setPlans(await listInstallmentPlans())
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not load installment plans', dedupeKey: 'installments-page-load-failed' })
    } finally {
      setLoading(false)
    }
  }, [])

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
    const monthly = active.reduce((sum, plan) => sum + plan.installmentValue, 0)
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const nextSixMonths = Array.from({ length: 6 }, (_, offset) => {
      const date = new Date(today.getFullYear(), today.getMonth() + offset, 1)
      const total = active.reduce((sum, plan) => sum + plan.transactions.reduce((planTotal, installment) => {
        const paymentDate = new Date(`${installment.date}T00:00:00`)
        const sameMonth = paymentDate.getFullYear() === date.getFullYear() && paymentDate.getMonth() === date.getMonth()
        return sameMonth && paymentDate >= startOfToday ? planTotal + installment.amount : planTotal
      }, 0), 0)
      return { date, total }
    })
    return { active, completed, remaining, paid, monthly, nextSixMonths }
  }, [plans])

  const scrollOutlook = (direction: -1 | 1) => {
    const carousel = outlookRef.current
    if (!carousel) return
    const card = carousel.querySelector<HTMLElement>('[data-installment-month]')
    carousel.scrollBy({ left: direction * ((card?.offsetWidth ?? carousel.clientWidth * 0.8) + 12), behavior: 'smooth' })
  }

  return (
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 3, md: 5 }}>
      <MotionBox variants={containerV} initial="hidden" animate="show">
        <VStack align="stretch" spacing={{ base: 3, md: 3.5 }}>
          <MotionBox variants={riseV}>
            <PageHeader
              icon={CreditCard}
              title="Installments"
              subtitle="Track every purchase plan, remaining payment and completed agreement."
            />
          </MotionBox>

          {loading ? <Flex justify="center" py={20}><Spinner color="var(--pb-forest-2)" /></Flex> : <>
            <MotionBox variants={riseV}><InstallmentsHero summary={summary} /></MotionBox>
            <MotionBox variants={riseV}>
              <InstallmentOutlook months={summary.nextSixMonths} carouselRef={outlookRef} onNavigate={scrollOutlook} />
            </MotionBox>
            <MotionBox variants={riseV}>
              <InstallmentPanel title="Active plans" caption={`${summary.active.length} installment plan${summary.active.length !== 1 ? 's' : ''} currently reducing your available monthly budget`} open={activeOpen} onToggle={() => setActiveOpen((value) => !value)}>
                {summary.active.length ? <VStack align="stretch" spacing="0.6rem">{summary.active.map((plan) => <InstallmentPlanCard key={plan.id} plan={plan} onOpen={setSelectedPlan} variant="active" />)}</VStack> : <EmptyState title="No active installments" body="New plans created from a transaction will appear here with their remaining payments." />}
              </InstallmentPanel>
            </MotionBox>

            {summary.completed.length > 0 && <MotionBox variants={riseV}>
              <InstallmentPanel title="Completed plans" caption={`${summary.completed.length} plan${summary.completed.length !== 1 ? 's' : ''} kept for reference`} open={historyOpen} onToggle={() => setHistoryOpen((value) => !value)} muted>
                <VStack align="stretch" spacing="0.6rem">{summary.completed.map((plan) => <InstallmentPlanCard key={plan.id} plan={plan} onOpen={setSelectedPlan} variant="past" />)}</VStack>
              </InstallmentPanel>
            </MotionBox>}
          </>}

          <MotionBox variants={riseV}><PaperFooter /></MotionBox>
        </VStack>
      </MotionBox>

      <InstallmentPlanDrawer plan={selectedPlan} onClose={() => setSelectedPlan(null)} onChanged={load} />
    </Box>
  )
}

function InstallmentsHero({ summary }: { summary: { active: InstallmentPlan[]; remaining: number; paid: number; monthly: number } }) {
  return <Box overflow="hidden" position="relative" borderRadius="14px" bg="radial-gradient(120% 150% at 88% -30%, rgba(96,165,250,0.20) 0%, transparent 52%), linear-gradient(135deg, #0b1a31 0%, #14253f 55%, #1c2f4c 100%)" color="#eef2f8" boxShadow="var(--pb-shadow-lift)" border="1px solid rgba(255,255,255,0.07)" px="clamp(1rem, 2.4vw, 1.4rem)" py="clamp(0.65rem, 1.5vw, 0.95rem)"><Box position="absolute" w="180px" h="180px" border="1px solid rgba(255,255,255,.09)" borderRadius="full" right="-55px" top="-105px" /><Flex position="relative" zIndex={1} direction={{ base: 'column', lg: 'row' }} justify="space-between" gap={3} align={{ lg: 'center' }}><HStack spacing={3} align="baseline"><Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.16em" textTransform="uppercase" opacity={0.76} whiteSpace="nowrap">Monthly load</Text><Text className="num" fontSize={{ base: '1.5rem', md: '1.85rem' }} fontWeight={500} lineHeight="1" letterSpacing="-0.035em" style={{ fontVariantNumeric: 'tabular-nums' }}>{money(summary.monthly)}</Text></HStack><SimpleGrid columns={{ base: 2, lg: 4 }} spacing={{ base: 2, md: 3.5 }} minW={{ lg: '380px' }}><HeroMetric label="Active plans" value={String(summary.active.length)} /><HeroMetric label="Still to pay" value={money(summary.remaining)} /><HeroMetric label="Already paid" value={money(summary.paid)} /><HeroMetric label="Average plan" value={summary.active.length ? money(summary.remaining / summary.active.length) : '—'} /></SimpleGrid></Flex></Box>
}

function InstallmentOutlook({ months, carouselRef, onNavigate }: { months: Array<{ date: Date; total: number }>; carouselRef: RefObject<HTMLDivElement>; onNavigate: (direction: -1 | 1) => void }) {
  const highest = Math.max(...months.map((month) => month.total), 1)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, scrollLeft: 0 })
  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !carouselRef.current) return
    dragRef.current = { startX: event.clientX, scrollLeft: carouselRef.current.scrollLeft }
    setIsDragging(true)
    carouselRef.current.setPointerCapture(event.pointerId)
  }
  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || event.pointerType !== 'mouse' || !carouselRef.current) return
    event.preventDefault()
    carouselRef.current.scrollLeft = dragRef.current.scrollLeft - (event.clientX - dragRef.current.startX)
  }
  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    if (carouselRef.current?.hasPointerCapture(event.pointerId)) carouselRef.current.releasePointerCapture(event.pointerId)
    setIsDragging(false)
  }
  return <Box p={{ base: 2.5, md: 3 }} borderRadius="14px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="var(--pb-shadow)"><Flex justify="space-between" align="center" gap={3} mb={2.5}><HStack spacing={2.5} align="baseline" minW={0}><Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.16em" textTransform="uppercase" color="var(--pb-forest-2)" whiteSpace="nowrap">Outlook</Text><Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>Your next six months</Text></HStack><HStack spacing={1.5} flexShrink={0}><OutlookNav label="Previous month" icon={ChevronLeft} onClick={() => onNavigate(-1)} /><OutlookNav label="Next month" icon={ChevronRight} onClick={() => onNavigate(1)} /></HStack></Flex><Box ref={carouselRef} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag} onLostPointerCapture={() => setIsDragging(false)} display="flex" gap={2} overflowX="auto" pb={1} cursor={isDragging ? 'grabbing' : 'grab'} userSelect={isDragging ? 'none' : 'auto'} scrollSnapType={isDragging ? 'none' : 'x mandatory'} sx={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>{months.map((month, index) => <Box key={month.date.toISOString()} data-installment-month flex={{ base: '0 0 46%', sm: '0 0 calc(33.333% - 6px)', lg: '0 0 calc(25% - 6px)' }} px={2.5} py={2} borderRadius="11px" bg={index === 0 ? 'var(--pb-tint-green)' : 'var(--pb-surface-2)'} border="1px solid" borderColor={index === 0 ? 'var(--pb-hair-2)' : 'var(--pb-hair)'} scrollSnapAlign="start"><Flex justify="space-between" align="baseline" gap={2}><Text fontFamily="var(--pb-mono)" fontSize="8px" letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)" noOfLines={1}>{index === 0 ? 'This month' : monthName(month.date)}</Text><Text className="num" fontSize="sm" fontWeight={600} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>{money(month.total)}</Text></Flex><Box h="3px" mt={1.5} bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden"><Box h="full" w={`${Math.max(4, (month.total / highest) * 100)}%`} bg="var(--pb-forest-2)" borderRadius="full" /></Box></Box>)}</Box></Box>
}

function OutlookNav({ label, icon, onClick }: { label: string; icon: typeof ChevronLeft; onClick: () => void }) { return <IconButton aria-label={label} icon={<Icon as={icon} boxSize={4} />} size="sm" variant="ghost" borderRadius="10px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" color="var(--pb-ink-soft)" onClick={onClick} _hover={{ bg: 'var(--pb-surface-3)', color: 'var(--pb-ink)' }} /> }

function HeroMetric({ label, value }: { label: string; value: string }) { return <Box><Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.14em" textTransform="uppercase" opacity={0.68}>{label}</Text><Text className="num" fontSize={{ base: 'md', md: 'lg' }} fontWeight={500} mt="1px" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Text></Box> }

function InstallmentPanel({ title, caption, open, onToggle, muted, children }: { title: string; caption: string; open: boolean; onToggle: () => void; muted?: boolean; children: ReactNode }) { return <Box p={{ base: 3, md: 3.5 }} borderRadius="16px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="var(--pb-shadow)" opacity={muted ? 0.86 : 1}><Box as="button" type="button" onClick={onToggle} w="full" textAlign="left" aria-expanded={open} _focusVisible={{ outline: '2px solid var(--pb-forest-2)', outlineOffset: '3px', borderRadius: '12px' }}><Flex justify="space-between" align="center" gap={3}><HStack spacing={2.5}><Flex w={8} h={8} align="center" justify="center" borderRadius="10px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" color="var(--pb-forest-2)"><Icon as={muted ? CheckCircle2 : CreditCard} boxSize={4} weight="duotone" /></Flex><Box><Text fontSize="md" fontWeight={600} color="var(--pb-ink)" lineHeight="1.2">{title}</Text><Text fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>{caption}</Text></Box></HStack><Icon as={open ? ChevronUp : ChevronDown} boxSize={5} color="var(--pb-ink-faint)" /></Flex></Box><Collapse in={open} animateOpacity><Box mt={3.5}>{children}</Box></Collapse></Box> }

function EmptyState({ title, body }: { title: string; body: string }) { return <Flex direction="column" align="center" textAlign="center" py={9} px={4} border="1px dashed var(--pb-hair-2)" borderRadius="15px"><Flex w={11} h={11} align="center" justify="center" borderRadius="12px" bg="var(--pb-surface-2)" color="var(--pb-ink-faint)" mb={3}><Icon as={CreditCard} boxSize={5} weight="duotone" /></Flex><Text fontWeight={600} color="var(--pb-ink)">{title}</Text><Text fontSize="sm" color="var(--pb-ink-soft)" maxW="430px" mt={1}>{body}</Text></Flex> }
function ActionButton({ label, icon, primary, onClick }: { label: string; icon: typeof Plus; primary?: boolean; onClick: () => void }) { return <Button leftIcon={<Icon as={icon} boxSize={4} />} onClick={onClick} h="44px" px={4} borderRadius="12px" fontWeight={500} color={primary ? '#f6f8fb' : 'var(--pb-ink-soft)'} bg={primary ? 'var(--pb-forest-2)' : 'var(--pb-surface-2)'} border="1px solid" borderColor={primary ? 'transparent' : 'var(--pb-hair)'} _hover={{ bg: primary ? 'var(--pb-forest)' : 'var(--pb-surface-3)' }}>{label}</Button> }
