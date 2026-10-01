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
    <Box
      as="button"
      type="button"
      onClick={onSelect}
      position="relative"
      minH={{ base: '168px', md: '182px' }}
      p={{ base: 3.5, md: 4 }}
      textAlign="left"
      bg="linear-gradient(145deg, var(--pb-surface) 0%, var(--pb-tint-green) 100%)"
      border="1px solid var(--pb-hair)"
      borderRadius="20px"
      overflow="hidden"
      transition=".18s ease"
      boxShadow="0 1px 2px rgba(15,23,42,.04), 0 8px 22px rgba(15,23,42,.05)"
      _before={{ content: '""', position: 'absolute', w: '120px', h: '120px', borderRadius: 'full', bg: 'rgba(255,255,255,.36)', top: '-58px', right: '-44px' }}
      _after={{ content: '""', position: 'absolute', w: '52px', h: '34px', borderRadius: '8px 8px 0 0', bg: 'rgba(48,94,101,.06)', bottom: 0, right: 3 }}
      _hover={{ transform: 'translateY(-3px)', borderColor: 'var(--pb-forest-2)', boxShadow: '0 12px 30px rgba(28,67,61,.1)' }}
      _focusVisible={{ outline: 'none', boxShadow: '0 0 0 3px var(--pb-sidebar-active-bg)' }}
    >
      <Flex position="relative" zIndex={1} align="flex-start" justify="space-between">
        <AccountAvatar account={account} size={42} />
        <Flex align="center" gap={2}>
          <Text fontFamily="var(--pb-mono)" fontSize="9px" fontWeight={700} color="var(--pb-ink-faint)">{account.currency}</Text>
          <Icon as={ChevronRight} boxSize="16px" color="var(--pb-ink-faint)" />
        </Flex>
      </Flex>
      <Box position="relative" zIndex={1} mt={3}>
        <Text fontSize="1.08rem" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{account.name}</Text>
        <Text mt={1} fontFamily="var(--pb-mono)" fontSize="9px" color="var(--pb-ink-faint)" noOfLines={1}>{account.institution || t(`accounts.type.${account.type}`, undefined, ACCOUNT_LABELS[account.type])}</Text>
      </Box>
      <Box position="relative" zIndex={1} mt={4}>
        <Text className="num" fontSize={{ base: '1.28rem', md: '1.45rem' }} fontWeight={600} color={!hideBalances && account.currentBalance < 0 ? 'var(--pb-coral)' : 'var(--pb-ink)'} noOfLines={1} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {hideBalances ? '••••••' : formatCurrency(account.currentBalance)}
        </Text>
        <Text mt={1} fontFamily="var(--pb-mono)" fontSize="8px" textTransform="uppercase" letterSpacing=".1em" color="var(--pb-ink-faint)">{t('accounts.balance')}</Text>
      </Box>
    </Box>
  )
}
