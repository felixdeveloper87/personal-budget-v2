import {
  Box,
  Button,
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
import { CreditCard } from '../../ui/icons'
import { useThemeColors } from '../../../hooks/useThemeColors'
import type { PaymentMethod } from '../../../types'
import { resolveCardPaymentDate } from '../../../utils/creditCardStatements'
import ChipCarousel from './ChipCarousel'

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

/** Compact field with its label stacked on top — sits inline in the single content row. */
function InlineField({
  label,
  w,
  colors,
  children,
}: {
  label: string
  w: string
  colors: ReturnType<typeof useThemeColors>
  children: ReactNode
}) {
  return (
    <VStack
      spacing={1}
      align="stretch"
      flexShrink={0}
      w={w}
      maxW={w}
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

/**
 * Installment Plan — matches the Fixed schedule card: title + content on one
 * line (two lines on mobile), with the quick-month presets as a carousel.
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

  const readOnlyField = {
    h: { base: 9, sm: 10 },
    bg: colors.bgSecondary,
    border: '1px solid',
    borderColor: colors.border,
    borderRadius: 'lg',
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
          <VStack align="stretch" spacing={2.5} px={{ base: 3, sm: 3.5 }} py={{ base: 2.5, sm: 3 }}>
            {/* Title + content on a single line (two lines on mobile). */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'stretch', md: 'center' }}
              gap={{ base: 2.5, md: 4 }}
              w="full"
              minW={0}
            >
              {/* Title (+ optional toggle) */}
              <Flex
                align="center"
                justify="space-between"
                gap={2.5}
                flexShrink={0}
                w={{ base: 'full', md: 'auto' }}
              >
                <Flex align="center" gap={2.5} minW={0}>
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
                    <Icon as={CreditCard} boxSize={5} sx={{ '& svg': { display: 'block' } }} />
                  </Box>
                  <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="600"
                    color={colors.text.secondary}
                    lineHeight="1.2"
                    whiteSpace="nowrap"
                  >
                    Installment plan
                  </Text>
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
              </Flex>

              {/* Controls — one inline row, scrolls (carousel) when tight. */}
              {contentVisible && (
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
                  <InlineField label="Months" w="74px" colors={colors}>
                    <NumberInput
                      value={installments}
                      onChange={(_, val) => onInstallmentsChange(val || 2)}
                      min={2}
                      max={60}
                      w="full"
                      size="sm"
                    >
                      <NumberInputField
                        w="full"
                        minW={0}
                        textAlign="center"
                        fontWeight="bold"
                        fontSize="sm"
                        {...fieldShell}
                        sx={{
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

                  {!cardSchedule && (
                    <InlineField label="First payment" w="150px" colors={colors}>
                      <Input
                        type="date"
                        value={firstInstallmentDate}
                        onChange={(e) => onFirstInstallmentDateChange(e.target.value)}
                        w="full"
                        fontSize="sm"
                        fontWeight={600}
                        sx={{ '&::-webkit-calendar-picker-indicator': { cursor: 'pointer' } }}
                        {...fieldShell}
                      />
                    </InlineField>
                  )}

                  <InlineField label="Per month" w="96px" colors={colors}>
                    <Flex
                      align="center"
                      justify="center"
                      w="full"
                      fontSize="sm"
                      fontWeight={800}
                      color={colors.text.primary}
                      {...readOnlyField}
                    >
                      £{installmentAmount.toFixed(2)}
                    </Flex>
                  </InlineField>

                  <InlineField label="Total" w="96px" colors={colors}>
                    <Flex
                      align="center"
                      justify="center"
                      w="full"
                      fontSize="sm"
                      fontWeight={700}
                      color={colors.text.primary}
                      {...readOnlyField}
                    >
                      £{totalAmount.toFixed(2)}
                    </Flex>
                  </InlineField>
                </Flex>
              )}
            </Flex>

            {contentVisible && (
              <>
                {/* Quick month presets as a carousel. */}
                <ChipCarousel>
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
                        installments === option.value ? colors.text.primary : colors.text.secondary
                      }
                      bg={installments === option.value ? colors.bgSecondary : 'transparent'}
                      fontSize="xs"
                      fontWeight={installments === option.value ? 600 : 500}
                      opacity={installments === option.value ? 1 : 0.78}
                      sx={{ scrollSnapAlign: 'start' }}
                      _hover={{ bg: colors.bgSecondary, opacity: 1, textDecoration: 'underline' }}
                      _active={{ bg: colors.bgSecondary }}
                      _focusVisible={{ boxShadow: focusRing }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </ChipCarousel>

                {cardSchedule && (
                  <HStack spacing={2} align="center">
                    <Icon as={CreditCard} boxSize={3.5} color={accentBorder} flexShrink={0} />
                    <Text fontSize="2xs" color={colors.text.secondary} lineHeight="1.4">
                      Billed by {cardSchedule.name} · first due {formatDue(firstDueDate)}, then monthly
                      on day {cardSchedule.paymentDay}.
                    </Text>
                  </HStack>
                )}
              </>
            )}
          </VStack>
        </Box>
      </Box>
    </VStack>
  )
}
