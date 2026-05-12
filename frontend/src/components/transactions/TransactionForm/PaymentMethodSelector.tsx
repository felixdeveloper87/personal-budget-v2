import { Box, FormControl, FormLabel, HStack, Select, Text, useColorModeValue } from '@chakra-ui/react'
import { CreditCard, Wallet } from '../../ui/icons'
import { PaymentMethod } from '../../../types'

interface PaymentMethodSelectorProps {
  value: number | null
  onChange: (value: number | null) => void
  paymentMethods: PaymentMethod[]
  loading?: boolean
}

export default function PaymentMethodSelector({
  value,
  onChange,
  paymentMethods,
  loading = false,
}: PaymentMethodSelectorProps) {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const activeMethods = paymentMethods.filter((method) => method.active)
  const selected = activeMethods.find((method) => method.id === value)

  return (
    <FormControl>
      <FormLabel fontSize="sm" fontWeight={700}>
        Payment method
      </FormLabel>
      <Box
        border="1px solid"
        borderColor={borderColor}
        borderRadius="lg"
        p={3}
      >
        <HStack spacing={3}>
          {selected?.type === 'CREDIT_CARD' ? <CreditCard size={20} /> : <Wallet size={20} />}
          <Select
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
            placeholder={loading ? 'Loading payment methods...' : 'No payment method'}
            isDisabled={loading}
            size="sm"
            variant="unstyled"
          >
            {activeMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}{method.issuer ? ` - ${method.issuer}` : ''}
              </option>
            ))}
          </Select>
        </HStack>
        {selected?.type === 'CREDIT_CARD' && (
          <Text mt={2} fontSize="xs" color={captionColor}>
            Closes on day {selected.statementClosingDay}; paid on day {selected.paymentDay}.
          </Text>
        )}
      </Box>
    </FormControl>
  )
}
