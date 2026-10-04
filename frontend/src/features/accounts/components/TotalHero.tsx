import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import type { FinancialAccount } from '../../../types'
import { useI18n } from '../../../i18n'

interface TotalHeroProps {
  accounts: FinancialAccount[]
  totalBalance: number
  hideBalances: boolean
}

export default function TotalHero({ accounts, totalBalance, hideBalances }: TotalHeroProps) {
  const { t, formatCurrency } = useI18n()
  const currentAccounts = accounts.filter((account) => account.type === 'CURRENT')
  const savingsAccounts = accounts.filter((account) => account.type === 'SAVINGS')
  const currentBalance = currentAccounts.reduce((sum, account) => sum + account.currentBalance, 0)
  const savingsBalance = savingsAccounts.reduce((sum, account) => sum + account.currentBalance, 0)
  const display = (amount: number) => hideBalances ? '••••••' : formatCurrency(amount)

  return (
    <Flex
      mt={{ base: 3, md: 4 }}
      direction={{ base: 'column', md: 'row' }}
      align={{ base: 'stretch', md: 'flex-end' }}
      justify="space-between"
      gap={{ base: 4, md: 10 }}
    >
      <Box minW={0} flex={1}>
        <Text fontSize="sm" color="rgba(255,255,255,.78)">{t('accounts.totalBalance')}</Text>
        <Text
          mt={0.5}
          fontSize={{ base: '2rem', md: '2.5rem' }}
          fontWeight={700}
          letterSpacing="-0.025em"
          lineHeight={1.1}
          color={!hideBalances && totalBalance < 0 ? '#ffc2b8' : 'white'}
          noOfLines={1}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {display(totalBalance)}
        </Text>
        <Text mt={1} fontSize="sm" color="rgba(255,255,255,.72)">
          {t(
            accounts.length === 1
              ? 'accounts.overview.position.one'
              : 'accounts.overview.position.other',
            { count: accounts.length },
          )}
        </Text>
      </Box>

      <SimpleGrid
        columns={2}
        minW={{ md: '360px' }}
        borderTop={{ base: '1px solid rgba(255,255,255,.18)', md: 0 }}
        pt={{ base: 3, md: 0 }}
      >
        <BalanceLine label={t('accounts.group.CURRENT')} amount={currentBalance} count={currentAccounts.length} hidden={hideBalances} />
        <BalanceLine label={t('accounts.group.SAVINGS')} amount={savingsBalance} count={savingsAccounts.length} hidden={hideBalances} bordered />
      </SimpleGrid>
    </Flex>
  )
}

function BalanceLine({
  label,
  amount,
  count,
  hidden,
  bordered = false,
}: {
  label: string
  amount: number
  count: number
  hidden: boolean
  bordered?: boolean
}) {
  const { t, formatCurrency } = useI18n()

  return (
    <Box minW={0} pl={bordered ? 4 : 0} ml={bordered ? 4 : 0} borderLeft={bordered ? '1px solid rgba(255,255,255,.18)' : 0}>
      <Text fontSize="11px" color="rgba(255,255,255,.7)" noOfLines={1}>{label}</Text>
      <Text mt={1} fontSize={{ base: 'md', md: 'lg' }} fontWeight={650} color={!hidden && amount < 0 ? '#ffc2b8' : 'white'} noOfLines={1} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {hidden ? '••••••' : formatCurrency(amount)}
      </Text>
      <Text mt={0.5} fontSize="10px" color="rgba(255,255,255,.62)">
        {t(count === 1 ? 'accounts.count.one' : 'accounts.count.other', { count })}
      </Text>
    </Box>
  )
}
