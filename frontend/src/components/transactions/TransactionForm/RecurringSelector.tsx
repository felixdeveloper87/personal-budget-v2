import {
  Box,
  Flex,
  Icon,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  VStack,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { CalendarClock } from '../../ui/icons'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface RecurringSelectorProps {
  title?: string
  type?: 'INCOME' | 'EXPENSE'
  /** Hidden for INCOME fixed — only expense fixed uses this. */
  startDate?: string
  onStartDateChange?: (date: string) => void
  dayOfMonth: number
  onDayOfMonthChange: (day: number) => void
  showSystemNote?: boolean
}

/** Compact field with its label stacked on top — sits inline in the single content row. */
function InlineField({
  label,
  minW,
  colors,
  children,
}: {
  label: string
  minW: string
  colors: ReturnType<typeof useThemeColors>
  children: ReactNode
}) {
  return (
    <VStack
      spacing={1}
      align="stretch"
      flexShrink={0}
      w={minW}
      maxW={minW}
      sx={{ scrollSnapAlign: 'start' }}
    >
      <Text
        fontSize="2xs"
        fontWeight="600"
        color={colors.text.secondary}
        whiteSpace="nowrap"
        letterSpacing="-0.01em"
      >
        {label}
      </Text>
      {children}
    </VStack>
  )
}

export default function RecurringSelector({
  title = 'Fixed payment schedule',
  type = 'EXPENSE',
  startDate,
  onStartDateChange,
  dayOfMonth,
  onDayOfMonthChange,
}: RecurringSelectorProps) {
  const colors = useThemeColors()
  const isIncome = type === 'INCOME'
  const accentBorder = isIncome ? 'green.400' : 'red.400'
  const focusWithinShadow =
    type === 'INCOME' ? '0 0 0 3px #4ade8020' : '0 0 0 3px #f8717120'
  const focusRing = isIncome
    ? '0 0 0 2px rgba(74, 222, 128, 0.2)'
    : '0 0 0 2px rgba(248, 113, 113, 0.2)'

  const fieldShell = {
    h: { base: 9, sm: 10 },
    bg: colors.bgSecondary,
    borderColor: colors.border,
    borderRadius: 'lg',
    _focusVisible: {
      borderColor: accentBorder,
      boxShadow: focusRing,
    },
  }

  const showStartAndRhythm = !isIncome

  return (
    <VStack spacing={3} align="stretch">
      <Box>
        <Box
          borderRadius="2xl"
          bg={colors.inputBg}
          border="2px solid"
          borderColor={colors.border}
          _hover={{ borderColor: accentBorder }}
          _focusWithin={{
            borderColor: accentBorder,
            boxShadow: focusWithinShadow,
          }}
          transition="border-color 0.3s ease, box-shadow 0.3s ease"
        >
          <VStack align="stretch" spacing={2} px={{ base: 3, sm: 4 }} py={{ base: 3, sm: 3.5 }}>
            {/* Mobile: title row above content row. Desktop: both on one line. */}
            <Flex
              align={{ base: 'stretch', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 2.5, md: 4 }}
              w="full"
              minW={0}
            >
              {/* Title */}
              <Flex align="center" gap={2.5} flexShrink={0}>
                <Box
                  role="presentation"
                  w={9}
                  h={9}
                  borderRadius="lg"
                  bg={colors.bgSecondary}
                  color={accentBorder}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  aria-hidden
                >
                  <Icon as={CalendarClock} boxSize={5} sx={{ '& svg': { display: 'block' } }} />
                </Box>
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontWeight="600"
                  color={colors.text.secondary}
                  lineHeight="1.2"
                  whiteSpace="nowrap"
                >
                  {title}
                </Text>
              </Flex>

              {/* Controls — one inline row, scrolls (carousel) when tight. */}
              <Flex
                align="flex-end"
                gap={3}
                flex={{ base: 'unset', md: 1 }}
                minW={0}
                w={{ base: 'full', md: 'auto' }}
                justify={{ base: 'flex-start', md: 'flex-end' }}
                overflowX="auto"
                pb={1}
                sx={{
                  scrollSnapType: 'x proximity',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                  '::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {showStartAndRhythm && (
                  <InlineField label="First payment" minW="150px" colors={colors}>
                    <Input
                      type="date"
                      value={startDate ?? ''}
                      onChange={(e) => onStartDateChange?.(e.target.value)}
                      w="full"
                      fontSize="sm"
                      fontWeight={600}
                      {...fieldShell}
                    />
                  </InlineField>
                )}

                {showStartAndRhythm && (
                  <InlineField label="Frequency" minW="104px" colors={colors}>
                    <Flex
                      align="center"
                      justify="center"
                      w="full"
                      fontSize="sm"
                      fontWeight={700}
                      color={colors.text.primary}
                      pointerEvents="none"
                      borderWidth="1px"
                      borderStyle="solid"
                      {...fieldShell}
                    >
                      Monthly
                    </Flex>
                  </InlineField>
                )}

                <InlineField
                  label={isIncome ? 'Payment day' : 'Due day'}
                  minW="90px"
                  colors={colors}
                >
                  <NumberInput
                    value={dayOfMonth}
                    onChange={(_, value) => onDayOfMonthChange(value || 1)}
                    min={1}
                    max={31}
                    w="full"
                    size="sm"
                  >
                    <NumberInputField
                      w="full"
                      minW={0}
                      textAlign="center"
                      fontSize="sm"
                      fontWeight="bold"
                      {...fieldShell}
                      sx={{
                        // Balance the stepper reservation so the number sits centered.
                        paddingInlineStart: 'var(--number-input-stepper-width, 1.5rem)',
                        paddingInlineEnd: 'var(--number-input-stepper-width, 1.5rem)',
                      }}
                    />
                    <NumberInputStepper borderColor={colors.border}>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </InlineField>
              </Flex>
            </Flex>
          </VStack>
        </Box>
      </Box>
    </VStack>
  )
}
