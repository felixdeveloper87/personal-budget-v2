import { useCallback, useEffect, useState } from 'react'
import {
  Badge,
  Box,
  HStack,
  Icon,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { InstallmentPlan, PeriodType, RecurringTransaction, Transaction } from '../../../types'
import { listInstallmentPlans, listRecurringTransactions } from '../../../api'
import { useAuth } from '../../../contexts/AuthContext'
import { useCashflowForecast, type ForecastEvent } from '../../../hooks/useCashflowForecast'
import { ToastService } from '../../../services/toast'
import {
  AlertTriangle,
  CalendarClock,
  TrendingDown,
  TrendingUp,
  Wallet,
} from '../../ui/icons'
import type { LucideIcon } from '../../ui/icons'
import { ChartPlotShell } from './components'

interface CashflowForecastPanelProps {
  transactions: Transaction[]
  selectedDate: Date
  periodType: PeriodType
}

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

function formatMoney(value: number): string {
  return moneyFormatter.format(value)
}

function sourceLabel(source: ForecastEvent['source']): string {
  if (source === 'recurring') return 'Fixed'
  if (source === 'installment') return 'Installment'
  return 'Planned'
}

function periodHasFutureDays(selectedDate: Date, periodType: PeriodType): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let periodEnd: Date
  switch (periodType) {
    case 'day':
      periodEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      break
    case 'week': {
      const start = new Date(selectedDate)
      start.setHours(0, 0, 0, 0)
      const day = start.getDay()
      const shift = day === 0 ? -6 : 1 - day
      start.setDate(start.getDate() + shift)
      periodEnd = new Date(start)
      periodEnd.setDate(start.getDate() + 6)
      break
    }
    case 'year':
      periodEnd = new Date(selectedDate.getFullYear(), 11, 31)
      break
    case 'month':
    default:
      periodEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
      break
  }
  periodEnd.setHours(0, 0, 0, 0)
  return periodEnd > today
}

