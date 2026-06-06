import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
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
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  deleteCategoryBudget,
  getCashFlowForecast,
  listCategoryBudgets,
  upsertCategoryBudget,
} from '../api'
import { CashFlowEvent, CashFlowForecast, CategoryBudget } from '../types'
import { ToastService } from '../services/toast'

const monthValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const money = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

export default function PlanningPage() {
  const [selectedMonth, setSelectedMonth] = useState(monthValue(new Date()))
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [forecast, setForecast] = useState<CashFlowForecast | null>(null)
  const [category, setCategory] = useState('')
  const [limitAmount, setLimitAmount] = useState(0)
  const [saving, setSaving] = useState(false)

  const cardBg = useColorModeValue('white', 'whiteAlpha.50')
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.150')
  const muted = useColorModeValue('gray.600', 'gray.400')

  const selectedDate = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number)
    return new Date(year, month - 1, 1)
  }, [selectedMonth])

  const load = useCallback(async () => {
    try {
      const [budgetItems, forecastData] = await Promise.all([
        listCategoryBudgets(selectedDate),
        getCashFlowForecast(),
      ])
      setBudgets(budgetItems)
      setForecast(forecastData)
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not load planning data', dedupeKey: 'planning-load-failed' })
    }
  }, [selectedDate])

  useEffect(() => { void load() }, [load])

  const saveBudget = async () => {
    if (!category.trim() || limitAmount <= 0) return
    setSaving(true)
    try {
      await upsertCategoryBudget({
        category: category.trim(),
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1,
        limitAmount,
      })
      setCategory('')
      setLimitAmount(0)
      await load()
      ToastService.success({ title: 'Budget saved', dedupeKey: 'budget-saved' })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not save budget', dedupeKey: 'budget-save-failed' })
    } finally {
      setSaving(false)
    }
  }

  const removeBudget = async (budget: CategoryBudget) => {
    try {
      await deleteCategoryBudget(budget.id)
      await load()
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not delete budget', dedupeKey: `budget-delete-failed:${budget.id}` })
    }
  }

  const groupedEvents = useMemo(() => {
    const groups = new Map<string, CashFlowEvent[]>()
    for (const event of forecast?.events ?? []) {
      const current = groups.get(event.date) ?? []
      current.push(event)
      groups.set(event.date, current)
    }
    return Array.from(groups.entries()).slice(0, 45)
  }, [forecast])

  return (
    <Box maxW="1500px" mx="auto" px={{ base: 3, md: 6 }} py={{ base: 4, md: 7 }}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg">Planning</Heading>
          <Text color={muted} mt={1}>Category budgets, future balances and payment calendar.</Text>
        </Box>

        {forecast?.horizons.some((item) => item.negative) && (
          <Alert status="error" borderRadius="xl">
            <AlertIcon />
            <AlertDescription>
              The projected total balance becomes negative within the next 90 days.
            </AlertDescription>
          </Alert>
        )}

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat><StatLabel>Current total</StatLabel><StatNumber>{money(forecast?.currentTotalBalance ?? 0)}</StatNumber></Stat>
            </CardBody>
          </Card>
          {(forecast?.horizons ?? []).map((horizon) => (
            <Card key={horizon.days} bg={cardBg} border="1px solid" borderColor={horizon.negative ? 'red.400' : borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Expected in {horizon.days} days</StatLabel>
                  <StatNumber color={horizon.negative ? 'red.500' : undefined}>{money(horizon.expectedBalance)}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">Monthly category budgets</Heading>
                  <Input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} maxW="180px" />
                </HStack>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Groceries" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Monthly limit</FormLabel>
                    <NumberInput min={0} precision={2} value={limitAmount} onChange={(_, value) => setLimitAmount(value || 0)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
                <Button colorScheme="blue" onClick={saveBudget} isLoading={saving} isDisabled={!category.trim() || limitAmount <= 0}>
                  Save category limit
                </Button>

                {budgets.map((budget) => (
                  <Box key={budget.id} p={4} border="1px solid" borderColor={budget.exceeded ? 'red.400' : borderColor} borderRadius="xl">
                    <HStack justify="space-between" mb={2}>
                      <Box>
                        <Text fontWeight={800}>{budget.category}</Text>
                        <Text fontSize="sm" color={muted}>
                          {money(budget.spentAmount)} of {money(budget.limitAmount)}
                        </Text>
                      </Box>
                      <VStack align="flex-end" spacing={1}>
                        <Badge colorScheme={budget.exceeded ? 'red' : budget.percentageUsed >= 80 ? 'orange' : 'green'}>
                          {budget.percentageUsed.toFixed(0)}%
                        </Badge>
                        <Button size="xs" variant="ghost" colorScheme="red" onClick={() => removeBudget(budget)}>Remove</Button>
                      </VStack>
                    </HStack>
                    <Progress
                      value={Math.min(100, budget.percentageUsed)}
                      colorScheme={budget.exceeded ? 'red' : budget.percentageUsed >= 80 ? 'orange' : 'green'}
                      borderRadius="full"
                    />
                    {budget.exceeded && (
                      <Text mt={2} fontSize="sm" color="red.500" fontWeight={700}>
                        Limit exceeded by {money(Math.abs(budget.remainingAmount))}
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Bills and cash-flow calendar</Heading>
                <Text fontSize="sm" color={muted}>
                  Includes future installments, fixed payments, transfers and remaining category budgets.
                </Text>
                {groupedEvents.length === 0 && <Text color={muted}>No projected movements in the next 90 days.</Text>}
                {groupedEvents.map(([date, events]) => (
                  <Box key={date} borderLeft="3px solid" borderColor="blue.400" pl={4} py={1}>
                    <Text fontWeight={800}>{new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</Text>
                    <VStack align="stretch" spacing={1} mt={2}>
                      {events.map((event, index) => (
                        <HStack key={`${event.kind}-${event.description}-${index}`} justify="space-between">
                          <Box minW={0}>
                            <Text fontSize="sm" fontWeight={600} noOfLines={1}>{event.description}</Text>
                            <Text fontSize="xs" color={muted}>{event.accountName || event.kind} - {event.category || 'Uncategorised'}</Text>
                          </Box>
                          <Text fontWeight={800} color={event.amount >= 0 ? 'green.500' : 'red.500'}>
                            {money(event.amount)}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
