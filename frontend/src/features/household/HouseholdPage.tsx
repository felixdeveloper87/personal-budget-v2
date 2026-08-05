import { FormEvent, useCallback, useEffect, useState } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
  type BoxProps,
} from '@chakra-ui/react'
import {
  acceptHouseholdInvitation,
  cancelHouseholdSettlement,
  confirmHouseholdSettlement,
  createHousehold,
  createHouseholdExpense,
  createHouseholdSettlement,
  declineHouseholdInvitation,
  deleteHouseholdExpense,
  getHouseholdPage,
  inviteHouseholdMember,
  rejectHouseholdSettlement,
  removeHouseholdMember,
  revokeHouseholdInvitation,
  updateHousehold,
  updateHouseholdExpense,
} from '../../api'
import { useEd } from '../../editorial'
import { ToastService } from '../../services/toast'
import type {
  HouseholdDashboard,
  HouseholdDebt,
  HouseholdExpense,
  HouseholdExpenseRequest,
  HouseholdPageState,
} from '../../types'
import {
  Check,
  Gear,
  Home,
  Mail,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Trash2,
  Wallet,
  X,
} from '../../components/ui/icons'

const CATEGORIES = [
  'Electricity',
  'Water',
  'Gas',
  'Internet',
  'Groceries',
  'Cleaning',
  'Rent',
  'Council tax',
  'Repairs',
  'Other',
] as const

