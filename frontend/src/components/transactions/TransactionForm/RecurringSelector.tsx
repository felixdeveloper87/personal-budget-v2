import {
  Box,
  Divider,
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

/** Label + aligned control column matches width across rows (tabular form). */
function FieldRow({
  label,
  children,
  colors,
  inlineOnMobile = false,
}: {
  label: string
  children: ReactNode
  colors: ReturnType<typeof useThemeColors>
  /** Keep label + control on one row on narrow screens (e.g. Payment day stepper). */
  inlineOnMobile?: boolean
}) {
  return (
    <Flex
      align="center"
      gap={{ base: 3, sm: 4 }}
      w="full"
      minW={0}
      direction={inlineOnMobile ? 'row' : { base: 'column', sm: 'row' }}
    >
      <Text
        w={
          inlineOnMobile
            ? { base: 'auto', sm: '5.75rem' }
            : { base: 'full', sm: '5.75rem' }
        }
        flexShrink={0}
        whiteSpace={{ base: inlineOnMobile ? 'nowrap' : 'normal', sm: 'normal' }}
        fontSize="xs"
        fontWeight="600"
        color={colors.text.secondary}
        letterSpacing="-0.01em"
      >
        {label}
      </Text>
      <Flex flex={1} minW={0} w={{ base: inlineOnMobile ? 'auto' : 'full', sm: 'auto' }} justify="flex-end">
        <Box
          w="full"
          maxW={
            inlineOnMobile
              ? { sm: '220px', md: '244px' }
              : { base: '100%', sm: '220px', md: '244px' }
          }
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}

export default function RecurringSelector({
  title = 'Fixed payment schedule',
  type = 'EXPENSE',
  startDate,
  onStartDateChange,
  dayOfMonth,
  onDayOfMonthChange,
  showSystemNote = true,
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
          _hover={{
            borderColor: accentBorder,
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          _focusWithin={{
            borderColor: accentBorder,
            boxShadow: focusWithinShadow,
            transform: 'translateY(-2px)',
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <VStack align="stretch" spacing={0} px={{ base: 3, sm: 4 }} py={{ base: 3, sm: 3.5 }}>
            <Flex align="flex-start" gap={3}>
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
                mt={0.5}
                aria-hidden
              >
                <Icon
                  as={CalendarClock}
                  boxSize={5}
                  sx={{ '& svg': { display: 'block' } }}
                />
              </Box>
              <VStack align="flex-start" spacing={1} minW={0} flex={1}>
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontWeight="600"
                  color={colors.text.secondary}
                  lineHeight="1.25"
                >
                  {title}
                </Text>
                <Text fontSize="xs" color={colors.text.secondary} lineHeight="1.4">
                  {isIncome
                    ? 'Runs every month — only the payment day is needed.'
                    : 'When is your first payment, how often does it repeat, and which calendar day is due monthly?'}
                </Text>
              </VStack>
            </Flex>

            <Divider borderColor={colors.border} mt={4} mb={4} />

            <VStack align="stretch" spacing={4} w="full">
              {showStartAndRhythm && (
                <FieldRow label="First payment" colors={colors}>
                  <Input
                    type="date"
                    value={startDate ?? ''}
                    onChange={(e) => onStartDateChange?.(e.target.value)}
                    w="full"
                    fontSize={{ base: 'sm', sm: 'sm' }}
                    fontWeight={600}
                    {...fieldShell}
                  />
                </FieldRow>
              )}

              {showStartAndRhythm && (
                <FieldRow label="Frequency" colors={colors}>
                  <Flex
                    align="center"
                    justify="center"
                    w="full"
                    fontSize={{ base: 'sm', sm: 'sm' }}
                    fontWeight={700}
                    color={colors.text.primary}
                    pointerEvents="none"
                    borderWidth="1px"
                    borderStyle="solid"
                    {...fieldShell}
                  >
                    Monthly
                  </Flex>
                </FieldRow>
              )}

              <FieldRow
                label={isIncome ? 'Payment day' : 'Due calendar day'}
                colors={colors}
                inlineOnMobile
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
                    textAlign="center"
                    fontSize={{ base: 'sm', sm: 'sm' }}
                    fontWeight="bold"
                    {...fieldShell}
                  />
                  <NumberInputStepper borderColor={colors.border}>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FieldRow>
            </VStack>

            <Text
              fontSize="2xs"
              color={colors.text.secondary}
              lineHeight="1.45"
              mt={5}
              pt={1}
            >
              {isIncome
                ? 'You can edit the amount or cancel later under Fixed payments.'
                : showSystemNote
                  ? 'Monthly job runs once early on the 1st of each month (not every day); the posted expense uses your chosen due calendar day.'
                  : 'You can edit the amount or cancel later under Fixed payments.'}
            </Text>
          </VStack>
        </Box>
      </Box>
    </VStack>
  )
}
