import { useEffect, useState } from 'react'
import { Box, Flex, Grid, HStack, Icon, Spinner, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { getAccountDetails } from '../../../api'
import type { AccountDetails, FinancialAccount } from '../../../types'
import { ToastService } from '../../../services/toast'
import { ChevronLeft, ChevronRight, Repeat } from '../../../components/ui/icons'
import { ACCOUNT_LABELS, money } from '../../../components/accounts/accountMeta'
import AccountAvatar from './AccountAvatar'
import RecentActivity from './RecentActivity'

const MotionBox = motion(Box)

interface AccountDetailProps {
  account: FinancialAccount
  hideBalances: boolean
  showBackButton: boolean
  onBack: () => void
  onTransfer: () => void
  onViewAll: () => void
}

export default function AccountDetail({
  account,
  hideBalances,
  showBackButton,
  onBack,
  onTransfer,
  onViewAll,
}: AccountDetailProps) {
  const [details, setDetails] = useState<AccountDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setDetails(null)
    getAccountDetails(account.id)
      .then((data) => {
        if (active) setDetails(data)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: 'Could not load account activity',
          dedupeKey: `account-details-load-failed:${account.id}`,
        })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [account.id])

  const shown = details?.account ?? account
  const mask = (value: number) => (hideBalances ? '••••••' : money(value, shown.currency))

  return (
    <Box
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius="22px"
      boxShadow="0 1px 2px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.06)"
      overflow="hidden"
    >
      {/* Header band */}
      <Flex
        align="center"
        gap="0.8rem"
        px="1.15rem"
        py="1.05rem"
        borderBottom="1px solid var(--pb-hair)"
        bg="linear-gradient(180deg, var(--pb-surface), var(--pb-surface-2))"
      >
        {showBackButton && (
          <Box
            as="button"
            type="button"
            aria-label="Back to accounts"
            onClick={onBack}
            flexShrink={0}
            w="38px"
            h="38px"
            borderRadius="10px"
            display="grid"
            placeItems="center"
            color="var(--pb-ink-soft)"
            bg="var(--pb-surface)"
            border="1px solid var(--pb-hair)"
            _hover={{ color: 'var(--pb-forest-2)', borderColor: 'var(--pb-hair-2)' }}
          >
            <Icon as={ChevronLeft} boxSize="19px" />
          </Box>
        )}
        <AccountAvatar account={shown} size={46} />
        <Box flex={1} minW={0}>
          <Text fontSize="1.25rem" fontWeight={500} lineHeight="1.15" color="var(--pb-ink)" noOfLines={1}>
            {shown.name}
          </Text>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10.5px"
            letterSpacing="0.05em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
            mt="0.18rem"
            noOfLines={1}
          >
            {shown.institution || ACCOUNT_LABELS[shown.type]}
          </Text>
        </Box>
        <Box
          as="button"
          type="button"
          onClick={onTransfer}
          display="inline-flex"
          alignItems="center"
          gap="0.4rem"
          flexShrink={0}
          px="0.8rem"
          py="0.45rem"
          fontSize="0.85rem"
          borderRadius="14px"
          color="var(--pb-ink-soft)"
          bg="var(--pb-surface)"
          border="1px solid var(--pb-hair)"
          _hover={{ color: 'var(--pb-ink)', borderColor: 'var(--pb-hair-2)' }}
        >
          <Icon as={Repeat} boxSize="1.05em" />
          Transfer
        </Box>
      </Flex>

      {/* Body */}
      {loading || !details ? (
        <Flex minH="280px" align="center" justify="center">
          <Spinner color="var(--pb-forest-2)" />
        </Flex>
      ) : (
        <MotionBox
          key={account.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          p="clamp(1rem, 2.5vw, 1.4rem)"
        >
          <Grid templateColumns="repeat(3, 1fr)" gap="0.7rem" mb="1.4rem">
            <StatCard label="Current balance" value={mask(details.account.currentBalance)} />
            <StatCard
              label={details.account.type === 'CURRENT' ? 'Overdraft available' : 'Opening balance'}
              value={mask(
                details.account.type === 'CURRENT'
                  ? details.account.overdraftAvailable
                  : details.account.openingBalance,
              )}
            />
            <StatCard label="Account type" value={ACCOUNT_LABELS[details.account.type]} small />
          </Grid>

          <HStack spacing="0.6rem" mb="0.6rem">
            <Text as="h3" fontSize="1.08rem" fontWeight={500} color="var(--pb-ink)">
              Recent activity
            </Text>
            <Text
              className="num"
              fontFamily="var(--pb-mono)"
              fontSize="10.5px"
              fontWeight={500}
              color="var(--pb-forest-2)"
              bg="var(--pb-tint-green)"
              border="1px solid var(--pb-hair)"
              borderRadius="999px"
              px="0.5rem"
              py="0.15rem"
            >
              {details.recentActivity.length}
            </Text>
          </HStack>

          <RecentActivity
            items={details.recentActivity}
            currency={details.account.currency}
            hideBalances={hideBalances}
          />

          <Box
            as="button"
            type="button"
            onClick={onViewAll}
            display="inline-flex"
            alignItems="center"
            gap="0.4rem"
            mt="1rem"
            fontFamily="var(--pb-mono)"
            fontSize="11px"
            letterSpacing="0.06em"
            textTransform="uppercase"
            color="var(--pb-forest-2)"
            transition="gap 0.15s"
            _hover={{ gap: '0.6rem' }}
          >
            View all activity in Transactions
            <Icon as={ChevronRight} boxSize="15px" />
          </Box>
        </MotionBox>
      )}
    </Box>
  )
}

function StatCard({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <Box
      position="relative"
      bg="var(--pb-surface-2)"
      border="1px solid var(--pb-hair)"
      borderRadius="14px"
      px="0.9rem"
      py="0.85rem"
      overflow="hidden"
    >
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="9px"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="var(--pb-ink-faint)"
        mb="0.35rem"
        lineHeight="1.3"
        noOfLines={1}
      >
        {label}
      </Text>
      <Text
        className="num"
        fontSize={small ? '1.05rem' : '1.3rem'}
        fontWeight={500}
        lineHeight="1"
        color="var(--pb-ink)"
        noOfLines={1}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
    </Box>
  )
}
