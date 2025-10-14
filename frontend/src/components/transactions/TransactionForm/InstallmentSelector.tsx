import { Box, Text, Switch, HStack, VStack, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Icon, Button, Wrap, WrapItem, Input } from '@chakra-ui/react'
import { CreditCard, Calendar, Calculator } from 'lucide-react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles } from '../../../utils/ui'

interface InstallmentSelectorProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  installments: number
  onInstallmentsChange: (installments: number) => void
  amount: number
  firstInstallmentDate: string
  onFirstInstallmentDateChange: (date: string) => void
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
      { label: '24x', value: 24, color: 'teal' }
    ]
  }

  const quickInstallmentOptions = getQuickInstallmentOptions()

  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text fontWeight="600" mb={3} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
          Installment Plan
        </Text>
        
        {/* Enable/Disable Switch */}
        <Box
          position="relative"
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
          overflow="hidden"
        >
          {/* Decorative gradient background */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="2px"
            bg="linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981, #f59e0b, #ef4444)"
            opacity={0.6}
          />
          
          <HStack justify="space-between" align="center" p={4}>
            <HStack spacing={4}>
              <Box
                p={2}
                borderRadius="xl"
                bg={colors.accent}
                color="white"
                boxShadow="md"
              >
                <Icon
                  as={CreditCard}
                  boxSize={5}
                />
              </Box>
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
      </Box>

      {/* Installment Details */}
      {enabled && (
        <Box>
          <Text fontWeight="500" mb={2} color={colors.text.secondary} fontSize={{ base: 'xs', sm: 'sm' }}>
            Quick Select
          </Text>
          <Wrap spacing={responsiveStyles.categoryList.spacing} mb={4}>
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

          <VStack spacing={3} align="stretch" p={4} bg={colors.bgSecondary} borderRadius="2xl" border="2px" borderColor={colors.border}>
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
                max={24}
                w="120px"
              >
                <NumberInputField
                  textAlign="center"
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
                w="150px"
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


