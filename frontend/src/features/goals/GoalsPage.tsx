import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Icon,
  NumberInput,
  NumberInputField,
  Progress,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  archiveSavingsGoal,
  contributeToSavingsGoal,
  createSavingsGoal,
  listSavingsGoals,
} from '../../api'
import { SavingsGoal } from '../../types'
import { ToastService } from '../../services/toast'
import { useDashboardData } from '../../hooks/useDashboardData'
import { usePeriodData } from '../../hooks/usePeriodData'
import BalanceBreakEvenPanel from '../../components/charts/modal/BalanceBreakEvenPanel'
import PennyChallengeCard from '../../components/goals/PennyChallengeCard'
import PennyChallengeSummaryRow from '../../components/goals/PennyChallengeSummaryRow'
import StartChallengeDialog from '../../components/goals/StartChallengeDialog'
import { ChevronDown, ChevronUp, Sparkles } from '../../components/ui/icons'
import {
  CHALLENGE_NAME_PREFIX,
  challengeYearTotal,
  expectedCumulativeToday,
  isPennyChallengeGoal,
} from '../../utils/pennyChallenge'

const money = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

const CHALLENGE_COLLAPSED_KEY = 'goals:challenge-collapsed'

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [contributions, setContributions] = useState<Record<number, number>>({})
  const [challengeBusyId, setChallengeBusyId] = useState<number | null>(null)
  const [startingChallenge, setStartingChallenge] = useState(false)
  const [confirmStartOpen, setConfirmStartOpen] = useState(false)
  const [challengeCollapsed, setChallengeCollapsed] = useState(() => {
    try {
      return localStorage.getItem(CHALLENGE_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })

  const muted = 'var(--pb-ink-soft)'
  const spinnerColor = 'var(--pb-forest-2)'

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

  const activeGoals = useMemo(() => goals.filter((goal) => !goal.archived), [goals])
  const challengeGoals = useMemo(() => activeGoals.filter(isPennyChallengeGoal), [activeGoals])
  const normalGoals = useMemo(
    () => activeGoals.filter((goal) => !isPennyChallengeGoal(goal)),
    [activeGoals],
  )

  const toggleChallengeCollapsed = () => {
    setChallengeCollapsed((current) => {
      const next = !current
      try {
        localStorage.setItem(CHALLENGE_COLLAPSED_KEY, String(next))
      } catch {
        // Keep the preference for this session when storage is unavailable.
      }
      return next
    })
  }

  // Contribute an explicit amount to a challenge goal (catch-up or today's coin).
  const applyChallengeContribution = async (goal: SavingsGoal, amount: number) => {
    const rounded = Math.round(amount * 100) / 100
    if (rounded === 0) return
    setChallengeBusyId(goal.id)
    try {
      await contributeToSavingsGoal(goal.id, rounded)
      await load()
      ToastService.success({ title: 'Challenge updated', dedupeKey: `challenge-contribution:${goal.id}` })
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not update challenge',
        dedupeKey: `challenge-contribution-failed:${goal.id}`,
      })
    } finally {
      setChallengeBusyId(null)
    }
  }

  // Create this year's challenge, seeded so it's already caught up to today.
  const startChallenge = async () => {
    const today = new Date()
    const year = today.getFullYear()
    setStartingChallenge(true)
    try {
      await createSavingsGoal({
        name: `${CHALLENGE_NAME_PREFIX} ${year}`,
        targetAmount: challengeYearTotal(year),
        currentAmount: expectedCumulativeToday(year, today),
        targetDate: `${year}-12-31`,
        color: '#f59e0b',
      })
      await load()
      setConfirmStartOpen(false)
      ToastService.success({ title: 'Challenge started', dedupeKey: 'challenge-started' })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not start challenge', dedupeKey: 'challenge-start-failed' })
    } finally {
      setStartingChallenge(false)
    }
  }

  return (
    <Box maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <VStack align="stretch" spacing={6}>

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

        {/* Penny-a-day challenge */}
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" px={1}>
            <Text fontSize="2xs" fontWeight={800} color={muted} textTransform="uppercase" letterSpacing="0.08em">
              Savings challenge
            </Text>
            {challengeGoals.length === 0 ? (
              <Button
                size="sm"
                colorScheme="orange"
                variant="ghost"
                leftIcon={<Sparkles size={16} weight="duotone" />}
                onClick={() => setConfirmStartOpen(true)}
              >
                Start penny-a-day challenge
              </Button>
            ) : (
              <Button
                size="xs"
                variant="ghost"
                color={muted}
                rightIcon={<Icon as={challengeCollapsed ? ChevronDown : ChevronUp} boxSize={4} />}
                onClick={toggleChallengeCollapsed}
              >
                {challengeCollapsed ? 'Expand' : 'Collapse'}
              </Button>
            )}
          </HStack>
          {challengeGoals.length === 0 ? (
            <Card borderStyle="dashed" borderWidth="1px">
              <CardBody>
                <Text fontSize="sm" color={muted}>
                  Save £0.01 on Jan 1, £0.02 on Jan 2, increasing by a penny every day up to
                  the last day of the year — {money(challengeYearTotal(new Date().getFullYear()))} saved
                  in total. Starting today seeds it caught up to the current day.
                </Text>
              </CardBody>
            </Card>
          ) : challengeCollapsed ? (
            <VStack align="stretch" spacing={3}>
              {challengeGoals.map((goal) => (
                <PennyChallengeSummaryRow
                  key={goal.id}
                  goal={goal}
                  onExpand={toggleChallengeCollapsed}
                />
              ))}
            </VStack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
              {challengeGoals.map((goal) => (
                <PennyChallengeCard
                  key={goal.id}
                  goal={goal}
                  busy={challengeBusyId === goal.id}
                  onContribute={applyChallengeContribution}
                  onArchive={archive}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
          {normalGoals.map((goal) => (
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

      <StartChallengeDialog
        isOpen={confirmStartOpen}
        onClose={() => setConfirmStartOpen(false)}
        onConfirm={startChallenge}
        isLoading={startingChallenge}
      />
    </Box>
  )
}
