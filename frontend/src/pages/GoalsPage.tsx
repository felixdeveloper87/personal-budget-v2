import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  NumberInput,
  NumberInputField,
  Progress,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  archiveSavingsGoal,
  contributeToSavingsGoal,
  listSavingsGoals,
} from '../api'
import { SavingsGoal } from '../types'
import { ToastService } from '../services/toast'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodData } from '../hooks/usePeriodData'
import BalanceBreakEvenPanel from '../components/charts/modal/BalanceBreakEvenPanel'

const money = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [contributions, setContributions] = useState<Record<number, number>>({})

  const muted = useColorModeValue('gray.600', 'gray.400')
  const spinnerColor = useColorModeValue('blue.500', 'blue.300')

  // Break-even target — fixed to the current month (goals are about now).
  const currentMonth = useMemo(() => new Date(), [])
  const {
    transactions: balanceTransactions,
    monthSummary,
    loading: balanceLoading,
  } = useDashboardData(currentMonth, 'month')
  const periodData = usePeriodData(
    balanceTransactions,
    monthSummary,
    'month',
    currentMonth,
    'cash-flow',
  )

  const load = useCallback(async () => {
    try {
      setGoals(await listSavingsGoals())
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not load goals', dedupeKey: 'goals-load-failed' })
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const contribute = async (goal: SavingsGoal) => {
    const amount = contributions[goal.id] ?? 0
    if (amount === 0) return
    try {
      await contributeToSavingsGoal(goal.id, amount)
      setContributions((current) => ({ ...current, [goal.id]: 0 }))
      await load()
      ToastService.success({ title: amount > 0 ? 'Contribution added' : 'Withdrawal recorded', dedupeKey: `goal-contribution:${goal.id}` })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not update goal', dedupeKey: `goal-contribution-failed:${goal.id}` })
    }
  }

  const archive = async (goal: SavingsGoal) => {
    try {
      await archiveSavingsGoal(goal.id)
      await load()
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not archive goal', dedupeKey: `goal-archive-failed:${goal.id}` })
    }
  }

  return (
    <Box maxW="1400px" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg">Savings goals</Heading>
          <Text color={muted} mt={1}>Track dedicated targets without changing account balances.</Text>
        </Box>

        {balanceLoading ? (
          <HStack justify="center" py={10}>
            <Spinner color={spinnerColor} thickness="3px" speed="0.8s" />
          </HStack>
        ) : (
          <BalanceBreakEvenPanel
            currentBalance={periodData.balance}
            selectedDate={currentMonth}
            periodType="month"
            transactions={periodData.transactions}
          />
        )}

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
          {goals.filter((goal) => !goal.archived).map((goal) => (
            <Card key={goal.id}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="sm">{goal.name}</Heading>
                    <Badge colorScheme={goal.progressPercentage >= 100 ? 'green' : 'blue'}>
                      {goal.progressPercentage.toFixed(0)}%
                    </Badge>
                  </HStack>
                  <Progress
                    value={Math.min(100, goal.progressPercentage)}
                    colorScheme={goal.progressPercentage >= 100 ? 'green' : 'blue'}
                    borderRadius="full"
                    size="lg"
                  />
                  <HStack justify="space-between">
                    <Box>
                      <Text fontSize="xs" color={muted}>Saved</Text>
                      <Text fontWeight={800}>{money(goal.currentAmount)}</Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="xs" color={muted}>Target</Text>
                      <Text fontWeight={800}>{money(goal.targetAmount)}</Text>
                    </Box>
                  </HStack>
                  <Text fontSize="sm" color={muted}>
                    {money(goal.remainingAmount)} remaining
                    {goal.targetDate ? ` - target ${new Date(`${goal.targetDate}T12:00:00`).toLocaleDateString('en-GB')}` : ''}
                  </Text>
                  <HStack>
                    <NumberInput
                      flex={1}
                      precision={2}
                      value={contributions[goal.id] ?? 0}
                      onChange={(_, value) => setContributions((current) => ({ ...current, [goal.id]: value || 0 }))}
                    >
                      <NumberInputField placeholder="Contribution" />
                    </NumberInput>
                    <Button colorScheme="teal" onClick={() => contribute(goal)}>Apply</Button>
                  </HStack>
                  <Button size="sm" variant="ghost" colorScheme="red" onClick={() => archive(goal)}>
                    Archive goal
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