export default function CashflowForecastPanel({
  transactions,
  selectedDate,
  periodType,
}: CashflowForecastPanelProps) {
  const shouldRender = periodHasFutureDays(selectedDate, periodType)
  const { user, loading: authLoading } = useAuth()
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(shouldRender)

  const forecast = useCashflowForecast(
    transactions,
    recurringTransactions,
    installmentPlans,
    selectedDate,
    periodType,
  )

  const fetchForecastInputs = useCallback(async () => {
    if (!user?.token || !shouldRender) return

    try {
      setLoading(true)
      const [recurring, plans] = await Promise.all([
        listRecurringTransactions(),
        listInstallmentPlans(),
      ])
      setRecurringTransactions(recurring)
      setInstallmentPlans(plans)
    } catch (err) {
      console.error('Error fetching cashflow forecast:', err)
      ToastService.apiError(err, {
        title: 'Could not load cashflow forecast',
        dedupeKey: 'balance-cashflow-forecast-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [shouldRender, user?.token])

  useEffect(() => {
    if (!shouldRender) {
      setLoading(false)
      return
    }

    if (authLoading || !user?.token) {
      setLoading(false)
      return
    }

    void fetchForecastInputs()
  }, [authLoading, fetchForecastInputs, shouldRender, user?.token])

  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const panelBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const gridStroke = useColorModeValue('rgba(148, 163, 184, 0.18)', 'rgba(148, 163, 184, 0.14)')
  const axisColor = useColorModeValue('#94a3b8', '#64748b')
  const tooltipBg = useColorModeValue('#ffffff', '#0a0a0a')
  const tooltipBorder = useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.08)')
  const tooltipText = useColorModeValue('#111827', '#f9fafb')
  const lineColor = useColorModeValue('#2563eb', '#60a5fa')
  const areaColor = useColorModeValue('rgba(37, 99, 235, 0.14)', 'rgba(96, 165, 250, 0.16)')
  const positiveColor = useColorModeValue('green.600', 'green.300')
  const negativeColor = useColorModeValue('red.600', 'red.300')
  const warningColor = useColorModeValue('orange.600', 'orange.300')

  if (!shouldRender) return null

  const riskPoint = forecast.riskDay ?? forecast.lowBalanceDay
  const riskText = forecast.riskDay
    ? `Projected balance turns negative on ${forecast.riskDay.label}.`
    : forecast.lowBalanceDay
      ? `Projected balance gets tight on ${forecast.lowBalanceDay.label}.`
      : 'No low-balance days projected for the future days in this period.'

  return (
    <ChartPlotShell
      title="Cashflow forecast"
      caption={`Future days in ${forecast.monthLabel}`}
      showPeriodBadge={false}
    >
      {loading ? (
        <VStack align="stretch" spacing={3}>
          <Skeleton height="34px" borderRadius="lg" />
          <Skeleton height="220px" borderRadius="xl" />
        </VStack>
      ) : (
        <VStack align="stretch" spacing={4}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
            <ForecastMetric
              icon={Wallet}
              label="Projected end"
              value={formatMoney(forecast.projectedBalance)}
              color={forecast.projectedBalance >= 0 ? positiveColor : negativeColor}
            />
            <ForecastMetric
              icon={forecast.projectedChange >= 0 ? TrendingUp : TrendingDown}
              label="From current"
              value={`${forecast.projectedChange >= 0 ? '+' : ''}${formatMoney(forecast.projectedChange)}`}
              color={forecast.projectedChange >= 0 ? positiveColor : negativeColor}
            />
            <ForecastMetric
              icon={CalendarClock}
              label="Upcoming expenses"
              value={formatMoney(forecast.upcomingExpenseTotal)}
              color={negativeColor}
            />
          </SimpleGrid>

          <Box border="1px solid" borderColor={borderColor} borderRadius="xl" bg={panelBg} p={3}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={forecast.points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceCashflowForecastArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={areaColor} stopOpacity={1} />
                    <stop offset="100%" stopColor={areaColor} stopOpacity={0.12} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: axisColor, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={16}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: axisColor, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(value) => `£${Number(value).toFixed(0)}`}
                />
                <Tooltip
                  cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    background: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '12px',
                    color: tooltipText,
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                  formatter={(value: number | string) => [
                    formatMoney(Number(value)),
                    'Balance',
                  ]}
                />
                <ReferenceLine y={0} stroke={negativeColor} strokeDasharray="4 4" />
                {riskPoint && (
                  <ReferenceLine
                    x={riskPoint.label}
                    stroke={forecast.riskDay ? negativeColor : warningColor}
                    strokeDasharray="4 4"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={lineColor}
                  strokeWidth={2.5}
                  fill="url(#balanceCashflowForecastArea)"
                  dot={false}
                  activeDot={{ r: 5, stroke: lineColor, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          <HStack spacing={2} align="flex-start">
            <Icon
              as={AlertTriangle}
              boxSize={4}
              color={forecast.riskDay ? negativeColor : riskPoint ? warningColor : positiveColor}
              mt={0.5}
              flexShrink={0}
            />
            <Text fontSize="sm" fontWeight={700} color={titleColor}>
              {riskText}
            </Text>
          </HStack>

          {forecast.upcomingEvents.length > 0 && (
            <VStack align="stretch" spacing={2}>
              <Text
                fontSize="xs"
                fontWeight={800}
                color={mutedColor}
                textTransform="uppercase"
                letterSpacing="0.08em"
              >
                Upcoming impacts
              </Text>

              {forecast.upcomingEvents.map((event) => (
                <HStack
                  key={event.id}
                  spacing={3}
                  bg={panelBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="xl"
                  p={3}
                >
                  <Box
                    w="36px"
                    h="36px"
                    borderRadius="lg"
                    display="grid"
                    placeItems="center"
                    bg={event.type === 'INCOME' ? 'green.50' : 'red.50'}
                    color={event.type === 'INCOME' ? 'green.600' : 'red.600'}
                    fontSize="xs"
                    fontWeight={800}
                    flexShrink={0}
                  >
                    {event.label.split(' ')[0]}
                  </Box>
                  <VStack align="stretch" spacing={0.5} minW={0} flex={1}>
                    <HStack spacing={2} minW={0}>
                      <Text fontSize="sm" fontWeight={800} color={titleColor} noOfLines={1}>
                        {event.description}
                      </Text>
                      <Badge
                        colorScheme={
                          event.source === 'installment'
                            ? 'purple'
                            : event.source === 'recurring'
                              ? 'blue'
                              : 'gray'
                        }
                        variant="subtle"
                        borderRadius="full"
                        textTransform="none"
                        letterSpacing="0"
                        flexShrink={0}
                      >
                        {sourceLabel(event.source)}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                      {event.label} - {event.category}
                    </Text>
                  </VStack>
                  <Text
                    fontSize="sm"
                    fontWeight={900}
                    color={event.type === 'INCOME' ? positiveColor : negativeColor}
                    whiteSpace="nowrap"
                  >
                    {event.type === 'INCOME' ? '+' : '-'}
                    {formatMoney(event.amount)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          )}
        </VStack>
      )}
    </ChartPlotShell>
  )
}

interface ForecastMetricProps {
  icon: LucideIcon
  label: string
  value: string
  color: string
}

function ForecastMetric({ icon, label, value, color }: ForecastMetricProps) {
  const bg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const border = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const labelColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <Box border="1px solid" borderColor={border} borderRadius="xl" bg={bg} px={3.5} py={3}>
      <HStack spacing={2.5} align="center">
        <Icon as={icon} boxSize={4} color={color} flexShrink={0} />
        <VStack align="stretch" spacing={0} minW={0}>
          <Text fontSize="xs" color={labelColor} fontWeight={700} noOfLines={1}>
            {label}
          </Text>
          <Text fontSize={{ base: 'lg', md: 'xl' }} color={color} fontWeight={900} lineHeight="1.05" noOfLines={1}>
            {value}
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}
