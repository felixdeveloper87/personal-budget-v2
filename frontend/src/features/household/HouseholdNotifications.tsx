import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useEd } from '../../editorial'
import { useI18n } from '../../i18n'
import type {
  HouseholdNotification,
  HouseholdNotificationType,
} from '../../types'
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Home,
  ReceiptText,
  Sparkles,
  Wallet,
  type LucideIcon,
} from '../../components/ui/icons'
import { ModalHeader, PremiumModal } from '../../components/ui'

type NotificationAction = 'expenses' | 'payments' | 'cleaning' | null

interface NotificationNavigation {
  onOpenExpenses: () => void
  onOpenPayments: () => void
  onOpenCleaning: () => void
}

interface NotificationListProps extends NotificationNavigation {
  notifications: HouseholdNotification[]
  compact?: boolean
}

interface HouseholdNotificationsCardProps extends NotificationNavigation {
  notifications: HouseholdNotification[]
  unreadCount: number
  onOpenAll: () => void
  onMarkAllRead: () => void
  isMarkingRead: boolean
}

interface HouseholdNotificationsModalProps extends NotificationNavigation {
  isOpen: boolean
  onClose: () => void
  notifications: HouseholdNotification[]
  unreadCount: number
  onMarkAllRead: () => void
  isMarkingRead: boolean
}

const notificationIcon = (type: HouseholdNotificationType): LucideIcon => {
  if (type.startsWith('EXPENSE_')) return ReceiptText
  if (type.startsWith('SETTLEMENT_')) return Wallet
  if (type.startsWith('CLEANING_')) return Sparkles
  if (type.startsWith('MEMBER_')) return Home
  return Bell
}

const notificationAction = (type: HouseholdNotificationType): NotificationAction => {
  if (type.startsWith('EXPENSE_')) return 'expenses'
  if (type.startsWith('SETTLEMENT_')) return 'payments'
  if (type.startsWith('CLEANING_')) return 'cleaning'
  return null
}

export function HouseholdNotificationsCard({
  notifications,
  unreadCount,
  onOpenAll,
  onMarkAllRead,
  isMarkingRead,
  ...navigation
}: HouseholdNotificationsCardProps) {
  const ed = useEd()
  const { formatNumber, t } = useI18n()
  const unread = notifications.filter((notification) => notification.readAt == null)

  if (unreadCount === 0 || unread.length === 0) return null

  return (
    <Box
      overflow="hidden"
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius={{ base: '18px', md: '22px' }}
      boxShadow="var(--pb-shadow)"
      aria-live="polite"
    >
      <Flex
        align={{ base: 'flex-start', sm: 'center' }}
        justify="space-between"
        direction={{ base: 'column', sm: 'row' }}
        gap={3}
        px={{ base: 4, md: 5 }}
        py={4}
        bg="var(--pb-tint-gold)"
        borderBottom="1px solid var(--pb-hair)"
      >
        <HStack spacing={3} align="flex-start">
          <Flex
            w={10}
            h={10}
            flexShrink={0}
            align="center"
            justify="center"
            borderRadius="full"
            bg="var(--pb-surface)"
            color="var(--pb-gold)"
            border="1px solid var(--pb-hair)"
          >
            <Icon as={Bell} boxSize={5} weight="duotone" />
          </Flex>
          <Box>
            <Text fontWeight={800}>{t('household.notifications.newTitle')}</Text>
            <Text mt={0.5} color={ed?.muted ?? 'gray.500'} fontSize="sm">
              {t(
                unreadCount === 1
                  ? 'household.notifications.unread.one'
                  : 'household.notifications.unread.other',
                { count: formatNumber(unreadCount) },
              )}
            </Text>
          </Box>
        </HStack>
        <HStack w={{ base: 'full', sm: 'auto' }}>
          <Button
            size="sm"
            variant="ghost"
            flex={{ base: 1, sm: 'initial' }}
            isLoading={isMarkingRead}
            onClick={onMarkAllRead}
          >
            {t('household.notifications.markAllRead')}
          </Button>
          <Button
            size="sm"
            colorScheme="teal"
            flex={{ base: 1, sm: 'initial' }}
            rightIcon={<ChevronRight size={15} />}
            onClick={onOpenAll}
          >
            {t('household.notifications.viewAll')}
          </Button>
        </HStack>
      </Flex>
      <NotificationList notifications={unread.slice(0, 3)} compact {...navigation} />
    </Box>
  )
}

