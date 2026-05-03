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

interface InstallmentSelectorProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  installments: number
  onInstallmentsChange: (installments: number) => void
  amount: number
  firstInstallmentDate: string
  onFirstInstallmentDateChange: (date: string) => void
  showToggle?: boolean
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
}: InstallmentSelectorProps) {
  const colors = useThemeColors()
  const accentBorder = 'red.400'
  const focusWithinShadow = '0 0 0 3px #f8717120'
  const focusRing = '0 0 0 2px rgba(248, 113, 113, 0.2)'

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
            <HStack justify="space-between" align="flex-start" spacing={3}>
              <Flex align="flex-start" gap={3} minW={0} flex={1}>
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
                    as={CreditCard}
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
                    Installment plan
                  </Text>
                  <Text fontSize="xs" color={colors.text.secondary} lineHeight="1.4">
                    {showToggle && !enabled
                      ? 'Split this expense into monthly charges with a chosen start date.'
                      : 'Choose how many months and when the first charge lands.'}
                  </Text>
                </VStack>
              </Flex>
              {showToggle && (
                <Switch
                  isChecked={enabled}
                  onChange={(e) => onEnabledChange(e.target.checked)}
                  colorScheme="red"
                  size="lg"
                  flexShrink={0}
                  mt={1}
                  aria-label="Split into installments"
                />
              )}
            </HStack>

            {contentVisible && (
              <>
                <Divider borderColor={colors.border} mt={4} mb={4} />

                <Text fontSize="xs" fontWeight={600} color={colors.text.secondary} mb={2}>
                  Quick select
                </Text>

                <Box
                  w="full"
                  mb={4}
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

                <VStack align="stretch" spacing={4} w="full">
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

                  <Divider borderColor={colors.border} />

                  <Flex
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap={2}
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

                <Text fontSize="2xs" color={colors.text.secondary} lineHeight="1.45" mt={5} pt={1}>
                  One transaction per installment with the amounts above. You can review plans under
                  Installments on the dashboard.
                </Text>
              </>
            )}
          </VStack>
        </Box>
      </Box>
    </VStack>
  )
}
