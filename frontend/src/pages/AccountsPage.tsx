import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { archiveAccount, getAccountSummary } from '../api'
import { AccountSummary, FinancialAccount } from '../types'
import { ToastService } from '../services/toast'
import { ConfirmDeleteDialog, PageHeader } from '../components/ui'
import AccountTile from '../components/accounts/AccountTile'
import AccountFormModal from '../components/accounts/AccountFormModal'
import AccountDetailsModal from '../components/accounts/AccountDetailsModal'
import {
  ACCOUNT_GROUP_LABELS,
  ACCOUNT_TYPE_ORDER,
  money,
} from '../components/accounts/accountMeta'
import type { AppPage } from '../components/layout/header/navigation.config'
import { Building, Eye, EyeOff, Plus, Repeat, Wallet } from '../components/ui/icons'

const BALANCE_VISIBILITY_KEY = 'accounts:hide-balances'

interface AccountsPageProps {
  onPageChange?: (page: AppPage) => void
}

export default function AccountsPage({ onPageChange }: AccountsPageProps) {
  const [summary, setSummary] = useState<AccountSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [hideBalances, setHideBalances] = useState(() => {
    try {
      return localStorage.getItem(BALANCE_VISIBILITY_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [selectedAccount, setSelectedAccount] = useState<FinancialAccount | null>(null)
  // Create/edit modal: `undefined` closed, `null` create, an account edits it.
  const [formAccount, setFormAccount] = useState<FinancialAccount | null | undefined>(undefined)
  const [accountToDelete, setAccountToDelete] = useState<FinancialAccount | null>(null)
  const [deleting, setDeleting] = useState(false)

  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const muted = useColorModeValue('gray.600', 'gray.400')
  const emptyBorder = useColorModeValue('gray.200', 'gray.700')

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
    () => summary?.accounts.filter((account) => account.active) ?? [],
    [summary],
  )
  const groupedAccounts = useMemo(
    () =>
      ACCOUNT_TYPE_ORDER.map((accountType) => ({
        type: accountType,
        accounts: activeAccounts
          .filter((account) => account.type === accountType)
          .sort((a, b) => a.name.localeCompare(b.name, 'en-GB')),
      })).filter((group) => group.accounts.length > 0),
    [activeAccounts],
  )

  const displayMoney = (value: number, currency = 'GBP') =>
    hideBalances ? '••••••' : money(value, currency)

  const toggleBalances = () => {
    setHideBalances((current) => {
      const next = !current
      try {
        localStorage.setItem(BALANCE_VISIBILITY_KEY, String(next))
      } catch {
        // Keep the preference for this session when storage is unavailable.
      }
      return next
    })
  }

  const archive = async () => {
    if (!accountToDelete) return
    setDeleting(true)
    try {
      await archiveAccount(accountToDelete.id)
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

  return (
    <Box w="full" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        <PageHeader
          icon={Building}
          title="Accounts"
          subtitle="Manage balances and connected institutions."
          rightSlot={
            <HStack spacing={2} w={{ base: 'full', sm: 'auto' }}>
              <Button
                variant="outline"
                leftIcon={<Icon as={Repeat} boxSize={4} />}
                onClick={() => onPageChange?.('transfers')}
                flex={{ base: 1, sm: 'initial' }}
              >
                Transfer
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<Icon as={Plus} boxSize={4} />}
                onClick={() => setFormAccount(null)}
                flex={{ base: 1, sm: 'initial' }}
              >
                Add account
              </Button>
            </HStack>
          }
        />

        <Card border="1px solid" borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <HStack justify="space-between" align="center">
              <Stat>
                <StatLabel color={muted} fontWeight={700}>
                  Total balance
                </StatLabel>
                <StatNumber
                  mt={1}
                  fontSize={{ base: '2xl', md: '3xl' }}
                  letterSpacing="-0.035em"
                  color={!hideBalances && (summary?.totalBalance ?? 0) < 0 ? 'red.500' : undefined}
                >
                  {displayMoney(summary?.totalBalance ?? 0)}
                </StatNumber>
                <Text fontSize="xs" color={muted} mt={1}>
                  Across all active accounts
                </Text>
              </Stat>
              <IconButton
                aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
                title={hideBalances ? 'Show balances' : 'Hide balances'}
                icon={<Icon as={hideBalances ? Eye : EyeOff} boxSize={5} />}
                onClick={toggleBalances}
                variant="ghost"
                color={muted}
                borderRadius="full"
              />
            </HStack>
          </CardBody>
        </Card>

        {loading ? (
          <HStack justify="center" py={20}>
            <Spinner color="blue.500" />
          </HStack>
        ) : activeAccounts.length === 0 ? (
          <Box py={12} textAlign="center" border="1px dashed" borderColor={emptyBorder} borderRadius="xl">
            <Icon as={Wallet} boxSize={7} color={muted} mb={3} />
            <Text fontSize="sm" color={muted}>
              No accounts yet. Add your first account to start tracking balances.
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={6}>
            {groupedAccounts.map((group) => (
              <VStack key={group.type} align="stretch" spacing={3}>
                <HStack justify="space-between" px={1}>
                  <Text
                    fontSize="2xs"
                    fontWeight={800}
                    color={muted}
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                  >
                    {ACCOUNT_GROUP_LABELS[group.type]}
                  </Text>
                  <Text fontSize="2xs" color={muted}>
                    {group.accounts.length}
                  </Text>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                  {group.accounts.map((account) => (
                    <AccountTile
                      key={account.id}
                      account={account}
                      hideBalances={hideBalances}
                      onActivity={() => setSelectedAccount(account)}
                      onEdit={() => setFormAccount(account)}
                      onArchive={() => setAccountToDelete(account)}
                    />
                  ))}
                </SimpleGrid>
              </VStack>
            ))}
          </VStack>
        )}
      </VStack>

      <AccountFormModal
        isOpen={formAccount !== undefined}
        account={formAccount}
        onClose={() => setFormAccount(undefined)}
        onSaved={load}
      />
      <AccountDetailsModal
        account={selectedAccount}
        isOpen={selectedAccount !== null}
        onClose={() => setSelectedAccount(null)}
        hideBalances={hideBalances}
      />
      <ConfirmDeleteDialog
        isOpen={accountToDelete !== null}
        onClose={() => setAccountToDelete(null)}
        onConfirm={archive}
        isLoading={deleting}
        title="Delete account"
        itemName={accountToDelete?.name}
        description="Removes the account from your active accounts. Existing transactions are kept."
      />
    </Box>
  )
}
