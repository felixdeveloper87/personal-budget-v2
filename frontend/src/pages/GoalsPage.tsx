import { useCallback, useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Progress,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  archiveSavingsGoal,
  contributeToSavingsGoal,
  createSavingsGoal,
  listSavingsGoals,
} from '../api'
import { SavingsGoal } from '../types'
import { ToastService } from '../services/toast'

const money = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState(0)
  const [currentAmount, setCurrentAmount] = useState(0)
  const [targetDate, setTargetDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [contributions, setContributions] = useState<Record<number, number>>({})

  const muted = useColorModeValue('gray.600', 'gray.400')

  const load = useCallback(async () => {
    try {
      setGoals(await listSavingsGoals())
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not load goals', dedupeKey: 'goals-load-failed' })
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const create = async () => {
    if (!name.trim() || targetAmount <= 0) return
    setSaving(true)
    try {
      await createSavingsGoal({
        name: name.trim(),
        targetAmount,
        currentAmount,
        targetDate: targetDate || null,
        color: '#2563eb',
      })
      setName('')
      setTargetAmount(0)
      setCurrentAmount(0)
      setTargetDate('')
      await load()
      ToastService.success({ title: 'Savings goal created', dedupeKey: 'goal-created' })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not create goal', dedupeKey: 'goal-create-failed' })
    } finally {
      setSaving(false)
    }
  }

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

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Create a goal</Heading>
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Emergency fund" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Target</FormLabel>
                  <NumberInput min={0} precision={2} value={targetAmount} onChange={(_, value) => setTargetAmount(value || 0)}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Already saved</FormLabel>
                  <NumberInput min={0} precision={2} value={currentAmount} onChange={(_, value) => setCurrentAmount(value || 0)}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Target date</FormLabel>
                  <Input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
                </FormControl>
              </SimpleGrid>
              <Button colorScheme="blue" onClick={create} isLoading={saving} isDisabled={!name.trim() || targetAmount <= 0}>
                Create goal
              </Button>
            </VStack>
          </CardBody>
        </Card>

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
