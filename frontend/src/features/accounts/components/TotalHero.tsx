import { Box, Flex, Icon, IconButton, SimpleGrid, Text } from '@chakra-ui/react'
import type { FinancialAccount } from '../../../types'
import { Eye, EyeOff } from '../../../components/ui/icons'
import { money } from '../../../components/accounts/accountMeta'
import ShareRibbon from './ShareRibbon'

interface TotalHeroProps {
  accounts: FinancialAccount[]
  totalBalance: number
  hideBalances: boolean
  onToggleHide: () => void
}

export default function TotalHero({ accounts, totalBalance, hideBalances, onToggleHide }: TotalHeroProps) {
  const currentBalance = accounts
    .filter((account) => account.type === 'CURRENT')
    .reduce((sum, account) => sum + account.currentBalance, 0)
  const savingsBalance = accounts
    .filter((account) => account.type === 'SAVINGS')
    .reduce((sum, account) => sum + account.currentBalance, 0)
  const display = (amount: number) => hideBalances ? '••••••' : money(amount)

  return (
    <Box
      position="relative"
      overflow="hidden"
      bg="linear-gradient(168deg, var(--pb-surface), var(--pb-surface-2))"
      border="1px solid var(--pb-hair)"
      borderRadius="22px"
      boxShadow="0 1px 2px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.06)"
      p={{ base: 3.5, sm: 'clamp(1.2rem, 3vw, 1.7rem)' }}
    >
      <Box position="absolute" inset={0} borderRadius="inherit" pointerEvents="none" boxShadow="inset 0 1px 0 rgba(255,255,255,.6)" />
      <Box
        as="svg"
        viewBox="0 0 200 200"
        aria-hidden
        position="absolute"
        right="-40px"
        top="50%"
        transform="translateY(-50%)"
        w="230px"
        h="230px"
        opacity={0.07}
        pointerEvents="none"
      >
        <g fill="none" stroke="var(--pb-forest-2)" strokeWidth={0.6}>
          <circle cx="100" cy="100" r="92" />
          <circle cx="100" cy="100" r="74" />
          <circle cx="100" cy="100" r="56" />
        </g>
      </Box>

      <Flex position="relative" zIndex={2} align="flex-start" justify="space-between" gap="1rem">
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="10.5px"
          letterSpacing="0.2em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
        >
          Balance overview
        </Text>
        <IconButton
          aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
          title={hideBalances ? 'Show balances' : 'Hide balances'}
          icon={<Icon as={hideBalances ? EyeOff : Eye} boxSize={5} />}
          onClick={onToggleHide}
          flexShrink={0}
          variant="ghost"
          borderRadius="11px"
          color="var(--pb-ink-soft)"
          bg="var(--pb-surface)"
          border="1px solid var(--pb-hair)"
          _hover={{ color: 'var(--pb-forest-2)', borderColor: 'var(--pb-hair-2)' }}
        />
      </Flex>

      <SimpleGrid position="relative" zIndex={2} columns={2} spacing={{ base: 2, sm: 3 }} mt={4}>
        <BalanceBlock label="Current accounts" amount={currentBalance} hidden={hideBalances} />
        <BalanceBlock label="Savings" amount={savingsBalance} hidden={hideBalances} />
      </SimpleGrid>

      <Flex position="relative" zIndex={2} justify="space-between" align="baseline" mt={{ base: 3, sm: 4 }} pt={{ base: 2.5, sm: 3 }} borderTop="1px solid var(--pb-hair)">
        <Text fontSize="sm" color="var(--pb-ink-soft)">Total across all active accounts</Text>
        <Text
          className="num"
          fontSize="md"
          fontWeight={500}
          color={!hideBalances && totalBalance < 0 ? 'var(--pb-coral)' : 'var(--pb-ink-soft)'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {display(totalBalance)}
        </Text>
      </Flex>

      {accounts.length > 0 && <ShareRibbon accounts={accounts} />}
    </Box>
  )
}

function BalanceBlock({ label, amount, hidden }: { label: string; amount: number; hidden: boolean }) {
  return (
    <Box p={{ base: 2.5, sm: 4 }} borderRadius="14px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" minW={0}>
      <Text
        fontFamily="var(--pb-mono)"
        fontSize={{ base: '8px', sm: '9px' }}
        letterSpacing="0.14em"
        textTransform="uppercase"
        color="var(--pb-ink-faint)"
        noOfLines={1}
      >
        {label}
      </Text>
      <Text
        className="num"
        fontSize={{ base: 'lg', sm: '2xl', md: '3xl' }}
        fontWeight={500}
        lineHeight="1.1"
        mt={{ base: 1, sm: 2 }}
        noOfLines={1}
        color={!hidden && amount < 0 ? 'var(--pb-coral)' : 'var(--pb-ink)'}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {hidden ? '••••••' : money(amount)}
      </Text>
    </Box>
  )
}
