import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  FormControl,
  FormLabel,
  Grid,
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
  useColorModeValue,
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
import { PageHeader, SectionHeader } from '../../components/ui'
import {
  ArrowLeft,
  ArrowRight,
  Building,
  ChevronDown,
  DollarSign,
  Repeat,
  Wallet,
} from '../../components/ui/icons'
import { ToastService } from '../../services/toast'

const BALANCE_VISIBILITY_KEY = 'accounts:hide-balances'
const today = () => new Date().toISOString().slice(0, 10)
const money = (value: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value)

interface TransfersPageProps {
  onPageChange?: (page: AppPage) => void
}

interface TransferAccountSelectProps {
  accounts: FinancialAccount[]
  value: number | null
  onChange: (accountId: number) => void
  formatBalance: (value: number, currency?: string) => string
}

function TransferAccountSelect({
  accounts,
  value,
  onChange,
  formatBalance,
}: TransferAccountSelectProps) {
  const selected = accounts.find((account) => account.id === value)
  const menuBg = useColorModeValue('white', 'gray.800')
  const menuBorder = useColorModeValue('gray.200', 'gray.700')
  const balanceColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <Menu matchWidth>
      <MenuButton
        as={Button}
        w="full"
        h="44px"
        px={3}
        variant="outline"
        bg={menuBg}
        borderColor={menuBorder}
        rightIcon={<Icon as={ChevronDown} boxSize={4} />}
        textAlign="left"
        fontWeight={600}
      >
        <HStack justify="space-between" minW={0} spacing={3}>
          <Text fontSize="sm" noOfLines={1}>
            {selected?.name ?? 'Select account'}
          </Text>
          {selected && (
            <Text fontSize="xs" color={balanceColor} fontWeight={600} flexShrink={0}>
              {formatBalance(selected.currentBalance, selected.currency)}
            </Text>
          )}
        </HStack>
      </MenuButton>
      <MenuList minW="100%" bg={menuBg} borderColor={menuBorder} py={1}>
        {accounts.map((account) => (
          <MenuItem key={account.id} onClick={() => onChange(account.id)}>
            <HStack justify="space-between" w="full" minW={0} spacing={3}>
              <Text fontSize="sm" fontWeight={600} noOfLines={1}>
                {account.name}
              </Text>
              <Text fontSize="xs" color={balanceColor} fontWeight={600} flexShrink={0}>
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

  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const muted = useColorModeValue('gray.600', 'gray.400')
  const softBg = useColorModeValue('gray.50', 'rgba(255,255,255,0.03)')
  const fieldBg = useColorModeValue('white', 'whiteAlpha.50')
  const arrowBg = useColorModeValue('green.50', 'rgba(34,197,94,0.12)')

  const displayMoney = useCallback(
    (value: number, currency = 'GBP') =>
      hideBalances ? '••••••' : money(value, currency),
    [hideBalances],
  )

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
    <Box
      w="full"
      maxW="1800px"
      mx="auto"
      px={{ base: 2, md: 4, lg: 6, '2xl': 8 }}
      py={{ base: 4, md: 7 }}
    >
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        <PageHeader
          icon={Repeat}
          title="Transfers"
          subtitle="Move money between your accounts without changing income or expenses."
          rightSlot={
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Icon as={ArrowLeft} boxSize={4} />}
              onClick={() => onPageChange?.('accounts')}
              w={{ base: 'full', sm: 'auto' }}
            >
              Accounts
            </Button>
          }
        />

        <Grid
          templateColumns={{
            base: 'minmax(0, 1fr)',
            lg: 'minmax(0, 3fr) minmax(320px, 2fr)',
            '2xl': 'minmax(0, 2fr) minmax(420px, 1fr)',
          }}
          gap={{ base: 5, '2xl': 6 }}
          alignItems="start"
        >
          <Card
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack align="stretch" spacing={5}>
                <SectionHeader
                  icon={Repeat}
                  title="Transfer money"
                  caption="Choose the source, destination and amount"
                  accent="green"
                />

                {loading ? (
                  <HStack justify="center" py={12}>
                    <Spinner color="green.500" />
                  </HStack>
                ) : accounts.length < 2 ? (
                  <Alert status="info" borderRadius="xl">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      Create at least two active accounts before recording a transfer.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <SimpleGrid columns={{ base: 1, md: 7 }} spacing={3} alignItems="center">
                      <Box
                        gridColumn={{ md: 'span 3' }}
                        p={4}
                        bg={softBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="xl"
                      >
                        <HStack spacing={2} mb={2}>
                          <Icon as={Wallet} color="orange.500" boxSize={4} />
                          <Text fontSize="xs" fontWeight={800} color={muted}>
                            FROM ACCOUNT
                          </Text>
                        </HStack>
                        <TransferAccountSelect
                          accounts={accounts}
                          value={fromAccountId}
                          onChange={setFromAccountId}
                          formatBalance={displayMoney}
                        />
                      </Box>

                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        transform={{ base: 'rotate(90deg)', md: 'none' }}
                      >
                        <Box
                          w="36px"
                          h="36px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          borderRadius="full"
                          bg={arrowBg}
                          color="green.500"
                        >
                          <Icon as={ArrowRight} boxSize={4} />
                        </Box>
                      </Box>

                      <Box
                        gridColumn={{ md: 'span 3' }}
                        p={4}
                        bg={softBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="xl"
                      >
                        <HStack spacing={2} mb={2}>
                          <Icon as={Building} color="green.500" boxSize={4} />
                          <Text fontSize="xs" fontWeight={800} color={muted}>
                            TO ACCOUNT
                          </Text>
                        </HStack>
                        <TransferAccountSelect
                          accounts={accounts}
                          value={toAccountId}
                          onChange={setToAccountId}
                          formatBalance={displayMoney}
                        />
                      </Box>
                    </SimpleGrid>

                    {sameAccount && (
                      <Alert status="warning" borderRadius="xl">
                        <AlertIcon />
                        <AlertDescription fontSize="sm">
                          Choose two different accounts.
                        </AlertDescription>
                      </Alert>
                    )}

                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                      <FormControl position="relative">
                        <FormLabel>Amount</FormLabel>
                        <NumberInput
                          min={0}
                          precision={2}
                          value={amount}
                          onChange={setAmount}
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
                      <FormLabel>
                        Reference{' '}
                        <Text as="span" color={muted} fontWeight={400}>
                          (optional)
                        </Text>
                      </FormLabel>
                      <Input
                        bg={fieldBg}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="e.g. Monthly savings"
                      />
                    </FormControl>

                    <Button
                      h="48px"
                      colorScheme="teal"
                      borderRadius="xl"
                      leftIcon={<Icon as={Repeat} boxSize={4} />}
                      onClick={submitTransfer}
                      isLoading={saving}
                      isDisabled={
                        !fromAccountId ||
                        !toAccountId ||
                        sameAccount ||
                        !(parsedAmount > 0)
                      }
                    >
                      Transfer {parsedAmount > 0 ? money(parsedAmount) : 'money'}
                    </Button>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <CardBody p={{ base: 4, md: 5 }}>
              <VStack align="stretch" spacing={4}>
                <SectionHeader
                  icon={Repeat}
                  title="Recent transfers"
                  caption={`${transfers.length} recorded transfer${transfers.length !== 1 ? 's' : ''}`}
                  accent="blue"
                />
                <Divider />

                {loading ? (
                  <HStack justify="center" py={10}>
                    <Spinner size="sm" color="blue.500" />
                  </HStack>
                ) : transfers.length === 0 ? (
                  <Box py={10} textAlign="center">
                    <Text fontSize="sm" color={muted}>
                      No transfers recorded yet.
                    </Text>
                  </Box>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    {transfers.slice(0, 12).map((transfer) => (
                      <Box
                        key={transfer.id}
                        p={3}
                        bg={softBg}
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="xl"
                      >
                        <HStack justify="space-between" align="flex-start" spacing={3}>
                          <Box minW={0}>
                            <Text fontSize="sm" fontWeight={700} noOfLines={1}>
                              {transfer.fromAccountName}
                            </Text>
                            <HStack spacing={1} color={muted}>
                              <Icon as={ArrowRight} boxSize={3} />
                              <Text fontSize="xs" noOfLines={1}>
                                {transfer.toAccountName}
                              </Text>
                            </HStack>
                          </Box>
                          <Text fontSize="sm" fontWeight={800} color="green.600" flexShrink={0}>
                            {displayMoney(transfer.amount)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between" mt={2}>
                          <Text fontSize="2xs" color={muted} noOfLines={1}>
                            {transfer.description || 'No reference'}
                          </Text>
                          <Text fontSize="2xs" color={muted} flexShrink={0}>
                            {new Date(`${transfer.transferDate}T00:00:00`).toLocaleDateString('en-GB')}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </VStack>
    </Box>
  )
}
