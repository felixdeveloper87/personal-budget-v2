import { useMemo } from 'react'
import { Box, HStack, SimpleGrid, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import type { Transaction } from '../../../../types'
import ChartPlotShell from './ChartPlotShell'

interface IncomeInsightsProps {
  transactions: Transaction[]
}

const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

const moneyFormatterExact = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function IncomeInsights({ transactions }: IncomeInsightsProps) {
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const cardBg = useColorModeValue('white', 'whiteAlpha.50')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const trackBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const barBg = useColorModeValue('linear-gradient(90deg, #34d399 0%, #10b981 100%)', 'linear-gradient(90deg, #34d399 0%, #22c55e 100%)')
  const greenColor = useColorModeValue('green.600', 'green.300')
  const rankBg = useColorModeValue('green.50', 'whiteAlpha.100')

  const insights = useMemo(() => {
    if (transactions.length === 0) return null

    const total = transactions.reduce((sum, t) => sum + t.amount, 0)

    // Income grouped by weekday (Sun..Sat)
    const weekdayTotals = Array(7).fill(0) as number[]
    transactions.forEach((t) => {
      weekdayTotals[new Date(t.dateTime).getDay()] += t.amount
    })
    let bestWeekday = 0
    weekdayTotals.forEach((value, index) => {
      if (value > weekdayTotals[bestWeekday]) bestWeekday = index
    })
    const hasWeekday = weekdayTotals[bestWeekday] > 0

    // Income grouped by calendar day
    const byDay = new Map<string, { date: Date; total: number }>()
    transactions.forEach((t) => {
      const date = new Date(t.dateTime)
      const key = dayKey(date)
      const existing = byDay.get(key)
      if (existing) existing.total += t.amount
      else byDay.set(key, { date, total: t.amount })
    })

    const incomeDays = byDay.size
    const avgPerDay = incomeDays > 0 ? total / incomeDays : 0
    const topDays = [...byDay.values()].sort((a, b) => b.total - a.total).slice(0, 5)
    const topDayMax = topDays.length > 0 ? topDays[0].total : 0

    return {
      bestWeekday: hasWeekday ? WEEKDAY_LONG[bestWeekday] : null,
      bestWeekdayTotal: weekdayTotals[bestWeekday],
      avgPerDay,
      incomeDays,
      topDays,
      topDayMax,
    }
  }, [transactions])

  if (!insights) return null

  return (
    <ChartPlotShell title="Income insights" caption="Patterns from this period" showPeriodBadge={false}>
      <VStack align="stretch" spacing={{ base: 3, sm: 4 }}>
        <SimpleGrid columns={2} spacing={{ base: 3, sm: 4 }}>
          <Box borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={borderColor} p={{ base: 4, sm: 5 }}>
            <Text fontSize="xs" fontWeight={700} color={mutedColor} textTransform="uppercase" letterSpacing="0.06em">
              Best weekday
            </Text>
            <Text fontSize={{ base: 'xl', sm: '2xl' }} fontWeight={800} color={titleColor} mt={1.5} lineHeight="1.1" noOfLines={1}>
              {insights.bestWeekday ?? '--'}
            </Text>
            <Text fontSize={{ base: 'xs', sm: 'sm' }} color={greenColor} fontWeight={600} mt={1} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {insights.bestWeekday ? `${moneyFormatterExact.format(insights.bestWeekdayTotal)} earned` : 'No income yet'}
            </Text>
          </Box>

          <Box borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={borderColor} p={{ base: 4, sm: 5 }}>
            <Text fontSize="xs" fontWeight={700} color={mutedColor} textTransform="uppercase" letterSpacing="0.06em">
              Avg per income day
            </Text>
            <Text fontSize={{ base: 'xl', sm: '2xl' }} fontWeight={800} color={titleColor} mt={1.5} lineHeight="1.1" letterSpacing="-0.02em" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {moneyFormatterExact.format(insights.avgPerDay)}
            </Text>
            <Text fontSize={{ base: 'xs', sm: 'sm' }} color={mutedColor} fontWeight={600} mt={1}>
              across {insights.incomeDays} day{insights.incomeDays === 1 ? '' : 's'}
            </Text>
          </Box>
        </SimpleGrid>

        <Box borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={borderColor} px={{ base: 4, sm: 5 }} py={{ base: 3.5, sm: 4 }}>
          <Text fontSize="xs" fontWeight={700} color={mutedColor} textTransform="uppercase" letterSpacing="0.06em" mb={3}>
            Top earning days
          </Text>
          <VStack align="stretch" spacing={{ base: 3, sm: 3.5 }}>
            {insights.topDays.map((day, index) => {
              const pct = insights.topDayMax > 0 ? (day.total / insights.topDayMax) * 100 : 0
              return (
                <HStack key={dayKey(day.date)} spacing={3} align="center">
                  <Box
                    w={6}
                    h={6}
                    borderRadius="lg"
                    bg={rankBg}
                    color={greenColor}
                    fontSize="xs"
                    fontWeight={800}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    {index + 1}
                  </Box>
                  <VStack align="stretch" spacing={1.5} flex={1} minW={0}>
                    <HStack justify="space-between" spacing={2}>
                      <Text fontSize={{ base: 'xs', sm: 'sm' }} fontWeight={600} color={titleColor} noOfLines={1}>
                        {formatDayLabel(day.date)}
                      </Text>
                      <Text fontSize={{ base: 'xs', sm: 'sm' }} fontWeight={800} color={greenColor} flexShrink={0} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {moneyFormatter.format(day.total)}
                      </Text>
                    </HStack>
                    <Box h="6px" borderRadius="full" bg={trackBg} overflow="hidden">
                      <Box h="full" borderRadius="full" bgImage={barBg} w={`${Math.max(pct, 4)}%`} />
                    </Box>
                  </VStack>
                </HStack>
              )
            })}
          </VStack>
        </Box>
      </VStack>
    </ChartPlotShell>
  )
}
