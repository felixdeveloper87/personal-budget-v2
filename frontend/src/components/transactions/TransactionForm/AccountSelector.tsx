import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Select,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { CreditCard, Wallet } from '../../ui/icons'
import { BankLogo, getBankMeta } from '../../ui'
import { FinancialAccount } from '../../../types'

interface AccountSelectorProps {
  value: number | null
  onChange: (value: number | null) => void
  accounts: FinancialAccount[]
  loading?: boolean
}

export default function AccountSelector({
  value,
  onChange,
  accounts,
  loading = false,
}: AccountSelectorProps) {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const iconBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const activeAccounts = accounts.filter((account) => account.active)
  const selected = activeAccounts.find((account) => account.id === value)

  return (
    <FormControl isRequired>
      <FormLabel fontSize="sm" fontWeight={700}>Balance account</FormLabel>
      <Box border="1px solid" borderColor={borderColor} borderRadius="lg" p={3}>
        <HStack spacing={3}>
          {getBankMeta(selected?.institution) ? (
            <BankLogo issuer={selected?.institution} size={28} borderRadius="7px" />
          ) : (
            <Box
              p={1}
              borderRadius="md"
              bg={iconBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={selected?.type === 'CREDIT_CARD' ? CreditCard : Wallet} boxSize={4} />
            </Box>
          )}
          <Select
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
            placeholder={
              loading
                ? 'Loading accounts...'
                : activeAccounts.length === 0
                  ? 'Create an account first'
                  : 'Select an account'
            }
            isDisabled={loading || activeAccounts.length === 0}
            size="sm"
            variant="unstyled"
          >
            {activeAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} · {account.currency} {account.currentBalance.toFixed(2)}
              </option>
            ))}
          </Select>
        </HStack>
        <Text mt={2} fontSize="xs" color={captionColor}>
          {selected
            ? `${selected.institution || selected.type} · current balance ${selected.currency} ${selected.currentBalance.toFixed(2)}`
            : 'Where this transaction changes the balance. Choose the payment method separately below.'}
        </Text>
      </Box>
    </FormControl>
  )
}
