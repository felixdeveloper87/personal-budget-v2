import { useEffect, useState } from 'react'
import { Box, Flex, Grid, HStack, Icon, IconButton, Spinner, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { getAccountDetails, getAccountActivityPage } from '../../../api'
import type { AccountActivityPage, AccountDetails, FinancialAccount } from '../../../types'
import { ToastService } from '../../../services/toast'
import { ChevronLeft, ChevronRight, Repeat } from '../../../components/ui/icons'
import { ACCOUNT_LABELS } from '../data/accountMeta'
import { useI18n } from '../../../i18n'
import AccountAvatar from '../../../components/accounts/AccountAvatar'
import RecentActivity from './RecentActivity'

const ACTIVITY_PAGE_SIZE = 10

const MotionBox = motion(Box)

interface AccountDetailProps {
  account: FinancialAccount
  hideBalances: boolean
  showBackButton: boolean
  onBack: () => void
  onTransfer: () => void
}

export default function AccountDetail({
  account,
  hideBalances,
  showBackButton,
  onBack,
  onTransfer,
}: AccountDetailProps) {
  const { t, formatCurrency } = useI18n()
  const [details, setDetails] = useState<AccountDetails | null>(null)

  useEffect(() => {
    let active = true
    setDetails(null)
    getAccountDetails(account.id)
      .then((data) => {
        if (active) setDetails(data)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: t('accounts.toast.activityLoadFailed'),
          dedupeKey: `account-details-load-failed:${account.id}`,
        })
      })
    return () => {
      active = false
    }
  }, [account.id, t])

  // Recent activity is paged independently of the balance/overview fetch above
  // — switching accounts (or pages) always jumps back to the most recent page.
  const [activityPage, setActivityPage] = useState(0)
  const [activity, setActivity] = useState<AccountActivityPage | null>(null)
  const [activityLoading, setActivityLoading] = useState(false)

  useEffect(() => {
    setActivityPage(0)
    setActivity(null)
  }, [account.id])

  useEffect(() => {
    let active = true
    setActivityLoading(true)
    getAccountActivityPage(account.id, activityPage, ACTIVITY_PAGE_SIZE)
      .then((data) => {
        if (active) setActivity(data)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: t('accounts.toast.activityLoadFailed'),
          dedupeKey: `account-activity-load-failed:${account.id}`,
        })
      })
      .finally(() => {
        if (active) setActivityLoading(false)
      })
    return () => {
      active = false
    }
  }, [account.id, activityPage, t])

  const shown = details?.account ?? account
  const mask = (value: number) => (hideBalances ? '••••••' : formatCurrency(value))
  const isCurrentAccount = shown.type === 'CURRENT'
  const secondaryLabel = isCurrentAccount
    ? t('accounts.overdraftRemaining')
    : t('accounts.openingBalance')
  const secondaryAmount = isCurrentAccount ? shown.overdraftAvailable : shown.openingBalance
  const secondaryNote = isCurrentAccount
    ? shown.overdraftLimit > 0
      ? t('accounts.overdraftUsed', { percentage: Math.round(shown.overdraftPercentageUsed) })
      : t('accounts.noOverdraft')
    : t('accounts.openingBalanceNote')

  return (
    <Box
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius="22px"
      boxShadow="0 1px 2px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.06)"
      overflow="hidden"
    >
      <Box
        position="relative"
        bg="var(--pb-summary-petrol)"
        color="var(--pb-summary-ink)"
        borderBottom="1px solid var(--pb-summary-line)"
        p={{ base: 3, sm: 3.5 }}
      >
        <Flex align="center" gap="0.65rem">
          {showBackButton && (
            <Box
              as="button"
              type="button"
              aria-label={t('accounts.action.back')}
              onClick={onBack}
              flexShrink={0}
              w="32px"
              h="32px"
              borderRadius="10px"
              display="grid"
              placeItems="center"
              color="var(--pb-summary-ink-soft)"
              bg="var(--pb-summary-panel)"
              border="1px solid var(--pb-summary-line)"
              _hover={{ color: 'var(--pb-summary-ink)', borderColor: 'var(--pb-summary-ink-faint)' }}
            >
              <Icon as={ChevronLeft} boxSize="16px" />
            </Box>
          )}

          <AccountAvatar account={shown} size={40} />
          <Box flex={1} minW={0}>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="8.5px"
              letterSpacing="0.13em"
              textTransform="uppercase"
              color="var(--pb-summary-ink-faint)"
              noOfLines={1}
            >
              {shown.institution || t(`accounts.type.${shown.type}`, undefined, ACCOUNT_LABELS[shown.type])}
            </Text>
            <Text mt={0.5} fontSize="1.05rem" fontWeight={500} lineHeight="1.1" color="var(--pb-summary-ink)" noOfLines={1}>
              {shown.name}
            </Text>
          </Box>

          <Box
            as="button"
            type="button"
            aria-label={t('accounts.transfer.action')}
            onClick={onTransfer}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            gap="0.4rem"
            flexShrink={0}
            minW="32px"
            h="32px"
            px={{ base: 2.5, sm: 3 }}
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
            <Icon as={Repeat} boxSize="13px" />
            <Text as="span" display={{ base: 'none', sm: 'inline' }}>
              {t('accounts.transfer.short')}
            </Text>
          </Box>
        </Flex>

        <Grid
          mt={3.5}
          templateColumns={{ base: '1fr', md: 'minmax(0, 1.15fr) minmax(240px, 0.85fr)' }}
          gap={{ base: 3, md: 4 }}
          alignItems="stretch"
        >
          <Flex
            direction="column"
            justify="center"
            minW={0}
            pr={{ md: 4 }}
            borderRight={{ base: 'none', md: '1px solid var(--pb-summary-line)' }}
          >
            <Text fontFamily="var(--pb-mono)" fontSize="8.5px" letterSpacing="0.13em" textTransform="uppercase" color="var(--pb-summary-ink-faint)">
              {t('accounts.currentBalance')}
            </Text>
            <Text
              className="num"
              mt={1}
              fontFamily="var(--pb-serif)"
              fontSize="clamp(1.65rem, 3.4vw, 2.35rem)"
              fontWeight={500}
              lineHeight={0.98}
              letterSpacing="-0.03em"
              color={!hideBalances && shown.currentBalance < 0 ? 'var(--pb-summary-coral)' : 'var(--pb-summary-ink)'}
              noOfLines={1}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {mask(shown.currentBalance)}
            </Text>
            <Text mt={1.5} fontFamily="var(--pb-mono)" fontSize="8px" letterSpacing="0.06em" textTransform="uppercase" color="var(--pb-summary-ink-faint)">
              GBP · {t('accounts.activeAccount')}
            </Text>
          </Flex>

          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={2}>
            <DetailMetric
              label={secondaryLabel}
              value={mask(secondaryAmount)}
              note={secondaryNote}
              danger={!hideBalances && isCurrentAccount && secondaryAmount <= 0 && shown.overdraftLimit > 0}
            />
            <DetailMetric
              label={t('accounts.accountType')}
              value={t(`accounts.type.${shown.type}`, undefined, ACCOUNT_LABELS[shown.type])}
              note={shown.institution || t('accounts.personalAccount')}
              compact
            />
          </Grid>
        </Grid>
      </Box>

      <MotionBox
        key={account.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        p="clamp(1rem, 2.5vw, 1.35rem)"
      >
        <Flex align="flex-end" justify="space-between" gap={3} mb={3}>
          <Box>
            <Text as="h3" fontSize="1.08rem" fontWeight={500} color="var(--pb-ink)">
              {t('accounts.activity.title')}
            </Text>
            <Text mt={0.5} fontFamily="var(--pb-serif)" fontSize="xs" color="var(--pb-ink-soft)">
              {t('accounts.activity.description')}
            </Text>
          </Box>

          <HStack spacing="0.35rem" flexShrink={0}>
            <IconButton
              aria-label={t('accounts.activity.newer')}
              title={t('accounts.activity.newer')}
              icon={<Icon as={ChevronLeft} boxSize="15px" />}
              size="xs"
              variant="ghost"
              borderRadius="8px"
              color="var(--pb-ink-soft)"
              bg="var(--pb-surface-2)"
              border="1px solid var(--pb-hair)"
              isDisabled={activityPage === 0 || activityLoading}
              onClick={() => setActivityPage((page) => Math.max(0, page - 1))}
              _hover={{ color: 'var(--pb-sidebar-accent)', borderColor: 'var(--pb-sidebar-active-border)' }}
            />
            <Text
              minW="54px"
              textAlign="center"
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              color="var(--pb-ink-faint)"
            >
              {t('accounts.activity.page', { page: activityPage + 1 })}
            </Text>
            <IconButton
              aria-label={t('accounts.activity.older')}
              title={t('accounts.activity.older')}
              icon={<Icon as={ChevronRight} boxSize="15px" />}
              size="xs"
              variant="ghost"
              borderRadius="8px"
              color="var(--pb-ink-soft)"
              bg="var(--pb-surface-2)"
              border="1px solid var(--pb-hair)"
              isDisabled={!activity?.hasMore || activityLoading}
              onClick={() => setActivityPage((page) => page + 1)}
              _hover={{ color: 'var(--pb-sidebar-accent)', borderColor: 'var(--pb-sidebar-active-border)' }}
            />
          </HStack>
        </Flex>

        <Box position="relative" minH="110px">
          {activityLoading && !activity ? (
            <Flex minH="110px" align="center" justify="center">
              <Spinner size="sm" color="var(--pb-sidebar-accent)" />
            </Flex>
          ) : (
            <Box opacity={activityLoading ? 0.45 : 1} transition="opacity 0.15s ease">
              <RecentActivity
                items={activity?.items ?? []}
                hideBalances={hideBalances}
              />
            </Box>
          )}

          {activityLoading && activity && (
            <Flex position="absolute" inset={0} align="center" justify="center" pointerEvents="none">
              <Spinner size="sm" color="var(--pb-sidebar-accent)" />
            </Flex>
          )}
        </Box>
      </MotionBox>
    </Box>
  )
}

function DetailMetric({
  label,
  value,
  note,
  danger,
  compact,
}: {
  label: string
  value: string
  note: string
  danger?: boolean
  compact?: boolean
}) {
  return (
    <Flex
      direction="column"
      justify="space-between"
      minW={0}
      minH="86px"
      bg="var(--pb-summary-panel)"
      border="1px solid var(--pb-summary-line)"
      borderRadius="14px"
      p={2.5}
      overflow="hidden"
    >
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="9px"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="var(--pb-summary-ink-faint)"
        lineHeight="1.3"
        noOfLines={1}
      >
        {label}
      </Text>
      <Text
        className="num"
        mt={1.5}
        fontSize={compact ? '0.88rem' : '1rem'}
        fontWeight={500}
        lineHeight="1.05"
        color={danger ? 'var(--pb-summary-coral)' : 'var(--pb-summary-ink)'}
        noOfLines={1}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
      <Text mt={1} fontFamily="var(--pb-serif)" fontSize="9px" color="var(--pb-summary-ink-faint)" noOfLines={2}>
        {note}
      </Text>
    </Flex>
  )
}
