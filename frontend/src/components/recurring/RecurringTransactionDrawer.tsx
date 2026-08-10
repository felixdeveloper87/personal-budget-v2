import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { AlertTriangle, Check, Pencil, Trash2, TrendingDown, TrendingUp, X } from '../ui/icons'
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
import '../../features/dashboard/theme/pb-tokens.css'

interface RecurringTransactionDrawerProps {
  recurringTransaction: RecurringTransaction | null
  onClose: () => void
  /** Reload the list after the rule is edited or cancelled. */
  onChanged: () => void | Promise<void>
}

const money = (value: number) => `£${value.toFixed(2)}`

function formatDate(value?: string) {
  if (!value) return 'Not scheduled'
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <Flex justify="space-between" align="baseline" gap="1rem" py=".6rem" borderBottom="1px solid var(--pb-hair)">
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="10.5px"
        letterSpacing="0.06em"
        textTransform="uppercase"
        color="var(--pb-ink-faint)"
        flexShrink={0}
      >
        {k}
      </Text>
      <Text fontFamily="var(--pb-serif)" fontSize=".98rem" color="var(--pb-ink)" textAlign="right" noOfLines={2}>
        {v}
      </Text>
    </Flex>
  )
}

/**
 * Right-side detail panel for a single fixed payment / income — mirrors the
 * Transactions page drawer. Opens when a rule row is clicked and hosts inline
 * editing plus the cancel action.
 */
