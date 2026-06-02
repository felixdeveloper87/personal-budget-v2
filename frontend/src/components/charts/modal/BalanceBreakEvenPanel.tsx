import { useState } from 'react'
import { Box, Button, Divider, HStack, Icon, SimpleGrid, Stack, Text, VStack, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import type { PeriodType } from '../../../types'
import { Calculator, Wallet } from '../../ui/icons'
import NumberPad from '../../transactions/TransactionForm/NumberPad'
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
  const neededToBreakEven = Math.max(0, -currentBalance)
  const dailyTarget = earningDays > 0 ? neededToBreakEven / earningDays : neededToBreakEven
  const neededForSavingsGoal = Math.max(0, savingsTarget - currentBalance)
  const dailySavingsTarget = earningDays > 0 ? neededForSavingsGoal / earningDays : neededForSavingsGoal

  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const panelBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const inputBg = useColorModeValue('white', 'whiteAlpha.50')
  const heroBg = useColorModeValue('linear-gradient(135deg, #fff7ed 0%, #ffffff 62%, #f5f3ff 100%)', 'linear-gradient(135deg, rgba(154,52,18,0.26) 0%, rgba(17,17,17,0.96) 58%, rgba(88,28,135,0.28) 100%)')
  const savingsBg = useColorModeValue('linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)', 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(88,28,135,0.16) 100%)')
  const resultBg = useColorModeValue('purple.50', 'rgba(126,34,206,0.18)')
  const activeButtonBg = useColorModeValue('purple.50', 'purple.900')
  const activeButtonBorder = useColorModeValue('purple.300', 'purple.500')
  const targetIconBg = useColorModeValue('orange.50', 'whiteAlpha.100')
  const overlayBg = useColorModeValue('blackAlpha.500', 'blackAlpha.700')
  const orangeColor = useColorModeValue('orange.600', 'orange.300')
  const greenColor = useColorModeValue('green.600', 'green.300')
  const redColor = useColorModeValue('red.600', 'red.300')
  const purpleColor = useColorModeValue('purple.600', 'purple.300')
  const targetColor = neededToBreakEven > 0 ? orangeColor : greenColor
  const balanceColor = currentBalance >= 0 ? greenColor : redColor

  const heroSubtitle = neededToBreakEven > 0
    ? 'to clear this period · Tuesdays off excluded'
    : "you're already above zero this period"

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
      <VStack align="stretch" spacing={{ base: 4, sm: 5 }}>
        <SimpleGrid columns={{ base: 1, md: 5 }} spacing={{ base: 3, sm: 4 }}>
          <Box
            gridColumn={{ base: 'auto', md: 'span 2' }}
            borderRadius="2xl"
            bg={heroBg}
            border="1px solid"
            borderColor={borderColor}
            p={{ base: 5, sm: 6 }}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            gap={{ base: 5, sm: 6 }}
          >
            <HStack spacing={2.5}>
              <Box
                w={{ base: 8, sm: 9 }}
                h={{ base: 8, sm: 9 }}
                borderRadius="xl"
                bg={targetIconBg}
                color={targetColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={Calculator} boxSize={{ base: 4, sm: 5 }} />
              </Box>
              <Text fontSize="xs" fontWeight={700} color={mutedColor} textTransform="uppercase" letterSpacing="0.06em">
                Break-even pace
              </Text>
            </HStack>

            <VStack align="stretch" spacing={1.5}>
              <HStack align="baseline" spacing={1.5}>
                <Text fontSize={{ base: '3xl', sm: '4xl' }} fontWeight={800} color={targetColor} lineHeight="1" letterSpacing="-0.02em" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(dailyTarget)}
                </Text>
                <Text fontSize="sm" fontWeight={600} color={mutedColor}>
                  / day
                </Text>
              </HStack>
              <Text fontSize={{ base: 'xs', sm: 'sm' }} color={mutedColor} lineHeight="1.4">
                {heroSubtitle}
              </Text>
            </VStack>
          </Box>

          <Box
            gridColumn={{ base: 'auto', md: 'span 3' }}
            borderRadius="2xl"
            bg={panelBg}
            border="1px solid"
            borderColor={borderColor}
            px={{ base: 4, sm: 5 }}
          >
            <StatRow label="Needed to zero" value={formatMoney(neededToBreakEven)} color={targetColor} />
            <Divider borderColor={borderColor} />
            <StatRow label="Earning days left" value={earningDays.toString()} color={titleColor} />
            <Divider borderColor={borderColor} />
            <StatRow label="Current balance" value={formatMoney(currentBalance)} color={balanceColor} />
          </Box>
        </SimpleGrid>

        <Text px={1} fontSize={{ base: 'xs', sm: 'sm' }} color={mutedColor} lineHeight="1.5">
          {caption}
        </Text>

        <Box
          border="1px solid"
          borderColor={borderColor}
          borderRadius={{ base: 'xl', sm: '2xl' }}
          bg={savingsBg}
          p={{ base: 3.5, sm: 5 }}
        >
          <VStack align="stretch" spacing={{ base: 3, sm: 4 }}>
            <HStack justify="space-between" align="flex-start" spacing={2.5}>
              <HStack spacing={3} minW={0}>
                <Box
                  w={{ base: 8, sm: 9 }}
                  h={{ base: 8, sm: 9 }}
                  borderRadius={{ base: 'lg', sm: 'xl' }}
                  bg={activeButtonBg}
                  color={purpleColor}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon as={Wallet} boxSize={{ base: 4, sm: 5 }} />
                </Box>
                <VStack align="stretch" spacing={0.5} minW={0}>
                  <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight={700} color={titleColor}>
                    Savings goal
                  </Text>
                  <Text fontSize={{ base: '11px', sm: 'xs' }} color={mutedColor} noOfLines={2} lineHeight="1.3">
                    Set the surplus you want after this period's balance reaches zero.
                  </Text>
                </VStack>
              </HStack>
              {savingsTarget > 0 && (
                <Text flexShrink={0} fontSize={{ base: 'sm', sm: 'md' }} fontWeight={700} color={purpleColor} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(savingsTarget)}
                </Text>
              )}
            </HStack>

            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={{ base: 1.5, sm: 2 }}>
              {SAVINGS_TARGET_OPTIONS.map((value) => {
                const isActive = savingsTarget === value

                return (
                  <Button
                    key={value}
                    size="sm"
                    h={{ base: '34px', sm: '38px' }}
                    borderRadius="full"
                    border="1px solid"
                    borderColor={isActive ? activeButtonBorder : borderColor}
                    bg={isActive ? activeButtonBg : inputBg}
                    color={isActive ? purpleColor : titleColor}
                    boxShadow={isActive ? '0 8px 18px rgba(124, 58, 237, 0.16)' : 'none'}
                    fontWeight={700}
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    onClick={() => setSavingsTarget(value)}
                    _hover={{ borderColor: activeButtonBorder, bg: isActive ? activeButtonBg : panelBg }}
                  >
                    {formatMoney(value)}
                  </Button>
                )
              })}
            </SimpleGrid>

            <Button
              type="button"
              h={{ base: '46px', sm: '52px' }}
              justifyContent="space-between"
              bg={inputBg}
              color={savingsTarget > 0 ? titleColor : mutedColor}
              border="1px solid"
              borderColor={borderColor}
              borderRadius={{ base: 'lg', sm: 'xl' }}
              fontWeight={600}
              px={{ base: 3, sm: 4 }}
              onClick={openNumberPad}
              _hover={{ borderColor: activeButtonBorder, bg: inputBg }}
              _active={{ bg: inputBg }}
              rightIcon={<Icon as={Calculator} boxSize={4} color={purpleColor} />}
            >
              <Text as="span" fontSize={{ base: 'xs', sm: 'sm' }}>
                Custom surplus
              </Text>
              <Text as="span" fontSize={{ base: 'xs', sm: 'sm' }} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {savingsTarget > 0 ? formatMoney(savingsTarget) : 'Tap to enter'}
              </Text>
            </Button>

            <Box
              border="1px solid"
              borderColor={savingsTarget > 0 ? activeButtonBorder : borderColor}
              borderRadius="xl"
              bg={savingsTarget > 0 ? resultBg : inputBg}
              px={{ base: 3, sm: 4 }}
              py={{ base: 3, sm: 4 }}
            >
              <Stack direction={{ base: 'column', sm: 'row' }} align={{ base: 'stretch', sm: 'center' }} justify="space-between" spacing={{ base: 2.5, sm: 4 }}>
                <VStack align="stretch" spacing={1} minW={0}>
                  <Text fontSize={{ base: '10px', sm: 'xs' }} fontWeight={700} color={mutedColor} textTransform="uppercase" letterSpacing="0.06em">
                    Target pace
                  </Text>
                  <Text fontSize={{ base: '11px', sm: 'xs' }} color={mutedColor} lineHeight="1.35">
                    {savingsGoalCaption}
                    {savingsTarget > 0 && (
                      <>
                        {' '}Total still needed: <Text as="span" fontWeight={800} color={titleColor}>{formatMoney(neededForSavingsGoal)}</Text>.
                      </>
                    )}
                  </Text>
                </VStack>
                <VStack align={{ base: 'flex-start', sm: 'flex-end' }} spacing={0} flexShrink={0}>
                  <Text fontSize={{ base: 'xl', sm: '2xl' }} fontWeight={800} color={savingsTarget > 0 ? purpleColor : mutedColor} lineHeight="1" letterSpacing="-0.02em" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {savingsTarget > 0 ? formatMoney(dailySavingsTarget) : '--'}
                  </Text>
                  <Text fontSize={{ base: '11px', sm: 'xs' }} fontWeight={600} color={mutedColor}>
                    per day
                  </Text>
                </VStack>
              </Stack>
            </Box>
          </VStack>
        </Box>
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
