import { Box, HStack, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { TrendingUp, TrendingDown, Layers, CalendarDays, Lightbulb } from '../../../components/ui/icons'
import type { LucideIcon } from '../../../components/ui/icons'
import type { HabitInsight, RhythmInsight } from '../../transactions/transactions.types'
import type { CategoryShift, EarningsInsight } from '../insights'
import { useI18n } from '../../../i18n'

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

export default function InsightsPanel({
  periodWord,
  shift,
  topCategory,
  rhythm,
  habit,
  earnings,
}: InsightsPanelProps) {
  const { t, formatCurrency, formatDate, formatNumber, categoryLabel } = useI18n()
  const cards: InsightCardData[] = []
  const pct = (value: number | null) => value == null
    ? null
    : `${value > 0 ? '+' : ''}${formatNumber(Math.round(value))}%`
  const weekdayName = (weekday: number) => formatDate(
    new Date(2024, 0, 7 + weekday),
    { weekday: 'long' },
  )

  // Earnings lead — for daily/variable income the best-paying weekday is the
  // headline behaviour signal, not a footnote.
  if (earnings && earnings.bestWeekday != null) {
    cards.push({
      icon: TrendingUp,
      tint: 'var(--pb-tint-income)',
      color: 'var(--pb-income)',
      tag: t('behaviour.insights.earningsTag'),
      title: t('behaviour.insights.bestWeekday', {
        weekday: weekdayName(earnings.bestWeekday),
      }),
      value: t('behaviour.insights.earningsValue', {
        total: formatCurrency(earnings.bestWeekdayTotal),
        average: formatCurrency(earnings.avgPerWorkedDay),
      }),
    })
  }

  if (shift.riser && shift.riser.diff > 0) {
    const r = shift.riser
    const p = pct(r.pct)
    cards.push({
      icon: TrendingUp,
      tint: 'var(--pb-tint-coral)',
      color: 'var(--pb-coral)',
      tag: t('behaviour.insights.upTag', { period: periodWord }),
      title: t('behaviour.insights.spendingMore', { category: categoryLabel(r.category) }),
      value: t('behaviour.insights.upValue', {
        amount: formatCurrency(r.diff),
        percent: p ? ` (${p})` : '',
        period: periodWord,
      }),
    })
  }

  if (shift.faller && shift.faller.diff < 0) {
    const f = shift.faller
    const p = pct(f.pct)
    cards.push({
      icon: TrendingDown,
      tint: 'var(--pb-tint-green)',
      color: 'var(--pb-income)',
      tag: t('behaviour.insights.downTag', { period: periodWord }),
      title: t('behaviour.insights.easingOff', { category: categoryLabel(f.category) }),
      value: t('behaviour.insights.downValue', {
        amount: formatCurrency(f.diff),
        percent: p ? ` (${p})` : '',
        period: periodWord,
      }),
    })
  }

  if (topCategory) {
    cards.push({
      icon: Layers,
      tint: 'var(--pb-tint-gold)',
      color: 'var(--pb-gold)',
      tag: t('behaviour.insights.biggestCategory'),
      title: categoryLabel(topCategory.category),
      value: t('behaviour.insights.categoryValue', {
        amount: formatCurrency(topCategory.total),
        period: periodWord,
      }),
    })
  }

  if (rhythm) {
    cards.push({
      icon: CalendarDays,
      tint: 'var(--pb-tint-green)',
      color: 'var(--pb-forest-2)',
      tag: t('behaviour.insights.spendingRhythm'),
      title: t('behaviour.insights.heaviestDay', { weekday: weekdayName(rhythm.weekday) }),
      value: t(
        rhythm.count === 1
          ? 'behaviour.insights.rhythmValue.one'
          : 'behaviour.insights.rhythmValue.other',
        { amount: formatCurrency(rhythm.total), count: formatNumber(rhythm.count) },
      ),
    })
  }

  if (habit && cards.length < 4) {
    cards.push({
      icon: Lightbulb,
      tint: 'var(--pb-tint-gold)',
      color: 'var(--pb-gold)',
      tag: t('behaviour.insights.repeatedHabit'),
      title: t('behaviour.insights.habitTitle', {
        category: categoryLabel(habit.category),
        count: formatNumber(habit.count),
      }),
      value: t('behaviour.insights.habitValue', { amount: formatCurrency(habit.total) }),
    })
  }

  if (cards.length === 0) {
    return (
      <Box bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius="18px" p="1.1rem">
        <Text fontFamily="var(--pb-serif)" fontStyle="italic" fontSize=".95rem" color="var(--pb-ink-faint)">
          {t('behaviour.insights.empty', { period: periodWord })}
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
          {t('behaviour.insights.title')}
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
