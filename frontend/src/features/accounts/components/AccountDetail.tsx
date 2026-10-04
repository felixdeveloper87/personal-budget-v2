import { useEffect, useState } from 'react'
import { Box, Flex, Grid, HStack, Icon, IconButton, Spinner, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { getAccountDetails, getAccountActivityPage } from '../../../api'
import type { AccountActivityPage, AccountDetails, FinancialAccount } from '../../../types'
import { ToastService } from '../../../services/toast'
import { ChevronLeft, ChevronRight, Repeat, Settings } from '../../../components/ui/icons'
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
  onSettings: () => void
}

export default function AccountDetail({
  account,
  hideBalances,
  showBackButton,
  onBack,
  onTransfer,
  onSettings,
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
      border={0}
      borderRadius={0}
      boxShadow="none"
      overflow="hidden"
    >
      <Box
        position="relative"
        bg="transparent"
        color="var(--pb-ink)"
        borderBottom="1px solid var(--pb-hair)"
        pb={{ base: 4, sm: 5 }}
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
              borderRadius="full"
              display="grid"
              placeItems="center"
              color="var(--nu-brand, #820ad1)"
              bg="var(--nu-brand-tint, #f3e8fc)"
              border={0}
              _hover={{ bg: '#ead6fa' }}
            >
              <Icon as={ChevronLeft} boxSize="16px" />
            </Box>
          )}

          <AccountAvatar account={shown} size={40} />
          <Box flex={1} minW={0}>
            <Text
              fontSize="8.5px"
              color="var(--pb-ink-soft)"
              noOfLines={1}
            >
              {shown.institution || t(`accounts.type.${shown.type}`, undefined, ACCOUNT_LABELS[shown.type])}
            </Text>
            <Text mt={0.5} fontSize="1.05rem" fontWeight={650} lineHeight="1.1" color="var(--pb-ink)" noOfLines={1}>
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
            borderRadius="full"
            color="var(--nu-brand, #820ad1)"
            bg="var(--nu-brand-tint, #f3e8fc)"
            border={0}
            fontSize="9px"
            fontWeight={650}
            _hover={{ bg: '#ead6fa' }}
          >
            <Icon as={Repeat} boxSize="13px" />
            <Text as="span" display={{ base: 'none', sm: 'inline' }}>
              {t('accounts.transfer.short')}
            </Text>
          </Box>
          <Box
            as="button"
            type="button"
            aria-label={t('accounts.form.editTitle')}
            onClick={onSettings}
            display="grid"
            placeItems="center"
            flexShrink={0}
            w="32px"
            h="32px"
            borderRadius="full"
            color="var(--nu-brand, #820ad1)"
            bg="var(--nu-brand-tint, #f3e8fc)"
            border={0}
            _hover={{ bg: '#ead6fa' }}
          >
            <Icon as={Settings} boxSize="14px" />
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
            borderRight={{ base: 'none', md: '1px solid var(--pb-hair)' }}
          >
            <Text fontSize="11px" color="var(--pb-ink-soft)">
              {t('accounts.currentBalance')}
            </Text>
            <Text
              className="num"
              mt={1}
              fontSize="clamp(1.65rem, 3.4vw, 2.35rem)"
              fontWeight={700}
              lineHeight={0.98}
              letterSpacing="-0.03em"
              color={!hideBalances && shown.currentBalance < 0 ? 'var(--pb-coral)' : 'var(--pb-ink)'}
              noOfLines={1}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {mask(shown.currentBalance)}
            </Text>
            <Text mt={1.5} fontSize="10px" color="var(--pb-ink-faint)">
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
        pt={{ base: 4, md: 5 }}
      >
        <Flex align="flex-end" justify="space-between" gap={3} mb={3}>
          <Box>
            <Text as="h3" fontSize="1.08rem" fontWeight={650} color="var(--pb-ink)">
              {t('accounts.activity.title')}
            </Text>
            <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)">
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
              borderRadius="full"
              color="var(--nu-brand, #820ad1)"
              bg="var(--nu-brand-tint, #f3e8fc)"
              border={0}
              isDisabled={activityPage === 0 || activityLoading}
              onClick={() => setActivityPage((page) => Math.max(0, page - 1))}
              _hover={{ bg: '#ead6fa' }}
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
              borderRadius="full"
              color="var(--nu-brand, #820ad1)"
              bg="var(--nu-brand-tint, #f3e8fc)"
              border={0}
              isDisabled={!activity?.hasMore || activityLoading}
              onClick={() => setActivityPage((page) => page + 1)}
              _hover={{ bg: '#ead6fa' }}
            />
          </HStack>
        </Flex>

        <Box position="relative" minH="110px">
          {activityLoading && !activity ? (
            <Flex minH="110px" align="center" justify="center">
              <Spinner size="sm" color="var(--nu-brand, #820ad1)" />
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
              <Spinner size="sm" color="var(--nu-brand, #820ad1)" />
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
      bg="transparent"
      border={0}
      borderLeft="1px solid var(--pb-hair)"
      borderRadius={0}
      py={1}
      pl={3}
      overflow="hidden"
    >
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="9px"
        letterSpacing="0.12em"
        textTransform="uppercase"
        color="var(--pb-ink-soft)"
        lineHeight="1.3"
        noOfLines={1}
      >
        {label}
      </Text>
      <Text
        className="num"
        mt={1.5}
        fontSize={compact ? '0.88rem' : '1rem'}
        fontWeight={650}
        lineHeight="1.05"
        color={danger ? 'var(--pb-coral)' : 'var(--pb-ink)'}
        noOfLines={1}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
      <Text mt={1} fontSize="9px" color="var(--pb-ink-faint)" noOfLines={2}>
        {note}
      </Text>
    </Flex>
  )
}
