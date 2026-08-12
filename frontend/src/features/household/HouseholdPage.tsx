import { FormEvent, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
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
  updateHouseholdCleaningDuty,
  updateHouseholdCleaningRotation,
  updateHouseholdExpense,
  uploadHouseholdExpenseAttachments,
  uploadHouseholdSettlementAttachments,
} from '../../api'
import { useEd } from '../../editorial'
import { useI18n } from '../../i18n'
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
  key: string
  label: string
  schedule?: string
  timed?: boolean
}> = [
  { key: 'shower_room', label: 'Clean the shower room' },
  { key: 'toilet_wc', label: 'Clean the toilet / WC' },
  { key: 'upstairs_hallway', label: 'Vacuum the upstairs hallway' },
  { key: 'stairs', label: 'Vacuum the stairs' },
  { key: 'downstairs_hallway', label: 'Vacuum the downstairs hallway' },
  { key: 'living_room', label: 'Clean the living room' },
  { key: 'all_bins', label: 'Empty all bins' },
  {
    key: 'rubbish_out',
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

function ActionRequiredBanner({
  ariaLabel,
  icon,
  accent,
  tint,
  count,
  title,
  detail,
  actionLabel,
  targetId,
}: {
  ariaLabel: string
  icon: ReactNode
  accent: string
  tint: string
  count: number
  title: string
  detail: string
  actionLabel: string
  targetId: string
}) {
  const { formatNumber, t } = useI18n()
  return (
    <Flex
      role="region"
      aria-label={ariaLabel}
      direction={{ base: 'column', sm: 'row' }}
      align={{ base: 'stretch', sm: 'center' }}
      justify="space-between"
      gap={4}
      h="full"
      px={{ base: 3.5, sm: 4, md: 5 }}
      py={{ base: 3.5, md: 4 }}
      borderRadius={{ base: '16px', md: '18px' }}
      border="1px solid var(--pb-summary-line)"
      bg={tint}
      boxShadow="var(--pb-shadow)"
    >
      <HStack align="flex-start" spacing={3.5} minW={0}>
        <Flex
          w={11}
          h={11}
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="13px"
          bg="var(--pb-surface)"
          color={accent}
          border="1px solid var(--pb-summary-line)"
        >
          {icon}
        </Flex>
        <Box minW={0}>
          <HStack spacing={2} flexWrap="wrap">
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={700}
              letterSpacing="0.14em"
              textTransform="uppercase"
              color={accent}
            >
              {t('household.common.actionRequired')}
            </Text>
            <Badge
              borderRadius="full"
              px={2}
              bg="var(--pb-surface)"
              color={accent}
              border="1px solid var(--pb-summary-line)"
              textTransform="none"
            >
              {formatNumber(count)}
            </Badge>
          </HStack>
          <Text
            mt={1}
            fontFamily="var(--pb-serif)"
            fontSize={{ base: 'lg', md: 'xl' }}
            fontWeight={500}
            lineHeight={1.15}
            color="var(--pb-ink)"
          >
            {title}
          </Text>
          <Text mt={1} color="var(--pb-ink-soft)" fontSize="sm" lineHeight={1.45}>
            {detail}
          </Text>
        </Box>
      </HStack>
      <Button
        flexShrink={0}
        h="42px"
        w={{ base: 'full', sm: 'auto' }}
        px={4}
        borderRadius="10px"
        bg={accent}
        color="var(--pb-on-accent)"
        rightIcon={<Icon as={ChevronDown} boxSize={4} weight="bold" />}
        onClick={() => {
          document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
        }}
        _hover={{ filter: 'brightness(0.96)', transform: 'translateY(-1px)' }}
        _active={{ transform: 'translateY(0)' }}
        _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-ink)' }}
      >
        {actionLabel}
      </Button>
    </Flex>
  )
}

function HouseholdSectionHeader({
  eyebrow,
  title,
  description,
  icon,
  accent,
  tint,
  stat,
}: {
  eyebrow: string
  title: string
  description: string
  icon: ReactNode
  accent: string
  tint: string
  stat: string
}) {
  return (
    <Flex
      direction={{ base: 'column', sm: 'row' }}
      align={{ base: 'stretch', sm: 'center' }}
      justify="space-between"
      gap={3}
      px={{ base: 3.5, sm: 4, md: 5 }}
      py={{ base: 3.5, md: 4 }}
      borderBottom="1px solid var(--pb-hair)"
      bg="var(--pb-surface)"
    >
      <HStack spacing={3} minW={0}>
        <Flex
          w={{ base: 10, md: 11 }}
          h={{ base: 10, md: 11 }}
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="13px"
          bg={tint}
          color={accent}
          border="1px solid var(--pb-hair)"
        >
          {icon}
        </Flex>
        <Box minW={0}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            fontWeight={600}
            letterSpacing="0.15em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            {eyebrow}
          </Text>
          <Text
            mt={0.5}
            fontFamily="var(--pb-serif)"
            fontSize={{ base: 'lg', md: 'xl' }}
            fontWeight={500}
            lineHeight={1.1}
            color="var(--pb-ink)"
          >
            {title}
          </Text>
          <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="xs">
            {description}
          </Text>
        </Box>
      </HStack>
      <Text
        alignSelf={{ base: 'flex-start', sm: 'center' }}
        px={2.5}
        py={1.5}
        borderRadius="full"
        bg={tint}
        color={accent}
        border="1px solid var(--pb-hair)"
        fontFamily="var(--pb-mono)"
        fontSize="8px"
        fontWeight={700}
        letterSpacing="0.05em"
        textTransform="uppercase"
        whiteSpace="nowrap"
      >
        {stat}
      </Text>
    </Flex>
  )
}

export default function HouseholdPage() {
  const ed = useEd()
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()
  const translateRef = useRef(t)
  translateRef.current = t
  const mutedFallback = useColorModeValue('gray.600', 'gray.400')
  const muted = ed?.muted ?? mutedFallback
  const [page, setPage] = useState<HouseholdPageState | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [householdName, setHouseholdName] = useState(() => t('household.create.defaultName'))
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
        title: translateRef.current('household.load.failedToast'),
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
        title: t('household.action.failedToast'),
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
          <Text color={muted} fontSize="sm">{t('household.loading')}</Text>
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
            <Heading size="md">{t('household.load.failedTitle')}</Heading>
            <Text color={muted}>{t('household.load.failedDescription')}</Text>
            <Button leftIcon={<RefreshCw size={17} />} onClick={() => void load()}>
              {t('household.load.retry')}
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
              {t('household.create.eyebrow')}
            </Text>
            <Heading mt={2} size={{ base: 'xl', md: '2xl' }}>
              {t('household.create.title')}
            </Heading>
            <Text mt={3} color={muted} maxW="620px">
              {t('household.create.description')}
            </Text>
          </Box>

          {page.pendingInvitations.length > 0 && (
            <Surface p={{ base: 4, md: 6 }}>
              <VStack align="stretch" spacing={4}>
                <Heading size="sm">{t('household.invitations.title')}</Heading>
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
                        {t('household.invitations.invitedBy', { name: invitation.invitedByName })}
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
                          t('household.invitations.joined'),
                        )}
                      >
                        {t('household.invitations.accept')}
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
                        {t('household.invitations.decline')}
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
                  t('household.create.created'),
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
                  <Heading size="md">{t('household.create.formTitle')}</Heading>
                  <Text color={muted} fontSize="sm">{t('household.create.ownerHint')}</Text>
                </Box>
              </HStack>
              <FormControl isRequired>
                <FormLabel>{t('household.create.name')}</FormLabel>
                <Input
                  value={householdName}
                  maxLength={120}
                  onChange={(event) => setHouseholdName(event.target.value)}
                  placeholder={t('household.create.placeholder')}
                />
              </FormControl>
              <Button
                type="submit"
                alignSelf="flex-start"
                colorScheme="teal"
                leftIcon={<Plus size={17} />}
                isLoading={busyAction === 'create-household'}
              >
                {t('household.create.submit')}
              </Button>
            </VStack>
          </Surface>
        </VStack>
      </Box>
    )
  }

  const household = page.household
  const pendingConfirmations = household.settlements.filter(
    (settlement) => settlement.canConfirm || settlement.canReject,
  )
  const pendingConfirmationTotal = pendingConfirmations.reduce(
    (total, settlement) => total + settlement.amount,
    0,
  )
  const firstPendingConfirmation = pendingConfirmations[0]
  const debtsYouOwe = household.debts.filter(
    (debt) => debt.fromMemberId === household.currentMemberId,
  )
  const totalYouOwe = debtsYouOwe.reduce(
    (total, debt) => total + debt.amount,
    0,
  )
  const firstDebtYouOwe = debtsYouOwe[0]
  const outstandingHouseholdTotal = household.debts.reduce(
    (total, debt) => total + debt.amount,
    0,
  )
  const pendingSettlementCount = household.settlements.filter(
    (settlement) => settlement.status === 'PENDING',
  ).length
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
      ? t('household.record.paymentTitle', {
          from: attachmentSettlement.fromMemberName,
          to: attachmentSettlement.toMemberName,
        })
      : t('household.record.fallback'))

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
    return Promise.reject(new Error(t('household.record.noneSelected')))
  }

  return (
    <Box maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 3, md: 7 }}>
      <VStack align="stretch" spacing={{ base: 3, md: 6 }}>
        <HouseholdHeader
          household={household}
          onAddExpense={openNewExpense}
          onManage={membersModal.onOpen}
        />

        {(pendingConfirmations.length > 0 || debtsYouOwe.length > 0) && (
          <SimpleGrid
            columns={{
              base: 1,
              xl: pendingConfirmations.length > 0 && debtsYouOwe.length > 0 ? 2 : 1,
            }}
            spacing={3}
          >
            {pendingConfirmations.length > 0 && (
              <ActionRequiredBanner
                ariaLabel={t('household.banner.confirmationsAria')}
                icon={<CheckCircle2 size={20} weight="duotone" />}
                accent="var(--pb-gold)"
                tint="var(--pb-tint-gold)"
                count={pendingConfirmations.length}
                title={pendingConfirmations.length === 1
                  ? t('household.banner.confirmations.one')
                  : t('household.banner.confirmations.other', {
                      count: formatNumber(pendingConfirmations.length),
                    })}
                detail={pendingConfirmations.length === 1 && firstPendingConfirmation
                  ? t('household.banner.confirmationDetail.one', {
                      name: firstPendingConfirmation.fromMemberName,
                      amount: formatCurrency(firstPendingConfirmation.amount),
                    })
                  : t('household.banner.confirmationDetail.other', {
                      amount: formatCurrency(pendingConfirmationTotal),
                    })}
                actionLabel={t('household.banner.reviewPayments')}
                targetId="household-payments"
              />
            )}
            {debtsYouOwe.length > 0 && (
              <ActionRequiredBanner
                ariaLabel={t('household.banner.debtsAria')}
                icon={<Wallet size={20} weight="duotone" />}
                accent="var(--pb-coral)"
                tint="var(--pb-tint-coral)"
                count={debtsYouOwe.length}
                title={debtsYouOwe.length === 1
                  ? t('household.banner.debts.one')
                  : t('household.banner.debts.other', {
                      count: formatNumber(debtsYouOwe.length),
                    })}
                detail={debtsYouOwe.length === 1 && firstDebtYouOwe
                  ? t('household.banner.debtDetail.one', {
                      amount: formatCurrency(firstDebtYouOwe.amount),
                      name: firstDebtYouOwe.toMemberName,
                    })
                  : t('household.banner.debtDetail.other', {
                      amount: formatCurrency(totalYouOwe),
                      count: formatNumber(debtsYouOwe.length),
                    })}
                actionLabel={t('household.banner.reviewBalances')}
                targetId="household-balances"
              />
            )}
          </SimpleGrid>
        )}

        <CleaningRotationCard
          rotation={household.cleaningRotation}
          currentMemberId={household.currentMemberId}
          busyDutyKey={
            busyAction?.startsWith('cleaning-duty:')
              ? busyAction.slice('cleaning-duty:'.length)
              : null
          }
          onManage={cleaningRotationModal.onOpen}
          onToggleDuty={(assignmentId, dutyKey, completed) => void applyAction(
            `cleaning-duty:${dutyKey}`,
            () => updateHouseholdCleaningDuty(
              household.id,
              assignmentId,
              dutyKey,
              completed,
            ),
          )}
        />

        <Grid templateColumns={{ base: '1fr', xl: '1.08fr 0.92fr' }} gap={{ base: 3, md: 4 }}>
          <Box
            id="household-balances"
            overflow="hidden"
            scrollMarginTop="90px"
            bg="var(--pb-surface)"
            border="1px solid var(--pb-hair)"
            borderRadius={{ base: '18px', md: '22px' }}
            boxShadow="var(--pb-shadow)"
          >
            <HouseholdSectionHeader
              eyebrow={t('household.balances.eyebrow')}
              title={t('household.balances.title')}
              description={t('household.balances.description')}
              icon={<Wallet size={20} weight="duotone" />}
              accent={household.debts.length ? 'var(--pb-coral)' : 'var(--pb-income)'}
              tint={household.debts.length ? 'var(--pb-tint-coral)' : 'var(--pb-tint-income)'}
              stat={household.debts.length
                ? t('household.balances.open', {
                    amount: formatCurrency(outstandingHouseholdTotal),
                  })
                : t('household.balances.allSettled')}
            />
            <Box p={{ base: 3, md: 4 }} bg="var(--pb-surface-2)">
              {household.debts.length === 0 ? (
                <VStack py={8} px={4} spacing={3} border="1px dashed var(--pb-hair-2)" borderRadius="14px" bg="var(--pb-surface)">
                  <Flex w={11} h={11} align="center" justify="center" borderRadius="full" bg="var(--pb-tint-income)" color="var(--pb-income)">
                    <Check size={20} weight="bold" />
                  </Flex>
                  <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500}>{t('household.balances.everyoneSettled')}</Text>
                  <Text color="var(--pb-ink-soft)" fontSize="sm" textAlign="center">{t('household.balances.noDebts')}</Text>
                </VStack>
              ) : (
                <VStack align="stretch" spacing={2.5}>
                  {household.debts.map((debt) => {
                    const youPay = debt.fromMemberId === household.currentMemberId
                    const youReceive = debt.toMemberId === household.currentMemberId
                    const accent = youPay ? 'var(--pb-coral)' : youReceive ? 'var(--pb-income)' : 'var(--pb-ink-soft)'
                    const tint = youPay ? 'var(--pb-tint-coral)' : youReceive ? 'var(--pb-tint-income)' : 'var(--pb-surface)'
                    return (
                      <Stack
                        key={`${debt.fromMemberId}-${debt.toMemberId}`}
                        direction={{ base: 'column', sm: 'row' }}
                        align={{ base: 'stretch', sm: 'center' }}
                        justify="space-between"
                        gap={3}
                        p={3}
                        borderRadius="14px"
                        border="1px solid var(--pb-hair)"
                        bg="var(--pb-surface)"
                      >
                        <HStack minW={0} spacing={0}>
                          <Box minW={0}>
                            <HStack spacing={2} flexWrap="wrap">
                              <Text fontWeight={700} color="var(--pb-ink)" noOfLines={1}>
                                {youPay
                                  ? t('household.balances.youOweName', {
                                      name: debt.toMemberName,
                                    })
                                  : youReceive
                                    ? t('household.balances.owesYou', {
                                        name: debt.fromMemberName,
                                      })
                                    : t('household.balances.memberOwes', {
                                        from: debt.fromMemberName,
                                        to: debt.toMemberName,
                                      })}
                              </Text>
                              {(youPay || youReceive) && (
                                <Badge borderRadius="full" px={2} bg={tint} color={accent} textTransform="none">
                                  {youPay
                                    ? t('household.balances.youPay')
                                    : t('household.balances.youReceive')}
                                </Badge>
                              )}
                            </HStack>
                            <Text mt={0.5} color="var(--pb-ink-faint)" fontSize="xs">
                              {youPay
                                ? t('household.balances.payHint')
                                : youReceive
                                  ? t('household.balances.receiveHint')
                                  : t('household.balances.otherHint')}
                            </Text>
                          </Box>
                        </HStack>
                        <HStack justify={{ base: 'space-between', sm: 'flex-end' }} spacing={3}>
                          <Text fontFamily="var(--pb-serif)" fontSize="xl" fontWeight={500} color={accent} style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {formatCurrency(debt.amount)}
                          </Text>
                          {youPay && (
                            <Button h="38px" px={3.5} borderRadius="10px" bg="var(--pb-forest-2)" color="var(--pb-on-accent)" onClick={() => openSettlement(debt)} _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}>
                              {t('household.balances.recordPayment')}
                            </Button>
                          )}
                        </HStack>
                      </Stack>
                    )
                  })}
                </VStack>
              )}
            </Box>
          </Box>

          <Box overflow="hidden" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius={{ base: '18px', md: '22px' }} boxShadow="var(--pb-shadow)">
            <HouseholdSectionHeader
              eyebrow={t('household.members.eyebrow')}
              title={t('household.members.title')}
              description={t('household.members.description')}
              icon={<Home size={20} weight="duotone" />}
              accent="var(--pb-forest-2)"
              tint="var(--pb-tint-green)"
              stat={t(
                household.members.length === 1
                  ? 'household.members.count.one'
                  : 'household.members.count.other',
                { count: formatNumber(household.members.length) },
              )}
            />
            <VStack align="stretch" spacing={2.5} p={{ base: 3, md: 4 }} bg="var(--pb-surface-2)">
              {household.members.map((member) => {
                const isCurrentMember = member.id === household.currentMemberId
                const balanceAccent = member.balance > 0 ? 'var(--pb-income)' : member.balance < 0 ? 'var(--pb-coral)' : 'var(--pb-ink-soft)'
                return (
                  <Box key={member.id} p={3} borderRadius="14px" border="1px solid var(--pb-hair)" bg={isCurrentMember ? 'var(--pb-tint-green)' : 'var(--pb-surface)'}>
                    <Flex
                      direction={{ base: 'column', sm: 'row' }}
                      align={{ base: 'stretch', sm: 'flex-start' }}
                      justify="space-between"
                      gap={3}
                    >
                      <HStack minW={0} spacing={0}>
                        <Box minW={0}>
                          <HStack spacing={1.5} flexWrap="wrap">
                            <Text fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{member.name}</Text>
                            {isCurrentMember && <Badge borderRadius="full" px={2} bg="var(--pb-surface)" textTransform="none">{t('household.common.you')}</Badge>}
                            {member.role === 'OWNER' && <Badge borderRadius="full" px={2} bg="var(--pb-tint-gold)" color="var(--pb-gold)" textTransform="none">{t('household.common.owner')}</Badge>}
                          </HStack>
                          <Text mt={0.5} color="var(--pb-ink-faint)" fontSize="xs" noOfLines={1}>{member.email}</Text>
                        </Box>
                      </HStack>
                      <Box flexShrink={0} textAlign={{ base: 'left', sm: 'right' }}>
                        <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500} color={balanceAccent} style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {member.balance > 0 ? '+' : ''}{formatCurrency(member.balance)}
                        </Text>
                        <Text fontFamily="var(--pb-mono)" fontSize="8px" color="var(--pb-ink-faint)" textTransform="uppercase">{t('household.members.netPosition')}</Text>
                      </Box>
                    </Flex>
                    <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={2} mt={3}>
                      <Box px={2.5} py={2} borderRadius="10px" bg="var(--pb-surface-2)">
                        <Text fontFamily="var(--pb-mono)" fontSize="8px" color="var(--pb-ink-faint)" textTransform="uppercase">{t('household.members.paid')}</Text>
                        <Text mt={0.5} fontSize="sm" fontWeight={700} color="var(--pb-ink)">{formatCurrency(member.totalPaid)}</Text>
                      </Box>
                      <Box px={2.5} py={2} borderRadius="10px" bg="var(--pb-surface-2)">
                        <Text fontFamily="var(--pb-mono)" fontSize="8px" color="var(--pb-ink-faint)" textTransform="uppercase">{t('household.members.assignedShare')}</Text>
                        <Text mt={0.5} fontSize="sm" fontWeight={700} color="var(--pb-ink)">{formatCurrency(member.totalShare)}</Text>
                      </Box>
                    </Grid>
                  </Box>
                )
              })}
            </VStack>
          </Box>
        </Grid>

        <Box overflow="hidden" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius={{ base: '18px', md: '22px' }} boxShadow="var(--pb-shadow)">
          <HouseholdSectionHeader
            eyebrow={t('household.expenses.eyebrow')}
            title={t('household.expenses.title')}
            description={t('household.expenses.description')}
            icon={<ReceiptText size={20} weight="duotone" />}
            accent="var(--pb-forest-2)"
            tint="var(--pb-tint-green)"
            stat={t(
              household.expenses.length === 1
                ? 'household.expenses.count.one'
                : 'household.expenses.count.other',
              { count: formatNumber(household.expenses.length) },
            )}
          />
          <Box p={{ base: 3, md: 4 }} bg="var(--pb-surface-2)">
            {household.expenses.length === 0 ? (
              <VStack py={9} spacing={3} border="1px dashed var(--pb-hair-2)" borderRadius="14px" bg="var(--pb-surface)">
                <Flex w={11} h={11} align="center" justify="center" borderRadius="full" bg="var(--pb-tint-green)" color="var(--pb-forest-2)">
                  <ReceiptText size={22} weight="duotone" />
                </Flex>
                <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500}>{t('household.expenses.emptyTitle')}</Text>
                <Text color="var(--pb-ink-soft)" fontSize="sm" textAlign="center">{t('household.expenses.emptyDescription')}</Text>
                <Button h="40px" leftIcon={<Plus size={16} />} bg="var(--pb-forest-2)" color="var(--pb-on-accent)" onClick={openNewExpense}>{t('household.expenses.addFirst')}</Button>
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={2.5}>
                {household.expenses.map((expense) => (
                  <Stack key={expense.id} direction="column" justify="space-between" gap={3} minH="132px" p={3} borderRadius="14px" border="1px solid var(--pb-hair)" bg="var(--pb-surface)">
                    <Flex
                      direction={{ base: 'column', sm: 'row' }}
                      align={{ base: 'stretch', sm: 'flex-start' }}
                      justify="space-between"
                      gap={3}
                    >
                      <HStack minW={0} spacing={3}>
                        <Flex w={10} h={10} flexShrink={0} align="center" justify="center" borderRadius="12px" bg="var(--pb-tint-green)" color="var(--pb-forest-2)">
                          <ReceiptText size={18} weight="duotone" />
                        </Flex>
                        <Box minW={0}>
                          <Text fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{expense.description}</Text>
                          <Text mt={0.5} color="var(--pb-ink-faint)" fontSize="xs" noOfLines={1}>{t('household.expenses.paidBy', { name: expense.payerName })}</Text>
                        </Box>
                      </HStack>
                      <Text flexShrink={0} fontFamily="var(--pb-serif)" fontSize="xl" fontWeight={500} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(expense.amount)}
                      </Text>
                    </Flex>
                    <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
                      <HStack spacing={1.5} flexWrap="wrap">
                        <Badge borderRadius="full" px={2} bg="var(--pb-tint-gold)" color="var(--pb-gold)" textTransform="none">{t(`household.category.${expense.category}`, undefined, expense.category)}</Badge>
                        <Text color="var(--pb-ink-faint)" fontSize="xs">
                          {t(
                            expense.shares.length === 1
                              ? 'household.expenses.shares.one'
                              : 'household.expenses.shares.other',
                            {
                              date: formatDate(expense.expenseDate, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }),
                              count: formatNumber(expense.shares.length),
                            },
                          )}
                        </Text>
                      </HStack>
                      <HStack spacing={1}>
                        {((expense.attachments ?? []).length > 0 || expense.canEdit) && (
                          <Button aria-label={t('household.expenses.proofAria', { description: expense.description })} h="34px" px={2.5} borderRadius="9px" variant="ghost" leftIcon={<Upload size={14} />} color="var(--pb-ink-soft)" onClick={() => openAttachments({ kind: 'expense', id: expense.id })}>
                            {t('household.expenses.proof', {
                              count: formatNumber((expense.attachments ?? []).length),
                            })}
                          </Button>
                        )}
                        {expense.canEdit && (
                          <IconButton aria-label={t('household.expenses.editAria', { description: expense.description })} icon={<Pencil size={16} />} h="34px" minW="34px" borderRadius="9px" variant="ghost" onClick={() => openEditExpense(expense)} />
                        )}
                      </HStack>
                    </Flex>
                  </Stack>
                ))}
              </SimpleGrid>
            )}
          </Box>
        </Box>

        <Box id="household-payments" overflow="hidden" scrollMarginTop="90px" bg="var(--pb-surface)" border="1px solid var(--pb-hair)" borderRadius={{ base: '18px', md: '22px' }} boxShadow="var(--pb-shadow)">
          <HouseholdSectionHeader
            eyebrow={t('household.settlements.eyebrow')}
            title={t('household.settlements.title')}
            description={t('household.settlements.description')}
            icon={<Mail size={20} weight="duotone" />}
            accent={pendingSettlementCount ? 'var(--pb-gold)' : 'var(--pb-income)'}
            tint={pendingSettlementCount ? 'var(--pb-tint-gold)' : 'var(--pb-tint-income)'}
            stat={pendingSettlementCount
              ? t('household.settlements.pending', {
                  count: formatNumber(pendingSettlementCount),
                })
              : t(
                  household.settlements.length === 1
                    ? 'household.settlements.count.one'
                    : 'household.settlements.count.other',
                  { count: formatNumber(household.settlements.length) },
                )}
          />
          <Box p={{ base: 3, md: 4 }} bg="var(--pb-surface-2)">
            {household.settlements.length === 0 ? (
              <VStack py={9} spacing={3} border="1px dashed var(--pb-hair-2)" borderRadius="14px" bg="var(--pb-surface)">
                <Flex w={11} h={11} align="center" justify="center" borderRadius="full" bg="var(--pb-tint-green)" color="var(--pb-forest-2)">
                  <Mail size={22} weight="duotone" />
                </Flex>
                <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500}>{t('household.settlements.emptyTitle')}</Text>
                <Text color="var(--pb-ink-soft)" fontSize="sm" textAlign="center">{t('household.settlements.emptyDescription')}</Text>
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={2.5}>
                {household.settlements.map((settlement) => {
                  const needsCurrentUserAction = settlement.canConfirm || settlement.canReject
                  const statusAccent = settlement.status === 'CONFIRMED' ? 'var(--pb-income)' : settlement.status === 'PENDING' ? 'var(--pb-gold)' : 'var(--pb-ink-faint)'
                  const statusTint = settlement.status === 'CONFIRMED' ? 'var(--pb-tint-income)' : settlement.status === 'PENDING' ? 'var(--pb-tint-gold)' : 'var(--pb-surface-3)'
                  return (
                    <Stack
                      key={settlement.id}
                      direction="column"
                      justify="space-between"
                      gap={3}
                      minH="142px"
                      p={3}
                      borderRadius="14px"
                      border="1px solid"
                      borderColor={needsCurrentUserAction ? 'var(--pb-gold)' : 'var(--pb-hair)'}
                      bg={needsCurrentUserAction ? 'var(--pb-tint-gold)' : 'var(--pb-surface)'}
                    >
                      <Flex
                        direction={{ base: 'column', sm: 'row' }}
                        align={{ base: 'stretch', sm: 'flex-start' }}
                        justify="space-between"
                        gap={3}
                      >
                        <HStack minW={0} spacing={0}>
                          <Box minW={0}>
                            <Text fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{t('household.record.paymentTitle', { from: settlement.fromMemberName, to: settlement.toMemberName })}</Text>
                            <Text mt={0.5} color="var(--pb-ink-faint)" fontSize="xs">{formatDate(settlement.settlementDate, { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                          </Box>
                        </HStack>
                        <Text flexShrink={0} fontFamily="var(--pb-serif)" fontSize="xl" fontWeight={500} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatCurrency(settlement.amount)}
                        </Text>
                      </Flex>
                      <Flex align="center" justify="space-between" gap={2} flexWrap="wrap">
                        <HStack spacing={1.5} flexWrap="wrap">
                          <Badge borderRadius="full" px={2.5} py={1} bg={statusTint} color={statusAccent} textTransform="capitalize">{t(`household.status.${settlement.status}`, undefined, settlement.status)}</Badge>
                          {needsCurrentUserAction && <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700} color="var(--pb-gold)" textTransform="uppercase">{t('household.settlements.review')}</Text>}
                        </HStack>
                        <HStack spacing={1} flexWrap="wrap" justify="flex-end">
                          {((settlement.attachments ?? []).length > 0 || settlement.canAttach) && (
                            <Button aria-label={t('household.settlements.proofAria', { name: settlement.fromMemberName })} h="34px" px={2.5} borderRadius="9px" variant="ghost" leftIcon={<Upload size={14} />} onClick={() => openAttachments({ kind: 'settlement', id: settlement.id })}>
                              {t('household.settlements.proof', {
                                count: formatNumber((settlement.attachments ?? []).length),
                              })}
                            </Button>
                          )}
                          {settlement.canConfirm && (
                            <Button h="34px" px={3} borderRadius="9px" bg="var(--pb-forest-2)" color="var(--pb-on-accent)" isLoading={busyAction === `confirm-${settlement.id}`} onClick={() => void applyAction(`confirm-${settlement.id}`, () => confirmHouseholdSettlement(household.id, settlement.id), t('household.settlements.confirmedToast'))}>
                              {t('household.common.confirm')}
                            </Button>
                          )}
                          {settlement.canReject && (
                            <Button h="34px" px={2.5} borderRadius="9px" variant="ghost" color="var(--pb-coral)" isLoading={busyAction === `reject-${settlement.id}`} onClick={() => void applyAction(`reject-${settlement.id}`, () => rejectHouseholdSettlement(household.id, settlement.id))}>
                              {t('household.common.reject')}
                            </Button>
                          )}
                          {settlement.canCancel && (
                            <Button h="34px" px={2.5} borderRadius="9px" variant="ghost" isLoading={busyAction === `cancel-${settlement.id}`} onClick={() => void applyAction(`cancel-${settlement.id}`, () => cancelHouseholdSettlement(household.id, settlement.id))}>
                              {t('household.common.cancel')}
                            </Button>
                          )}
                        </HStack>
                      </Flex>
                    </Stack>
                  )
                })}
              </SimpleGrid>
            )}
          </Box>
        </Box>
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
  busyDutyKey,
  onManage,
  onToggleDuty,
}: {
  rotation: HouseholdCleaningRotation
  currentMemberId: number
  busyDutyKey: string | null
  onManage: () => void
  onToggleDuty: (
    assignmentId: number,
    dutyKey: string,
    completed: boolean,
  ) => void
}) {
  const { formatDate, formatNumber, t } = useI18n()
  const current = rotation.currentWeek
  const firstUpcoming = rotation.upcomingWeeks[0]
  const currentIsUser = current?.assignedMemberId === currentMemberId
  const currentIsComplete = current?.status === 'COMPLETED'
  const displayedDuties = current?.duties?.length
    ? current.duties.map((duty) => ({
        ...duty,
        timed: duty.key === 'rubbish_out',
      }))
    : CLEANING_DUTIES.map((duty) => ({
        ...duty,
        schedule: duty.schedule ?? null,
        completed: false,
        canToggle: false,
        completedAt: null,
      }))
  const completedDutyCount = displayedDuties.filter((duty) => duty.completed).length
  const displayDutyLabel = (duty: { key: string; label: string }) =>
    t(`household.cleaning.duty.${duty.key}`, undefined, duty.label)
  const displayDutySchedule = (duty: { key: string; schedule?: string | null }) =>
    duty.key === 'rubbish_out'
      ? t('household.cleaning.rubbishSchedule')
      : duty.schedule
  const displayDate = (value: string) => formatDate(value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

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
              {t('household.cleaning.eyebrow')}
            </Text>
            <Text
              mt={0.5}
              fontFamily="var(--pb-serif)"
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight={500}
              lineHeight={1.1}
              color="var(--pb-ink)"
            >
              {t('household.cleaning.title')}
            </Text>
            <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="xs" noOfLines={1}>
              {t('household.cleaning.description')}
            </Text>
          </Box>
        </HStack>
        {rotation.canManage && (
          <Button
            leftIcon={<Icon as={Gear} boxSize={4} />}
            w={{ base: 'full', sm: 'auto' }}
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
            onClick={onManage}
            _hover={{ color: 'var(--pb-ink)', borderColor: 'var(--pb-hair-2)' }}
            _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)', outline: 'none' }}
          >
            {rotation.configured
              ? t('household.common.manage')
              : t('household.common.setUp')}
          </Button>
        )}
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
              {t('household.cleaning.createRhythm')}
            </Text>
            <Text mt={1} color="var(--pb-ink-soft)" fontSize="sm" lineHeight={1.5}>
              {rotation.canManage
                ? t('household.cleaning.setupOwner')
                : t('household.cleaning.setupMember')}
            </Text>
          </Box>
          <HStack spacing={2} flexWrap="wrap">
            {[
              'household.cleaning.step.members',
              'household.cleaning.step.monday',
              'household.cleaning.step.order',
            ].map((stepKey, index) => (
              <HStack
                key={stepKey}
                px={3}
                py={2}
                borderRadius="10px"
                bg="var(--pb-surface)"
                border="1px solid var(--pb-hair)"
                spacing={2}
              >
                <Text fontFamily="var(--pb-mono)" fontSize="8px" color="var(--pb-gold)">
                  {formatNumber(index + 1, { minimumIntegerDigits: 2, useGrouping: false })}
                </Text>
                <Text fontSize="xs" color="var(--pb-ink-soft)">{t(stepKey)}</Text>
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
              {t('household.cleaning.paused')}
            </Text>
            <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="sm">
              {t(
                rotation.participantMemberIds.length === 1
                  ? 'household.cleaning.pausedDetail.one'
                  : 'household.cleaning.pausedDetail.other',
                { count: formatNumber(rotation.participantMemberIds.length) },
              )}
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
            bg={currentIsUser ? 'var(--pb-tint-income)' : 'var(--pb-summary-petrol)'}
            boxShadow={currentIsUser
              ? 'inset 4px 0 0 var(--pb-forest-2)'
              : 'none'}
            aria-label={currentIsUser ? t('household.cleaning.yourWeekAria') : undefined}
          >
            {current ? (
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between" align="flex-start" spacing={3}>
                  <Box>
                    <HStack spacing={2} flexWrap="wrap">
                      <Text
                        fontFamily="var(--pb-mono)"
                        fontSize="9px"
                        fontWeight={600}
                        letterSpacing="0.15em"
                        textTransform="uppercase"
                        color="var(--pb-summary-ink-faint)"
                      >
                        {t('household.cleaning.onDuty')}
                      </Text>
                      {currentIsUser && (
                        <HStack
                          px={2}
                          py={1}
                          borderRadius="full"
                          bg="var(--pb-forest-2)"
                          color="var(--pb-on-accent)"
                          spacing={1}
                        >
                          <Icon as={Sparkles} boxSize={3} weight="fill" />
                          <Text
                            fontFamily="var(--pb-mono)"
                            fontSize="8px"
                            fontWeight={700}
                            letterSpacing="0.06em"
                            textTransform="uppercase"
                          >
                            {t('household.cleaning.yourWeek')}
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                    <Text mt={1} fontSize="xs" color="var(--pb-summary-ink-soft)">
                      {displayDate(current.weekStart)} – {displayDate(current.weekEnd)}
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
                      {currentIsComplete
                        ? t('household.cleaning.completed')
                        : t('household.cleaning.inProgress')}
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
                      {currentIsUser ? t('household.cleaning.yourTurn') : current.assignedMemberName}
                    </Text>
                  </HStack>
                  <Text mt={1.5} color="var(--pb-summary-ink-soft)" fontSize="sm">
                    {currentIsUser
                      ? t('household.cleaning.yourTurnDetail')
                      : t('household.cleaning.memberTurnDetail', {
                          name: current.assignedMemberName,
                        })}
                  </Text>
                </Box>

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
                      <Text fontSize="sm" fontWeight={600}>{t('household.cleaning.allDone')}</Text>
                      <Text mt={0.5} fontSize="xs" color="var(--pb-summary-ink-soft)">
                        {t('household.cleaning.nextMonday')}
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
                  {t('household.cleaning.scheduled')}
                </Text>
                <Text
                  fontFamily="var(--pb-serif)"
                  fontSize={{ base: 'xl', md: '2xl' }}
                  fontWeight={500}
                  color="var(--pb-summary-ink)"
                >
                  {t('household.cleaning.starts', {
                    date: displayDate(firstUpcoming?.weekStart ?? rotation.startDate ?? today()),
                  })}
                </Text>
                <Text color="var(--pb-summary-ink-soft)" fontSize="sm">
                  {t('household.cleaning.startsDetail')}
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
                  {t('household.cleaning.comingNext')}
                </Text>
                <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="xs">
                  {t('household.cleaning.nextThree')}
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
                  {t('household.cleaning.noUpcoming')}
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
                        {formatNumber(index + 1)}
                      </Flex>
                      <Box minW={0}>
                        <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
                          {assignment.assignedMemberId === currentMemberId
                            ? t('household.common.you')
                            : assignment.assignedMemberName}
                        </Text>
                        <Text color="var(--pb-ink-faint)" fontSize="2xs">
                          {displayDate(assignment.weekStart)}
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
                        {t('household.cleaning.yourTurn')}
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
              {t('household.cleaning.dutiesTitle')}
            </Text>
            <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="xs">
              {current
                ? currentIsUser
                  ? t('household.cleaning.dutiesCurrentUser')
                  : t('household.cleaning.dutiesOther', { name: current.assignedMemberName })
                : t('household.cleaning.dutiesGeneric')}
            </Text>
          </Box>
          <Box minW={{ base: 'full', sm: '150px' }}>
            <HStack justify={{ base: 'flex-start', sm: 'flex-end' }} spacing={1.5} color="var(--pb-ink-faint)">
              <Icon as={CheckCircle2} boxSize={3.5} weight="duotone" />
              <Text fontFamily="var(--pb-mono)" fontSize="8px" textTransform="uppercase">
                {current
                  ? t('household.cleaning.progress', {
                      completed: formatNumber(completedDutyCount),
                      total: formatNumber(displayedDuties.length),
                    })
                  : t(
                      displayedDuties.length === 1
                        ? 'household.cleaning.tasks.one'
                        : 'household.cleaning.tasks.other',
                      { count: formatNumber(displayedDuties.length) },
                    )}
              </Text>
            </HStack>
            <Box
              mt={2}
              h="4px"
              overflow="hidden"
              borderRadius="full"
              bg="var(--pb-surface-2)"
              aria-hidden="true"
            >
              <Box
                h="full"
                w={`${displayedDuties.length
                  ? (completedDutyCount / displayedDuties.length) * 100
                  : 0}%`}
                borderRadius="full"
                bg="var(--pb-forest-2)"
                transition="width 180ms ease"
              />
            </Box>
          </Box>
        </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={2}>
          {displayedDuties.map((duty, index) => (
            <Flex
              key={duty.key}
              minH={{ base: '58px', md: '62px' }}
              align="center"
              gap={2.5}
              px={3}
              py={2.5}
              borderRadius="12px"
              border="1px solid var(--pb-hair)"
              bg={
                duty.completed
                  ? 'var(--pb-tint-income)'
                  : duty.timed
                    ? 'var(--pb-tint-gold)'
                    : 'var(--pb-surface-2)'
              }
              transition="background 140ms ease, border-color 140ms ease, transform 140ms ease"
              _hover={duty.canToggle && busyDutyKey === null
                ? { borderColor: 'var(--pb-hair-2)', transform: 'translateY(-1px)' }
                : undefined}
              _focusWithin={{
                boxShadow: '0 0 0 2px var(--pb-forest)',
                outline: 'none',
              }}
            >
              <Flex
                w={8}
                h={8}
                flexShrink={0}
                align="center"
                justify="center"
                borderRadius="10px"
                bg={duty.completed ? 'var(--pb-forest-2)' : 'var(--pb-surface)'}
                color={duty.completed ? 'var(--pb-on-accent)' : 'var(--pb-forest-2)'}
              >
                {busyDutyKey === duty.key ? (
                  <Spinner size="sm" thickness="2px" />
                ) : (
                  <Checkbox
                    isChecked={duty.completed}
                    isDisabled={!duty.canToggle || busyDutyKey !== null}
                    colorScheme="green"
                    size="lg"
                    aria-label={
                      duty.completed
                        ? t('household.cleaning.markNotDone', {
                            duty: displayDutyLabel(duty),
                          })
                        : t('household.cleaning.markDone', {
                            duty: displayDutyLabel(duty),
                          })
                    }
                    onChange={(event) => {
                      if (!current || !duty.canToggle) return
                      onToggleDuty(current.id, duty.key, event.target.checked)
                    }}
                  />
                )}
              </Flex>
              <Box minW={0} flex={1}>
                <Text
                  color={duty.completed ? 'var(--pb-ink-soft)' : 'var(--pb-ink)'}
                  fontSize="sm"
                  fontWeight={600}
                  lineHeight={1.25}
                  textDecoration={duty.completed ? 'line-through' : 'none'}
                >
                  {displayDutyLabel(duty)}
                </Text>
                {duty.schedule ? (
                  <HStack
                    mt={1}
                    spacing={1.5}
                    color={duty.completed ? 'var(--pb-income)' : 'var(--pb-gold)'}
                  >
                    <Icon as={Clock} boxSize={3} weight="bold" />
                    <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700}>
                      {displayDutySchedule(duty)}
                    </Text>
                  </HStack>
                ) : (
                  <Text
                    mt={0.5}
                    color={duty.completed ? 'var(--pb-income)' : 'var(--pb-ink-faint)'}
                    fontSize="2xs"
                  >
                    {duty.completed
                      ? t('household.cleaning.completed')
                      : t('household.cleaning.taskNumber', {
                          number: formatNumber(index + 1, {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                          }),
                        })}
                  </Text>
                )}
              </Box>
              {duty.completed && duty.canToggle && (
                <Button
                  flexShrink={0}
                  h="30px"
                  minW="54px"
                  px={2.5}
                  borderRadius="8px"
                  bg="var(--pb-surface)"
                  color="var(--pb-ink-soft)"
                  border="1px solid var(--pb-hair)"
                  fontFamily="var(--pb-mono)"
                  fontSize="8px"
                  fontWeight={700}
                  textTransform="uppercase"
                  isDisabled={busyDutyKey !== null}
                  aria-label={t('household.cleaning.undoAria', {
                    duty: displayDutyLabel(duty),
                  })}
                  onClick={() => {
                    if (!current) return
                    onToggleDuty(current.id, duty.key, false)
                  }}
                  _hover={{ color: 'var(--pb-ink)', borderColor: 'var(--pb-hair-2)' }}
                  _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)' }}
                >
                  {t('household.cleaning.undo')}
                </Button>
              )}
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
  const { formatDate, formatNumber, t } = useI18n()
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
        const shortDate = (date: Date) => formatDate(date, {
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
      ToastService.warning({ title: t('household.cleaning.toast.selectMember') })
      return
    }
    if (!startDateIsMonday) {
      ToastService.warning({ title: t('household.cleaning.toast.startMonday') })
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
        title: rotation.configured
          ? t('household.cleaning.toast.updated')
          : t('household.cleaning.toast.created'),
      })
      onClose()
    } catch (error) {
      ToastService.apiError(error, { title: t('household.cleaning.toast.failed') })
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
          title={rotation.configured
            ? t('household.cleaning.modal.manageTitle')
            : t('household.cleaning.modal.setupTitle')}
          caption={t('household.cleaning.modal.caption')}
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
              {active
                ? t('household.cleaning.modal.active')
                : t('household.cleaning.modal.paused')}
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
            {t('household.common.cancel')}
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
            loadingText={t('household.common.saving')}
            isDisabled={!canSave}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            {t('household.cleaning.modal.save')}
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
                  {active
                    ? t('household.cleaning.modal.rotationActive')
                    : t('household.cleaning.modal.rotationPaused')}
                </Text>
                <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)">
                  {active
                    ? t('household.cleaning.modal.activeDetail')
                    : t('household.cleaning.modal.pausedDetail')}
                </Text>
              </Box>
            </HStack>
            <Switch
              aria-label={t('household.cleaning.modal.toggleAria')}
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
                      {t('household.cleaning.modal.schedule')}
                    </Text>
                    <Text fontSize="xs" color="var(--pb-ink-soft)">
                      {t('household.cleaning.modal.scheduleDetail')}
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
                    {t('household.cleaning.modal.firstWeek')}
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
                    {t('household.cleaning.modal.mondayError')}
                  </FormErrorMessage>
                  {startDateIsMonday && (
                    <Text mt={1.5} fontSize="xs" color="var(--pb-income)">
                      {t('household.cleaning.modal.mondaySelected')}
                    </Text>
                  )}
                </FormControl>
              </Box>

              <Divider borderColor="var(--pb-hair)" />

              <Box>
                <Flex justify="space-between" align="flex-end" gap={3} mb={3}>
                  <Box>
                    <Text fontFamily="var(--pb-serif)" fontSize="lg" fontWeight={500} color="var(--pb-ink)">
                      {t('household.cleaning.modal.order')}
                    </Text>
                    <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)">
                      {t('household.cleaning.modal.orderDetail')}
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
                    {t('household.cleaning.modal.selected', {
                      count: formatNumber(participants.length),
                    })}
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
                      {t('household.cleaning.modal.noMembers')}
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
                            {formatNumber(index + 1)}
                          </Flex>
                          <Box minW={0}>
                            <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
                              {member.name}
                            </Text>
                            <Text fontSize="2xs" color="var(--pb-ink-faint)">
                              {t('household.cleaning.modal.cycleWeek', {
                                week: formatNumber(index + 1),
                              })}
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
                            aria-label={t('household.cleaning.modal.moveEarlier', {
                              name: member.name,
                            })}
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
                            aria-label={t('household.cleaning.modal.moveLater', {
                              name: member.name,
                            })}
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
                            aria-label={t('household.cleaning.modal.removeMember', {
                              name: member.name,
                            })}
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
                      {t('household.cleaning.modal.addMember')}
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
                    {t('household.cleaning.modal.preview')}
                  </Text>
                  <Text mt={0.5} fontSize="xs" color="var(--pb-summary-ink-soft)">
                    {t('household.cleaning.modal.firstThree')}
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
                    {t('household.cleaning.modal.previewEmpty')}
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
                        {formatNumber(index + 1)}
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
                  ? t('household.cleaning.modal.cycleDetail', {
                      count: formatNumber(participants.length),
                    })
                  : t('household.cleaning.modal.cycleEmpty')}
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
  const { formatCurrency, formatNumber, t } = useI18n()
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
      ToastService.warning({ title: t('household.expenseModal.invalidAmount') })
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
          throw new Error(t('household.expenseModal.uploadTargetError'))
        }
        savedPage = await uploadHouseholdExpenseAttachments(
          household.id,
          targetId,
          files,
        )
      }
      onChanged(savedPage)
      ToastService.success({
        title: expense
          ? t('household.expenseModal.updatedToast')
          : t('household.expenseModal.addedToast'),
      })
      onClose()
    } catch (error) {
      if (savedPage) {
        onChanged(savedPage)
        ToastService.apiError(error, {
          title: t('household.expenseModal.imagesFailed'),
        })
        onClose()
      } else {
        ToastService.apiError(error, { title: t('household.expenseModal.saveFailed') })
      }
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!expense || !window.confirm(t('household.expenseModal.removeConfirm'))) return
    setDeleting(true)
    try {
      onChanged(await deleteHouseholdExpense(household.id, expense.id))
      ToastService.success({ title: t('household.expenseModal.removedToast') })
      onClose()
    } catch (error) {
      ToastService.apiError(error, { title: t('household.expenseModal.removeFailed') })
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
        <ModalHeader>
          {expense
            ? t('household.expenseModal.editTitle')
            : t('household.expenseModal.addTitle')}
        </ModalHeader>
        <ModalCloseButton aria-label={t('household.common.close')} />
        <ModalBody as="form" id="household-expense-form" onSubmit={submit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>{t('household.expenseModal.description')}</FormLabel>
              <Input
                value={description}
                maxLength={255}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t('household.expenseModal.descriptionPlaceholder')}
              />
            </FormControl>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('household.expenseModal.category')}</FormLabel>
                <Select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {t(`household.category.${item}`, undefined, item)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('household.expenseModal.amount')}</FormLabel>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder={t('household.expenseModal.amountPlaceholder')}
                />
              </FormControl>
            </SimpleGrid>
            <FormControl isRequired>
              <FormLabel>{t('household.expenseModal.date')}</FormLabel>
              <Input type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>{t('household.expenseModal.splitBetween')}</FormLabel>
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
                      {member.name}{isPayer ? ` (${t('household.expenseModal.payer')})` : ''}
                    </Checkbox>
                  )
                })}
              </SimpleGrid>
              <Text mt={2} color={muted} fontSize="xs">
                {t('household.expenseModal.splitPreview', {
                  count: formatNumber(participantIds.size),
                  amount: formatCurrency(preview),
                })}
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
                {t('household.common.remove')}
              </Button>
            )}
          </Box>
          <HStack w={{ base: 'full', sm: 'auto' }}>
            <Button flex={1} variant="ghost" onClick={onClose}>{t('household.common.cancel')}</Button>
            <Button
              flex={1}
              type="submit"
              form="household-expense-form"
              colorScheme="teal"
              isLoading={saving}
            >
              {expense
                ? t('household.expenseModal.saveChanges')
                : t('household.expenseModal.addExpense')}
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
  const { formatCurrency, t } = useI18n()
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
      ToastService.warning({ title: t('household.settlementModal.invalidAmount') })
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
          throw new Error(t('household.settlementModal.uploadTargetError'))
        }
        savedPage = await uploadHouseholdSettlementAttachments(
          household.id,
          settlementId,
          files,
        )
      }
      onChanged(savedPage)
      ToastService.success({
        title: t('household.settlementModal.sentToast'),
        description: t('household.settlementModal.confirmHint', {
          name: debt.toMemberName,
        }),
      })
      onClose()
    } catch (error) {
      if (savedPage) {
        onChanged(savedPage)
        ToastService.apiError(error, {
          title: t('household.settlementModal.imagesFailed'),
        })
        onClose()
      } else {
        ToastService.apiError(error, { title: t('household.settlementModal.saveFailed') })
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
        <ModalHeader>{t('household.settlementModal.title')}</ModalHeader>
        <ModalCloseButton aria-label={t('household.common.close')} />
        <ModalBody as="form" id="household-settlement-form" onSubmit={submit}>
          <VStack align="stretch" spacing={4}>
            <Box p={4} borderRadius="xl" bg={ed?.panelRaised ?? 'blackAlpha.50'}>
              <Text fontSize="sm">{t('household.settlementModal.paying')}</Text>
              <Text fontSize="xl" fontWeight={900}>{debt?.toMemberName}</Text>
              <Text fontSize="sm">
                {t('household.settlementModal.currentDebt', {
                  amount: formatCurrency(debt?.amount ?? 0),
                })}
              </Text>
            </Box>
            <FormControl isRequired>
              <FormLabel>{t('household.settlementModal.amountSent')}</FormLabel>
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
              <FormLabel>{t('household.settlementModal.date')}</FormLabel>
              <Input type="date" value={settlementDate} onChange={(event) => setSettlementDate(event.target.value)} />
            </FormControl>
            <Divider borderColor={ed?.line} />
            <AttachmentPicker files={files} onChange={setFiles} />
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button flex={{ base: 1, sm: 'initial' }} variant="ghost" onClick={onClose}>{t('household.common.cancel')}</Button>
          <Button
            flex={{ base: 1, sm: 'initial' }}
            type="submit"
            form="household-settlement-form"
            colorScheme="teal"
            isLoading={saving}
          >
            {t('household.settlementModal.submit')}
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
  const { t } = useI18n()
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
      ToastService.apiError(error, { title: t('household.manage.updateFailed') })
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
      t('household.manage.invitedToast'),
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
        <ModalHeader>{t('household.manage.title')}</ModalHeader>
        <ModalCloseButton aria-label={t('household.common.close')} />
        <ModalBody>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading size="sm" mb={3}>{t('household.manage.details')}</Heading>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={{ base: 'stretch', sm: 'flex-end' }}
              >
                <FormControl>
                  <FormLabel>{t('household.manage.name')}</FormLabel>
                  <Input value={name} maxLength={120} onChange={(event) => setName(event.target.value)} />
                </FormControl>
                <Button
                  isLoading={busy === 'rename'}
                  onClick={() => void act(
                    'rename',
                    () => updateHousehold(household.id, name),
                    t('household.manage.renamedToast'),
                  )}
                >
                  {t('household.common.save')}
                </Button>
              </Stack>
            </Box>

            <Divider borderColor={ed?.line} />

            <Box>
              <Heading size="sm" mb={1}>{t('household.manage.inviteTitle')}</Heading>
              <Text color={muted} fontSize="sm" mb={3}>
                {t('household.manage.inviteHint')}
              </Text>
              <Stack
                as="form"
                direction={{ base: 'column', sm: 'row' }}
                align={{ base: 'stretch', sm: 'flex-end' }}
                onSubmit={(event) => void invite(event)}
              >
                <FormControl isRequired>
                  <FormLabel>{t('household.manage.email')}</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t('household.manage.emailPlaceholder')}
                  />
                </FormControl>
                <Button type="submit" colorScheme="teal" isLoading={busy === 'invite'}>
                  {t('household.manage.invite')}
                </Button>
              </Stack>
            </Box>

            {household.pendingMemberInvitations.length > 0 && (
              <Box>
                <Heading size="xs" mb={3}>{t('household.manage.pendingInvitations')}</Heading>
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
                        aria-label={t('household.manage.revokeAria', {
                          name: invitation.targetName,
                        })}
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
              <Heading size="sm" mb={3}>{t('household.manage.activeMembers')}</Heading>
              <VStack align="stretch" spacing={2}>
                {household.members.map((member) => (
                  <HStack
                    key={member.id}
                    justify="space-between"
                    p={3}
                    borderRadius="lg"
                    bg={ed?.panelRaised ?? 'blackAlpha.50'}
                  >
                    <HStack minW={0} spacing={0}>
                      <Box minW={0}>
                        <HStack>
                          <Text fontWeight={800} noOfLines={1}>{member.name}</Text>
                        </HStack>
                        <Text color={muted} fontSize="xs" noOfLines={1}>{member.email}</Text>
                      </Box>
                    </HStack>
                    {member.role !== 'OWNER' && (
                      <IconButton
                        aria-label={t('household.manage.removeAria', { name: member.name })}
                        icon={<Trash2 size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        isLoading={busy === `remove-${member.id}`}
                        onClick={() => {
                          if (!window.confirm(t('household.manage.removeConfirm', {
                            name: member.name,
                          }))) return
                          void act(
                            `remove-${member.id}`,
                            () => removeHouseholdMember(household.id, member.id),
                            t('household.manage.removedToast'),
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
          <Button onClick={onClose}>{t('household.common.done')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
