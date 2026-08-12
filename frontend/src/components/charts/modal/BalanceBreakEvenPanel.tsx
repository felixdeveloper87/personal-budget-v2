import { useMemo, useState } from 'react'
import { Box, Button, Divider, HStack, Icon, SimpleGrid, Text, VStack, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import type { PeriodType, Transaction } from '../../../types'
import { Calculator, CheckCircle2, Wallet } from '../../ui/icons'
import NumberPad from '../../transactions/TransactionForm/NumberPad'
import { ChartPlotShell } from './components'
import { useI18n } from '../../../i18n'

interface BalanceBreakEvenPanelProps {
  currentBalance: number
  selectedDate?: Date
  periodType?: PeriodType
  transactions?: Transaction[]
}

const SAVINGS_TARGET_OPTIONS = [100, 200, 500, 1000] as const
const MONTHLY_SAVINGS_MILESTONES = [100, 200, 500, 1000, 1200, 1500, 1700, 2000] as const

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
  transactions = [],
}: BalanceBreakEvenPanelProps) {
  const { t, formatCurrency } = useI18n()
  const [savingsTarget, setSavingsTarget] = useState(0)
  const { isOpen: isNumberPadOpen, onOpen: openNumberPad, onClose: closeNumberPad } = useDisclosure()

  const remainingRange = getRemainingRange(selectedDate, periodType)
  const remainingDays = remainingRange
    ? daysInclusive(remainingRange.start, remainingRange.end)
    : getRemainingDays(selectedDate, periodType)
  const daysOff = remainingRange
    ? countTuesdays(remainingRange.start, remainingRange.end)
    : 0
  const earningDays = Math.max(0, remainingDays - daysOff)
  const isPastPeriod = remainingDays === 0
  const isInDeficit = currentBalance < 0
  const isPositiveBalance = currentBalance > 0
  const isBalanced = currentBalance === 0
  const isBalancedOrBetter = currentBalance >= 0
  const achievedMilestones = MONTHLY_SAVINGS_MILESTONES.filter(
    milestone => currentBalance >= milestone,
  )
  const nextMilestone = MONTHLY_SAVINGS_MILESTONES.find(
    milestone => currentBalance < milestone,
  )

  const { totalIncome, totalExpenses } = useMemo(() => ({
    totalIncome: transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
  }), [transactions])

  const neededToBreakEven = Math.max(0, -currentBalance)
  const dailyTarget = earningDays > 0 ? neededToBreakEven / earningDays : neededToBreakEven
  const savingsGoalBalance = isPositiveBalance
    ? currentBalance + savingsTarget
    : savingsTarget
  const neededForSavingsGoal = isPositiveBalance
    ? savingsTarget
    : Math.max(0, savingsTarget - currentBalance)
  const dailySavingsTarget = earningDays > 0 ? neededForSavingsGoal / earningDays : neededForSavingsGoal

  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const panelBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const inputBg = useColorModeValue('white', 'whiteAlpha.50')
  const summaryBg = useColorModeValue('white', 'rgba(255,255,255,0.035)')
  const accentBg = useColorModeValue('orange.50', 'rgba(194,65,12,0.14)')
  const savingsBg = useColorModeValue('white', 'rgba(255,255,255,0.025)')
  const resultBg = useColorModeValue('purple.50', 'rgba(126,34,206,0.18)')
  const successBg = useColorModeValue('green.50', 'rgba(22,101,52,0.18)')
  const successBorder = useColorModeValue('green.200', 'green.700')
  const successIconBg = useColorModeValue('green.100', 'green.900')
  const activeButtonBg = useColorModeValue('purple.50', 'purple.900')
  const activeButtonBorder = useColorModeValue('purple.300', 'purple.500')
  const overlayBg = useColorModeValue('blackAlpha.500', 'blackAlpha.700')
  const orangeColor = useColorModeValue('orange.600', 'orange.300')
  const greenColor = useColorModeValue('green.600', 'green.300')
  const redColor = useColorModeValue('red.600', 'red.300')
  const purpleColor = useColorModeValue('purple.600', 'purple.300')
  const targetColor = neededToBreakEven > 0 ? orangeColor : greenColor
  const balanceColor = currentBalance >= 0 ? greenColor : redColor

  const caption = remainingDays > 0
    ? t('charts.breakEven.remainingCaption', { earningDays, daysOff })
    : t('charts.breakEven.noRemainingDays')

  const savingsGoalCaption = savingsTarget > 0
    ? isPositiveBalance
      ? t('charts.breakEven.saveAnother', {
          amount: formatCurrency(savingsTarget),
          total: formatCurrency(savingsGoalBalance),
        })
      : t('charts.breakEven.finishWith', {
          amount: formatCurrency(savingsTarget),
          daily: formatCurrency(dailySavingsTarget),
        })
    : isPositiveBalance
      ? t('charts.breakEven.chooseMore')
      : t('charts.breakEven.setSurplus')

  if (isPastPeriod) {
    return (
      <ChartPlotShell title={t('charts.periodSummary')} caption={t('charts.closedPeriod')} showPeriodBadge={false}>
        <VStack align="stretch" spacing={0}>
          <StatRow label={t('charts.totalIncome')} value={formatCurrency(totalIncome)} color={greenColor} />
          <Divider borderColor={borderColor} />
          <StatRow label={t('charts.totalExpenses')} value={formatCurrency(totalExpenses)} color={redColor} />
          <Divider borderColor={borderColor} />
          <StatRow label={t('charts.closingBalance')} value={formatCurrency(currentBalance)} color={balanceColor} />
        </VStack>
      </ChartPlotShell>
    )
  }

  return (
    <ChartPlotShell
      title={isBalancedOrBetter ? t('charts.breakEven.savingsProgress') : t('charts.breakEven.target')}
      caption={isBalancedOrBetter
        ? isBalanced
          ? t('charts.breakEven.balancedCaption')
          : t('charts.breakEven.milestonesCaption')
        : t('charts.breakEven.dailyTargetCaption')}
      showPeriodBadge={false}
    >
      <VStack align="stretch" spacing={3}>
        {isBalancedOrBetter && (
          <Box
            border="1px solid"
            borderColor={successBorder}
            borderRadius="xl"
            bg={successBg}
            p={{ base: 4, sm: 5 }}
          >
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between" align="center" spacing={4}>
                <HStack spacing={3} minW={0}>
                  <Box
                    w={10}
                    h={10}
                    borderRadius="full"
                    bg={successIconBg}
                    color={greenColor}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon as={CheckCircle2} boxSize={5} weight="fill" />
                  </Box>
                  <Box minW={0}>
                    <Text fontSize="xs" fontWeight={800} color={mutedColor} textTransform="uppercase" letterSpacing="0.05em">
                      {isBalanced ? t('charts.breakEven.monthlyResult') : t('charts.breakEven.savedThisMonth')}
                    </Text>
                    <Text fontSize={{ base: '2xl', sm: '3xl' }} fontWeight={900} color={greenColor} lineHeight="1.1" letterSpacing="-0.03em" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(currentBalance)}
                    </Text>
                  </Box>
                </HStack>
                <Text display={{ base: 'none', sm: 'block' }} maxW="320px" textAlign="right" fontSize="xs" color={mutedColor}>
                  {isBalanced
                    ? t('charts.breakEven.incomeCoversSpending')
                    : nextMilestone
                    ? t('charts.breakEven.awayFromMilestone', { amount: formatCurrency(nextMilestone - currentBalance) })
                    : t('charts.breakEven.allMilestonesAchieved')}
                </Text>
              </HStack>

              <Box>
                <HStack justify="space-between" mb={2.5}>
                  <Text fontSize="xs" fontWeight={800} color={titleColor}>
                    {t('charts.breakEven.monthlyMilestones')}
                  </Text>
                  <Text fontSize="xs" fontWeight={700} color={greenColor}>
                    {t('charts.breakEven.achievedCount', {
                      achieved: achievedMilestones.length,
                      total: MONTHLY_SAVINGS_MILESTONES.length,
                    })}
                  </Text>
                </HStack>
                <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2}>
                  {MONTHLY_SAVINGS_MILESTONES.map((milestone) => {
                    const achieved = currentBalance >= milestone

                    return (
                      <HStack
                        key={milestone}
                        justify="space-between"
                        minH="38px"
                        px={3}
                        py={2}
                        border="1px solid"
                        borderColor={achieved ? successBorder : borderColor}
                        borderRadius="lg"
                        bg={achieved ? successIconBg : inputBg}
                        color={achieved ? greenColor : mutedColor}
                      >
                        <Text fontSize="xs" fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(milestone)}
                        </Text>
                        {achieved && (
                          <Icon as={CheckCircle2} boxSize={4} weight="fill" flexShrink={0} />
                        )}
                      </HStack>
                    )
                  })}
                </SimpleGrid>
              </Box>

              <HStack
                spacing={2}
                px={3}
                py={2.5}
                borderRadius="lg"
                bg={inputBg}
                color={greenColor}
              >
                <Icon as={CheckCircle2} boxSize={4} weight="fill" flexShrink={0} />
                <Text fontSize="xs" fontWeight={700}>
                  {isBalanced
                    ? t('charts.breakEven.balanceRestored')
                    : achievedMilestones.length > 0
                    ? t(
                        achievedMilestones.length === 1
                          ? 'charts.breakEven.progressOneGoal'
                          : 'charts.breakEven.progressGoals',
                        { count: achievedMilestones.length },
                      )
                    : t('charts.breakEven.unlockFirstMilestone', {
                        amount: formatCurrency(MONTHLY_SAVINGS_MILESTONES[0]),
                      })}
                </Text>
              </HStack>
            </VStack>
          </Box>
        )}

        {isInDeficit && (
          <Box
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            bg={summaryBg}
            overflow="hidden"
          >
            <SimpleGrid columns={{ base: 1, md: 12 }} spacing={0}>
              <Box
                gridColumn={{ base: 'auto', md: 'span 5' }}
                bg={accentBg}
                px={{ base: 4, sm: 5 }}
                py={{ base: 4, sm: 5 }}
              >
                <HStack justify="space-between" align="flex-start" spacing={3}>
                  <VStack align="stretch" spacing={1.5}>
                    <Text fontSize="xs" fontWeight={800} color={mutedColor} textTransform="uppercase" letterSpacing="0.06em">
                      {t('charts.breakEven.dailyPace')}
                    </Text>
                    <HStack align="baseline" spacing={1}>
                      <Text fontSize={{ base: '3xl', sm: '4xl' }} fontWeight={800} color={targetColor} lineHeight="1" letterSpacing="-0.035em" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(dailyTarget)}
                      </Text>
                      <Text fontSize="xs" fontWeight={700} color={mutedColor}>
                        {t('charts.breakEven.perDayShort')}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color={mutedColor}>
                      {t('charts.breakEven.earningDaysRemaining', { count: earningDays })}
                    </Text>
                  </VStack>
                  <Box color={targetColor} pt={0.5}>
                    <Icon as={Calculator} boxSize={5} />
                  </Box>
                </HStack>
              </Box>

              <SimpleGrid
                gridColumn={{ base: 'auto', md: 'span 7' }}
                columns={{ base: 1, sm: 3 }}
                borderTop={{ base: '1px solid', md: '0' }}
                borderLeft={{ base: '0', md: '1px solid' }}
                borderColor={borderColor}
              >
                <CompactMetric
                  label={t('charts.breakEven.gapToZero')}
                  value={formatCurrency(neededToBreakEven)}
                  color={targetColor}
                />
                <CompactMetric
                  label={t('charts.breakEven.daysLeft')}
                  value={earningDays.toString()}
                  color={titleColor}
                  withBorder
                />
                <CompactMetric
                  label={t('charts.breakEven.currentBalance')}
                  value={formatCurrency(currentBalance)}
                  color={balanceColor}
                  withBorder
                />
              </SimpleGrid>
            </SimpleGrid>
            <Text
              px={{ base: 4, sm: 5 }}
              py={2.5}
              borderTop="1px solid"
              borderColor={borderColor}
              fontSize="xs"
              color={mutedColor}
            >
              {caption}
            </Text>
          </Box>
        )}

        {isInDeficit && (
          <Box
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            bg={summaryBg}
            p={{ base: 3.5, sm: 4 }}
          >
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontSize="sm" fontWeight={800} color={titleColor}>
                  {t('charts.breakEven.monthlySavingsGoals')}
                </Text>
                <Text fontSize="xs" color={mutedColor} mt={0.5}>
                  {t('charts.breakEven.closeGapFirst', { amount: formatCurrency(neededToBreakEven) })}
                </Text>
              </Box>
              <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2}>
                {MONTHLY_SAVINGS_MILESTONES.map((milestone) => (
                  <HStack
                    key={milestone}
                    justify="space-between"
                    minH="38px"
                    px={3}
                    py={2}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="lg"
                    bg={inputBg}
                    color={mutedColor}
                  >
                    <Text fontSize="xs" fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(milestone)}
                    </Text>
                  </HStack>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>
        )}

        {remainingDays > 0 && isInDeficit && (
          <Box
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            bg={savingsBg}
            p={{ base: 3.5, sm: 4 }}
          >
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between" align="center" spacing={3}>
                <HStack spacing={2.5} minW={0}>
                  <Box
                    w={8}
                    h={8}
                    borderRadius="lg"
                    bg={activeButtonBg}
                    color={purpleColor}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon as={Wallet} boxSize={4} />
                  </Box>
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight={800} color={titleColor}>
                      {isPositiveBalance ? t('charts.breakEven.savingsChallenge') : t('charts.breakEven.buildSurplus')}
                    </Text>
                    <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                      {isPositiveBalance
                        ? t('charts.breakEven.addToBalance')
                        : t('charts.breakEven.setAmountAfterZero')}
                    </Text>
                  </Box>
                </HStack>
                {savingsTarget > 0 && (
                  <Text flexShrink={0} fontSize="sm" fontWeight={800} color={purpleColor} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {isPositiveBalance ? '+' : ''}{formatCurrency(savingsTarget)}
                  </Text>
                )}
              </HStack>

              <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2}>
                {SAVINGS_TARGET_OPTIONS.map((value) => {
                  const isActive = savingsTarget === value

                  return (
                    <Button
                      key={value}
                      size="sm"
                      h="34px"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={isActive ? activeButtonBorder : borderColor}
                      bg={isActive ? activeButtonBg : inputBg}
                      color={isActive ? purpleColor : titleColor}
                      boxShadow="none"
                      fontWeight={700}
                      fontSize="xs"
                      onClick={() => setSavingsTarget(value)}
                      _hover={{ borderColor: activeButtonBorder, bg: activeButtonBg }}
                    >
                      {formatCurrency(value)}
                    </Button>
                  )
                })}
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                <Button
                  type="button"
                  h="48px"
                  justifyContent="space-between"
                  bg={inputBg}
                  color={savingsTarget > 0 ? titleColor : mutedColor}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="lg"
                  fontWeight={600}
                  px={3.5}
                  onClick={openNumberPad}
                  _hover={{ borderColor: activeButtonBorder, bg: inputBg }}
                  _active={{ bg: inputBg }}
                  rightIcon={<Icon as={Calculator} boxSize={4} color={purpleColor} />}
                >
                  <Text as="span" fontSize="xs">
                    {isPositiveBalance ? t('charts.breakEven.customChallenge') : t('charts.breakEven.customSurplus')}
                  </Text>
                  <Text as="span" fontSize="xs" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {savingsTarget > 0 ? formatCurrency(savingsTarget) : t('charts.breakEven.enterAmount')}
                  </Text>
                </Button>

                <HStack
                  justify="space-between"
                  minH="48px"
                  border="1px solid"
                  borderColor={savingsTarget > 0 ? activeButtonBorder : borderColor}
                  borderRadius="lg"
                  bg={savingsTarget > 0 ? resultBg : inputBg}
                  px={3.5}
                  spacing={3}
                >
                  <Box minW={0}>
                    <Text fontSize="10px" fontWeight={800} color={mutedColor} textTransform="uppercase" letterSpacing="0.06em">
                      {t('charts.breakEven.dailyTarget')}
                    </Text>
                    <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                      {savingsGoalCaption}
                    </Text>
                  </Box>
                  <Box textAlign="right" flexShrink={0}>
                    <Text fontSize="lg" fontWeight={800} color={savingsTarget > 0 ? purpleColor : mutedColor} lineHeight="1" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {savingsTarget > 0 ? formatCurrency(dailySavingsTarget) : '--'}
                    </Text>
                    <Text fontSize="10px" fontWeight={700} color={mutedColor}>
                      {t('charts.breakEven.perDay')}
                    </Text>
                  </Box>
                </HStack>
              </SimpleGrid>
            </VStack>
          </Box>
        )}
      </VStack>

      {isNumberPadOpen && (
        <Box
          position="fixed"
          inset="0"
          bg={overlayBg}
          backdropFilter="blur(10px)"
          zIndex={2000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg={panelBg}
            borderRadius="2xl"
            p={{ base: 3.5, sm: 6 }}
            maxW="400px"
            w="full"
            border="1px solid"
            borderColor={borderColor}
            shadow="2xl"
          >
            <NumberPad
              value={savingsTarget}
              onValueChange={setSavingsTarget}
              onDone={closeNumberPad}
            />
          </Box>
        </Box>
      )}
    </ChartPlotShell>
  )
}

