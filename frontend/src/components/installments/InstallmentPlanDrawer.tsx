import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import {
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Trash2,
} from '../ui/icons'
import { FinancialAccount, InstallmentPlan, PaymentMethod } from '../../types'
import {
  deleteInstallmentPlan,
  listAccounts,
  listPaymentMethods,
  updateInstallmentPlan,
} from '../../api'
import { ToastService } from '../../services/toast'
import PlanLogo from './PlanLogo'
import { isInstallmentPlanCompleted } from './InstallmentPlanCard'
import { getInstallmentPlanTitle } from '../../utils/installments'
import { useEd } from '../../editorial'
import { useI18n } from '../../i18n'
import { SHEET_SX, sheetContainerProps, sheetGrabberProps } from '../ui/modalLayout'
import NuDetailSheet, { NU_SHEET_COLORS, NuFacts, NuSheetBadge, NuSheetButton, nuButtonProps } from '../ui/NuDetailSheet'

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

const SCHEDULE_PREVIEW = 4

/**
 * Detail sheet for a single installment plan (Nubank style, see
 * NuDetailSheet). Opens when a plan row is clicked and hosts the installment
 * schedule plus edit/delete actions.
 */
export default function InstallmentPlanDrawer({ plan, onClose, onChanged }: InstallmentPlanDrawerProps) {
  const ed = useEd()
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  const open = plan != null
  const [displayPlan, setDisplayPlan] = useState<InstallmentPlan | null>(plan)
  const [showAllSchedule, setShowAllSchedule] = useState(false)

  const [isDeleting, setIsDeleting] = useState(false)
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
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  // ---- Editorial-aware tokens for the Chakra Modal / AlertDialog overlays ----
  const titleColorBase = useColorModeValue('gray.900', 'gray.50')
  const titleColor = ed ? ed.cream : titleColorBase
  const captionColorBase = useColorModeValue('gray.500', 'gray.400')
  const captionColor = ed ? ed.muted : captionColorBase
  const dividerColorBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const dividerColor = ed ? ed.line : dividerColorBase
  const fallbackDialogBg = useColorModeValue('#ffffff', '#0a0a0a')
  const dialogBg = ed?.solid ?? fallbackDialogBg
  const warningChipBgBase = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')
  const warningChipBg = ed ? 'var(--pb-tint-coral)' : warningChipBgBase
  const warningChipFgBase = useColorModeValue('red.600', 'red.300')
  const warningChipFg = ed ? ed.red : warningChipFgBase

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

  const paidCount = useMemo(() => {
    if (!displayPlan) return 0
    const now = new Date()
    return displayPlan.transactions.filter((t) => new Date(t.date) < now).length
  }, [displayPlan])

  if (!displayPlan) return null

  const p = displayPlan
  const isPast = isInstallmentPlanCompleted(p)
  const firstTransaction = p.transactions[0]
  const title = firstTransaction?.description
    ? getInstallmentPlanTitle(firstTransaction.description)
    : t('installments.plan.fallbackTitle')
  const progressPct = p.totalInstallments > 0
    ? Math.min(100, Math.round((paidCount / p.totalInstallments) * 100))
    : 0

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

  const visibleTransactions = showAllSchedule
    ? sortedTransactions
    : (() => {
        // Collapsed: the next few unpaid installments (or the last few once done).
        const upcoming = sortedTransactions.filter((item) => new Date(item.date) >= new Date())
        return (upcoming.length ? upcoming : sortedTransactions.slice(-SCHEDULE_PREVIEW)).slice(0, SCHEDULE_PREVIEW)
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
              ? t('installments.drawer.completedPlan')
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
              {t('installments.drawer.delete')}
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
          {sortedTransactions.length > SCHEDULE_PREVIEW && (
            <Button
              variant="link"
              size="sm"
              color={NU_SHEET_COLORS.brand}
              fontWeight={700}
              onClick={() => setShowAllSchedule((value) => !value)}
            >
              {showAllSchedule
                ? t('installments.drawer.showLess')
                : t('installments.drawer.showAll', { count: sortedTransactions.length })}
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
                    {transaction.installmentNumber}/{p.totalInstallments} · {t(isPaid ? 'installments.status.paid' : 'installments.status.pending')}
                  </Text>
                </Box>
                <Text fontSize="sm" fontWeight={700}>
                  {formatCurrency(transaction.amount)}
                </Text>
              </Flex>
            )
          })}
        </VStack>
      </NuDetailSheet>

      {/* Edit plan modal */}
      <Modal isOpen={editDisclosure.isOpen} onClose={editDisclosure.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent bg={dialogBg} borderRadius="xl" mx={4} containerProps={sheetContainerProps} sx={SHEET_SX}>
          <Box {...sheetGrabberProps} />
          <ModalHeader px={6} pt={5} pb={3}>
            <HStack spacing={3}>
              <Box
                w={9}
                h={9}
                borderRadius="lg"
                bg={NU_SHEET_COLORS.brandSoft}
                color={NU_SHEET_COLORS.brand}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={Pencil} boxSize={4} />
              </Box>
              <VStack align="flex-start" spacing={0}>
                <Text fontWeight={700} fontSize="md" color={titleColor}>
                  {t('installments.drawer.editModal.title')}
                </Text>
                <Text fontSize="xs" color={captionColor}>
                  {t('installments.drawer.editModal.subtitle')}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalBody px={6} pb={4}>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel fontSize="xs" color={captionColor} fontWeight={700}>
                  {t('installments.drawer.account')}
                </FormLabel>
                <Select
                  size="sm"
                  value={draftAccountId ?? ''}
                  onChange={(event) => setDraftAccountId(event.target.value ? Number(event.target.value) : null)}
                  placeholder={t('installments.drawer.editModal.selectAccount')}
                >
                  {accounts.filter((account) => account.active).map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" color={captionColor} fontWeight={700}>
                  {t('installments.drawer.editModal.paymentMethod')}
                </FormLabel>
                <Select
                  size="sm"
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
              <FormControl>
                <FormLabel fontSize="xs" color={captionColor} fontWeight={700}>
                  {t('installments.drawer.editModal.firstDate')}
                </FormLabel>
                <Input
                  type="date"
                  value={draftStartDate}
                  onChange={(event) => setDraftStartDate(event.target.value)}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" color={captionColor} fontWeight={700}>
                  {t('installments.drawer.editModal.purchaseTotal')}
                </FormLabel>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draftTotalAmount}
                  onChange={(event) => handleTotalAmountChange(event.target.value)}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" color={captionColor} fontWeight={700}>
                  {t('installments.drawer.editModal.amountPerInstallment')}
                </FormLabel>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draftInstallmentValue}
                  onChange={(event) => handleInstallmentValueChange(event.target.value)}
                  size="sm"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter px={6} py={4} borderTop="1px solid" borderColor={dividerColor} gap={2}>
            <Button {...nuButtonProps('ghost')} h="44px" onClick={editDisclosure.onClose}>
              {t('installments.drawer.cancel')}
            </Button>
            <Button {...nuButtonProps('primary')} h="44px" px={6} onClick={handleSavePlan} isLoading={isSavingPlan} isDisabled={!draftAccountId}>
              {t('installments.drawer.editModal.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Destructive confirmation */}
      <AlertDialog
        isOpen={deleteDisclosure.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteDisclosure.onClose}
        isCentered
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(8px)">
          <AlertDialogContent
            bg={dialogBg}
            borderRadius="xl"
            boxShadow="0 20px 60px -20px rgba(0,0,0,0.4)"
            maxW="440px"
            mx={4}
            overflow="hidden"
            containerProps={sheetContainerProps}
            sx={SHEET_SX}
          >
            <Box {...sheetGrabberProps} />
            <AlertDialogHeader px={6} pt={5} pb={3} display="flex" alignItems="center" gap={3}>
              <Box
                w={9}
                h={9}
                borderRadius="lg"
                bg={warningChipBg}
                color={warningChipFg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={AlertTriangle} boxSize={4} strokeWidth={2.25} />
              </Box>
              <VStack align="flex-start" spacing={0}>
                <Text fontWeight={700} fontSize="md" color={titleColor} lineHeight="1.2">
                  {t('installments.drawer.deleteModal.title')}
                </Text>
                <Text fontSize="xs" color={captionColor}>
                  {t('installments.drawer.deleteModal.subtitle')}
                </Text>
              </VStack>
            </AlertDialogHeader>

            <AlertDialogBody px={6} pb={4}>
              <Text fontSize="sm" color={captionColor}>
                {t('installments.drawer.deleteModal.body', { count: p.totalInstallments })}
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter px={6} py={4} borderTop="1px solid" borderColor={dividerColor} gap={2}>
              <Button
                ref={cancelRef}
                onClick={deleteDisclosure.onClose}
                variant="ghost"
                fontSize="sm"
                fontWeight={600}
                color={captionColor}
              >
                {t('installments.drawer.cancel')}
              </Button>
              <Button
                onClick={handleDelete}
                isLoading={isDeleting}
                loadingText={t('installments.drawer.deleteModal.deleting')}
                colorScheme="red"
                h="44px"
                px={6}
                borderRadius="full"
                fontSize="sm"
                fontWeight={700}
              >
                {t('installments.drawer.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
