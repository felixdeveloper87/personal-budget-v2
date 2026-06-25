import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { listRecurringTransactions } from '../api'
import type { RecurringTransaction } from '../types'
import type { AppPage } from '../components/layout/header/navigation.config'
import RecurringTransactionDrawer from '../components/recurring/RecurringTransactionDrawer'
import { PageHeader } from '../components/ui'
import {
  CalendarClock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from '../components/ui/icons'
import { ToastService } from '../services/toast'

import '../features/dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../features/dashboard/components/motion'

interface FixedPaymentsPageProps {
  onPageChange?: (page: AppPage) => void
  embedded?: boolean
  onDataChange?: () => void
}

const money = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

function formatDate(value?: string) {
  if (!value) return 'Not scheduled'
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function FixedPaymentsPage({
  embedded = false,
  onDataChange,
}: FixedPaymentsPageProps) {
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
        title: 'Could not load fixed payments',
        dedupeKey: 'fixed-payments-page-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [onDataChange])

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
    active.sort((a, b) => b.amount - a.amount)
    cancelled.sort((a, b) => a.description.localeCompare(b.description))
    return { active, cancelled, income, expenses, net: income - expenses }
  }, [items])

  const body = (
    <>
      <MotionBox variants={containerV} initial="hidden" animate="show">
        <VStack align="stretch" spacing={{ base: 3, md: 3.5 }}>
          {!embedded && (
            <MotionBox variants={riseV}>
              <PageHeader
                icon={CalendarClock}
                title="Fixed payments & incomes"
                subtitle="Manage predictable monthly bills, subscriptions and income."
              />
            </MotionBox>
          )}

          {loading ? (
            <Flex justify="center" py={20}><Spinner color="var(--pb-forest-2)" /></Flex>
          ) : (
            <>
              <MotionBox variants={riseV}>
                <FixedPaymentsHero summary={summary} />
              </MotionBox>

              <MotionBox variants={riseV}>
                {summary.active.length || summary.cancelled.length ? (
                  <FixedPaymentsBoard
                    active={summary.active}
                    cancelled={summary.cancelled}
                    onOpenItem={setSelectedItem}
                  />
                ) : (
                  <EmptyState />
                )}
              </MotionBox>
            </>
          )}

        </VStack>
      </MotionBox>

      <RecurringTransactionDrawer
        recurringTransaction={selectedItem}
        onClose={() => setSelectedItem(null)}
        onChanged={load}
      />
    </>
  )

  if (embedded) return body

  return (
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 3, md: 5 }}>
      {body}
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