export function HouseholdNotificationsModal({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAllRead,
  isMarkingRead,
  ...navigation
}: HouseholdNotificationsModalProps) {
  const ed = useEd()
  const { formatNumber, t } = useI18n()

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'xl' }}
      header={(
        <ModalHeader
          title={t('household.notifications.title')}
          caption={t('household.notifications.historyCaption')}
          onClose={onClose}
          rightSlot={unreadCount > 0 ? (
            <Text
              px={2.5}
              py={1.5}
              borderRadius="full"
              bg="var(--pb-tint-gold)"
              color="var(--pb-gold)"
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={700}
            >
              {t('household.notifications.unreadBadge', {
                count: formatNumber(unreadCount),
              })}
            </Text>
          ) : undefined}
        />
      )}
      footer={unreadCount > 0 ? (
        <Button
          w="full"
          colorScheme="teal"
          leftIcon={<CheckCircle2 size={17} />}
          isLoading={isMarkingRead}
          onClick={onMarkAllRead}
        >
          {t('household.notifications.markAllRead')}
        </Button>
      ) : undefined}
    >
      {notifications.length > 0 ? (
        <NotificationList notifications={notifications} {...navigation} />
      ) : (
        <VStack spacing={3} px={6} py={16} textAlign="center">
          <Flex
            w={12}
            h={12}
            align="center"
            justify="center"
            borderRadius="full"
            bg="var(--pb-tint-green)"
            color="var(--pb-income)"
          >
            <Icon as={CheckCircle2} boxSize={6} weight="duotone" />
          </Flex>
          <Text fontWeight={800}>{t('household.notifications.emptyTitle')}</Text>
          <Text color={ed?.muted ?? 'gray.500'} fontSize="sm">
            {t('household.notifications.emptyDescription')}
          </Text>
        </VStack>
      )}
    </PremiumModal>
  )
}

function NotificationList({
  notifications,
  compact = false,
  onOpenExpenses,
  onOpenPayments,
  onOpenCleaning,
}: NotificationListProps) {
  return (
    <Stack spacing={0} divider={<Box borderTop="1px solid var(--pb-hair)" />}>
      {notifications.map((notification) => {
        const action = notificationAction(notification.type)
        const onOpen = action === 'expenses'
          ? onOpenExpenses
          : action === 'payments'
            ? onOpenPayments
            : action === 'cleaning'
              ? onOpenCleaning
              : undefined
        return (
          <NotificationRow
            key={notification.id}
            notification={notification}
            compact={compact}
            onOpen={onOpen}
          />
        )
      })}
    </Stack>
  )
}

function NotificationRow({
  notification,
  compact,
  onOpen,
}: {
  notification: HouseholdNotification
  compact: boolean
  onOpen?: () => void
}) {
  const ed = useEd()
  const { formatCurrency, formatDate, t } = useI18n()
  const NotificationIcon = notificationIcon(notification.type)
  const actor = notification.actorName ?? t('household.notifications.householdActor')
  const amount = notification.amount == null
    ? ''
    : formatCurrency(notification.amount)
  const recipientAmount = notification.recipientAmount == null
    ? ''
    : formatCurrency(notification.recipientAmount)
  const subject = notification.subject ?? ''
  const duty = notification.type === 'CLEANING_DUTY_COMPLETED'
    ? t(`household.cleaning.duty.${subject}`, undefined, subject)
    : subject
  const messageKey = notification.type.startsWith('EXPENSE_')
    && notification.recipientAmount != null
    ? `household.notifications.message.${notification.type}.withShare`
    : `household.notifications.message.${notification.type}`
  const message = t(messageKey, {
    actor,
    amount,
    recipientAmount,
    subject,
    duty,
    date: notification.type === 'CLEANING_WEEK_ASSIGNED' && subject
      ? formatDate(subject, { day: 'numeric', month: 'long' })
      : subject,
  })
  const action = notificationAction(notification.type)

  return (
    <Flex
      gap={3}
      align="flex-start"
      px={{ base: 4, md: 5 }}
      py={compact ? 3.5 : 4}
      bg={notification.readAt == null ? 'var(--pb-surface-2)' : 'transparent'}
    >
      <Flex
        w={9}
        h={9}
        flexShrink={0}
        align="center"
        justify="center"
        borderRadius="full"
        bg={notification.type.startsWith('SETTLEMENT_')
          ? 'var(--pb-tint-gold)'
          : notification.type.startsWith('EXPENSE_')
            ? 'var(--pb-tint-coral)'
            : 'var(--pb-tint-green)'}
        color={notification.type.startsWith('SETTLEMENT_')
          ? 'var(--pb-gold)'
          : notification.type.startsWith('EXPENSE_')
            ? 'var(--pb-coral)'
            : 'var(--pb-income)'}
      >
        <NotificationIcon size={18} weight="duotone" aria-hidden="true" />
      </Flex>
      <Box minW={0} flex={1}>
        <HStack spacing={2} align="flex-start">
          {notification.readAt == null && (
            <Box
              mt="7px"
              w="6px"
              h="6px"
              flexShrink={0}
              borderRadius="full"
              bg="var(--pb-coral)"
              aria-label={t('household.notifications.unreadLabel')}
            />
          )}
          <Text color={ed?.cream ?? 'inherit'} fontSize="sm" fontWeight={notification.readAt == null ? 750 : 600}>
            {message}
          </Text>
        </HStack>
        <Text mt={1} color={ed?.muted ?? 'gray.500'} fontSize="xs">
          {formatDate(notification.createdAt, {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Box>
      {onOpen && (
        <Button
          size="xs"
          variant="ghost"
          flexShrink={0}
          rightIcon={<ChevronRight size={13} />}
          onClick={onOpen}
        >
          {t(`household.notifications.action.${action}`)}
        </Button>
      )}
    </Flex>
  )
}
