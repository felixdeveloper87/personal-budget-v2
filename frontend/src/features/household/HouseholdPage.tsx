import { FormEvent, useCallback, useEffect, useState } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
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
  Switch,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
  type BoxProps,
} from '@chakra-ui/react'
import {
  acceptHouseholdInvitation,
  cancelHouseholdSettlement,
  completeHouseholdCleaningAssignment,
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
  updateHouseholdCleaningRotation,
  updateHouseholdExpense,
  uploadHouseholdExpenseAttachments,
  uploadHouseholdSettlementAttachments,
} from '../../api'
import { useEd } from '../../editorial'
import { ToastService } from '../../services/toast'
import type {
  HouseholdDashboard,
  HouseholdCleaningRotation,
  HouseholdDebt,
  HouseholdExpense,
  HouseholdExpenseRequest,
  HouseholdPageState,
} from '../../types'
import {
  Check,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Gear,
  Home,
  Mail,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Repeat,
  Sparkles,
  Trash2,
  Upload,
  Wallet,
  X,
} from '../../components/ui/icons'
import {
  ModalHeader as AppModalHeader,
  PremiumModal,
} from '../../components/ui'
import {
  AttachmentGalleryModal,
  AttachmentPicker,
} from './HouseholdAttachments'
import HouseholdHeader from './HouseholdHeader'

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

const CLEANING_DUTIES: ReadonlyArray<{
  label: string
  schedule?: string
  timed?: boolean
}> = [
  { label: 'Clean the shower room' },
  { label: 'Clean the toilet / WC' },
  { label: 'Vacuum the upstairs hallway' },
  { label: 'Vacuum the stairs' },
  { label: 'Vacuum the downstairs hallway' },
  { label: 'Clean the living room' },
  { label: 'Empty all bins' },
  {
    label: 'Put the rubbish out',
    schedule: 'Every Thursday · by 10:00',
    timed: true,
  },
]

type AttachmentTarget =
  | { kind: 'expense'; id: number }
  | { kind: 'settlement'; id: number }

