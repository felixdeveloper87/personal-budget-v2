import { Box, Text, Switch, HStack, VStack, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Icon, Button, Wrap, WrapItem, Input } from '@chakra-ui/react'
import { Calendar, Calculator } from '../../ui/icons'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles } from '../../ui'

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

/**
 * 💳 InstallmentSelector Component
 * - Allows users to enable/disable installment plans for expenses
 * - Shows installment calculation and total amount
 * - Only available for EXPENSE transactions
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
  const responsiveStyles = getResponsiveStyles()

  const installmentAmount = amount / installments
  const totalAmount = amount

  const getQuickInstallmentOptions = () => {
    return [
      { label: '2x', value: 2, color: 'green' },
      { label: '3x', value: 3, color: 'blue' },
      { label: '6x', value: 6, color: 'purple' },
      { label: '12x', value: 12, color: 'orange' },
      { label: '24x', value: 24, color: 'teal' },
      { label: '36x', value: 36, color: 'pink' },
      { label: '48x', value: 48, color: 'pink' },
      { label: '60x', value: 60, color: 'pink' }
    ]
  }

  const quickInstallmentOptions = getQuickInstallmentOptions()

  return (
    <VStack spacing={3} align="stretch">
      <Box>
        <Text fontWeight="600" mb={3} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
          Installment Plan
        </Text>
        
        {showToggle ? (
          <Box
            borderRadius="2xl"
            bg={colors.inputBg}
            border="2px solid"
            borderColor={colors.border}
            _hover={{
              borderColor: colors.accent,
              transform: 'translateY(-2px)',
              boxShadow: 'lg'
            }}
            _focusWithin={{
              borderColor: colors.accent,
              boxShadow: `0 0 0 3px ${colors.accent}20`,
              transform: 'translateY(-2px)'
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            <HStack justify="space-between" align="center" p={{ base: 3, sm: 3.5 }}>
              <HStack spacing={3}>
                <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="500" color={colors.text.primary}>
                  Split into installments
                </Text>
              </HStack>
              <Switch
                isChecked={enabled}
                onChange={(e) => onEnabledChange(e.target.checked)}
                colorScheme="blue"
                size="lg"
              />
            </HStack>
          </Box>
        ) : (
          <Box p={{ base: 3, sm: 3.5 }} borderRadius="2xl" bg={colors.inputBg} border="2px solid" borderColor={colors.border}>
            <HStack spacing={3}>
              <VStack align="flex-start" spacing={0}>
                <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="700" color={colors.text.primary}>
                  Split into installments
                </Text>
                <Text fontSize="xs" color={colors.text.secondary}>
                  Choose how many monthly payments to create.
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}
      </Box>

      {/* Installment Details */}
      {enabled && (
        <Box>
          <Text fontWeight="500" mb={2} color={colors.text.secondary} fontSize={{ base: 'xs', sm: 'sm' }}>
            Quick Select
          </Text>
          <Wrap spacing={responsiveStyles.categoryList.spacing} mb={3}>
            {quickInstallmentOptions.map((option) => (
              <WrapItem key={option.value}>
                <Button
                  variant={installments === option.value ? 'solid' : 'outline'}
                  colorScheme={installments === option.value ? 'blue' : 'gray'}
                  onClick={() => onInstallmentsChange(option.value)}
                  {...responsiveStyles.buttons.category}
                  h={responsiveStyles.buttons.category.height}
                  fontWeight="bold"
                  borderWidth="2px"
                  borderRadius="xl"
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'md',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s"
                >
                  {option.label}
                </Button>
              </WrapItem>
            ))}
          </Wrap>

          <VStack spacing={3} align="stretch" p={{ base: 3, sm: 3.5 }} bg={colors.bgSecondary} borderRadius="2xl" border="2px" borderColor={colors.border}>
            <HStack justify="space-between" align="center">
              <HStack spacing={2}>
                <Icon as={Calculator} boxSize={4} color={colors.accent} />
                <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="500" color={colors.text.primary}>
                  Number of installments:
                </Text>
              </HStack>
              <NumberInput
                value={installments}
                onChange={(_, val) => onInstallmentsChange(val || 1)}
                min={2}
                max={60}
                w={{ base: '108px', sm: '120px' }}
              >
                <NumberInputField
                  textAlign="center"
                  h={{ base: 9, sm: 10 }}
                  fontSize={{ base: 'sm', sm: 'md' }}
                  fontWeight="bold"
                  borderColor={colors.border}
                  _focus={{
                    borderColor: colors.accent,
                    boxShadow: `0 0 0 1px ${colors.accent}`,
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>

            <HStack justify="space-between" align="center">
              <HStack spacing={2}>
                <Icon as={Calendar} boxSize={4} color={colors.accent} />
                <Text fontSize={{ base: 'sm', sm: 'md' }} color={colors.text.secondary}>
                  First installment date:
                </Text>
              </HStack>
              <Input
                type="date"
                value={firstInstallmentDate}
                onChange={(e) => onFirstInstallmentDateChange(e.target.value)}
                w={{ base: '132px', sm: '150px' }}
                h={{ base: 9, sm: 10 }}
                fontSize={{ base: 'sm', sm: 'md' }}
                borderColor={colors.border}
                _focus={{
                  borderColor: colors.accent,
                  boxShadow: `0 0 0 1px ${colors.accent}`,
                }}
                bg={colors.inputBg}
              />
            </HStack>

            <HStack justify="space-between" align="center">
              <Text fontSize={{ base: 'sm', sm: 'md' }} color={colors.text.secondary}>
                Amount per installment:
              </Text>
              <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="bold" color={colors.accent}>
                £{installmentAmount.toFixed(2)}
              </Text>
            </HStack>

            <HStack justify="space-between" align="center">
              <Text fontSize={{ base: 'sm', sm: 'md' }} color={colors.text.secondary}>
                Total amount:
              </Text>
              <Text fontSize={{ base: 'sm', sm: 'md' }} fontWeight="bold" color={colors.text.primary}>
                £{totalAmount.toFixed(2)}
              </Text>
            </HStack>
          </VStack>
        </Box>
      )}
    </VStack>
  )
}


