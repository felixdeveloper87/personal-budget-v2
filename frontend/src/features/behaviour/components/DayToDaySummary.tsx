import { Box, Text, VStack } from '@chakra-ui/react'
import { fmtCurrency } from '../../dashboard/components/format'

interface DayToDaySummaryProps {
  expense: number
  periodLabel: string
  narrativePeriodLabel: string
}

export default function DayToDaySummary({
  expense,
  periodLabel,
  narrativePeriodLabel,
}: DayToDaySummaryProps) {
  return (
    <Box bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius="18px" boxShadow="var(--pb-shadow)" p="clamp(1.1rem, 2.4vw, 1.5rem)">
      <VStack align="stretch" spacing={4}>
        <VStack align="stretch" spacing={1}>
          <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)">
            Spending - {periodLabel}
          </Text>
          <Text fontSize="sm" color="var(--pb-ink-soft)">Expenses by transaction date</Text>
        </VStack>

        <Text fontFamily="var(--pb-serif)" fontSize="clamp(1.2rem, 2.6vw, 1.55rem)" fontWeight={400} lineHeight={1.25} color="var(--pb-ink)" maxW="48ch">
          {expense > 0 ? (
            <>You spent <Text as="em" color="var(--pb-coral)">{fmtCurrency(expense)}</Text> in {narrativePeriodLabel}.</>
          ) : (
            <>No expenses recorded in {narrativePeriodLabel}.</>
          )}
        </Text>

        <Text pt={3} borderTop="1px solid var(--pb-hair)" fontFamily="var(--pb-mono)" fontSize="9.5px" letterSpacing="0.08em" textTransform="uppercase" color="var(--pb-ink-faint)">
          Only expenses with a transaction date are included
        </Text>
      </VStack>
    </Box>
  )
}