const today = () => {
  const value = new Date()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${value.getFullYear()}-${month}-${day}`
}

const currentMonday = () => {
  const value = new Date()
  const daysSinceMonday = (value.getDay() + 6) % 7
  value.setDate(value.getDate() - daysSinceMonday)
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
  const [attachmentTarget, setAttachmentTarget] = useState<AttachmentTarget | null>(null)
  const expenseModal = useDisclosure()
  const membersModal = useDisclosure()
  const settlementModal = useDisclosure()
  const attachmentsModal = useDisclosure()
  const cleaningRotationModal = useDisclosure()

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
  const attachmentExpense = attachmentTarget?.kind === 'expense'
    ? household.expenses.find((expense) => expense.id === attachmentTarget.id)
    : undefined
  const attachmentSettlement = attachmentTarget?.kind === 'settlement'
    ? household.settlements.find((settlement) => settlement.id === attachmentTarget.id)
    : undefined
  const selectedAttachments =
    attachmentExpense?.attachments ?? attachmentSettlement?.attachments ?? []
  const canAttach = attachmentExpense?.canEdit ?? attachmentSettlement?.canAttach ?? false
  const attachmentTitle = attachmentExpense?.description
    ?? (attachmentSettlement
      ? `${attachmentSettlement.fromMemberName} paid ${attachmentSettlement.toMemberName}`
      : 'Household record')

  const openAttachments = (target: AttachmentTarget) => {
    setAttachmentTarget(target)
    attachmentsModal.onOpen()
  }

  const uploadTargetAttachments = (files: File[]) => {
    if (attachmentTarget?.kind === 'expense') {
      return uploadHouseholdExpenseAttachments(
        household.id,
        attachmentTarget.id,
        files,
      )
    }
    if (attachmentTarget?.kind === 'settlement') {
      return uploadHouseholdSettlementAttachments(
        household.id,
        attachmentTarget.id,
        files,
      )
    }
    return Promise.reject(new Error('No Household record selected'))
  }

  return (
    <Box maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 3, md: 7 }}>
      <VStack align="stretch" spacing={{ base: 3, md: 6 }}>
        <HouseholdHeader
          household={household}
          onAddExpense={openNewExpense}
          onManage={membersModal.onOpen}
        />

        <CleaningRotationCard
          rotation={household.cleaningRotation}
          currentMemberId={household.currentMemberId}
          busy={busyAction === 'complete-cleaning'}
          onManage={cleaningRotationModal.onOpen}
          onComplete={(assignmentId) => void applyAction(
            'complete-cleaning',
            () => completeHouseholdCleaningAssignment(household.id, assignmentId),
            'Cleaning marked as completed',
          )}
        />

        <Surface overflow="hidden">
          <Grid templateColumns={{ base: '1fr', xl: '1.1fr 0.9fr' }}>
            <Box
              p={{ base: 4, md: 6 }}
              borderBottom={{ base: '1px solid', xl: 'none' }}
              borderRight={{ base: 'none', xl: '1px solid' }}
              borderColor={ed?.line ?? 'blackAlpha.100'}
            >
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
                <VStack align="stretch" spacing={0}>
                  {household.debts.map((debt, index) => {
                    const youPay = debt.fromMemberId === household.currentMemberId
                    const youReceive = debt.toMemberId === household.currentMemberId
                    return (
                      <Stack
                        key={`${debt.fromMemberId}-${debt.toMemberId}`}
                        direction={{ base: 'column', sm: 'row' }}
                        align={{ base: 'stretch', sm: 'center' }}
                        justify="space-between"
                        py={3}
                        borderTop={index === 0 ? 'none' : '1px solid'}
                        borderColor={ed?.line ?? 'blackAlpha.100'}
                      >
                        <HStack>
                          <Avatar size={{ base: 'xs', md: 'sm' }} name={debt.fromMemberName} />
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
            </Box>

          <Box p={{ base: 4, md: 6 }}>
            <Heading size="md">Members</Heading>
            <Text color={muted} fontSize="sm" mb={4}>Paid, assigned share, and net position.</Text>
            <VStack align="stretch" spacing={0}>
              {household.members.map((member, index) => (
                <Box
                  key={member.id}
                  py={3}
                  borderTop={index === 0 ? 'none' : '1px solid'}
                  borderColor={ed?.line ?? 'blackAlpha.100'}
                >
                  <HStack justify="space-between" align="flex-start">
                    <HStack minW={0}>
                      <Avatar size={{ base: 'xs', md: 'sm' }} name={member.name} />
                      <Box minW={0}>
                        <HStack>
                          <Text fontWeight={800} noOfLines={1}>{member.name}</Text>
                        </HStack>
                        <Text color={muted} fontSize="xs" noOfLines={1}>{member.email}</Text>
                      </Box>
                    </HStack>
                    <Text
                      fontWeight={900}
                      fontSize={{ base: 'sm', md: 'md' }}
                      flexShrink={0}
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
                  <HStack
                    mt={2}
                    pl={{ base: 8, md: 10 }}
                    color={muted}
                    fontSize="xs"
                    justify="space-between"
                    flexWrap="wrap"
                  >
                    <Text>Paid {money(member.totalPaid, household.currency)}</Text>
                    <Text>Share {money(member.totalShare, household.currency)}</Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
          </Grid>
        </Surface>

        <Surface overflow="hidden">
          <HStack justify="space-between" px={{ base: 3, md: 6 }} py={{ base: 4, md: 5 }}>
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
                  px={{ base: 3, md: 6 }}
                  py={3}
                  justify="space-between"
                  borderTop={index === 0 ? 'none' : '1px solid'}
                  borderColor={ed?.line ?? 'blackAlpha.100'}
                >
                  <HStack minW={0}>
                    <Box
                      w={{ base: 9, md: 10 }}
                      h={{ base: 9, md: 10 }}
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
                      <Text fontWeight={900} fontSize={{ base: 'sm', md: 'md' }}>
                        {money(expense.amount, household.currency)}
                      </Text>
                      <Text color={muted} fontSize="xs" display={{ base: 'none', sm: 'block' }}>
                        {expense.shares.length} shares
                      </Text>
                    </Box>
                    {((expense.attachments ?? []).length > 0 || expense.canEdit) && (
                      <Button
                        aria-label={`Proof images for ${expense.description}`}
                        size="xs"
                        variant="ghost"
                        leftIcon={<Upload size={14} />}
                        px={2}
                        onClick={() => openAttachments({ kind: 'expense', id: expense.id })}
                      >
                        {(expense.attachments ?? []).length}
                      </Button>
                    )}
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
          <HStack justify="space-between" px={{ base: 3, md: 6 }} py={{ base: 4, md: 5 }}>
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
                  px={{ base: 3, md: 6 }}
                  py={3}
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
                    {((settlement.attachments ?? []).length > 0 || settlement.canAttach) && (
                      <Button
                        aria-label={`Proof images for payment from ${settlement.fromMemberName}`}
                        size="xs"
                        variant="ghost"
                        leftIcon={<Upload size={14} />}
                        px={2}
                        onClick={() => openAttachments({
                          kind: 'settlement',
                          id: settlement.id,
                        })}
                      >
                        {(settlement.attachments ?? []).length}
                      </Button>
                    )}
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
      <CleaningRotationModal
        isOpen={cleaningRotationModal.isOpen}
        onClose={cleaningRotationModal.onClose}
        household={household}
        rotation={household.cleaningRotation}
        onChanged={setPage}
      />
      <AttachmentGalleryModal
        isOpen={attachmentsModal.isOpen}
        onClose={attachmentsModal.onClose}
        householdId={household.id}
        title={attachmentTitle}
        attachments={selectedAttachments}
        canAttach={canAttach}
        onUpload={uploadTargetAttachments}
        onChanged={setPage}
      />
    </Box>
  )
}

function CleaningRotationCard({
  rotation,
  currentMemberId,
  busy,
  onManage,
  onComplete,
}: {
  rotation: HouseholdCleaningRotation
  currentMemberId: number
  busy: boolean
  onManage: () => void
  onComplete: (assignmentId: number) => void
}) {
  const current = rotation.currentWeek
  const firstUpcoming = rotation.upcomingWeeks[0]
  const canCurrentUserComplete = Boolean(
    current?.canComplete && current.assignedMemberId === currentMemberId,
  )
  const currentIsUser = current?.assignedMemberId === currentMemberId
  const currentIsComplete = current?.status === 'COMPLETED'
  const rotationStatus = !rotation.configured
    ? 'Not set up'
    : rotation.active
      ? 'Active'
      : 'Paused'

  return (
    <Box
      overflow="hidden"
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius={{ base: '18px', md: '22px' }}
      boxShadow="var(--pb-shadow)"
    >
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', sm: 'center' }}
        gap={{ base: 3, sm: 4 }}
        px={{ base: 3.5, sm: 4, md: 5 }}
        py={{ base: 3.5, md: 4 }}
        borderBottom="1px solid var(--pb-hair)"
      >
        <HStack spacing={3} minW={0}>
          <Flex
            w={{ base: 10, md: 11 }}
            h={{ base: 10, md: 11 }}
            flexShrink={0}
            align="center"
            justify="center"
            borderRadius="13px"
            bg="var(--pb-tint-gold)"
            color="var(--pb-gold)"
            border="1px solid var(--pb-hair)"
          >
            <Icon as={Sparkles} boxSize={5} weight="duotone" />
          </Flex>
          <Box minW={0}>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={600}
              letterSpacing="0.16em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              Shared routine
            </Text>
            <Text
              mt={0.5}
              fontFamily="var(--pb-serif)"
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight={500}
              lineHeight={1.1}
              color="var(--pb-ink)"
            >
              Weekly cleaning
            </Text>
            <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="xs" noOfLines={1}>
              A fair, repeating turn for everyone at home.
            </Text>
          </Box>
        </HStack>
        <Flex gap={2} align="center" w={{ base: 'full', sm: 'auto' }}>
          <HStack
            px={3}
            h="40px"
            borderRadius="10px"
            bg={rotation.active ? 'var(--pb-tint-income)' : 'var(--pb-surface-2)'}
            color={rotation.active ? 'var(--pb-income)' : 'var(--pb-ink-soft)'}
            border="1px solid var(--pb-hair)"
            spacing={2}
            flex={{ base: 1, sm: 'initial' }}
            justify="center"
          >
            <Box w="6px" h="6px" borderRadius="full" bg="currentColor" />
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={700}
              letterSpacing="0.08em"
              textTransform="uppercase"
            >
              {rotationStatus}
            </Text>
          </HStack>
          {rotation.canManage && (
            <Button
              leftIcon={<Icon as={Gear} boxSize={4} />}
              h="40px"
              px={3.5}
              borderRadius="10px"
              bg="var(--pb-surface-2)"
              color="var(--pb-ink-soft)"
              border="1px solid var(--pb-hair)"
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={600}
              letterSpacing="0.05em"
              textTransform="uppercase"
              flex={{ base: 1.25, sm: 'initial' }}
              onClick={onManage}
              _hover={{ color: 'var(--pb-ink)', borderColor: 'var(--pb-hair-2)' }}
              _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
            >
              {rotation.configured ? 'Manage' : 'Set up'}
            </Button>
          )}
        </Flex>
      </Flex>

      {!rotation.configured ? (
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'center' }}
          justify="space-between"
          gap={4}
          p={{ base: 4, md: 5 }}
          bg="var(--pb-surface-2)"
        >
          <Box maxW="620px">
            <Text
              fontFamily="var(--pb-serif)"
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight={500}
              color="var(--pb-ink)"
            >
              Create a rhythm that feels fair.
            </Text>
            <Text mt={1} color="var(--pb-ink-soft)" fontSize="sm" lineHeight={1.5}>
              {rotation.canManage
                ? 'Choose who takes part, set the first Monday and arrange the order once. The rota repeats automatically.'
                : 'The household owner has not set up the weekly cleaning rotation yet.'}
            </Text>
          </Box>
          <HStack spacing={2} flexWrap="wrap">
            {['Pick members', 'Choose Monday', 'Set the order'].map((step, index) => (
              <HStack
                key={step}
                px={3}
                py={2}
                borderRadius="10px"
                bg="var(--pb-surface)"
                border="1px solid var(--pb-hair)"
                spacing={2}
              >
                <Text fontFamily="var(--pb-mono)" fontSize="8px" color="var(--pb-gold)">
                  0{index + 1}
                </Text>
                <Text fontSize="xs" color="var(--pb-ink-soft)">{step}</Text>
              </HStack>
            ))}
          </HStack>
        </Flex>
      ) : !rotation.active ? (
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          align={{ base: 'stretch', sm: 'center' }}
          gap={3}
          p={{ base: 4, md: 5 }}
          bg="var(--pb-surface-2)"
        >
          <Flex
            w={11}
            h={11}
            flexShrink={0}
            align="center"
            justify="center"
            borderRadius="full"
            bg="var(--pb-tint-gold)"
            color="var(--pb-gold)"
          >
            <Icon as={Clock} boxSize={5} weight="duotone" />
          </Flex>
          <Box minW={0}>
            <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500} color="var(--pb-ink)">
              Rotation paused
            </Text>
            <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="sm">
              The order is saved for {rotation.participantMemberIds.length} member
              {rotation.participantMemberIds.length === 1 ? '' : 's'}. Resume it anytime from Manage.
            </Text>
          </Box>
        </Flex>
      ) : (
        <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)' }}>
          <Box
            p={{ base: 4, md: 5 }}
            borderBottom={{ base: '1px solid', lg: 'none' }}
            borderRight={{ base: 'none', lg: '1px solid' }}
            borderColor="var(--pb-hair)"
            bg="var(--pb-summary-petrol)"
          >
            {current ? (
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between" align="flex-start" spacing={3}>
                  <Box>
                    <Text
                      fontFamily="var(--pb-mono)"
                      fontSize="9px"
                      fontWeight={600}
                      letterSpacing="0.15em"
                      textTransform="uppercase"
                      color="var(--pb-summary-ink-faint)"
                    >
                      On duty this week
                    </Text>
                    <Text mt={1} fontSize="xs" color="var(--pb-summary-ink-soft)">
                      {dateLabel(current.weekStart)} – {dateLabel(current.weekEnd)}
                    </Text>
                  </Box>
                  <HStack
                    px={2.5}
                    py={1.5}
                    borderRadius="full"
                    bg={currentIsComplete ? 'var(--pb-tint-income)' : 'var(--pb-tint-gold)'}
                    color={currentIsComplete ? 'var(--pb-summary-income)' : 'var(--pb-summary-gold)'}
                    border="1px solid var(--pb-summary-line)"
                    spacing={1.5}
                  >
                    <Icon
                      as={currentIsComplete ? CheckCircle2 : Clock}
                      boxSize={3.5}
                      weight="duotone"
                    />
                    <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700} textTransform="uppercase">
                      {currentIsComplete ? 'Completed' : 'In progress'}
                    </Text>
                  </HStack>
                </HStack>

                <Box minW={0}>
                  <HStack spacing={2} flexWrap="wrap">
                    <Text
                      fontFamily="var(--pb-serif)"
                      fontSize={{ base: '2xl', md: '3xl' }}
                      fontWeight={500}
                      lineHeight={1}
                      letterSpacing="-0.03em"
                      color="var(--pb-summary-ink)"
                      noOfLines={1}
                    >
                      {currentIsUser ? 'Your turn' : current.assignedMemberName}
                    </Text>
                    {currentIsUser && (
                      <Badge
                        bg="var(--pb-summary-panel)"
                        color="var(--pb-summary-ink-soft)"
                        border="1px solid var(--pb-summary-line)"
                        borderRadius="full"
                        px={2}
                        textTransform="none"
                      >
                        You
                      </Badge>
                    )}
                  </HStack>
                  <Text mt={1.5} color="var(--pb-summary-ink-soft)" fontSize="sm">
                    {currentIsUser
                      ? 'Keep the shared spaces fresh, then mark the week complete.'
                      : `${current.assignedMemberName} is taking care of the shared spaces.`}
                  </Text>
                </Box>

                {canCurrentUserComplete && (
                  <Button
                    alignSelf={{ base: 'stretch', sm: 'flex-start' }}
                    h="44px"
                    px={4}
                    borderRadius="11px"
                    bg="var(--pb-forest-2)"
                    color="var(--pb-on-accent)"
                    leftIcon={<Icon as={Check} boxSize={4} weight="bold" />}
                    isLoading={busy}
                    loadingText="Completing"
                    onClick={() => onComplete(current.id)}
                    _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}
                    _active={{ transform: 'translateY(0)' }}
                  >
                    Mark this week complete
                  </Button>
                )}
                {currentIsComplete && (
                  <HStack
                    px={3.5}
                    py={3}
                    borderRadius="12px"
                    bg="var(--pb-tint-income)"
                    color="var(--pb-summary-income)"
                    border="1px solid var(--pb-summary-line)"
                    spacing={2.5}
                  >
                    <Icon as={CheckCircle2} boxSize={5} weight="fill" />
                    <Box>
                      <Text fontSize="sm" fontWeight={600}>All done for this week</Text>
                      <Text mt={0.5} fontSize="xs" color="var(--pb-summary-ink-soft)">
                        The next person takes over on Monday.
                      </Text>
                    </Box>
                  </HStack>
                )}
              </VStack>
            ) : (
              <VStack align="stretch" spacing={3}>
                <Text
                  color="var(--pb-summary-ink-faint)"
                  fontFamily="var(--pb-mono)"
                  fontSize="9px"
                  fontWeight={600}
                  letterSpacing="0.15em"
                  textTransform="uppercase"
                >
                  Rotation scheduled
                </Text>
                <Text
                  fontFamily="var(--pb-serif)"
                  fontSize={{ base: 'xl', md: '2xl' }}
                  fontWeight={500}
                  color="var(--pb-summary-ink)"
                >
                  Starts {dateLabel(firstUpcoming?.weekStart ?? rotation.startDate ?? today())}
                </Text>
                <Text color="var(--pb-summary-ink-soft)" fontSize="sm">
                  The first assignment is ready. The current-week view appears when the rotation begins.
                </Text>
              </VStack>
            )}
          </Box>

          <Box p={{ base: 4, md: 5 }} bg="var(--pb-surface-2)">
            <HStack justify="space-between" mb={3.5} spacing={3}>
              <Box>
                <Text
                  fontFamily="var(--pb-mono)"
                  color="var(--pb-ink-faint)"
                  fontSize="9px"
                  fontWeight={600}
                  letterSpacing="0.15em"
                  textTransform="uppercase"
                >
                  Coming next
                </Text>
                <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="xs">
                  The next three weekly turns
                </Text>
              </Box>
              <Flex
                w={8}
                h={8}
                flexShrink={0}
                align="center"
                justify="center"
                borderRadius="full"
                bg="var(--pb-surface)"
                color="var(--pb-forest-2)"
                border="1px solid var(--pb-hair)"
              >
                <Icon as={Repeat} boxSize={4} weight="duotone" />
              </Flex>
            </HStack>
            {rotation.upcomingWeeks.length === 0 ? (
              <Box
                px={3.5}
                py={4}
                borderRadius="12px"
                border="1px dashed var(--pb-hair-2)"
                bg="var(--pb-surface)"
              >
                <Text color="var(--pb-ink-soft)" fontSize="sm">
                  No upcoming weeks are scheduled yet.
                </Text>
              </Box>
            ) : (
              <VStack align="stretch" spacing={2}>
                {rotation.upcomingWeeks.map((assignment, index) => (
                  <Flex
                    key={assignment.id}
                    align="center"
                    justify="space-between"
                    gap={3}
                    px={3}
                    py={2.5}
                    borderRadius="12px"
                    bg="var(--pb-surface)"
                    border="1px solid var(--pb-hair)"
                  >
                    <HStack minW={0} spacing={2.5}>
                      <Flex
                        w={7}
                        h={7}
                        flexShrink={0}
                        align="center"
                        justify="center"
                        borderRadius="full"
                        bg="var(--pb-tint-green)"
                        color="var(--pb-forest-2)"
                        fontFamily="var(--pb-mono)"
                        fontSize="8px"
                        fontWeight={700}
                      >
                        {index + 1}
                      </Flex>
                      <Avatar size="sm" name={assignment.assignedMemberName} />
                      <Box minW={0}>
                        <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
                          {assignment.assignedMemberId === currentMemberId
                            ? 'You'
                            : assignment.assignedMemberName}
                        </Text>
                        <Text color="var(--pb-ink-faint)" fontSize="2xs">
                          {dateLabel(assignment.weekStart)}
                        </Text>
                      </Box>
                    </HStack>
                    {assignment.assignedMemberId === currentMemberId && (
                      <Badge
                        flexShrink={0}
                        bg="var(--pb-tint-income)"
                        color="var(--pb-income)"
                        borderRadius="full"
                        px={2}
                        textTransform="none"
                      >
                        Your turn
                      </Badge>
                    )}
                  </Flex>
                ))}
              </VStack>
            )}
          </Box>
        </Grid>
      )}

      <Box
        px={{ base: 3.5, sm: 4, md: 5 }}
        py={{ base: 4, md: 5 }}
        borderTop="1px solid var(--pb-hair)"
        bg="var(--pb-surface)"
      >
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          align={{ base: 'stretch', sm: 'flex-end' }}
          justify="space-between"
          gap={2}
          mb={3.5}
        >
          <Box>
            <Text
              fontFamily="var(--pb-mono)"
              color="var(--pb-ink-faint)"
              fontSize="9px"
              fontWeight={600}
              letterSpacing="0.15em"
              textTransform="uppercase"
            >
              This week&apos;s duties
            </Text>
            <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="xs">
              The person on duty completes the full shared-space checklist.
            </Text>
          </Box>
          <HStack spacing={1.5} color="var(--pb-ink-faint)">
            <Icon as={CheckCircle2} boxSize={3.5} weight="duotone" />
            <Text fontFamily="var(--pb-mono)" fontSize="8px" textTransform="uppercase">
              8 tasks
            </Text>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={2}>
          {CLEANING_DUTIES.map((duty, index) => (
            <Flex
              key={duty.label}
              minH={{ base: '52px', md: '58px' }}
              align="center"
              gap={2.5}
              px={3}
              py={2.5}
              borderRadius="12px"
              border="1px solid var(--pb-hair)"
              bg={duty.timed ? 'var(--pb-tint-gold)' : 'var(--pb-surface-2)'}
            >
              <Flex
                w={8}
                h={8}
                flexShrink={0}
                align="center"
                justify="center"
                borderRadius="10px"
                bg={duty.timed ? 'var(--pb-surface)' : 'var(--pb-tint-green)'}
                color={duty.timed ? 'var(--pb-gold)' : 'var(--pb-forest-2)'}
                border="1px solid var(--pb-hair)"
              >
                <Icon
                  as={duty.timed ? Trash2 : Check}
                  boxSize={4}
                  weight={duty.timed ? 'duotone' : 'bold'}
                />
              </Flex>
              <Box minW={0}>
                <Text color="var(--pb-ink)" fontSize="sm" fontWeight={600} lineHeight={1.25}>
                  {duty.label}
                </Text>
                {duty.schedule ? (
                  <HStack mt={1} spacing={1.5} color="var(--pb-gold)">
                    <Icon as={Clock} boxSize={3} weight="bold" />
                    <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700}>
                      {duty.schedule}
                    </Text>
                  </HStack>
                ) : (
                  <Text mt={0.5} color="var(--pb-ink-faint)" fontSize="2xs">
                    Task {String(index + 1).padStart(2, '0')}
                  </Text>
                )}
              </Box>
            </Flex>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

function CleaningRotationModal({
  isOpen,
  onClose,
  household,
  rotation,
  onChanged,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  rotation: HouseholdCleaningRotation
  onChanged: (page: HouseholdPageState) => void
}) {
  const [startDate, setStartDate] = useState(currentMonday())
  const [active, setActive] = useState(true)
  const [participantIds, setParticipantIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setStartDate(rotation.startDate ?? currentMonday())
    setActive(rotation.configured ? rotation.active : true)
    setParticipantIds(
      rotation.configured
        ? rotation.participantMemberIds
        : household.members.map((member) => member.id),
    )
  }, [household.members, isOpen, rotation])

  const participants = participantIds.flatMap((memberId) => {
    const member = household.members.find((candidate) => candidate.id === memberId)
    return member ? [member] : []
  })
  const availableMembers = household.members.filter(
    (member) => !participantIds.includes(member.id),
  )
  const parsedStartDate = new Date(`${startDate}T12:00:00`)
  const startDateIsMonday = !Number.isNaN(parsedStartDate.getTime())
    && parsedStartDate.getDay() === 1
  const canSave = participantIds.length > 0 && startDateIsMonday
  const previewWeeks = canSave
    ? Array.from({ length: 3 }, (_, index) => {
        const weekStart = new Date(parsedStartDate)
        weekStart.setDate(parsedStartDate.getDate() + index * 7)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        const member = participants[index % participants.length]
        const shortDate = (date: Date) => date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        })
        return {
          member,
          range: `${shortDate(weekStart)} – ${shortDate(weekEnd)}`,
        }
      })
    : []

  const moveParticipant = (index: number, distance: number) => {
    setParticipantIds((current) => {
      const destination = index + distance
      if (destination < 0 || destination >= current.length) return current
      const next = [...current]
      ;[next[index], next[destination]] = [next[destination], next[index]]
      return next
    })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (participantIds.length === 0) {
      ToastService.warning({ title: 'Select at least one member' })
      return
    }
    if (!startDateIsMonday) {
      ToastService.warning({ title: 'The rotation must start on a Monday' })
      return
    }

    setSaving(true)
    try {
      onChanged(await updateHouseholdCleaningRotation(household.id, {
        startDate,
        active,
        participantMemberIds: participantIds,
      }))
      ToastService.success({
        title: rotation.configured ? 'Cleaning rotation updated' : 'Cleaning rotation created',
      })
      onClose()
    } catch (error) {
      ToastService.apiError(error, { title: 'Could not save the cleaning rotation' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <AppModalHeader
          icon={Sparkles}
          title={rotation.configured ? 'Manage cleaning rotation' : 'Set up cleaning rotation'}
          caption="Choose the schedule, members and recurring order"
          onClose={onClose}
          accent="green"
          rightSlot={
            <Badge
              bg={active ? 'var(--pb-tint-income)' : 'var(--pb-surface-3)'}
              color={active ? 'var(--pb-income)' : 'var(--pb-ink-soft)'}
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
            >
              {active ? 'Active' : 'Paused'}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" gap={2} w="full">
          <Button
            type="button"
            flex={{ base: 1, sm: 'initial' }}
            h="44px"
            variant="ghost"
            color="var(--pb-ink-soft)"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            flex={{ base: 1.35, sm: 'initial' }}
            h="44px"
            type="submit"
            form="household-cleaning-form"
            leftIcon={<Icon as={Check} boxSize={4} weight="bold" />}
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            borderRadius="11px"
            isLoading={saving}
            loadingText="Saving"
            isDisabled={!canSave}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            Save rotation
          </Button>
        </Flex>
      }
    >
      <Box
        as="form"
        id="household-cleaning-form"
        onSubmit={submit}
        px={{ base: 4, sm: 5, md: 6 }}
        py={{ base: 4, md: 5 }}
      >
        <VStack align="stretch" spacing={5}>
          <Flex
            align="center"
            justify="space-between"
            gap={4}
            p={{ base: 3.5, md: 4 }}
            borderRadius="14px"
            bg={active ? 'var(--pb-tint-income)' : 'var(--pb-surface-2)'}
            border="1px solid var(--pb-hair)"
          >
            <HStack spacing={3} minW={0}>
              <Flex
                w={10}
                h={10}
                flexShrink={0}
                align="center"
                justify="center"
                borderRadius="full"
                bg="var(--pb-surface)"
                color={active ? 'var(--pb-income)' : 'var(--pb-gold)'}
                border="1px solid var(--pb-hair)"
              >
                <Icon as={active ? Repeat : Clock} boxSize={4.5} weight="duotone" />
              </Flex>
              <Box minW={0}>
                <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)">
                  {active ? 'Rotation active' : 'Rotation paused'}
                </Text>
                <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)">
                  {active
                    ? 'Weekly assignments will continue in the order below.'
                    : 'The order stays saved, but no active assignments are shown.'}
                </Text>
              </Box>
            </HStack>
            <Switch
              aria-label="Toggle cleaning rotation"
              isChecked={active}
              onChange={(event) => setActive(event.target.checked)}
              colorScheme="green"
              size="lg"
              flexShrink={0}
            />
          </Flex>

          <Grid
            templateColumns={{ base: '1fr', md: 'minmax(0, 1.15fr) minmax(230px, 0.85fr)' }}
            gap={{ base: 5, md: 6 }}
            alignItems="start"
          >
            <VStack align="stretch" spacing={5} minW={0}>
              <Box>
                <HStack spacing={2.5} mb={3}>
                  <Flex
                    w={8}
                    h={8}
                    align="center"
                    justify="center"
                    borderRadius="10px"
                    bg="var(--pb-tint-green)"
                    color="var(--pb-forest-2)"
                  >
                    <Icon as={CalendarCheck} boxSize={4} weight="duotone" />
                  </Flex>
                  <Box>
                    <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500} color="var(--pb-ink)">
                      Schedule
                    </Text>
                    <Text fontSize="xs" color="var(--pb-ink-soft)">
                      Every turn runs from Monday to Sunday.
                    </Text>
                  </Box>
                </HStack>

                <FormControl isRequired isInvalid={Boolean(startDate) && !startDateIsMonday}>
                  <FormLabel
                    fontFamily="var(--pb-mono)"
                    fontSize="9px"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color="var(--pb-ink-faint)"
                  >
                    First week starts
                  </FormLabel>
                  <Input
                    type="date"
                    min="2020-01-06"
                    step={7}
                    h="44px"
                    borderRadius="11px"
                    bg="var(--pb-surface-2)"
                    borderColor="var(--pb-hair)"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    _hover={{ borderColor: 'var(--pb-hair-2)' }}
                    _focusVisible={{ borderColor: 'var(--pb-forest-2)', boxShadow: '0 0 0 1px var(--pb-forest-2)' }}
                  />
                  <FormErrorMessage fontSize="xs">
                    Choose a Monday so every week stays aligned.
                  </FormErrorMessage>
                  {startDateIsMonday && (
                    <Text mt={1.5} fontSize="xs" color="var(--pb-income)">
                      Monday selected · weeks will end on Sunday.
                    </Text>
                  )}
                </FormControl>
              </Box>

              <Divider borderColor="var(--pb-hair)" />

              <Box>
                <Flex justify="space-between" align="flex-end" gap={3} mb={3}>
                  <Box>
                    <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500} color="var(--pb-ink)">
                      Weekly order
                    </Text>
                    <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)">
                      Use the arrows to set who follows whom.
                    </Text>
                  </Box>
                  <Badge
                    flexShrink={0}
                    bg="var(--pb-surface-2)"
                    color="var(--pb-ink-soft)"
                    border="1px solid var(--pb-hair)"
                    borderRadius="full"
                    px={2.5}
                    py={1}
                  >
                    {participants.length} selected
                  </Badge>
                </Flex>

                {participants.length === 0 ? (
                  <Box
                    p={4}
                    borderRadius="12px"
                    border="1px dashed var(--pb-coral)"
                    bg="var(--pb-tint-coral)"
                  >
                    <Text fontSize="sm" color="var(--pb-coral)">
                      Add at least one household member to create the rotation.
                    </Text>
                  </Box>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    {participants.map((member, index) => (
                      <Flex
                        key={member.id}
                        direction={{ base: 'column', sm: 'row' }}
                        align={{ base: 'stretch', sm: 'center' }}
                        justify="space-between"
                        gap={2}
                        p={2.5}
                        borderRadius="12px"
                        bg="var(--pb-surface-2)"
                        border="1px solid var(--pb-hair)"
                      >
                        <HStack minW={0} spacing={2.5} flex={1}>
                          <Flex
                            w={7}
                            h={7}
                            flexShrink={0}
                            align="center"
                            justify="center"
                            borderRadius="full"
                            bg="var(--pb-tint-green)"
                            color="var(--pb-forest-2)"
                            fontFamily="var(--pb-mono)"
                            fontSize="8px"
                            fontWeight={700}
                          >
                            {index + 1}
                          </Flex>
                          <Avatar size="sm" name={member.name} />
                          <Box minW={0}>
                            <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
                              {member.name}
                            </Text>
                            <Text fontSize="2xs" color="var(--pb-ink-faint)">
                              Week {index + 1} of the cycle
                            </Text>
                          </Box>
                        </HStack>
                        <HStack
                          spacing={1}
                          flexShrink={0}
                          justify="flex-end"
                          w={{ base: 'full', sm: 'auto' }}
                        >
                          <IconButton
                            type="button"
                            aria-label={`Move ${member.name} earlier`}
                            icon={<Icon as={ChevronUp} boxSize={4} />}
                            h="40px"
                            w="40px"
                            minW="40px"
                            borderRadius="10px"
                            variant="ghost"
                            color="var(--pb-ink-soft)"
                            isDisabled={index === 0}
                            onClick={() => moveParticipant(index, -1)}
                          />
                          <IconButton
                            type="button"
                            aria-label={`Move ${member.name} later`}
                            icon={<Icon as={ChevronDown} boxSize={4} />}
                            h="40px"
                            w="40px"
                            minW="40px"
                            borderRadius="10px"
                            variant="ghost"
                            color="var(--pb-ink-soft)"
                            isDisabled={index === participants.length - 1}
                            onClick={() => moveParticipant(index, 1)}
                          />
                          <IconButton
                            type="button"
                            aria-label={`Remove ${member.name} from the rotation`}
                            icon={<Icon as={X} boxSize={4} />}
                            h="40px"
                            w="40px"
                            minW="40px"
                            borderRadius="10px"
                            variant="ghost"
                            color="var(--pb-coral)"
                            onClick={() => setParticipantIds((current) =>
                              current.filter((memberId) => memberId !== member.id))}
                          />
                        </HStack>
                      </Flex>
                    ))}
                  </VStack>
                )}

                {availableMembers.length > 0 && (
                  <Box mt={4}>
                    <Text
                      mb={2}
                      fontFamily="var(--pb-mono)"
                      fontSize="9px"
                      letterSpacing="0.08em"
                      textTransform="uppercase"
                      color="var(--pb-ink-faint)"
                    >
                      Add to the rotation
                    </Text>
                    <Flex flexWrap="wrap" gap={2}>
                      {availableMembers.map((member) => (
                        <Button
                          key={member.id}
                          type="button"
                          h="40px"
                          px={3}
                          borderRadius="10px"
                          bg="var(--pb-surface-2)"
                          color="var(--pb-ink-soft)"
                          border="1px solid var(--pb-hair)"
                          leftIcon={<Icon as={Plus} boxSize={3.5} />}
                          onClick={() => setParticipantIds((current) => [...current, member.id])}
                          _hover={{ color: 'var(--pb-ink)', borderColor: 'var(--pb-hair-2)' }}
                        >
                          {member.name}
                        </Button>
                      ))}
                    </Flex>
                  </Box>
                )}
              </Box>
            </VStack>

            <Box
              position={{ base: 'static', md: 'sticky' }}
              top={{ md: 0 }}
              p={{ base: 3.5, md: 4 }}
              borderRadius="15px"
              bg="var(--pb-summary-petrol)"
              border="1px solid var(--pb-summary-line)"
              minW={0}
            >
              <HStack justify="space-between" spacing={3} mb={4}>
                <Box>
                  <Text
                    fontFamily="var(--pb-mono)"
                    fontSize="9px"
                    fontWeight={600}
                    letterSpacing="0.14em"
                    textTransform="uppercase"
                    color="var(--pb-summary-ink-faint)"
                  >
                    Live preview
                  </Text>
                  <Text mt={0.5} fontSize="xs" color="var(--pb-summary-ink-soft)">
                    First three weeks
                  </Text>
                </Box>
                <Icon as={Repeat} boxSize={5} color="var(--pb-summary-income)" weight="duotone" />
              </HStack>

              {previewWeeks.length === 0 ? (
                <Box
                  py={6}
                  px={3}
                  textAlign="center"
                  borderRadius="12px"
                  bg="var(--pb-summary-panel)"
                  border="1px dashed var(--pb-summary-line)"
                >
                  <Icon as={Calendar} boxSize={6} color="var(--pb-summary-ink-faint)" />
                  <Text mt={2} fontSize="sm" color="var(--pb-summary-ink-soft)">
                    Choose a Monday and at least one member to see the schedule.
                  </Text>
                </Box>
              ) : (
                <VStack align="stretch" spacing={2}>
                  {previewWeeks.map((week, index) => (
                    <Flex
                      key={`${week.member.id}-${index}`}
                      align="center"
                      gap={2.5}
                      p={2.5}
                      borderRadius="11px"
                      bg="var(--pb-summary-panel)"
                      border="1px solid var(--pb-summary-line)"
                    >
                      <Flex
                        w={7}
                        h={7}
                        flexShrink={0}
                        align="center"
                        justify="center"
                        borderRadius="full"
                        bg="var(--pb-tint-green)"
                        color="var(--pb-summary-income)"
                        fontFamily="var(--pb-mono)"
                        fontSize="8px"
                        fontWeight={700}
                      >
                        {index + 1}
                      </Flex>
                      <Box minW={0} flex={1}>
                        <Text fontSize="sm" fontWeight={600} color="var(--pb-summary-ink)" noOfLines={1}>
                          {week.member.name}
                        </Text>
                        <Text fontSize="2xs" color="var(--pb-summary-ink-faint)">
                          {week.range}
                        </Text>
                      </Box>
                    </Flex>
                  ))}
                </VStack>
              )}

              <Text
                mt={4}
                pt={3}
                borderTop="1px solid var(--pb-summary-line)"
                fontSize="xs"
                color="var(--pb-summary-ink-soft)"
                lineHeight={1.45}
              >
                {participants.length > 0
                  ? `The ${participants.length}-week order repeats after the final person.`
                  : 'The cycle length updates as members are added.'}
              </Text>
            </Box>
          </Grid>
        </VStack>
      </Box>
    </PremiumModal>
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
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setDescription(expense?.description ?? '')
    setCategory(expense?.category ?? 'Electricity')
    setAmount(expense ? String(expense.amount) : '')
    setExpenseDate(expense?.expenseDate ?? today())
    setFiles([])
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
    let savedPage: HouseholdPageState | null = null
    try {
      let targetId = expense?.id
      if (expense) {
        savedPage = await updateHouseholdExpense(household.id, expense.id, request)
      } else {
        const created = await createHouseholdExpense(household.id, request)
        savedPage = created.page
        targetId = created.recordId
      }
      if (files.length > 0) {
        if (!targetId) {
          throw new Error('The saved expense could not be selected for image upload')
        }
        savedPage = await uploadHouseholdExpenseAttachments(
          household.id,
          targetId,
          files,
        )
      }
      onChanged(savedPage)
      ToastService.success({ title: expense ? 'Expense updated' : 'Expense added' })
      onClose()
    } catch (error) {
      if (savedPage) {
        onChanged(savedPage)
        ToastService.apiError(error, {
          title: 'Expense saved, but the images could not be uploaded',
        })
        onClose()
      } else {
        ToastService.apiError(error, { title: 'Could not save household expense' })
      }
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
      <ModalContent
        bg={ed?.modal}
        color={ed?.cream}
        borderColor={ed?.lineStrong}
        borderWidth={ed ? '1px' : 0}
        maxW={{ base: '100vw', md: 'xl' }}
        minH={{ base: '100dvh', md: 'auto' }}
        maxH={{ base: '100dvh', md: 'calc(100vh - 7.5rem)' }}
        my={{ base: 0, md: 16 }}
        borderRadius={{ base: 0, md: 'md' }}
      >
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
            <Divider borderColor={ed?.line} />
            <AttachmentPicker
              files={files}
              onChange={setFiles}
              existingCount={(expense?.attachments ?? []).filter(
                (attachment) => attachment.status === 'AVAILABLE',
              ).length}
            />
          </VStack>
        </ModalBody>
        <ModalFooter
          justifyContent="space-between"
          flexDirection={{ base: 'column-reverse', sm: 'row' }}
          alignItems={{ base: 'stretch', sm: 'center' }}
          gap={2}
        >
          <Box>
            {expense && (
              <Button
                colorScheme="red"
                variant="ghost"
                leftIcon={<Trash2 size={16} />}
                isLoading={deleting}
                onClick={() => void remove()}
                w={{ base: 'full', sm: 'auto' }}
              >
                Remove
              </Button>
            )}
          </Box>
          <HStack w={{ base: 'full', sm: 'auto' }}>
            <Button flex={1} variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              flex={1}
              type="submit"
              form="household-expense-form"
              colorScheme="teal"
              isLoading={saving}
            >
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
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen || !debt) return
    setAmount(String(debt.amount))
    setSettlementDate(today())
    setFiles([])
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
    let savedPage: HouseholdPageState | null = null
    try {
      const created = await createHouseholdSettlement(household.id, {
        toMemberId: debt.toMemberId,
        amount: numericAmount,
        settlementDate,
      })
      savedPage = created.page
      const settlementId = created.recordId
      if (files.length > 0) {
        if (!settlementId) {
          throw new Error('The saved payment could not be selected for image upload')
        }
        savedPage = await uploadHouseholdSettlementAttachments(
          household.id,
          settlementId,
          files,
        )
      }
      onChanged(savedPage)
      ToastService.success({
        title: 'Payment sent for confirmation',
        description: `${debt.toMemberName} needs to confirm it before balances change.`,
      })
      onClose()
    } catch (error) {
      if (savedPage) {
        onChanged(savedPage)
        ToastService.apiError(error, {
          title: 'Payment saved, but the images could not be uploaded',
        })
        onClose()
      } else {
        ToastService.apiError(error, { title: 'Could not record payment' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent
        bg={ed?.modal}
        color={ed?.cream}
        borderColor={ed?.lineStrong}
        borderWidth={ed ? '1px' : 0}
        maxW={{ base: '100vw', md: 'md' }}
        minH={{ base: '100dvh', md: 'auto' }}
        maxH={{ base: '100dvh', md: 'calc(100vh - 7.5rem)' }}
        my={{ base: 0, md: 16 }}
        borderRadius={{ base: 0, md: 'md' }}
      >
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
            <Divider borderColor={ed?.line} />
            <AttachmentPicker files={files} onChange={setFiles} />
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button flex={{ base: 1, sm: 'initial' }} variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            flex={{ base: 1, sm: 'initial' }}
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
      <ModalContent
        bg={ed?.modal}
        color={ed?.cream}
        borderColor={ed?.lineStrong}
        borderWidth={ed ? '1px' : 0}
        maxW={{ base: '100vw', md: 'xl' }}
        minH={{ base: '100dvh', md: 'auto' }}
        maxH={{ base: '100dvh', md: 'calc(100vh - 7.5rem)' }}
        my={{ base: 0, md: 16 }}
        borderRadius={{ base: 0, md: 'md' }}
      >
        <ModalHeader>Manage Household</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading size="sm" mb={3}>Household details</Heading>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={{ base: 'stretch', sm: 'flex-end' }}
              >
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
              </Stack>
            </Box>

            <Divider borderColor={ed?.line} />

            <Box>
              <Heading size="sm" mb={1}>Invite a member</Heading>
              <Text color={muted} fontSize="sm" mb={3}>
                The person needs an approved Personal Budget account.
              </Text>
              <Stack
                as="form"
                direction={{ base: 'column', sm: 'row' }}
                align={{ base: 'stretch', sm: 'flex-end' }}
                onSubmit={(event) => void invite(event)}
              >
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
              </Stack>
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
