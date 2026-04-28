import { useCallback, useRef } from 'react'
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  Activity,
  Calendar,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from '../ui/icons'
import { PeriodType } from '../../types'

/* -------------------------------------------------------------------------- */
/* Types & config                                                              */
/* -------------------------------------------------------------------------- */

interface PeriodNavigatorProps {
  selectedPeriod: PeriodType
  onPeriodChange: (period: PeriodType) => void
  onNavigatePeriod: (direction: 'prev' | 'next') => void
  onGoToToday: () => void
  formatLabel: () => string
  /**
   * When embedded inside another card the navigator drops its own surface
   * (no border / no background) and just renders the controls.
   */
  isEmbedded?: boolean
  /** The currently-selected date — used to show a relative hint. */
  selectedDate?: Date
}

interface PeriodOption {
  type: PeriodType
  label: string
  shortLabel: string
  icon: typeof Calendar
}

const PERIODS: PeriodOption[] = [
  { type: 'day',   label: 'Day',   shortLabel: 'D', icon: Calendar },
  { type: 'week',  label: 'Week',  shortLabel: 'W', icon: CalendarDays },
  { type: 'month', label: 'Month', shortLabel: 'M', icon: CalendarRange },
  { type: 'year',  label: 'Year',  shortLabel: 'Y', icon: Activity },
]

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Returns a short relative hint like "Today", "Yesterday", "This month" etc. */
function getRelativeHint(date: Date | undefined, period: PeriodType): string | null {
  if (!date) return null
  const now = new Date()

  if (period === 'day') {
    const diff = dayDiff(date, now)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff === -1) return 'Tomorrow'
    return null
  }
  if (period === 'week') {
    const thisWeekStart = getWeekStart(now)
    const selectedWeekStart = getWeekStart(date)
    const weekDiff = Math.round(
      (thisWeekStart.getTime() - selectedWeekStart.getTime()) / (7 * 86400000),
    )
    if (weekDiff === 0) return 'This week'
    if (weekDiff === 1) return 'Last week'
    if (weekDiff === -1) return 'Next week'
    return null
  }
  if (period === 'month') {
    const mDiff =
      (now.getFullYear() - date.getFullYear()) * 12 +
      (now.getMonth() - date.getMonth())
    if (mDiff === 0) return 'This month'
    if (mDiff === 1) return 'Last month'
    if (mDiff === -1) return 'Next month'
    return null
  }
  if (period === 'year') {
    const yDiff = now.getFullYear() - date.getFullYear()
    if (yDiff === 0) return 'This year'
    if (yDiff === 1) return 'Last year'
    if (yDiff === -1) return 'Next year'
    return null
  }
  return null
}

function dayDiff(a: Date, b: Date) {
  const msA = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const msB = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((msB - msA) / 86400000)
}

