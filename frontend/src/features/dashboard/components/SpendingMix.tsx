import { useMemo } from 'react'
import { Box, Grid, HStack, Text, VStack, useColorMode } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Transaction } from '../../../types'
import Panel from './Panel'
import { categoryColor } from './format'
import { useI18n } from '../../../i18n'
import { DARK_PALETTE, LIGHT_PALETTE } from '../../../palette'

interface SpendingMixProps {
  transactions: Transaction[]
  /** Same-basis transactions for the previous period, used for delta chips. */
  previousTransactions?: Transaction[]
}

interface MixSlice {
  category: string
  amount: number
  delta: number | null
}

const MAX_SLICES = 6

export default function SpendingMix({ transactions, previousTransactions = [] }: SpendingMixProps) {
  const { t, formatCurrency, categoryLabel } = useI18n()
  const reduce = useReducedMotion()
  const { colorMode } = useColorMode()
  const palette = colorMode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE
  const sliceStroke = palette.surface
  const tooltipBg = palette.solid
  const tooltipBorder = palette['hair-2']
  const tooltipText = palette.ink

  const { slices, total } = useMemo(() => {
    const sumByCategory = (txns: Transaction[]) => {
      const map = new Map<string, number>()
      for (const transaction of txns) {
        if (transaction.type === 'EXPENSE') {
          map.set(transaction.category, (map.get(transaction.category) ?? 0) + transaction.amount)
        }
      }
      return map
    }

    const current = sumByCategory(transactions)
    const previous = sumByCategory(previousTransactions)
    const sorted: MixSlice[] = [...current.entries()]
      .map(([category, amount]) => ({
        category,
        amount,
        delta: previous.has(category) ? amount - (previous.get(category) ?? 0) : null,
      }))
      .sort((a, b) => b.amount - a.amount)

    const result = sorted.length > MAX_SLICES
      ? [
          ...sorted.slice(0, MAX_SLICES - 1),
          {
            category: t('dashboard.other'),
            amount: sorted.slice(MAX_SLICES - 1).reduce((sum, item) => sum + item.amount, 0),
            delta: null,
          },
        ]
      : sorted

    return { slices: result, total: result.reduce((sum, item) => sum + item.amount, 0) }
  }, [transactions, previousTransactions, t])

  const hasData = slices.length > 0 && total > 0

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={5} h="full">
        <HStack justify="space-between" align="flex-start">
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            {t('dashboard.spendingMix')}
          </Text>
          {hasData && (
            <VStack align="flex-end" spacing={0}>
              <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.13em" textTransform="uppercase" color="var(--pb-ink-faint)">
                {t('dashboard.totalSpent')}
              </Text>
              <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(total)}
              </Text>
            </VStack>
          )}
        </HStack>

        {!hasData ? (
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-faint)" py={6}>
            {t('dashboard.noExpensesPeriod')}
          </Text>
        ) : (
          <Grid templateColumns={{ base: '1fr', sm: '180px minmax(0, 1fr)' }} gap={{ base: 5, sm: 6 }} alignItems="center" flex={1}>
            <Box position="relative" h="190px" w="full" maxW={{ base: '230px', sm: 'none' }} mx={{ base: 'auto', sm: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={2}
                    stroke={sliceStroke}
                    strokeWidth={2}
                    isAnimationActive={!reduce}
                  >
                    {slices.map((slice, index) => (
                      <Cell key={slice.category} fill={categoryColor(index)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: '12px',
                      padding: '6px 10px',
                      fontFamily: 'var(--pb-mono)',
                      fontSize: '11px',
                    }}
                    labelStyle={{ color: tooltipText }}
                    itemStyle={{ color: tooltipText }}
                    formatter={(value: number | string, name: string) => [formatCurrency(Number(value)), categoryLabel(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <VStack position="absolute" inset={0} justify="center" spacing={0} pointerEvents="none">
                <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.16em" color="var(--pb-ink-faint)" textTransform="uppercase">
                  {t('dashboard.categories')}
                </Text>
                <Text fontFamily="var(--pb-serif)" fontSize="2xl" fontWeight={500} color="var(--pb-ink)" lineHeight={1}>
                  {slices.length}
                </Text>
              </VStack>
            </Box>

            <VStack align="stretch" spacing={0} divider={<Box borderBottom="1px solid var(--pb-hair)" />}>
              {slices.map((slice, index) => (
                <MixRow key={slice.category} slice={slice} total={total} color={categoryColor(index)} />
              ))}
            </VStack>
          </Grid>
        )}
      </VStack>
    </Panel>
  )
}

function MixRow({ slice, total, color }: { slice: MixSlice; total: number; color: string }) {
  const { t, formatCurrency, categoryLabel } = useI18n()
  const percentage = Math.round((slice.amount / total) * 100)

  return (
    <Box py={2}>
      <HStack justify="space-between" spacing={3}>
        <HStack spacing={2} minW={0}>
          <Box w={2.5} h={2.5} borderRadius="full" bg={color} flexShrink={0} />
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink)" noOfLines={1}>
            {categoryLabel(slice.category)}
          </Text>
          <Text fontFamily="var(--pb-mono)" fontSize="9.5px" color="var(--pb-ink-faint)" flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {percentage}%
          </Text>
        </HStack>
        <HStack spacing={2} flexShrink={0} align="baseline">
          {slice.delta !== null && slice.delta !== 0 && (
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              color={slice.delta > 0 ? 'var(--pb-coral)' : 'var(--pb-income-2)'}
              style={{ fontVariantNumeric: 'tabular-nums' }}
              title={t('dashboard.changePreviousPeriod')}
            >
              {slice.delta > 0 ? '+' : '−'}{formatCurrency(Math.abs(slice.delta))}
            </Text>
          )}
          <Text fontFamily="var(--pb-mono)" fontSize="10.5px" color="var(--pb-ink-soft)" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(slice.amount)}
          </Text>
        </HStack>
      </HStack>
      <Box mt={1.5} h="3px" borderRadius="full" bg="var(--pb-surface-3)" overflow="hidden">
        <Box h="full" w={`${percentage}%`} borderRadius="full" bg={color} opacity={0.85} />
      </Box>
    </Box>
  )
}
