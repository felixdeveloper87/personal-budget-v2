import {
  Box,
  HStack,
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
import { CalendarClock } from '../../ui/icons'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface RecurringSelectorProps {
  title?: string
  startDate: string
  onStartDateChange: (date: string) => void
  dayOfMonth: number
  onDayOfMonthChange: (day: number) => void
  showSystemNote?: boolean
}

export default function RecurringSelector({
  title = 'Fixed payment schedule',
  startDate,
  onStartDateChange,
  dayOfMonth,
  onDayOfMonthChange,
  showSystemNote = true,
}: RecurringSelectorProps) {
  const colors = useThemeColors()

  return (
    <VStack spacing={{ base: 3, sm: 4 }} align="stretch">
      <Box>
        <Text fontWeight="600" mb={{ base: 2, sm: 3 }} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
          {title}
        </Text>

        <Box
          position="relative"
          borderRadius="2xl"
          bg={colors.inputBg}
          border="2px solid"
          borderColor={colors.border}
          _hover={{
            borderColor: colors.accent,
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          _focusWithin={{
            borderColor: colors.accent,
            boxShadow: `0 0 0 3px ${colors.accent}20`,
            transform: 'translateY(-2px)',
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="2px"
            bg="linear-gradient(90deg, #14b8a6, #0d9488, #2563eb)"
            opacity={0.75}
          />

          <HStack justify="space-between" align="center" p={{ base: 3, sm: 4 }}>
            <HStack spacing={3}>
              <VStack align="flex-start" spacing={0}>
                <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="700" color={colors.text.primary}>
                  Repeat every month
                </Text>
                <Text fontSize="xs" color={colors.text.secondary}>
                  Pick when the payment belongs in each month.
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </Box>
      </Box>

      <VStack spacing={3} align="stretch" p={{ base: 3, sm: 3.5 }} bg={colors.bgSecondary} borderRadius="2xl" border="2px" borderColor={colors.border}>
          <HStack justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={CalendarClock} boxSize={4} color={colors.accent} />
              <Text fontSize={{ base: 'sm', sm: 'md' }} color={colors.text.secondary}>
                Starts from:
              </Text>
            </HStack>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => onStartDateChange(event.target.value)}
              w={{ base: '132px', sm: '150px' }}
              h={{ base: 9, sm: 10 }}
              fontSize={{ base: 'sm', sm: 'md' }}
              bg={colors.inputBg}
              borderColor={colors.border}
            />
          </HStack>

          <HStack justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={CalendarClock} boxSize={4} color={colors.accent} />
              <Text fontSize={{ base: 'sm', sm: 'md' }} color={colors.text.secondary}>
                Schedule:
              </Text>
            </HStack>
            <Text fontSize={{ base: 'sm', sm: 'md' }} color={colors.text.primary} fontWeight="bold">
              {showSystemNote ? 'System runs every month on day 1' : 'Monthly schedule'}
            </Text>
          </HStack>

          <HStack justify="space-between" align="center">
            <Text fontSize={{ base: 'sm', sm: 'md' }} color={colors.text.secondary}>
              Payment day:
            </Text>
            <NumberInput
              value={dayOfMonth}
              onChange={(_, value) => onDayOfMonthChange(value || 1)}
              min={1}
              max={31}
              w={{ base: '108px', sm: '120px' }}
            >
              <NumberInputField
                textAlign="center"
                fontWeight="bold"
                h={{ base: 9, sm: 10 }}
                bg={colors.inputBg}
                borderColor={colors.border}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </HStack>

          <Text fontSize="xs" color={colors.text.secondary}>
            {showSystemNote
              ? 'On the 1st, the system creates this month\'s transaction using your selected payment day.'
              : 'You can edit the amount or cancel this later from Fixed payments.'}
          </Text>
        </VStack>
    </VStack>
  )
}
