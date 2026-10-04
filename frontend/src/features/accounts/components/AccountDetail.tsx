import { useEffect, useState, type ReactNode } from 'react'
import { Box, Flex, HStack, Icon, IconButton, Spinner, Text } from '@chakra-ui/react'
import { getAccountDetails, getAccountActivityPage } from '../../../api'
import type { AccountActivityItem, AccountActivityPage, AccountDetails, FinancialAccount } from '../../../types'
import { ToastService } from '../../../services/toast'
import { ChevronLeft, ChevronRight, Repeat, Settings } from '../../../components/ui/icons'
import { ACCOUNT_LABELS } from '../data/accountMeta'
import { useI18n } from '../../../i18n'
import AccountAvatar from '../../../components/accounts/AccountAvatar'
import { NuSection } from '../../dashboard/components/nu'
import Segmented from '../../dashboard/components/Segmented'
import AccountActivityRow from './RecentActivity'

const ACTIVITY_PAGE_SIZE = 10

type ActivityTab = 'recent' | 'upcoming'
type ActivityFilter = 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'
const FILTERS: ActivityFilter[] = ['ALL', 'INCOME', 'EXPENSE', 'TRANSFER']

function matchesFilter(item: AccountActivityItem, filter: ActivityFilter) {
  if (filter === 'ALL') return true
  if (filter === 'TRANSFER') return item.kind === 'TRANSFER_IN' || item.kind === 'TRANSFER_OUT'
  return item.kind === filter
}

interface AccountDetailProps {
  account: FinancialAccount
  hideBalances: boolean
  onTransfer: () => void
  onSettings: () => void
}

