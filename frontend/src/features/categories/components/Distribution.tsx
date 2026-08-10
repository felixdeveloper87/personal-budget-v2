import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, Grid, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, CalendarDays, Layers, ReceiptText } from '../../../components/ui/icons'
import { computeSide } from '../data/computeSide'
import { gbp, hexA } from '../data/format'
import type { Category, ComputedCategory, Side } from '../data/types'
import AllocationDonut from './AllocationDonut'
import CategoryTransactionsModal from './CategoryTransactionsModal'
import CategoryTxnRow from './CategoryTxnRow'

const MotionGrid = motion(Grid)
const TRANSACTION_LIMIT = 5

interface DistributionProps {
  expense: Category[]
  previousExpense?: Category[]
  periodLabel: string
}

export default function Distribution({
  expense,
  previousExpense = [],
  periodLabel,
}: DistributionProps) {
  // Payments is an outflow-only lens — lock to expense and hide the income tab.
  const side: Side = 'expense'
  // `pinned` is a click-selected category that persists; `hovered` is a transient
  // pointer preview. The donut highlights whichever is in effect (hover wins).
  const [pinned, setPinned] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [viewAllCat, setViewAllCat] = useState<ComputedCategory | null>(null)
  const donutRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  const activeCat = hovered ?? pinned

  const { rows, total } = useMemo(
    () => computeSide(expense, previousExpense),
    [expense, previousExpense],
  )
  const displayRows = rows
  const spotlight = (activeCat ? displayRows.find((row) => row.id === activeCat) : null) ?? displayRows[0] ?? null

  // A view/side swap re-shuffles the donut — drop any lingering highlight/expands.
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
      </Flex>

      {/* Body */}
      {hasData ? (
        <MotionGrid
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
    <Box position="relative" overflow="hidden" border="1px solid var(--pb-hair-2)" borderRadius="18px" bg="var(--pb-surface)" p="clamp(1rem,2vw,1.25rem)" boxShadow="0 12px 30px rgba(15,23,42,.07)">
      <Box position="absolute" insetX={0} top={0} h="2px" bg={cat.color} opacity={0.9} />
      <Box position="absolute" top="-90px" right="-70px" w="220px" h="220px" borderRadius="full" bg={hexA(cat.color, 0.1)} filter="blur(34px)" pointerEvents="none" />

      <Flex position="relative" align="flex-start" justify="space-between" gap={4}>
        <HStack spacing={2.5} minW={0}>
          <Flex w="40px" h="40px" align="center" justify="center" borderRadius="13px" bg={hexA(cat.color, 0.1)} border="1px solid" borderColor={hexA(cat.color, 0.34)} flexShrink={0}>
            <Icon as={cat.icon} boxSize="20px" color={cat.color} weight="duotone" />
          </Flex>
          <Box minW={0}>
            <Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.14em" textTransform="uppercase" color="var(--pb-ink-faint)">Category spotlight</Text>
            <Text fontFamily="var(--pb-serif)" fontSize="clamp(1.2rem,2vw,1.45rem)" lineHeight="1.08" color="var(--pb-ink)" noOfLines={1}>{cat.name}</Text>
          </Box>
        </HStack>
        <Box textAlign="right" flexShrink={0}>
          <Text className="num" fontFamily="var(--pb-serif)" fontSize="clamp(1.45rem,2.4vw,1.85rem)" fontWeight={500} lineHeight="0.95" color={amountColor}>{gbp(cat.amount)}</Text>
          <Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.08em" textTransform="uppercase" color="var(--pb-ink-faint)" mt={1}>{cat.pct.toFixed(1)}% of total</Text>
        </Box>
      </Flex>

      <HStack position="relative" display="inline-flex" mt={3} px="0.55rem" py="0.38rem" borderRadius="999px" spacing={1.5} color={changeColor} bg={cat.change === 0 ? 'var(--pb-surface-2)' : hexA(changeColor === 'var(--pb-coral)' ? '#b8452f' : '#1f8a4f', 0.1)} border="1px solid" borderColor={cat.change === 0 ? 'var(--pb-hair)' : hexA(changeColor === 'var(--pb-coral)' ? '#b8452f' : '#1f8a4f', 0.24)}>
        <Icon as={cat.change >= 0 ? ArrowUpRight : ArrowDownRight} boxSize="14px" />
        <Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.06em" textTransform="uppercase">{comparison}</Text>
      </HStack>

      <Grid position="relative" templateColumns="repeat(3, minmax(0, 1fr))" gap={2} mt={3.5}>
        <Metric icon={ReceiptText} label="Transactions" value={String(cat.shownCount)} />
        <Metric icon={CalendarDays} label="Active days" value={String(cat.activeDays)} />
        <Metric icon={cat.icon} label="Avg. spend" value={gbp(cat.averageAmount)} />
      </Grid>

      {cat.topMerchant && (
        <Flex position="relative" mt={3} align="baseline" gap={1.5} fontSize="sm" noOfLines={1}>
          <Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.08em" textTransform="uppercase" color="var(--pb-ink-faint)">Top merchant</Text>
          <Text fontFamily="var(--pb-serif)" fontSize="1rem" fontWeight={500} color="var(--pb-ink)" noOfLines={1}>{cat.topMerchant}</Text>
        </Flex>
      )}

      <Box position="relative" mt={4} pt={3.5} borderTop="1px solid var(--pb-hair)">
        <Flex align="center" justify="space-between" mb={1}>
          <Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.12em" textTransform="uppercase" color="var(--pb-ink-faint)">
            Recent transactions
          </Text>
          <Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.06em" color="var(--pb-ink-faint)">
            {cat.shownCount} total
          </Text>
        </Flex>
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
            justify="center"
            minH="38px"
            mt={2}
            w="full"
            borderRadius="10px"
            bg={hexA(cat.color, 0.09)}
            border="1px solid"
            borderColor={hexA(cat.color, 0.28)}
            fontFamily="var(--pb-mono)"
            fontSize="9.5px"
            letterSpacing="0.06em"
            textTransform="uppercase"
            color={cat.color}
            cursor="pointer"
            transition="background .16s ease, transform .16s ease"
            _hover={{ bg: hexA(cat.color, 0.16), transform: 'translateY(-1px)' }}
            _focusVisible={{ outline: '2px solid var(--pb-forest)', outlineOffset: '2px' }}
          >
            View {moreTransactions} more transaction{moreTransactions !== 1 ? 's' : ''}
          </Flex>
        )}
      </Box>

    </Box>
  )
}

function Metric({ icon, label, value }: { icon: ComputedCategory['icon']; label: string; value: string }) {
  return (
    <Box bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" borderRadius="11px" p="0.65rem" minW={0}>
      <HStack spacing={1} color="var(--pb-ink-faint)">
        <Icon as={icon} boxSize="10px" />
        <Text fontFamily="var(--pb-mono)" fontSize="8px" letterSpacing="0.04em" textTransform="uppercase" noOfLines={1}>{label}</Text>
      </HStack>
      <Text className="num" mt={1.5} fontFamily="var(--pb-serif)" fontSize="1.05rem" fontWeight={500} color="var(--pb-ink)" noOfLines={1}>{value}</Text>
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
