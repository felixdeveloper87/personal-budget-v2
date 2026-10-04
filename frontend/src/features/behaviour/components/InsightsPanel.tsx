import { Box, Flex, Icon, SimpleGrid, Text } from '@chakra-ui/react'
import { AlertTriangle, ChartLineUp, Coffee, Smile, TrendingDown, TrendingUp } from '../../../components/ui/icons'
import type { LucideIcon } from '../../../components/ui/icons'
import type { PeriodKind, SmartInsight } from '../smartInsights'
import { useI18n } from '../../../i18n'

type Tone = 'good' | 'bad' | 'neutral'

interface CardData {
  id: string
  icon: LucideIcon
  tone: Tone
  title: string
  detail: string
}

const TONES: Record<Tone, { ink: string; bg: string }> = {
  good: { ink: 'var(--pb-income)', bg: 'var(--pb-tint-income)' },
  bad: { ink: 'var(--pb-coral)', bg: 'var(--pb-tint-coral)' },
  neutral: { ink: 'var(--nu-brand, #820ad1)', bg: 'var(--nu-brand-tint, #f3e8fc)' },
}

/** Up to three Nubank-style cards; the caller hides the section when empty. */
export default function InsightsPanel({ insights, period }: { insights: SmartInsight[]; period: PeriodKind }) {
  const { t, formatCurrency, formatDate, formatNumber, categoryLabel } = useI18n()
  const monthName = (date: Date) => formatDate(date, { month: 'long' })
  const ref = (date: Date, soFar: boolean) => {
    const variant = soFar ? 'soFar' : 'total'
    if (period === 'week') return t(`behaviour.smart.ref.week.${variant}`)
    if (period === 'year') return t(`behaviour.smart.ref.year.${variant}`, { year: String(date.getFullYear()) })
    return t(`behaviour.smart.ref.month.${variant}`, { month: monthName(date) })
  }

  const cards: CardData[] = insights.map((insight): CardData => {
    switch (insight.kind) {
      case 'pace': {
        const diff = insight.spent - insight.previous
        const direction = Math.abs(diff) < 0.005 ? 'same' : diff < 0 ? 'less' : 'more'
        const suffix = insight.inProgress ? 'SoFar' : 'Total'
        return {
          id: 'pace',
          icon: direction === 'more' ? TrendingUp : TrendingDown,
          tone: direction === 'less' ? 'good' : direction === 'more' ? 'bad' : 'neutral',
          title: t(`behaviour.smart.pace.${direction}${suffix}`, {
            amount: formatCurrency(Math.abs(diff)),
            ref: ref(insight.previousStart, insight.inProgress),
          }),
          detail: t(`behaviour.smart.pace.detail${suffix}`, {
            spent: formatCurrency(insight.spent),
            previous: formatCurrency(insight.previous),
          }),
        }
      }
      case 'projection':
        return {
          id: 'projection',
          icon: ChartLineUp,
          tone: insight.previousTotal > 0 && insight.projected > insight.previousTotal ? 'bad' : 'neutral',
          title: t('behaviour.smart.projection.title', {
            amount: formatCurrency(insight.projected, { maximumFractionDigits: 0 }),
          }),
          detail: insight.previousTotal > 0
            ? t('behaviour.smart.projection.detail', {
                month: capitalise(monthName(insight.previousStart)),
                previous: formatCurrency(insight.previousTotal, { maximumFractionDigits: 0 }),
              })
            : t('behaviour.smart.projection.detailNoPrevious', { days: formatNumber(insight.daysElapsed) }),
        }
      case 'outlier':
        return {
          id: 'outlier',
          icon: AlertTriangle,
          tone: 'bad',
          title: t('behaviour.smart.outlier.title', {
            amount: formatCurrency(insight.amount),
            merchant: insight.merchant,
          }),
          detail: t('behaviour.smart.outlier.detail', {
            ratio: formatNumber(insight.ratio, { maximumFractionDigits: 0 }),
            category: categoryLabel(insight.category),
          }),
        }
      case 'small':
        return {
          id: 'small',
          icon: Coffee,
          tone: 'neutral',
          title: t('behaviour.smart.small.title', {
            count: formatNumber(insight.count),
            limit: formatCurrency(insight.limit, { maximumFractionDigits: 0 }),
            total: formatCurrency(insight.total),
          }),
          detail: t('behaviour.smart.small.detail', {
            percentage: formatNumber(insight.share, { maximumFractionDigits: 0 }),
          }),
        }
      case 'noSpend':
        return {
          id: 'noSpend',
          icon: Smile,
          tone: 'good',
          title: t(insight.days === 1 ? 'behaviour.smart.noSpend.title.one' : 'behaviour.smart.noSpend.title.other', {
            count: formatNumber(insight.days),
          }),
          detail: t(insight.inProgress ? 'behaviour.smart.noSpend.detailSoFar' : 'behaviour.smart.noSpend.detailTotal', {
            days: formatNumber(insight.daysElapsed),
          }),
        }
    }
  })

  return (
    <SimpleGrid columns={{ base: 1, md: Math.min(cards.length, 3) }} spacing={3}>
      {cards.map((card) => (
        <InsightCard key={card.id} {...card} />
      ))}
    </SimpleGrid>
  )
}

function InsightCard({ icon, tone, title, detail }: CardData) {
  const colors = TONES[tone]
  return (
    <Flex bg="var(--pb-surface)" borderRadius="16px" p={4} gap={3} align="flex-start" h="full">
      <Flex w="36px" h="36px" flexShrink={0} align="center" justify="center" borderRadius="full" bg={colors.bg} color={colors.ink}>
        <Icon as={icon} boxSize="18px" weight="bold" />
      </Flex>
      <Box minW={0}>
        <Text fontSize="sm" fontWeight={700} lineHeight="1.3" color="var(--pb-ink)">
          {title}
        </Text>
        <Text mt={1} fontSize="xs" lineHeight="1.4" color="var(--pb-ink-soft)">
          {detail}
        </Text>
      </Box>
    </Flex>
  )
}

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
