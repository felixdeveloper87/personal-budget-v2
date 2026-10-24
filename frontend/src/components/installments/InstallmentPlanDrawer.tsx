import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Select,
  SimpleGrid,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import {
  CheckCircle2,
  Pencil,
  Trash2,
} from '../ui/icons'
import { FinancialAccount, InstallmentPlan, PaymentMethod } from '../../types'
import {
  closeInstallmentPlan,
  deleteInstallmentPlan,
  listAccounts,
  listPaymentMethods,
  updateInstallmentPlan,
} from '../../api'
import { ToastService } from '../../services/toast'
import PlanLogo from './PlanLogo'
import { isInstallmentPlanCompleted } from './InstallmentPlanCard'
import { getInstallmentPlanTitle } from '../../utils/installments'
import { useI18n } from '../../i18n'
import PremiumModal from '../ui/PremiumModal'
import NuModalHeader from '../ui/NuModalHeader'
import NuDetailSheet, { NU_FIELD, NU_SHEET_COLORS, NuFacts, NuSheetBadge, NuSheetButton } from '../ui/NuDetailSheet'

interface InstallmentPlanDrawerProps {
  plan: InstallmentPlan | null
  onClose: () => void
  /** Reload the list after the plan is edited or deleted. */
  onChanged: () => void
}

function getPlanStartDate(plan: InstallmentPlan): string {
  return plan.transactions
    .slice()
    .sort((a, b) => a.installmentNumber - b.installmentNumber)[0]?.date || new Date().toISOString().slice(0, 10)
}

