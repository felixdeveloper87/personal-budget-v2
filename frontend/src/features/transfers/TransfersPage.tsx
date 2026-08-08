import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Flex,
  HStack,
  Icon,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  createAccountTransfer,
  getAccountSummary,
  listAccountTransfers,
} from '../../api'
import type {
  AccountTransfer,
  FinancialAccount,
} from '../../types'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { money } from '../../components/accounts/accountMeta'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building,
  ChevronDown,
  DollarSign,
  Repeat,
  Wallet,
} from '../../components/ui/icons'
import { ToastService } from '../../services/toast'
import AccountAvatar from '../accounts/components/AccountAvatar'

import '../dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../dashboard/components/motion'

const BALANCE_VISIBILITY_KEY = 'accounts:hide-balances'
const today = () => new Date().toISOString().slice(0, 10)

interface TransfersPageProps {
  onPageChange?: (page: AppPage) => void
}

interface TransferAccountSelectProps {
  accounts: FinancialAccount[]
  value: number | null
  onChange: (accountId: number) => void
  formatBalance: (value: number, currency?: string) => string
}

function TransferAccountSelect({ accounts, value, onChange, formatBalance }: TransferAccountSelectProps) {
  const selected = accounts.find((account) => account.id === value)

  return (
    <Menu matchWidth>
      <MenuButton
        as={Box}
        role="button"
        tabIndex={0}
        w="full"
        h="52px"
        px="0.6rem"
        borderRadius="12px"
        bg="var(--pb-surface)"
        border="1px solid var(--pb-hair)"
        cursor="pointer"
        transition="0.15s"
        _hover={{ borderColor: 'var(--pb-hair-2)' }}
      >
        <Flex align="center" justify="space-between" gap={2} h="full">
          <HStack spacing={2.5} minW={0}>
            {selected ? <AccountAvatar account={selected} size={30} /> : <Flex w="30px" h="30px" flexShrink={0} align="center" justify="center" borderRadius="9px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" />}
            <Box minW={0} textAlign="left">
              <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
                {selected?.name ?? 'Select account'}
              </Text>
              {selected && (
                <Text className="num" fontSize="10.5px" color="var(--pb-ink-soft)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatBalance(selected.currentBalance, selected.currency)}
                </Text>
              )}
            </Box>
          </HStack>
          <Icon as={ChevronDown} boxSize={4} color="var(--pb-ink-faint)" flexShrink={0} />
        </Flex>
      </MenuButton>
      <MenuList minW="100%" bg="var(--pb-surface)" borderColor="var(--pb-hair)" borderRadius="12px" boxShadow="var(--pb-shadow)" py={1} zIndex={20}>
        {accounts.map((account) => (
          <MenuItem key={account.id} onClick={() => onChange(account.id)} bg="var(--pb-surface)" _hover={{ bg: 'var(--pb-surface-2)' }} _focus={{ bg: 'var(--pb-surface-2)' }}>
            <HStack justify="space-between" w="full" minW={0} spacing={3}>
              <HStack spacing={2.5} minW={0}>
                <AccountAvatar account={account} size={26} />
                <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
                  {account.name}
                </Text>
              </HStack>
              <Text className="num" fontSize="xs" color="var(--pb-ink-soft)" flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatBalance(account.currentBalance, account.currency)}
              </Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

export default function TransfersPage({ onPageChange }: TransfersPageProps) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [transfers, setTransfers] = useState<AccountTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fromAccountId, setFromAccountId] = useState<number | null>(null)
  const [toAccountId, setToAccountId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [transferDate, setTransferDate] = useState(today())
  const [description, setDescription] = useState('')

  const hideBalances = useMemo(() => {
    try {
      return localStorage.getItem(BALANCE_VISIBILITY_KEY) === 'true'
    } catch {
      return false
    }
  }, [])

  const displayMoney = useCallback(
    (value: number, currency = 'GBP') => (hideBalances ? '••••••' : money(value, currency)),
    [hideBalances],
  )

  const accountsById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [summary, transferItems] = await Promise.all([
        getAccountSummary(),
        listAccountTransfers(),
      ])
      const activeAccounts = summary.accounts.filter((account) => account.active)
      setAccounts(activeAccounts)
      setTransfers(transferItems)
      setFromAccountId((current) =>
        activeAccounts.some((account) => account.id === current)
          ? current
          : activeAccounts[0]?.id ?? null,
      )
      setToAccountId((current) =>
        activeAccounts.some((account) => account.id === current)
          ? current
          : activeAccounts[1]?.id ?? activeAccounts[0]?.id ?? null,
      )
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not load transfers',
        dedupeKey: 'transfers-page-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const submitTransfer = async () => {
    const parsedAmount = Number(amount)
    if (
      !fromAccountId ||
      !toAccountId ||
      fromAccountId === toAccountId ||
      !(parsedAmount > 0)
    ) {
      return
    }

    setSaving(true)
    try {
      await createAccountTransfer({
        fromAccountId,
        toAccountId,
        amount: parsedAmount,
        transferDate,
        description: description.trim() || undefined,
      })
      setAmount('')
      setDescription('')
      await load()
      ToastService.success({
        title: 'Transfer recorded',
        dedupeKey: 'account-transfer-created',
      })
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not transfer',
        dedupeKey: 'account-transfer-failed',
      })
    } finally {
      setSaving(false)
    }
  }

  const sameAccount =
    fromAccountId !== null &&
    toAccountId !== null &&
    fromAccountId === toAccountId
  const parsedAmount = Number(amount)

  return (
    <Box minH="100vh" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 3, md: 7 }}>
      <MotionBox variants={containerV} initial="hidden" animate="show">
        <VStack align="stretch" spacing={{ base: 3, md: 5 }}>
          <MotionBox variants={riseV}>
            <Flex align="baseline" justify="space-between" gap={3}>
              <SectionLabel>Transfers</SectionLabel>
              <Box
                as="button"
                type="button"
                onClick={() => onPageChange?.('accounts')}
                display="inline-flex"
                alignItems="center"
                gap="0.35rem"
                fontFamily="var(--pb-mono)"
                fontSize="10.5px"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color="var(--pb-ink-soft)"
                px="0.7rem"
                py="0.32rem"
                borderRadius="999px"
                border="1px solid var(--pb-hair)"
                bg="var(--pb-surface)"
                transition="0.18s"
                _hover={{ color: 'var(--pb-ink)', borderColor: 'var(--pb-hair-2)', bg: 'var(--pb-surface-2)' }}
              >
                <Icon as={ArrowLeft} boxSize="0.95em" />
                Accounts
              </Box>
            </Flex>
          </MotionBox>

          {loading ? (
            <Flex justify="center" py={20}>
              <Spinner color="var(--pb-forest-2)" />
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, lg: 5 }} spacing={{ base: 3, md: 5 }} alignItems="start">
              <MotionBox variants={riseV} gridColumn={{ base: 'auto', lg: 'span 3' }}>
                <Panel eyebrow="Move money" title="Transfer between accounts" caption="Choose the source, destination and amount.">
                  {accounts.length < 2 ? (
                    <Note icon={AlertTriangle}>Create at least two active accounts before recording a transfer.</Note>
                  ) : (
                    <>
                      <SimpleGrid columns={{ base: 1, sm: 7 }} spacing={3} alignItems="center">
                        <Box gridColumn={{ sm: 'span 3' }}>
                          <FieldLabel icon={Wallet}>From account</FieldLabel>
                          <TransferAccountSelect accounts={accounts} value={fromAccountId} onChange={setFromAccountId} formatBalance={displayMoney} />
                        </Box>

                        <Flex align="center" justify="center" transform={{ base: 'rotate(90deg)', sm: 'none' }} py={{ base: 1, sm: 0 }}>
                          <Flex w="34px" h="34px" align="center" justify="center" borderRadius="full" bg="var(--pb-tint-green)" color="var(--pb-forest-2)">
                            <Icon as={ArrowRight} boxSize={4} />
                          </Flex>
                        </Flex>

                        <Box gridColumn={{ sm: 'span 3' }}>
                          <FieldLabel icon={Building}>To account</FieldLabel>
                          <TransferAccountSelect accounts={accounts} value={toAccountId} onChange={setToAccountId} formatBalance={displayMoney} />
                        </Box>
                      </SimpleGrid>

                      {sameAccount && <Note icon={AlertTriangle}>Choose two different accounts.</Note>}

                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                        <Box>
                          <FieldLabel icon={DollarSign}>Amount</FieldLabel>
                          <NumberInput min={0} precision={2} value={amount} onChange={setAmount}>
                            <NumberInputField bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="12px" h="44px" />
                          </NumberInput>
                        </Box>
                        <Box>
                          <FieldLabel>Transfer date</FieldLabel>
                          <Input type="date" value={transferDate} onChange={(event) => setTransferDate(event.target.value)} bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="12px" h="44px" />
                        </Box>
                      </SimpleGrid>

                      <Box>
                        <FieldLabel>Reference <Text as="span" color="var(--pb-ink-faint)" fontWeight={400} textTransform="none" letterSpacing="normal" fontFamily="inherit">(optional)</Text></FieldLabel>
                        <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Monthly savings" bg="var(--pb-surface-2)" borderColor="var(--pb-hair)" borderRadius="12px" h="44px" />
                      </Box>

                      <ActionButton
                        label={`Transfer ${parsedAmount > 0 ? money(parsedAmount) : 'money'}`}
                        icon={Repeat}
                        primary
                        onClick={submitTransfer}
                        isLoading={saving}
                        disabled={!fromAccountId || !toAccountId || sameAccount || !(parsedAmount > 0)}
                      />
                    </>
                  )}
                </Panel>
              </MotionBox>

              <MotionBox variants={riseV} gridColumn={{ base: 'auto', lg: 'span 2' }}>
                <Panel eyebrow="History" title="Recent transfers" caption={`${transfers.length} recorded transfer${transfers.length !== 1 ? 's' : ''}.`}>
                  {transfers.length === 0 ? (
                    <EmptyPlan icon={Repeat} title="No transfers yet" body="Transfers between your accounts will show up here." />
                  ) : (
                    <VStack align="stretch" spacing="0.6rem">
                      {transfers.slice(0, 12).map((transfer) => (
                        <TransferRow key={transfer.id} transfer={transfer} fromAccount={accountsById.get(transfer.fromAccountId)} toAccount={accountsById.get(transfer.toAccountId)} formatAmount={displayMoney} />
                      ))}
                    </VStack>
                  )}
                </Panel>
              </MotionBox>
            </SimpleGrid>
          )}
        </VStack>
      </MotionBox>
    </Box>
  )
}

