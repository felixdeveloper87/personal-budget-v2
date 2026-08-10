import { Box, Button, Flex, Grid, Icon, SimpleGrid, Text } from '@chakra-ui/react'
import type { FinancialAccount } from '../../../types'
import { Eye, EyeOff, Plus } from '../../../components/ui/icons'
import { money } from '../../../components/accounts/accountMeta'
import ShareRibbon from './ShareRibbon'

interface TotalHeroProps {
  accounts: FinancialAccount[]
  totalBalance: number
  hideBalances: boolean
  onToggleHide: () => void
  onAddAccount: () => void
}

export default function TotalHero({ accounts, totalBalance, hideBalances, onToggleHide, onAddAccount }: TotalHeroProps) {
  const currentAccounts = accounts.filter((account) => account.type === 'CURRENT')
  const savingsAccounts = accounts.filter((account) => account.type === 'SAVINGS')
  const currentBalance = currentAccounts.reduce((sum, account) => sum + account.currentBalance, 0)
  const savingsBalance = savingsAccounts.reduce((sum, account) => sum + account.currentBalance, 0)
  const display = (amount: number) => hideBalances ? '••••••' : money(amount)

  return (
    <Box
      position="relative"
      overflow="hidden"
      bg="var(--pb-summary-petrol)"
      border="1px solid var(--pb-summary-line)"
      borderRadius="22px"
      boxShadow="0 1px 2px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.06)"
      p={{ base: 3.5, sm: 'clamp(1.1rem, 2.4vw, 1.45rem)' }}
    >
      <Box position="absolute" inset={0} borderRadius="inherit" pointerEvents="none" boxShadow="inset 0 1px 0 rgba(255,255,255,.16)" />
      <Flex
        position="relative"
        zIndex={2}
        direction={{ base: 'column', sm: 'row' }}
        align={{ base: 'flex-start', sm: 'center' }}
        justify="space-between"
        gap="1rem"
        pb={{ base: 3, sm: 3.5 }}
        borderBottom="1px solid var(--pb-summary-line)"
      >
        <Box minW={0}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10px"
            fontWeight={600}
            letterSpacing="0.18em"
            textTransform="uppercase"
            color="var(--pb-summary-ink-faint)"
          >
            Accounts overview
          </Text>
          <Text mt={1} fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-summary-ink-soft)">
            Your balances at a glance
          </Text>
        </Box>
        <Flex gap={2} w={{ base: 'full', sm: 'auto' }} flexShrink={0}>
          <Button
            onClick={onAddAccount}
            leftIcon={<Icon as={Plus} boxSize={4} />}
            flex={{ base: 1, sm: 'initial' }}
            h="36px"
            px={3}
            borderRadius="10px"
            color="var(--pb-summary-ink)"
            bg="var(--pb-summary-control)"
            border="1px solid var(--pb-summary-line)"
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            fontWeight={600}
            letterSpacing="0.06em"
            textTransform="uppercase"
            _hover={{ borderColor: 'var(--pb-summary-ink-faint)', transform: 'translateY(-1px)' }}
          >
            Add account
          </Button>
          <Button
            aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
            aria-pressed={hideBalances}
            title={hideBalances ? 'Show balances' : 'Hide balances'}
            onClick={onToggleHide}
            leftIcon={<Icon as={hideBalances ? Eye : EyeOff} boxSize={4} />}
            flex={{ base: 1, sm: 'initial' }}
            h="36px"
            px={3}
            borderRadius="10px"
            color="var(--pb-summary-ink-soft)"
            bg="var(--pb-summary-panel)"
            border="1px solid var(--pb-summary-line)"
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            fontWeight={600}
            letterSpacing="0.06em"
            textTransform="uppercase"
            _hover={{ color: 'var(--pb-summary-ink)', borderColor: 'var(--pb-summary-ink-faint)' }}
          >
            {hideBalances ? 'Show' : 'Hide'}
          </Button>
        </Flex>
      </Flex>

      <Grid
        position="relative"
        zIndex={2}
        templateColumns={{ base: '1fr', md: 'minmax(0, 1.05fr) minmax(300px, 0.95fr)' }}
        gap={{ base: 4, md: 5 }}
        alignItems="stretch"
        mt={{ base: 4, sm: 4.5 }}
      >
        <Flex
          minW={0}
          direction="column"
          justify="center"
          pr={{ md: 6 }}
          borderRight={{ base: 'none', md: '1px solid var(--pb-summary-line)' }}
        >
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            letterSpacing="0.13em"
            textTransform="uppercase"
            color="var(--pb-summary-ink-faint)"
          >
            Total balance
          </Text>
          <Text
            className="num"
            mt={{ base: 1.5, sm: 2 }}
            fontFamily="var(--pb-serif)"
            fontSize="clamp(1.9rem, 4.5vw, 3.1rem)"
            fontWeight={500}
            lineHeight={0.96}
            letterSpacing="-0.035em"
            color={!hideBalances && totalBalance < 0 ? 'var(--pb-summary-coral)' : 'var(--pb-summary-ink)'}
            noOfLines={1}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {display(totalBalance)}
          </Text>
          <Text mt={2} fontFamily="var(--pb-serif)" fontSize="xs" color="var(--pb-summary-ink-soft)">
            Combined position across {accounts.length} active account{accounts.length !== 1 ? 's' : ''}.
          </Text>
        </Flex>

        <SimpleGrid columns={2} spacing={{ base: 2, sm: 3 }}>
          <BalanceBlock
            label="Current accounts"
            amount={currentBalance}
            count={currentAccounts.length}
            hidden={hideBalances}
          />
          <BalanceBlock
            label="Savings"
            amount={savingsBalance}
            count={savingsAccounts.length}
            hidden={hideBalances}
          />
        </SimpleGrid>
      </Grid>

      {accounts.length > 0 && <ShareRibbon accounts={accounts} hidden={hideBalances} />}
    </Box>
  )
}

function BalanceBlock({
  label,
  amount,
  count,
  hidden,
}: {
  label: string
  amount: number
  count: number
  hidden: boolean
}) {
  return (
    <Flex
      direction="column"
      justify="space-between"
      minW={0}
      minH={{ base: '92px', sm: '106px' }}
      p={{ base: 2.5, sm: 3 }}
      borderRadius="14px"
      bg="var(--pb-summary-panel)"
      border="1px solid var(--pb-summary-line)"
    >
      <Text
        fontFamily="var(--pb-mono)"
        fontSize={{ base: '8px', sm: '9px' }}
        letterSpacing="0.14em"
        textTransform="uppercase"
        color="var(--pb-summary-ink-faint)"
        noOfLines={1}
      >
        {label}
      </Text>
      <Text
        className="num"
        fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
        fontWeight={500}
        lineHeight="1.1"
        mt={{ base: 1, sm: 2 }}
        noOfLines={1}
        color={!hidden && amount < 0 ? 'var(--pb-summary-coral)' : 'var(--pb-summary-ink)'}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {hidden ? '••••••' : money(amount)}
      </Text>
      <Text mt={1.5} fontFamily="var(--pb-mono)" fontSize="8px" color="var(--pb-summary-ink-faint)">
        {count} account{count !== 1 ? 's' : ''}
      </Text>
    </Flex>
  )
}
