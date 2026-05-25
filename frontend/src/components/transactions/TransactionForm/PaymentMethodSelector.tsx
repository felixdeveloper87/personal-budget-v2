import { Box, FormControl, FormLabel, HStack, Icon, Select, Text, useColorModeValue } from '@chakra-ui/react'
import { CreditCard, Wallet } from '../../ui/icons'
import { BankLogo, getBankMeta } from '../../ui'
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
  const iconBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const activeMethods = paymentMethods.filter((m) => m.active)
  const selected = activeMethods.find((m) => m.id === value)

  const hasBankLogo = getBankMeta(selected?.issuer) !== null

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
          {/* Logo or fallback icon for selected method */}
          {hasBankLogo ? (
            <BankLogo issuer={selected?.issuer} size={28} borderRadius="7px" />
          ) : (
            <Box
              p={1}
              borderRadius="md"
              bg={iconBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Icon
                as={selected?.type === 'CREDIT_CARD' ? CreditCard : Wallet}
                boxSize={4}
              />
            </Box>
          )}
          <Select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={loading ? 'Loading payment methods...' : 'No payment method'}
            isDisabled={loading}
            size="sm"
            variant="unstyled"
          >
            {activeMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}{method.issuer ? ` · ${method.issuer}` : ''}
              </option>
            ))}
          </Select>
        </HStack>
        {selected?.type === 'CREDIT_CARD' && (
          <Text mt={2} fontSize="xs" color={captionColor}>
            Closes on day {selected.statementClosingDay} · paid on day {selected.paymentDay}
          </Text>
        )}
      </Box>
    </FormControl>
  )
}
