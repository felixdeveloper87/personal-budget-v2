import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Calculator, CreditCard } from '../../ui/icons'
import { useThemeColors } from '../../../hooks/useThemeColors'
import type { PaymentMethod } from '../../../types'
import { resolveCardPaymentDate } from '../../../utils/creditCardStatements'

interface InstallmentSelectorProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  installments: number
  onInstallmentsChange: (installments: number) => void
  amount: number
  firstInstallmentDate: string
  onFirstInstallmentDateChange: (date: string) => void
  showToggle?: boolean
  /** Selected credit card, if any. When set, due dates follow the card's cycle. */
  card?: PaymentMethod | null
}

function FieldRow({
  label,
  children,
  colors,
}: {
  label: string
  children: ReactNode
  colors: ReturnType<typeof useThemeColors>
}) {
  return (
    <Flex
      align="center"
      gap={{ base: 3, sm: 4 }}
      w="full"
      minW={0}
      direction={{ base: 'column', sm: 'row' }}
    >
      <Text
        w={{ base: 'full', sm: '5.75rem' }}
        flexShrink={0}
        fontSize="xs"
        fontWeight="600"
        color={colors.text.secondary}
        letterSpacing="-0.01em"
      >
        {label}
      </Text>
      <Flex flex={1} minW={0} w="full" justify="flex-end">
        <Box w="full" maxW={{ base: '100%', sm: '220px', md: '244px' }}>
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}

/**
 * Installment Plan — matches Add expense modal card pattern (Recurring / Amount / Date).
 */
export default function InstallmentSelector({
  enabled,
  onEnabledChange,
  installments,
  onInstallmentsChange,
  amount,
  firstInstallmentDate,
  onFirstInstallmentDateChange,
  showToggle = true,
  card = null,
}: InstallmentSelectorProps) {
  const colors = useThemeColors()
  const accentBorder = 'red.400'
  const focusWithinShadow = '0 0 0 3px #f8717120'
  const focusRing = '0 0 0 2px rgba(248, 113, 113, 0.2)'

  // When the installment is charged to a credit card, the due dates come from the
  // card's billing cycle — the user shouldn't pick a date manually.
  const cardSchedule =
    card?.type === 'CREDIT_CARD' && card.statementClosingDay && card.paymentDay ? card : null

  const formatDue = (date: Date | null) =>
    date
      ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—'

  const firstDueDate = (() => {
    if (!cardSchedule) return null
    const parts = firstInstallmentDate.split('-').map(Number)
    const purchase =
      parts.length === 3 && parts.every((n) => !Number.isNaN(n))
        ? new Date(parts[0], parts[1] - 1, parts[2])
        : new Date()
    return resolveCardPaymentDate(purchase, cardSchedule)
  })()

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

  const installmentAmount = installments >= 2 ? amount / installments : amount
  const totalAmount = amount

  const quickInstallmentOptions = [
    { label: '2x', value: 2 },
    { label: '3x', value: 3 },
    { label: '6x', value: 6 },
    { label: '12x', value: 12 },
    { label: '24x', value: 24 },
    { label: '36x', value: 36 },
    { label: '48x', value: 48 },
    { label: '60x', value: 60 },
  ]

  const contentVisible = enabled || !showToggle

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
          <VStack align="stretch" spacing={0} px={{ base: 3, sm: 3.5 }} py={{ base: 2.5, sm: 3 }}>
            <HStack justify="space-between" align="center" spacing={3}>
              <Flex align="center" gap={2.5} minW={0} flex={1}>
                <Box
                  role="presentation"
                  w={8}
                  h={8}
                  borderRadius="lg"
                  bg={colors.bgSecondary}
                  color={accentBorder}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  aria-hidden
                >
                  <Icon
                    as={CreditCard}
                    boxSize={4}
                    sx={{ '& svg': { display: 'block' } }}
                  />
                </Box>
                <VStack align="flex-start" spacing={0} minW={0} flex={1}>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color={colors.text.secondary}
                    lineHeight="1.25"
                  >
                    Installment plan
                  </Text>
                  <Text fontSize="2xs" color={colors.text.secondary} lineHeight="1.35" noOfLines={1}>
                    {showToggle && !enabled
                      ? 'Split this expense into monthly charges.'
                      : 'Choose how many months.'}
                  </Text>
                </VStack>
              </Flex>
              {showToggle && (
                <Switch
                  isChecked={enabled}
                  onChange={(e) => onEnabledChange(e.target.checked)}
                  colorScheme="red"
                  size="md"
                  flexShrink={0}
                  aria-label="Split into installments"
                />
              )}
            </HStack>

            {contentVisible && (
              <>
                <Divider borderColor={colors.border} mt={2.5} mb={2.5} />

                <Text fontSize="2xs" fontWeight={600} color={colors.text.secondary} mb={1.5}>
                  Quick select
                </Text>

                <Box
                  w="full"
                  mb={2.5}
                  overflowX="auto"
                  overflowY="hidden"
                  py={1}
                  sx={{
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': { h: '6px' },
                    '&::-webkit-scrollbar-thumb': {
                      bg: colors.border,
                      borderRadius: 'full',
                    },
                  }}
                >
                  <Flex
                    as="div"
                    role="group"
                    aria-label="Installment duration quick select"
                    gap={1}
                    flexWrap="nowrap"
                    w="max-content"
                  >
                    {quickInstallmentOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant="ghost"
                        onClick={() => onInstallmentsChange(option.value)}
                        h={{ base: 7, sm: 8 }}
                        px={{ base: 2, sm: 2.5 }}
                        minW="unset"
                        flexShrink={0}
                        borderRadius="full"
                        color={
                          installments === option.value
                            ? colors.text.primary
                            : colors.text.secondary
                        }
                        bg={
                          installments === option.value
                            ? colors.bgSecondary
                            : 'transparent'
                        }
                        fontSize={{ base: 'xs', sm: 'xs' }}
                        fontWeight={installments === option.value ? 600 : 500}
                        opacity={installments === option.value ? 1 : 0.78}
                        _hover={{ bg: colors.bgSecondary, opacity: 1 }}
                        _active={{ bg: colors.bgSecondary }}
                        _focusVisible={{ boxShadow: focusRing }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </Flex>
                </Box>

                <VStack align="stretch" spacing={2.5} w="full">
                  <FieldRow label="Count" colors={colors}>
                    <NumberInput
                      value={installments}
                      onChange={(_, val) => onInstallmentsChange(val || 2)}
                      min={2}
                      max={60}
                      w="full"
                      size="sm"
                    >
                      <NumberInputField
                        textAlign="center"
                        fontWeight="bold"
                        fontSize={{ base: 'sm', sm: 'sm' }}
                        {...fieldShell}
                      />
                      <NumberInputStepper borderColor={colors.border}>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FieldRow>

                  {cardSchedule ? (
                    <Box
                      w="full"
                      borderRadius="lg"
                      bg={colors.bgSecondary}
                      border="1px solid"
                      borderColor={colors.border}
                      px={{ base: 3, sm: 3.5 }}
                      py={2.5}
                    >
                      <HStack spacing={2} align="center" mb={0.5}>
                        <Icon as={CreditCard} boxSize={3.5} color={accentBorder} />
                        <Text fontSize="xs" fontWeight={700} color={colors.text.primary}>
                          Billed by {cardSchedule.name}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color={colors.text.secondary} lineHeight="1.45">
                        Closes day {cardSchedule.statementClosingDay} · due day {cardSchedule.paymentDay}. First
                        installment due {formatDue(firstDueDate)}, then monthly on day {cardSchedule.paymentDay}.
                      </Text>
                    </Box>
                  ) : (
                    <FieldRow label="First payment" colors={colors}>
                      <Input
                        type="date"
                        value={firstInstallmentDate}
                        onChange={(e) => onFirstInstallmentDateChange(e.target.value)}
                        w="full"
                        fontSize={{ base: 'sm', sm: 'sm' }}
                        fontWeight={600}
                        sx={{ '&::-webkit-calendar-picker-indicator': { cursor: 'pointer' } }}
                        {...fieldShell}
                      />
                    </FieldRow>
                  )}

                  <Divider borderColor={colors.border} />

                  <Flex
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap={1}
                    px={{ base: 0, sm: 1 }}
                  >
                    <HStack spacing={2} color={colors.text.secondary}>
                      <Icon
                        as={Calculator}
                        boxSize={4}
                        color={accentBorder}
                      />
                      <Text fontSize="xs" fontWeight={600}>
                        Per month
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight={800} color={colors.text.primary}>
                      £{installmentAmount.toFixed(2)}
                    </Text>
                  </Flex>
                  <HStack justify="space-between" px={{ base: 0, sm: 1 }}>
                    <Text fontSize="xs" color={colors.text.secondary}>
                      Total financed
                    </Text>
                    <Text fontSize="xs" fontWeight={700} color={colors.text.primary}>
                      £{totalAmount.toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>

                <Text fontSize="2xs" color={colors.text.secondary} lineHeight="1.4" mt={2.5}>
                  One transaction per installment. Review plans under Installments on the dashboard.
                </Text>
              </>
            )}
          </VStack>
        </Box>
      </Box>
    </VStack>
  )
}