const today = () => {
  const value = new Date()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${value.getFullYear()}-${month}-${day}`
}

const money = (value: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value)

const dateLabel = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

function Surface({
  children,
  ...props
}: BoxProps) {
  const ed = useEd()
  const fallbackBg = useColorModeValue('white', 'gray.900')
  const fallbackBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  return (
    <Box
      bg={ed?.panel ?? fallbackBg}
      border="1px solid"
      borderColor={ed?.line ?? fallbackBorder}
      borderRadius="2xl"
      boxShadow={ed ? 'none' : 'sm'}
      {...props}
    >
      {children}
    </Box>
  )
}

export default function HouseholdPage() {
  const ed = useEd()
  const mutedFallback = useColorModeValue('gray.600', 'gray.400')
  const muted = ed?.muted ?? mutedFallback
  const [page, setPage] = useState<HouseholdPageState | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [householdName, setHouseholdName] = useState('Our home')
  const [editingExpense, setEditingExpense] = useState<HouseholdExpense | null>(null)
  const [settlingDebt, setSettlingDebt] = useState<HouseholdDebt | null>(null)
  const expenseModal = useDisclosure()
  const membersModal = useDisclosure()
  const settlementModal = useDisclosure()

  const load = useCallback(async () => {
    setLoading(true)
    setLoadFailed(false)
    try {
      setPage(await getHouseholdPage())
    } catch (error) {
      setLoadFailed(true)
      ToastService.apiError(error, {
        title: 'Could not load your household',
        dedupeKey: 'household-load',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const applyAction = async (
    key: string,
    action: () => Promise<HouseholdPageState>,
    success?: string,
  ) => {
    setBusyAction(key)
    try {
      const next = await action()
      setPage(next)
      if (success) {
        ToastService.success({ title: success, dedupeKey: `household:${key}` })
      }
      return true
    } catch (error) {
      ToastService.apiError(error, {
        title: 'Could not complete that household action',
        dedupeKey: `household:${key}:failed`,
      })
      return false
    } finally {
      setBusyAction(null)
    }
  }

  const openNewExpense = () => {
    setEditingExpense(null)
    expenseModal.onOpen()
  }

  const openEditExpense = (expense: HouseholdExpense) => {
    setEditingExpense(expense)
    expenseModal.onOpen()
  }

  const openSettlement = (debt: HouseholdDebt) => {
    setSettlingDebt(debt)
    settlementModal.onOpen()
  }

  if (loading) {
    return (
      <Box minH="55vh" display="grid" placeItems="center">
        <VStack spacing={3}>
          <Spinner color={ed?.jade ?? 'teal.500'} thickness="3px" />
          <Text color={muted} fontSize="sm">Loading household…</Text>
        </VStack>
      </Box>
    )
  }

  if (loadFailed || !page) {
    return (
      <Box maxW="720px" mx="auto" px={4} py={16}>
        <Surface p={8} textAlign="center">
          <VStack spacing={4}>
            <Icon as={Home} boxSize={9} color={muted} />
            <Heading size="md">We could not open Household</Heading>
            <Text color={muted}>Try loading the shared ledger again.</Text>
            <Button leftIcon={<RefreshCw size={17} />} onClick={() => void load()}>
              Try again
            </Button>
          </VStack>
        </Surface>
      </Box>
    )
  }

  if (!page.household) {
    return (
      <Box maxW="900px" mx="auto" px={{ base: 3, md: 6 }} py={{ base: 5, md: 10 }}>
        <VStack align="stretch" spacing={6}>
          <Box>
            <Text
              color={ed?.gold ?? 'orange.500'}
              fontSize="xs"
              fontWeight={800}
              letterSpacing="0.16em"
              textTransform="uppercase"
            >
              Shared living
            </Text>
            <Heading mt={2} size={{ base: 'xl', md: '2xl' }}>
              Create your Household
            </Heading>
            <Text mt={3} color={muted} maxW="620px">
              Split home expenses, see exactly who owes whom, and record payments without
              mixing reimbursements into personal income.
            </Text>
          </Box>

          {page.pendingInvitations.length > 0 && (
            <Surface p={{ base: 4, md: 6 }}>
              <VStack align="stretch" spacing={4}>
                <Heading size="sm">Household invitations</Heading>
                {page.pendingInvitations.map((invitation) => (
                  <Stack
                    key={invitation.id}
                    direction={{ base: 'column', sm: 'row' }}
                    justify="space-between"
                    align={{ base: 'stretch', sm: 'center' }}
                    p={4}
                    borderRadius="xl"
                    bg={ed?.panelRaised ?? 'blackAlpha.50'}
                  >
                    <Box>
                      <Text fontWeight={800}>{invitation.householdName}</Text>
                      <Text color={muted} fontSize="sm">
                        Invited by {invitation.invitedByName}
                      </Text>
                    </Box>
                    <HStack>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        isLoading={busyAction === `accept-${invitation.id}`}
                        onClick={() => void applyAction(
                          `accept-${invitation.id}`,
                          () => acceptHouseholdInvitation(invitation.id),
                          'Household joined',
                        )}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        isLoading={busyAction === `decline-${invitation.id}`}
                        onClick={() => void applyAction(
                          `decline-${invitation.id}`,
                          () => declineHouseholdInvitation(invitation.id),
                        )}
                      >
                        Decline
                      </Button>
                    </HStack>
                  </Stack>
                ))}
              </VStack>
            </Surface>
          )}

          <Surface p={{ base: 5, md: 7 }}>
            <VStack
              as="form"
              align="stretch"
              spacing={4}
              onSubmit={(event: FormEvent) => {
                event.preventDefault()
                void applyAction(
                  'create-household',
                  () => createHousehold(householdName),
                  'Household created',
                )
              }}
            >
              <HStack>
                <Box
                  w={11}
                  h={11}
                  display="grid"
                  placeItems="center"
                  borderRadius="xl"
                  bg={ed?.jadeSoft ?? 'teal.50'}
                  color={ed?.jade ?? 'teal.600'}
                >
                  <Home size={22} weight="duotone" />
                </Box>
                <Box>
                  <Heading size="md">Start a household</Heading>
                  <Text color={muted} fontSize="sm">You will be the owner.</Text>
                </Box>
              </HStack>
              <FormControl isRequired>
                <FormLabel>Household name</FormLabel>
                <Input
                  value={householdName}
                  maxLength={120}
                  onChange={(event) => setHouseholdName(event.target.value)}
                  placeholder="e.g. Our home"
                />
              </FormControl>
              <Button
                type="submit"
                alignSelf="flex-start"
                colorScheme="teal"
                leftIcon={<Plus size={17} />}
                isLoading={busyAction === 'create-household'}
              >
                Create Household
              </Button>
            </VStack>
          </Surface>
        </VStack>
      </Box>
    )
  }

  const household = page.household
  const balance = household.currentUserBalance
  const balanceLabel = balance > 0
    ? 'You are owed'
    : balance < 0
      ? 'You owe'
      : 'You are settled'
  const balanceColor = balance > 0
    ? (ed?.jade ?? 'green.500')
    : balance < 0
      ? (ed?.red ?? 'red.500')
      : muted

  return (
    <Box maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>
      <VStack align="stretch" spacing={{ base: 4, md: 6 }}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'center' }}
          justify="space-between"
          spacing={4}
        >
          <HStack spacing={4}>
            <Box
              w={{ base: 11, md: 13 }}
              h={{ base: 11, md: 13 }}
              flexShrink={0}
              display="grid"
              placeItems="center"
              borderRadius="2xl"
              bg={ed?.jadeSoft ?? 'teal.50'}
              color={ed?.jade ?? 'teal.600'}
              border="1px solid"
              borderColor={ed?.line ?? 'teal.100'}
            >
              <Home size={25} weight="duotone" />
            </Box>
            <Box minW={0}>
              <Text
                color={ed?.gold ?? 'orange.500'}
                fontSize="10px"
                fontWeight={800}
                letterSpacing="0.18em"
                textTransform="uppercase"
              >
                Household
              </Text>
              <Heading size={{ base: 'lg', md: 'xl' }} noOfLines={1}>{household.name}</Heading>
              <Text color={muted} fontSize="sm">
                {household.members.length} active member{household.members.length === 1 ? '' : 's'}
              </Text>
            </Box>
          </HStack>
          <HStack>
            {household.currentMemberRole === 'OWNER' && (
              <Button
                variant="outline"
                leftIcon={<Gear size={17} />}
                onClick={membersModal.onOpen}
              >
                Manage
              </Button>
            )}
            <Button colorScheme="teal" leftIcon={<Plus size={17} />} onClick={openNewExpense}>
              Add expense
            </Button>
          </HStack>
        </Stack>

        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
          <Surface p={5}>
            <Text color={muted} fontSize="xs" fontWeight={800} textTransform="uppercase">
              {balanceLabel}
            </Text>
            <Text mt={2} fontSize={{ base: '3xl', lg: '4xl' }} fontWeight={800} color={balanceColor}>
              {money(Math.abs(balance), household.currency)}
            </Text>
            <Text mt={1} color={muted} fontSize="sm">Confirmed shared balance</Text>
          </Surface>
          <Surface p={5}>
            <Text color={muted} fontSize="xs" fontWeight={800} textTransform="uppercase">
              Spent this month
            </Text>
            <Text mt={2} fontSize={{ base: '3xl', lg: '4xl' }} fontWeight={800}>
              {money(household.monthSpend, household.currency)}
            </Text>
            <Text mt={1} color={muted} fontSize="sm">Across the whole household</Text>
          </Surface>
          <Surface p={5}>
            <Text color={muted} fontSize="xs" fontWeight={800} textTransform="uppercase">
              Shared expenses
            </Text>
            <Text mt={2} fontSize={{ base: '3xl', lg: '4xl' }} fontWeight={800}>
              {household.expenses.length}
            </Text>
            <Text mt={1} color={muted} fontSize="sm">Recent active records</Text>
          </Surface>
        </SimpleGrid>

        <Grid templateColumns={{ base: '1fr', xl: '1.1fr 0.9fr' }} gap={5}>
          <Surface p={{ base: 4, md: 6 }}>
            <HStack justify="space-between" mb={4}>
              <Box>
                <Heading size="md">Who owes whom</Heading>
                <Text color={muted} fontSize="sm">Bilateral balances after confirmed payments.</Text>
              </Box>
              <Wallet size={22} color={ed?.gold ?? undefined} />
            </HStack>
            {household.debts.length === 0 ? (
              <VStack py={8} spacing={3}>
                <Box
                  w={10}
                  h={10}
                  display="grid"
                  placeItems="center"
                  borderRadius="full"
                  bg={ed?.jadeSoft ?? 'green.50'}
                  color={ed?.jade ?? 'green.600'}
                >
                  <Check size={20} weight="bold" />
                </Box>
                <Text fontWeight={800}>Everyone is settled</Text>
                <Text color={muted} fontSize="sm">There are no outstanding household debts.</Text>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={3}>
                {household.debts.map((debt) => {
                  const youPay = debt.fromMemberId === household.currentMemberId
                  const youReceive = debt.toMemberId === household.currentMemberId
                  return (
                    <Stack
                      key={`${debt.fromMemberId}-${debt.toMemberId}`}
                      direction={{ base: 'column', sm: 'row' }}
                      align={{ base: 'stretch', sm: 'center' }}
                      justify="space-between"
                      p={4}
                      borderRadius="xl"
                      bg={ed?.panelRaised ?? 'blackAlpha.50'}
                      border="1px solid"
                      borderColor={ed?.line ?? 'blackAlpha.100'}
                    >
                      <HStack>
                        <Avatar size="sm" name={debt.fromMemberName} />
                        <Box>
                          <Text fontWeight={800}>
                            {youPay ? 'You' : debt.fromMemberName}
                            {' owe '}
                            {youReceive ? 'you' : debt.toMemberName}
                          </Text>
                          <Text color={muted} fontSize="sm">
                            {youPay ? 'Record a payment after you send it.' : 'Outstanding balance'}
                          </Text>
                        </Box>
                      </HStack>
                      <HStack justify={{ base: 'space-between', sm: 'flex-end' }}>
                        <Text fontWeight={900} fontSize="lg">
                          {money(debt.amount, household.currency)}
                        </Text>
                        {youPay && (
                          <Button size="sm" colorScheme="teal" onClick={() => openSettlement(debt)}>
                            Record payment
                          </Button>
                        )}
                      </HStack>
                    </Stack>
                  )
                })}
              </VStack>
            )}
          </Surface>

          <Surface p={{ base: 4, md: 6 }}>
            <Heading size="md">Members</Heading>
            <Text color={muted} fontSize="sm" mb={4}>Paid, assigned share, and net position.</Text>
            <VStack align="stretch" spacing={3}>
              {household.members.map((member) => (
                <Box
                  key={member.id}
                  p={4}
                  borderRadius="xl"
                  bg={ed?.panelRaised ?? 'blackAlpha.50'}
                >
                  <HStack justify="space-between" align="flex-start">
                    <HStack minW={0}>
                      <Avatar size="sm" name={member.name} />
                      <Box minW={0}>
                        <HStack>
                          <Text fontWeight={800} noOfLines={1}>{member.name}</Text>
                          {member.role === 'OWNER' && <Badge colorScheme="purple">Owner</Badge>}
                        </HStack>
                        <Text color={muted} fontSize="xs" noOfLines={1}>{member.email}</Text>
                      </Box>
                    </HStack>
                    <Text
                      fontWeight={900}
                      color={member.balance > 0
                        ? (ed?.jade ?? 'green.500')
                        : member.balance < 0
                          ? (ed?.red ?? 'red.500')
                          : muted}
                    >
                      {member.balance > 0 ? '+' : ''}
                      {money(member.balance, household.currency)}
                    </Text>
                  </HStack>
                  <HStack mt={3} color={muted} fontSize="xs" justify="space-between">
                    <Text>Paid {money(member.totalPaid, household.currency)}</Text>
                    <Text>Share {money(member.totalShare, household.currency)}</Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Surface>
        </Grid>

        <Surface overflow="hidden">
          <HStack justify="space-between" px={{ base: 4, md: 6 }} py={5}>
            <Box>
              <Heading size="md">Recent expenses</Heading>
              <Text color={muted} fontSize="sm">Each split is saved with the expense.</Text>
            </Box>
            <ReceiptText size={22} color={ed?.gold ?? undefined} />
          </HStack>
          <Divider borderColor={ed?.line} />
          {household.expenses.length === 0 ? (
            <VStack py={12} spacing={3}>
              <ReceiptText size={28} color={muted} />
              <Text fontWeight={800}>No shared expenses yet</Text>
              <Button size="sm" leftIcon={<Plus size={16} />} onClick={openNewExpense}>
                Add the first expense
              </Button>
            </VStack>
          ) : (
            <VStack align="stretch" spacing={0}>
              {household.expenses.map((expense, index) => (
                <HStack
                  key={expense.id}
                  px={{ base: 4, md: 6 }}
                  py={4}
                  justify="space-between"
                  borderTop={index === 0 ? 'none' : '1px solid'}
                  borderColor={ed?.line ?? 'blackAlpha.100'}
                >
                  <HStack minW={0}>
                    <Box
                      w={10}
                      h={10}
                      flexShrink={0}
                      display="grid"
                      placeItems="center"
                      borderRadius="xl"
                      bg={ed?.jadeSoft ?? 'teal.50'}
                      color={ed?.jade ?? 'teal.600'}
                    >
                      <ReceiptText size={18} weight="duotone" />
                    </Box>
                    <Box minW={0}>
                      <Text fontWeight={800} noOfLines={1}>{expense.description}</Text>
                      <Text color={muted} fontSize="xs" noOfLines={1}>
                        {expense.category} · paid by {expense.payerName} · {dateLabel(expense.expenseDate)}
                      </Text>
                    </Box>
                  </HStack>
                  <HStack flexShrink={0}>
                    <Box textAlign="right">
                      <Text fontWeight={900}>{money(expense.amount, household.currency)}</Text>
                      <Text color={muted} fontSize="xs">{expense.shares.length} shares</Text>
                    </Box>
                    {expense.canEdit && (
                      <IconButton
                        aria-label={`Edit ${expense.description}`}
                        icon={<Pencil size={16} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditExpense(expense)}
                      />
                    )}
                  </HStack>
                </HStack>
              ))}
            </VStack>
          )}
        </Surface>

        <Surface overflow="hidden">
          <HStack justify="space-between" px={{ base: 4, md: 6 }} py={5}>
            <Box>
              <Heading size="md">Payments and confirmations</Heading>
              <Text color={muted} fontSize="sm">Only confirmed payments change balances.</Text>
            </Box>
            <Mail size={22} color={ed?.gold ?? undefined} />
          </HStack>
          <Divider borderColor={ed?.line} />
          {household.settlements.length === 0 ? (
            <Text color={muted} textAlign="center" py={10}>No payments recorded yet.</Text>
          ) : (
            <VStack align="stretch" spacing={0}>
              {household.settlements.map((settlement, index) => (
                <Stack
                  key={settlement.id}
                  direction={{ base: 'column', md: 'row' }}
                  align={{ base: 'stretch', md: 'center' }}
                  justify="space-between"
                  px={{ base: 4, md: 6 }}
                  py={4}
                  borderTop={index === 0 ? 'none' : '1px solid'}
                  borderColor={ed?.line ?? 'blackAlpha.100'}
                >
                  <HStack>
                    <Avatar size="sm" name={settlement.fromMemberName} />
                    <Box>
                      <Text fontWeight={800}>
                        {settlement.fromMemberName} paid {settlement.toMemberName}
                      </Text>
                      <Text color={muted} fontSize="xs">{dateLabel(settlement.settlementDate)}</Text>
                    </Box>
                  </HStack>
                  <HStack justify={{ base: 'space-between', md: 'flex-end' }} flexWrap="wrap">
                    <Text fontWeight={900}>{money(settlement.amount, household.currency)}</Text>
                    <Badge colorScheme={
                      settlement.status === 'CONFIRMED'
                        ? 'green'
                        : settlement.status === 'PENDING'
                          ? 'orange'
                          : 'gray'
                    }>
                      {settlement.status.toLowerCase()}
                    </Badge>
                    {settlement.canConfirm && (
                      <Button
                        size="xs"
                        colorScheme="green"
                        isLoading={busyAction === `confirm-${settlement.id}`}
                        onClick={() => void applyAction(
                          `confirm-${settlement.id}`,
                          () => confirmHouseholdSettlement(household.id, settlement.id),
                          'Payment confirmed',
                        )}
                      >
                        Confirm
                      </Button>
                    )}
                    {settlement.canReject && (
                      <Button
                        size="xs"
                        variant="ghost"
                        isLoading={busyAction === `reject-${settlement.id}`}
                        onClick={() => void applyAction(
                          `reject-${settlement.id}`,
                          () => rejectHouseholdSettlement(household.id, settlement.id),
                        )}
                      >
                        Reject
                      </Button>
                    )}
                    {settlement.canCancel && (
                      <Button
                        size="xs"
                        variant="ghost"
                        isLoading={busyAction === `cancel-${settlement.id}`}
                        onClick={() => void applyAction(
                          `cancel-${settlement.id}`,
                          () => cancelHouseholdSettlement(household.id, settlement.id),
                        )}
                      >
                        Cancel
                      </Button>
                    )}
                  </HStack>
                </Stack>
              ))}
            </VStack>
          )}
        </Surface>
      </VStack>

      <ExpenseModal
        isOpen={expenseModal.isOpen}
        onClose={expenseModal.onClose}
        household={household}
        expense={editingExpense}
        onChanged={setPage}
      />
      <SettlementModal
        isOpen={settlementModal.isOpen}
        onClose={settlementModal.onClose}
        household={household}
        debt={settlingDebt}
        onChanged={setPage}
      />
      <MembersModal
        isOpen={membersModal.isOpen}
        onClose={membersModal.onClose}
        household={household}
        onChanged={setPage}
      />
    </Box>
  )
}

function ExpenseModal({
  isOpen,
  onClose,
  household,
  expense,
  onChanged,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  expense: HouseholdExpense | null
  onChanged: (page: HouseholdPageState) => void
}) {
  const ed = useEd()
  const mutedFallback = useColorModeValue('gray.600', 'gray.400')
  const muted = ed?.muted ?? mutedFallback
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('Electricity')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(today())
  const [participantIds, setParticipantIds] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setDescription(expense?.description ?? '')
    setCategory(expense?.category ?? 'Electricity')
    setAmount(expense ? String(expense.amount) : '')
    setExpenseDate(expense?.expenseDate ?? today())
    setParticipantIds(new Set(
      expense?.shares.map((share) => share.memberId)
        ?? household.members.map((member) => member.id),
    ))
  }, [expense, household.members, isOpen])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      ToastService.warning({ title: 'Enter a valid expense amount' })
      return
    }
    const request: HouseholdExpenseRequest = {
      description,
      category,
      amount: numericAmount,
      expenseDate,
      participantMemberIds: [...participantIds],
    }
    setSaving(true)
    try {
      const next = expense
        ? await updateHouseholdExpense(household.id, expense.id, request)
        : await createHouseholdExpense(household.id, request)
      onChanged(next)
      ToastService.success({ title: expense ? 'Expense updated' : 'Expense added' })
      onClose()
    } catch (error) {
      ToastService.apiError(error, { title: 'Could not save household expense' })
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!expense || !window.confirm('Remove this expense from the Household ledger?')) return
    setDeleting(true)
    try {
      onChanged(await deleteHouseholdExpense(household.id, expense.id))
      ToastService.success({ title: 'Expense removed' })
      onClose()
    } catch (error) {
      ToastService.apiError(error, { title: 'Could not remove household expense' })
    } finally {
      setDeleting(false)
    }
  }

  const preview = Number(amount) > 0 && participantIds.size > 0
    ? Number(amount) / participantIds.size
    : 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent bg={ed?.modal} color={ed?.cream} borderColor={ed?.lineStrong} borderWidth={ed ? '1px' : 0}>
        <ModalHeader>{expense ? 'Edit household expense' : 'Add household expense'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody as="form" id="household-expense-form" onSubmit={submit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Input
                value={description}
                maxLength={255}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Electricity bill"
              />
            </FormControl>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                />
              </FormControl>
            </SimpleGrid>
            <FormControl isRequired>
              <FormLabel>Date</FormLabel>
              <Input type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Split between</FormLabel>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                {household.members.map((member) => {
                  const isPayer = member.id === (expense?.payerMemberId ?? household.currentMemberId)
                  return (
                    <Checkbox
                      key={member.id}
                      isChecked={participantIds.has(member.id)}
                      isDisabled={isPayer}
                      onChange={(event) => {
                        setParticipantIds((current) => {
                          const next = new Set(current)
                          if (event.target.checked) next.add(member.id)
                          else next.delete(member.id)
                          return next
                        })
                      }}
                    >
                      {member.name}{isPayer ? ' (payer)' : ''}
                    </Checkbox>
                  )
                })}
              </SimpleGrid>
              <Text mt={2} color={muted} fontSize="xs">
                {participantIds.size} members · approximately {money(preview, household.currency)} each.
                Final penny allocation is calculated by the server.
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Box>
            {expense && (
              <Button
                colorScheme="red"
                variant="ghost"
                leftIcon={<Trash2 size={16} />}
                isLoading={deleting}
                onClick={() => void remove()}
              >
                Remove
              </Button>
            )}
          </Box>
          <HStack>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="household-expense-form" colorScheme="teal" isLoading={saving}>
              {expense ? 'Save changes' : 'Add expense'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function SettlementModal({
  isOpen,
  onClose,
  household,
  debt,
  onChanged,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  debt: HouseholdDebt | null
  onChanged: (page: HouseholdPageState) => void
}) {
  const ed = useEd()
  const [amount, setAmount] = useState('')
  const [settlementDate, setSettlementDate] = useState(today())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen || !debt) return
    setAmount(String(debt.amount))
    setSettlementDate(today())
  }, [debt, isOpen])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!debt) return
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > debt.amount) {
      ToastService.warning({ title: 'Enter an amount up to the current debt' })
      return
    }
    setSaving(true)
    try {
      onChanged(await createHouseholdSettlement(household.id, {
        toMemberId: debt.toMemberId,
        amount: numericAmount,
        settlementDate,
      }))
      ToastService.success({
        title: 'Payment sent for confirmation',
        description: `${debt.toMemberName} needs to confirm it before balances change.`,
      })
      onClose()
    } catch (error) {
      ToastService.apiError(error, { title: 'Could not record payment' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent bg={ed?.modal} color={ed?.cream} borderColor={ed?.lineStrong} borderWidth={ed ? '1px' : 0}>
        <ModalHeader>Record payment</ModalHeader>
        <ModalCloseButton />
        <ModalBody as="form" id="household-settlement-form" onSubmit={submit}>
          <VStack align="stretch" spacing={4}>
            <Box p={4} borderRadius="xl" bg={ed?.panelRaised ?? 'blackAlpha.50'}>
              <Text fontSize="sm">Paying</Text>
              <Text fontSize="xl" fontWeight={900}>{debt?.toMemberName}</Text>
              <Text fontSize="sm">Current debt: {money(debt?.amount ?? 0, household.currency)}</Text>
            </Box>
            <FormControl isRequired>
              <FormLabel>Amount sent</FormLabel>
              <Input
                type="number"
                min="0.01"
                max={debt?.amount}
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Payment date</FormLabel>
              <Input type="date" value={settlementDate} onChange={(event) => setSettlementDate(event.target.value)} />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            form="household-settlement-form"
            colorScheme="teal"
            isLoading={saving}
          >
            Send for confirmation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function MembersModal({
  isOpen,
  onClose,
  household,
  onChanged,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  onChanged: (page: HouseholdPageState) => void
}) {
  const ed = useEd()
  const mutedFallback = useColorModeValue('gray.600', 'gray.400')
  const muted = ed?.muted ?? mutedFallback
  const [name, setName] = useState(household.name)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) setName(household.name)
  }, [household.name, isOpen])

  const act = async (
    key: string,
    action: () => Promise<HouseholdPageState>,
    success?: string,
  ) => {
    setBusy(key)
    try {
      onChanged(await action())
      if (success) ToastService.success({ title: success })
      return true
    } catch (error) {
      ToastService.apiError(error, { title: 'Could not update household' })
      return false
    } finally {
      setBusy(null)
    }
  }

  const invite = async (event: FormEvent) => {
    event.preventDefault()
    const saved = await act(
      'invite',
      () => inviteHouseholdMember(household.id, email),
      'Invitation created',
    )
    if (saved) setEmail('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent bg={ed?.modal} color={ed?.cream} borderColor={ed?.lineStrong} borderWidth={ed ? '1px' : 0}>
        <ModalHeader>Manage Household</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading size="sm" mb={3}>Household details</Heading>
              <HStack align="flex-end">
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input value={name} maxLength={120} onChange={(event) => setName(event.target.value)} />
                </FormControl>
                <Button
                  isLoading={busy === 'rename'}
                  onClick={() => void act(
                    'rename',
                    () => updateHousehold(household.id, name),
                    'Household renamed',
                  )}
                >
                  Save
                </Button>
              </HStack>
            </Box>

            <Divider borderColor={ed?.line} />

            <Box>
              <Heading size="sm" mb={1}>Invite a member</Heading>
              <Text color={muted} fontSize="sm" mb={3}>
                The person needs an approved Personal Budget account.
              </Text>
              <HStack as="form" align="flex-end" onSubmit={(event) => void invite(event)}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="member@example.com"
                  />
                </FormControl>
                <Button type="submit" colorScheme="teal" isLoading={busy === 'invite'}>
                  Invite
                </Button>
              </HStack>
            </Box>

            {household.pendingMemberInvitations.length > 0 && (
              <Box>
                <Heading size="xs" mb={3}>Pending invitations</Heading>
                <VStack align="stretch" spacing={2}>
                  {household.pendingMemberInvitations.map((invitation) => (
                    <HStack
                      key={invitation.id}
                      justify="space-between"
                      p={3}
                      borderRadius="lg"
                      bg={ed?.panelRaised ?? 'blackAlpha.50'}
                    >
                      <Box minW={0}>
                        <Text fontWeight={800} noOfLines={1}>{invitation.targetName}</Text>
                        <Text color={muted} fontSize="xs" noOfLines={1}>{invitation.targetEmail}</Text>
                      </Box>
                      <IconButton
                        aria-label={`Revoke invitation for ${invitation.targetName}`}
                        icon={<X size={16} />}
                        size="sm"
                        variant="ghost"
                        isLoading={busy === `revoke-${invitation.id}`}
                        onClick={() => void act(
                          `revoke-${invitation.id}`,
                          () => revokeHouseholdInvitation(household.id, invitation.id),
                        )}
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            <Divider borderColor={ed?.line} />

            <Box>
              <Heading size="sm" mb={3}>Active members</Heading>
              <VStack align="stretch" spacing={2}>
                {household.members.map((member) => (
                  <HStack
                    key={member.id}
                    justify="space-between"
                    p={3}
                    borderRadius="lg"
                    bg={ed?.panelRaised ?? 'blackAlpha.50'}
                  >
                    <HStack minW={0}>
                      <Avatar size="sm" name={member.name} />
                      <Box minW={0}>
                        <HStack>
                          <Text fontWeight={800} noOfLines={1}>{member.name}</Text>
                          {member.role === 'OWNER' && <Badge colorScheme="purple">Owner</Badge>}
                        </HStack>
                        <Text color={muted} fontSize="xs" noOfLines={1}>{member.email}</Text>
                      </Box>
                    </HStack>
                    {member.role !== 'OWNER' && (
                      <IconButton
                        aria-label={`Remove ${member.name}`}
                        icon={<Trash2 size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        isLoading={busy === `remove-${member.id}`}
                        onClick={() => {
                          if (!window.confirm(`Remove ${member.name} from this household?`)) return
                          void act(
                            `remove-${member.id}`,
                            () => removeHouseholdMember(household.id, member.id),
                            'Member removed',
                          )
                        }}
                      />
                    )}
                  </HStack>
                ))}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Done</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