interface CompactMetricProps {
  label: string
  value: string
  color: string
  withBorder?: boolean
}

function CompactMetric({ label, value, color, withBorder = false }: CompactMetricProps) {
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const labelColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <VStack
      align={{ base: 'stretch', sm: 'flex-start' }}
      justify="center"
      spacing={1}
      px={4}
      py={{ base: 3, sm: 4 }}
      borderTop={{ base: withBorder ? '1px solid' : '0', sm: '0' }}
      borderLeft={{ base: '0', sm: withBorder ? '1px solid' : '0' }}
      borderColor={borderColor}
    >
      <Text fontSize="10px" fontWeight={800} color={labelColor} textTransform="uppercase" letterSpacing="0.05em">
        {label}
      </Text>
      <Text fontSize={{ base: 'md', sm: 'lg' }} color={color} fontWeight={800} lineHeight="1" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </VStack>
  )
}

interface StatRowProps {
  label: string
  value: string
  color: string
}

function StatRow({ label, value, color }: StatRowProps) {
  const labelColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <HStack justify="space-between" align="center" py={{ base: 3, sm: 3.5 }}>
      <Text fontSize="sm" color={labelColor} fontWeight={600}>
        {label}
      </Text>
      <Text fontSize={{ base: 'lg', sm: 'xl' }} color={color} fontWeight={700} lineHeight="1" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </HStack>
  )
}
