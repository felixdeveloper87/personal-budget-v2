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
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
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
  createAccount,
  createAccountTransfer,
  getAccountSummary,
  updateAccount,
} from '../api'
import {
  AccountSummary,
  AccountType,
  FinancialAccount,
} from '../types'
import { ToastService } from '../services/toast'
import { BankCombobox, BankLogo, getBankMeta } from '../components/ui'
import {
  ArrowRight,
  Building,
  CreditCard,
  DollarSign,
  Pencil,
  Plus,
  Repeat,
  Trash2,
  Wallet,
} from '../components/ui/icons'

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
const ACCOUNT_NAME_SUFFIX: Record<AccountType, string> = {
  CURRENT: 'Current',
  SAVINGS: 'Savings',
  CASH: 'Cash',
  CREDIT_CARD: 'Credit',
}

const today = () => new Date().toISOString().slice(0, 10)
const money = (value: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value)
const accountName = (institution: string, type: AccountType) => {
  const issuer = institution.trim()
  if (type === 'CASH') return issuer ? `${issuer} Cash` : 'Cash'
  return issuer ? `${issuer} ${ACCOUNT_NAME_SUFFIX[type]}` : ''
}

export default function AccountsPage() {
  const [summary, setSummary] = useState<AccountSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [institution, setInstitution] = useState('')
  const [type, setType] = useState<AccountType>('CURRENT')
  const [openingBalance, setOpeningBalance] = useState('0')
  const [overdraftLimit, setOverdraftLimit] = useState(0)
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null)

  const [fromAccountId, setFromAccountId] = useState<number | null>(null)
  const [toAccountId, setToAccountId] = useState<number | null>(null)
  const [transferAmount, setTransferAmount] = useState('')
  const [transferDate, setTransferDate] = useState(today())
  const [transferDescription, setTransferDescription] = useState('')

  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const muted = useColorModeValue('gray.600', 'gray.400')
  const accountIconBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const softBg = useColorModeValue('gray.50', 'rgba(255, 255, 255, 0.03)')
  const blueSoftBg = useColorModeValue('blue.50', 'whiteAlpha.100')
  const fieldBg = useColorModeValue('white', 'whiteAlpha.50')
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const accountSummary = await getAccountSummary()
      setSummary(accountSummary)
      const active = accountSummary.accounts.filter((account) => account.active)
      setFromAccountId((current) => current ?? active[0]?.id ?? null)
      setToAccountId((current) => current ?? active[1]?.id ?? null)
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
  const generatedAccountName = accountName(institution, type)

  const resetAccountForm = () => {
    setInstitution('')
    setType('CURRENT')
    setOpeningBalance('0')
    setOverdraftLimit(0)
    setEditingAccountId(null)
  }

  const editAccount = (account: FinancialAccount) => {
    setEditingAccountId(account.id)
    setInstitution(account.institution ?? '')
    setType(account.type)
    setOpeningBalance(String(account.currentBalance))
    setOverdraftLimit(account.overdraftLimit)
  }

  const saveAccount = async () => {
    if (!generatedAccountName) return
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
        name: generatedAccountName,
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
    const amount = parseFloat(transferAmount)
    if (!fromAccountId || !toAccountId || !(amount > 0)) return
    setSaving(true)
    try {
      await createAccountTransfer({
        fromAccountId,
        toAccountId,
        amount,
        transferDate,
        description: transferDescription.trim() || undefined,
      })
      setTransferAmount('')
      setTransferDescription('')
      await load()
      ToastService.success({ title: 'Transfer recorded', dedupeKey: 'account-transfer-created' })
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not transfer', dedupeKey: 'account-transfer-failed' })
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
    <Box w="full" maxW="1400px" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <VStack align="stretch" spacing={7}>
        <Box>
          <Heading size="lg" letterSpacing="-0.025em">Accounts</Heading>
          <Text color={muted} mt={1}>
            Manage balances, connected institutions and movement between your accounts.
          </Text>
        </Box>

        <Box>
          <Card overflow="hidden" position="relative">
            <Box
              position="absolute"
              inset={0}
              bgGradient="linear(to-r, blue.50, transparent)"
              _dark={{ bgGradient: 'linear(to-r, whiteAlpha.100, transparent)' }}
              pointerEvents="none"
            />
            <CardBody position="relative">
              <HStack justify="space-between" align="center">
                <Stat>
                  <StatLabel color={muted} fontWeight={700}>Total balance</StatLabel>
                  <StatNumber
                    mt={1}
                    fontSize={{ base: '2xl', md: '3xl' }}
                    letterSpacing="-0.035em"
                    color={(summary?.totalBalance ?? 0) < 0 ? 'red.500' : undefined}
                  >
                    {money(summary?.totalBalance ?? 0)}
                  </StatNumber>
                  <Text fontSize="xs" color={muted} mt={1}>Across all active accounts</Text>
                </Stat>
                <Flex
                  w="48px"
                  h="48px"
                  align="center"
                  justify="center"
                  borderRadius="2xl"
                  bg={blueSoftBg}
                  color="blue.500"
                  flexShrink={0}
                >
                  <Icon as={Wallet} boxSize={6} weight="duotone" />
                </Flex>
              </HStack>
            </CardBody>
          </Card>
        </Box>

        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6} alignItems="start">
          <Card>
            <CardBody p={{ base: 4, md: 5 }}>
              <VStack align="stretch" spacing={5}>
                <HStack justify="space-between">
                  <Box>
                    <Heading size="md" letterSpacing="-0.02em">Your accounts</Heading>
                    <Text fontSize="sm" color={muted} mt={1}>
                      Live balances based on cleared account activity.
                    </Text>
                  </Box>
                  <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                    {activeAccounts.length} active
                  </Badge>
                </HStack>
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
                    borderRadius="2xl"
                    bg={softBg}
                    transition="transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease"
                    _hover={{
                      transform: 'translateY(-2px)',
                      borderColor: 'blue.200',
                      boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
                    }}
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
                          letterSpacing="-0.025em"
                          color={account.currentBalance < 0 ? 'red.500' : undefined}
                        >
                          {money(account.currentBalance, account.currency)}
                        </Text>
                        <HStack>
                          <Button
                            size="xs"
                            variant="ghost"
                            leftIcon={<Icon as={Pencil} boxSize={3.5} />}
                            onClick={() => editAccount(account)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            leftIcon={<Icon as={Trash2} boxSize={3.5} />}
                            onClick={() => archive(account)}
                          >
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

          <Card
            border="1px solid"
            borderColor={editingAccountId ? 'blue.300' : borderColor}
            overflow="hidden"
          >
            <Box
              px={{ base: 4, md: 5 }}
              py={4}
              bgGradient="linear(to-r, blue.50, purple.50)"
              _dark={{ bgGradient: 'linear(to-r, whiteAlpha.100, transparent)' }}
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Flex
                    w="42px"
                    h="42px"
                    align="center"
                    justify="center"
                    borderRadius="xl"
                    bg="blue.500"
                    color="white"
                    boxShadow="0 8px 18px rgba(37, 99, 235, 0.22)"
                  >
                    <Icon as={editingAccountId ? Pencil : Plus} boxSize={5} weight="bold" />
                  </Flex>
                  <Box>
                    <Heading size="md" letterSpacing="-0.02em">
                      {editingAccountId ? 'Edit account' : 'Add a new account'}
                    </Heading>
                    <Text fontSize="sm" color={muted} mt={0.5}>
                      {editingAccountId
                        ? 'Update the account details and reconcile its balance.'
                        : 'Connect the places where you keep or manage money.'}
                    </Text>
                  </Box>
                </HStack>
                  {editingAccountId && (
                    <Button size="sm" variant="ghost" onClick={resetAccountForm}>Cancel</Button>
                  )}
              </HStack>
            </Box>
            <CardBody p={{ base: 4, md: 5 }}>
              <VStack align="stretch" spacing={5}>
                <Alert
                  status="info"
                  variant="left-accent"
                  borderRadius="xl"
                  bg={blueSoftBg}
                  alignItems="flex-start"
                >
                  <AlertIcon mt={0.5} />
                  <Box>
                    <AlertTitle fontSize="sm">Balance accounts only</AlertTitle>
                    <AlertDescription fontSize="sm" color={muted}>
                      Credit cards belong under Payment methods. Add here the
                      current, savings or cash account that settles those payments.
                    </AlertDescription>
                  </Box>
                </Alert>

                <Box>
                  <Text
                    fontSize="xs"
                    fontWeight={800}
                    color={muted}
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    mb={3}
                  >
                    Account details
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl isRequired={type !== 'CASH'}>
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
                    <FormHelperText>
                      {type === 'CASH'
                        ? 'Optional for physical cash.'
                        : 'Used together with the account type to generate its name.'}
                    </FormHelperText>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Type</FormLabel>
                    <Select
                      bg={fieldBg}
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
                  <FormControl gridColumn={{ sm: '1 / -1' }}>
                    <FormLabel>Account name</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={Wallet} color={muted} boxSize={4} />
                      </InputLeftElement>
                      <Input
                        bg={softBg}
                        value={generatedAccountName}
                        placeholder="Select a bank or issuer"
                        isReadOnly
                        fontWeight={700}
                      />
                    </InputGroup>
                    <FormHelperText>
                      Generated automatically from the bank or issuer and account type.
                    </FormHelperText>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Current balance</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none" color={muted} fontWeight={700}>
                        £
                      </InputLeftElement>
                      <Input
                        bg={fieldBg}
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
                    </InputGroup>
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
                        <NumberInputField bg={fieldBg} pl={8} />
                      </NumberInput>
                      <FormHelperText>Use 0 when the account has no overdraft facility.</FormHelperText>
                    </FormControl>
                  )}
                  </SimpleGrid>
                </Box>

                <Divider />

                <Button
                  h="48px"
                  bgGradient="linear(to-r, blue.500, purple.500)"
                  color="white"
                  leftIcon={<Icon as={editingAccountId ? Pencil : Plus} boxSize={4} />}
                  onClick={saveAccount}
                  isLoading={saving}
                  isDisabled={!generatedAccountName}
                  _hover={{
                    bgGradient: 'linear(to-r, blue.600, purple.600)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 10px 22px rgba(37, 99, 235, 0.24)',
                  }}
                  _active={{ transform: 'translateY(0)' }}
                >
                  {editingAccountId ? 'Save account changes' : 'Create account'}
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Box>
          <Card
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Box
              px={{ base: 4, md: 5 }}
              py={4}
              bgGradient="linear(to-r, teal.50, blue.50)"
              _dark={{ bgGradient: 'linear(to-r, whiteAlpha.100, transparent)' }}
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <HStack spacing={3}>
                <Flex
                  w="42px"
                  h="42px"
                  align="center"
                  justify="center"
                  borderRadius="xl"
                  bg="teal.500"
                  color="white"
                  boxShadow="0 8px 18px rgba(13, 148, 136, 0.22)"
                >
                  <Icon as={Repeat} boxSize={5} weight="bold" />
                </Flex>
                <Box>
                  <Heading size="md" letterSpacing="-0.02em">Transfer money</Heading>
                  <Text fontSize="sm" color={muted} mt={0.5}>
                    Move funds without creating income or expense records.
                  </Text>
                </Box>
              </HStack>
            </Box>
            <CardBody p={{ base: 4, md: 5 }}>
              <VStack align="stretch" spacing={5}>
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align={{ base: 'stretch', sm: 'center' }}
                  gap={3}
                >
                  <Box
                    flex={1}
                    p={4}
                    bg={softBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                  >
                    <HStack spacing={2} mb={3}>
                      <Icon as={Wallet} color="orange.500" boxSize={4} weight="duotone" />
                      <Text
                        fontSize="xs"
                        fontWeight={800}
                        color={muted}
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                      >
                        From account
                      </Text>
                    </HStack>
                    <Select
                      bg={fieldBg}
                      value={fromAccountId ?? ''}
                      onChange={(event) => setFromAccountId(Number(event.target.value) || null)}
                    >
                      {activeAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} - {money(account.currentBalance, account.currency)}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Flex
                    w={{ base: '40px', sm: '44px' }}
                    h={{ base: '40px', sm: '44px' }}
                    align="center"
                    justify="center"
                    alignSelf="center"
                    borderRadius="full"
                    bg={blueSoftBg}
                    color="blue.500"
                    flexShrink={0}
                    transform={{ base: 'rotate(90deg)', sm: 'none' }}
                  >
                    <Icon as={ArrowRight} boxSize={5} weight="bold" />
                  </Flex>

                  <Box
                    flex={1}
                    p={4}
                    bg={softBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                  >
                    <HStack spacing={2} mb={3}>
                      <Icon as={Building} color="green.500" boxSize={4} weight="duotone" />
                      <Text
                        fontSize="xs"
                        fontWeight={800}
                        color={muted}
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                      >
                        To account
                      </Text>
                    </HStack>
                    <Select
                      bg={fieldBg}
                      value={toAccountId ?? ''}
                      onChange={(event) => setToAccountId(Number(event.target.value) || null)}
                    >
                      {activeAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} - {money(account.currentBalance, account.currency)}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </Flex>

                {fromAccountId && toAccountId && fromAccountId === toAccountId && (
                  <Alert status="warning" borderRadius="xl">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      Choose two different accounts to record a transfer.
                    </AlertDescription>
                  </Alert>
                )}

                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl position="relative">
                    <FormLabel>Amount</FormLabel>
                    <NumberInput
                      min={0}
                      precision={2}
                      value={transferAmount}
                      onChange={(valueString) => setTransferAmount(valueString)}
                    >
                      <NumberInputField bg={fieldBg} pl={9} />
                    </NumberInput>
                    <Icon
                      as={DollarSign}
                      position="absolute"
                      left={3}
                      bottom="13px"
                      color={muted}
                      boxSize={4}
                      pointerEvents="none"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Transfer date</FormLabel>
                    <Input
                      bg={fieldBg}
                      type="date"
                      value={transferDate}
                      onChange={(event) => setTransferDate(event.target.value)}
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Reference <Text as="span" color={muted} fontWeight={400}>(optional)</Text></FormLabel>
                  <Input
                    bg={fieldBg}
                    value={transferDescription}
                    onChange={(event) => setTransferDescription(event.target.value)}
                    placeholder="e.g. Monthly savings"
                  />
                </FormControl>

                <Divider />

                <Button
                  h="48px"
                  colorScheme="teal"
                  leftIcon={<Icon as={Repeat} boxSize={4} />}
                  onClick={transfer}
                  isLoading={saving}
                  isDisabled={!fromAccountId || !toAccountId || fromAccountId === toAccountId || !(parseFloat(transferAmount) > 0)}
                >
                  Transfer {parseFloat(transferAmount) > 0 ? money(parseFloat(transferAmount)) : 'money'}
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </VStack>
    </Box>
  )
}
