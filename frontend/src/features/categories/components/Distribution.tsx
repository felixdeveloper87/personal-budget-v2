import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, Grid, Icon, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Layers } from '../../../components/ui/icons'
import { computeSide } from '../data/computeSide'
import type { Category, Side, ViewMode } from '../data/types'
import AllocationDonut from './AllocationDonut'
import CategoryList from './CategoryList'
import SideToggle from './SideToggle'

const MotionGrid = motion(Grid)

interface DistributionProps {
  expense: Category[]
  income: Category[]
  view: ViewMode
  periodLabel: string
  initialSide?: Side
}

export default function Distribution({
  expense,
  income,
  view,
  periodLabel,
  initialSide = 'expense',
}: DistributionProps) {
  const [side, setSide] = useState<Side>(initialSide)
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  const { rows, total } = useMemo(
    () => computeSide(side === 'expense' ? expense : income, view),
    [side, view, expense, income],
  )

  // A view/side swap re-shuffles the donut — drop any lingering highlight/expands.
  useEffect(() => {
    setActiveCat(null)
    setOpenIds(new Set())
  }, [view, side])

  const onToggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Clicking a donut segment opens its row and scrolls it into view.
  const onSegmentClick = useCallback((id: string) => {
    setOpenIds((prev) => new Set(prev).add(id))
    requestAnimationFrame(() => {
      document.getElementById(`cat-row-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
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
        <SideToggle value={side} onChange={setSide} />
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
          <Box position={{ base: 'static', lg: 'sticky' }} top={{ lg: '90px' }}>
            <AllocationDonut
              rows={rows}
              total={total}
              side={side}
              periodLabel={periodLabel}
              activeCat={activeCat}
              onActive={setActiveCat}
              onSegmentClick={onSegmentClick}
            />
          </Box>
          <CategoryList
            rows={rows}
            side={side}
            view={view}
            openIds={openIds}
            activeCat={activeCat}
            onToggle={onToggle}
            onHover={setActiveCat}
          />
        </MotionGrid>
      ) : (
        <EmptyState side={side} />
      )}
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
