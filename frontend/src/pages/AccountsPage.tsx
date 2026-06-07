import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  NumberInput,
  NumberInputField,
  Progress,
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  archiveAccount,
  assignLegacyTransactions,
  createAccount,
  createAccountTransfer,
  getAccountSummary,
  listPaymentMethods,
  updateAccount,
} from '../api'
import {
  AccountSummary,
  AccountType,
  FinancialAccount,
  PaymentMethod,
} from '../types'
import { ToastService } from '../services/toast'
import { BankCombobox, BankLogo, getBankMeta } from '../components/ui'
import { CreditCard, Wallet } from '../components/ui/icons'

const ACCOUNT_LABELS: Record<AccountType, string> = {
  CURRENT: 'Current account',
  SAVINGS: 'Savings account',
  CASH: 'Cash',
  CREDIT_CARD: 'Credit account (legacy)',
}

const ACCOUNT_HELP: Record<AccountType, string> = {
  CURRENT: 'Money held in a current account. Supports an overdraft limit.',
  SAVINGS: 'Money held in a savings account.',
  CASH: 'Physical cash balance.',
  CREDIT_CARD: 'Existing credit account. New cards should be created under Payment methods.',
}

const CREATABLE_ACCOUNT_TYPES: AccountType[] = ['CURRENT', 'SAVINGS', 'CASH']

const today = () => new Date().toISOString().slice(0, 10)
const money = (value: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value)

