import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, Grid, Icon, Spinner, Text, VStack, useMediaQuery } from '@chakra-ui/react'

import { archiveAccount, getAccountSummary } from '../../api'
import type { AccountSummary, FinancialAccount } from '../../types'
import { ToastService } from '../../services/toast'
import type { AppPage } from '../../components/layout/header/navigation.config'

import { ConfirmDeleteDialog } from '../../components/ui'
import AccountFormModal from '../../components/accounts/AccountFormModal'
import { Plus, Wallet } from '../../components/ui/icons'

import '../dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../dashboard/components/motion'

import TotalHero from './components/TotalHero'
import AccountList from './components/AccountList'
import AccountDetail from './components/AccountDetail'

const BALANCE_VISIBILITY_KEY = 'accounts:hide-balances'

interface AccountsPageProps {
  onPageChange?: (page: AppPage) => void
}

export default function AccountsPage({ onPageChange }: AccountsPageProps) {
  const [summary, setSummary] = useState<AccountSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detailOpen, setDetailOpen] = useState(false) // mobile push state
  const [formAccount, setFormAccount] = useState<FinancialAccount | null | undefined>(undefined)
  const [accountToDelete, setAccountToDelete] = useState<FinancialAccount | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [isSplit] = useMediaQuery('(min-width: 920px)')

  const [hideBalances, setHideBalances] = useState(() => {
    try {
      return localStorage.getItem(BALANCE_VISIBILITY_KEY) === 'true'
    } catch {
      return false
    }
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setSummary(await getAccountSummary())
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not load accounts',
        dedupeKey: 'accounts-page-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const activeAccounts = useMemo(
    () =>
      (summary?.accounts ?? [])
        .filter((a) => a.active)
        .sort((a, b) => a.name.localeCompare(b.name, 'en-GB')),
    [summary],
  )

  // Keep a valid selection as the list loads / changes.
  useEffect(() => {
    if (activeAccounts.length === 0) {
      setSelectedId(null)
      return
    }
    if (selectedId === null || !activeAccounts.some((a) => a.id === selectedId)) {
      setSelectedId(activeAccounts[0].id)
    }
  }, [activeAccounts, selectedId])

  const selectedAccount = useMemo(
    () => activeAccounts.find((a) => a.id === selectedId) ?? null,
    [activeAccounts, selectedId],
  )

  const toggleHide = () =>
    setHideBalances((current) => {
      const next = !current
      try {
        localStorage.setItem(BALANCE_VISIBILITY_KEY, String(next))
      } catch {
        /* keep the preference for this session only */
      }
      return next
    })

  const selectAccount = (id: number) => {
    setSelectedId(id)
    if (!isSplit) {
      setDetailOpen(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const archive = async () => {
    if (!accountToDelete) return
    setDeleting(true)
    try {
      await archiveAccount(accountToDelete.id)
      if (selectedId === accountToDelete.id) {
        setSelectedId(null) // effect re-selects the first remaining account
        setDetailOpen(false)
      }
      await load()
      ToastService.success({
        title: 'Account deleted',
        dedupeKey: `account-archived:${accountToDelete.id}`,
      })
      setAccountToDelete(null)
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not delete account',
        dedupeKey: `account-archive-failed:${accountToDelete.id}`,
      })
    } finally {
      setDeleting(false)
    }
  }

  // What the push (mobile) layout shows: the list, unless a detail is open.
  const showList = isSplit || !detailOpen
  const showDetail = (isSplit || detailOpen) && selectedAccount !== null

  return (
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <MotionBox variants={containerV} initial="hidden" animate="show">
        <VStack align="stretch" spacing={{ base: 4, md: 5 }}>
          {loading ? (
            <Flex justify="center" py={20}>
              <Spinner color="var(--pb-forest-2)" />
            </Flex>
          ) : activeAccounts.length === 0 ? (
            <MotionBox variants={riseV}>
              <EmptyState onAdd={() => setFormAccount(null)} />
            </MotionBox>
          ) : (
            <>
              {/* Total hero — hidden in the mobile detail view */}
              {showList && (
                <MotionBox variants={riseV}>
                  <TotalHero
                    accounts={activeAccounts}
                    totalBalance={summary?.totalBalance ?? 0}
                    hideBalances={hideBalances}
                    onToggleHide={toggleHide}
                    onAddAccount={() => setFormAccount(null)}
                  />
                </MotionBox>
              )}

              {showList && (
                <MotionBox variants={riseV}>
                  <Text
                    fontFamily="var(--pb-mono)"
                    fontSize="10.5px"
                    letterSpacing="0.2em"
                    textTransform="uppercase"
                    color="var(--pb-ink-faint)"
                    pl="0.15rem"
                  >
                    Your accounts
                  </Text>
                </MotionBox>
              )}

              <MotionBox variants={riseV}>
                <Grid
                  templateColumns={{ base: '1fr', lg: 'minmax(320px, 370px) 1fr' }}
                  gap={{ base: 4, lg: 6 }}
                  alignItems="start"
                >
                  {showList && (
                    <AccountList
                      accounts={activeAccounts}
                      selectedId={selectedId}
                      hideBalances={hideBalances}
                      onSelect={selectAccount}
                      onEdit={(a) => setFormAccount(a)}
                      onArchive={(a) => setAccountToDelete(a)}
                    />
                  )}

                  {showDetail && selectedAccount && (
                    <Box position={{ base: 'static', lg: 'sticky' }} top={{ lg: '1rem' }}>
                      <AccountDetail
                        account={selectedAccount}
                        hideBalances={hideBalances}
                        showBackButton={!isSplit}
                        onBack={() => setDetailOpen(false)}
                        onTransfer={() => onPageChange?.('transfers')}
                      />
                    </Box>
                  )}
                </Grid>
              </MotionBox>
            </>
          )}

        </VStack>
      </MotionBox>

      <AccountFormModal
        isOpen={formAccount !== undefined}
        account={formAccount}
        onClose={() => setFormAccount(undefined)}
        onSaved={load}
      />
      <ConfirmDeleteDialog
        isOpen={accountToDelete !== null}
        onClose={() => setAccountToDelete(null)}
        onConfirm={archive}
        isLoading={deleting}
        title="Remove account?"
        itemName={accountToDelete?.name}
        description="Removes the account from your active accounts. Existing transactions are kept."
      />
    </Box>
  )
}

function HeaderButton({
  label,
  icon,
  primary,
  onClick,
}: {
  label: string
  icon: typeof Plus
  primary?: boolean
  onClick: () => void
}) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      flex={{ base: 1, sm: 'initial' }}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      gap="0.45rem"
      whiteSpace="nowrap"
      fontSize="0.95rem"
      fontWeight={500}
      px="1.05rem"
      py="0.58rem"
      borderRadius="14px"
      transition="0.18s"
      color={primary ? 'var(--pb-on-accent)' : 'var(--pb-ink-soft)'}
      bg={primary ? 'var(--pb-forest-2)' : 'var(--pb-surface)'}
      border="1px solid"
      borderColor={primary ? 'transparent' : 'var(--pb-hair)'}
      boxShadow={primary ? '0 1px 2px rgba(15,23,42,.18), 0 8px 20px rgba(15,23,42,.12)' : '0 1px 2px rgba(15,23,42,.05)'}
      _hover={{
        transform: 'translateY(-1px)',
        bg: primary ? 'var(--pb-forest)' : 'var(--pb-surface-2)',
        color: primary ? 'var(--pb-on-accent)' : 'var(--pb-ink)',
        borderColor: primary ? 'transparent' : 'var(--pb-hair-2)',
      }}
    >
      <Icon as={icon} boxSize="1.08em" />
      {label}
    </Box>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Flex
      direction="column"
      align="center"
      py={14}
      px={6}
      textAlign="center"
      bg="var(--pb-surface)"
      border="1px dashed var(--pb-hair-2)"
      borderRadius="22px"
    >
      <Flex w={14} h={14} align="center" justify="center" borderRadius="2xl" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" mb={3}>
        <Icon as={Wallet} boxSize={7} color="var(--pb-ink-faint)" weight="duotone" />
      </Flex>
      <Text fontSize="md" fontWeight={500} color="var(--pb-ink)">
        No accounts yet
      </Text>
      <Text fontSize="sm" color="var(--pb-ink-soft)" mt={1} maxW="340px">
        Add your first account to start tracking balances and connected institutions.
      </Text>
      <Box mt={5}>
        <HeaderButton label="Add account" icon={Plus} primary onClick={onAdd} />
      </Box>
    </Flex>
  )
}
