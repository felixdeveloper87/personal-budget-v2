import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, Icon, Spinner, Text } from '@chakra-ui/react'

import { archiveAccount, getAccountSummary } from '../../api'
import type { AccountSummary, FinancialAccount } from '../../types'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import { ConfirmDeleteDialog } from '../../components/ui'
import { ChevronLeft, Eye, EyeOff, Plus, Wallet } from '../../components/ui/icons'
import AccountFormModal from './components/AccountFormModal'
import AccountList from './components/AccountList'
import AccountDetail from './components/AccountDetail'
import TotalHero from './components/TotalHero'
import TransferModal from './components/TransferModal'
import NuHero from '../dashboard/components/NuHero'
import '../dashboard/theme/pb-tokens.css'

const BALANCE_VISIBILITY_KEY = 'accounts:hide-balances'

function accountIdFromPath() {
  const match = window.location.pathname.match(/^\/accounts\/(\d+)\/?$/)
  return match ? Number(match[1]) : null
}

export default function AccountsPage() {
  const { t, locale } = useI18n()
  const [summary, setSummary] = useState<AccountSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(accountIdFromPath)
  const [formAccount, setFormAccount] = useState<FinancialAccount | null | undefined>(undefined)
  const [accountToDelete, setAccountToDelete] = useState<FinancialAccount | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [detailVersion, setDetailVersion] = useState(0)
  const [hideBalances, setHideBalances] = useState(() => {
    try { return localStorage.getItem(BALANCE_VISIBILITY_KEY) === 'true' } catch { return false }
  })

  const load = useCallback(async () => {
    setLoading(true)
    try { setSummary(await getAccountSummary()) }
    catch (err) { ToastService.apiError(err, { title: t('accounts.toast.loadFailed'), dedupeKey: 'accounts-page-load-failed' }) }
    finally { setLoading(false) }
  }, [t])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const handlePopState = () => setSelectedId(accountIdFromPath())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const accounts = useMemo(() => (summary?.accounts ?? []).filter((account) => account.active).sort((a, b) => a.name.localeCompare(b.name, locale)), [locale, summary])
  const selectedAccount = accounts.find((account) => account.id === selectedId) ?? null
  const detailOpen = selectedId !== null

  const navigateToList = (replace = false) => {
    const state = { ...(window.history.state ?? {}), appPage: 'accounts' }
    window.history[replace ? 'replaceState' : 'pushState'](state, '', '/accounts')
    setSelectedId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToAccount = (id: number) => {
    window.history.pushState({ ...(window.history.state ?? {}), appPage: 'accounts' }, '', `/accounts/${id}`)
    setSelectedId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleHide = () => setHideBalances((current) => {
    const next = !current
    try { localStorage.setItem(BALANCE_VISIBILITY_KEY, String(next)) } catch { /* session only */ }
    return next
  })

  const archive = async () => {
    if (!accountToDelete) return
    setDeleting(true)
    try {
      await archiveAccount(accountToDelete.id)
      const deletedSelected = selectedId === accountToDelete.id
      setAccountToDelete(null)
      if (deletedSelected) navigateToList(true)
      await load()
      ToastService.success({ title: t('accounts.toast.deleted'), dedupeKey: `account-archived:${accountToDelete.id}` })
    } catch (err) {
      ToastService.apiError(err, { title: t('accounts.toast.deleteFailed'), dedupeKey: `account-archive-failed:${accountToDelete.id}` })
    } finally { setDeleting(false) }
  }

  return (
    <Box minH="100vh">
      <NuHero
        title={t('nav.accounts.label')}
        action={(
          <Flex
            as="button"
            type="button"
            aria-label={hideBalances ? t('accounts.action.showBalances') : t('accounts.action.hideBalances')}
            aria-pressed={hideBalances}
            onClick={toggleHide}
            align="center"
            justify="center"
            w="36px"
            h="36px"
            borderRadius="full"
            bg="rgba(255,255,255,.16)"
            color="white"
            transition="background-color .15s ease"
            _hover={{ bg: 'rgba(255,255,255,.24)' }}
            _focusVisible={{ outline: '2px solid white', outlineOffset: '3px' }}
          >
            <Icon as={hideBalances ? Eye : EyeOff} boxSize="18px" />
          </Flex>
        )}
      >
        {detailOpen && selectedAccount ? (
          <Box mt={{ base: 3, md: 4 }}>
            <Text fontSize="sm" color="rgba(255,255,255,.74)">{t('accounts.page.detailTitle')}</Text>
            <Text mt={0.5} fontSize={{ base: '1.8rem', md: '2.2rem' }} fontWeight={700} color="white" lineHeight={1.1} noOfLines={1}>{selectedAccount.name}</Text>
            <Text mt={1} fontSize="sm" color="rgba(255,255,255,.7)">{selectedAccount.institution || t(`accounts.type.${selectedAccount.type}`)}</Text>
          </Box>
        ) : (
          <TotalHero accounts={accounts} totalBalance={summary?.totalBalance ?? 0} hideBalances={hideBalances} />
        )}
      </NuHero>

      <Box maxW="appContent" mx="auto" px={{ base: 0, md: 4, lg: 6 }} mt="-24px" pb={{ base: 0, md: 7 }} position="relative">
        <Box className="nu-dashboard" bg="var(--nu-page)" borderTopRadius="24px" borderBottomRadius={{ base: 0, md: '24px' }} overflow="hidden">
          {loading && !summary ? (
            <Flex justify="center" py={24}><Spinner color="var(--nu-brand, #820ad1)" /></Flex>
          ) : detailOpen ? (
            <Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>
              <Button
                onClick={() => navigateToList()}
                leftIcon={<Icon as={ChevronLeft} boxSize={4} />}
                variant="ghost"
                h="38px"
                mb={3}
                ml={-3}
                borderRadius="full"
                color="var(--nu-brand, #820ad1)"
                _hover={{ bg: 'var(--nu-brand-tint, #f3e8fc)' }}
              >
                {t('accounts.action.back')}
              </Button>
              {selectedAccount ? (
                <AccountDetail
                  key={`${selectedAccount.id}-${detailVersion}`}
                  account={selectedAccount}
                  hideBalances={hideBalances}
                  showBackButton={false}
                  onBack={() => navigateToList()}
                  onTransfer={() => setTransferOpen(true)}
                  onSettings={() => setFormAccount(selectedAccount)}
                />
              ) : (
                <Flex direction="column" align="center" py={16}>
                  <Text fontSize="lg" fontWeight={600} color="var(--pb-ink)">{t('accounts.page.notFound')}</Text>
                  <Button mt={4} onClick={() => navigateToList(true)} variant="outline">{t('accounts.action.back')}</Button>
                </Flex>
              )}
            </Box>
          ) : (
            <Box px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
              <Flex align="center" justify="space-between" gap={4} mb={3}>
                <Box>
                  <Text fontSize="xl" fontWeight={650} color="var(--pb-ink)">{t('accounts.page.activeTitle')}</Text>
                  <Text mt={0.5} fontSize="sm" color="var(--pb-ink-soft)">{t(accounts.length === 1 ? 'accounts.count.one' : 'accounts.count.other', { count: accounts.length })}</Text>
                </Box>
                <Button
                  onClick={() => setFormAccount(null)}
                  leftIcon={<Icon as={Plus} boxSize={4} />}
                  h="40px"
                  px={4}
                  borderRadius="full"
                  bg="var(--nu-brand, #820ad1)"
                  color="white"
                  _hover={{ bg: '#6f00b8', transform: 'translateY(-1px)' }}
                >
                  {t('accounts.action.add')}
                </Button>
              </Flex>
              {accounts.length > 0 ? <AccountList accounts={accounts} hideBalances={hideBalances} onSelect={navigateToAccount} /> : <EmptyState onAdd={() => setFormAccount(null)} />}
            </Box>
          )}
        </Box>
      </Box>

      <AccountFormModal
        isOpen={formAccount !== undefined}
        account={formAccount}
        onClose={() => setFormAccount(undefined)}
        onSaved={async () => { await load(); setDetailVersion((version) => version + 1) }}
        onDelete={(account) => { setFormAccount(undefined); setAccountToDelete(account) }}
      />
      <TransferModal isOpen={transferOpen} onClose={() => setTransferOpen(false)} accounts={accounts} initialFromAccountId={selectedAccount?.id ?? null} hideBalances={hideBalances} onTransferred={async () => { await load(); setDetailVersion((version) => version + 1) }} />
      <ConfirmDeleteDialog isOpen={accountToDelete !== null} onClose={() => setAccountToDelete(null)} onConfirm={archive} isLoading={deleting} title={t('accounts.delete.title')} itemName={accountToDelete?.name} description={t('accounts.delete.description')} />
    </Box>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useI18n()
  return (
    <Flex direction="column" align="center" py={14} px={6} textAlign="center" bg="var(--pb-surface)" border="1px dashed var(--pb-hair-2)" borderRadius="22px">
      <Flex w={14} h={14} align="center" justify="center" borderRadius="2xl" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" mb={3}><Icon as={Wallet} boxSize={7} color="var(--pb-ink-faint)" /></Flex>
      <Text fontSize="md" fontWeight={600} color="var(--pb-ink)">{t('accounts.empty.title')}</Text>
      <Text fontSize="sm" color="var(--pb-ink-soft)" mt={1} maxW="340px">{t('accounts.empty.description')}</Text>
      <Button mt={5} onClick={onAdd} leftIcon={<Icon as={Plus} boxSize={4} />} borderRadius="full" bg="var(--nu-brand, #820ad1)" color="white" _hover={{ bg: '#6f00b8' }}>{t('accounts.action.add')}</Button>
    </Flex>
  )
}
