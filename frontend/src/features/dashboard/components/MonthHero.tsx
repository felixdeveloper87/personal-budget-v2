import { Grid, HStack, Text, VStack, Button } from '@chakra-ui/react'
import Panel from './Panel'
import FlowBars from './FlowBars'
import { fmtCurrency } from './format'

interface MonthHeroProps {
  income: number
  expense: number
  net: number
  transactions: number
  /** Period anchor — names the month in the net-balance label. */
  date?: Date
  onAddIncome?: () => void
  onAddExpense?: () => void
}

export default function MonthHero({
  income,
  expense,
  net,
  transactions,
  date,
  onAddIncome,
  onAddExpense,
}: MonthHeroProps) {
  const deficit = expense > income

  const netLabel = `${net < 0 ? '−' : ''}${fmtCurrency(Math.abs(net))}`
  const monthName = (date ?? new Date()).toLocaleDateString('en-GB', { month: 'long' })
  const netColor = net < 0 ? 'var(--pb-coral)' : 'var(--pb-income-2)'

  return (
    <Panel
      background={`linear-gradient(135deg, var(--pb-surface) 0%, var(--pb-surface-2) 100%)`}
      p={0}
      overflow="hidden"
    >
      <Grid
        templateColumns={{ base: '1fr', md: '1.35fr 0.9fr' }}
        gap={`clamp(1.4rem, 3vw, 2.2rem)`}
        p={`clamp(1.5rem, 3.4vw, 2.4rem)`}
      >
        {/* Left — statement */}
        <VStack align="stretch" spacing={5}>
          {/* Lede */}
          <Text
            fontFamily="var(--pb-serif)"
            fontSize="clamp(1.7rem, 4.4vw, 2.5rem)"
            fontWeight={400}
            lineHeight={1.08}
            color="var(--pb-ink)"
            maxW="18ch"
          >
            {deficit ? (
              <>
                Spending has{' '}
                <Text as="em" color="var(--pb-coral)">
                  outpaced
                </Text>{' '}
                income this month.
              </>
            ) : (
              <>
                Income is{' '}
                <Text as="em" color="var(--pb-income-2)">
                  ahead
                </Text>{' '}
                of spending this month.
              </>
            )}
          </Text>

          {/* Flow bars */}
          <FlowBars income={income} expense={expense} transactions={transactions} />

          {/* Quick actions */}
          {(onAddIncome || onAddExpense) && (
            <HStack spacing={2} maxW="440px" pt={1}>
              {onAddIncome && (
                <Button
                  flex={1}
                  h="36px"
                  borderRadius="999px"
                  bg="var(--pb-tint-income)"
                  color="var(--pb-income)"
                  border="1px solid var(--pb-hair)"
                  fontFamily="var(--pb-mono)"
                  fontSize="11px"
                  fontWeight={500}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  _hover={{ bg: 'rgba(31,138,79,0.18)', borderColor: 'var(--pb-hair-2)' }}
                  onClick={onAddIncome}
                >
                  + Add income
                </Button>
              )}
              {onAddExpense && (
                <Button
                  flex={1}
                  h="36px"
                  borderRadius="999px"
                  bg="var(--pb-tint-coral)"
                  color="var(--pb-coral)"
                  border="1px solid var(--pb-hair)"
                  fontFamily="var(--pb-mono)"
                  fontSize="11px"
                  fontWeight={500}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  _hover={{ bg: 'rgba(194,58,44,0.16)', borderColor: 'var(--pb-hair-2)' }}
                  onClick={onAddExpense}
                >
                  + Add expense
                </Button>
              )}
            </HStack>
          )}
        </VStack>

        {/* Right — net balance card */}
        <VStack
          align="stretch"
          justify="center"
          borderLeft={{ base: 'none', md: '1px solid var(--pb-hair)' }}
          borderTop={{ base: '1px solid var(--pb-hair)', md: 'none' }}
          pl={{ base: 0, md: 8 }}
          pt={{ base: 5, md: 0 }}
          spacing={3}
        >
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            Net balance in {monthName}
          </Text>

          <Text
            fontFamily="var(--pb-serif)"
            fontSize="clamp(1.9rem, 4vw, 2.4rem)"
            fontWeight={500}
            lineHeight={1.05}
            color={netColor}
            style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
          >
            {netLabel}
          </Text>

          {/* Ledger rows — the two sides that make up the figure above */}
          <VStack align="stretch" spacing={0} pt={1}>
            <LedgerRow label="Income" value={fmtCurrency(income)} color="var(--pb-income-2)" />
            <LedgerRow label="Expenses" value={fmtCurrency(expense)} color="var(--pb-coral)" />
          </VStack>
        </VStack>
      </Grid>
    </Panel>
  )
}

function LedgerRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <HStack justify="space-between" align="baseline" py={2} borderTop="1px solid var(--pb-hair)">
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="10px"
        letterSpacing="0.16em"
        textTransform="uppercase"
        color="var(--pb-ink-faint)"
      >
        {label}
      </Text>
      <Text
        fontFamily="var(--pb-serif)"
        fontSize="sm"
        fontWeight={500}
        color={color}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
    </HStack>
  )
}
