import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, Icon, Spinner, Text, VStack } from '@chakra-ui/react'

import { archiveAccount, getAccountSummary } from '../../api'
import type { AccountSummary, FinancialAccount } from '../../types'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import { ConfirmDeleteDialog } from '../../components/ui'
import { ChevronLeft, Plus, Wallet } from '../../components/ui/icons'
import AccountFormModal from './components/AccountFormModal'
import AccountList from './components/AccountList'
import AccountDetail from './components/AccountDetail'
import TotalHero from './components/TotalHero'
import TransferModal from './components/TransferModal'
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
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 3, md: 6, xl: 8 }} py={{ base: 4, md: 7 }}>
      <Flex align="center" minH="58px" mb={{ base: 3, md: 5 }}>
        {detailOpen ? (
          <Button onClick={() => navigateToList()} leftIcon={<Icon as={ChevronLeft} boxSize={4} />} variant="outline" h="42px" borderRadius="14px" borderColor="var(--pb-hair)" bg="var(--pb-surface)">
            {t('accounts.action.back')}
          </Button>
        ) : (
          <Box flex={1}>
            <Text fontFamily="var(--pb-mono)" fontSize="9px" fontWeight={700} letterSpacing=".17em" color="var(--pb-forest-2)" textTransform="uppercase">{t('accounts.page.eyebrow')}</Text>
            <Text mt={1} fontSize={{ base: '2rem', md: '2.45rem' }} fontWeight={600} color="var(--pb-ink)" lineHeight={1}>{t('nav.accounts.label')}</Text>
          </Box>
        )}
        {!detailOpen ? (
          <Button onClick={() => setFormAccount(null)} leftIcon={<Icon as={Plus} boxSize={4} />} bg="var(--pb-forest-2)" color="var(--pb-on-accent)" h="42px" borderRadius="14px" px={4} _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}>
            {t('accounts.action.add')}
          </Button>
        ) : (
          <Text ml={4} fontSize={{ base: '1.35rem', md: '1.65rem' }} fontWeight={600} color="var(--pb-ink)">{t('accounts.page.detailTitle')}</Text>
        )}
      </Flex>

      {loading && !summary ? <Flex justify="center" py={24}><Spinner color="var(--pb-forest-2)" /></Flex> : detailOpen ? (
        selectedAccount ? (
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
          <Flex direction="column" align="center" py={20} bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius="22px">
            <Text fontSize="lg" fontWeight={600} color="var(--pb-ink)">{t('accounts.page.notFound')}</Text>
            <Button mt={4} onClick={() => navigateToList(true)} variant="outline">{t('accounts.action.back')}</Button>
          </Flex>
        )
      ) : (
        <VStack align="stretch" spacing={{ base: 5, md: 7 }}>
          <TotalHero accounts={accounts} totalBalance={summary?.totalBalance ?? 0} hideBalances={hideBalances} onToggleHide={toggleHide} />
          <Box>
            <Flex align="flex-end" justify="space-between" mb={3} px={1}>
              <Box><Text fontFamily="var(--pb-mono)" fontSize="9px" fontWeight={700} letterSpacing=".16em" color="var(--pb-forest-2)" textTransform="uppercase">{t('accounts.list.title')}</Text><Text mt={1} fontSize="1.45rem" fontWeight={600} color="var(--pb-ink)">{t('accounts.page.activeTitle')}</Text></Box>
              <Text minW="30px" textAlign="center" px={2.5} py={1} borderRadius="12px" bg="var(--pb-tint-green)" color="var(--pb-forest-2)" fontFamily="var(--pb-mono)" fontSize="11px" fontWeight={700}>{accounts.length}</Text>
            </Flex>
            {accounts.length > 0 ? <AccountList accounts={accounts} hideBalances={hideBalances} onSelect={navigateToAccount} /> : <EmptyState onAdd={() => setFormAccount(null)} />}
          </Box>
        </VStack>
      )}

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
      <Button mt={5} onClick={onAdd} leftIcon={<Icon as={Plus} boxSize={4} />} bg="var(--pb-forest-2)" color="var(--pb-on-accent)">{t('accounts.action.add')}</Button>
    </Flex>
  )
}
