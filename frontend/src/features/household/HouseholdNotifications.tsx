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
import { PremiumModal } from '../../components/ui'
import NuModalHeader from '../../components/ui/NuModalHeader'

const BRAND = '#820ad1'

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
            bg="#820ad1" color="white" borderRadius="full" _hover={{ bg: '#6e08b3' }} _active={{ bg: '#6e08b3' }}
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
  const { formatNumber, t } = useI18n()

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      contentProps={{
        className: 'nu-dashboard',
        w: { base: '100%', md: 'min(640px, calc(100vw - 32px))' }, maxW: '640px',
        h: 'auto', maxH: { base: '85dvh', md: '80vh' },
        mt: 'auto', mb: 0, mx: 'auto', borderRadius: '32px 32px 0 0', overflow: 'hidden', bg: 'var(--nu-page, #ffffff)',
      }}
      header={(
        <NuModalHeader
          title={t('household.notifications.title')}
          caption={unreadCount > 0
            ? t(
              unreadCount === 1 ? 'household.notifications.unread.one' : 'household.notifications.unread.other',
              { count: formatNumber(unreadCount) },
            )
            : t('household.notifications.historyCaption')}
          onClose={onClose}
        />
      )}
    >
      <Box overflowY="auto" flex={1} minH={0} bg="var(--nu-page, #ffffff)" pb="env(safe-area-inset-bottom, 0px)"
        sx={{ WebkitOverflowScrolling: 'touch' }}>
        {unreadCount > 0 && (
          <Flex justify="flex-end" px={{ base: 4, md: 6 }} py={2} borderBottom="1px solid var(--pb-hair)">
            <Button
              size="sm"
              variant="ghost"
              color={BRAND}
              borderRadius="full"
              fontWeight={700}
              leftIcon={<CheckCircle2 size={15} />}
              isLoading={isMarkingRead}
              onClick={onMarkAllRead}
              _hover={{ bg: '#f3e8fc' }}
            >
              {t('household.notifications.markAllRead')}
            </Button>
          </Flex>
        )}
        {notifications.length > 0 ? (
          <NotificationList notifications={notifications} {...navigation} />
        ) : (
          <VStack spacing={3} px={6} py={12} textAlign="center">
            <Flex w="56px" h="56px" align="center" justify="center" borderRadius="full" bg="#f3e8fc" color={BRAND}>
              <Icon as={CheckCircle2} boxSize={6} weight="duotone" />
            </Flex>
            <Text fontSize="lg" fontWeight={800} letterSpacing="-.02em" color="var(--pb-ink)">
              {t('household.notifications.emptyTitle')}
            </Text>
            <Text color="var(--pb-ink-soft)" fontSize="sm">
              {t('household.notifications.emptyDescription')}
            </Text>
          </VStack>
        )}
      </Box>
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
      align="center"
      px={{ base: 4, md: 6 }}
      py={compact ? 2.5 : 3}
      bg={notification.readAt == null ? 'rgba(130, 10, 209, 0.04)' : 'transparent'}
    >
      <Flex
        w={8}
        h={8}
        flexShrink={0}
        align="center"
        justify="center"
        borderRadius="full"
        bg="#f3e8fc"
        color={BRAND}
      >
        <NotificationIcon size={16} weight="duotone" aria-hidden="true" />
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
              bg={BRAND}
              aria-label={t('household.notifications.unreadLabel')}
            />
          )}
          <Text color="var(--pb-ink)" fontSize="sm" lineHeight={1.35} fontWeight={notification.readAt == null ? 700 : 500}>
            {message}
          </Text>
        </HStack>
        <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="11px">
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
          color={BRAND}
          borderRadius="full"
          fontWeight={700}
          rightIcon={<ChevronRight size={13} />}
          onClick={onOpen}
          _hover={{ bg: '#f3e8fc' }}
        >
          {t(`household.notifications.action.${action}`)}
        </Button>
      )}
    </Flex>
  )
}
