import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
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
  markHouseholdNotificationsRead,
  rejectHouseholdSettlement,
  removeHouseholdMember,
  revokeHouseholdInvitation,
  updateHousehold,
  updateHouseholdMemberName,
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
  HouseholdCleaningAssignment,
  HouseholdCleaningDuty,
  HouseholdCleaningRotation,
  HouseholdDebt,
  HouseholdExpense,
  HouseholdExpenseRequest,
  HouseholdPageState,
  HouseholdSettlement,
} from '../../types'
import {
  Check,
  Broom,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  Clock,
  CookingPot,
  Drop,
  Flame,
  Gear,
  Home,
  Lightbulb,
  List,
  Mail,
  Pencil,
  Plus,
  Plant,
  ReceiptText,
  RefreshCw,
  Repeat,
  Sparkles,
  ToiletPaper,
  Trash2,
  Upload,
  Wallet,
  WifiHigh,
  X,
  Zap,
  type LucideIcon,
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
import { HouseholdNotificationsModal } from './HouseholdNotifications'

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
  'Garden',
  'Other',
] as const

type HouseholdExpensePreset = {
  key: 'electricity' | 'water' | 'gas' | 'internet' | 'cleaning' | 'garden' | 'kitchen' | 'toilet'
  category: typeof CATEGORIES[number]
  icon: LucideIcon
}

const HOUSEHOLD_EXPENSE_PRESETS: ReadonlyArray<HouseholdExpensePreset> = [
  { key: 'electricity', category: 'Electricity', icon: Lightbulb },
  { key: 'water', category: 'Water', icon: Drop },
  { key: 'gas', category: 'Gas', icon: Flame },
  { key: 'internet', category: 'Internet', icon: WifiHigh },
  { key: 'cleaning', category: 'Cleaning', icon: Broom },
  { key: 'garden', category: 'Garden', icon: Plant },
  { key: 'kitchen', category: 'Groceries', icon: CookingPot },
  { key: 'toilet', category: 'Cleaning', icon: ToiletPaper },
]

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
    { key: 'tea_towels', label: 'Wash the tea towels' },
    { key: 'cleaning_cloths', label: 'Wash the cleaning cloths' },
    { key: 'all_bins', label: 'Empty all bins' },
    {
      key: 'rubbish_out',
      label: 'Put the rubbish out',
      schedule: 'Every Thursday · by 10:00',
      timed: true,
    },
  ]

type DisplayedCleaningDuty = HouseholdCleaningDuty & {
  timed?: boolean
}
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
  onAction,
}: {
  ariaLabel: string
  icon: ReactNode
  accent: string
  tint: string
  count: number
  title: string
  detail: string
  actionLabel: string
  targetId?: string
  onAction?: () => void
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
        rightIcon={(
          <Icon
            as={onAction ? ChevronRight : ChevronDown}
            boxSize={4}
            weight="bold"
          />
        )}
        onClick={() => {
          if (onAction) {
            onAction()
            return
          }
          if (targetId) {
            document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
          }
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
  const { formatCurrency, formatNumber, t } = useI18n()
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
  const balancesOverviewModal = useDisclosure()
  const membersOverviewModal = useDisclosure()
  const recentExpensesModal = useDisclosure()
  const paymentsOverviewModal = useDisclosure()
  const notificationsModal = useDisclosure()

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

  const openNotificationExpenses = () => {
    notificationsModal.onClose()
    recentExpensesModal.onOpen()
  }

  const openNotificationPayments = () => {
    notificationsModal.onClose()
    paymentsOverviewModal.onOpen()
  }

  const openNotificationCleaning = () => {
    notificationsModal.onClose()
    requestAnimationFrame(() => {
      document.getElementById('household-cleaning')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const markNotificationsRead = () => void applyAction(
    'notifications-read',
    () => markHouseholdNotificationsRead(household.id),
  )

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
          onMembersOverview={membersOverviewModal.onOpen}
          onNotifications={notificationsModal.onOpen}
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
                onAction={paymentsOverviewModal.onOpen}
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
                onAction={balancesOverviewModal.onOpen}
              />
            )}
          </SimpleGrid>
        )}

        <Box id="household-cleaning" scrollMarginTop="90px">
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
        </Box>

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
            <Button
              w="full"
              h={{ base: '48px', md: '52px' }}
              borderRadius="12px"
              bg="var(--pb-forest-2)"
              color="var(--pb-on-accent)"
              rightIcon={<Icon as={ChevronRight} boxSize={4} weight="bold" />}
              aria-label={t('household.balances.openAria')}
              onClick={balancesOverviewModal.onOpen}
              _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
              _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)' }}
            >
              {t('household.balances.view')}
            </Button>
          </Box>
        </Box>

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
            <Button
              w="full"
              h={{ base: '48px', md: '52px' }}
              borderRadius="12px"
              bg="var(--pb-forest-2)"
              color="var(--pb-on-accent)"
              rightIcon={<Icon as={ChevronRight} boxSize={4} weight="bold" />}
              aria-label={t('household.expenses.openAria')}
              onClick={recentExpensesModal.onOpen}
              _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
              _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)' }}
            >
              {t('household.expenses.open')}
            </Button>
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
            <Button
              w="full"
              h={{ base: '48px', md: '52px' }}
              borderRadius="12px"
              bg="var(--pb-forest-2)"
              color="var(--pb-on-accent)"
              rightIcon={<Icon as={ChevronRight} boxSize={4} weight="bold" />}
              aria-label={t('household.settlements.openAria')}
              onClick={paymentsOverviewModal.onOpen}
              _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
              _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)' }}
            >
              {t('household.settlements.open')}
            </Button>
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
      <MembersOverviewModal
        isOpen={membersOverviewModal.isOpen}
        onClose={membersOverviewModal.onClose}
        household={household}
      />
      <BalancesOverviewModal
        isOpen={balancesOverviewModal.isOpen}
        onClose={balancesOverviewModal.onClose}
        household={household}
        onRecordPayment={(debt) => {
          balancesOverviewModal.onClose()
          openSettlement(debt)
        }}
      />
      <RecentExpensesModal
        isOpen={recentExpensesModal.isOpen}
        onClose={recentExpensesModal.onClose}
        household={household}
        onAddExpense={() => {
          recentExpensesModal.onClose()
          openNewExpense()
        }}
        onEditExpense={(expense) => {
          recentExpensesModal.onClose()
          openEditExpense(expense)
        }}
        onOpenAttachments={(expenseId) => {
          recentExpensesModal.onClose()
          openAttachments({ kind: 'expense', id: expenseId })
        }}
      />
      <PaymentsOverviewModal
        isOpen={paymentsOverviewModal.isOpen}
        onClose={paymentsOverviewModal.onClose}
        household={household}
        busyAction={busyAction}
        onOpenAttachments={(settlementId) => {
          paymentsOverviewModal.onClose()
          openAttachments({ kind: 'settlement', id: settlementId })
        }}
        onConfirm={(settlementId) => void applyAction(
          `confirm-${settlementId}`,
          () => confirmHouseholdSettlement(household.id, settlementId),
          t('household.settlements.confirmedToast'),
        )}
        onReject={(settlementId) => void applyAction(
          `reject-${settlementId}`,
          () => rejectHouseholdSettlement(household.id, settlementId),
        )}
        onCancel={(settlementId) => void applyAction(
          `cancel-${settlementId}`,
          () => cancelHouseholdSettlement(household.id, settlementId),
        )}
      />
      <CleaningRotationModal
        isOpen={cleaningRotationModal.isOpen}
        onClose={cleaningRotationModal.onClose}
        household={household}
        rotation={household.cleaningRotation}
        onChanged={setPage}
      />
      <HouseholdNotificationsModal
        isOpen={notificationsModal.isOpen}
        onClose={notificationsModal.onClose}
        notifications={household.notifications}
        unreadCount={household.unreadNotificationCount}
        onMarkAllRead={markNotificationsRead}
        isMarkingRead={busyAction === 'notifications-read'}
        onOpenExpenses={openNotificationExpenses}
        onOpenPayments={openNotificationPayments}
        onOpenCleaning={openNotificationCleaning}
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

