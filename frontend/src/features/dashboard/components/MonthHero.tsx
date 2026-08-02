import { Button, Grid, HStack, Text, VStack } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import Panel from './Panel'
import FlowBars from './FlowBars'
import { fmtCurrency } from './format'

interface MonthHeroProps {
  income: number
  expense: number
  net: number
  transactions: number
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
  const monthName = (date ?? new Date()).toLocaleDateString('en-GB', { month: 'long' })
  const netLabel = `${net < 0 ? '−' : ''}${fmtCurrency(Math.abs(net))}`
  const netColor = net < 0 ? 'var(--pb-coral)' : 'var(--pb-income-2)'

  return (
    <Panel
      background="linear-gradient(135deg, var(--pb-surface) 0%, var(--pb-surface-2) 100%)"
      p={0}
      overflow="hidden"
    >
      <Grid
        templateColumns={{ base: '1fr', md: 'minmax(0, 1.35fr) minmax(240px, 0.8fr)' }}
        gap="clamp(1.4rem, 3vw, 2.2rem)"
        p="clamp(1.5rem, 3.4vw, 2.4rem)"
      >
        <VStack align="stretch" spacing={4}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            fontWeight={600}
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            Cash flow · {monthName}
          </Text>

          <Text
            fontFamily="var(--pb-serif)"
            fontSize="clamp(1.65rem, 3.8vw, 2.35rem)"
            fontWeight={400}
            lineHeight={1.08}
            color="var(--pb-ink)"
            maxW="20ch"
          >
            {deficit ? (
              <>
                You are{' '}
                <Text as="em" color="var(--pb-coral)">
                  {fmtCurrency(expense - income)} over
                </Text>{' '}
                this month’s income.
              </>
            ) : (
              <>
                You have{' '}
                <Text as="em" color="var(--pb-income-2)">
                  {fmtCurrency(income - expense)} left
                </Text>{' '}
                after spending.
              </>
            )}
          </Text>

          <Text fontFamily="var(--pb-serif)" fontSize="md" color="var(--pb-ink-soft)" lineHeight={1.5}>
            {deficit
              ? 'Add income to close the gap, or keep an eye on further spending.'
              : 'Your income is covering spending for this month.'}
          </Text>

          <FlowBars income={income} expense={expense} transactions={transactions} />

          <HStack justify="space-between" align="baseline" pt={2} borderTop="1px solid var(--pb-hair)">
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10.5px"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              Balance after spending
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

        {(onAddIncome || onAddExpense) && (
          <VStack
            align="stretch"
            justify="center"
            borderLeft={{ base: 'none', md: '1px solid var(--pb-hair)' }}
            borderTop={{ base: '1px solid var(--pb-hair)', md: 'none' }}
            pl={{ base: 0, md: 8 }}
            pt={{ base: 5, md: 0 }}
            spacing={3.5}
          >
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10.5px"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              Recommended next step
            </Text>

            <Text fontFamily="var(--pb-serif)" fontSize="xl" color="var(--pb-ink)" lineHeight={1.15}>
              {deficit ? 'Bring your income up to date.' : 'Keep your month up to date.'}
            </Text>

            <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-soft)" lineHeight={1.55}>
              {deficit
                ? 'Recording income will give this month a complete cash-flow picture.'
                : `Record new entries to keep ${monthName}'s cash flow current.`}
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
                  h="42px"
                  borderRadius="14px"
                  variant="ghost"
                  color="var(--pb-ink-soft)"
                  border="1px solid var(--pb-hair)"
                  fontFamily="var(--pb-mono)"
                  fontSize="11px"
                  fontWeight={600}
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                  leftIcon={<Plus size={14} strokeWidth={2.5} />}
                  _hover={{ bg: 'var(--pb-surface-3)', color: 'var(--pb-ink)' }}
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