function TransferRow({
  transfer,
  fromAccount,
  toAccount,
  formatAmount,
}: {
  transfer: AccountTransfer
  fromAccount?: FinancialAccount
  toAccount?: FinancialAccount
  formatAmount: (value: number, currency?: string) => string
}) {
  return (
    <Box p="0.75rem" borderRadius="14px" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)">
      <Flex align="center" justify="space-between" gap={3}>
        <HStack spacing={2} minW={0} flex={1}>
          {fromAccount ? <AccountAvatar account={fromAccount} size={26} /> : <Flex w="26px" h="26px" flexShrink={0} borderRadius="9px" bg="var(--pb-surface-3)" />}
          <Icon as={ArrowRight} boxSize={3.5} color="var(--pb-ink-faint)" flexShrink={0} />
          {toAccount ? <AccountAvatar account={toAccount} size={26} /> : <Flex w="26px" h="26px" flexShrink={0} borderRadius="9px" bg="var(--pb-surface-3)" />}
          <Box minW={0}>
            <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
              {transfer.fromAccountName}
            </Text>
            <Text fontSize="10.5px" color="var(--pb-ink-soft)" noOfLines={1}>
              to {transfer.toAccountName}
            </Text>
          </Box>
        </HStack>
        <Text className="num" fontSize="sm" fontWeight={600} color="var(--pb-forest-2)" flexShrink={0} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatAmount(transfer.amount)}
        </Text>
      </Flex>
      <Flex justify="space-between" mt={2}>
        <Text fontSize="10px" color="var(--pb-ink-faint)" noOfLines={1}>
          {transfer.description || 'No reference'}
        </Text>
        <Text fontSize="10px" color="var(--pb-ink-faint)" flexShrink={0}>
          {new Date(`${transfer.transferDate}T00:00:00`).toLocaleDateString('en-GB')}
        </Text>
      </Flex>
    </Box>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)" pl="0.15rem">{children}</Text>
}

