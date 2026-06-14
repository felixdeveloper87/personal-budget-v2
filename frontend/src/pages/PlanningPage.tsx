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
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2 } from '../components/ui/icons'
import { PageHeader } from '../components/ui'
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
    'cash-flow',
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
    <Box maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <VStack align="stretch" spacing={6}>
        <PageHeader
          icon={CalendarClock}
          title="Planning"
          subtitle="Category budgets, future balances and payment calendar."
        />

        {!currentMonthLoading && currentMonthData.balance > 0 && (
          <HStack
            align="flex-start"
            spacing={3}
            border="1px solid"
            borderColor={successBorder}
            borderRadius="xl"
            bg={successBg}
            px={4}
            py={3}
          >
            <Box
              w={8}
              h={8}
              borderRadius="full"
              bg={successIconBg}
              color={successColor}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Icon as={CheckCircle2} boxSize={4.5} weight="fill" />
            </Box>
            <VStack align="stretch" spacing={0.5}>
              <Text fontSize="sm" fontWeight={800} color={successColor}>
                You are ahead this month
              </Text>
              <Text fontSize="xs" color={muted} lineHeight="1.35">
                {money(currentMonthData.income)} income minus {money(currentMonthData.expense)} expenses leaves {money(currentMonthData.balance)} ahead.
              </Text>
            </VStack>
          </HStack>
        )}

        {!currentMonthLoading && currentMonthData.balance < 0 && (
          <HStack
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
            spacing={{ base: 3, md: 4 }}
            flexDirection={{ base: 'column', md: 'row' }}
            border="1px solid"
            borderColor={deficitBorder}
            borderRadius="xl"
            bg={deficitBg}
            px={4}
            py={3}
          >
            <HStack align="flex-start" spacing={3}>
              <Box
                w={8}
                h={8}
                borderRadius="full"
                bg={deficitIconBg}
                color={deficitColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={AlertTriangle} boxSize={5} weight="fill" />
              </Box>
              <VStack align="stretch" spacing={0.5}>
                <Text fontSize="sm" fontWeight={800} color={deficitColor}>
                  Monthly deficit
                </Text>
                <Text fontSize="xs" color={muted} lineHeight="1.35">
                  {money(currentMonthData.expense)} expenses against {money(currentMonthData.income)} income leaves a {money(Math.abs(currentMonthData.balance))} gap.
                </Text>
              </VStack>
            </HStack>
            <Button
              colorScheme="red"
              size="sm"
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
            px={3}
            py={2}
          >
            <AlertIcon boxSize={4} mt={0.5} />
            <Box>
              <Text fontSize="sm" fontWeight={800} lineHeight="1.3">
                {firstPositiveMonth
                  ? `Projected to return positive in ${monthLabel(firstPositiveMonth.month)}`
                  : 'No positive balance projected in the next 12 months'}
              </Text>
              <AlertDescription fontSize="xs" lineHeight="1.35">
                {firstPositiveMonth
                  ? `Projected closing balance: ${money(firstPositiveMonth.projectedClosingBalance)}.`
                  : 'Review income, budgets and recurring expenses.'}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {firstNegativeMonth && (
          <Alert status="error" borderRadius="xl" px={3} py={2}>
            <AlertIcon boxSize={4} />
            <AlertDescription fontSize="sm" lineHeight="1.35">
              Balance may run out in {monthLabel(firstNegativeMonth.month)} ({money(firstNegativeMonth.projectedClosingBalance)}).
            </AlertDescription>
          </Alert>
        )}

        {forecast && (
          <Alert
            status={forecast.hasProjectionBasis ? 'info' : 'warning'}
            borderRadius="xl"
            alignItems="flex-start"
            px={3}
            py={2}
          >
            <AlertIcon boxSize={4} mt={0.5} />
            <Box>
              <Text fontSize="sm" fontWeight={800} lineHeight="1.3">
                {forecast.hasProjectionBasis
                  ? `Recent pattern from ${basisLabel}`
                  : 'Not enough recent transaction history'}
              </Text>
              <AlertDescription fontSize="xs" lineHeight="1.35">
                {forecast.hasProjectionBasis
                  ? `From ${money(forecast.currentTotalBalance)}, including scheduled commitments. ${
                      forecast.hasIncomePlan
                        ? `Income target: ${money(forecast.plannedMonthlyIncome ?? 0)}/month`
                        : `Average income: ${money(forecast.averageMonthlyIncome)}/month`
                    }; average variable spending: ${money(forecast.averageMonthlyVariableExpense)}/month.`
                  : 'Only scheduled fixed payments and installments are included for now.'}
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <HStack
                align={{ base: 'stretch', md: 'baseline' }}
                justify="space-between"
                spacing={{ base: 1, md: 4 }}
                flexDirection={{ base: 'column', md: 'row' }}
              >
                <Heading size="md" flexShrink={0}>Expected monthly income</Heading>
                <Text fontSize="sm" color={muted}>
                  Overrides the historical average. Set 0 to use transaction history.
                </Text>
              </HStack>
              <HStack align="center" spacing={{ base: 2, md: 3 }} flexWrap={{ base: 'nowrap', md: 'wrap' }}>
                <FormControl
                  maxW={{ base: '110px', md: '360px' }}
                  display="flex"
                  alignItems="center"
                  gap={3}
                >
                  <FormLabel mb={0} flexShrink={0} display={{ base: 'none', md: 'block' }}>
                    Target per month
                  </FormLabel>
                  <NumberInput min={0} precision={2} value={incomePlan} onChange={(_, value) => setIncomePlan(value || 0)}>
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <Button
                  colorScheme="blue"
                  onClick={saveIncomePlan}
                  isLoading={savingIncomePlan}
                  px={{ base: 3, md: 4 }}
                  flexShrink={0}
                >
                  {incomePlan > 0 ? 'Save' : 'Clear'}
                  <Text as="span" display={{ base: 'none', md: 'inline' }} ml={1}>
                    expected income
                  </Text>
                </Button>
                {forecast?.hasIncomePlan && (
                  <Badge
                    colorScheme="purple"
                    fontSize="xs"
                    px={{ base: 1.5, md: 2 }}
                    py={1}
                    borderRadius="md"
                    whiteSpace="nowrap"
                  >
                    <Text as="span" display={{ base: 'none', md: 'inline' }}>Active: </Text>
                    {money(forecast.plannedMonthlyIncome ?? 0)}
                    <Text as="span" display={{ base: 'none', md: 'inline' }}>/month</Text>
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
