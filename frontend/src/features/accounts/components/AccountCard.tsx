import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import type { FinancialAccount } from '../../../types'
import { ChevronRight } from '../../../components/ui/icons'
import { ACCOUNT_LABELS } from '../data/accountMeta'
import { useI18n } from '../../../i18n'
import AccountAvatar from '../../../components/accounts/AccountAvatar'

interface AccountCardProps {
  account: FinancialAccount
  hideBalances: boolean
  onSelect: () => void
}

export default function AccountCard({ account, hideBalances, onSelect }: AccountCardProps) {
  const { t, formatCurrency } = useI18n()
  return (
    <Flex
      as="button"
      type="button"
      onClick={onSelect}
      align="center"
      gap={3}
      w="full"
      minH="76px"
      py={3}
      textAlign="left"
      bg="transparent"
      borderBottom="1px solid var(--pb-hair)"
      transition="background-color .15s ease"
      _last={{ borderBottom: 0 }}
      _hover={{ bg: 'rgba(130,10,209,.025)' }}
      _focusVisible={{ outline: 'none', boxShadow: 'inset 3px 0 0 var(--nu-brand, #820ad1)' }}
    >
      <AccountAvatar account={account} size={42} />

      <Box minW={0} flex={1}>
        <Text fontSize="15px" fontWeight={650} color="var(--pb-ink)" noOfLines={1}>{account.name}</Text>
        <Text mt="2px" fontSize="11px" color="var(--pb-ink-soft)" noOfLines={1}>
          {account.institution || t(`accounts.type.${account.type}`, undefined, ACCOUNT_LABELS[account.type])}
          {' · '}{account.currency}
        </Text>
      </Box>

      <Box flexShrink={0} textAlign="right">
        <Text fontSize="15px" fontWeight={650} color={!hideBalances && account.currentBalance < 0 ? 'var(--pb-coral)' : 'var(--pb-ink)'} noOfLines={1} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {hideBalances ? '••••••' : formatCurrency(account.currentBalance)}
        </Text>
        <Text mt="2px" fontSize="10px" color="var(--pb-ink-faint)">{t('accounts.balance')}</Text>
      </Box>

      <Icon as={ChevronRight} boxSize="16px" color="var(--nu-brand, #820ad1)" flexShrink={0} />
    </Flex>
  )
}