function FixedPaymentsHero({ summary }: { summary: { active: RecurringTransaction[]; income: number; expenses: number; net: number } }) {
  return (
    <Box
      overflow="hidden"
      position="relative"
      borderRadius="14px"
      bg="radial-gradient(120% 150% at 88% -30%, rgba(96,165,250,0.20) 0%, transparent 52%), linear-gradient(135deg, #0b1a31 0%, #14253f 55%, #1c2f4c 100%)"
      color="#eef2f8"
      boxShadow="var(--pb-shadow-lift)"
      border="1px solid rgba(255,255,255,0.07)"
      px="clamp(1rem, 2.4vw, 1.4rem)"
      py="clamp(0.65rem, 1.5vw, 0.95rem)"
    >
      <Box position="absolute" w="180px" h="180px" border="1px solid rgba(255,255,255,.09)" borderRadius="full" right="-55px" top="-105px" />
      <Flex position="relative" zIndex={1} direction={{ base: 'column', lg: 'row' }} justify="space-between" gap={3} align={{ lg: 'center' }}>
        <HStack spacing={3} align="baseline">
          <Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.16em" textTransform="uppercase" opacity={0.76} whiteSpace="nowrap">
            Monthly expenses
          </Text>
          <Text className="num" fontSize={{ base: '1.5rem', md: '1.85rem' }} fontWeight={500} lineHeight="1" letterSpacing="-0.035em" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {money(summary.expenses)}
          </Text>
        </HStack>
        <SimpleGrid columns={{ base: 2, lg: 3 }} spacing={{ base: 2, md: 3.5 }} minW={{ lg: '300px' }}>
          <HeroMetric label="Active rules" value={String(summary.active.length)} />
          <HeroMetric label="Fixed income" value={money(summary.income)} />
          <HeroMetric label="Monthly net" value={money(summary.net)} />
        </SimpleGrid>
      </Flex>
    </Box>
  )
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.14em" textTransform="uppercase" opacity={0.68}>{label}</Text>
      <Text className="num" fontSize={{ base: 'md', md: 'lg' }} fontWeight={500} mt="1px" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Text>
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Master-detail board (mirrors InstallmentPlansBoard)                         */
/* -------------------------------------------------------------------------- */

function FixedPaymentsBoard({
  active,
  cancelled,
  onOpenItem,
}: {
  active: RecurringTransaction[]
  cancelled: RecurringTransaction[]
  onOpenItem: (item: RecurringTransaction) => void
}) {
  const items = useMemo(() => [...active, ...cancelled], [active, cancelled])
  const [selectedId, setSelectedId] = useState<number>(() => items[0]?.id ?? -1)

  useEffect(() => {
    if (items.length > 0 && !items.some((i) => i.id === selectedId)) {
      setSelectedId(items[0].id)
    }
  }, [items, selectedId])

  const selected = items.find((i) => i.id === selectedId) ?? items[0]
  if (!selected) return null

  const isIncome = selected.type === 'INCOME'
  const amountColor = isIncome ? 'var(--pb-income-2)' : 'var(--pb-coral)'
  const caption = [selected.category, selected.accountName ?? 'No account'].filter(Boolean).join(' · ')

  return (
    <Box p={{ base: 3, md: 3.5 }} borderRadius="16px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="var(--pb-shadow)">
      {/* Board header */}
      <HStack spacing={2.5} mb={3.5}>
        <Flex w={8} h={8} align="center" justify="center" borderRadius="10px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" color="var(--pb-forest-2)">
          <Icon as={CalendarClock} boxSize={4} weight="duotone" />
        </Flex>
        <Box>
          <Text fontSize="md" fontWeight={600} color="var(--pb-ink)" lineHeight="1.2">Fixed payments</Text>
          <Text fontSize="xs" color="var(--pb-ink-soft)">Select a rule to see its details</Text>
        </Box>
      </HStack>

      <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 3, md: 4 }} align="stretch">
        {/* ── Left nav panel ── */}
        <Flex
          as="nav"
          aria-label="Fixed payments"
          direction={{ base: 'row', md: 'column' }}
          gap={1.5}
          flexShrink={0}
          w={{ base: 'full', md: '230px' }}
          overflowX={{ base: 'auto', md: 'visible' }}
          pb={{ base: 1, md: 0 }}
          sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
        >
          {items.map((item) => {
            const isSel = item.id === selected.id
            const isCancelled = !item.active
            const typeIcon = item.type === 'INCOME' ? TrendingUp : TrendingDown
            return (
              <Box
                as="button"
                type="button"
                key={item.id}
                onClick={() => setSelectedId(item.id)}
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
                opacity={isCancelled && !isSel ? 0.7 : 1}
                _hover={{ bg: isSel ? 'var(--pb-surface-2)' : 'var(--pb-surface-3)' }}
                transition="all .15s ease"
              >
                <HStack spacing={1.5} minW={0}>
                  <Icon as={typeIcon} boxSize={3} color={isSel ? (item.type === 'INCOME' ? 'var(--pb-income-2)' : 'var(--pb-coral)') : 'var(--pb-ink-faint)'} flexShrink={0} />
                  <Text fontSize="sm" fontWeight={isSel ? 600 : 500} color={isSel ? 'var(--pb-ink)' : 'var(--pb-ink-soft)'} noOfLines={1}>
                    {item.description}
                  </Text>
                </HStack>
                <Flex justify="space-between" align="baseline" gap={2} mt={0.5}>
                  <Text fontFamily="var(--pb-mono)" fontSize="9px" color="var(--pb-ink-faint)" letterSpacing="0.06em" whiteSpace="nowrap">
                    {isCancelled ? 'Cancelled' : `Day ${item.dayOfMonth}`}
                  </Text>
                  <Text fontFamily="var(--pb-mono)" fontSize="11px" fontWeight={500} color="var(--pb-ink-soft)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {money(item.amount)}
                  </Text>
                </Flex>
              </Box>
            )
          })}
        </Flex>

        {/* ── Right detail panel ── */}
        <Box flex={1} minW={0} borderRadius="13px" border="1px solid var(--pb-hair)" bg="var(--pb-surface-2)" overflow="hidden">
          {/* Clickable header → opens drawer */}
          <Box
            as="button"
            type="button"
            onClick={() => onOpenItem(selected)}
            w="full"
            textAlign="left"
            _hover={{ bg: 'var(--pb-surface-3)' }}
            transition="background .16s ease"
            aria-label="Open payment details"
          >
            <Flex justify="space-between" align="center" gap={3} px={3.5} py={3} borderBottom="1px solid var(--pb-hair)">
              <Box minW={0}>
                <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{selected.description}</Text>
                <Text fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>{caption}</Text>
              </Box>
              <HStack spacing={2} flexShrink={0}>
                <VStack align="flex-end" spacing={0}>
                  <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)">Monthly</Text>
                  <Text fontSize="sm" fontWeight={600} color={amountColor} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {isIncome ? '+' : '−'}{money(selected.amount)}
                  </Text>
                </VStack>
                <Icon as={ChevronRight} boxSize={4} color="var(--pb-ink-faint)" />
              </HStack>
            </Flex>
          </Box>

          {/* Detail rows */}
          <VStack align="stretch" spacing={0} pt={2}>
            {[
              { label: 'Type', value: selected.type === 'INCOME' ? 'Income' : 'Expense' },
              { label: 'Status', value: selected.active ? 'Active' : 'Cancelled' },
              { label: 'Payment day', value: `Day ${selected.dayOfMonth}` },
              { label: 'Next payment', value: formatDate(selected.nextRunDate) },
              { label: 'Start date', value: formatDate(selected.startDate) },
              { label: 'Account', value: selected.accountName ?? 'Not linked' },
              { label: 'Card', value: selected.paymentMethodName ?? 'No card' },
            ].map((row) => (
              <Flex key={row.label} justify="space-between" align="center" gap={3} px={3.5} py={2.5} borderTop="1px solid var(--pb-hair)">
                <HStack spacing={3} minW={0}>
                  <Box w={9} flexShrink={0} textAlign="center" borderRight="1px solid var(--pb-hair)" pr={2}>
                    <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" color="var(--pb-ink-faint)" textTransform="uppercase" lineHeight={1.2}>
                      {row.label.split(' ')[0]}
                    </Text>
                    {row.label.includes(' ') && (
                      <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" color="var(--pb-ink-faint)" textTransform="uppercase" lineHeight={1.2}>
                        {row.label.split(' ').slice(1).join(' ')}
                      </Text>
                    )}
                  </Box>
                  <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink)" noOfLines={1}>{row.value}</Text>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Box>
      </Flex>
    </Box>
  )
}

function EmptyState() {
  return (
    <Flex direction="column" align="center" textAlign="center" py={9} px={4} border="1px dashed var(--pb-hair-2)" borderRadius="15px">
      <Flex w={11} h={11} align="center" justify="center" borderRadius="12px" bg="var(--pb-surface-2)" color="var(--pb-ink-faint)" mb={3}>
        <Icon as={CalendarClock} boxSize={5} weight="duotone" />
      </Flex>
      <Text fontWeight={600} color="var(--pb-ink)">No fixed payments yet</Text>
      <Text fontSize="sm" color="var(--pb-ink-soft)" maxW="430px" mt={1}>
        Fixed payment rules created from a transaction will appear here.
      </Text>
    </Flex>
  )
}
