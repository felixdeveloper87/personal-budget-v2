import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  Calendar,
  CheckCircle2,
  CreditCard,
  Pencil,
  Trash2,
  X,
} from '../ui/icons'
import { FinancialAccount, InstallmentPlan, PaymentMethod } from '../../types'
import {
  deleteInstallmentPlan,
  listAccounts,
  listPaymentMethods,
  updateInstallmentPlan,
} from '../../api'
import { ToastService } from '../../services/toast'
import { getInstallmentPlanTitle } from '../../utils/installments'
import { useEd } from '../../editorial'

interface InstallmentPlanDrawerProps {
  plan: InstallmentPlan | null
  onClose: () => void
  /** Reload the list after the plan is edited or deleted. */
  onChanged: () => void
}

const money = (value: number) => `£${value.toFixed(2)}`

function getPlanStartDate(plan: InstallmentPlan): string {
  return plan.transactions
    .slice()
    .sort((a, b) => a.installmentNumber - b.installmentNumber)[0]?.date || new Date().toISOString().slice(0, 10)
}

function isPlanCompleted(plan: InstallmentPlan): boolean {
  if (plan.transactions.length === 0) return false
  const now = Date.now()
  return plan.transactions.every((t) => new Date(t.date).getTime() < now)
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
 * Right-side detail panel for a single installment plan — mirrors the
 * Transactions page drawer. Opens when a plan row is clicked and hosts the
 * full installment schedule plus edit/delete actions.
 */
export default function InstallmentPlanDrawer({ plan, onClose, onChanged }: InstallmentPlanDrawerProps) {
  const ed = useEd()
  const open = plan != null
  const [displayPlan, setDisplayPlan] = useState<InstallmentPlan | null>(plan)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<Element | null>(null)

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
  const accentBgBase = useColorModeValue('blue.50', 'rgba(37,99,235,0.16)')
  const accentBg = ed ? ed.jadeSoft : accentBgBase
  const accentFgBase = useColorModeValue('blue.700', 'blue.300')
  const accentFg = ed ? ed.jade : accentFgBase
  const dividerColorBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const dividerColor = ed ? ed.line : dividerColorBase
  const fallbackDialogBg = useColorModeValue('#ffffff', '#0a0a0a')
  const dialogBg = ed?.solid ?? fallbackDialogBg
  const warningChipBg = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')
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
          title: 'Could not load account options',
          dedupeKey: `installment-options-load-failed:${displayPlan.id}`,
        })
      })
  }, [editDisclosure.isOpen, displayPlan])

  // Escape to close + focus management.
  useEffect(() => {
    if (!open) return
    lastFocused.current = document.activeElement
    const t = window.setTimeout(() => closeRef.current?.focus(), 40)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !editDisclosure.isOpen && !deleteDisclosure.isOpen) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      if (lastFocused.current instanceof HTMLElement) lastFocused.current.focus()
    }
  }, [open, onClose, editDisclosure.isOpen, deleteDisclosure.isOpen])

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
  const isPast = isPlanCompleted(p)
  const firstTransaction = p.transactions[0]
  const title = firstTransaction?.description
    ? getInstallmentPlanTitle(firstTransaction.description)
    : 'Installment plan'
  const progressPct = p.totalInstallments > 0
    ? Math.min(100, Math.round((paidCount / p.totalInstallments) * 100))
    : 0

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteInstallmentPlan(p.id)
      ToastService.success({
        title: 'Installment plan deleted',
        description: 'All installments have been removed',
        duration: 2000,
        dedupeKey: `installment-plan-deleted:${p.id}`,
      })
      deleteDisclosure.onClose()
      onChanged()
      onClose()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: 'Could not delete installment plan',
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
        title: 'Enter a valid total, installment amount and date',
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
        title: 'Installment plan updated',
        description: 'Installments were recalculated.',
        duration: 2500,
        dedupeKey: `installment-plan-updated:${p.id}`,
      })
      editDisclosure.onClose()
      onChanged()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: 'Could not update installment plan',
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
        aria-label={`Installment plan detail: ${title}`}
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
            bg={isPast ? 'var(--pb-surface-2)' : 'var(--pb-tint-green)'}
            color={isPast ? 'var(--pb-ink-faint)' : 'var(--pb-forest-2)'}
            border="1px solid var(--pb-hair)"
            flexShrink={0}
          >
            <Icon as={CreditCard} boxSize="21px" weight="duotone" />
          </Box>
          <Box flex={1} minW={0}>
            <Text fontFamily="var(--pb-serif)" fontSize="1.2rem" fontWeight={500} color="var(--pb-ink)" noOfLines={2}>
              {title}
            </Text>
            <Text fontFamily="var(--pb-mono)" fontSize="10.5px" color="var(--pb-ink-faint)" textTransform="uppercase" letterSpacing="0.06em">
              {firstTransaction?.category ?? 'Installment plan'}
            </Text>
          </Box>
          <VStack spacing="0.4rem" align="flex-end">
            <IconButton
              ref={closeRef}
              aria-label="Close installment detail"
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
              color="var(--pb-ink)"
              style={{ fontVariantNumeric: 'tabular-nums' }}
              whiteSpace="nowrap"
            >
              {money(p.installmentValue)}
            </Text>
          </VStack>
        </Flex>

        {/* Body */}
        <Box px="clamp(1.1rem,4vw,1.5rem)" py="1.1rem">
          {/* Progress / status */}
          {isPast ? (
            <HStack
              justify="space-between"
              align="center"
              px=".9rem"
              py=".75rem"
              borderRadius="14px"
              bg="var(--pb-tint-income)"
              color="var(--pb-income)"
            >
              <HStack spacing="0.5rem">
                <Icon as={CheckCircle2} boxSize="16px" />
                <Text fontSize=".9rem" fontWeight={600}>Completed plan</Text>
              </HStack>
              <Text fontSize=".9rem">{p.totalInstallments} of {p.totalInstallments} paid</Text>
            </HStack>
          ) : (
            <Box>
              <Flex justify="space-between" align="baseline" mb="0.5rem">
                <Text fontSize=".85rem" fontWeight={600} color="var(--pb-ink-soft)">
                  {paidCount} of {p.totalInstallments} paid
                </Text>
                <Text fontSize="1rem" fontWeight={700} color="var(--pb-forest-2)">{progressPct}%</Text>
              </Flex>
              <Box h="6px" w="full" bg="var(--pb-surface-3)" borderRadius="full" overflow="hidden">
                <Box h="full" w={`${progressPct}%`} bg="var(--pb-forest-2)" borderRadius="full" transition="width 0.4s ease" />
              </Box>
            </Box>
          )}

          {/* Detail rows */}
          <Box mt="1.1rem" borderTop="1px solid var(--pb-hair)">
            <DetailRow k="Per installment" v={money(p.installmentValue)} />
            <DetailRow k="Total" v={money(p.totalAmount)} />
            <DetailRow k="Installments" v={`${p.totalInstallments}`} />
            <DetailRow k="Card" v={p.paymentMethodName ?? 'No card linked'} />
            <DetailRow k="Account" v={p.accountName ?? 'Not linked'} />
          </Box>

          {/* Action buttons */}
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
              onClick={editDisclosure.onOpen}
            >
              Edit plan
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
              Delete
            </Button>
          </HStack>

          {/* Installment schedule */}
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10px"
            letterSpacing="0.16em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
            mt="1.4rem"
            mb="0.6rem"
          >
            Schedule
          </Text>
          <VStack align="stretch" spacing="0.5rem">
            {sortedTransactions.map((transaction) => {
              const isPaid = new Date(transaction.date) < new Date()
              const formattedDate = new Date(transaction.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
              return (
                <HStack
                  key={transaction.id}
                  justify="space-between"
                  align="center"
                  px=".85rem"
                  py=".6rem"
                  borderRadius="12px"
                  bg={isPaid ? 'var(--pb-tint-income)' : 'var(--pb-surface-2)'}
                  border="1px solid var(--pb-hair)"
                  gap={2}
                >
                  <HStack spacing="0.6rem" minW={0}>
                    <Icon as={Calendar} boxSize="14px" color="var(--pb-ink-faint)" flexShrink={0} />
                    <VStack align="flex-start" spacing={0} minW={0}>
                      <Text fontSize=".88rem" fontWeight={600} color="var(--pb-ink)">{formattedDate}</Text>
                      <Text fontSize="10px" color="var(--pb-ink-faint)">
                        {transaction.installmentNumber}/{p.totalInstallments}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack spacing="0.55rem" flexShrink={0}>
                    <Text fontSize=".9rem" fontWeight={700} color="var(--pb-ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {money(transaction.amount)}
                    </Text>
                    <Text
                      fontSize="10px"
                      fontWeight={600}
                      px="0.5rem"
                      py="0.15rem"
                      borderRadius="999px"
                      bg={isPaid ? 'var(--pb-tint-income)' : 'var(--pb-surface-3)'}
                      color={isPaid ? 'var(--pb-income)' : 'var(--pb-ink-soft)'}
                    >
                      {isPaid ? 'Paid' : 'Pending'}
                    </Text>
                  </HStack>
                </HStack>
              )
            })}
          </VStack>
        </Box>
      </Box>

      {/* Edit plan modal */}
      <Modal isOpen={editDisclosure.isOpen} onClose={editDisclosure.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
        <ModalContent bg={dialogBg} borderRadius="xl" mx={4}>
          <ModalHeader px={6} pt={5} pb={3}>
            <HStack spacing={3}>
              <Box
                w={9}
                h={9}
                borderRadius="lg"
                bg={accentBg}
                color={accentFg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={Pencil} boxSize={4} />
              </Box>
              <VStack align="flex-start" spacing={0}>
                <Text fontWeight={700} fontSize="md" color={titleColor}>
                  Edit installment plan
                </Text>
                <Text fontSize="xs" color={captionColor}>
                  Recalculate all installments.
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalBody px={6} pb={4}>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel fontSize="xs" color={captionColor} fontWeight={700}>
                  Account
                </FormLabel>
                <Select
                  size="sm"
                  value={draftAccountId ?? ''}
                  onChange={(event) => setDraftAccountId(event.target.value ? Number(event.target.value) : null)}
                  placeholder="Select account"
                >
                  {accounts.filter((account) => account.active).map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" color={captionColor} fontWeight={700}>
                  Payment method
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
                  <option value="">No payment method</option>
                  {paymentMethods.filter((method) => method.active).map((method) => (
                    <option key={method.id} value={method.id}>{method.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" color={captionColor} fontWeight={700}>
                  First installment date
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
                  Purchase total
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
                  Amount per installment
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
            <Button variant="ghost" fontSize="sm" color={captionColor} onClick={editDisclosure.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" fontSize="sm" onClick={handleSavePlan} isLoading={isSavingPlan} isDisabled={!draftAccountId}>
              Save changes
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
          >
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
                  Delete installment plan
                </Text>
                <Text fontSize="xs" color={captionColor}>
                  This cannot be undone.
                </Text>
              </VStack>
            </AlertDialogHeader>

            <AlertDialogBody px={6} pb={4}>
              <Text fontSize="sm" color={captionColor}>
                All <Text as="span" fontWeight={700} color={titleColor}>{p.totalInstallments}</Text>{' '}
                installments will be permanently removed.
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
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                isLoading={isDeleting}
                loadingText="Deleting…"
                fontSize="sm"
                fontWeight={700}
                colorScheme="red"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>,
    document.body,
  )
}