function BalancesOverviewModal({
  isOpen,
  onClose,
  household,
  onRecordPayment,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  onRecordPayment: (debt: HouseholdDebt) => void
}) {
  const { formatCurrency, t } = useI18n()
  const outstandingTotal = household.debts.reduce(
    (total, debt) => total + debt.amount,
    0,
  )
  const hasOpenBalances = household.debts.length > 0

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <AppModalHeader
          icon={Wallet}
          title={t('household.balances.title')}
          caption={t('household.balances.description')}
          onClose={onClose}
          accent={hasOpenBalances ? 'red' : 'green'}
          rightSlot={
            <Badge
              bg={hasOpenBalances ? 'var(--pb-tint-coral)' : 'var(--pb-tint-income)'}
              color={hasOpenBalances ? 'var(--pb-coral)' : 'var(--pb-income)'}
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {hasOpenBalances
                ? t('household.balances.open', {
                  amount: formatCurrency(outstandingTotal),
                })
                : t('household.balances.allSettled')}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" w="full">
          <Button
            h="44px"
            w={{ base: 'full', sm: 'auto' }}
            px={5}
            borderRadius="11px"
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            onClick={onClose}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            {t('household.common.close')}
          </Button>
        </Flex>
      }
    >
      <Box p={{ base: 3, sm: 4, md: 5 }} bg="var(--pb-surface-2)">
        {!hasOpenBalances ? (
          <VStack
            py={9}
            px={4}
            spacing={3}
            border="1px dashed var(--pb-hair-2)"
            borderRadius="14px"
            bg="var(--pb-surface)"
          >
            <Flex
              w={11}
              h={11}
              align="center"
              justify="center"
              borderRadius="full"
              bg="var(--pb-tint-income)"
              color="var(--pb-income)"
            >
              <Check size={20} weight="bold" />
            </Flex>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="lg"
              fontWeight={500}
              textAlign="center"
            >
              {t('household.balances.everyoneSettled')}
            </Text>
            <Text color="var(--pb-ink-soft)" fontSize="sm" textAlign="center">
              {t('household.balances.noDebts')}
            </Text>
          </VStack>
        ) : (
          <VStack align="stretch" spacing={2.5}>
            {household.debts.map((debt) => {
              const youPay = debt.fromMemberId === household.currentMemberId
              const youReceive = debt.toMemberId === household.currentMemberId
              const accent = youPay
                ? 'var(--pb-coral)'
                : youReceive
                  ? 'var(--pb-income)'
                  : 'var(--pb-ink-soft)'
              const tint = youPay
                ? 'var(--pb-tint-coral)'
                : youReceive
                  ? 'var(--pb-tint-income)'
                  : 'var(--pb-surface)'

              return (
                <Stack
                  key={`${debt.fromMemberId}-${debt.toMemberId}`}
                  direction={{ base: 'column', sm: 'row' }}
                  align={{ base: 'stretch', sm: 'center' }}
                  justify="space-between"
                  gap={3}
                  p={{ base: 3.5, sm: 4 }}
                  borderRadius="14px"
                  border="1px solid var(--pb-hair)"
                  bg="var(--pb-surface)"
                >
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
                        <Badge
                          borderRadius="full"
                          px={2}
                          bg={tint}
                          color={accent}
                          textTransform="none"
                        >
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
                  <HStack
                    justify={{ base: 'space-between', sm: 'flex-end' }}
                    spacing={3}
                  >
                    <Text
                      fontFamily="var(--pb-serif)"
                      fontSize="xl"
                      fontWeight={500}
                      color={accent}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatCurrency(debt.amount)}
                    </Text>
                    {youPay && (
                      <Button
                        h="38px"
                        px={3.5}
                        borderRadius="10px"
                        bg="var(--pb-forest-2)"
                        color="var(--pb-on-accent)"
                        onClick={() => onRecordPayment(debt)}
                        _hover={{
                          bg: 'var(--pb-forest)',
                          transform: 'translateY(-1px)',
                        }}
                      >
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
    </PremiumModal>
  )
}

function MembersOverviewModal({
  isOpen,
  onClose,
  household,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
}) {
  const { formatCurrency, formatNumber, t } = useI18n()

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'lg' }}
      header={
        <AppModalHeader
          icon={Home}
          title={t('household.members.title')}
          caption={t('household.members.modalCaption')}
          onClose={onClose}
          accent="green"
          rightSlot={
            <Badge
              bg="var(--pb-tint-green)"
              color="var(--pb-forest-2)"
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {t(
                household.members.length === 1
                  ? 'household.members.count.one'
                  : 'household.members.count.other',
                { count: formatNumber(household.members.length) },
              )}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" w="full">
          <Button
            h="44px"
            w={{ base: 'full', sm: 'auto' }}
            px={5}
            borderRadius="11px"
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            onClick={onClose}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            {t('household.common.close')}
          </Button>
        </Flex>
      }
    >
      <VStack
        align="stretch"
        spacing={2.5}
        p={{ base: 3, sm: 4, md: 5 }}
        bg="var(--pb-surface-2)"
      >
        {household.members.map((member) => {
          const isCurrentMember = member.id === household.currentMemberId
          const isReceiving = member.balance > 0
          const isPaying = member.balance < 0
          const balanceAccent = isReceiving
            ? 'var(--pb-income)'
            : isPaying
              ? 'var(--pb-coral)'
              : 'var(--pb-ink-soft)'
          const balanceTint = isReceiving
            ? 'var(--pb-tint-income)'
            : isPaying
              ? 'var(--pb-tint-coral)'
              : 'var(--pb-surface-2)'
          const balanceLabel = isReceiving
            ? t('household.members.toReceive')
            : isPaying
              ? t('household.members.toPay')
              : t('household.members.settled')

          return (
            <Flex
              key={member.id}
              direction={{ base: 'column', sm: 'row' }}
              align={{ base: 'stretch', sm: 'center' }}
              justify="space-between"
              gap={3}
              p={{ base: 3.5, sm: 4 }}
              borderRadius="14px"
              border="1px solid var(--pb-hair)"
              bg={isCurrentMember ? 'var(--pb-tint-green)' : 'var(--pb-surface)'}
            >
              <HStack minW={0} spacing={1.5} flexWrap="wrap">
                <Text fontWeight={700} color="var(--pb-ink)" noOfLines={1}>
                  {member.name}
                </Text>
                {isCurrentMember && (
                  <Badge
                    borderRadius="full"
                    px={2}
                    bg="var(--pb-surface)"
                    textTransform="none"
                  >
                    {t('household.common.you')}
                  </Badge>
                )}
                {member.role === 'OWNER' && (
                  <Badge
                    borderRadius="full"
                    px={2}
                    bg="var(--pb-tint-gold)"
                    color="var(--pb-gold)"
                    textTransform="none"
                  >
                    {t('household.common.owner')}
                  </Badge>
                )}
              </HStack>

              <Flex
                align="center"
                justify="space-between"
                gap={3}
                minW={{ base: 'full', sm: '190px' }}
                px={3}
                py={2.5}
                borderRadius="11px"
                bg={balanceTint}
                border="1px solid var(--pb-hair)"
              >
                <Text
                  fontFamily="var(--pb-mono)"
                  fontSize="8px"
                  fontWeight={700}
                  color={balanceAccent}
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  {balanceLabel}
                </Text>
                <Text
                  flexShrink={0}
                  fontFamily="var(--pb-serif)"
                  fontSize="xl"
                  fontWeight={500}
                  color={balanceAccent}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatCurrency(Math.abs(member.balance))}
                </Text>
              </Flex>
            </Flex>
          )
        })}
      </VStack>
    </PremiumModal>
  )
}

function RecentExpensesModal({
  isOpen,
  onClose,
  household,
  onAddExpense,
  onEditExpense,
  onOpenAttachments,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  onAddExpense: () => void
  onEditExpense: (expense: HouseholdExpense) => void
  onOpenAttachments: (expenseId: number) => void
}) {
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()

  const expensesByMonth = useMemo(() => {
    const grouped = new Map<string, HouseholdExpense[]>()
    for (const expense of household.expenses) {
      const month = expense.expenseDate.slice(0, 7)
      if (!grouped.has(month)) grouped.set(month, [])
      grouped.get(month)!.push(expense)
    }
    return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [household.expenses])

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <AppModalHeader
          icon={ReceiptText}
          title={t('household.expenses.title')}
          caption={t('household.expenses.description')}
          onClose={onClose}
          accent="green"
          rightSlot={
            <Badge
              bg="var(--pb-tint-green)"
              color="var(--pb-forest-2)"
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {t(
                household.expenses.length === 1
                  ? 'household.expenses.count.one'
                  : 'household.expenses.count.other',
                { count: formatNumber(household.expenses.length) },
              )}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" w="full">
          <Button
            h="44px"
            w={{ base: 'full', sm: 'auto' }}
            px={5}
            borderRadius="11px"
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            onClick={onClose}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            {t('household.common.close')}
          </Button>
        </Flex>
      }
    >
      <Box p={{ base: 3, sm: 4, md: 5 }} bg="var(--pb-surface-2)">
        {household.expenses.length === 0 ? (
          <VStack
            py={9}
            px={4}
            spacing={3}
            border="1px dashed var(--pb-hair-2)"
            borderRadius="14px"
            bg="var(--pb-surface)"
          >
            <Flex
              w={11}
              h={11}
              align="center"
              justify="center"
              borderRadius="full"
              bg="var(--pb-tint-green)"
              color="var(--pb-forest-2)"
            >
              <ReceiptText size={22} weight="duotone" />
            </Flex>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="lg"
              fontWeight={500}
              textAlign="center"
            >
              {t('household.expenses.emptyTitle')}
            </Text>
            <Text color="var(--pb-ink-soft)" fontSize="sm" textAlign="center">
              {t('household.expenses.emptyDescription')}
            </Text>
            <Button
              h="40px"
              leftIcon={<Plus size={16} />}
              bg="var(--pb-forest-2)"
              color="var(--pb-on-accent)"
              onClick={onAddExpense}
              _hover={{ bg: 'var(--pb-forest)' }}
            >
              {t('household.expenses.addFirst')}
            </Button>
          </VStack>
        ) : (
          <VStack spacing={6} align="stretch">
            {expensesByMonth.map(([monthKey, expenses]) => {
              const [year, month] = monthKey.split('-')
              const monthDate = new Date(Number(year), Number(month) - 1, 1)
              const monthLabel = formatDate(monthDate, { month: 'long', year: 'numeric' })

              return (
                <Box key={monthKey}>
                  <Text
                    fontFamily="var(--pb-mono)"
                    fontSize="xs"
                    fontWeight={700}
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color="var(--pb-ink-faint)"
                    mb={3}
                  >
                    {monthLabel}
                  </Text>
                  <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={2.5}>
                    {expenses.map((expense) => {
                      const currentShare = expense.shares.find(
                        (share) => share.memberId === household.currentMemberId,
                      )
                      const attachmentCount = (expense.attachments ?? []).length
                      const canOpenProof = attachmentCount > 0 || expense.canEdit
                      const hasFooter = Boolean(currentShare || canOpenProof || expense.canEdit)

                      return (
                        <Stack
                          key={expense.id}
                          direction="column"
                          gap={0}
                          h="full"
                          p={{ base: 3.5, sm: 4 }}
                          borderRadius="14px"
                          border="1px solid var(--pb-hair)"
                          bg="var(--pb-surface)"
                        >
                          <Flex align="flex-start" justify="space-between" gap={4} pb={3}>
                            <Box minW={0}>
                              <Text
                                fontSize="md"
                                fontWeight={700}
                                lineHeight={1.25}
                                color="var(--pb-ink)"
                                noOfLines={2}
                              >
                                {expense.description}
                              </Text>
                              <Text mt={1} color="var(--pb-ink-faint)" fontSize="xs" noOfLines={1}>
                                {t('household.expenses.paidBy', { name: expense.payerName })}
                              </Text>
                            </Box>
                            <Box flexShrink={0} textAlign="right">
                              <Text
                                fontFamily="var(--pb-mono)"
                                fontSize="8px"
                                fontWeight={700}
                                letterSpacing="0.08em"
                                textTransform="uppercase"
                                color="var(--pb-ink-faint)"
                              >
                                {t('household.expenses.total')}
                              </Text>
                              <Text
                                mt={0.5}
                                fontFamily="var(--pb-serif)"
                                fontSize="xl"
                                fontWeight={500}
                                lineHeight={1}
                                color="var(--pb-ink)"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {formatCurrency(expense.amount)}
                              </Text>
                            </Box>
                          </Flex>

                          <HStack
                            spacing={2}
                            py={2.5}
                            borderTop="1px solid var(--pb-hair)"
                            flexWrap="wrap"
                          >
                            <Badge
                              flexShrink={0}
                              borderRadius="full"
                              px={2}
                              bg="var(--pb-tint-gold)"
                              color="var(--pb-gold)"
                              textTransform="none"
                            >
                              {t(
                                `household.category.${expense.category}`,
                                undefined,
                                expense.category,
                              )}
                            </Badge>
                            <Text color="var(--pb-ink-faint)" fontSize="xs" lineHeight={1.4}>
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

                          {hasFooter && (
                            <Flex
                              align="center"
                              justify="space-between"
                              gap={3}
                              pt={2.5}
                              mt="auto"
                              borderTop="1px solid var(--pb-hair)"
                            >
                              {currentShare ? (
                                <HStack spacing={2} minW={0}>
                                  <Text
                                    fontFamily="var(--pb-mono)"
                                    fontSize="8px"
                                    fontWeight={700}
                                    letterSpacing="0.06em"
                                    textTransform="uppercase"
                                    color="var(--pb-ink-faint)"
                                  >
                                    {t('household.expenses.yourShare')}
                                  </Text>
                                  <Text
                                    flexShrink={0}
                                    fontFamily="var(--pb-serif)"
                                    fontSize="md"
                                    fontWeight={500}
                                    color="var(--pb-forest-2)"
                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                  >
                                    {formatCurrency(currentShare.amount)}
                                  </Text>
                                </HStack>
                              ) : (
                                <Box />
                              )}
                              <HStack spacing={1} flexShrink={0}>
                                {canOpenProof && (
                                  <Button
                                    aria-label={t('household.expenses.proofAria', {
                                      description: expense.description,
                                    })}
                                    h="32px"
                                    px={2.5}
                                    borderRadius="9px"
                                    variant="ghost"
                                    leftIcon={<Upload size={14} />}
                                    color="var(--pb-ink-soft)"
                                    fontSize="xs"
                                    onClick={() => onOpenAttachments(expense.id)}
                                  >
                                    {t('household.expenses.proof', {
                                      count: formatNumber(attachmentCount),
                                    })}
                                  </Button>
                                )}
                                {expense.canEdit && (
                                  <IconButton
                                    aria-label={t('household.expenses.editAria', {
                                      description: expense.description,
                                    })}
                                    icon={<Pencil size={15} />}
                                    h="32px"
                                    minW="32px"
                                    borderRadius="9px"
                                    variant="ghost"
                                    onClick={() => onEditExpense(expense)}
                                  />
                                )}
                              </HStack>
                            </Flex>
                          )}
                        </Stack>
                      )
                    })}
                  </SimpleGrid>
                </Box>
              )
            })}
          </VStack>
        )}
      </Box>
    </PremiumModal>
  )
}

function PaymentsOverviewModal({
  isOpen,
  onClose,
  household,
  busyAction,
  onOpenAttachments,
  onConfirm,
  onReject,
  onCancel,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  busyAction: string | null
  onOpenAttachments: (settlementId: number) => void
  onConfirm: (settlementId: number) => void
  onReject: (settlementId: number) => void
  onCancel: (settlementId: number) => void
}) {
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()
  const pendingCount = household.settlements.filter(
    (settlement) => settlement.status === 'PENDING',
  ).length

  const settlementsByMonth = useMemo(() => {
    const grouped = new Map<string, HouseholdSettlement[]>()
    for (const settlement of household.settlements) {
      const month = settlement.settlementDate.slice(0, 7)
      if (!grouped.has(month)) grouped.set(month, [])
      grouped.get(month)!.push(settlement)
    }
    return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [household.settlements])

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <AppModalHeader
          icon={Mail}
          title={t('household.settlements.title')}
          caption={t('household.settlements.description')}
          onClose={onClose}
          accent={pendingCount ? 'violet' : 'green'}
          rightSlot={
            <Badge
              bg={pendingCount ? 'var(--pb-tint-gold)' : 'var(--pb-tint-income)'}
              color={pendingCount ? 'var(--pb-gold)' : 'var(--pb-income)'}
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {pendingCount
                ? t('household.settlements.pending', {
                  count: formatNumber(pendingCount),
                })
                : t(
                  household.settlements.length === 1
                    ? 'household.settlements.count.one'
                    : 'household.settlements.count.other',
                  { count: formatNumber(household.settlements.length) },
                )}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" w="full">
          <Button
            h="44px"
            w={{ base: 'full', sm: 'auto' }}
            px={5}
            borderRadius="11px"
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            onClick={onClose}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            {t('household.common.close')}
          </Button>
        </Flex>
      }
    >
      <Box p={{ base: 3, sm: 4, md: 5 }} bg="var(--pb-surface-2)">
        {household.settlements.length === 0 ? (
          <VStack
            py={9}
            px={4}
            spacing={3}
            border="1px dashed var(--pb-hair-2)"
            borderRadius="14px"
            bg="var(--pb-surface)"
          >
            <Flex
              w={11}
              h={11}
              align="center"
              justify="center"
              borderRadius="full"
              bg="var(--pb-tint-green)"
              color="var(--pb-forest-2)"
            >
              <Mail size={22} weight="duotone" />
            </Flex>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="lg"
              fontWeight={500}
              textAlign="center"
            >
              {t('household.settlements.emptyTitle')}
            </Text>
            <Text color="var(--pb-ink-soft)" fontSize="sm" textAlign="center">
              {t('household.settlements.emptyDescription')}
            </Text>
          </VStack>
        ) : (
          <VStack spacing={6} align="stretch">
            {settlementsByMonth.map(([monthKey, settlements]) => {
              const [year, month] = monthKey.split('-')
              const monthDate = new Date(Number(year), Number(month) - 1, 1)
              const monthLabel = formatDate(monthDate, { month: 'long', year: 'numeric' })

              return (
                <Box key={monthKey}>
                  <Text
                    fontFamily="var(--pb-mono)"
                    fontSize="xs"
                    fontWeight={700}
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color="var(--pb-ink-faint)"
                    mb={3}
                  >
                    {monthLabel}
                  </Text>
                  <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={2.5}>
                    {settlements.map((settlement) => {
                      const needsCurrentUserAction = settlement.canConfirm || settlement.canReject
                      const statusAccent = settlement.status === 'CONFIRMED'
                        ? 'var(--pb-income)'
                        : settlement.status === 'PENDING'
                          ? 'var(--pb-gold)'
                          : 'var(--pb-ink-faint)'
                      const statusTint = settlement.status === 'CONFIRMED'
                        ? 'var(--pb-tint-income)'
                        : settlement.status === 'PENDING'
                          ? 'var(--pb-tint-gold)'
                          : 'var(--pb-surface-3)'

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
                          borderColor={needsCurrentUserAction
                            ? 'var(--pb-gold)'
                            : 'var(--pb-hair)'}
                          bg={needsCurrentUserAction
                            ? 'var(--pb-tint-gold)'
                            : 'var(--pb-surface)'}
                        >
                          <Flex
                            direction={{ base: 'column', sm: 'row' }}
                            align={{ base: 'stretch', sm: 'flex-start' }}
                            justify="space-between"
                            gap={3}
                          >
                            <Box minW={0}>
                              <Text fontWeight={700} color="var(--pb-ink)" noOfLines={1}>
                                {t('household.record.paymentTitle', {
                                  from: settlement.fromMemberName,
                                  to: settlement.toMemberName,
                                })}
                              </Text>
                              <Text mt={0.5} color="var(--pb-ink-faint)" fontSize="xs">
                                {formatDate(settlement.settlementDate, {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </Text>
                            </Box>
                            <Text
                              flexShrink={0}
                              fontFamily="var(--pb-serif)"
                              fontSize="xl"
                              fontWeight={500}
                              color="var(--pb-ink)"
                              style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {formatCurrency(settlement.amount)}
                            </Text>
                          </Flex>

                          <Flex align="center" justify="space-between" gap={2} flexWrap="wrap">
                            <HStack spacing={1.5} flexWrap="wrap">
                              <Badge
                                borderRadius="full"
                                px={2.5}
                                py={1}
                                bg={statusTint}
                                color={statusAccent}
                                textTransform="capitalize"
                              >
                                {t(
                                  `household.status.${settlement.status}`,
                                  undefined,
                                  settlement.status,
                                )}
                              </Badge>
                              {needsCurrentUserAction && (
                                <Text
                                  fontFamily="var(--pb-mono)"
                                  fontSize="8px"
                                  fontWeight={700}
                                  color="var(--pb-gold)"
                                  textTransform="uppercase"
                                >
                                  {t('household.settlements.review')}
                                </Text>
                              )}
                            </HStack>

                            <HStack spacing={1} flexWrap="wrap" justify="flex-end">
                              {((settlement.attachments ?? []).length > 0
                                || settlement.canAttach) && (
                                  <Button
                                    aria-label={t('household.settlements.proofAria', {
                                      name: settlement.fromMemberName,
                                    })}
                                    h="34px"
                                    px={2.5}
                                    borderRadius="9px"
                                    variant="ghost"
                                    leftIcon={<Upload size={14} />}
                                    onClick={() => onOpenAttachments(settlement.id)}
                                  >
                                    {t('household.settlements.proof', {
                                      count: formatNumber((settlement.attachments ?? []).length),
                                    })}
                                  </Button>
                                )}
                              {settlement.canConfirm && (
                                <Button
                                  h="34px"
                                  px={3}
                                  borderRadius="9px"
                                  bg="var(--pb-forest-2)"
                                  color="var(--pb-on-accent)"
                                  isLoading={busyAction === `confirm-${settlement.id}`}
                                  onClick={() => onConfirm(settlement.id)}
                                >
                                  {t('household.common.confirm')}
                                </Button>
                              )}
                              {settlement.canReject && (
                                <Button
                                  h="34px"
                                  px={2.5}
                                  borderRadius="9px"
                                  variant="ghost"
                                  color="var(--pb-coral)"
                                  isLoading={busyAction === `reject-${settlement.id}`}
                                  onClick={() => onReject(settlement.id)}
                                >
                                  {t('household.common.reject')}
                                </Button>
                              )}
                              {settlement.canCancel && (
                                <Button
                                  h="34px"
                                  px={2.5}
                                  borderRadius="9px"
                                  variant="ghost"
                                  isLoading={busyAction === `cancel-${settlement.id}`}
                                  onClick={() => onCancel(settlement.id)}
                                >
                                  {t('household.common.cancel')}
                                </Button>
                              )}
                            </HStack>
                          </Flex>
                        </Stack>
                      )
                    })}
                  </SimpleGrid>
                </Box>
              )
            })}
          </VStack>
        )}
      </Box>
    </PremiumModal>
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
  const dutiesModal = useDisclosure()
  const current = rotation.currentWeek
  const firstUpcoming = rotation.upcomingWeeks[0]
  const currentIsUser = current?.assignedMemberId === currentMemberId
  const currentIsComplete = current?.status === 'COMPLETED'
  const displayedDuties: DisplayedCleaningDuty[] = current?.duties?.length
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
  const displayDate = (value: string) => formatDate(value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <>
      <Box
        overflow="hidden"
        bg="var(--pb-surface)"
        border="1px solid var(--pb-hair)"
        borderRadius={{ base: '24px', md: '28px' }}
        boxShadow="0 10px 40px -10px rgba(0,0,0,0.08)"
        transition="transform 0.2s, box-shadow 0.2s"
        _hover={{ transform: 'translateY(-2px)', boxShadow: '0 12px 48px -12px rgba(0,0,0,0.12)' }}
      >
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', sm: 'center' }}
          gap={{ base: 4, sm: 4 }}
          px={{ base: 5, md: 6 }}
          py={{ base: 5, md: 5 }}
          bgGradient="linear(to-br, var(--pb-forest-2), var(--pb-forest))"
          color="white"
        >
          <HStack spacing={4} minW={0}>
            <Flex
              w={{ base: 12, md: 14 }}
              h={{ base: 12, md: 14 }}
              flexShrink={0}
              align="center"
              justify="center"
              borderRadius="16px"
              bg="rgba(255,255,255,0.15)"
              color="var(--pb-gold)"
              backdropFilter="blur(10px)"
              boxShadow="0 4px 12px rgba(0,0,0,0.1)"
            >
              <Icon as={Sparkles} boxSize={6} weight="duotone" />
            </Flex>
            <Box minW={0}>
              <Text
                fontFamily="var(--pb-mono)"
                fontSize="10px"
                fontWeight={700}
                letterSpacing="0.16em"
                textTransform="uppercase"
                color="rgba(255,255,255,0.7)"
              >
                {t('household.cleaning.eyebrow')}
              </Text>
              <Text
                mt={0.5}
                fontFamily="var(--pb-serif)"
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight={600}
                lineHeight={1.1}
                color="white"
                textShadow="0 1px 2px rgba(0,0,0,0.1)"
              >
                {t('household.cleaning.title')}
              </Text>
              <Text mt={1} color="rgba(255,255,255,0.85)" fontSize="sm" noOfLines={1}>
                {t('household.cleaning.description')}
              </Text>
            </Box>
          </HStack>
          {rotation.canManage && (
            <Button
              leftIcon={<Icon as={Gear} boxSize={4} />}
              w={{ base: 'full', sm: 'auto' }}
              h="44px"
              px={4}
              borderRadius="12px"
              bg="rgba(255,255,255,0.15)"
              color="white"
              fontFamily="var(--pb-mono)"
              fontSize="10px"
              fontWeight={700}
              letterSpacing="0.05em"
              textTransform="uppercase"
              backdropFilter="blur(10px)"
              border="none"
              onClick={onManage}
              _hover={{ bg: 'rgba(255,255,255,0.25)' }}
              _active={{ bg: 'rgba(255,255,255,0.3)' }}
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
              p={{ base: 5, md: 6 }}
              borderBottom={{ base: '1px solid', lg: 'none' }}
              borderRight={{ base: 'none', lg: '1px solid' }}
              borderColor="var(--pb-hair)"
              bg={currentIsUser ? 'var(--pb-tint-income)' : 'var(--pb-surface)'}
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
          px={{ base: 5, md: 6 }}
          py={{ base: 5, md: 6 }}
          bg="var(--pb-surface-2)"
        >
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            align={{ base: 'stretch', sm: 'center' }}
            justify="space-between"
            gap={{ base: 5, sm: 6 }}
          >
            <Box minW={0} flex={1}>
              <Text
                fontFamily="var(--pb-mono)"
                color="var(--pb-ink-soft)"
                fontSize="10px"
                fontWeight={700}
                letterSpacing="0.15em"
                textTransform="uppercase"
              >
                {t('household.cleaning.dutiesTitle')}
              </Text>
              <Text mt={1} color="var(--pb-ink-soft)" fontSize="sm">
                {current
                  ? currentIsUser
                    ? t('household.cleaning.dutiesCurrentUser')
                    : t('household.cleaning.dutiesOther', { name: current.assignedMemberName })
                  : t('household.cleaning.dutiesGeneric')}
              </Text>
              <HStack mt={3.5} spacing={2} color="var(--pb-ink-soft)">
                <Icon as={CheckCircle2} boxSize={4} weight="duotone" />
                <Text fontFamily="var(--pb-mono)" fontSize="9px" fontWeight={700} textTransform="uppercase">
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
                mt={2.5}
                h="6px"
                maxW={{ base: 'full', sm: '280px' }}
                overflow="hidden"
                borderRadius="full"
                bg="var(--pb-surface)"
                border="1px solid var(--pb-hair)"
                aria-hidden="true"
              >
                <Box
                  h="full"
                  w={`${displayedDuties.length
                    ? (completedDutyCount / displayedDuties.length) * 100
                    : 0}%`}
                  borderRadius="full"
                  bgGradient="linear(to-r, var(--pb-forest-2), var(--pb-forest))"
                  transition="width 400ms cubic-bezier(0.4, 0, 0.2, 1)"
                />
              </Box>
            </Box>
            <Button
              h="52px"
              w={{ base: 'full', sm: 'auto' }}
              flexShrink={0}
              px={6}
              borderRadius="16px"
              bg="var(--pb-forest-2)"
              color="var(--pb-on-accent)"
              fontSize="md"
              fontWeight={600}
              leftIcon={<Icon as={List} boxSize={5} weight="bold" />}
              aria-label={t('household.cleaning.openDutiesAria')}
              onClick={dutiesModal.onOpen}
              _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
              _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)' }}
              boxShadow="0 4px 12px rgba(0,0,0,0.15)"
            >
              {t('household.cleaning.openDuties')}
            </Button>
          </Flex>
        </Box>
      </Box>

      <CleaningDutiesModal
        isOpen={dutiesModal.isOpen}
        onClose={dutiesModal.onClose}
        current={current}
        currentIsUser={currentIsUser}
        duties={displayedDuties}
        busyDutyKey={busyDutyKey}
        onToggleDuty={onToggleDuty}
      />
    </>
  )
}

function CleaningDutiesModal({
  isOpen,
  onClose,
  current,
  currentIsUser,
  duties,
  busyDutyKey,
  onToggleDuty,
}: {
  isOpen: boolean
  onClose: () => void
  current: HouseholdCleaningAssignment | null
  currentIsUser: boolean
  duties: DisplayedCleaningDuty[]
  busyDutyKey: string | null
  onToggleDuty: (
    assignmentId: number,
    dutyKey: string,
    completed: boolean,
  ) => void
}) {
  const { formatNumber, t } = useI18n()
  const completedDutyCount = duties.filter((duty) => duty.completed).length
  const progressLabel = current
    ? t('household.cleaning.progress', {
      completed: formatNumber(completedDutyCount),
      total: formatNumber(duties.length),
    })
    : t(
      duties.length === 1
        ? 'household.cleaning.tasks.one'
        : 'household.cleaning.tasks.other',
      { count: formatNumber(duties.length) },
    )
  const guidance = current
    ? currentIsUser
      ? t('household.cleaning.dutiesCurrentUser')
      : t('household.cleaning.dutiesOther', { name: current.assignedMemberName })
    : t('household.cleaning.dutiesGeneric')
  const displayDutyLabel = (duty: { key: string; label: string }) =>
    t(`household.cleaning.duty.${duty.key}`, undefined, duty.label)
  const displayDutySchedule = (duty: { key: string; schedule?: string | null }) =>
    duty.key === 'rubbish_out'
      ? t('household.cleaning.rubbishSchedule')
      : duty.schedule

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <AppModalHeader
          icon={List}
          title={t('household.cleaning.dutiesModalTitle')}
          caption={t('household.cleaning.dutiesModalCaption')}
          onClose={onClose}
          accent="green"
          rightSlot={
            <Badge
              bg="var(--pb-tint-income)"
              color="var(--pb-income)"
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {progressLabel}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" w="full">
          <Button
            h="44px"
            w={{ base: 'full', sm: 'auto' }}
            px={5}
            borderRadius="11px"
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            onClick={onClose}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            {t('household.common.done')}
          </Button>
        </Flex>
      }
    >
      <Box px={{ base: 4, sm: 5, md: 6 }} py={{ base: 4, md: 5 }}>
        <Box
          mb={6}
          p={{ base: 5, md: 6 }}
          borderRadius="24px"
          bgGradient="linear(to-br, var(--pb-forest-2), var(--pb-forest))"
          color="white"
          boxShadow="0 8px 32px -8px rgba(0,0,0,0.15)"
          aria-live="polite"
          aria-atomic="true"
        >
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            align={{ base: 'stretch', sm: 'center' }}
            justify="space-between"
            gap={4}
          >
            <Box>
              <Text fontFamily="var(--pb-mono)" fontSize="10px" fontWeight={700} letterSpacing="0.1em" textTransform="uppercase" color="rgba(255,255,255,0.7)">
                {t('household.cleaning.dutiesTitle')}
              </Text>
              <Text mt={1} color="white" fontSize="md" fontWeight={500} lineHeight={1.4}>
                {guidance}
              </Text>
            </Box>
            <HStack flexShrink={0} spacing={2} px={3.5} py={2} bg="rgba(255,255,255,0.15)" borderRadius="full" backdropFilter="blur(10px)">
              <Icon as={CheckCircle2} boxSize={4} weight="fill" color="var(--pb-gold)" />
              <Text fontFamily="var(--pb-mono)" fontSize="10px" fontWeight={700} textTransform="uppercase">
                {progressLabel}
              </Text>
            </HStack>
          </Flex>
          <Box
            mt={5}
            h="6px"
            overflow="hidden"
            borderRadius="full"
            bg="rgba(0,0,0,0.2)"
            aria-hidden="true"
          >
            <Box
              h="full"
              w={`${duties.length ? (completedDutyCount / duties.length) * 100 : 0}%`}
              borderRadius="full"
              bg="var(--pb-gold)"
              transition="width 400ms cubic-bezier(0.4, 0, 0.2, 1)"
            />
          </Box>
        </Box>

        <VStack spacing={6} align="stretch">
          {duties.filter(d => !d.completed).length > 0 && (
            <Box>
              <Text mb={3} fontFamily="var(--pb-mono)" fontSize="10px" fontWeight={700} letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)">
                {t('household.cleaning.inProgress')}
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {duties.filter(d => !d.completed).map((duty, index) => (
                  <Box
                    as={duty.canToggle && busyDutyKey === null ? 'button' : 'div'}
                    key={duty.key}
                    w="full"
                    textAlign="left"
                    onClick={() => {
                      if (!current || !duty.canToggle || busyDutyKey !== null) return
                      onToggleDuty(current.id, duty.key, true)
                    }}
                    minH={{ base: '72px', md: '76px' }}
                    display="flex"
                    alignItems="center"
                    gap={3.5}
                    px={4}
                    py={3}
                    borderRadius="16px"
                    border="1px solid"
                    borderColor={duty.timed ? 'var(--pb-gold)' : 'var(--pb-hair)'}
                    bg={duty.timed ? 'var(--pb-tint-gold)' : 'var(--pb-surface)'}
                    boxShadow="0 4px 12px rgba(0,0,0,0.03)"
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={duty.canToggle && busyDutyKey === null
                      ? { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderColor: 'var(--pb-hair-2)' }
                      : undefined}
                    _focusVisible={{
                      boxShadow: '0 0 0 2px var(--pb-forest)',
                      outline: 'none',
                    }}
                  >
                    <Flex
                      w={10}
                      h={10}
                      flexShrink={0}
                      align="center"
                      justify="center"
                      borderRadius="full"
                      border="2px solid"
                      borderColor="var(--pb-hair-2)"
                      bg="transparent"
                      color="white"
                      transition="all 0.2s"
                    >
                      {busyDutyKey === duty.key ? (
                        <Spinner size="sm" thickness="2px" color="var(--pb-forest-2)" />
                      ) : (
                        <Icon
                          as={Check}
                          boxSize={5}
                          weight="bold"
                          opacity={0}
                          transform="scale(0.5)"
                          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                        />
                      )}
                    </Flex>
                    <Box minW={0} flex={1}>
                      <Text color="var(--pb-ink)" fontSize="sm" fontWeight={600} lineHeight={1.25}>
                        {displayDutyLabel(duty)}
                      </Text>
                      {duty.schedule ? (
                        <HStack mt={1} spacing={1.5} color="var(--pb-gold)">
                          <Icon as={Clock} boxSize={3} weight="bold" />
                          <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700}>
                            {displayDutySchedule(duty)}
                          </Text>
                        </HStack>
                      ) : (
                        <Text mt={0.5} color="var(--pb-ink-faint)" fontSize="2xs">
                          {t('household.cleaning.taskNumber', {
                            number: formatNumber(index + 1, {
                              minimumIntegerDigits: 2,
                              useGrouping: false,
                            }),
                          })}
                        </Text>
                      )}
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {duties.filter(d => d.completed).length > 0 && (
            <Box>
              <Text mb={3} fontFamily="var(--pb-mono)" fontSize="10px" fontWeight={700} letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)">
                {t('household.cleaning.completed')}
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {duties.filter(d => d.completed).map((duty, index) => (
                  <Box
                    as={duty.canToggle && busyDutyKey === null ? 'button' : 'div'}
                    key={duty.key}
                    w="full"
                    textAlign="left"
                    onClick={() => {
                      if (!current || !duty.canToggle || busyDutyKey !== null) return
                      onToggleDuty(current.id, duty.key, false)
                    }}
                    minH={{ base: '72px', md: '76px' }}
                    display="flex"
                    alignItems="center"
                    gap={3.5}
                    px={4}
                    py={3}
                    borderRadius="16px"
                    border="1px solid transparent"
                    bg="var(--pb-surface-2)"
                    opacity={0.65}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={duty.canToggle && busyDutyKey === null
                      ? { opacity: 1, transform: 'translateY(-2px)' }
                      : undefined}
                    _focusVisible={{
                      boxShadow: '0 0 0 2px var(--pb-forest)',
                      outline: 'none',
                    }}
                  >
                    <Flex
                      w={10}
                      h={10}
                      flexShrink={0}
                      align="center"
                      justify="center"
                      borderRadius="full"
                      border="2px solid transparent"
                      bg="var(--pb-tint-income)"
                      color="var(--pb-income)"
                    >
                      {busyDutyKey === duty.key ? (
                        <Spinner size="sm" thickness="2px" />
                      ) : (
                        <Icon as={Check} boxSize={5} weight="bold" />
                      )}
                    </Flex>
                    <Box minW={0} flex={1}>
                      <Text color="var(--pb-ink-soft)" fontSize="sm" fontWeight={600} lineHeight={1.25} textDecoration="line-through">
                        {displayDutyLabel(duty)}
                      </Text>
                      {duty.schedule ? (
                        <HStack mt={1} spacing={1.5} color="var(--pb-income)">
                          <Icon as={Clock} boxSize={3} weight="bold" />
                          <Text fontFamily="var(--pb-mono)" fontSize="8px" fontWeight={700}>
                            {displayDutySchedule(duty)}
                          </Text>
                        </HStack>
                      ) : (
                        <Text mt={0.5} color="var(--pb-income)" fontSize="2xs">
                          {t('household.cleaning.completed')}
                        </Text>
                      )}
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}
        </VStack>
      </Box>
    </PremiumModal>
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
  const { formatCurrency, formatNumber, t } = useI18n()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('Other')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(today())
  const [participantIds, setParticipantIds] = useState<Set<number>>(new Set())
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const amountInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    setDescription(expense?.description ?? '')
    setCategory(expense?.category ?? 'Other')
    setAmount(expense ? String(expense.amount) : '')
    setExpenseDate(expense?.expenseDate ?? today())
    setFiles([])
    setHasSubmitted(false)
    setParticipantIds(new Set(
      expense?.shares.map((share) => share.memberId)
      ?? household.members.map((member) => member.id),
    ))
  }, [expense, household.members, isOpen])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setHasSubmitted(true)
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      ToastService.warning({ title: t('household.expenseModal.invalidAmount') })
      return
    }
    if (participantIds.size < 2) {
      ToastService.warning({ title: t('household.expenseModal.selectParticipants') })
      return
    }
    const request: HouseholdExpenseRequest = {
      description: description.trim(),
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
  const amountIsValid = Number.isFinite(Number(amount)) && Number(amount) > 0
  const payerMemberId = expense?.payerMemberId ?? household.currentMemberId
  const payer = household.members.find((member) => member.id === payerMemberId)
  const currencyMark = household.currency === 'GBP' ? '£' : household.currency
  const categoryOptions = CATEGORIES.includes(category as typeof CATEGORIES[number])
    ? CATEGORIES
    : [category, ...CATEGORIES]

  const applyPreset = (preset: HouseholdExpensePreset) => {
    setDescription(t(`household.expenseModal.quick.${preset.key}.description`))
    setCategory(preset.category)
    amountInputRef.current?.focus()
  }

  const selectEveryone = () => {
    setParticipantIds(new Set(household.members.map((member) => member.id)))
  }

  const footer = (
    <Flex
      w="full"
      direction={{ base: 'column-reverse', sm: 'row' }}
      align={{ base: 'stretch', sm: 'center' }}
      justify={expense ? 'space-between' : 'flex-end'}
      gap={2}
    >
      <Box>
        {expense && (
          <Button
            h="44px"
            color="var(--pb-coral)"
            bg="transparent"
            leftIcon={<Icon as={Trash2} boxSize={4} weight="bold" />}
            isLoading={deleting}
            onClick={() => void remove()}
            w={{ base: 'full', sm: 'auto' }}
            _hover={{ bg: 'var(--pb-tint-coral)' }}
          >
            {t('household.common.remove')}
          </Button>
        )}
      </Box>
      <HStack w={{ base: 'full', sm: 'auto' }} spacing={2}>
        <Button
          h="44px"
          flex={{ base: 1, sm: 'initial' }}
          variant="ghost"
          color="var(--pb-ink-soft)"
          onClick={onClose}
        >
          {t('household.common.cancel')}
        </Button>
        <Button
          h="44px"
          flex={{ base: 1.35, sm: 'initial' }}
          type="submit"
          form="household-expense-form"
          leftIcon={<Icon as={Check} boxSize={4} weight="bold" />}
          bg="var(--pb-forest-2)"
          color="var(--pb-on-accent)"
          borderRadius="11px"
          isLoading={saving}
          loadingText={t('household.common.saving')}
          _hover={{ bg: 'var(--pb-forest)' }}
        >
          {expense
            ? t('household.expenseModal.saveChanges')
            : t('household.expenseModal.addExpense')}
        </Button>
      </HStack>
    </Flex>
  )

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '3xl' }}
      header={
        <AppModalHeader
          icon={ReceiptText}
          title={expense
            ? t('household.expenseModal.editTitle')
            : t('household.expenseModal.addTitle')}
          caption={t('household.expenseModal.caption')}
          onClose={onClose}
          accent="red"
          rightSlot={
            <Badge
              bg="var(--pb-tint-green)"
              color="var(--pb-forest-2)"
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {payer?.name ?? t('household.common.you')}
            </Badge>
          }
        />
      }
      footer={footer}
    >
      <Box
        as="form"
        id="household-expense-form"
        onSubmit={submit}
        p={{ base: 3, sm: 6, md: 8 }}
        bg="var(--pb-surface-2)"
        sx={{
          '.chakra-form__label': {
            color: 'var(--pb-ink-soft)',
            fontSize: 'xs',
            fontWeight: 700,
            mb: 1.5,
          },
          'input, select': {
            background: 'var(--pb-surface)',
            borderColor: 'var(--pb-hair)',
            color: 'var(--pb-ink)',
            borderRadius: '12px',
          },
          'input:hover, select:hover': { borderColor: 'var(--pb-hair-2)' },
          'input:focus-visible, select:focus-visible': {
            borderColor: 'var(--pb-forest-2)',
            boxShadow: '0 0 0 2px var(--pb-tint-green)',
          },
        }}
      >
        <VStack align="stretch" spacing={{ base: 4, sm: 6 }}>
          {/* Main Amount Input (Hero) */}
          <Box
            pt={expense ? 2 : 4}
            pb={{ base: 4, sm: 8 }}
            textAlign="center"
            position="relative"
            bg="linear-gradient(180deg, var(--pb-surface-2) 0%, transparent 100%)"
            borderRadius="24px"
          >
            <Text
              textTransform="uppercase"
              letterSpacing="widest"
              fontSize="xs"
              fontWeight={800}
              color="var(--pb-ink-faint)"
              mb={3}
            >
              {t('household.expenseModal.amount')}
            </Text>
            <Flex justify="center" align="center">
              <InputGroup size="lg" maxW="360px" mx="auto">
                <InputLeftElement
                  pointerEvents="none"
                  color="var(--pb-ink-soft)"
                  fontSize={{ base: '3xl', sm: '4xl' }}
                  fontWeight={700}
                  w="60px"
                  h="full"
                  justifyContent="center"
                  pt={1}
                >
                  {currencyMark}
                </InputLeftElement>
                <Input
                  ref={amountInputRef}
                  variant="unstyled"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                  fontSize={{ base: '4xl', sm: '5xl', md: '7xl' }}
                  fontWeight={800}
                  color="var(--pb-ink)"
                  h={{ base: '64px', sm: '80px', md: '100px' }}
                  pl="60px"
                  textAlign="center"
                  letterSpacing="-0.02em"
                  _placeholder={{ color: 'var(--pb-hair-2)' }}
                  bg="transparent"
                  _hover={{ borderColor: 'transparent' }}
                  _focusVisible={{ boxShadow: 'none' }}
                />
              </InputGroup>
            </Flex>
            {hasSubmitted && !amountIsValid && (
              <Text color="var(--pb-coral)" fontSize="sm" fontWeight={600} mt={2}>
                {t('household.expenseModal.invalidAmount')}
              </Text>
            )}
          </Box>

          {!expense && (
            <Box>
              <HStack align="center" spacing={2} mb={3}>
                <Icon as={Zap} boxSize={4} weight="fill" color="var(--pb-gold-2)" />
                <Text fontSize="sm" fontWeight={750} color="var(--pb-ink)">
                  {t('household.expenseModal.quickTitle')}
                </Text>
              </HStack>
              <HStack
                spacing={3}
                mx={-1}
                px={1}
                pb={2}
                overflowX="auto"
                align="stretch"
                scrollSnapType="x proximity"
                aria-label={t('household.expenseModal.quickTitle')}
                sx={{
                  /* Elegant thin scrollbar */
                  '&::-webkit-scrollbar': {
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                    my: 2,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'var(--pb-hair-2)',
                    borderRadius: '8px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: 'var(--pb-ink-faint)',
                  },
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--pb-hair-2) transparent',
                }}
              >
                {HOUSEHOLD_EXPENSE_PRESETS.map((preset) => {
                  const presetDescription = t(
                    `household.expenseModal.quick.${preset.key}.description`,
                  )
                  const selected = category === preset.category
                    && description === presetDescription
                  return (
                    <Box
                      as="button"
                      type="button"
                      key={preset.key}
                      flex="0 0 auto"
                      w={{ base: '100px', sm: '130px' }}
                      p={{ base: 2.5, sm: 3 }}
                      display="flex"
                      flexDirection="column"
                      alignItems="flex-start"
                      gap={{ base: 2, sm: 3 }}
                      textAlign="left"
                      borderRadius="16px"
                      border="2px solid"
                      borderColor={selected ? 'var(--pb-forest-2)' : 'transparent'}
                      bg={selected ? 'var(--pb-tint-green)' : 'var(--pb-surface)'}
                      boxShadow={selected ? '0 4px 12px rgba(38, 115, 90, 0.15)' : '0 2px 6px rgba(0,0,0,0.04)'}
                      color={selected ? 'var(--pb-forest-2)' : 'var(--pb-ink-soft)'}
                      aria-pressed={selected}
                      scrollSnapAlign="start"
                      onClick={() => applyPreset(preset)}
                      transition="all .2s ease"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                      }}
                    >
                      <Flex
                        w={8}
                        h={8}
                        align="center"
                        justify="center"
                        borderRadius="full"
                        bg={selected ? 'var(--pb-forest-2)' : 'var(--pb-surface-3)'}
                        color={selected ? 'var(--pb-on-accent)' : 'inherit'}
                        transition="all .2s ease"
                      >
                        <Icon as={preset.icon} boxSize={4} weight={selected ? 'fill' : 'duotone'} />
                      </Flex>
                      <Text fontSize="xs" fontWeight={750} lineHeight={1.2}>
                        {t(`household.expenseModal.quick.${preset.key}.label`)}
                      </Text>
                    </Box>
                  )
                })}
              </HStack>
            </Box>
          )}

          <Box
            p={{ base: 3, sm: 4, md: 5 }}
            bg="var(--pb-surface)"
            borderRadius="20px"
            boxShadow="0 2px 8px rgba(0,0,0,0.03)"
          >
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('household.expenseModal.date')}</FormLabel>
                <Input
                  h="52px"
                  type="date"
                  value={expenseDate}
                  onChange={(event) => setExpenseDate(event.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('household.expenseModal.category')}</FormLabel>
                <Select
                  h="52px"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {t(`household.category.${item}`, undefined, item)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl
                isRequired
                isInvalid={hasSubmitted && description.trim().length === 0}
                gridColumn={{ sm: '1 / -1' }}
              >
                <FormLabel>{t('household.expenseModal.description')}</FormLabel>
                <Input
                  h="52px"
                  value={description}
                  maxLength={255}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t('household.expenseModal.descriptionPlaceholder')}
                />
                <FormErrorMessage fontSize="xs">
                  {t('household.expenseModal.descriptionRequired')}
                </FormErrorMessage>
              </FormControl>
            </SimpleGrid>
          </Box>

          <Box
            p={{ base: 3, sm: 4, md: 5 }}
            bg="var(--pb-surface)"
            borderRadius="20px"
            boxShadow="0 2px 8px rgba(0,0,0,0.03)"
          >
            <Flex align="flex-start" justify="space-between" gap={3} mb={5}>
              <Box>
                <Text fontWeight={800} fontSize="sm" color="var(--pb-ink)" lineHeight={1.2}>
                  {t('household.expenseModal.splitBetween')}
                </Text>
                <Text mt={1} fontSize="xs" color="var(--pb-ink-soft)">
                  {t('household.expenseModal.splitDescription')}
                </Text>
              </Box>
              {participantIds.size < household.members.length && (
                <Button
                  size="sm"
                  variant="ghost"
                  color="var(--pb-forest-2)"
                  onClick={selectEveryone}
                  flexShrink={0}
                  borderRadius="full"
                  bg="var(--pb-tint-green)"
                  _hover={{ bg: 'var(--pb-tint-green-hover, #d5ece4)' }}
                  display={{ base: 'none', sm: 'flex' }}
                >
                  {t('household.expenseModal.selectEveryone')}
                </Button>
              )}
            </Flex>

            {participantIds.size < household.members.length && (
              <Button
                size="xs"
                variant="ghost"
                color="var(--pb-forest-2)"
                onClick={selectEveryone}
                w="full"
                mb={4}
                borderRadius="full"
                bg="var(--pb-tint-green)"
                _hover={{ bg: 'var(--pb-tint-green-hover, #d5ece4)' }}
                display={{ base: 'flex', sm: 'none' }}
              >
                {t('household.expenseModal.selectEveryone')}
              </Button>
            )}

            <FormControl isInvalid={hasSubmitted && participantIds.size < 2}>
              <VStack spacing={3} align="stretch">
                {household.members.map((member) => {
                  const isPayer = member.id === payerMemberId
                  const isSelected = participantIds.has(member.id)
                  return (
                    <Flex
                      as="label"
                      key={member.id}
                      minH={{ base: '56px', sm: '60px' }}
                      px={{ base: 3, sm: 4 }}
                      py={{ base: 2.5, sm: 3 }}
                      align="center"
                      gap={{ base: 3, sm: 4 }}
                      borderRadius="16px"
                      border="2px solid"
                      borderColor={isSelected ? 'var(--pb-forest-2)' : 'transparent'}
                      bg={isSelected ? 'var(--pb-tint-green)' : 'var(--pb-surface-2)'}
                      cursor={isPayer ? 'default' : 'pointer'}
                      transition="all .2s ease"
                      _hover={{
                        transform: isPayer ? 'none' : 'scale(1.01)',
                      }}
                    >
                      <Checkbox
                        size="lg"
                        isChecked={isSelected}
                        isDisabled={isPayer}
                        colorScheme="green"
                        onChange={(event) => {
                          setParticipantIds((current) => {
                            const next = new Set(current)
                            if (event.target.checked) next.add(member.id)
                            else next.delete(member.id)
                            return next
                          })
                        }}
                        sx={{
                          '.chakra-checkbox__control': {
                            borderRadius: 'full',
                            borderWidth: '2px',
                          }
                        }}
                      />
                      <Box minW={0} flex={1}>
                        <Text color="var(--pb-ink)" fontSize="md" fontWeight={750} noOfLines={1}>
                          {member.name}
                        </Text>
                        {isPayer && (
                          <Text color="var(--pb-forest-2)" fontSize="xs" fontWeight={600} mt={0.5}>
                            {t('household.expenseModal.payerHint')}
                          </Text>
                        )}
                      </Box>
                      {isPayer && (
                        <Badge
                          bg="var(--pb-forest-2)"
                          color="var(--pb-on-accent)"
                          borderRadius="full"
                          px={3}
                          py={1}
                          textTransform="uppercase"
                          fontSize="2xs"
                          fontWeight={800}
                          letterSpacing="wider"
                        >
                          {t('household.expenseModal.payer')}
                        </Badge>
                      )}
                    </Flex>
                  )
                })}
              </VStack>
              <FormErrorMessage fontSize="sm" mt={3} fontWeight={600}>
                {t('household.expenseModal.selectParticipants')}
              </FormErrorMessage>

              <Box
                mt={{ base: 4, sm: 5 }}
                p={{ base: 3, sm: 4 }}
                borderRadius="16px"
                bg="linear-gradient(135deg, var(--pb-forest-2) 0%, var(--pb-forest) 100%)"
                color="var(--pb-on-accent)"
                boxShadow="0 4px 14px rgba(38, 115, 90, 0.25)"
              >
                <Flex align="center" justify="space-between" flexWrap="wrap" gap={2}>
                  <Text fontSize="sm" fontWeight={600} opacity={0.9}>
                    {t(
                      participantIds.size === 1
                        ? 'household.expenseModal.participants.one'
                        : 'household.expenseModal.participants.other',
                      { count: formatNumber(participantIds.size) },
                    )}
                  </Text>
                  <Text fontSize="xl" fontWeight={800}>
                    {t('household.expenseModal.perPerson', {
                      amount: formatCurrency(preview),
                    })}
                  </Text>
                </Flex>
                <Text mt={2} fontSize="2xs" opacity={0.7} lineHeight={1.4} textAlign="right">
                  {t('household.expenseModal.roundingHint')}
                </Text>
              </Box>
            </FormControl>
          </Box>

          <Box
            p={{ base: 3, sm: 4, md: 5 }}
            bg="var(--pb-surface)"
            borderRadius="20px"
            boxShadow="0 2px 8px rgba(0,0,0,0.03)"
          >
            <AttachmentPicker
              files={files}
              onChange={setFiles}
              existingCount={(expense?.attachments ?? []).filter(
                (attachment) => attachment.status === 'AVAILABLE',
              ).length}
            />
          </Box>
        </VStack>
      </Box>
    </PremiumModal>
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
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [memberName, setMemberName] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(household.name)
      setEditingMemberId(null)
      setMemberName('')
    }
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

  const renameMember = async (event: FormEvent, memberId: number) => {
    event.preventDefault()
    const normalizedName = memberName.trim()
    if (!normalizedName) return
    const saved = await act(
      `rename-member-${memberId}`,
      () => updateHouseholdMemberName(household.id, memberId, normalizedName),
      t('household.manage.memberRenamedToast'),
    )
    if (saved) {
      setEditingMemberId(null)
      setMemberName('')
    }
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
                {household.members.map((member) => {
                  const isEditing = editingMemberId === member.id
                  return (
                    <Box
                      key={member.id}
                      p={3}
                      borderRadius="lg"
                      bg={ed?.panelRaised ?? 'blackAlpha.50'}
                    >
                      {isEditing ? (
                        <Stack
                          as="form"
                          direction={{ base: 'column', sm: 'row' }}
                          align={{ base: 'stretch', sm: 'flex-end' }}
                          spacing={2}
                          onSubmit={(event) => void renameMember(event, member.id)}
                        >
                          <FormControl isRequired flex={1}>
                            <FormLabel fontSize="xs">
                              {t('household.manage.memberNameLabel')}
                            </FormLabel>
                            <Input
                              autoFocus
                              value={memberName}
                              maxLength={120}
                              onChange={(event) => setMemberName(event.target.value)}
                              placeholder={t('household.manage.memberNamePlaceholder')}
                            />
                          </FormControl>
                          <HStack justify={{ base: 'flex-end', sm: 'initial' }}>
                            <IconButton
                              type="button"
                              aria-label={t('household.manage.cancelMemberNameAria')}
                              icon={<X size={16} />}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingMemberId(null)
                                setMemberName('')
                              }}
                            />
                            <Button
                              type="submit"
                              size="sm"
                              colorScheme="teal"
                              leftIcon={<Check size={16} />}
                              isLoading={busy === `rename-member-${member.id}`}
                              isDisabled={!memberName.trim()}
                            >
                              {t('household.common.save')}
                            </Button>
                          </HStack>
                        </Stack>
                      ) : (
                        <HStack justify="space-between" spacing={3}>
                          <Box minW={0}>
                            <Text fontWeight={800} noOfLines={1}>{member.name}</Text>
                            <Text color={muted} fontSize="xs" noOfLines={1}>{member.email}</Text>
                          </Box>
                          <HStack spacing={1} flexShrink={0}>
                            <IconButton
                              aria-label={t('household.manage.editNameAria', {
                                name: member.name,
                              })}
                              icon={<Pencil size={16} />}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingMemberId(member.id)
                                setMemberName(member.name)
                              }}
                            />
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
                        </HStack>
                      )}
                    </Box>
                  )
                })}
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