function Panel({ eyebrow, title, caption, children }: { eyebrow: string; title: string; caption: string; children: React.ReactNode }) {
  return (
    <Box h="full" p={{ base: 3, md: 5 }} borderRadius={{ base: '16px', md: '22px' }} bg="var(--pb-surface)" border="1px solid var(--pb-hair)" boxShadow="var(--pb-shadow)">
      <Box mb={{ base: 3, md: 5 }}>
        <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.16em" textTransform="uppercase" color="var(--pb-forest-2)">{eyebrow}</Text>
        <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight={600} letterSpacing="-0.015em" color="var(--pb-ink)" mt="3px">{title}</Text>
        <Text fontSize="sm" color="var(--pb-ink-soft)" lineHeight="1.45" mt="3px">{caption}</Text>
      </Box>
      <VStack align="stretch" spacing={{ base: 3, md: 4 }}>{children}</VStack>
    </Box>
  )
}

function FieldLabel({ icon, children }: { icon?: typeof Wallet; children: React.ReactNode }) {
  return (
    <HStack spacing={1.5} mb={1.5}>
      {icon && <Icon as={icon} boxSize={3.5} color="var(--pb-ink-faint)" />}
      <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.13em" textTransform="uppercase" color="var(--pb-ink-faint)">{children}</Text>
    </HStack>
  )
}

