import { Box, Grid, HStack, Text, VStack } from '@chakra-ui/react'
import { fmtCurrency } from '../../dashboard/components/format'
import type { EarningsInsight } from '../insights'

interface DayToDaySummaryProps {
  income: number
  expense: number
  balance: number
  earnings: EarningsInsight | null
  /** Days of the period already elapsed (clipped to today). */
  daysElapsed: number
  periodLabel: string
}

/**
 * The Behaviour page's statement: variable earnings vs day-to-day spending.
 * Fixed payments, installments and card statements are excluded upstream —
 * this panel is the daily-net story for someone whose income varies by day.
 */
export default function DayToDaySummary({
  income,
  expense,
  balance,
  earnings,
  daysElapsed,
  periodLabel,
}: DayToDaySummaryProps) {
  const netColor = balance >= 0 ? 'var(--pb-income)' : 'var(--pb-coral)'
  const netLabel = `${balance < 0 ? '−' : ''}${fmtCurrency(Math.abs(balance))}`

  const perDay = (value: number): string | null =>
    daysElapsed > 0 ? `${fmtCurrency(value / daysElapsed)} avg a day` : null

  const cells = [
    {
      label: 'Earned',
      value: fmtCurrency(income),
      accent: 'var(--pb-income)',
      sub: earnings
        ? `${fmtCurrency(earnings.avgPerWorkedDay)} avg · working day`
        : 'no earnings logged',
    },
    {
      label: 'Spent',
      value: fmtCurrency(expense),
      accent: 'var(--pb-coral)',
      sub: perDay(expense) ?? '—',
    },
    {
      label: 'Day-to-day net',
      value: netLabel,
      accent: netColor,
      sub: perDay(balance) ?? '—',
    },
    {
      label: 'Days on the road',
      value: `${earnings?.daysWorked ?? 0}`,
      accent: 'var(--pb-gold-2)',
      sub: `of ${daysElapsed} day${daysElapsed === 1 ? '' : 's'} so far`,
    },
  ]

  return (
    <Box
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius="18px"
      boxShadow="var(--pb-shadow)"
      p="clamp(1.1rem, 2.4vw, 1.5rem)"
    >
      <VStack align="stretch" spacing={4}>
        {/* Header */}
        <HStack justify="space-between" align="baseline" flexWrap="wrap" gap={2}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            Day-to-day · {periodLabel}
          </Text>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9.5px"
            letterSpacing="0.1em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            Fixed payments &amp; installments excluded
          </Text>
        </HStack>

        {/* Lede */}
        <Text
          fontFamily="var(--pb-serif)"
          fontSize="clamp(1.2rem, 2.6vw, 1.55rem)"
          fontWeight={400}
          lineHeight={1.25}
          color="var(--pb-ink)"
          maxW="34ch"
        >
          <Lede income={income} expense={expense} balance={balance} />
        </Text>

        {/* Metric cells */}
        <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap="0.55rem">
          {cells.map((cell) => (
            <Box
              key={cell.label}
              position="relative"
              bg="var(--pb-surface-2)"
              border="1px solid var(--pb-hair)"
              borderRadius="11px"
              pl="0.85rem"
              pr="0.7rem"
              py="0.55rem"
              overflow="hidden"
              minW={0}
            >
              <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={cell.accent} />
              <Text
                fontFamily="var(--pb-mono)"
                fontSize="8.5px"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="var(--pb-ink-faint)"
                mb="0.2rem"
                noOfLines={1}
              >
                {cell.label}
              </Text>
              <Text
                fontSize={{ base: '1rem', md: '1.1rem' }}
                fontWeight={500}
                lineHeight="1"
                color="var(--pb-ink)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
                noOfLines={1}
              >
                {cell.value}
              </Text>
              <Text
                mt="0.2rem"
                fontFamily="var(--pb-mono)"
                fontSize="8.5px"
                color="var(--pb-ink-soft)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
                noOfLines={1}
              >
                {cell.sub}
              </Text>
            </Box>
          ))}
        </Grid>
      </VStack>
    </Box>
  )
}

function Lede({ income, expense, balance }: { income: number; expense: number; balance: number }) {
  if (income > 0 && balance >= 0) {
    return (
      <>
        You kept{' '}
        <Text as="em" color="var(--pb-income)">
          {fmtCurrency(balance)}
        </Text>{' '}
        of what you earned day to day.
      </>
    )
  }
  if (income > 0) {
    return (
      <>
        Day-to-day spending ran{' '}
        <Text as="em" color="var(--pb-coral)">
          {fmtCurrency(Math.abs(balance))}
        </Text>{' '}
        past what you earned.
      </>
    )
  }
  if (expense > 0) {
    return (
      <>
        No earnings logged yet —{' '}
        <Text as="em" color="var(--pb-coral)">
          {fmtCurrency(expense)}
        </Text>{' '}
        spent day to day.
      </>
    )
  }
  return <>A quiet stretch — nothing day-to-day logged yet.</>
}
