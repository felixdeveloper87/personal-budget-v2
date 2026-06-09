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
  Collapse,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
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
  getAccountSummary,
  updateAccount,
} from '../api'
import {
  AccountSummary,
  AccountType,
  FinancialAccount,
} from '../types'
import { ToastService } from '../services/toast'
import { BankCombobox, BankLogo, SectionHeader, getBankMeta } from '../components/ui'
import PaymentMethodsSection from '../sections/PaymentMethodsSection'
import type { AppPage } from '../components/layout/header/navigation.config'
import {
  CreditCard,
  Eye,
  EyeOff,
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
const ACCOUNT_TYPE_ORDER: AccountType[] = ['CURRENT', 'SAVINGS', 'CASH', 'CREDIT_CARD']
const ACCOUNT_GROUP_LABELS: Record<AccountType, string> = {
  CURRENT: 'Current accounts',
  SAVINGS: 'Savings accounts',
  CASH: 'Cash',
  CREDIT_CARD: 'Legacy credit accounts',
}
const ACCOUNT_NAME_SUFFIX: Record<AccountType, string> = {
  CURRENT: 'Current',
  SAVINGS: 'Savings',
  CASH: 'Cash',
  CREDIT_CARD: 'Credit',
}

const BALANCE_VISIBILITY_KEY = 'accounts:hide-balances'
const money = (value: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value)
const accountName = (institution: string, type: AccountType) => {
  const issuer = institution.trim()
  if (type === 'CASH') return issuer ? `${issuer} Cash` : 'Cash'
  return issuer ? `${issuer} ${ACCOUNT_NAME_SUFFIX[type]}` : ''
}

interface AccountsPageProps {
  onPageChange?: (page: AppPage) => void
}

export default function AccountsPage({ onPageChange }: AccountsPageProps) {
  const [summary, setSummary] = useState<AccountSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hideBalances, setHideBalances] = useState(() => {
    try {
      return localStorage.getItem(BALANCE_VISIBILITY_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [showAccountForm, setShowAccountForm] = useState(false)

  const [institution, setInstitution] = useState('')
  const [type, setType] = useState<AccountType>('CURRENT')
  const [openingBalance, setOpeningBalance] = useState('0')
  const [overdraftLimit, setOverdraftLimit] = useState(0)
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null)

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
  const generatedAccountName = accountName(institution, type)

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

  const resetAccountForm = () => {
    setInstitution('')
    setType('CURRENT')
    setOpeningBalance('0')
    setOverdraftLimit(0)
    setEditingAccountId(null)
    setShowAccountForm(false)
  }

  const editAccount = (account: FinancialAccount) => {
    setEditingAccountId(account.id)
    setInstitution(account.institution ?? '')
    setType(account.type)
    setOpeningBalance(String(account.currentBalance))
    setOverdraftLimit(account.overdraftLimit)
    setShowAccountForm(true)
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
        <Flex
          justify="space-between"
          align={{ base: 'stretch', sm: 'center' }}
          direction={{ base: 'column', sm: 'row' }}
          gap={3}
        >
          <Box>
            <Heading size="lg" letterSpacing="-0.025em">Accounts</Heading>
            <Text color={muted} mt={1}>
              Manage balances, connected institutions and credit cards.
            </Text>
          </Box>
          <Button
            colorScheme="teal"
            leftIcon={<Icon as={Repeat} boxSize={4} />}
            onClick={() => onPageChange?.('transfers')}
            alignSelf={{ base: 'stretch', sm: 'center' }}
          >
            Transfer money
          </Button>
        </Flex>

        <Box>
          <Card border="1px solid" borderColor={borderColor} boxShadow="sm">
            <CardBody>
              <HStack justify="space-between" align="center">
                <Stat>
                  <StatLabel color={muted} fontWeight={700}>Total balance</StatLabel>
                  <StatNumber
                    mt={1}
                    fontSize={{ base: '2xl', md: '3xl' }}
                    letterSpacing="-0.035em"
                    color={!hideBalances && (summary?.totalBalance ?? 0) < 0 ? 'red.500' : undefined}
                  >
                    {displayMoney(summary?.totalBalance ?? 0)}
                  </StatNumber>
                  <Text fontSize="xs" color={muted} mt={1}>Across all active accounts</Text>
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
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} alignItems="start">
          <Card border="1px solid" borderColor={borderColor} boxShadow="sm">
            <CardBody p={{ base: 4, md: 5 }}>
              <VStack align="stretch" spacing={5}>
                <SectionHeader
                  icon={Wallet}
                  title="Your accounts"
                  caption={`${activeAccounts.length} active account${activeAccounts.length !== 1 ? 's' : ''}`}
                  accent="blue"
                />
                <Text fontSize="xs" color={muted}>
                  Live balances based on cleared account activity.
                </Text>
                {activeAccounts.length === 0 && (
                  <Box
                    py={6}
                    textAlign="center"
                    border="1px dashed"
                    borderColor={borderColor}
                    borderRadius="xl"
                  >
                    <Icon as={Wallet} boxSize={6} color={muted} mb={2} />
                    <Text fontSize="sm" color={muted}>
                      {loading ? 'Loading...' : 'No accounts yet.'}
                    </Text>
                  </Box>
                )}
                <VStack spacing={4} align="stretch">
                  {groupedAccounts.map((group) => (
                    <VStack key={group.type} spacing={2} align="stretch">
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

                      {group.accounts.map((account) => (
                        <VStack
                          key={account.id}
                          align="stretch"
                          spacing={2}
                          p={3}
                          bg={softBg}
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="xl"
                          transition="all 0.15s ease"
                          _hover={{ bg: fieldBg }}
                        >
                      <HStack justify="space-between">
                        <HStack spacing={3} minW={0}>
                          {getBankMeta(account.institution) ? (
                            <BankLogo issuer={account.institution} size={30} borderRadius="8px" />
                          ) : (
                            <Box
                              p={1.5}
                              borderRadius="lg"
                              bg={accountIconBg}
                              border="1px solid"
                              borderColor={borderColor}
                              flexShrink={0}
                            >
                              <Icon
                                as={account.type === 'CREDIT_CARD' ? CreditCard : Wallet}
                                boxSize={3.5}
                                color={muted}
                              />
                            </Box>
                          )}
                          <Box minW={0}>
                            <Text fontSize="sm" fontWeight={700} noOfLines={1}>
                              {account.name}
                            </Text>
                            <Text fontSize="xs" color={muted} noOfLines={1}>
                              {ACCOUNT_LABELS[account.type]}
                              {account.institution ? ` - ${account.institution}` : ''}
                            </Text>
                          </Box>
                        </HStack>

                        <HStack spacing={1} flexShrink={0}>
                          <Text
                            fontSize="sm"
                            fontWeight={800}
                            mr={1}
                            color={!hideBalances && account.currentBalance < 0 ? 'red.500' : undefined}
                          >
                            {displayMoney(account.currentBalance, account.currency)}
                          </Text>
                          <IconButton
                            aria-label={`Edit ${account.name}`}
                            icon={<Icon as={Pencil} boxSize={3.5} />}
                            size="xs"
                            variant="ghost"
                            onClick={() => editAccount(account)}
                          />
                          <IconButton
                            aria-label={`Archive ${account.name}`}
                            icon={<Icon as={Trash2} boxSize={3.5} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => archive(account)}
                          />
                        </HStack>
                      </HStack>

                      {account.type === 'CURRENT' && account.overdraftLimit > 0 && (
                        <Box pl="42px">
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="2xs" color={muted}>
                              Overdraft remaining
                            </Text>
                            <Text fontSize="2xs" color={muted}>
                              {hideBalances
                                ? 'Hidden'
                                : `${money(account.overdraftAvailable, account.currency)} of ${money(account.overdraftLimit, account.currency)}`}
                            </Text>
                          </HStack>
                          <Progress
                            value={
                              hideBalances
                                ? 0
                                : Math.max(0, 100 - Math.min(100, account.overdraftPercentageUsed))
                            }
                            size="xs"
                            borderRadius="full"
                            colorScheme="green"
                            opacity={0.7}
                          />
                        </Box>
                      )}
                        </VStack>
                      ))}
                    </VStack>
                  ))}
                </VStack>

                <Button
                  alignSelf="flex-start"
                  variant="ghost"
                  size="sm"
                  h="auto"
                  py={1.5}
                  px={2}
                  colorScheme="blue"
                  leftIcon={<Icon as={Plus} boxSize={3.5} />}
                  onClick={() => {
                    if (showAccountForm || editingAccountId !== null) {
                      resetAccountForm()
                    } else {
                      setShowAccountForm(true)
                    }
                  }}
                >
                  {showAccountForm || editingAccountId !== null ? 'Cancel' : 'Add new account'}
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <PaymentMethodsSection creditCardsOnly />

          {showAccountForm && (
            <Collapse in animateOpacity>
              <Card
                border="1px solid"
                borderColor={editingAccountId ? 'blue.300' : borderColor}
                overflow="hidden"
              >
            <Box
              px={{ base: 4, md: 5 }}
              py={4}
              bg={softBg}
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
                    bg={blueSoftBg}
                    color="blue.500"
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
            </Collapse>
          )}
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