/** Adds whole months to a YYYY-MM-DD date, clamping to the month's last day. */
function addMonths(date: string, months: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const target = new Date(Date.UTC(y, m - 1 + months, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(d, lastDay))
  return target.toISOString().slice(0, 10)
}

const SCHEDULE_PREVIEW = 4

/** PremiumModal content for the plan's nested modals: bottom sheet on phones, centred card above. */
const NU_MODAL_CONTENT = {
  className: 'nu-dashboard',
  w: { base: '100%', md: 'min(480px, calc(100vw - 32px))' },
  maxW: '480px',
  h: 'auto',
  maxH: { base: '85dvh', md: '80vh' },
  mt: 'auto',
  mb: { base: 0, md: 'auto' },
  mx: 'auto',
  borderRadius: { base: '32px 32px 0 0', md: '28px' },
  overflow: 'hidden',
  bg: 'var(--nu-page, #ffffff)',
}

function fieldLabel(label: string) {
  return (
    <FormLabel mb={1} fontSize="xs" color={NU_SHEET_COLORS.inkSoft} fontWeight={600}>
      {label}
    </FormLabel>
  )
}

/**
 * Detail sheet for a single installment plan (Nubank style, see
 * NuDetailSheet). Opens when a plan row is clicked and hosts the installment
 * schedule plus edit/delete actions.
 */
export default function InstallmentPlanDrawer({ plan, onClose, onChanged }: InstallmentPlanDrawerProps) {
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  const open = plan != null
  const [displayPlan, setDisplayPlan] = useState<InstallmentPlan | null>(plan)
  const [showAllSchedule, setShowAllSchedule] = useState(false)

  const [isDeleting, setIsDeleting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isSavingPlan, setIsSavingPlan] = useState(false)
  const [draftInstallmentValue, setDraftInstallmentValue] = useState('')
  const [draftTotalAmount, setDraftTotalAmount] = useState('')
  const [draftStartDate, setDraftStartDate] = useState('')
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [draftAccountId, setDraftAccountId] = useState<number | null>(null)
  const [draftPaymentMethodId, setDraftPaymentMethodId] = useState<number | null>(null)
  const editDisclosure = useDisclosure()
  const deleteDisclosure = useDisclosure()

  // Keep the last plan mounted while the close transition plays out.
  useEffect(() => {
    if (plan) setDisplayPlan(plan)
    else {
      const id = window.setTimeout(() => setDisplayPlan(null), 320)
      return () => window.clearTimeout(id)
    }
  }, [plan])

  // Reset edit drafts whenever a different plan is opened.
  useEffect(() => {
    if (!plan) return
    setShowAllSchedule(false)
    setDraftInstallmentValue(String(plan.installmentValue))
    setDraftTotalAmount(String(plan.totalAmount))
    setDraftStartDate(getPlanStartDate(plan))
    setDraftAccountId(plan.accountId ?? null)
    setDraftPaymentMethodId(plan.paymentMethodId ?? null)
  }, [plan])

  // Load account / card options lazily when the edit modal opens.
  useEffect(() => {
    if (!editDisclosure.isOpen || !displayPlan) return
    Promise.all([listAccounts(), listPaymentMethods()])
      .then(([accountItems, methodItems]) => {
        setAccounts(accountItems)
        setPaymentMethods(methodItems)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: t('installments.drawer.loadOptionsError'),
          dedupeKey: `installment-options-load-failed:${displayPlan.id}`,
        })
      })
  }, [editDisclosure.isOpen, displayPlan, t])

  const sortedTransactions = useMemo(
    () =>
      displayPlan
        ? [...displayPlan.transactions].sort(
            (a, b) =>
              a.installmentNumber - b.installmentNumber ||
              new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
        : [],
    [displayPlan],
  )

  // Installments removed when the plan was ended early: rebuilt from the last
  // kept one so the schedule still shows what was never paid.
  const cancelledRows = useMemo(() => {
    const count = displayPlan?.cancelledInstallments ?? 0
    const last = sortedTransactions[sortedTransactions.length - 1]
    if (!displayPlan || count <= 0 || !last) return []
    return Array.from({ length: count }, (_, i) => ({
      installmentNumber: last.installmentNumber + i + 1,
      date: addMonths(last.date, i + 1),
    }))
  }, [displayPlan, sortedTransactions])

  const paidCount = useMemo(() => {
    if (!displayPlan) return 0
    const now = new Date()
    return displayPlan.transactions.filter((t) => new Date(t.date) < now).length
  }, [displayPlan])

  if (!displayPlan) return null

  const p = displayPlan
  const isPast = isInstallmentPlanCompleted(p)
  const originalTotal = p.totalInstallments + cancelledRows.length
  const firstTransaction = p.transactions[0]
  const title = firstTransaction?.description
    ? getInstallmentPlanTitle(firstTransaction.description)
    : t('installments.plan.fallbackTitle')
  const progressPct = p.totalInstallments > 0
    ? Math.min(100, Math.round((paidCount / p.totalInstallments) * 100))
    : 0
  const upcomingCount = p.transactions.length - paidCount
  const upcomingTotal = sortedTransactions
    .filter((item) => new Date(item.date) >= new Date())
    .reduce((sum, item) => sum + item.amount, 0)
  // Ending early only differs from deleting when some installments are paid and some still to come.
  const canClose = paidCount > 0 && upcomingCount > 0

  const handleClose = async () => {
    setIsClosing(true)
    try {
      await closeInstallmentPlan(p.id)
      ToastService.success({
        title: t('installments.drawer.closedTitle'),
        description: t('installments.drawer.closedDescription', { count: upcomingCount }),
        duration: 2500,
        dedupeKey: `installment-plan-closed:${p.id}`,
      })
      deleteDisclosure.onClose()
      onChanged()
      onClose()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: t('installments.drawer.closeError'),
        duration: 3000,
        dedupeKey: `installment-plan-close-failed:${p.id}`,
      })
    } finally {
      setIsClosing(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteInstallmentPlan(p.id)
      ToastService.success({
        title: t('installments.drawer.deletedTitle'),
        description: t('installments.drawer.deletedDescription'),
        duration: 2000,
        dedupeKey: `installment-plan-deleted:${p.id}`,
      })
      deleteDisclosure.onClose()
      onChanged()
      onClose()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: t('installments.drawer.deleteError'),
        duration: 3000,
        dedupeKey: `installment-plan-delete-failed:${p.id}`,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSavePlan = async () => {
    const nextValue = Number(draftInstallmentValue)
    const nextTotal = Number(draftTotalAmount)
    if (nextTotal <= 0 || Number.isNaN(nextTotal) || nextValue <= 0 || Number.isNaN(nextValue) || !draftStartDate || !draftAccountId) {
      ToastService.warning({
        title: t('installments.drawer.invalidPlan'),
        duration: 2500,
        dedupeKey: `installment-plan-invalid:${p.id}`,
      })
      return
    }

    setIsSavingPlan(true)
    try {
      await updateInstallmentPlan(p.id, {
        installmentValue: nextValue,
        totalAmount: nextTotal,
        startDate: draftStartDate,
        accountId: draftAccountId,
        paymentMethodId: draftPaymentMethodId,
      })
      ToastService.success({
        title: t('installments.drawer.updatedTitle'),
        description: t('installments.drawer.updatedDescription'),
        duration: 2500,
        dedupeKey: `installment-plan-updated:${p.id}`,
      })
      editDisclosure.onClose()
      onChanged()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: t('installments.drawer.updateError'),
        duration: 3000,
        dedupeKey: `installment-plan-update-failed:${p.id}`,
      })
    } finally {
      setIsSavingPlan(false)
    }
  }

  const handleInstallmentValueChange = (value: string) => {
    setDraftInstallmentValue(value)
    const numericValue = Number(value)
    if (numericValue > 0 && !Number.isNaN(numericValue)) {
      setDraftTotalAmount((numericValue * p.totalInstallments).toFixed(2))
    }
  }

  const handleTotalAmountChange = (value: string) => {
    setDraftTotalAmount(value)
    const numericValue = Number(value)
    if (numericValue > 0 && !Number.isNaN(numericValue) && p.totalInstallments > 0) {
      setDraftInstallmentValue((numericValue / p.totalInstallments).toFixed(2))
    }
  }

  // Collapsed and ended early: a couple of the cancelled ones after the last paid.
  const visibleCancelled = showAllSchedule ? cancelledRows : isPast ? cancelledRows.slice(0, 2) : []
  const visibleTransactions = showAllSchedule
    ? sortedTransactions
    : (() => {
        // Collapsed: the next few unpaid installments (or the last few once done).
        const upcoming = sortedTransactions.filter((item) => new Date(item.date) >= new Date())
        const preview = SCHEDULE_PREVIEW - visibleCancelled.length
        return (upcoming.length ? upcoming : sortedTransactions.slice(-preview)).slice(0, preview)
      })()

  return (
    <>
      <NuDetailSheet
        open={open}
        onClose={onClose}
        ariaLabel={t('installments.drawer.detailAria', { title })}
        escapeDisabled={editDisclosure.isOpen || deleteDisclosure.isOpen}
        media={<PlanLogo name={title} category={firstTransaction?.category} size={44} />}
        title={title}
        caption={firstTransaction?.category ? categoryLabel(firstTransaction.category) : undefined}
        amountLabel={t('installments.drawer.perInstallment')}
        amount={formatCurrency(p.installmentValue)}
        badge={
          <NuSheetBadge tone={isPast ? 'muted' : 'light'}>
            {isPast
              ? t(cancelledRows.length ? 'installments.drawer.endedPlan' : 'installments.drawer.completedPlan')
              : t('installments.progress.paid', { paid: paidCount, total: p.totalInstallments })}
          </NuSheetBadge>
        }
        headerExtra={
          <Box h="6px" w="full" bg="rgba(255,255,255,0.22)" borderRadius="full" overflow="hidden" aria-hidden="true">
            <Box h="full" w={`${isPast ? 100 : progressPct}%`} bg="white" borderRadius="full" transition="width 0.4s ease" />
          </Box>
        }
        footer={
          <>
            <NuSheetButton tone="primary" flex={1} leftIcon={<Icon as={Pencil} boxSize={4} />} onClick={editDisclosure.onOpen}>
              {t('installments.drawer.editPlan')}
            </NuSheetButton>
            <NuSheetButton tone="danger" px={5} leftIcon={<Icon as={Trash2} boxSize={4} />} onClick={deleteDisclosure.onOpen}>
              {canClose ? t('installments.drawer.end') : t('installments.drawer.delete')}
            </NuSheetButton>
          </>
        }
      >
        <NuFacts
          items={[
            { label: t('installments.drawer.total'), value: formatCurrency(p.totalAmount) },
            { label: t('installments.drawer.installments'), value: `${p.totalInstallments}× ${formatCurrency(p.installmentValue)}` },
            { label: t('installments.drawer.card'), value: p.paymentMethodName ?? t('installments.drawer.noCardLinked') },
            { label: t('installments.drawer.account'), value: p.accountName ?? t('installments.drawer.notLinked') },
          ]}
        />

        <Flex mt={5} mb={2} align="center" justify="space-between">
          <Text fontSize="sm" fontWeight={700}>
            {t('installments.drawer.schedule')}
          </Text>
          {sortedTransactions.length + cancelledRows.length > SCHEDULE_PREVIEW && (
            <Button
              variant="link"
              size="sm"
              color={NU_SHEET_COLORS.brand}
              fontWeight={700}
              onClick={() => setShowAllSchedule((value) => !value)}
            >
              {showAllSchedule
                ? t('installments.drawer.showLess')
                : t('installments.drawer.showAll', { count: sortedTransactions.length + cancelledRows.length })}
            </Button>
          )}
        </Flex>
        <VStack align="stretch" spacing={0}>
          {visibleTransactions.map((transaction) => {
            const isPaid = new Date(transaction.date) < new Date()
            return (
              <Flex
                key={transaction.id}
                align="center"
                gap={3}
                py={2.5}
                borderBottom="1px solid #ececf1"
                _last={{ borderBottom: 0 }}
              >
                <Box
                  w="34px"
                  h="34px"
                  flexShrink={0}
                  display="grid"
                  placeItems="center"
                  borderRadius="full"
                  bg={isPaid ? '#e3f4ec' : NU_SHEET_COLORS.brandSoft}
                  color={isPaid ? '#0f8a5f' : NU_SHEET_COLORS.brand}
                  fontSize="xs"
                  fontWeight={800}
                >
                  {isPaid ? <Icon as={CheckCircle2} boxSize="16px" /> : transaction.installmentNumber}
                </Box>
                <Box flex={1} minW={0}>
                  <Text fontSize="sm" fontWeight={700}>
                    {formatDate(new Date(transaction.date), { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                  <Text fontSize="xs" color={NU_SHEET_COLORS.inkSoft}>
                    {transaction.installmentNumber}/{originalTotal} · {t(isPaid ? 'installments.status.paid' : 'installments.status.pending')}
                  </Text>
                </Box>
                <Text fontSize="sm" fontWeight={700}>
                  {formatCurrency(transaction.amount)}
                </Text>
              </Flex>
            )
          })}
          {/* Ended early: the dropped installments, muted and struck through. */}
          {visibleCancelled.map((row) => (
            <Flex
              key={`cancelled-${row.installmentNumber}`}
              align="center"
              gap={3}
              py={2}
              borderBottom="1px solid #ececf1"
              _last={{ borderBottom: 0 }}
              opacity={0.45}
            >
              <Box
                w="34px"
                h="34px"
                flexShrink={0}
                display="grid"
                placeItems="center"
                borderRadius="full"
                border="1px dashed"
                borderColor={NU_SHEET_COLORS.inkSoft}
                color={NU_SHEET_COLORS.inkSoft}
                fontSize="xs"
                fontWeight={700}
              >
                {row.installmentNumber}
              </Box>
              <Box flex={1} minW={0}>
                <Text fontSize="sm" fontWeight={600} textDecoration="line-through">
                  {formatDate(new Date(row.date), { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
                <Text fontSize="xs" color={NU_SHEET_COLORS.inkSoft}>
                  {row.installmentNumber}/{originalTotal} · {t('installments.status.cancelled')}
                </Text>
              </Box>
              <Text fontSize="sm" fontWeight={600} color={NU_SHEET_COLORS.inkSoft} textDecoration="line-through">
                {formatCurrency(p.installmentValue)}
              </Text>
            </Flex>
          ))}
        </VStack>
      </NuDetailSheet>

      {/* Edit plan modal */}
      <PremiumModal
        isOpen={editDisclosure.isOpen}
        onClose={editDisclosure.onClose}
        size="full"
        contentProps={{ ...NU_MODAL_CONTENT, maxW: '520px', w: { base: '100%', md: 'min(520px, calc(100vw - 32px))' } }}
        header={
          <NuModalHeader
            title={t('installments.drawer.editModal.title')}
            caption={t('installments.drawer.editModal.subtitle')}
            onClose={editDisclosure.onClose}
          />
        }
      >
        <Box
          overflowY="auto"
          flex={1}
          minH={0}
          px={{ base: 4, md: 6 }}
          pt={5}
          pb="max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))"
        >
          <SimpleGrid columns={2} spacing={3}>
            <FormControl gridColumn="span 2">
              {fieldLabel(t('installments.drawer.account'))}
              <Select
                {...NU_FIELD}
                value={draftAccountId ?? ''}
                onChange={(event) => setDraftAccountId(event.target.value ? Number(event.target.value) : null)}
                placeholder={t('installments.drawer.editModal.selectAccount')}
              >
                {accounts.filter((account) => account.active).map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl gridColumn="span 2">
              {fieldLabel(t('installments.drawer.editModal.paymentMethod'))}
              <Select
                {...NU_FIELD}
                value={draftPaymentMethodId ?? ''}
                onChange={(event) => {
                  const nextId = event.target.value ? Number(event.target.value) : null
                  setDraftPaymentMethodId(nextId)
                  const card = paymentMethods.find((method) => method.id === nextId)
                  if (card?.settlementAccountId) {
                    setDraftAccountId(card.settlementAccountId)
                  }
                }}
              >
                <option value="">{t('installments.drawer.editModal.noPaymentMethod')}</option>
                {paymentMethods.filter((method) => method.active).map((method) => (
                  <option key={method.id} value={method.id}>{method.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl gridColumn="span 2">
              {fieldLabel(t('installments.drawer.editModal.firstDate'))}
              <Input {...NU_FIELD} type="date" value={draftStartDate} onChange={(event) => setDraftStartDate(event.target.value)} />
            </FormControl>
            <FormControl>
              {fieldLabel(t('installments.drawer.editModal.purchaseTotal'))}
              <Input
                {...NU_FIELD}
                type="number"
                min={0}
                step="0.01"
                fontWeight={700}
                value={draftTotalAmount}
                onChange={(event) => handleTotalAmountChange(event.target.value)}
              />
            </FormControl>
            <FormControl>
              {fieldLabel(t('installments.drawer.editModal.amountPerInstallment'))}
              <Input
                {...NU_FIELD}
                type="number"
                min={0}
                step="0.01"
                fontWeight={700}
                value={draftInstallmentValue}
                onChange={(event) => handleInstallmentValueChange(event.target.value)}
              />
            </FormControl>
          </SimpleGrid>

          <HStack mt={6} spacing={2}>
            <NuSheetButton tone="ghost" onClick={editDisclosure.onClose} isDisabled={isSavingPlan}>
              {t('installments.drawer.cancel')}
            </NuSheetButton>
            <NuSheetButton
              tone="primary"
              flex={1}
              onClick={handleSavePlan}
              isLoading={isSavingPlan}
              isDisabled={!draftAccountId}
            >
              {t('installments.drawer.editModal.save')}
            </NuSheetButton>
          </HStack>
        </Box>
      </PremiumModal>

      {/* End / delete chooser */}
      <PremiumModal
        isOpen={deleteDisclosure.isOpen}
        onClose={deleteDisclosure.onClose}
        size="full"
        contentProps={NU_MODAL_CONTENT}
        header={
          <NuModalHeader
            title={canClose ? t('installments.drawer.endModal.title') : t('installments.drawer.deleteModal.title')}
            caption={title}
            onClose={deleteDisclosure.onClose}
          />
        }
      >
        <Box
          overflowY="auto"
          flex={1}
          minH={0}
          px={{ base: 4, md: 6 }}
          pt={5}
          pb="max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))"
        >
          {canClose ? (
            <VStack align="stretch" spacing={3}>
              <EndOption
                tone="primary"
                title={isClosing ? t('installments.drawer.endModal.closing') : t('installments.drawer.endModal.closeTitle')}
                body={t('installments.drawer.endModal.closeBody', {
                  upcoming: upcomingCount,
                  paid: paidCount,
                  count: p.transactions.length,
                  amount: formatCurrency(upcomingTotal),
                })}
                disabled={isClosing || isDeleting}
                dimmed={isDeleting}
                onClick={handleClose}
              />
              <EndOption
                tone="danger"
                title={isDeleting ? t('installments.drawer.deleteModal.deleting') : t('installments.drawer.endModal.deleteTitle')}
                body={t('installments.drawer.endModal.deleteBody', { count: p.transactions.length, paid: paidCount })}
                disabled={isClosing || isDeleting}
                dimmed={isClosing}
                onClick={handleDelete}
              />
            </VStack>
          ) : (
            <Text fontSize="sm" color={NU_SHEET_COLORS.inkSoft} lineHeight={1.6}>
              {paidCount > 0
                ? t('installments.drawer.deleteModal.bodyPaid', { count: p.transactions.length })
                : t('installments.drawer.deleteModal.body', { count: p.transactions.length })}
            </Text>
          )}

          <HStack mt={5} spacing={2}>
            <NuSheetButton tone="ghost" flex={canClose ? 1 : undefined} onClick={deleteDisclosure.onClose} isDisabled={isClosing || isDeleting}>
              {t('installments.drawer.cancel')}
            </NuSheetButton>
            {!canClose && (
              <NuSheetButton
                tone="danger"
                flex={1}
                leftIcon={<Icon as={Trash2} boxSize={4} />}
                onClick={handleDelete}
                isLoading={isDeleting}
                loadingText={t('installments.drawer.deleteModal.deleting')}
              >
                {t('installments.drawer.delete')}
              </NuSheetButton>
            )}
          </HStack>
        </Box>
      </PremiumModal>
    </>
  )
}

/** One choice in the end/delete chooser: tinted card with a title and an explanation. */
function EndOption({
  tone,
  title,
  body,
  disabled,
  dimmed,
  onClick,
}: {
  tone: 'primary' | 'danger'
  title: string
  body: string
  disabled: boolean
  dimmed: boolean
  onClick: () => void
}) {
  const primary = tone === 'primary'
  const accent = primary ? NU_SHEET_COLORS.brand : NU_SHEET_COLORS.danger
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      textAlign="left"
      w="full"
      p={4}
      borderRadius="18px"
      border="1.5px solid"
      borderColor={primary ? accent : '#ececf1'}
      bg={primary ? NU_SHEET_COLORS.brandSoft : 'white'}
      opacity={dimmed ? 0.5 : 1}
      cursor={disabled ? 'default' : 'pointer'}
      transition="background-color .15s ease, border-color .15s ease"
      _hover={disabled ? undefined : { borderColor: accent, bg: primary ? '#ead6fb' : NU_SHEET_COLORS.dangerSoft }}
      _focusVisible={{ outline: `2px solid ${accent}`, outlineOffset: '2px' }}
    >
      <Text fontSize="md" fontWeight={800} letterSpacing="-0.01em" color={accent}>
        {title}
      </Text>
      <Text mt={1} fontSize="sm" color={primary ? NU_SHEET_COLORS.ink : NU_SHEET_COLORS.inkSoft} lineHeight={1.5}>
        {body}
      </Text>
    </Box>
  )
}
