import { useState } from 'react'
import { Box, Button, HStack, Icon, Input, SimpleGrid, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import type { PeriodType } from '../../../types'
import { Calculator, CalendarDays, Wallet } from '../../ui/icons'
import type { LucideIcon } from '../../ui/icons'
import { ChartPlotShell } from './components'

interface BalanceBreakEvenPanelProps {
  currentBalance: number
  selectedDate?: Date
  periodType?: PeriodType
}

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const SAVINGS_TARGET_OPTIONS = [100, 200, 500, 1000] as const

function formatMoney(value: number): string {
  return moneyFormatter.format(value)
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getPeriodRange(date: Date, periodType: PeriodType): { start: Date; end: Date } {
  switch (periodType) {
    case 'day':
      return {
        start: startOfDay(date),
        end: startOfDay(date),
      }
    case 'week': {
      const start = startOfDay(date)
      const day = start.getDay()
      const shift = day === 0 ? -6 : 1 - day
      start.setDate(start.getDate() + shift)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return { start, end }
    }
    case 'year':
      return {
        start: new Date(date.getFullYear(), 0, 1),
        end: new Date(date.getFullYear(), 11, 31),
      }
    case 'month':
    default:
      return {
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      }
  }
}

function daysInclusive(start: Date, end: Date): number {
  if (end < start) return 0
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((startOfDay(end).getTime() - startOfDay(start).getTime()) / msPerDay) + 1
}

function getRemainingDays(selectedDate: Date, periodType: PeriodType): number {
  const today = startOfDay(new Date())
  const { start, end } = getPeriodRange(selectedDate, periodType)

  if (end < today) return 0
  const firstRemainingDay = start > today ? start : today
  return daysInclusive(firstRemainingDay, end)
}

function getRemainingRange(selectedDate: Date, periodType: PeriodType): { start: Date; end: Date } | null {
  const today = startOfDay(new Date())
  const { start, end } = getPeriodRange(selectedDate, periodType)

  if (end < today) return null
  return {
    start: start > today ? start : today,
    end,
  }
}

function countTuesdays(start: Date, end: Date): number {
  let count = 0
  const cursor = startOfDay(start)

  while (cursor <= end) {
    if (cursor.getDay() === 2) count += 1
    cursor.setDate(cursor.getDate() + 1)
  }

  return count
}

export default function BalanceBreakEvenPanel({
  currentBalance,
  selectedDate = new Date(),
  periodType = 'month',
}: BalanceBreakEvenPanelProps) {
  const [savingsTargetInput, setSavingsTargetInput] = useState('')

  const remainingRange = getRemainingRange(selectedDate, periodType)
  const remainingDays = remainingRange
    ? daysInclusive(remainingRange.start, remainingRange.end)
    : getRemainingDays(selectedDate, periodType)
  const daysOff = remainingRange
    ? countTuesdays(remainingRange.start, remainingRange.end)
    : 0
  const earningDays = Math.max(0, remainingDays - daysOff)
  const neededToBreakEven = Math.max(0, -currentBalance)
  const dailyTarget = earningDays > 0 ? neededToBreakEven / earningDays : neededToBreakEven
  const savingsTarget = Math.max(0, Number(savingsTargetInput) || 0)
  const neededForSavingsGoal = Math.max(0, savingsTarget - currentBalance)
  const dailySavingsTarget = earningDays > 0 ? neededForSavingsGoal / earningDays : neededForSavingsGoal

  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const panelBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const inputBg = useColorModeValue('white', 'whiteAlpha.50')
  const activeButtonBg = useColorModeValue('purple.50', 'purple.900')
  const activeButtonBorder = useColorModeValue('purple.300', 'purple.500')
  const orangeColor = useColorModeValue('orange.600', 'orange.300')
  const greenColor = useColorModeValue('green.600', 'green.300')
  const redColor = useColorModeValue('red.600', 'red.300')
  const purpleColor = useColorModeValue('purple.600', 'purple.300')
  const targetColor = neededToBreakEven > 0 ? orangeColor : greenColor
  const balanceColor = currentBalance >= 0 ? greenColor : redColor

  const headline = neededToBreakEven > 0
    ? `${formatMoney(dailyTarget)} per earning day to reach zero.`
    : `You are ${formatMoney(currentBalance)} above zero for this period.`

  const caption = remainingDays > 0
    ? `${earningDays} earning day${earningDays === 1 ? '' : 's'} left from today after excluding ${daysOff} Tuesday${daysOff === 1 ? '' : 's'} off.`
    : 'No remaining days in this selected period.'

  const savingsGoalCaption = savingsTarget > 0
    ? `To finish this period with ${formatMoney(savingsTarget)} left, earn ${formatMoney(dailySavingsTarget)} per earning day.`
    : 'Set a target surplus to calculate the daily earning goal.'

  return (
    <ChartPlotShell
      title="Break-even target"
      caption="Daily earning target for the selected period"
      showPeriodBadge={false}
    >
      <VStack align="stretch" spacing={4}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
          <MetricTile
            icon={Calculator}
            label="Daily target"
            value={formatMoney(dailyTarget)}
            color={targetColor}
          />
          <MetricTile
            icon={Wallet}
            label="Needed to zero"
            value={formatMoney(neededToBreakEven)}
            color={targetColor}
          />
          <MetricTile
            icon={CalendarDays}
            label="Earning days left"
            value={earningDays.toString()}
            color={titleColor}
          />
        </SimpleGrid>

        <Box
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
          bg={panelBg}
          p={{ base: 3.5, sm: 4 }}
        >
          <VStack align="stretch" spacing={1}>
            <Text fontSize="sm" fontWeight={800} color={titleColor}>
              {headline}
            </Text>
            <Text fontSize="xs" color={mutedColor}>
              {caption} Current period balance: <Text as="span" fontWeight={800} color={balanceColor}>{formatMoney(currentBalance)}</Text>.
            </Text>
          </VStack>
        </Box>

        <Box
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
          bg={panelBg}
          p={{ base: 3.5, sm: 4 }}
        >
          <VStack align="stretch" spacing={3.5}>
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontWeight={800} color={titleColor}>
                Savings goal
              </Text>
              <Text fontSize="xs" color={mutedColor}>
                Choose how much money you want left at the end of this selected period.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2}>
              {SAVINGS_TARGET_OPTIONS.map((value) => {
                const isActive = savingsTarget === value

                return (
                  <Button
                    key={value}
                    size="sm"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={isActive ? activeButtonBorder : borderColor}
                    bg={isActive ? activeButtonBg : inputBg}
                    color={isActive ? purpleColor : titleColor}
                    fontWeight={800}
                    onClick={() => setSavingsTargetInput(String(value))}
                  >
                    {formatMoney(value)}
                  </Button>
                )
              })}
            </SimpleGrid>

            <Input
              type="number"
              min={0}
              step="1"
              inputMode="decimal"
              value={savingsTargetInput}
              onChange={(event) => setSavingsTargetInput(event.target.value)}
              placeholder="Custom surplus amount"
              bg={inputBg}
              borderColor={borderColor}
              borderRadius="lg"
              fontWeight={700}
            />

            <Box border="1px solid" borderColor={borderColor} borderRadius="lg" bg={inputBg} px={3.5} py={3}>
              <VStack align="stretch" spacing={1}>
                <Text fontSize="sm" fontWeight={900} color={savingsTarget > 0 ? purpleColor : mutedColor}>
                  {savingsTarget > 0 ? `${formatMoney(dailySavingsTarget)} per earning day` : 'No savings target set'}
                </Text>
                <Text fontSize="xs" color={mutedColor}>
                  {savingsGoalCaption}
                  {savingsTarget > 0 && (
                    <>
                      {' '}Total still needed: <Text as="span" fontWeight={800} color={titleColor}>{formatMoney(neededForSavingsGoal)}</Text>.
                    </>
                  )}
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </ChartPlotShell>
  )
}

interface MetricTileProps {
  icon: LucideIcon
  label: string
  value: string
  color: string
}

function MetricTile({ icon, label, value, color }: MetricTileProps) {
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
