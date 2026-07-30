import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { fmtCurrency } from '../../dashboard/components/format'

interface DayToDaySummaryProps {
  income: number
  expense: number
  balance: number
  periodLabel: string
}

export default function DayToDaySummary({
  income,
  expense,
  balance,
  periodLabel,
}: DayToDaySummaryProps) {
  return (
    <Box
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius="18px"
      boxShadow="var(--pb-shadow)"
      p="clamp(1.1rem, 2.4vw, 1.5rem)"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" align="baseline" flexWrap="wrap" gap={2}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            Day-to-day - {periodLabel}
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

        <Text
          fontFamily="var(--pb-serif)"
          fontSize="clamp(1.2rem, 2.6vw, 1.55rem)"
          fontWeight={400}
          lineHeight={1.25}
          color="var(--pb-ink)"
          maxW="48ch"
        >
          <Lede income={income} expense={expense} balance={balance} />
        </Text>
      </VStack>
    </Box>
  )
}

function Lede({ income, expense, balance }: Pick<DayToDaySummaryProps, 'income' | 'expense' | 'balance'>) {
  if (income > 0 && balance >= 0) {
    return (
      <>
        You earned <Text as="em" color="var(--pb-income)">{fmtCurrency(income)}</Text>, spent{' '}
        <Text as="em" color="var(--pb-coral)">{fmtCurrency(expense)}</Text>, and kept{' '}
        <Text as="em" color="var(--pb-income)">{fmtCurrency(balance)}</Text> in this period.
      </>
    )
  }

  if (income > 0) {
    return (
      <>
        You earned <Text as="em" color="var(--pb-income)">{fmtCurrency(income)}</Text> but spent{' '}
        <Text as="em" color="var(--pb-coral)">{fmtCurrency(expense)}</Text> day to day, a{' '}
        <Text as="em" color="var(--pb-coral)">{fmtCurrency(Math.abs(balance))}</Text> difference.
      </>
    )
  }

  if (expense > 0) {
    return (
      <>
        No earnings logged; <Text as="em" color="var(--pb-coral)">{fmtCurrency(expense)}</Text> spent day to day, a{' '}
        <Text as="em" color="var(--pb-coral)">{fmtCurrency(expense)}</Text> difference.
      </>
    )
  }

  return <>No earnings or spending logged day to day.</>
}
