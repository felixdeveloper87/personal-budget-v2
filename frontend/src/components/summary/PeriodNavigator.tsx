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
import { useEd } from '../../editorial'
import PeriodDatePicker from './PeriodDatePicker'

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
  selectedDate: Date
  onDateChange: (date: Date) => void
  /** Hide the range selector for views that are intentionally month-only. */
  showPeriodSelector?: boolean
  /** Optional navigation bounds. Defaults preserve existing consumers. */
  canNavigatePrevious?: boolean
  canNavigateNext?: boolean
  /** Disable dates outside the data range exposed by the current view. */
  isDateDisabled?: (date: Date) => boolean
}

interface PeriodOption {
  type: PeriodType
  label: string
  icon: typeof Calendar
}

const PERIODS: PeriodOption[] = [
  { type: 'day', label: 'Day', icon: Calendar },
  { type: 'week', label: 'Week', icon: CalendarDays },
  { type: 'month', label: 'Month', icon: CalendarRange },
  { type: 'year', label: 'Year', icon: Activity },
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

/**
 * Period toolbar:
 *
 *  - Desktop: `[ ◀ │ label ▸ │ ▶ ]  …gap…  [Today]  [Day│Week│Month│Year]`
 *    (date capsule grows, segmented control keeps a fixed width)
 *  - Mobile:  segmented control on top, date capsule + Today below.
 *
 * The segmented control has a single sliding "thumb" behind the active
 * option (pure CSS — `left` is derived from the active index).
 */
export default function PeriodNavigator({
  selectedPeriod,
  onPeriodChange,
  onNavigatePeriod,
  onGoToToday,
  formatLabel,
  isEmbedded = false,
  selectedDate,
  onDateChange,
  showPeriodSelector = true,
  canNavigatePrevious = true,
  canNavigateNext = true,
  isDateDisabled,
}: PeriodNavigatorProps) {
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
        const direction = diff > 0 ? 'prev' : 'next'
        const canNavigate = direction === 'prev'
          ? canNavigatePrevious
          : canNavigateNext
        if (canNavigate) onNavigatePeriod(direction)
      }
      touchStartX.current = null
    },
    [canNavigateNext, canNavigatePrevious, onNavigatePeriod],
  )

  // ── Theme tokens ──────────────────────────────────────────────────────
  const ed = useEd()
  const surfaceBgBase = useColorModeValue('transparent', 'transparent')
  const surfaceBg = ed ? 'transparent' : surfaceBgBase
  const surfaceBorderBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const surfaceBorder = ed ? ed.line : surfaceBorderBase

  const trackBgBase = useColorModeValue('transparent', 'transparent')
  const trackBg = ed ? 'transparent' : trackBgBase
  const thumbBgBase = useColorModeValue('white', 'rgba(255,255,255,0.12)')
  const thumbBg = ed ? ed.thumbBg : thumbBgBase
  const thumbBorderBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const thumbBorder = ed ? ed.lineStrong : thumbBorderBase
  const thumbShadow = useColorModeValue(
    '0 1px 4px rgba(15,23,42,0.12)',
    '0 1px 4px rgba(0,0,0,0.5)',
  )
  const segActiveColorBase = useColorModeValue('gray.900', 'gray.50')
  const segActiveColor = ed ? ed.cream : segActiveColorBase
  const segInactiveColorBase = useColorModeValue('gray.500', 'gray.400')
  const segInactiveColor = ed ? ed.muted : segInactiveColorBase

  const capsuleBorderBase = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const capsuleBorder = ed ? ed.lineStrong : capsuleBorderBase
  const capsuleDividerBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const capsuleDivider = ed ? ed.line : capsuleDividerBase
  const navBtnColorBase = useColorModeValue('gray.500', 'gray.400')
  const navBtnColor = ed ? ed.muted : navBtnColorBase
  const navBtnHoverBgBase = useColorModeValue('gray.50', 'whiteAlpha.100')
  const navBtnHoverBg = ed ? ed.panelRaised : navBtnHoverBgBase
  const navBtnHoverColorBase = useColorModeValue('blue.600', 'blue.300')
  const navBtnHoverColor = ed ? ed.jade : navBtnHoverColorBase

  const todayBtnColorBase = useColorModeValue('blue.600', 'blue.300')
  const todayBtnColor = ed ? ed.jade : todayBtnColorBase
  const todayBtnBgBase = useColorModeValue('blue.50', 'rgba(59,130,246,0.12)')
  const todayBtnBg = ed ? ed.jadeSoft : todayBtnBgBase
  const todayBtnHoverBgBase = useColorModeValue('blue.100', 'rgba(59,130,246,0.22)')
  const todayBtnHoverBg = ed ? ed.jadeSoftHover : todayBtnHoverBgBase

  // ── Derived state ─────────────────────────────────────────────────────
  const isCurrent = isCurrentPeriod(selectedDate, selectedPeriod)
  const hint = getRelativeHint(selectedDate, selectedPeriod)
  const activeIndex = Math.max(
    0,
    PERIODS.findIndex((period) => period.type === selectedPeriod),
  )
  const segCount = PERIODS.length

  return (
    <Box
      w="full"
      bg={isEmbedded ? 'transparent' : surfaceBg}
      border={isEmbedded ? 'none' : '1px solid'}
      borderColor={surfaceBorder}
      borderRadius={isEmbedded ? 'none' : '2xl'}
      p={isEmbedded ? 0 : { base: 3, md: 4 }}
    >
      <Flex
        direction={{ base: showPeriodSelector ? 'column' : 'row', md: 'row' }}
        align={{ base: 'stretch', md: 'center' }}
        gap={{ base: 2.5, md: 3 }}
        w="full"
      >
        {/* ── Date capsule: ◀ │ label ▾ │ ▶  (+ Today) ─────────────── */}
        <HStack
          order={{ base: 2, md: 1 }}
          flex={1}
          minW={0}
          spacing={2}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <HStack
            flex={1}
            minW={0}
            spacing={0}
            h="42px"
            border="1px solid"
            borderColor={capsuleBorder}
            borderRadius="xl"
            overflow="hidden"
            bg="transparent"
          >
            <IconButton
              aria-label="Previous period"
              icon={<Icon as={ChevronLeft} boxSize={4} />}
              onClick={() => onNavigatePeriod('prev')}
              isDisabled={!canNavigatePrevious}
              variant="ghost"
              h="full"
              w="42px"
              minW="42px"
              borderRadius="none"
              color={navBtnColor}
              _hover={{ bg: navBtnHoverBg, color: navBtnHoverColor }}
              _disabled={{ opacity: 0.35, cursor: 'not-allowed' }}
              transition="all 0.15s ease"
            />

            <Box w="1px" h="50%" bg={capsuleDivider} flexShrink={0} />

            <PeriodDatePicker
              selectedDate={selectedDate}
              selectedPeriod={selectedPeriod}
              onDateChange={onDateChange}
              label={formatLabel()}
              hint={hint}
              isDateDisabled={isDateDisabled}
            />

            <Box w="1px" h="50%" bg={capsuleDivider} flexShrink={0} />

            <IconButton
              aria-label="Next period"
              icon={<Icon as={ChevronRight} boxSize={4} />}
              onClick={() => onNavigatePeriod('next')}
              isDisabled={!canNavigateNext}
              variant="ghost"
              h="full"
              w="42px"
              minW="42px"
              borderRadius="none"
              color={navBtnColor}
              _hover={{ bg: navBtnHoverBg, color: navBtnHoverColor }}
              _disabled={{ opacity: 0.35, cursor: 'not-allowed' }}
              transition="all 0.15s ease"
            />
          </HStack>

          {/* Today — pill with label on desktop, icon-only on mobile */}
          {!isCurrent && (
            <>
              <Button
                display={{ base: 'none', md: 'inline-flex' }}
                onClick={onGoToToday}
                h="42px"
                px={4}
                borderRadius="xl"
                fontSize="xs"
                fontWeight={700}
                color={todayBtnColor}
                bg={todayBtnBg}
                leftIcon={<Icon as={RotateCcw} boxSize={3.5} weight="duotone" />}
                _hover={{ bg: todayBtnHoverBg }}
                _active={{ transform: 'scale(0.97)' }}
                transition="all 0.15s ease"
                flexShrink={0}
              >
                Today
              </Button>
              <Tooltip label="Jump to today" hasArrow placement="top" openDelay={200}>
                <IconButton
                  display={{ base: 'inline-flex', md: 'none' }}
                  aria-label="Go to today"
                  icon={<Icon as={RotateCcw} boxSize={4} weight="duotone" />}
                  onClick={onGoToToday}
                  h="42px"
                  w="42px"
                  minW="42px"
                  borderRadius="xl"
                  color={todayBtnColor}
                  bg={todayBtnBg}
                  _hover={{ bg: todayBtnHoverBg }}
                  transition="all 0.15s ease"
                  flexShrink={0}
                />
              </Tooltip>
            </>
          )}
        </HStack>

        {/* ── Segmented period control with sliding thumb ──────────── */}
        {showPeriodSelector && (
          <Box
            order={{ base: 1, md: 2 }}
            position="relative"
            bg={trackBg}
            p="3px"
            borderRadius="xl"
            w={{ base: 'full', md: '380px' }}
            flexShrink={0}
          >
          {/* Sliding thumb */}
          <Box
            position="absolute"
            top="3px"
            bottom="3px"
            left={`calc(3px + ${activeIndex} * ((100% - 6px) / ${segCount}))`}
            w={`calc((100% - 6px) / ${segCount})`}
            bg={thumbBg}
            border="1px solid"
            borderColor={thumbBorder}
            borderRadius="lg"
            boxShadow={thumbShadow}
            transition="left 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            pointerEvents="none"
          />

          <HStack spacing={0} position="relative">
            {PERIODS.map(({ type, label, icon: PeriodIcon }) => {
              const selected = selectedPeriod === type
              return (
                <Button
                  key={type}
                  flex={1}
                  minW={0}
                  h="34px"
                  px={1}
                  variant="ghost"
                  borderRadius="lg"
                  onClick={() => onPeriodChange(type)}
                  aria-pressed={selected}
                  bg="transparent"
                  color={selected ? segActiveColor : segInactiveColor}
                  fontWeight={selected ? 700 : 500}
                  fontSize="sm"
                  _hover={{ bg: 'transparent', color: segActiveColor }}
                  _active={{ bg: 'transparent' }}
                  _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'blue.300',
                    outlineOffset: '2px',
                  }}
                  transition="color 0.18s ease, font-weight 0.18s ease"
                >
                  <HStack spacing={1.5} justify="center" minW={0}>
                    <Icon
                      as={PeriodIcon}
                      boxSize={3.5}
                      weight="duotone"
                      display={{ base: 'none', lg: 'inline-block' }}
                      opacity={selected ? 1 : 0.7}
                    />
                    <Text as="span" noOfLines={1}>
                      {label}
                    </Text>
                  </HStack>
                </Button>
              )
            })}
          </HStack>
          </Box>
        )}
      </Flex>
    </Box>
  )
}
