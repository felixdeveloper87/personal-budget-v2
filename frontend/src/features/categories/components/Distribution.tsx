import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, Grid, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Layers } from '../../../components/ui/icons'
import { computeSide } from '../data/computeSide'
import type { Category, ComputedCategory, Side } from '../data/types'
import AllocationDonut from './AllocationDonut'
import CategoryTransactionsModal from './CategoryTransactionsModal'
import CategoryTxnRow from './CategoryTxnRow'
import { useI18n } from '../../../i18n'

const MotionGrid = motion(Grid)
const TRANSACTION_LIMIT = 5

/* Categories are ranked by spend and painted on one purple ramp: the biggest
   in brand purple, fading to lilac; the long tail shares a neutral grey. */
const NU_RAMP = ['#820ad1', '#9a3cdd', '#b06be6', '#c495ee', '#d7b9f4', '#e7d5f9']
const NU_TAIL = '#d4d4dd'

interface DistributionProps {
  appearance?: 'default' | 'nu'
  expense: Category[]
  previousExpense?: Category[]
  periodLabel: string
}

export default function Distribution({
  appearance = 'default',
  expense,
  previousExpense = [],
  periodLabel,
}: DistributionProps) {
  const isNu = appearance === 'nu'
  // Payments is an outflow-only lens — lock to expense and hide the income tab.
  const side: Side = 'expense'
  // `pinned` is a click-selected category that persists; `hovered` is a transient
  // pointer preview. The donut highlights whichever is in effect (hover wins).
  const [pinned, setPinned] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [viewAllCat, setViewAllCat] = useState<ComputedCategory | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  const activeCat = hovered ?? pinned

  const { rows, total } = useMemo(
    () => computeSide(expense, previousExpense),
    [expense, previousExpense],
  )
  const displayRows = useMemo(
    () => rows.map((row, index) => ({ ...row, color: NU_RAMP[index] ?? NU_TAIL })),
    [rows],
  )
  const spotlight = (activeCat ? displayRows.find((row) => row.id === activeCat) : null) ?? displayRows[0] ?? null

  // Clicking anywhere outside the chart/legend or the details card clears the
  // selection — back to the default "Total" view. Listens while *any* category
  // is shown (pinned or hovered): on touch screens there is no mouseleave, so a
  // tap leaves `hovered` set and only an outside tap can clear it.
  useEffect(() => {
    if (!activeCat) return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!chartRef.current?.contains(target) && !detailsRef.current?.contains(target)) {
        setPinned(null)
        setHovered(null)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [activeCat])

  // Tapping the selected category again goes back to the total — clear the
  // touch "hover" too, or the ring would keep showing the category.
  const togglePinned = useCallback((id: string) => {
    if (pinned === id) {
      setPinned(null)
      setHovered(null)
    } else {
      setPinned(id)
    }
  }, [pinned])

  if (displayRows.length === 0) {
    return (
      <Box bg="var(--pb-surface)" borderRadius="16px" p={5}>
        <EmptyState side={side} />
      </Box>
    )
  }

  return (
    <>
      <MotionGrid
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        templateColumns={{ base: '1fr', lg: 'minmax(280px, 340px) 1fr' }}
        gap={{ base: isNu ? 0 : 4, lg: isNu ? 4 : 5 }}
        alignItems="start"
      >
        <Box
          ref={chartRef}
          bg={isNu ? 'transparent' : 'var(--pb-surface)'}
          borderRadius="16px"
          p={isNu ? 0 : { base: 4, md: 5 }}
          position={{ base: 'static', lg: 'sticky' }}
          top={{ lg: '90px' }}
        >
          <AllocationDonut
            rows={displayRows}
            total={total}
            side={side}
            periodLabel={periodLabel}
            activeCat={activeCat}
            onActive={setHovered}
            onSegmentClick={togglePinned}
          />
          <CategoryLegend
            rows={displayRows}
            activeCat={activeCat}
            onHover={setHovered}
            onSelect={togglePinned}
          />
        </Box>

        <Box ref={detailsRef}>
          {spotlight && (
            <CategorySpotlight
              appearance={appearance}
              cat={spotlight}
              side={side}
              onViewAll={() => setViewAllCat(spotlight)}
            />
          )}
        </Box>
      </MotionGrid>

      <CategoryTransactionsModal
        cat={viewAllCat}
        side={side}
        periodLabel={periodLabel}
        onClose={() => setViewAllCat(null)}
      />
    </>
  )
}

/** Tappable category list under the ring: colour dot, name, share and amount. */
function CategoryLegend({
  rows,
  activeCat,
  onHover,
  onSelect,
}: {
  rows: ComputedCategory[]
  activeCat: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}) {
  const { t, formatCurrency, formatNumber, categoryLabel } = useI18n()
  return (
    <VStack mt={4} align="stretch" spacing={0.5} role="list">
      {rows.map((row) => {
        const isActive = activeCat === row.id
        return (
          <Flex
            key={row.id}
            as="button"
            type="button"
            role="listitem"
            align="center"
            gap={2.5}
            px={2.5}
            py={2}
            borderRadius="10px"
            textAlign="left"
            bg={isActive ? 'var(--nu-brand-tint, #f3e8fc)' : 'transparent'}
            opacity={activeCat && !isActive ? 0.6 : 1}
            transition="background 0.15s ease, opacity 0.15s ease"
            _hover={{ bg: isActive ? 'var(--nu-brand-tint, #f3e8fc)' : 'var(--pb-surface-2)' }}
            _focusVisible={{ outline: '2px solid var(--nu-brand, #820ad1)', outlineOffset: '1px' }}
            aria-pressed={isActive}
            onMouseEnter={() => onHover(row.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(row.id)}
          >
            <Box w="10px" h="10px" flexShrink={0} borderRadius="full" bg={row.color} />
            <Text flex={1} minW={0} fontSize="sm" fontWeight={isActive ? 700 : 500} color="var(--pb-ink)" noOfLines={1}>
              {row.name === 'Uncategorised' ? t('categories.uncategorised') : categoryLabel(row.name)}
            </Text>
            <Text fontSize="xs" color="var(--pb-ink-soft)" flexShrink={0}>
              {formatNumber(row.pct, { maximumFractionDigits: 0 })}%
            </Text>
            <Text w="78px" textAlign="right" fontSize="sm" fontWeight={600} color="var(--pb-ink)" flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(row.amount)}
            </Text>
          </Flex>
        )
      })}
    </VStack>
  )
}

function CategorySpotlight({
  appearance,
  cat,
  side,
  onViewAll,
}: {
  appearance: 'default' | 'nu'
  cat: ComputedCategory
  side: Side
  onViewAll: () => void
}) {
  const { t, formatCurrency, formatNumber, categoryLabel } = useI18n()
  const isExpense = side === 'expense'
  // Spending more is bad for expenses, good for income — and vice versa.
  const good = cat.change !== 0 && (cat.change < 0) === isExpense
  const changeInk = cat.change === 0 ? 'var(--pb-ink-soft)' : good ? 'var(--pb-income)' : 'var(--pb-coral)'
  const changeBg = cat.change === 0 ? 'var(--pb-surface-2)' : good ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'
  const comparison = cat.changePct === null
    ? t('categories.newThisPeriod')
    : t('categories.vsPrevious', {
        amount: `${cat.change >= 0 ? '+' : '−'}${formatCurrency(Math.abs(cat.change))}`,
        percentage: formatNumber(Math.abs(cat.changePct), { maximumFractionDigits: 0 }),
      })
  const shownTransactions = cat.sample.slice(0, TRANSACTION_LIMIT)
  const moreTransactions = Math.max(0, cat.shownCount - shownTransactions.length)
  const isNu = appearance === 'nu'

  return (
    <Box
      bg={isNu ? 'transparent' : 'var(--pb-surface)'}
      borderRadius="16px"
      borderTop={{ base: isNu ? '1px solid var(--pb-hair)' : 'none', lg: 'none' }}
      mt={{ base: isNu ? 4 : 0, lg: 0 }}
      pt={{ base: isNu ? 4 : 4, md: isNu ? 0 : 5 }}
      p={isNu ? undefined : { base: 4, md: 5 }}
    >
      <Flex align="center" justify="space-between" gap={3}>
        <HStack spacing={isNu ? 0 : 2.5} minW={0}>
          {!isNu && (
            <Flex w="36px" h="36px" align="center" justify="center" borderRadius="full" bg="var(--nu-brand-tint, #f3e8fc)" color="var(--nu-brand, #820ad1)" flexShrink={0}>
              <Icon as={cat.icon} boxSize="18px" weight="bold" />
            </Flex>
          )}
          <Box minW={0}>
            {isNu ? (
              <HStack spacing={2} align="baseline" minW={0}>
                <Text fontSize="md" fontWeight={700} lineHeight="1.25" color="var(--pb-ink)" noOfLines={1}>
                  {cat.name === 'Uncategorised' ? t('categories.uncategorised') : categoryLabel(cat.name)}
                </Text>
                <Text flexShrink={0} fontSize="xs" color="var(--pb-ink-soft)" lineHeight="1.25">
                  {t('categories.ofTotal', { percentage: formatNumber(cat.pct, { maximumFractionDigits: 1 }) })}
                </Text>
              </HStack>
            ) : (
              <>
                <Text fontSize="md" fontWeight={700} lineHeight="1.2" color="var(--pb-ink)" noOfLines={1}>
                  {cat.name === 'Uncategorised' ? t('categories.uncategorised') : categoryLabel(cat.name)}
                </Text>
                <Text fontSize="xs" color="var(--pb-ink-soft)" lineHeight="1.3">
                  {t('categories.ofTotal', { percentage: formatNumber(cat.pct, { maximumFractionDigits: 1 }) })}
                </Text>
              </>
            )}
          </Box>
        </HStack>
        <Text flexShrink={0} fontSize="lg" fontWeight={700} letterSpacing="-0.02em" color="var(--pb-ink)">
          {formatCurrency(cat.amount)}
        </Text>
      </Flex>

      <Flex mt={2.5} align="center" gap={2} rowGap={1.5} flexWrap="wrap">
        {(!isNu || cat.change !== 0) && (
          <HStack
            px={isNu ? 0 : 2}
            py={isNu ? 0 : 0.5}
            borderRadius="full"
            spacing={1}
            color={changeInk}
            bg={isNu ? 'transparent' : changeBg}
          >
            {cat.change !== 0 && <Icon as={cat.change > 0 ? ArrowUpRight : ArrowDownRight} boxSize="12px" />}
            <Text fontSize="2xs" fontWeight={600}>{comparison}</Text>
          </HStack>
        )}
        <Text fontSize="xs" color="var(--pb-ink-soft)">
          <Stat label={t('categories.transactions')} value={formatNumber(cat.shownCount)} />
          {' · '}
          {!isNu && (
            <>
              <Stat label={t('categories.activeDays')} value={formatNumber(cat.activeDays)} />
              {' · '}
            </>
          )}
          <Stat label={t('categories.averageSpend')} value={formatCurrency(cat.averageAmount)} />
          {!isNu && cat.topMerchant && (
            <>
              {' · '}
              <Stat label={t('categories.topMerchant')} value={cat.topMerchant} />
            </>
          )}
        </Text>
      </Flex>

      <Box mt={4}>
        <Flex align="baseline" justify="space-between" mb={1}>
          <Text fontSize="md" fontWeight={700} color="var(--pb-ink)">
            {t('categories.transactions')}
          </Text>
          {!isNu && (
            <Text fontSize="xs" color="var(--pb-ink-soft)">
              {t('categories.transactionTotal', { count: formatNumber(cat.shownCount) })}
            </Text>
          )}
        </Flex>
        <Box bg={isNu ? 'transparent' : 'white'} borderRadius="14px" px={isNu ? 0 : 3.5}>
          {shownTransactions.map((transaction) => (
            <CategoryTxnRow key={transaction.id} appearance={appearance} txn={transaction} icon={cat.icon} side={side} />
          ))}
        </Box>
        {moreTransactions > 0 && (
          <Flex
            as="button"
            type="button"
            onClick={onViewAll}
            align="center"
            justify="center"
            h="44px"
            mt={3}
            w="full"
            borderRadius="full"
            bg="var(--nu-brand-tint, #f3e8fc)"
            color="var(--nu-brand, #820ad1)"
            fontSize="sm"
            fontWeight={600}
            cursor="pointer"
            transition="background .15s ease"
            _hover={{ bg: '#ead6fa' }}
            _focusVisible={{ outline: '2px solid var(--nu-brand, #820ad1)', outlineOffset: '2px' }}
          >
            {t(moreTransactions === 1 ? 'categories.viewMore' : 'categories.viewMorePlural', {
              count: formatNumber(moreTransactions),
            })}
          </Flex>
        )}
      </Box>
    </Box>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <>
      {label} <Text as="span" fontWeight={700} color="var(--pb-ink)">{value}</Text>
    </>
  )
}

function EmptyState({ side }: { side: Side }) {
  const { t } = useI18n()
  return (
    <VStack spacing={3} py={10} align="center">
      <Flex w={12} h={12} align="center" justify="center" borderRadius="full" bg="var(--nu-brand-tint, #f3e8fc)" color="var(--nu-brand, #820ad1)">
        <Icon as={Layers} boxSize={6} weight="bold" />
      </Flex>
      <VStack spacing={1}>
        <Text fontSize="md" fontWeight={700} color="var(--pb-ink)">
          {t(side === 'expense' ? 'categories.noSpending' : 'categories.noIncome')}
        </Text>
        <Text fontSize="sm" color="var(--pb-ink-soft)" maxW="340px" textAlign="center">
          {t(side === 'expense' ? 'categories.emptySpendingHelp' : 'categories.emptyIncomeHelp')}
        </Text>
      </VStack>
    </VStack>
  )
}