export default function AccountsPage() {
  const [summary, setSummary] = useState<AccountSummary | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [type, setType] = useState<AccountType>('CURRENT')
  const [openingBalance, setOpeningBalance] = useState('0')
  const [overdraftLimit, setOverdraftLimit] = useState(0)
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null)

  const [fromAccountId, setFromAccountId] = useState<number | null>(null)
  const [toAccountId, setToAccountId] = useState<number | null>(null)
  const [transferAmount, setTransferAmount] = useState(0)
  const [transferDate, setTransferDate] = useState(today())
  const [transferDescription, setTransferDescription] = useState('')

  const [legacyAccountId, setLegacyAccountId] = useState<number | null>(null)
  const [legacyPaymentMethodId, setLegacyPaymentMethodId] = useState<number | null>(null)
  const [legacyStartDate, setLegacyStartDate] = useState('')
  const [legacyEndDate, setLegacyEndDate] = useState('')

  const cardBg = useColorModeValue('white', 'whiteAlpha.50')
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.150')
  const muted = useColorModeValue('gray.600', 'gray.400')
  const accountIconBg = useColorModeValue('gray.100', 'whiteAlpha.100')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [accountSummary, methods] = await Promise.all([
        getAccountSummary(),
        listPaymentMethods(),
      ])
      setSummary(accountSummary)
      setPaymentMethods(methods)
      const active = accountSummary.accounts.filter((account) => account.active)
      setFromAccountId((current) => current ?? active[0]?.id ?? null)
      setToAccountId((current) => current ?? active[1]?.id ?? null)
      setLegacyAccountId((current) => current ?? active[0]?.id ?? null)
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not load accounts',
        dedupeKey: 'accounts-page-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const activeAccounts = useMemo(
    () => summary?.accounts.filter((account) => account.active) ?? [],
    [summary],
  )

  const resetAccountForm = () => {
    setName('')
    setInstitution('')
    setType('CURRENT')
    setOpeningBalance('0')
    setOverdraftLimit(0)
    setEditingAccountId(null)
  }

  const editAccount = (account: FinancialAccount) => {
    setEditingAccountId(account.id)
    setName(account.name)
    setInstitution(account.institution ?? '')
    setType(account.type)
    setOpeningBalance(String(account.currentBalance))
    setOverdraftLimit(account.overdraftLimit)
  }

  const saveAccount = async () => {
    if (!name.trim()) return
    const parsedOpeningBalance = Number(openingBalance)
    if (openingBalance.trim() === '' || openingBalance === '-' || !Number.isFinite(parsedOpeningBalance)) {
      ToastService.error({
        title: 'Invalid current balance',
        description: 'Enter a valid number, for example -250.00.',
        dedupeKey: 'invalid-account-balance',
      })
      return
    }
    setSaving(true)
    try {
      const request = {
        name: name.trim(),
        institution: institution.trim() || null,
        type,
        currency: 'GBP',
        openingBalance: parsedOpeningBalance,
        overdraftLimit: type === 'CURRENT' ? overdraftLimit : 0,
        active: true,
      }
      if (editingAccountId) {
        await updateAccount(editingAccountId, request)
      } else {
        await createAccount(request)
      }
      const wasEditing = editingAccountId !== null
      resetAccountForm()
      await load()
      ToastService.success({
        title: wasEditing ? 'Account updated' : 'Account created',
        dedupeKey: wasEditing ? 'account-updated' : 'account-created',
      })
    } catch (err) {
      ToastService.apiError(err, {
        title: editingAccountId ? 'Could not update account' : 'Could not create account',
        dedupeKey: editingAccountId ? 'account-update-failed' : 'account-create-failed',
      })
    } finally {
      setSaving(false)
    }
  }

  const transfer = async () => {
    if (!fromAccountId || !toAccountId || transferAmount <= 0) return
    setSaving(true)
    try {
      await createAccountTransfer({
        fromAccountId,
        toAccountId,
        amount: transferAmount,
        transferDate,
        description: transferDescription.trim() || undefined,
      })
      setTransferAmount(0)
      setTransferDescription('')
      await load()
      ToastService.success({ title: 'Transfer recorded', dedupeKey: 'account-transfer-created' })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not transfer', dedupeKey: 'account-transfer-failed' })
    } finally {
      setSaving(false)
    }
  }

  const associateLegacy = async () => {
    if (!legacyAccountId) return
    const account = activeAccounts.find((item) => item.id === legacyAccountId)
    const hasFilter = Boolean(legacyPaymentMethodId || legacyStartDate || legacyEndDate)
    const message = hasFilter
      ? `Associate all matching unassigned transactions with ${account?.name ?? 'this account'}?`
      : `No filter is selected. This will associate every unassigned transaction with ${account?.name ?? 'this account'}. Continue?`
    if (!window.confirm(message)) return
    setSaving(true)
    try {
      const count = await assignLegacyTransactions(legacyAccountId, {
        paymentMethodId: legacyPaymentMethodId,
        startDate: legacyStartDate || undefined,
        endDate: legacyEndDate || undefined,
      })
      await load()
      ToastService.success({
        title: `${count} transaction${count === 1 ? '' : 's'} associated`,
        description: 'No transaction values or dates were changed.',
        dedupeKey: 'legacy-transactions-associated',
      })
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not associate transactions',
        dedupeKey: 'legacy-assignment-failed',
      })
    } finally {
      setSaving(false)
    }
  }

  const archive = async (account: FinancialAccount) => {
    try {
      await archiveAccount(account.id)
      await load()
      ToastService.success({ title: 'Account archived', dedupeKey: `account-archived:${account.id}` })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not archive account', dedupeKey: `account-archive-failed:${account.id}` })
    }
  }

  return (
    <Box maxW="1500px" mx="auto" px={{ base: 3, md: 6 }} py={{ base: 4, md: 7 }}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg">Accounts</Heading>
          <Text color={muted} mt={1}>
            Accounts hold money or debt. Payment methods describe how a transaction was paid.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total balance across active accounts</StatLabel>
                <StatNumber>{money(summary?.totalBalance ?? 0)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Legacy transactions not associated</StatLabel>
                <StatNumber>{summary?.unassignedTransactionCount ?? 0}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Your accounts</Heading>
                {activeAccounts.length === 0 && (
                  <Text color={muted}>{loading ? 'Loading...' : 'Create your first account below.'}</Text>
                )}
                {activeAccounts.map((account) => (
                  <VStack
                    key={account.id}
                    align="stretch"
                    p={4}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                  >
                    <HStack justify="space-between" align="flex-start">
                      <HStack align="flex-start" spacing={3} minW={0}>
                        {getBankMeta(account.institution) ? (
                          <BankLogo issuer={account.institution} size={38} borderRadius="10px" />
                        ) : (
                          <Box
                            p={2}
                            borderRadius="lg"
                            bg={accountIconBg}
                            flexShrink={0}
                          >
                            <Icon as={account.type === 'CREDIT_CARD' ? CreditCard : Wallet} boxSize={5} />
                          </Box>
                        )}
                        <Box minW={0}>
                          <HStack>
                            <Text fontWeight={800} noOfLines={1}>{account.name}</Text>
                            <Badge>{ACCOUNT_LABELS[account.type]}</Badge>
                          </HStack>
                          <Text fontSize="sm" color={muted}>{account.institution || 'No institution'}</Text>
                          <Text fontSize="xs" color={muted}>
                            Balance anchor: {new Date(account.balanceAnchorAt).toLocaleString('en-GB')}
                          </Text>
                        </Box>
                      </HStack>
                      <VStack align="flex-end" spacing={1}>
                        <Text
                          fontSize="xl"
                          fontWeight={900}
                          color={account.currentBalance < 0 ? 'red.500' : undefined}
                        >
                          {money(account.currentBalance, account.currency)}
                        </Text>
                        <HStack>
                          <Button size="xs" variant="ghost" onClick={() => editAccount(account)}>
                            Edit
                          </Button>
                          <Button size="xs" variant="ghost" colorScheme="red" onClick={() => archive(account)}>
                            Archive
                          </Button>
                        </HStack>
                      </VStack>
                    </HStack>

                    {account.type === 'CURRENT' && (
                      <Box pt={2}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight={700}>
                            Overdraft used: {money(account.overdraftUsed, account.currency)}
                          </Text>
                          <Badge
                            colorScheme={
                              account.overdraftUsed === 0
                                ? 'green'
                                : account.overdraftPercentageUsed >= 80
                                  ? 'red'
                                  : 'orange'
                            }
                          >
                            {account.overdraftLimit > 0
                              ? `${account.overdraftPercentageUsed.toFixed(0)}%`
                              : account.overdraftUsed > 0 ? 'No limit set' : 'Not in use'}
                          </Badge>
                        </HStack>
                        <Progress
                          value={Math.min(100, account.overdraftPercentageUsed)}
                          colorScheme={
                            account.overdraftUsed === 0
                              ? 'green'
                              : account.overdraftPercentageUsed >= 80
                                ? 'red'
                                : 'orange'
                          }
                          borderRadius="full"
                          size="sm"
                        />
                        <Text fontSize="xs" color={muted} mt={2}>
                          {account.overdraftLimit > 0
                            ? `${money(account.overdraftAvailable, account.currency)} available from ${money(account.overdraftLimit, account.currency)}`
                            : 'No overdraft facility configured'}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                ))}
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">{editingAccountId ? 'Edit account' : 'Add account'}</Heading>
                  {editingAccountId && (
                    <Button size="sm" variant="ghost" onClick={resetAccountForm}>Cancel</Button>
                  )}
                </HStack>
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    Create current, savings or cash accounts here. Credit cards and Monzo Flex
                    belong under Payment methods; choose here the account that pays their bill.
                  </AlertDescription>
                </Alert>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                  <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Monzo Current" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Bank or issuer</FormLabel>
                    <HStack>
                      {getBankMeta(institution) && (
                        <BankLogo issuer={institution} size={34} borderRadius="9px" />
                      )}
                      <Box flex={1}>
                        <BankCombobox
                          value={institution}
                          onChange={setInstitution}
                          size="md"
                          placeholder="Select bank or issuer"
                        />
                      </Box>
                    </HStack>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={type}
                      onChange={(event) => {
                        const nextType = event.target.value as AccountType
                        setType(nextType)
                        if (nextType !== 'CURRENT') setOverdraftLimit(0)
                      }}
                    >
                      {(type === 'CREDIT_CARD'
                        ? [...CREATABLE_ACCOUNT_TYPES, 'CREDIT_CARD' as AccountType]
                        : CREATABLE_ACCOUNT_TYPES
                      ).map((value) => (
                        <option key={value} value={value}>{ACCOUNT_LABELS[value]}</option>
                      ))}
                    </Select>
                    <FormHelperText>{ACCOUNT_HELP[type]}</FormHelperText>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Current balance</FormLabel>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={openingBalance}
                      onChange={(event) => {
                        const value = event.target.value.replace(',', '.')
                        if (/^-?\d*(\.\d{0,2})?$/.test(value)) {
                          setOpeningBalance(value)
                        }
                      }}
                      placeholder="-250.00"
                    />
                    <FormHelperText>
                      {editingAccountId
                        ? 'Updates the current balance without changing existing transactions or transfers.'
                        : 'Negative values are supported, for example -250 when using overdraft.'}
                    </FormHelperText>
                  </FormControl>
                  {type === 'CURRENT' && (
                    <FormControl>
                      <FormLabel>Overdraft limit</FormLabel>
                      <NumberInput
                        min={0}
                        precision={2}
                        value={overdraftLimit}
                        onChange={(_, value) => setOverdraftLimit(Number.isNaN(value) ? 0 : value)}
                      >
                        <NumberInputField />
                      </NumberInput>
                      <FormHelperText>Use 0 when the account has no overdraft facility.</FormHelperText>
                    </FormControl>
                  )}
                </SimpleGrid>
                <Button colorScheme="blue" onClick={saveAccount} isLoading={saving} isDisabled={!name.trim()}>
                  {editingAccountId ? 'Save account' : 'Create account'}
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Transfer between accounts</Heading>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                  <FormControl>
                    <FormLabel>From</FormLabel>
                    <Select value={fromAccountId ?? ''} onChange={(event) => setFromAccountId(Number(event.target.value) || null)}>
                      {activeAccounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>To</FormLabel>
                    <Select value={toAccountId ?? ''} onChange={(event) => setToAccountId(Number(event.target.value) || null)}>
                      {activeAccounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Amount</FormLabel>
                    <NumberInput min={0} precision={2} value={transferAmount} onChange={(_, value) => setTransferAmount(value || 0)}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Date</FormLabel>
                    <Input type="date" value={transferDate} onChange={(event) => setTransferDate(event.target.value)} />
                  </FormControl>
                </SimpleGrid>
                <Input value={transferDescription} onChange={(event) => setTransferDescription(event.target.value)} placeholder="Optional note" />
                <Button
                  colorScheme="teal"
                  onClick={transfer}
                  isLoading={saving}
                  isDisabled={!fromAccountId || !toAccountId || fromAccountId === toAccountId || transferAmount <= 0}
                >
                  Record transfer
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              {(summary?.unassignedTransactionCount ?? 0) === 0 ? (
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Legacy transactions</Heading>
                  <Alert status="success" variant="subtle" borderRadius="xl" alignItems="flex-start">
                    <AlertIcon mt={1} />
                    <Box>
                      <AlertTitle>You're up to date</AlertTitle>
                      <AlertDescription fontSize="sm">
                        All existing transactions are associated with an account. Nothing is left to review.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </VStack>
              ) : (
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Associate legacy transactions</Heading>
                  <Text fontSize="sm" color={muted}>
                    Only unassigned transactions are changed. Values, dates, categories, installments and recurring links remain intact.
                  </Text>
                  <FormControl>
                    <FormLabel>Target account</FormLabel>
                    <Select value={legacyAccountId ?? ''} onChange={(event) => setLegacyAccountId(Number(event.target.value) || null)}>
                      {activeAccounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Payment method filter (optional)</FormLabel>
                    <Select value={legacyPaymentMethodId ?? ''} onChange={(event) => setLegacyPaymentMethodId(Number(event.target.value) || null)}>
                      <option value="">All payment methods</option>
                      {paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
                    </Select>
                  </FormControl>
                  <SimpleGrid columns={2} spacing={3}>
                    <FormControl>
                      <FormLabel>From date</FormLabel>
                      <Input type="date" value={legacyStartDate} onChange={(event) => setLegacyStartDate(event.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>To date</FormLabel>
                      <Input type="date" value={legacyEndDate} onChange={(event) => setLegacyEndDate(event.target.value)} />
                    </FormControl>
                  </SimpleGrid>
                  <Button
                    colorScheme="orange"
                    onClick={associateLegacy}
                    isLoading={saving}
                    isDisabled={!legacyAccountId}
                  >
                    Associate matching transactions
                  </Button>
                </VStack>
              )}
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
