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
  Icon,
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
  updateIncomePlan,
  upsertCategoryBudget,
} from '../api'
import { CashFlowForecast, CategoryBudget } from '../types'
import { ToastService } from '../services/toast'
import { AlertTriangle, ArrowRight, CheckCircle2 } from '../components/ui/icons'
import type { AppPage } from '../components/layout/header/navigation.config'
import { useDashboardData } from '../hooks/useDashboardData'
import { usePeriodData } from '../hooks/usePeriodData'

const monthValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const money = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
const signedMoney = (value: number) => `${value >= 0 ? '+' : ''}${money(value)}`
const monthLabel = (value?: string) => {
  if (!value) return 'the previous month'
  const [year, month] = value.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

interface PlanningPageProps {
  onPageChange?: (page: AppPage) => void
}

export default function PlanningPage({ onPageChange }: PlanningPageProps) {
  const [selectedMonth, setSelectedMonth] = useState(monthValue(new Date()))
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [forecast, setForecast] = useState<CashFlowForecast | null>(null)
  const [category, setCategory] = useState('')
  const [limitAmount, setLimitAmount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [incomePlan, setIncomePlan] = useState(0)
  const [savingIncomePlan, setSavingIncomePlan] = useState(false)

  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const muted = useColorModeValue('gray.600', 'gray.400')
  const successBg = useColorModeValue('green.50', 'rgba(22,101,52,0.18)')
  const successBorder = useColorModeValue('green.200', 'green.700')
  const successIconBg = useColorModeValue('green.100', 'green.900')
  const successColor = useColorModeValue('green.600', 'green.300')
  const deficitBg = useColorModeValue('red.50', 'rgba(153,27,27,0.18)')
  const deficitBorder = useColorModeValue('red.200', 'red.700')
  const deficitIconBg = useColorModeValue('red.100', 'red.900')
  const deficitColor = useColorModeValue('red.600', 'red.300')

  const currentMonth = useMemo(() => new Date(), [])
  const {
    transactions: currentMonthTransactions,
    monthSummary: currentMonthSummary,
    loading: currentMonthLoading,
  } = useDashboardData(currentMonth, 'month')
  const currentMonthData = usePeriodData(
    currentMonthTransactions,
    currentMonthSummary,
    'month',
    currentMonth,
  )

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
      setIncomePlan(forecastData.plannedMonthlyIncome ?? 0)
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

  const saveIncomePlan = async () => {
    setSavingIncomePlan(true)
    try {
      const forecastData = await updateIncomePlan(incomePlan > 0 ? incomePlan : null)
      setForecast(forecastData)
      setIncomePlan(forecastData.plannedMonthlyIncome ?? 0)
      ToastService.success({
        title: incomePlan > 0 ? 'Expected income saved' : 'Expected income cleared',
        dedupeKey: 'income-plan-saved',
      })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not save expected income', dedupeKey: 'income-plan-save-failed' })
    } finally {
      setSavingIncomePlan(false)
    }
  }

  const firstNegativeMonth = forecast?.months.find((item) => item.negative)
  const firstPositiveMonth = forecast?.months.find(
    (item) => item.projectedClosingBalance > 0,
  )
  // Projected balance at key horizons, rolled forward from the current account balance.
  const horizons = forecast
    ? [
        { label: 'Balance in 3 months', month: forecast.months[2] },
        { label: 'Balance in 6 months', month: forecast.months[5] },
        { label: 'Balance in 12 months', month: forecast.months[11] },
      ].filter((item) => item.month)
    : []
  const basisLabel = forecast?.projectionBasisMonths.map(monthLabel).join(', ')
  const basisCount = forecast?.projectionBasisMonths.length ?? 0
  const variableLabel = basisCount > 0 ? `Variable (${basisCount}-mo avg)` : 'Variable'

  return (
    <Box maxW="1400px" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg">Planning</Heading>
          <Text color={muted} mt={1}>Category budgets, future balances and payment calendar.</Text>
        </Box>

        {!currentMonthLoading && currentMonthData.balance > 0 && (
          <HStack
            align="flex-start"
            spacing={{ base: 3, sm: 4 }}
            border="1px solid"
            borderColor={successBorder}
            borderRadius={{ base: 'xl', sm: '2xl' }}
            bg={successBg}
            p={{ base: 4, sm: 5 }}
          >
            <Box
              w={{ base: 9, sm: 11 }}
              h={{ base: 9, sm: 11 }}
              borderRadius="full"
              bg={successIconBg}
              color={successColor}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Icon as={CheckCircle2} boxSize={{ base: 5, sm: 6 }} weight="fill" />
            </Box>
            <VStack align="stretch" spacing={1}>
              <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight={800} color={successColor}>
                Great work, you are earning more than you are spending this month!
              </Text>
              <Text fontSize={{ base: 'xs', sm: 'sm' }} color={muted} lineHeight="1.5">
                Income is {money(currentMonthData.income)} and expenses are {money(currentMonthData.expense)}, leaving you {money(currentMonthData.balance)} ahead. Keep building on this positive result.
              </Text>
            </VStack>
          </HStack>
        )}

        {!currentMonthLoading && currentMonthData.balance < 0 && (
          <HStack
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
            spacing={{ base: 4, md: 6 }}
            flexDirection={{ base: 'column', md: 'row' }}
            border="1px solid"
            borderColor={deficitBorder}
            borderRadius={{ base: 'xl', sm: '2xl' }}
            bg={deficitBg}
            p={{ base: 4, sm: 5 }}
          >
            <HStack align="flex-start" spacing={{ base: 3, sm: 4 }}>
              <Box
                w={{ base: 9, sm: 11 }}
                h={{ base: 9, sm: 11 }}
                borderRadius="full"
                bg={deficitIconBg}
                color={deficitColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={AlertTriangle} boxSize={{ base: 5, sm: 6 }} weight="fill" />
              </Box>
              <VStack align="stretch" spacing={1}>
                <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight={800} color={deficitColor}>
                  You are running a monthly deficit
                </Text>
                <Text fontSize={{ base: 'xs', sm: 'sm' }} color={muted} lineHeight="1.5">
                  Expenses are {money(currentMonthData.expense)} against {money(currentMonthData.income)} of income, leaving a {money(Math.abs(currentMonthData.balance))} gap. Use the break-even target to calculate the daily pace needed to recover.
                </Text>
              </VStack>
            </HStack>
            <Button
              colorScheme="red"
              flexShrink={0}
              rightIcon={<Icon as={ArrowRight} boxSize={4} />}
              onClick={() => onPageChange?.('goals')}
            >
              Open break-even target
            </Button>
          </HStack>
        )}

        {!currentMonthLoading && currentMonthData.balance < 0 && forecast && (
          <Alert
            status={firstPositiveMonth ? 'success' : 'warning'}
            borderRadius="xl"
            alignItems="flex-start"
          >
            <AlertIcon mt={0.5} />
            <Box>
              <Text fontWeight={800}>
                {firstPositiveMonth
                  ? `Projected to return positive in ${monthLabel(firstPositiveMonth.month)}`
                  : 'No positive balance projected in the next 12 months'}
              </Text>
              <AlertDescription fontSize="sm">
                {firstPositiveMonth
                  ? `Your projected closing balance reaches ${money(firstPositiveMonth.projectedClosingBalance)} by the end of that month.`
                  : 'Review expected income, category budgets and recurring expenses to build a recovery path.'}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {firstNegativeMonth && (
          <Alert status="error" borderRadius="xl">
            <AlertIcon />
            <AlertDescription>
              Your balance is projected to run out in {monthLabel(firstNegativeMonth.month)}
              {' '}({money(firstNegativeMonth.projectedClosingBalance)}).
            </AlertDescription>
          </Alert>
        )}

        {forecast && (
          <Alert
            status={forecast.hasProjectionBasis ? 'info' : 'warning'}
            borderRadius="xl"
            alignItems="flex-start"
          >
            <AlertIcon mt={0.5} />
            <Box>
              <Text fontWeight={800}>
                {forecast.hasProjectionBasis
                  ? `Recent pattern from ${basisLabel}`
                  : 'Not enough recent transaction history'}
              </Text>
              <AlertDescription fontSize="sm">
                {forecast.hasProjectionBasis
                  ? `Starting from your current balance of ${money(forecast.currentTotalBalance)}, rolled forward month by month. Committed items (fixed payments and installments) follow their real schedule. ${
                      forecast.hasIncomePlan
                        ? `Variable income uses your expected ${money(forecast.plannedMonthlyIncome ?? 0)}/month`
                        : `Variable income is estimated from your average of ${money(forecast.averageMonthlyIncome)}/month`
                    }; spending is estimated from your average of ${money(forecast.averageMonthlyVariableExpense)}/month.`
                  : 'The forecast currently includes only scheduled fixed payments and installments. Add cleared income or expense transactions to build a recent monthly pattern.'}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Box>
                <Heading size="md">Expected monthly income</Heading>
                <Text fontSize="sm" color={muted} mt={1}>
                  For predictable but variable earnings (e.g. gig work with a monthly target).
                  When set, the forecast uses this instead of your past average. Leave 0 to estimate from history.
                </Text>
              </Box>
              <HStack align="flex-end" spacing={3} flexWrap="wrap">
                <FormControl maxW="240px">
                  <FormLabel>Target per month</FormLabel>
                  <NumberInput min={0} precision={2} value={incomePlan} onChange={(_, value) => setIncomePlan(value || 0)}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <Button colorScheme="blue" onClick={saveIncomePlan} isLoading={savingIncomePlan}>
                  {incomePlan > 0 ? 'Save expected income' : 'Clear expected income'}
                </Button>
                {forecast?.hasIncomePlan && (
                  <Badge colorScheme="purple" alignSelf="center">
                    Active: {money(forecast.plannedMonthlyIncome ?? 0)}/month
                  </Badge>
                )}
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {horizons.map(({ label, month }) => (
            <Card key={label} border="1px solid" borderColor={month.projectedClosingBalance < 0 ? 'red.400' : borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>{label}</StatLabel>
                  <StatNumber color={month.projectedClosingBalance < 0 ? 'red.500' : undefined}>
                    {money(month.projectedClosingBalance)}
                  </StatNumber>
                  <Text fontSize="xs" color={muted} mt={1}>Projected balance by end of {monthLabel(month.month)}</Text>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
          <Card>
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

          <Card>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Box>
                  <Heading size="md">12-month cash-flow forecast</Heading>
                  <Text fontSize="sm" color={muted} mt={1}>
                    From next month onwards.{' '}
                    <Text as="span" fontWeight={700}>Income</Text>{' = '}
                    {forecast?.hasIncomePlan
                      ? `recurring + your expected ${money(forecast.plannedMonthlyIncome ?? 0)}/month`
                      : `recurring + average of your last ${basisCount || 3} months${basisLabel ? ` (${basisLabel})` : ''}`}.{' '}
                    <Text as="span" fontWeight={700}>Expenses</Text>{' = '}
                    installments + fixed + average of your last {basisCount || 3} months of one-off spending.
                  </Text>
                </Box>
                {(forecast?.months ?? []).map((month) => {
                  const confidence = month.confidencePercent
                  const confidenceScheme =
                    confidence >= 66 ? 'green' : confidence >= 33 ? 'orange' : 'gray'
                  return (
                    <Box
                      key={month.month}
                      p={3}
                      border="1px solid"
                      borderColor={month.negative ? 'red.400' : borderColor}
                      borderRadius="xl"
                    >
                      <HStack justify="space-between" align="flex-start" spacing={4}>
                        <Box>
                          <Text fontWeight={800}>{monthLabel(month.month)}</Text>
                          <Badge mt={1} colorScheme={confidenceScheme}>{confidence}% committed</Badge>
                        </Box>
                        <Box textAlign="right" flexShrink={0}>
                          <Text fontWeight={900} fontSize="lg" color={month.negative ? 'red.500' : undefined}>
                            {money(month.projectedClosingBalance)}
                          </Text>
                          <HStack justify="flex-end" spacing={2} mt={1}>
                            <Text fontSize="xs" color={muted}>net</Text>
                            <Badge colorScheme={month.netCashFlow >= 0 ? 'green' : 'red'}>
                              {signedMoney(month.netCashFlow)}
                            </Badge>
                          </HStack>
                        </Box>
                      </HStack>

                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mt={3}>
                        <Box>
                          <Text fontSize="xs" fontWeight={800} color={muted} textTransform="uppercase" letterSpacing="0.05em">
                            Income
                          </Text>
                          <Text fontWeight={700} color="green.500">
                            {signedMoney(month.fixedIncome + month.estimatedIncome)}
                          </Text>
                          <Text fontSize="xs" color={muted}>
                            Recurring {money(month.fixedIncome)} · {forecast?.hasIncomePlan ? 'Planned' : 'Estimated'} {money(month.estimatedIncome)}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" fontWeight={800} color={muted} textTransform="uppercase" letterSpacing="0.05em">
                            Expenses
                          </Text>
                          <Text fontWeight={700} color="red.500">
                            {signedMoney(-(month.installmentExpense + month.fixedExpense + month.estimatedVariableExpense))}
                          </Text>
                          <Text fontSize="xs" color={muted}>
                            Installments {money(month.installmentExpense)} · Fixed {money(month.fixedExpense)} · {variableLabel} {money(month.estimatedVariableExpense)}
                          </Text>
                        </Box>
                      </SimpleGrid>

                      <Progress
                        mt={3}
                        value={confidence}
                        colorScheme={confidenceScheme}
                        borderRadius="full"
                        size="sm"
                      />
                    </Box>
                  )
                })}
                {!forecast?.months.length && (
                  <Text color={muted}>No forecast is available yet.</Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