function getWeekStart(d: Date) {
  const copy = new Date(d)
  const day = copy.getDay()
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1)
  copy.setDate(diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function isCurrentPeriod(date: Date | undefined, period: PeriodType): boolean {
  if (!date) return false
  const now = new Date()
  if (period === 'day') return dayDiff(date, now) === 0
  if (period === 'week') {
    return getWeekStart(date).getTime() === getWeekStart(now).getTime()
  }
  if (period === 'month') {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  }
  if (period === 'year') {
    return date.getFullYear() === now.getFullYear()
  }
  return false
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function PeriodNavigator({
  selectedPeriod,
  onPeriodChange,
  onNavigatePeriod,
  onGoToToday,
  formatLabel,
  isEmbedded = false,
  selectedDate,
}: PeriodNavigatorProps) {
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Swipe support
  const touchStartX = useRef<number | null>(null)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return
      const diff = e.changedTouches[0].clientX - touchStartX.current
      if (Math.abs(diff) > 50) {
        onNavigatePeriod(diff > 0 ? 'prev' : 'next')
      }
      touchStartX.current = null
    },
    [onNavigatePeriod],
  )

  // ── Theme tokens ──────────────────────────────────────────────────────
  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const surfaceBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  const trackBg = useColorModeValue('gray.100', 'whiteAlpha.50')
  const trackBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  const inactivePillColor = useColorModeValue('gray.500', 'gray.400')
  const activePillBg = useColorModeValue('white', 'whiteAlpha.200')
  const activePillColor = useColorModeValue('blue.600', 'blue.300')
  const activePillBorder = useColorModeValue(
    'blue.200',
    'rgba(59,130,246,0.35)',
  )
  const activePillShadow = useColorModeValue(
    '0 1px 3px rgba(15,23,42,0.08)',
    'none',
  )

  const navBtnColor = useColorModeValue('gray.500', 'gray.400')
  const navBtnHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const navBtnHoverColor = useColorModeValue('blue.600', 'blue.300')

  const labelColor = useColorModeValue('gray.900', 'gray.50')
  const hintColor = useColorModeValue('blue.600', 'blue.300')
  const hintBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.12)')

  const todayBtnColor = useColorModeValue('blue.600', 'blue.300')
  const todayBtnBorder = useColorModeValue('blue.200', 'rgba(59,130,246,0.35)')
  const todayBtnHoverBg = useColorModeValue('blue.50', 'whiteAlpha.100')

  // ── Derived state ─────────────────────────────────────────────────────
  const isCurrent = isCurrentPeriod(selectedDate, selectedPeriod)
  const hint = getRelativeHint(selectedDate, selectedPeriod)

  return (
    <Box
      w="full"
      bg={isEmbedded ? 'transparent' : surfaceBg}
      border={isEmbedded ? 'none' : '1px solid'}
      borderColor={surfaceBorder}
      borderRadius={isEmbedded ? 'none' : '2xl'}
      p={isEmbedded ? 0 : { base: 3, md: 4 }}
    >
      <Flex direction="column" gap={3} w="full">
        {/* ── Row 1: Period type pills ─────────────────────────────── */}
        <Box
          bg={trackBg}
          p={1}
          borderRadius="xl"
          border="1px solid"
          borderColor={trackBorder}
        >
          <HStack spacing={1}>
            {PERIODS.map(({ type, label, shortLabel, icon: PeriodIcon }) => {
              const selected = selectedPeriod === type
              return (
                <Button
                  key={type}
                  flex={1}
                  h="34px"
                  borderRadius="lg"
                  leftIcon={
                    !isMobile ? (
                      <Icon as={PeriodIcon} boxSize={3.5} weight="duotone" />
                    ) : undefined
                  }
                  onClick={() => onPeriodChange(type)}
                  aria-pressed={selected}
                  bg={selected ? activePillBg : 'transparent'}
                  color={selected ? activePillColor : inactivePillColor}
                  fontWeight={selected ? 600 : 500}
                  fontSize="sm"
                  border="1px solid"
                  borderColor={selected ? activePillBorder : 'transparent'}
                  boxShadow={selected ? activePillShadow : 'none'}
                  transition="all 0.18s ease"
                  _hover={
                    selected
                      ? undefined
                      : { color: activePillColor, bg: 'transparent' }
                  }
                  _active={{ transform: 'scale(0.97)' }}
                  _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'blue.300',
                    outlineOffset: '2px',
                  }}
                >
                  {isMobile ? shortLabel : label}
                </Button>
              )
            })}
          </HStack>
        </Box>

        {/* ── Row 2: Navigation arrows + label + Today button ──────── */}
        <HStack
          spacing={2}
          w="full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <IconButton
            aria-label="Previous period"
            icon={<Icon as={ChevronLeft} boxSize={5} />}
            onClick={() => onNavigatePeriod('prev')}
            variant="ghost"
            size="sm"
            h="38px"
            w="38px"
            minW="38px"
            borderRadius="lg"
            color={navBtnColor}
            _hover={{ bg: navBtnHoverBg, color: navBtnHoverColor }}
            transition="all 0.15s ease"
          />

          {/* Center label area */}
          <Flex
            flex={1}
            direction="column"
            align="center"
            justify="center"
            gap={0}
            minW={0}
            userSelect="none"
          >
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight={700}
              color={labelColor}
              letterSpacing="-0.01em"
              lineHeight="1.3"
              noOfLines={1}
            >
              {formatLabel()}
            </Text>

            {hint && (
              <Text
                fontSize="2xs"
                fontWeight={600}
                color={hintColor}
                bg={hintBg}
                px={2}
                py={0.5}
                borderRadius="full"
                lineHeight="1.4"
                mt={0.5}
              >
                {hint}
              </Text>
            )}
          </Flex>

          <IconButton
            aria-label="Next period"
            icon={<Icon as={ChevronRight} boxSize={5} />}
            onClick={() => onNavigatePeriod('next')}
            variant="ghost"
            size="sm"
            h="38px"
            w="38px"
            minW="38px"
            borderRadius="lg"
            color={navBtnColor}
            _hover={{ bg: navBtnHoverBg, color: navBtnHoverColor }}
            transition="all 0.15s ease"
          />

          {/* Today button — only visible when NOT on the current period */}
          {!isCurrent && (
            <Tooltip label="Jump to today" hasArrow placement="top" openDelay={200}>
              <IconButton
                aria-label="Go to today"
                icon={<Icon as={RotateCcw} boxSize={3.5} weight="duotone" />}
                onClick={onGoToToday}
                variant="ghost"
                size="sm"
                h="34px"
                w="34px"
                minW="34px"
                borderRadius="lg"
                color={todayBtnColor}
                border="1px solid"
                borderColor={todayBtnBorder}
                _hover={{ bg: todayBtnHoverBg }}
                transition="all 0.15s ease"
              />
            </Tooltip>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}
