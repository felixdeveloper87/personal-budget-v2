import React from 'react'
import {
  Box,
  HStack,
  VStack,
  Switch,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Icon,
  Collapse,
} from '@chakra-ui/react'
import { FiCreditCard } from 'react-icons/fi'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface InstallmentSelectorProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  installments: number
  onInstallmentsChange: (value: number) => void
  amount: number
}

/**
 * 💳 InstallmentSelector
 * Allows user to enable installment payments and select number of installments
 */
export default function InstallmentSelector({
  enabled,
  onEnabledChange,
  installments,
  onInstallmentsChange,
  amount,
}: InstallmentSelectorProps) {
  const colors = useThemeColors()

  const installmentValue = amount > 0 && installments > 0 ? amount / installments : 0

  return (
    <VStack align="stretch" spacing={4}>
      {/* Toggle switch for installments */}
      <FormControl>
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Icon as={FiCreditCard} color={colors.accent} fontSize="xl" />
            <FormLabel htmlFor="installment-toggle" mb={0} fontWeight="600">
              Parcelar despesa
            </FormLabel>
          </HStack>
          <Switch
            id="installment-toggle"
            colorScheme="purple"
            isChecked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
          />
        </HStack>
      </FormControl>

      {/* Installment options (collapsed when disabled) */}
      <Collapse in={enabled} animateOpacity>
        <VStack
          align="stretch"
          spacing={3}
          p={4}
          bg={colors.cardBg}
          borderRadius="lg"
          border="1px"
          borderColor={colors.border}
        >
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="600" color={colors.text.secondary}>
              Número de parcelas
            </FormLabel>
            <NumberInput
              value={installments}
              onChange={(_, value) => onInstallmentsChange(value)}
              min={2}
              max={48}
              step={1}
            >
              <NumberInputField
                placeholder="Ex: 3"
                bg={colors.inputBg}
                borderColor={colors.border}
                _hover={{ borderColor: colors.accent }}
                _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
              />
              <NumberInputStepper>
                <NumberIncrementStepper borderColor={colors.border} />
                <NumberDecrementStepper borderColor={colors.border} />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          {/* Display installment breakdown */}
          {installments > 1 && amount > 0 && (
            <Box
              p={3}
              bg={colors.cardBg}
              borderRadius="md"
              border="1px"
              borderColor={colors.border}
            >
              <HStack justify="space-between">
                <Text fontSize="sm" color={colors.text.secondary}>
                  {installments}x de
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={colors.accent}>
                  R$ {installmentValue.toFixed(2)}
                </Text>
              </HStack>
              <Text fontSize="xs" color={colors.text.secondary} mt={1}>
                Total: R$ {amount.toFixed(2)}
              </Text>
            </Box>
          )}
        </VStack>
      </Collapse>
    </VStack>
  )
}

