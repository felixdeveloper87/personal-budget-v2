import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronDown, ChevronLeft, ChevronRight } from '../ui/icons'
import { PeriodType } from '../../types'
import { useEd } from '../../editorial'

interface PeriodDatePickerProps {
  selectedDate: Date
  selectedPeriod: PeriodType
  onDateChange: (date: Date) => void
  label: string
  hint: string | null
  isDateDisabled?: (date: Date) => boolean
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS = Array.from({ length: 12 }, (_, month) =>
  new Date(2020, month, 1).toLocaleDateString('en-GB', { month: 'short' }),
)

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const weekday = start.getDay()
  start.setDate(start.getDate() - (weekday === 0 ? 6 : weekday - 1))
  return start
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function sameWeek(a: Date, b: Date) {
  return sameDay(startOfWeek(a), startOfWeek(b))
}

function calendarDays(viewDate: Date) {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const start = startOfWeek(first)
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

function calendarWeeks(viewDate: Date) {
  const days = calendarDays(viewDate)
  return Array.from({ length: 6 }, (_, index) => {
    const start = days[index * 7]
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start, end }
  })
}

export default function PeriodDatePicker({
  selectedDate,
  selectedPeriod,
  onDateChange,
  label,
  hint,
  isDateDisabled,
}: PeriodDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(selectedDate)

  useEffect(() => {
    if (isOpen) setViewDate(selectedDate)
  }, [isOpen, selectedDate, selectedPeriod])

  const days = useMemo(() => calendarDays(viewDate), [viewDate])
  const weeks = useMemo(() => calendarWeeks(viewDate), [viewDate])

  const ed = useEd()
  const contentBgBase = useColorModeValue('white', 'gray.900')
  const contentBg = ed?.solid ?? contentBgBase
  const borderColorBase = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const borderColor = ed?.lineStrong ?? borderColorBase
  const mutedColorBase = useColorModeValue('gray.500', 'gray.400')
  const mutedColor = ed?.muted ?? mutedColorBase
  const hoverBgBase = useColorModeValue('gray.100', 'whiteAlpha.100')
  const hoverBg = ed?.hoverBg ?? hoverBgBase
  const selectedBgBase = useColorModeValue('blue.500', 'blue.400')
  const selectedBg = ed?.jade ?? selectedBgBase
  const selectedColorBase = useColorModeValue('white', 'gray.900')
  const selectedColor = ed?.onAccent ?? selectedColorBase
  const outsideColorBase = useColorModeValue('gray.300', 'gray.600')
  const outsideColor = ed?.muted ?? outsideColorBase
  const labelColorBase = useColorModeValue('gray.900', 'gray.50')
  const labelColor = ed?.cream ?? labelColorBase
  const hintColorBase = useColorModeValue('blue.600', 'blue.300')
  const hintColor = ed?.jade ?? hintColorBase
  const hintBgBase = useColorModeValue('blue.50', 'rgba(59,130,246,0.12)')
  const hintBg = ed?.jadeSoft ?? hintBgBase
  const triggerLabelColor = ed ? ed.cream : labelColor
  const triggerChevronColor = ed ? ed.muted : mutedColor
  const triggerHoverBg = ed ? ed.panelRaised : hoverBg
  const triggerHintColor = ed ? ed.jade : hintColor
  const triggerHintBg = ed ? ed.jadeSoft : hintBg
  const focusColor = ed?.jade ?? 'blue.300'

  const closeWithDate = (date: Date) => {
    if (isDateDisabled?.(date)) return
    onDateChange(date)
    setIsOpen(false)
  }

  const moveView = (offset: number) => {
    setViewDate((current) => {
      if (selectedPeriod === 'year') {
        return new Date(current.getFullYear() + offset * 12, 0, 1)
      }
      if (selectedPeriod === 'month') {
        return new Date(current.getFullYear() + offset, current.getMonth(), 1)
      }
      return new Date(current.getFullYear(), current.getMonth() + offset, 1)
    })
  }

  const firstYear = Math.floor(viewDate.getFullYear() / 12) * 12
  const headerLabel =
    selectedPeriod === 'year'
      ? `${firstYear} - ${firstYear + 11}`
      : selectedPeriod === 'month'
        ? viewDate.getFullYear().toString()
        : viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const renderPicker = () => {
    if (selectedPeriod === 'day') {
      return (
        <>
          <SimpleGrid columns={7} spacing={1} mb={1}>
            {WEEKDAYS.map((weekday, index) => (
              <Text
                key={`${weekday}-${index}`}
                textAlign="center"
                fontSize="2xs"
                fontWeight={700}
                color={mutedColor}
                py={1}
              >
                {weekday}
              </Text>
            ))}
          </SimpleGrid>
          <SimpleGrid columns={7} spacing={1}>
            {days.map((date) => {
              const selected = sameDay(date, selectedDate)
              const inMonth = date.getMonth() === viewDate.getMonth()
              const disabled = isDateDisabled?.(date) ?? false
              return (
                <Button
                  key={date.toISOString()}
                  size="xs"
                  h="32px"
                  minW={0}
                  p={0}
                  borderRadius="md"
                  variant="ghost"
                  bg={selected ? selectedBg : 'transparent'}
                  color={selected ? selectedColor : inMonth ? labelColor : outsideColor}
                  _hover={{ bg: selected ? selectedBg : hoverBg }}
                  isDisabled={disabled}
                  onClick={() =>
                    closeWithDate(
                      new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                    )
                  }
                >
                  {date.getDate()}
                </Button>
              )
            })}
          </SimpleGrid>
        </>
      )
    }

    if (selectedPeriod === 'week') {
      return (
        <VStack spacing={1} align="stretch">
          {weeks.map(({ start, end }) => {
            const selected = sameWeek(start, selectedDate)
            const disabled = isDateDisabled?.(start) ?? false
            const format = (date: Date) =>
              date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            return (
              <Button
                key={start.toISOString()}
                size="sm"
                justifyContent="space-between"
                variant="ghost"
                bg={selected ? selectedBg : 'transparent'}
                color={selected ? selectedColor : labelColor}
                _hover={{ bg: selected ? selectedBg : hoverBg }}
                isDisabled={disabled}
                onClick={() => closeWithDate(start)}
              >
                <Text>{format(start)}</Text>
                <Text fontWeight={500} opacity={0.8}>
                  {format(end)}
                </Text>
              </Button>
            )
          })}
        </VStack>
      )
    }

    if (selectedPeriod === 'month') {
      return (
        <SimpleGrid columns={3} spacing={2}>
          {MONTHS.map((month, index) => {
            const date = new Date(viewDate.getFullYear(), index, 1)
            const selected =
              selectedDate.getFullYear() === viewDate.getFullYear() &&
              selectedDate.getMonth() === index
            const disabled = isDateDisabled?.(date) ?? false
            return (
              <Button
                key={month}
                size="sm"
                variant="ghost"
                bg={selected ? selectedBg : 'transparent'}
                color={selected ? selectedColor : labelColor}
                _hover={{ bg: selected ? selectedBg : hoverBg }}
                isDisabled={disabled}
                onClick={() => closeWithDate(date)}
              >
                {month}
              </Button>
            )
          })}
        </SimpleGrid>
      )
    }

    return (
      <SimpleGrid columns={3} spacing={2}>
        {Array.from({ length: 12 }, (_, index) => firstYear + index).map((year) => {
          const date = new Date(year, 0, 1)
          const selected = selectedDate.getFullYear() === year
          const disabled = isDateDisabled?.(date) ?? false
          return (
            <Button
              key={year}
              size="sm"
              variant="ghost"
              bg={selected ? selectedBg : 'transparent'}
              color={selected ? selectedColor : labelColor}
              _hover={{ bg: selected ? selectedBg : hoverBg }}
              isDisabled={disabled}
              onClick={() => closeWithDate(date)}
            >
              {year}
            </Button>
          )
        })}
      </SimpleGrid>
    )
  }

  return (
    <Popover
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      placement="bottom"
      closeOnBlur
      isLazy
    >
      <PopoverTrigger>
        <Button
          flex={1}
          h="full"
          alignSelf="stretch"
          minW={0}
          px={2}
          variant="ghost"
          borderRadius="none"
          aria-label={`Choose ${selectedPeriod}`}
          _hover={{ bg: triggerHoverBg }}
          _focusVisible={{
            outline: '2px solid',
            outlineColor: focusColor,
            outlineOffset: '-2px',
          }}
        >
          <HStack spacing={2} minW={0} justify="center" w="full">
            <Text
              textStyle={ed ? 'display' : undefined}
              fontSize={ed ? { base: 'md', md: 'lg' } : { base: 'sm', md: 'md' }}
              fontWeight={ed ? 400 : 700}
              color={triggerLabelColor}
              letterSpacing="-0.01em"
              lineHeight="1.3"
              noOfLines={1}
            >
              {label}
            </Text>
            {hint && (
              <Text
                as="span"
                fontSize="2xs"
                fontWeight={700}
                color={triggerHintColor}
                bg={triggerHintBg}
                px={2}
                py={0.5}
                borderRadius="full"
                lineHeight="1.4"
                whiteSpace="nowrap"
                flexShrink={0}
              >
                {hint}
              </Text>
            )}
            <Icon as={ChevronDown} boxSize={3} color={triggerChevronColor} flexShrink={0} />
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        w={{ base: 'calc(100vw - 32px)', sm: '320px' }}
        bg={contentBg}
        borderColor={borderColor}
        boxShadow="xl"
      >
        <PopoverArrow bg={contentBg} />
        <PopoverBody p={3}>
          <HStack justify="space-between" mb={3}>
            <IconButton
              aria-label="Previous picker page"
              icon={<Icon as={ChevronLeft} boxSize={4} />}
              size="sm"
              variant="ghost"
              onClick={() => moveView(-1)}
            />
            <Text fontSize="sm" fontWeight={700} color={labelColor}>
              {headerLabel}
            </Text>
            <IconButton
              aria-label="Next picker page"
              icon={<Icon as={ChevronRight} boxSize={4} />}
              size="sm"
              variant="ghost"
              onClick={() => moveView(1)}
            />
          </HStack>
          <Box>{renderPicker()}</Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
