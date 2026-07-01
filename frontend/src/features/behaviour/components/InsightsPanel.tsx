import { Box, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { TrendingUp, TrendingDown, Layers, CalendarDays, Lightbulb } from '../../../components/ui/icons'
import type { LucideIcon } from '../../../components/ui/icons'
import { fmtCurrency } from '../../dashboard/components/format'
import { weekdayName } from '../../transactions/transactions.utils'
import type { HabitInsight, RhythmInsight } from '../../transactions/transactions.types'
import type { CategoryShift, EarningsInsight } from '../insights'

interface InsightsPanelProps {
  periodWord: string
  shift: { riser: CategoryShift | null; faller: CategoryShift | null }
  topCategory: { category: string; total: number } | null
  rhythm: RhythmInsight | null
  habit: HabitInsight | null
  earnings: EarningsInsight | null
}

interface InsightCardData {
  icon: LucideIcon
  tint: string
  color: string
  tag: string
  title: string
  value: string
}

const pct = (p: number | null) => (p == null ? null : `${p > 0 ? '+' : ''}${Math.round(p)}%`)

export default function InsightsPanel({
  periodWord,
  shift,
  topCategory,
  rhythm,
  habit,
  earnings,
}: InsightsPanelProps) {
  const cards: InsightCardData[] = []

  // Earnings lead — for daily/variable income the best-paying weekday is the
  // headline behaviour signal, not a footnote.
  if (earnings && earnings.bestWeekday != null) {
    cards.push({
      icon: TrendingUp,
      tint: 'var(--pb-tint-income)',
      color: 'var(--pb-income)',
      tag: 'Earnings rhythm',
      title: `${weekdayName(earnings.bestWeekday)}s pay best`,
      value: `${fmtCurrency(earnings.bestWeekdayTotal)} total · ${fmtCurrency(earnings.avgPerWorkedDay)} avg per working day`,
    })
  }

  if (shift.riser && shift.riser.diff > 0) {
    const r = shift.riser
    const p = pct(r.pct)
    cards.push({
      icon: TrendingUp,
      tint: 'var(--pb-tint-coral)',
      color: 'var(--pb-coral)',
      tag: `Up this ${periodWord}`,
      title: `Spending more on ${r.category}`,
      value: `+${fmtCurrency(r.diff)}${p ? ` (${p})` : ''} vs last ${periodWord}`,
    })
  }

  if (shift.faller && shift.faller.diff < 0) {
    const f = shift.faller
    const p = pct(f.pct)
    cards.push({
      icon: TrendingDown,
      tint: 'var(--pb-tint-green)',
      color: 'var(--pb-income)',
      tag: `Down this ${periodWord}`,
      title: `Easing off on ${f.category}`,
      value: `${fmtCurrency(f.diff)}${p ? ` (${p})` : ''} vs last ${periodWord}`,
    })
  }

  if (topCategory) {
    cards.push({
      icon: Layers,
      tint: 'var(--pb-tint-gold)',
      color: 'var(--pb-gold)',
      tag: 'Biggest category',
      title: topCategory.category,
      value: `${fmtCurrency(topCategory.total)} this ${periodWord}`,
    })
  }

  if (rhythm) {
    cards.push({
      icon: CalendarDays,
      tint: 'var(--pb-tint-green)',
      color: 'var(--pb-forest-2)',
      tag: 'Spending rhythm',
      title: `${weekdayName(rhythm.weekday)} is your heaviest day`,
      value: `${fmtCurrency(rhythm.total)} across ${rhythm.count} expense${rhythm.count === 1 ? '' : 's'}`,
    })
  }

  if (habit && cards.length < 4) {
    cards.push({
      icon: Lightbulb,
      tint: 'var(--pb-tint-gold)',
      color: 'var(--pb-gold)',
      tag: 'Repeated habit',
      title: `${habit.category} · ${habit.count}×`,
      value: `${fmtCurrency(habit.total)} in this category`,
    })
  }

  if (cards.length === 0) {
    return (
      <Box bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius="18px" p="1.1rem">
        <Text fontFamily="var(--pb-serif)" fontStyle="italic" fontSize=".95rem" color="var(--pb-ink-faint)">
          Insights appear once there are a few expenses in this {periodWord}.
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <HStack spacing=".5rem" mb=".8rem">
        <Icon as={Lightbulb} boxSize="16px" color="var(--pb-gold)" />
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10.5px"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
        >
          Insights
        </Text>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: cards.length >= 4 ? 4 : cards.length }} spacing=".7rem">
        {cards.slice(0, 4).map((card) => (
          <InsightCard key={card.tag + card.title} {...card} />
        ))}
      </SimpleGrid>
    </Box>
  )
}

function InsightCard({ icon, tint, color, tag, title, value }: InsightCardData) {
  return (
    <Box
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius="16px"
      p="1rem"
      boxShadow="var(--pb-shadow)"
      h="full"
    >
      <HStack spacing=".7rem" align="flex-start">
        <Box w="34px" h="34px" borderRadius="10px" display="grid" placeItems="center" bg={tint} color={color} flexShrink={0}>
          <Icon as={icon} boxSize="17px" />
        </Box>
        <VStack align="stretch" spacing="0.25rem" minW={0}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9.5px"
            letterSpacing="0.16em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            {tag}
          </Text>
          <Text fontFamily="var(--pb-serif)" fontSize="1rem" fontWeight={500} color="var(--pb-ink)" lineHeight="1.25" noOfLines={2}>
            {title}
          </Text>
        </VStack>
      </HStack>
      <Text
        mt=".6rem"
        fontFamily="var(--pb-mono)"
        fontSize="11px"
        color="var(--pb-ink-soft)"
        style={{ fontVariantNumeric: 'tabular-nums' }}
        noOfLines={1}
      >
        {value}
      </Text>
    </Box>
  )
}