export default function RecurringTransactionDrawer({
  recurringTransaction,
  onClose,
  onChanged,
}: RecurringTransactionDrawerProps) {
  const ed = useEd()
  const open = recurringTransaction != null
  const [displayItem, setDisplayItem] = useState<RecurringTransaction | null>(recurringTransaction)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<Element | null>(null)

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
          title: 'Could not load account options',
          dedupeKey: `recurring-options-load-failed:${displayItem.id}`,
        })
      })
  }, [isEditing, displayItem])

  // Escape to close + focus management.
  useEffect(() => {
    if (!open) return
    lastFocused.current = document.activeElement
    const t = window.setTimeout(() => closeRef.current?.focus(), 40)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleteDisclosure.isOpen) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      if (lastFocused.current instanceof HTMLElement) lastFocused.current.focus()
    }
  }, [open, onClose, deleteDisclosure.isOpen])

  if (!displayItem) return null

  const r = displayItem
  const isIncome = r.type === 'INCOME'
  const typeIcon = isIncome ? TrendingUp : TrendingDown
  const amountColor = isIncome ? 'var(--pb-income-2)' : 'var(--pb-coral)'
  const accentTint = isIncome ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'

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
        title: 'Fixed payment cancelled',
        duration: 2000,
        dedupeKey: `recurring-cancelled:${r.id}`,
      })
      deleteDisclosure.onClose()
      await Promise.resolve(onChanged())
      onClose()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: 'Could not cancel fixed payment',
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
        title: 'Enter a valid amount and date',
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
        title: 'Fixed payment updated',
        description:
          draftApplyFrom === 'CURRENT_MONTH'
            ? "This month's linked transaction and the future schedule were updated."
            : 'This month was kept unchanged; the future schedule was updated.',
        duration: 2500,
        dedupeKey: `recurring-amount-updated:${r.id}`,
      })
      setIsEditing(false)
      await Promise.resolve(onChanged())
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: 'Could not update amount',
        duration: 3000,
        dedupeKey: `recurring-amount-update-failed:${r.id}`,
      })
    } finally {
      setIsSavingAmount(false)
    }
  }

  return createPortal(
    <Box position="fixed" inset={0} zIndex={1400} aria-hidden={!open} pointerEvents={open ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Box
        position="absolute"
        inset={0}
        bg="rgba(23,37,28,.34)"
        backdropFilter="blur(2px)"
        opacity={open ? 1 : 0}
        transition="opacity 0.32s cubic-bezier(.2,.7,.2,1)"
        onClick={onClose}
      />

      {/* Panel */}
      <Box
        role="dialog"
        aria-modal={open ? 'true' : undefined}
        aria-label={`Fixed payment detail: ${r.description}`}
        position="absolute"
        bg="var(--pb-surface)"
        boxShadow="var(--pb-shadow-lift)"
        overflowY="auto"
        left={{ base: 0, sm: 'auto' }}
        right={0}
        bottom={0}
        top={{ base: 'auto', sm: 0 }}
        w={{ base: '100%', sm: 'min(460px, 92vw)' }}
        maxH={{ base: '90vh', sm: '100%' }}
        borderTopRadius={{ base: '22px', sm: 0 }}
        transform={{
          base: open ? 'translateY(0)' : 'translateY(101%)',
          sm: open ? 'translateX(0)' : 'translateX(101%)',
        }}
        transition="transform 0.32s cubic-bezier(.2,.7,.2,1)"
      >
        {/* Mobile handle */}
        <Flex justify="center" pt="0.6rem" display={{ base: 'flex', sm: 'none' }}>
          <Box w="40px" h="4px" borderRadius="999px" bg="var(--pb-hair-2)" />
        </Flex>

        {/* Header */}
        <Flex
          align="flex-start"
          gap=".75rem"
          px="clamp(1.1rem,4vw,1.5rem)"
          py="1.1rem"
          borderBottom="1px solid var(--pb-hair)"
        >
          <Box
            w="44px"
            h="44px"
            borderRadius="12px"
            display="grid"
            placeItems="center"
            bg={accentTint}
            color={amountColor}
            border="1px solid var(--pb-hair)"
            flexShrink={0}
          >
            <Icon as={typeIcon} boxSize="21px" weight="duotone" />
          </Box>
          <Box flex={1} minW={0}>
            <Text fontFamily="var(--pb-serif)" fontSize="1.2rem" fontWeight={500} color="var(--pb-ink)" noOfLines={2}>
              {r.description}
            </Text>
            <Text fontFamily="var(--pb-mono)" fontSize="10.5px" color="var(--pb-ink-faint)" textTransform="uppercase" letterSpacing="0.06em">
              {r.category}
            </Text>
          </Box>
          <VStack spacing="0.4rem" align="flex-end">
            <IconButton
              ref={closeRef}
              aria-label="Close fixed payment detail"
              icon={<Icon as={X} boxSize="18px" />}
              size="sm"
              variant="ghost"
              borderRadius="999px"
              color="var(--pb-ink-soft)"
              _hover={{ bg: 'var(--pb-surface-2)' }}
              onClick={onClose}
            />
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="1.5rem"
              fontWeight={500}
              color={amountColor}
              style={{ fontVariantNumeric: 'tabular-nums' }}
              whiteSpace="nowrap"
            >
              {isIncome ? '+' : '−'}{money(r.amount)}
            </Text>
          </VStack>
        </Flex>

        {/* Body */}
        <Box px="clamp(1.1rem,4vw,1.5rem)" py="1.1rem">
          {/* Status */}
          <HStack
            justify="space-between"
            align="center"
            px=".9rem"
            py=".7rem"
            borderRadius="14px"
            bg={r.active ? 'var(--pb-tint-green)' : 'var(--pb-surface-2)'}
            color={r.active ? 'var(--pb-forest-2)' : 'var(--pb-ink-soft)'}
          >
            <Text fontSize=".9rem" fontWeight={600}>
              {r.active ? 'Active fixed rule' : 'Cancelled'}
            </Text>
            <Text fontSize=".85rem" color="var(--pb-ink-soft)">
              {isIncome ? 'Income' : 'Expense'} · Monthly
            </Text>
          </HStack>

          {isEditing ? (
            <VStack align="stretch" spacing={3} mt="1.1rem">
              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                <FormControl>
                  <FormLabel fontSize="2xs" color="var(--pb-ink-soft)" fontWeight={700}>Amount</FormLabel>
                  <Input value={draftAmount} onChange={(e) => setDraftAmount(e.target.value)} type="number" min={0} step="0.01" size="sm" fontWeight={700} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="2xs" color="var(--pb-ink-soft)" fontWeight={700}>Start date</FormLabel>
                  <Input value={draftStartDate} onChange={(e) => setDraftStartDate(e.target.value)} type="date" size="sm" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="2xs" color="var(--pb-ink-soft)" fontWeight={700}>Payment day</FormLabel>
                  <Input value={draftDayOfMonth} onChange={(e) => setDraftDayOfMonth(e.target.value)} type="number" min={1} max={31} step={1} size="sm" />
                </FormControl>
              </SimpleGrid>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                <FormControl>
                  <FormLabel fontSize="2xs" color="var(--pb-ink-soft)" fontWeight={700}>Account</FormLabel>
                  <Select
                    size="sm"
                    value={draftAccountId ?? ''}
                    onChange={(e) => setDraftAccountId(e.target.value ? Number(e.target.value) : null)}
                    placeholder="Select account"
                  >
                    {accounts.filter((a) => a.active).map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="2xs" color="var(--pb-ink-soft)" fontWeight={700}>Payment method</FormLabel>
                  <Select
                    size="sm"
                    value={draftPaymentMethodId ?? ''}
                    onChange={(e) => setDraftPaymentMethodId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">No payment method</option>
                    {paymentMethods.filter((m) => m.active).map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel fontSize="2xs" color="var(--pb-ink-soft)" fontWeight={700}>
                  Apply changes from
                </FormLabel>
                <Select
                  size="sm"
                  value={draftApplyFrom}
                  onChange={(e) => setDraftApplyFrom(e.target.value as RecurringUpdateScope)}
                >
                  <option value="CURRENT_MONTH">This month and future months</option>
                  <option value="NEXT_MONTH">Next month onwards</option>
                </Select>
                <Text mt={1} fontSize="2xs" color="var(--pb-ink-faint)">
                  Previous months always stay unchanged. Reconciled payments can only be changed
                  from next month.
                </Text>
              </FormControl>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="teal"
                  onClick={handleSaveAmount}
                  isLoading={isSavingAmount}
                  isDisabled={!draftAccountId}
                  leftIcon={<Icon as={Check} boxSize={3.5} />}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  color="var(--pb-ink-soft)"
                  onClick={() => {
                    resetDrafts()
                    setIsEditing(false)
                  }}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          ) : (
            <>
              {/* Detail rows */}
              <Box mt="1.1rem" borderTop="1px solid var(--pb-hair)">
                <DetailRow k="Monthly amount" v={money(r.amount)} />
                <DetailRow k="Payment day" v={`Day ${r.dayOfMonth}`} />
                <DetailRow k="Next payment" v={formatDate(r.nextRunDate)} />
                <DetailRow k="Start date" v={formatDate(r.startDate)} />
                <DetailRow k="Account" v={r.accountName ?? 'Not linked'} />
                <DetailRow k="Card" v={r.paymentMethodName ?? 'No card linked'} />
              </Box>

              {/* Actions */}
              {r.active && (
                <HStack spacing="0.6rem" mt="1.1rem">
                  <Button
                    flex={1}
                    h="42px"
                    borderRadius="12px"
                    fontSize="sm"
                    fontWeight={600}
                    leftIcon={<Icon as={Pencil} boxSize={4} />}
                    bg="var(--pb-surface-2)"
                    color="var(--pb-ink)"
                    border="1px solid var(--pb-hair)"
                    _hover={{ bg: 'var(--pb-surface-3)' }}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    h="42px"
                    px={4}
                    borderRadius="12px"
                    fontSize="sm"
                    fontWeight={600}
                    leftIcon={<Icon as={Trash2} boxSize={4} />}
                    bg="var(--pb-tint-coral)"
                    color="var(--pb-coral)"
                    border="1px solid var(--pb-hair)"
                    _hover={{ bg: 'var(--pb-tint-coral)', borderColor: 'var(--pb-coral)' }}
                    onClick={deleteDisclosure.onOpen}
                  >
                    Cancel rule
                  </Button>
                </HStack>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Cancel confirmation */}
      <AlertDialog
        isOpen={deleteDisclosure.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteDisclosure.onClose}
        isCentered
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(8px)">
          <AlertDialogContent bg={dialogBg} borderRadius="xl" maxW="440px" mx={4}>
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
                  Cancel fixed payment
                </Text>
                <Text fontSize="xs" color={captionColor}>
                  Existing transactions will stay in your history.
                </Text>
              </VStack>
            </AlertDialogHeader>

            <AlertDialogBody px={6} pb={4}>
              <Text fontSize="sm" color={captionColor}>
                Future payments for <Text as="span" fontWeight={700} color={titleColor}>{r.description}</Text>{' '}
                will stop being generated.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter px={6} py={4} borderTop="1px solid" borderColor={dividerColor} gap={2}>
              <Button ref={cancelRef} onClick={deleteDisclosure.onClose} variant="ghost" fontSize="sm" color={captionColor}>
                Keep active
              </Button>
              <Button colorScheme="red" onClick={handleCancel} isLoading={isCancelling} fontSize="sm">
                Cancel payment
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>,
    document.body,
  )
}
