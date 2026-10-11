import React, { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Select,
  SimpleGrid,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { AlertTriangle, Check, Pencil, Trash2, TrendingDown, TrendingUp } from '../ui/icons'
import {
  cancelRecurringTransaction,
  listAccounts,
  listPaymentMethods,
  updateRecurringTransaction,
} from '../../api'
import {
  FinancialAccount,
  PaymentMethod,
  RecurringTransaction,
  RecurringUpdateScope,
} from '../../types'
import { ToastService } from '../../services/toast'
import { useEd } from '../../editorial'
import { useI18n } from '../../i18n'
import '../../features/dashboard/theme/pb-tokens.css'
import { SHEET_SX, sheetContainerProps, sheetGrabberProps } from '../ui/modalLayout'
import NuDetailSheet, { NU_SHEET_COLORS, NuFacts, NuSheetBadge, NuSheetButton, nuButtonProps } from '../ui/NuDetailSheet'

interface RecurringTransactionDrawerProps {
  recurringTransaction: RecurringTransaction | null
  onClose: () => void
  /** Reload the list after the rule is edited or cancelled. */
  onChanged: () => void | Promise<void>
}

const NU_FIELD = {
  h: '44px',
  borderRadius: '12px',
  bg: NU_SHEET_COLORS.surface,
  border: '1.5px solid transparent',
  fontSize: 'sm',
  _hover: { bg: '#ededf2' },
  _focus: { bg: 'white', borderColor: NU_SHEET_COLORS.brand, boxShadow: 'none' },
  _focusVisible: { bg: 'white', borderColor: NU_SHEET_COLORS.brand, boxShadow: 'none' },
} as const

/**
 * Detail sheet for a single fixed payment / income (Nubank style, see
 * NuDetailSheet). Opens when a rule row is clicked and hosts inline editing
 * plus the cancel action.
 */
export default function RecurringTransactionDrawer({
  recurringTransaction,
  onClose,
  onChanged,
}: RecurringTransactionDrawerProps) {
  const ed = useEd()
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  const open = recurringTransaction != null
  const [displayItem, setDisplayItem] = useState<RecurringTransaction | null>(recurringTransaction)

  const [isCancelling, setIsCancelling] = useState(false)
  const [isSavingAmount, setIsSavingAmount] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draftAmount, setDraftAmount] = useState('')
  const [draftStartDate, setDraftStartDate] = useState('')
  const [draftDayOfMonth, setDraftDayOfMonth] = useState('')
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [draftAccountId, setDraftAccountId] = useState<number | null>(null)
  const [draftPaymentMethodId, setDraftPaymentMethodId] = useState<number | null>(null)
  const [draftApplyFrom, setDraftApplyFrom] = useState<RecurringUpdateScope>('CURRENT_MONTH')
  const deleteDisclosure = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  // ---- Editorial-aware tokens for the cancel AlertDialog overlay ----
  const titleColorBase = useColorModeValue('gray.900', 'gray.50')
  const titleColor = ed ? ed.cream : titleColorBase
  const captionColorBase = useColorModeValue('gray.500', 'gray.400')
  const captionColor = ed ? ed.muted : captionColorBase
  const dividerColorBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const dividerColor = ed ? ed.line : dividerColorBase
  const dialogBgBase = useColorModeValue('#ffffff', '#0a0a0a')
  const dialogBg = ed ? ed.modal : dialogBgBase
  const warningChipBgBase = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')
  const warningChipBg = ed ? 'var(--pb-tint-coral)' : warningChipBgBase
  const warningChipFgBase = useColorModeValue('red.600', 'red.300')
  const warningChipFg = ed ? ed.red : warningChipFgBase

  // Keep the last rule mounted while the close transition plays out.
  useEffect(() => {
    if (recurringTransaction) setDisplayItem(recurringTransaction)
    else {
      const id = window.setTimeout(() => setDisplayItem(null), 320)
      return () => window.clearTimeout(id)
    }
  }, [recurringTransaction])

  // Reset drafts (and exit edit mode) whenever a different rule is opened.
  useEffect(() => {
    if (!recurringTransaction) return
    setIsEditing(false)
    setDraftAmount(String(recurringTransaction.amount))
    setDraftStartDate(recurringTransaction.startDate)
    setDraftDayOfMonth(String(recurringTransaction.dayOfMonth))
    setDraftAccountId(recurringTransaction.accountId ?? null)
    setDraftPaymentMethodId(recurringTransaction.paymentMethodId ?? null)
    setDraftApplyFrom('CURRENT_MONTH')
  }, [recurringTransaction])

  // Load account / card options lazily when editing starts.
  useEffect(() => {
    if (!isEditing || !displayItem) return
    Promise.all([listAccounts(), listPaymentMethods()])
      .then(([accountItems, methodItems]) => {
        setAccounts(accountItems)
        setPaymentMethods(methodItems)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: t('recurring.optionsLoadFailed'),
          dedupeKey: `recurring-options-load-failed:${displayItem.id}`,
        })
      })
  }, [isEditing, displayItem, t])

  if (!displayItem) return null

  const r = displayItem
  const isIncome = r.type === 'INCOME'
  const typeIcon = isIncome ? TrendingUp : TrendingDown

  const resetDrafts = () => {
    setDraftAmount(String(r.amount))
    setDraftStartDate(r.startDate)
    setDraftDayOfMonth(String(r.dayOfMonth))
    setDraftAccountId(r.accountId ?? null)
    setDraftPaymentMethodId(r.paymentMethodId ?? null)
    setDraftApplyFrom('CURRENT_MONTH')
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await cancelRecurringTransaction(r.id)
      ToastService.success({
        title: t('recurring.cancelledToast'),
        duration: 2000,
        dedupeKey: `recurring-cancelled:${r.id}`,
      })
      deleteDisclosure.onClose()
      await Promise.resolve(onChanged())
      onClose()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: t('recurring.cancelFailed'),
        duration: 3000,
        dedupeKey: `recurring-cancel-failed:${r.id}`,
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handleSaveAmount = async () => {
    const nextAmount = Number(draftAmount)
    const nextDayOfMonth = Number(draftDayOfMonth)
    if (
      nextAmount <= 0 ||
      Number.isNaN(nextAmount) ||
      !draftStartDate ||
      nextDayOfMonth < 1 ||
      nextDayOfMonth > 31 ||
      Number.isNaN(nextDayOfMonth) ||
      !draftAccountId
    ) {
      ToastService.warning({
        title: t('recurring.invalidAmountDate'),
        duration: 2500,
        dedupeKey: `recurring-invalid-amount:${r.id}`,
      })
      return
    }

    setIsSavingAmount(true)
    try {
      await updateRecurringTransaction(r.id, {
        amount: nextAmount,
        startDate: draftStartDate,
        dayOfMonth: nextDayOfMonth,
        accountId: draftAccountId,
        paymentMethodId: draftPaymentMethodId,
        applyFrom: draftApplyFrom,
      })
      ToastService.success({
        title: t('recurring.updatedToast'),
        description:
          draftApplyFrom === 'CURRENT_MONTH'
            ? t('recurring.updatedCurrentSchedule')
            : t('recurring.updatedFutureSchedule'),
        duration: 2500,
        dedupeKey: `recurring-amount-updated:${r.id}`,
      })
      setIsEditing(false)
      await Promise.resolve(onChanged())
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: t('recurring.updateFailed'),
        duration: 3000,
        dedupeKey: `recurring-amount-update-failed:${r.id}`,
      })
    } finally {
      setIsSavingAmount(false)
    }
  }

  const fieldLabel = (label: string) => (
    <FormLabel mb={1} fontSize="xs" color={NU_SHEET_COLORS.inkSoft} fontWeight={600}>
      {label}
    </FormLabel>
  )

  const footer = !r.active ? undefined : isEditing ? (
    <>
      <NuSheetButton
        tone="ghost"
        onClick={() => {
          resetDrafts()
          setIsEditing(false)
        }}
      >
        {t('common.cancel')}
      </NuSheetButton>
      <NuSheetButton
        tone="primary"
        flex={1}
        leftIcon={<Icon as={Check} boxSize={4} />}
        onClick={handleSaveAmount}
        isLoading={isSavingAmount}
        isDisabled={!draftAccountId}
      >
        {t('common.save')}
      </NuSheetButton>
    </>
  ) : (
    <>
      <NuSheetButton tone="primary" flex={1} leftIcon={<Icon as={Pencil} boxSize={4} />} onClick={() => setIsEditing(true)}>
        {t('common.edit')}
      </NuSheetButton>
      <NuSheetButton tone="danger" px={5} leftIcon={<Icon as={Trash2} boxSize={4} />} onClick={deleteDisclosure.onOpen}>
        {t('recurring.cancelRule')}
      </NuSheetButton>
    </>
  )

  return (
    <>
      <NuDetailSheet
        open={open}
        onClose={onClose}
        ariaLabel={t('recurring.detailAria', { description: r.description })}
        escapeDisabled={deleteDisclosure.isOpen}
        media={<Icon as={typeIcon} boxSize="22px" weight="bold" />}
        title={r.description}
        caption={`${categoryLabel(r.category)} · ${t(isIncome ? 'type.INCOME' : 'type.EXPENSE')}`}
        amountLabel={t('recurring.monthlyAmount')}
        amount={`${isIncome ? '+' : '−'}${formatCurrency(r.amount)}`}
        badge={
          <NuSheetBadge tone={r.active ? 'light' : 'muted'}>
            {r.active ? t('recurring.activeRule') : t('recurring.cancelled')}
          </NuSheetBadge>
        }
        footer={footer}
      >
        {isEditing ? (
          <VStack align="stretch" spacing={3}>
            <SimpleGrid columns={2} spacing={3}>
              <FormControl>
                {fieldLabel(t('recurring.amount'))}
                <Input {...NU_FIELD} value={draftAmount} onChange={(e) => setDraftAmount(e.target.value)} type="number" min={0} step="0.01" fontWeight={700} />
              </FormControl>
              <FormControl>
                {fieldLabel(t('recurring.paymentDay'))}
                <Input {...NU_FIELD} value={draftDayOfMonth} onChange={(e) => setDraftDayOfMonth(e.target.value)} type="number" min={1} max={31} step={1} />
              </FormControl>
              <FormControl>
                {fieldLabel(t('recurring.startDate'))}
                <Input {...NU_FIELD} value={draftStartDate} onChange={(e) => setDraftStartDate(e.target.value)} type="date" />
              </FormControl>
              <FormControl>
                {fieldLabel(t('recurring.applyChangesFrom'))}
                <Select {...NU_FIELD} value={draftApplyFrom} onChange={(e) => setDraftApplyFrom(e.target.value as RecurringUpdateScope)}>
                  <option value="CURRENT_MONTH">{t('recurring.currentAndFuture')}</option>
                  <option value="NEXT_MONTH">{t('recurring.nextMonthOnwards')}</option>
                </Select>
              </FormControl>
              <FormControl>
                {fieldLabel(t('recurring.account'))}
                <Select
                  {...NU_FIELD}
                  value={draftAccountId ?? ''}
                  onChange={(e) => setDraftAccountId(e.target.value ? Number(e.target.value) : null)}
                  placeholder={t('recurring.selectAccount')}
                >
                  {accounts.filter((a) => a.active).map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                {fieldLabel(t('recurring.paymentMethod'))}
                <Select
                  {...NU_FIELD}
                  value={draftPaymentMethodId ?? ''}
                  onChange={(e) => setDraftPaymentMethodId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">{t('recurring.noPaymentMethod')}</option>
                  {paymentMethods.filter((m) => m.active).map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>
            <Text fontSize="xs" color={NU_SHEET_COLORS.inkSoft}>
              {t('recurring.applyHelp')}
            </Text>
          </VStack>
        ) : (
          <NuFacts
            items={[
              { label: t('recurring.paymentDay'), value: t('recurring.dayNumber', { day: r.dayOfMonth }) },
              {
                label: t('recurring.nextPayment'),
                value: r.nextRunDate
                  ? formatDate(r.nextRunDate, { day: '2-digit', month: 'short', year: 'numeric' })
                  : t('recurring.notScheduled'),
              },
              { label: t('recurring.startDate'), value: formatDate(r.startDate, { day: '2-digit', month: 'short', year: 'numeric' }) },
              { label: t('recurring.frequency'), value: t('recurring.monthly') },
              { label: t('recurring.account'), value: r.accountName ?? t('recurring.notLinked') },
              { label: t('recurring.card'), value: r.paymentMethodName ?? t('recurring.noCardLinked') },
            ]}
          />
        )}
      </NuDetailSheet>

      {/* Cancel confirmation */}
      <AlertDialog
        isOpen={deleteDisclosure.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteDisclosure.onClose}
        isCentered
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(8px)">
          <AlertDialogContent bg={dialogBg} borderRadius="xl" maxW="440px" mx={4} containerProps={sheetContainerProps} sx={SHEET_SX}>
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
                <Text fontWeight={700} fontSize="md" color={titleColor}>
                  {t('recurring.cancelTitle')}
                </Text>
                <Text fontSize="xs" color={captionColor}>
                  {t('recurring.cancelCaption')}
                </Text>
              </VStack>
            </AlertDialogHeader>

            <AlertDialogBody px={6} pb={4}>
              <Text fontSize="sm" color={captionColor}>
                {t('recurring.cancelBodyBefore')} <Text as="span" fontWeight={700} color={titleColor}>{r.description}</Text>{' '}
                {t('recurring.cancelBodyAfter')}
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter px={6} py={4} borderTop="1px solid" borderColor={dividerColor} gap={2}>
              <Button ref={cancelRef} onClick={deleteDisclosure.onClose} {...nuButtonProps('ghost')} h="44px">
                {t('recurring.keepActive')}
              </Button>
              <Button colorScheme="red" onClick={handleCancel} isLoading={isCancelling} h="44px" px={6} borderRadius="full" fontSize="sm" fontWeight={700}>
                {t('recurring.cancelPayment')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
