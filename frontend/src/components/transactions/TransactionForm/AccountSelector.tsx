import {
  Box,
  FormControl,
  FormLabel,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import AccountAvatar from '../../accounts/AccountAvatar'
import PagedGrid, { tileStyle } from './PagedGrid'
import { FinancialAccount } from '../../../types'
import { useI18n } from '../../../i18n'

interface AccountSelectorProps {
  value: number | null
  onChange: (value: number | null) => void
  accounts: FinancialAccount[]
  loading?: boolean
  showBalances?: boolean
}

export default function AccountSelector({
  value,
  onChange,
  accounts,
  loading = false,
  showBalances = true,
}: AccountSelectorProps) {
  const { t, formatCurrency } = useI18n()
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const captionColor = useColorModeValue('gray.500', 'gray.400')

  const activeAccounts = accounts.filter((account) => account.active)
  const selected = activeAccounts.find((account) => account.id === value)

  return (
    <FormControl isRequired minW={0}>
      <FormLabel fontSize="sm" fontWeight={700}>{t('form.balanceAccount')}</FormLabel>

      {loading || activeAccounts.length === 0 ? (
        <Box border="1px solid" borderColor={borderColor} borderRadius="lg" p={3}>
          <Text fontSize="sm" color={captionColor}>
            {loading ? t('form.loadingAccounts') : t('form.createAccountFirst')}
          </Text>
        </Box>
      ) : (
        <PagedGrid
          items={activeAccounts}
          getKey={(account) => String(account.id)}
          initialIndex={activeAccounts.findIndex((account) => account.id === value)}
          label={t('form.balanceAccount')}
          renderItem={(account) => {
            const isSelected = account.id === value
            return (
              <Box
                as="button"
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange(account.id)}
                {...tileStyle(isSelected)}
              >
                <AccountAvatar account={account} size={32} />
                <VStack align="flex-start" spacing={0} minW={0} ml={2}>
                  <Text noOfLines={2} lineHeight="1.15" fontWeight={800} fontSize="sm" wordBreak="break-word">
                    {account.name}
                  </Text>
                  {showBalances && (
                    <Text noOfLines={1} fontSize="xs" fontWeight={600} color={captionColor}>
                      {formatCurrency(account.currentBalance)}
                    </Text>
                  )}
                </VStack>
              </Box>
            )
          }}
        />
      )}

      {showBalances && (
        <Text mt={2} fontSize="xs" color={captionColor}>
          {selected
            ? t('form.currentBalance', {
                institution: selected.institution || selected.type,
                balance: formatCurrency(selected.currentBalance),
              })
            : t('form.accountHelp')}
        </Text>
      )}
    </FormControl>
  )
}