function ActionButton({ label, icon, primary, onClick, isLoading, disabled }: { label: string; icon: typeof Repeat; primary?: boolean; onClick: () => void; isLoading?: boolean; disabled?: boolean }) {
  return (
    <Box
      as="button"
      type="button"
      onClick={disabled || isLoading ? undefined : onClick}
      aria-disabled={disabled || isLoading}
      w="full"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      gap="0.5rem"
      h="48px"
      px={4}
      borderRadius="12px"
      fontWeight={500}
      transition="0.18s"
      opacity={disabled ? 0.55 : 1}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      color={primary ? 'var(--pb-on-accent)' : 'var(--pb-ink-soft)'}
      bg={primary ? 'var(--pb-forest-2)' : 'var(--pb-surface-2)'}
      border="1px solid"
      borderColor={primary ? 'transparent' : 'var(--pb-hair)'}
      _hover={disabled ? undefined : { bg: primary ? 'var(--pb-forest)' : 'var(--pb-surface-3)' }}
    >
      {isLoading ? <Spinner size="sm" /> : <Icon as={icon} boxSize={4} />}
      {label}
    </Box>
  )
}

function Note({ icon, children }: { icon: typeof AlertTriangle; children: React.ReactNode }) {
  return (
    <HStack align="start" spacing={2} px={3} py={2.5} borderRadius="10px" bg="var(--pb-tint-coral)">
      <Icon as={icon} boxSize={4} color="var(--pb-coral)" mt="1px" flexShrink={0} />
      <Text fontSize="xs" color="var(--pb-ink-soft)">{children}</Text>
    </HStack>
  )
}

function EmptyPlan({ icon, title, body }: { icon: typeof Repeat; title: string; body: string }) {
  return (
    <Flex direction="column" align="center" textAlign="center" py={8} px={4} border="1px dashed var(--pb-hair-2)" borderRadius="15px">
      <Flex w={11} h={11} align="center" justify="center" borderRadius="12px" bg="var(--pb-surface-2)" color="var(--pb-ink-faint)" mb={3}>
        <Icon as={icon} boxSize={5} weight="duotone" />
      </Flex>
      <Text fontWeight={600} color="var(--pb-ink)">{title}</Text>
      <Text fontSize="sm" color="var(--pb-ink-soft)" maxW="330px" mt={1}>{body}</Text>
    </Flex>
  )
}