/** Body of the account page's white sheet — the balance itself lives in the purple hero. */
export default function AccountDetail({ account, hideBalances, onTransfer, onSettings }: AccountDetailProps) {
  const { t, formatCurrency, formatDate } = useI18n()
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
  const [tab, setTab] = useState<ActivityTab>('recent')
  const [filter, setFilter] = useState<ActivityFilter>('ALL')

  useEffect(() => {
    setActivityPage(0)
    setActivity(null)
    setTab('recent')
    setFilter('ALL')
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
  const typeLabel = t(`accounts.type.${shown.type}`, undefined, ACCOUNT_LABELS[shown.type])
  const overdraftPercentage = Math.max(0, Math.min(100, shown.overdraftPercentageUsed || 0))
  const overdraftDanger = overdraftPercentage >= 75
  const fullDate = (value: string) => formatDate(value, { day: '2-digit', month: 'long', year: 'numeric' })

  const items = tab === 'recent' ? activity?.items ?? [] : details?.upcomingActivity ?? []
  const filtered = items.filter((item) => matchesFilter(item, filter))
  const showRecentSpinner = tab === 'recent' && activityLoading && !activity

  return (
    <Box>
      {/* Identity + round shortcuts */}
      <Box px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
        <Flex align="center" gap={3}>
          <AccountAvatar account={shown} size={44} />
          <Box minW={0} flex={1}>
            <Text fontSize="md" fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{shown.name}</Text>
            <Text mt="2px" fontSize="sm" color="var(--pb-ink-soft)" noOfLines={1}>
              {shown.institution || t('accounts.personalAccount')} · {typeLabel}
            </Text>
          </Box>
        </Flex>
        <HStack mt={5} spacing={5} align="flex-start">
          <QuickAction icon={<Icon as={Repeat} boxSize="20px" />} label={t('accounts.detail.transfer')} onClick={onTransfer} />
          <QuickAction icon={<Icon as={Settings} boxSize="20px" />} label={t('accounts.detail.configure')} onClick={onSettings} />
        </HStack>
      </Box>

      {shown.type === 'CURRENT' && shown.overdraftLimit > 0 && (
        <NuSection
          title={t('accounts.detail.overdraft.title')}
          subtitle={t('accounts.detail.overdraft.limit', { amount: mask(shown.overdraftLimit) })}
          action={(
            <Text
              flexShrink={0} px={3} py={1} borderRadius="full"
              bg={overdraftDanger ? 'var(--nu-negative-tint)' : 'var(--nu-brand-tint)'}
              color={overdraftDanger ? 'var(--nu-negative)' : 'var(--nu-brand)'}
              fontSize="sm" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {hideBalances ? '••' : `${Math.round(overdraftPercentage)}%`}
            </Text>
          )}
        >
          <Box h="6px" borderRadius="full" bg="var(--nu-track)" overflow="hidden" maxW="560px">
            <Box h="full" w={`${overdraftPercentage}%`} borderRadius="full" bg={overdraftDanger ? 'var(--nu-negative)' : 'var(--nu-brand)'} transition="width .4s ease" />
          </Box>
          <Flex mt={2} justify="space-between" maxW="560px" fontSize="sm" color="var(--pb-ink-soft)">
            <Text>{t('accounts.detail.overdraft.used', { amount: mask(shown.overdraftUsed) })}</Text>
            <Text>{t('accounts.detail.overdraft.available', { amount: mask(shown.overdraftAvailable) })}</Text>
          </Flex>
        </NuSection>
      )}

      <NuSection title={t('accounts.detail.info.title')}>
        <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }} columnGap={10}>
          <InfoRow label={t('accounts.detail.info.institution')} value={shown.institution || t('accounts.personalAccount')} />
          <InfoRow label={t('accounts.detail.info.type')} value={typeLabel} />
          <InfoRow label={t('accounts.detail.info.currency')} value={shown.currency} />
          <InfoRow label={t('accounts.openingBalance')} value={mask(shown.openingBalance)} />
          <InfoRow label={t('accounts.detail.info.anchor')} value={fullDate(shown.balanceAnchorAt)} />
          {shown.createdAt && <InfoRow label={t('accounts.detail.info.created')} value={fullDate(shown.createdAt)} />}
        </Box>
      </NuSection>

      <NuSection
        title={t('accounts.detail.activity.title')}
        subtitle={t('accounts.detail.activity.caption')}
        action={(
          <Text
            flexShrink={0} minW="32px" textAlign="center" px={3} py={1} borderRadius="full" bg="var(--nu-brand-tint)" color="var(--nu-brand)"
            fontSize="sm" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {filtered.length}
          </Text>
        )}
      >
        <Segmented
          options={[
            { value: 'recent', label: t('accounts.detail.tab.recent') },
            { value: 'upcoming', label: t('accounts.detail.tab.upcoming') },
          ]}
          value={tab}
          onChange={(next) => { setTab(next); setFilter('ALL') }}
          mobileFullWidth
          aria-label={t('accounts.detail.tabsAria')}
        />

        <HStack
          mt={3}
          spacing={2}
          overflowX="auto"
          mx={{ base: -4, md: 0 }}
          px={{ base: 4, md: 0 }}
          pb={1}
          sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
        >
          {FILTERS.map((value) => {
            const selected = filter === value
            return (
              <Box
                as="button"
                type="button"
                key={value}
                onClick={() => setFilter(value)}
                aria-pressed={selected}
                flexShrink={0}
                px={4}
                py={2}
                borderRadius="full"
                bg={selected ? 'var(--nu-brand)' : 'var(--nu-surface)'}
                color={selected ? 'white' : 'var(--pb-ink)'}
                fontSize="sm"
                fontWeight={selected ? 700 : 500}
                transition="background-color .15s ease, color .15s ease"
                _hover={{ bg: selected ? 'var(--nu-brand-deep)' : 'var(--nu-surface-hover)' }}
                _focusVisible={{ outline: '2px solid var(--nu-brand)', outlineOffset: '2px' }}
              >
                {t(`accounts.detail.filter.${value}`)}
              </Box>
            )
          })}
        </HStack>

        <Box mt={2} position="relative" minH="96px">
          {showRecentSpinner ? (
            <Flex minH="96px" align="center" justify="center">
              <Spinner size="sm" color="var(--nu-brand, #820ad1)" />
            </Flex>
          ) : filtered.length === 0 ? (
            <Box mt={2} bg="var(--nu-surface)" borderRadius="16px" p={6} textAlign="center">
              <Text fontSize="sm" color="var(--pb-ink-soft)">
                {tab === 'upcoming'
                  ? t('accounts.detail.empty.upcoming')
                  : filter === 'ALL' ? t('accounts.activity.empty') : t('accounts.detail.empty.filtered')}
              </Text>
            </Box>
          ) : (
            <Box opacity={tab === 'recent' && activityLoading ? 0.45 : 1} transition="opacity .15s ease">
              {filtered.map((item) => (
                <AccountActivityRow key={`${item.kind}-${item.id}-${item.date}`} item={item} hideBalances={hideBalances} />
              ))}
            </Box>
          )}
          {tab === 'recent' && activityLoading && activity && (
            <Flex position="absolute" inset={0} align="center" justify="center" pointerEvents="none">
              <Spinner size="sm" color="var(--nu-brand, #820ad1)" />
            </Flex>
          )}
        </Box>

        {tab === 'recent' && (
          <HStack mt={4} spacing={3} justify="center">
            <IconButton
              aria-label={t('accounts.activity.newer')}
              title={t('accounts.activity.newer')}
              icon={<Icon as={ChevronLeft} boxSize="16px" />}
              size="sm"
              variant="ghost"
              borderRadius="full"
              color="var(--nu-brand, #820ad1)"
              bg="var(--nu-brand-tint, #f3e8fc)"
              isDisabled={activityPage === 0 || activityLoading}
              onClick={() => setActivityPage((page) => Math.max(0, page - 1))}
              _hover={{ bg: '#ead6fa' }}
            />
            <Text minW="64px" textAlign="center" fontSize="sm" fontWeight={600} color="var(--pb-ink-soft)">
              {t('accounts.activity.page', { page: activityPage + 1 })}
            </Text>
            <IconButton
              aria-label={t('accounts.activity.older')}
              title={t('accounts.activity.older')}
              icon={<Icon as={ChevronRight} boxSize="16px" />}
              size="sm"
              variant="ghost"
              borderRadius="full"
              color="var(--nu-brand, #820ad1)"
              bg="var(--nu-brand-tint, #f3e8fc)"
              isDisabled={!activity?.hasMore || activityLoading}
              onClick={() => setActivityPage((page) => page + 1)}
              _hover={{ bg: '#ead6fa' }}
            />
          </HStack>
        )}
      </NuSection>
    </Box>
  )
}

/** Nubank-style round shortcut: grey circle + label underneath. */
function QuickAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <Flex
      as="button"
      type="button"
      onClick={onClick}
      aria-label={label}
      direction="column"
      align="center"
      w="76px"
      gap={2}
      role="group"
      _focusVisible={{ outline: 'none' }}
    >
      <Flex
        w="60px"
        h="60px"
        align="center"
        justify="center"
        borderRadius="full"
        bg="var(--nu-surface)"
        color="var(--pb-ink)"
        transition="background-color .15s ease, transform .15s ease"
        _groupHover={{ bg: 'var(--nu-surface-hover)', transform: 'translateY(-1px)' }}
        _groupFocusVisible={{ boxShadow: '0 0 0 2px var(--nu-brand)' }}
      >
        {icon}
      </Flex>
      <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{label}</Text>
    </Flex>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex align="center" justify="space-between" gap={3} minH="48px" py={3} borderBottom="1px solid var(--pb-hair)">
      <Text fontSize="sm" color="var(--pb-ink-soft)">{label}</Text>
      <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" textAlign="right" noOfLines={1}>{value}</Text>
    </Flex>
  )
}
