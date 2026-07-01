import { useMemo } from 'react'
import { Box, Grid, HStack, Text, VStack, useColorMode } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Transaction } from '../../../types'
import Panel from './Panel'
import { categoryColor, fmtCurrency } from './format'

interface SpendingMixProps {
  transactions: Transaction[]
  /** Same-basis transactions for the previous period, used for delta chips. */
  previousTransactions?: Transaction[]
}

const MAX_SLICES = 6

export default function SpendingMix({ transactions, previousTransactions = [] }: SpendingMixProps) {
  const reduce = useReducedMotion()
  const { colorMode } = useColorMode()
  const dark = colorMode === 'dark'
  const sliceStroke = dark ? '#151517' : '#faf9f2'
  const tooltipBg = dark ? '#151517' : '#faf9f2'
  const tooltipBorder = dark ? 'rgba(244,246,242,0.18)' : 'rgba(26,50,38,0.16)'
  const tooltipText = dark ? '#f2f4f0' : '#1a2620'

  const { slices, total } = useMemo(() => {
    const sumByCategory = (txns: Transaction[]) => {
      const map = new Map<string, number>()
      for (const t of txns) {
        if (t.type !== 'EXPENSE') continue
        map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
      }
      return map
    }

    const byCategory = sumByCategory(transactions)
    const prevByCategory = sumByCategory(previousTransactions)

    const sorted = [...byCategory.entries()]
      .map(([category, amount]) => ({
        category,
        amount,
        // null when the category didn't exist last period ("new" spending).
        delta: prevByCategory.has(category) ? amount - (prevByCategory.get(category) ?? 0) : null,
      }))
      .sort((a, b) => b.amount - a.amount)

    let result = sorted
    if (sorted.length > MAX_SLICES) {
      const head = sorted.slice(0, MAX_SLICES - 1)
      const rest = sorted.slice(MAX_SLICES - 1)
      const otherAmount = rest.reduce((s, r) => s + r.amount, 0)
      result = [...head, { category: 'Other', amount: otherAmount, delta: null }]
    }

    const sum = result.reduce((s, r) => s + r.amount, 0)
    return { slices: result, total: sum }
  }, [transactions, previousTransactions])

  const hasData = slices.length > 0 && total > 0

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={4} h="full">
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10.5px"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
        >
          Spending mix
        </Text>

        {!hasData ? (
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-faint)" py={6}>
            No expenses recorded for this period.
          </Text>
        ) : (
          <Grid templateColumns={{ base: '1fr', sm: '140px 1fr' }} gap={4} alignItems="center">
            {/* Donut */}
            <Box position="relative" h="140px" w="full" minW="120px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={64}
                    paddingAngle={2}
                    stroke={sliceStroke}
                    strokeWidth={2}
                    isAnimationActive={!reduce}
                  >
                    {slices.map((s, i) => (
                      <Cell key={s.category} fill={categoryColor(i)} />
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
                    formatter={(value: number | string, name: string) => [
                      fmtCurrency(Number(value)),
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center total */}
              <VStack
                position="absolute"
                inset={0}
                justify="center"
                spacing={0}
                pointerEvents="none"
              >
                <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.16em" color="var(--pb-ink-faint)" textTransform="uppercase">
                  Total
                </Text>
                <Text
                  fontFamily="var(--pb-serif)"
                  fontSize="md"
                  fontWeight={500}
                  color="var(--pb-ink)"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {fmtCurrency(total)}
                </Text>
              </VStack>
            </Box>

            {/* Legend */}
            <VStack align="stretch" spacing={1.5}>
              {slices.map((s, i) => {
                const pct = Math.round((s.amount / total) * 100)
                return (
                  <HStack key={s.category} justify="space-between" spacing={2}>
                    <HStack spacing={2} minW={0}>
                      <Box w={2.5} h={2.5} borderRadius="2px" bg={categoryColor(i)} flexShrink={0} />
                      <Text fontFamily="var(--pb-serif)" fontSize="xs" color="var(--pb-ink)" noOfLines={1}>
                        {s.category}
                      </Text>
                      <Text
                        fontFamily="var(--pb-mono)"
                        fontSize="9.5px"
                        color="var(--pb-ink-faint)"
                        flexShrink={0}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {pct}%
                      </Text>
                    </HStack>
                    <HStack spacing={2} flexShrink={0} align="baseline">
                      <Text
                        fontFamily="var(--pb-mono)"
                        fontSize="10px"
                        color="var(--pb-ink-soft)"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {fmtCurrency(s.amount)}
                      </Text>
                      {s.delta !== null && s.delta !== 0 && (
                        <Text
                          fontFamily="var(--pb-mono)"
                          fontSize="9.5px"
                          color={s.delta > 0 ? 'var(--pb-coral)' : 'var(--pb-income-2)'}
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                          title="Change vs previous period"
                        >
                          {s.delta > 0 ? '+' : '−'}
                          {fmtCurrency(Math.abs(s.delta))}
                        </Text>
                      )}
                    </HStack>
                  </HStack>
                )
              })}
            </VStack>
          </Grid>
        )}
      </VStack>
    </Panel>
  )
}
