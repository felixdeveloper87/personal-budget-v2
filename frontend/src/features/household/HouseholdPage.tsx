import { useState } from 'react'
import { Box, Button, Icon, SimpleGrid, VStack, useDisclosure } from '@chakra-ui/react'
import { cancelHouseholdSettlement, confirmHouseholdSettlement, markHouseholdNotificationsRead, rejectHouseholdSettlement, updateHouseholdCleaningDuty, uploadHouseholdExpenseAttachments, uploadHouseholdSettlementAttachments } from '../../api'
import { useI18n } from '../../i18n'
import type { HouseholdDebt, HouseholdExpense } from '../../types'
import { CheckCircle2, Plus, Wallet } from '../../components/ui/icons'
import { AttachmentGalleryModal } from './HouseholdAttachments'
import HouseholdHeader from './HouseholdHeader'
import { HouseholdNotificationsModal } from './HouseholdNotifications'
import { ActionRequiredBanner, HouseholdSectionCard, HouseholdSectionNavigation } from './components/HouseholdPageComponents'
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
import { SettlementModal } from './settlements/SettlementModal'
import type { AttachmentTarget } from './household.types'
import { useHouseholdPageController } from './hooks/useHouseholdPageController'
import { keyframes } from '@emotion/react'

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(71,112,148, 0.5); }
  50% { box-shadow: 0 0 0 8px rgba(71,112,148, 0); }
`

const shimmerAnim = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`

export default function HouseholdPage() {
  const { formatCurrency, formatNumber, t } = useI18n()
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

        {/* Mobile-only Add Expense button — below the header */}
        <Button
          display={{ base: 'flex', sm: 'none' }}
          leftIcon={<Icon as={Plus} boxSize={5} />}
          onClick={openNewExpense}
          w="full"
          h="48px"
          borderRadius="14px"
          bgGradient="linear(135deg, #4F7396, #3D6080, #5D849F, #4F7396)"
          backgroundSize="200% auto"
          color="rgba(235,242,248,0.95)"
          border="1px solid rgba(71,112,148,0.45)"
          fontFamily="var(--pb-mono)"
          fontSize="10px"
          fontWeight={700}
          letterSpacing="0.08em"
          textTransform="uppercase"
          boxShadow="0 3px 14px rgba(71,112,148,0.25)"
          animation={`${pulseGlow} 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite`}
          _hover={{
            bgGradient: 'linear(135deg, #3D6080, #4F7396, #7BA3C0, #3D6080)',
            animation: `${shimmerAnim} 1.4s linear infinite`,
            boxShadow: '0 6px 24px rgba(71,112,148,0.45)',
            transform: 'scale(1.02)',
          }}
          _active={{ transform: 'scale(0.98)', boxShadow: '0 2px 8px rgba(71,112,148,0.3)' }}
          _focusVisible={{ boxShadow: '0 0 0 3px rgba(71,112,148,0.4)', outline: 'none' }}
          transition="all 0.3s ease"
        >
          {t('household.header.addExpense')}
        </Button>

        <HouseholdSectionNavigation
          ariaLabel={t('household.navigation.aria')}
          items={[
            { id: 'household-cleaning', label: t('household.cleaning.title') },
            { id: 'household-balances', label: t('household.balances.title') },
            { id: 'household-expenses', label: t('household.expenses.title') },
            { id: 'household-payments', label: t('household.settlements.title') },
          ]}
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
                icon={<Icon as={CheckCircle2} boxSize={5} weight="duotone" />}
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
                icon={<Icon as={Wallet} boxSize={5} weight="duotone" />}
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

        <HouseholdSectionCard
          id="household-balances"
          eyebrow={t('household.balances.eyebrow')}
          title={t('household.balances.title')}
          description={t('household.balances.description')}
          accent={household.debts.length ? 'var(--pb-coral)' : 'var(--pb-income)'}
          tint={household.debts.length ? 'var(--pb-tint-coral)' : 'var(--pb-tint-income)'}
          stat={household.debts.length
            ? t('household.balances.open', {
              amount: formatCurrency(outstandingHouseholdTotal),
            })
            : t('household.balances.allSettled')}
          actionLabel={t('household.balances.view')}
          actionAriaLabel={t('household.balances.openAria')}
          onOpen={balancesOverviewModal.onOpen}
        />

        <HouseholdSectionCard
          id="household-expenses"
          eyebrow={t('household.expenses.eyebrow')}
          title={t('household.expenses.title')}
          description={t('household.expenses.description')}
          accent="var(--pb-forest-2)"
          tint="var(--pb-tint-green)"
          stat={t(
            household.expenses.length === 1
              ? 'household.expenses.count.one'
              : 'household.expenses.count.other',
            { count: formatNumber(household.expenses.length) },
          )}
          actionLabel={t('household.expenses.open')}
          actionAriaLabel={t('household.expenses.openAria')}
          onOpen={recentExpensesModal.onOpen}
        />

        <HouseholdSectionCard
          id="household-payments"
          eyebrow={t('household.settlements.eyebrow')}
          title={t('household.settlements.title')}
          description={t('household.settlements.description')}
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
          actionLabel={t('household.settlements.open')}
          actionAriaLabel={t('household.settlements.openAria')}
          onOpen={paymentsOverviewModal.onOpen}
        />
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
