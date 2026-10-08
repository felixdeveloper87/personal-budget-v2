import { useState } from 'react'
import { Box, VStack, useDisclosure } from '@chakra-ui/react'
import { markHouseholdNotificationsRead, updateHouseholdCleaningDuty, uploadHouseholdExpenseAttachments, uploadHouseholdSettlementAttachments } from '../../api'
import { useI18n } from '../../i18n'
import type { HouseholdExpense } from '../../types'
import { AttachmentGalleryModal } from './HouseholdAttachments'
import HouseholdHeader from './HouseholdHeader'
import { HouseholdMembersCarousel } from './HouseholdMembersCarousel'
import { HouseholdNotificationsModal } from './HouseholdNotifications'
import {
  HouseholdLoadingState,
  HouseholdLoadError,
  HouseholdOnboarding,
} from './components/HouseholdPageStates'
import { CleaningRotationCard } from './cleaning/CleaningRotationCard'
import { CleaningRotationModal } from './cleaning/CleaningRotationModal'
import { ExpenseModal } from './expenses/ExpenseModal'
import { RecentExpensesModal } from './expenses/RecentExpensesModal'
import { MembersModal } from './members/MembersModal'
import { MembersOverviewModal } from './members/MembersOverviewModal'
import { BalancesOverviewModal } from './settlements/BalancesOverviewModal'
import { PaymentsOverviewModal } from './settlements/PaymentsOverviewModal'
import { HouseholdPayments } from './settlements/HouseholdPayments'
import type { AttachmentTarget } from './household.types'
import { useHouseholdPageController } from './hooks/useHouseholdPageController'
import { HouseholdOverview } from './HouseholdOverview'
import { HouseholdDebtTicker } from './HouseholdDebtTicker'
import { NU_SHEET_PB, NU_SHEET_WRAP } from '../dashboard/components/nu'

export default function HouseholdPage() {
  const { t } = useI18n()
  const {
    page,
    setPage,
    loading,
    loadFailed,
    busyAction,
    load,
    applyAction,
  } = useHouseholdPageController()
  const [householdName, setHouseholdName] = useState(() => t('household.create.defaultName'))
  const [editingExpense, setEditingExpense] = useState<HouseholdExpense | null>(null)
  const [attachmentTarget, setAttachmentTarget] = useState<AttachmentTarget | null>(null)
  const expenseModal = useDisclosure()
  const membersModal = useDisclosure()
  const attachmentsModal = useDisclosure()
  const cleaningRotationModal = useDisclosure()
  const balancesOverviewModal = useDisclosure()
  const membersOverviewModal = useDisclosure()
  const recentExpensesModal = useDisclosure()
  const paymentsOverviewModal = useDisclosure()
  const notificationsModal = useDisclosure()

  const openNewExpense = () => {
    setEditingExpense(null)
    expenseModal.onOpen()
  }

  const openEditExpense = (expense: HouseholdExpense) => {
    setEditingExpense(expense)
    expenseModal.onOpen()
  }

  if (loading) {
    return <HouseholdLoadingState />
  }

  if (loadFailed || !page) {
    return <HouseholdLoadError onRetry={() => void load()} />
  }

  if (!page.household) {
    return (
      <HouseholdOnboarding
        page={page}
        householdName={householdName}
        busyAction={busyAction}
        setHouseholdName={setHouseholdName}
        applyAction={applyAction}
      />
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

  const scrollToCleaning = () => {
    requestAnimationFrame(() => {
      document.getElementById('household-cleaning')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
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
    <Box>
      <HouseholdHeader
        household={household}
        onAddExpense={openNewExpense}
        onManage={membersModal.onOpen}
        onMembersOverview={membersOverviewModal.onOpen}
        onNotifications={notificationsModal.onOpen}
        onViewBalances={balancesOverviewModal.onOpen}
        onOpenCleaning={scrollToCleaning}
      />

      {/* White sheet with rounded top tucked over the purple header. */}
      <Box {...NU_SHEET_WRAP}>
      <VStack
        className="nu-dashboard" pb={NU_SHEET_PB}
        align="stretch"
        spacing={{ base: 4, md: 6 }}
        bg="var(--nu-page)"
        borderTopRadius="24px"
        borderBottomRadius={{ base: 0, md: '24px' }}
        px={{ base: 3, md: 6 }}
        py={{ base: 5, md: 6 }}
        boxShadow={{ base: 'none', md: '0 1px 2px rgba(31,31,36,0.04), 0 18px 48px -24px rgba(31,31,36,0.18)' }}
      >
        <HouseholdDebtTicker members={household.members} debts={household.debts} onOpen={balancesOverviewModal.onOpen} />

        <HouseholdMembersCarousel
          household={household}
          onViewBalances={balancesOverviewModal.onOpen}
        />

        <Box id="household-cleaning" scrollMarginTop="90px">
          <CleaningRotationCard
            rotation={household.cleaningRotation}
            members={household.members}
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


        <HouseholdOverview
          household={household}
          onViewExpenses={recentExpensesModal.onOpen}
        />

        <HouseholdPayments
          household={household}
          onViewPayments={paymentsOverviewModal.onOpen}
        />

      </VStack>
      </Box>

      <ExpenseModal
        isOpen={expenseModal.isOpen}
        onClose={expenseModal.onClose}
        household={household}
        expense={editingExpense}
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
        onChanged={setPage}
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
        onOpenAttachments={(settlementId) => {
          paymentsOverviewModal.onClose()
          openAttachments({ kind: 'settlement', id: settlementId })
        }}
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
