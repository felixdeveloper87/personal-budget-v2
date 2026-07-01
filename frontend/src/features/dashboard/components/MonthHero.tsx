import { Grid, HStack, Text, VStack, Button } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
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
  const netColor = net < 0 ? 'var(--pb-coral)' : 'var(--pb-income-2)'
  const monthName = (date ?? new Date()).toLocaleDateString('en-GB', { month: 'long' })

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
        {/* Left — statement: lede, flow bars and the month's net */}
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

          {/* Flow bars (labels carry the exact income/expense figures) */}
          <FlowBars income={income} expense={expense} transactions={transactions} />

          {/* Net balance — the statement's bottom line */}
          <HStack
            justify="space-between"
            align="baseline"
            pt={3}
            borderTop="1px solid var(--pb-hair)"
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
              fontSize="clamp(1.3rem, 2.6vw, 1.7rem)"
              fontWeight={600}
              lineHeight={1}
              color={netColor}
              style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
            >
              {netLabel}
            </Text>
          </HStack>
        </VStack>

        {/* Right — quick add: where new entries come in */}
        {(onAddIncome || onAddExpense) && (
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
              New entry
            </Text>

            <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-soft)" lineHeight={1.55}>
              Record what happened — every entry keeps {monthName}'s ledger honest.
            </Text>

            <VStack align="stretch" spacing={2.5} pt={1}>
              {onAddIncome && (
                <Button
                  h="46px"
                  borderRadius="14px"
                  bg="var(--pb-income)"
                  color="var(--pb-paper-3)"
                  fontFamily="var(--pb-mono)"
                  fontSize="12px"
                  fontWeight={600}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  leftIcon={<Plus size={15} strokeWidth={2.5} />}
                  boxShadow="var(--pb-shadow)"
                  _hover={{ bg: 'var(--pb-income-2)', transform: 'translateY(-1px)', boxShadow: 'var(--pb-shadow-lift)' }}
                  _active={{ transform: 'translateY(0)' }}
                  onClick={onAddIncome}
                >
                  Add income
                </Button>
              )}
              {onAddExpense && (
                <Button
                  h="46px"
                  borderRadius="14px"
                  bg="var(--pb-coral)"
                  color="var(--pb-paper-3)"
                  fontFamily="var(--pb-mono)"
                  fontSize="12px"
                  fontWeight={600}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  leftIcon={<Plus size={15} strokeWidth={2.5} />}
                  boxShadow="var(--pb-shadow)"
                  _hover={{ bg: 'var(--pb-coral-2)', transform: 'translateY(-1px)', boxShadow: 'var(--pb-shadow-lift)' }}
                  _active={{ transform: 'translateY(0)' }}
                  onClick={onAddExpense}
                >
                  Add expense
                </Button>
              )}
            </VStack>
          </VStack>
        )}
      </Grid>
    </Panel>
  )
}
