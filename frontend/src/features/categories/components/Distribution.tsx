import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, Grid, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, CalendarDays, Layers, ReceiptText } from '../../../components/ui/icons'
import { condenseCategories, computeSide } from '../data/computeSide'
import { gbp } from '../data/format'
import type { Category, ComputedCategory, Side, ViewMode } from '../data/types'
import AllocationDonut from './AllocationDonut'
import CategoryTransactionsModal from './CategoryTransactionsModal'
import CategoryTxnRow from './CategoryTxnRow'
import SideToggle from './SideToggle'

const MotionGrid = motion(Grid)
const TRANSACTION_LIMIT = 5

interface DistributionProps {
  expense: Category[]
  income: Category[]
  previousExpense?: Category[]
  previousIncome?: Category[]
  view: ViewMode
  periodLabel: string
  initialSide?: Side
}

export default function Distribution({
  expense,
  income,
  previousExpense = [],
  previousIncome = [],
  view,
  periodLabel,
  initialSide = 'expense',
}: DistributionProps) {
  // Payments is an outflow-only lens — lock to expense and hide the income tab.
  const lockExpense = view === 'payments'
  const [side, setSide] = useState<Side>(lockExpense ? 'expense' : initialSide)
  // `pinned` is a click-selected category that persists; `hovered` is a transient
  // pointer preview. The donut highlights whichever is in effect (hover wins).
  const [pinned, setPinned] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [viewAllCat, setViewAllCat] = useState<ComputedCategory | null>(null)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const donutRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  const activeCat = hovered ?? pinned

  const { rows, total } = useMemo(
    () => computeSide(
      side === 'expense' ? expense : income,
      side === 'expense' ? previousExpense : previousIncome,
    ),
    [side, expense, income, previousExpense, previousIncome],
  )
  const displayRows = useMemo(
    () => showAllCategories ? rows : condenseCategories(rows),
    [rows, showAllCategories],
  )
  const hasHiddenCategories = displayRows.length < rows.length
  const spotlight = (activeCat ? displayRows.find((row) => row.id === activeCat) : null) ?? displayRows[0] ?? null

  // A view/side swap re-shuffles the donut — drop any lingering highlight/expands.
  useEffect(() => {
    setPinned(null)
    setHovered(null)
    setShowAllCategories(false)
  }, [view, side])

  // Clicking anywhere outside the donut clears the selection — back to the
  // default "Total" view and collapses the row that the segment opened.
  useEffect(() => {
    if (!pinned) return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      const clickedDonut = donutRef.current?.contains(target)
      const clickedDetails = detailsRef.current?.contains(target)
      if (!clickedDonut && !clickedDetails) {
        setPinned(null)
        setHovered(null)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [pinned])

  // Clicking a donut segment pins the single detail card; clicking it again
  // returns that card to the default top category.
  const onSegmentClick = useCallback((id: string) => {
    setPinned((current) => current === id ? null : id)
  }, [])

  const hasData = rows.length > 0

  return (
    <Box
      position="relative"
      bg="linear-gradient(176deg, var(--pb-surface), var(--pb-surface-2))"
      border="1px solid var(--pb-hair)"
      borderRadius="22px"
      boxShadow="0 1px 2px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.06)"
      p="clamp(1.2rem, 2.8vw, 1.7rem)"
      overflow="hidden"
    >
      {/* Inner top highlight */}
      <Box position="absolute" inset={0} borderRadius="inherit" pointerEvents="none" boxShadow="inset 0 1px 0 rgba(255,255,255,.5)" />

      {/* Header */}
      <Flex
        position="relative"
        zIndex={2}
        align="flex-start"
        justify="space-between"
        gap="0.9rem"
        flexWrap="wrap"
        mb="1.2rem"
      >
        <VStack align="flex-start" spacing="0.15rem">
          <Text fontWeight={500} fontSize="1.2rem" letterSpacing="-0.01em" color="var(--pb-ink)">
            {side === 'expense' ? 'Expense distribution' : 'Income distribution'}
          </Text>
          <Text fontStyle="italic" color="var(--pb-ink-faint)" fontSize="0.9rem">
            {side === 'expense' ? 'Share of spending by category' : 'Share of income by source'}
          </Text>
        </VStack>
        {!lockExpense && <SideToggle value={side} onChange={setSide} />}
      </Flex>

      {/* Body */}
      {hasData ? (
        <MotionGrid
          key={`${view}-${side}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          position="relative"
          zIndex={2}
          templateColumns={{ base: '1fr', lg: '300px 1fr' }}
          gap={{ base: '1.5rem', lg: '2rem' }}
          alignItems="start"
        >
          <Box ref={donutRef} position={{ base: 'static', lg: 'sticky' }} top={{ lg: '90px' }}>
            <AllocationDonut
              rows={displayRows}
              total={total}
              side={side}
              periodLabel={periodLabel}
              activeCat={activeCat}
              onActive={setHovered}
              onSegmentClick={onSegmentClick}
            />
          </Box>
          <VStack ref={detailsRef} align="stretch" spacing="0.85rem">
            {spotlight && (
              <CategorySpotlight
                cat={spotlight}
                side={side}
                onViewAll={() => setViewAllCat(spotlight)}
              />
            )}
            {(hasHiddenCategories || showAllCategories && rows.length > 6) && (
              <Flex
                as="button"
                type="button"
                onClick={() => {
                  setShowAllCategories((current) => !current)
                  setPinned(null)
                  setHovered(null)
                }}
                align="center"
                justify="center"
                minH="42px"
                border="1px dashed var(--pb-hair-2)"
                borderRadius="12px"
                bg="var(--pb-surface-2)"
                fontFamily="var(--pb-mono)"
                fontSize="10px"
                letterSpacing="0.07em"
                textTransform="uppercase"
                color="var(--pb-ink-soft)"
                cursor="pointer"
                _hover={{ color: 'var(--pb-ink)', borderColor: 'var(--pb-ink-faint)' }}
                _focusVisible={{ outline: '2px solid var(--pb-forest)', outlineOffset: '2px' }}
              >
                {showAllCategories ? 'Show top categories' : `Show all ${rows.length} categories`}
              </Flex>
            )}
          </VStack>
        </MotionGrid>
      ) : (
        <EmptyState side={side} />
      )}

      <CategoryTransactionsModal
        cat={viewAllCat}
        side={side}
        periodLabel={periodLabel}
        onClose={() => setViewAllCat(null)}
      />
    </Box>
  )
}

function CategorySpotlight({
  cat,
  side,
  onViewAll,
}: {
  cat: ComputedCategory
  side: Side
  onViewAll: () => void
}) {
  const isExpense = side === 'expense'
  const amountColor = isExpense ? 'var(--pb-coral)' : 'var(--pb-income)'
  const changeColor = cat.change > 0
    ? isExpense ? 'var(--pb-coral)' : 'var(--pb-income)'
    : cat.change < 0 ? isExpense ? 'var(--pb-income)' : 'var(--pb-coral)'
      : 'var(--pb-ink-faint)'
  const comparison = cat.changePct === null
    ? 'New in this period'
    : `${cat.change >= 0 ? '+' : '−'}${gbp(Math.abs(cat.change))} · ${Math.abs(cat.changePct).toFixed(0)}% vs previous`
  const shownTransactions = cat.sample.slice(0, TRANSACTION_LIMIT)
  const moreTransactions = Math.max(0, cat.shownCount - shownTransactions.length)

  return (
    <Box border="1px solid var(--pb-hair-2)" borderRadius="16px" bg="var(--pb-surface)" p="1rem" boxShadow="0 6px 18px rgba(15,23,42,.05)">
      <Flex align="flex-start" justify="space-between" gap={3}>
        <HStack spacing={2.5} minW={0}>
          <Flex w="34px" h="34px" align="center" justify="center" borderRadius="11px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" flexShrink={0}>
            <Icon as={cat.icon} boxSize="18px" color={cat.color} />
          </Flex>
          <Box minW={0}>
            <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.11em" textTransform="uppercase" color="var(--pb-ink-faint)">Category spotlight</Text>
            <Text fontFamily="var(--pb-serif)" fontSize="1.2rem" lineHeight="1.15" color="var(--pb-ink)" noOfLines={1}>{cat.name}</Text>
          </Box>
        </HStack>
        <Box textAlign="right" flexShrink={0}>
          <Text className="num" fontSize="1.25rem" fontWeight={600} lineHeight="1" color={amountColor}>{gbp(cat.amount)}</Text>
          <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.06em" color="var(--pb-ink-faint)" mt={1}>{cat.pct.toFixed(1)}% of total</Text>
        </Box>
      </Flex>

      <HStack mt={3} pt={3} borderTop="1px solid var(--pb-hair)" spacing={1.5} color={changeColor}>
        <Icon as={cat.change >= 0 ? ArrowUpRight : ArrowDownRight} boxSize="14px" />
        <Text fontFamily="var(--pb-mono)" fontSize="9.5px" letterSpacing="0.05em">{comparison}</Text>
      </HStack>

      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2} mt={3}>
        <Metric icon={ReceiptText} label="Transactions" value={String(cat.shownCount)} />
        <Metric icon={CalendarDays} label="Active days" value={String(cat.activeDays)} />
        <Metric icon={cat.icon} label="Avg. spend" value={gbp(cat.averageAmount)} />
      </Grid>

      {cat.topMerchant && (
        <Text mt={3} fontSize="sm" color="var(--pb-ink-soft)" noOfLines={1}>
          Top merchant: <Text as="span" fontWeight={600} color="var(--pb-ink)">{cat.topMerchant}</Text>
        </Text>
      )}

      <Box mt={4} pt={3} borderTop="1px solid var(--pb-hair)">
        <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)" mb={2}>
          Recent transactions
        </Text>
        <VStack align="stretch" spacing={0}>
          {shownTransactions.map((transaction) => (
            <CategoryTxnRow key={transaction.id} txn={transaction} icon={cat.icon} color={cat.color} side={side} />
          ))}
        </VStack>
        {moreTransactions > 0 && (
          <Flex
            as="button"
            type="button"
            onClick={onViewAll}
            align="center"
            gap="0.35rem"
            pt="0.8rem"
            w="full"
            fontFamily="var(--pb-mono)"
            fontSize="9.5px"
            letterSpacing="0.06em"
            textTransform="uppercase"
            color="var(--pb-income)"
            cursor="pointer"
            _hover={{ textDecoration: 'underline' }}
            _focusVisible={{ outline: 'none', textDecoration: 'underline' }}
          >
            +{moreTransactions} more in this category
          </Flex>
        )}
      </Box>

    </Box>
  )
}

function Metric({ icon, label, value }: { icon: ComputedCategory['icon']; label: string; value: string }) {
  return (
    <Box bg="var(--pb-surface-2)" borderRadius="10px" p="0.55rem" minW={0}>
      <HStack spacing={1} color="var(--pb-ink-faint)">
        <Icon as={icon} boxSize="11px" />
        <Text fontFamily="var(--pb-mono)" fontSize="8px" letterSpacing="0.04em" textTransform="uppercase" noOfLines={1}>{label}</Text>
      </HStack>
      <Text className="num" mt={1} fontSize="0.95rem" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{value}</Text>
    </Box>
  )
}

function EmptyState({ side }: { side: Side }) {
  return (
    <VStack position="relative" zIndex={2} spacing={3} py={14} align="center">
      <Flex
        w={14}
        h={14}
        align="center"
        justify="center"
        borderRadius="2xl"
        bg="var(--pb-surface-2)"
        border="1px solid var(--pb-hair)"
      >
        <Icon as={Layers} boxSize={7} color="var(--pb-ink-faint)" weight="duotone" />
      </Flex>
      <VStack spacing={1}>
        <Text fontSize="md" fontWeight={500} color="var(--pb-ink)">
          No {side === 'expense' ? 'spending' : 'income'} for this period
        </Text>
        <Text fontSize="sm" color="var(--pb-ink-soft)" maxW="340px" textAlign="center">
          Add transactions in this date range to see how your {side === 'expense' ? 'money' : 'income'} breaks down by category.
        </Text>
      </VStack>
    </VStack>
  )
}
