import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Collapse,
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
  Tooltip,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { AlertTriangle, Calendar, CheckCircle2, ChevronDown, ChevronUp, CreditCard, Pencil, Trash2 } from '../ui/icons'
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

interface InstallmentPlanCardProps {
  plan: InstallmentPlan
  onDeleted: () => void
  /**
   * Visual treatment:
   *  - `active`  → primary blue accent, progress bar, "View installments" CTA.
   *  - `past`    → muted neutral accent, "Completed" badge, no progress bar.
   * Defaults to `active`. Use `past` for plans that have all installments paid.
   */
  variant?: 'active' | 'past'
}

/**
 * True when every installment in the plan has a date in the past — i.e. all
 * payments have been settled and the plan is closed.
 */
export function isInstallmentPlanCompleted(plan: InstallmentPlan): boolean {
  if (plan.transactions.length === 0) return false
  const now = Date.now()
  return plan.transactions.every((t) => new Date(t.date).getTime() < now)
}

function getPlanStartDate(plan: InstallmentPlan): string {
  return plan.transactions
    .slice()
    .sort((a, b) => a.installmentNumber - b.installmentNumber)[0]?.date || new Date().toISOString().slice(0, 10)
}

interface InstallmentRowTokens {
  paidBg: string
  paidBorder: string
  paidColor: string
  pendingBg: string
  pendingBorder: string
  pendingColor: string
  metaColor: string
  textColor: string
}

/**
 * Compact card displaying an installment plan with progress and a collapsible
 * list of all instalments. Confirms destructive delete with an `AlertDialog`.
 */
export default function InstallmentPlanCard({
  plan,
  onDeleted,
  variant = 'active',
}: InstallmentPlanCardProps) {
  const ed = useEd()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingPlan, setIsSavingPlan] = useState(false)
  const [draftInstallmentValue, setDraftInstallmentValue] = useState(String(plan.installmentValue))
  const [draftTotalAmount, setDraftTotalAmount] = useState(String(plan.totalAmount))
  const [draftStartDate, setDraftStartDate] = useState(getPlanStartDate(plan))
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [draftAccountId, setDraftAccountId] = useState<number | null>(plan.accountId ?? null)
  const [draftPaymentMethodId, setDraftPaymentMethodId] = useState<number | null>(plan.paymentMethodId ?? null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const editDisclosure = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const isPast = variant === 'past'

  // ---- All useColorModeValue calls resolved once at the top ----
  const cardBgBase = useColorModeValue('#ffffff', 'whiteAlpha.50')
  const cardBg = ed ? ed.panelRaised : cardBgBase

  const cardBorderBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const cardBorder = ed ? ed.line : cardBorderBase

  const titleColorBase = useColorModeValue('gray.900', 'gray.50')
  const titleColor = ed ? ed.cream : titleColorBase

  const captionColorBase = useColorModeValue('gray.500', 'gray.400')
  const captionColor = ed ? ed.muted : captionColorBase

  const accentBgActiveBase = useColorModeValue('blue.50', 'rgba(37,99,235,0.16)')
  const accentBgActive = ed ? ed.jadeSoft : accentBgActiveBase

  const accentFgActiveBase = useColorModeValue('blue.700', 'blue.300')
  const accentFgActive = ed ? ed.jade : accentFgActiveBase

  const accentBgPastBase = useColorModeValue('gray.100', 'whiteAlpha.100')
  const accentBgPast = ed ? ed.controlBg : accentBgPastBase

  const accentFgPastBase = useColorModeValue('gray.600', 'gray.400')
  const accentFgPast = ed ? ed.muted : accentFgPastBase

  const accentBg = isPast ? accentBgPast : accentBgActive
  const accentFg = isPast ? accentFgPast : accentFgActive
  const valueColor = isPast ? titleColor : accentFgActive

  const dividerColorBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const dividerColor = ed ? ed.line : dividerColorBase

  const collapseBgBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  const collapseBg = ed ? ed.panelRaised : collapseBgBase

  const completedBadgeBgBase = useColorModeValue('rgba(16,185,129,0.10)', 'rgba(16,185,129,0.16)')
  const completedBadgeBg = ed ? ed.jadeSoft : completedBadgeBgBase

  const completedBadgeFgBase = useColorModeValue('green.700', 'green.300')
  const completedBadgeFg = ed ? ed.jade : completedBadgeFgBase

  const rowTokensBasePaidBg = useColorModeValue('rgba(16,185,129,0.08)', 'rgba(16,185,129,0.14)')
  const rowTokensBasePaidBorder = useColorModeValue('rgba(16,185,129,0.25)', 'rgba(16,185,129,0.35)')
  const rowTokensBasePaidColor = useColorModeValue('green.700', 'green.300')
  const rowTokensBasePendingBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const rowTokensBasePendingBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const rowTokensBasePendingColor = useColorModeValue('gray.600', 'gray.400')
  const rowTokensBaseMetaColor = useColorModeValue('gray.500', 'gray.500')
  const rowTokensBaseTextColor = useColorModeValue('gray.900', 'gray.100')

  const rowTokens: InstallmentRowTokens = {
    paidBg: ed ? ed.jadeSoft : rowTokensBasePaidBg,
    paidBorder: ed ? ed.line : rowTokensBasePaidBorder,
    paidColor: ed ? ed.jade : rowTokensBasePaidColor,
    pendingBg: ed ? ed.controlBg : rowTokensBasePendingBg,
    pendingBorder: ed ? ed.line : rowTokensBasePendingBorder,
    pendingColor: ed ? ed.muted : rowTokensBasePendingColor,
    metaColor: ed ? ed.muted : rowTokensBaseMetaColor,
    textColor: ed ? ed.cream : rowTokensBaseTextColor,
  }

  const cardHoverBorderBase = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const cardHoverBorder = ed ? ed.lineStrong : cardHoverBorderBase

  const deleteHoverBg = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')

  // Dialog tokens
  const fallbackDialogBg = useColorModeValue('#ffffff', '#0a0a0a')
  const dialogBg = ed?.solid ?? fallbackDialogBg
  const warningChipBg = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')
  const warningChipFgBase = useColorModeValue('red.600', 'red.300')
  const warningChipFg = ed ? ed.red : warningChipFgBase

  const activeStripeBase = useColorModeValue('blue.600', 'blue.400')
  const activeStripe = ed ? ed.jade : activeStripeBase

  const progressBarBase = useColorModeValue('blue.600', 'blue.400')
  const progressBar = ed ? ed.jade : progressBarBase

  const metaBgBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  const metaBg = ed ? ed.panelRaised : metaBgBase

  const metaBorderBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const metaBorder = ed ? ed.line : metaBorderBase

  useEffect(() => {
    setDraftInstallmentValue(String(plan.installmentValue))
    setDraftTotalAmount(String(plan.totalAmount))
    setDraftStartDate(getPlanStartDate(plan))
    setDraftAccountId(plan.accountId ?? null)
    setDraftPaymentMethodId(plan.paymentMethodId ?? null)
  }, [plan])

  useEffect(() => {
    if (!editDisclosure.isOpen) return
    Promise.all([listAccounts(), listPaymentMethods()])
      .then(([accountItems, methodItems]) => {
        setAccounts(accountItems)
        setPaymentMethods(methodItems)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: 'Could not load account options',
          dedupeKey: `installment-options-load-failed:${plan.id}`,
        })
      })
  }, [editDisclosure.isOpen, plan.id])

  const firstTransaction = plan.transactions[0]

  const paidCount = useMemo(() => {
    const now = new Date()
    return plan.transactions.filter((t) => new Date(t.date) < now).length
  }, [plan.transactions])

  const sortedTransactions = useMemo(
    () =>
      [...plan.transactions].sort(
        (a, b) =>
          a.installmentNumber - b.installmentNumber ||
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [plan.transactions],
  )

  const progressPct = plan.totalInstallments > 0
    ? Math.min(100, Math.round((paidCount / plan.totalInstallments) * 100))
    : 0

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteInstallmentPlan(plan.id)
      ToastService.success({
        title: 'Installment plan deleted',
        description: 'All installments have been removed',
        duration: 2000,
        dedupeKey: `installment-plan-deleted:${plan.id}`,
      })
      onDeleted()
      onClose()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: 'Could not delete installment plan',
        duration: 3000,
        dedupeKey: `installment-plan-delete-failed:${plan.id}`,
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
        dedupeKey: `installment-plan-invalid:${plan.id}`,
      })
      return
    }

    setIsSavingPlan(true)
    try {
      await updateInstallmentPlan(plan.id, {
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
        dedupeKey: `installment-plan-updated:${plan.id}`,
      })
      editDisclosure.onClose()
      onDeleted()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: 'Could not update installment plan',
        duration: 3000,
        dedupeKey: `installment-plan-update-failed:${plan.id}`,
      })
    } finally {
      setIsSavingPlan(false)
    }
  }

  const handleInstallmentValueChange = (value: string) => {
    setDraftInstallmentValue(value)
    const numericValue = Number(value)
    if (numericValue > 0 && !Number.isNaN(numericValue)) {
      setDraftTotalAmount((numericValue * plan.totalInstallments).toFixed(2))
    }
  }

  const handleTotalAmountChange = (value: string) => {
    setDraftTotalAmount(value)
    const numericValue = Number(value)
    if (numericValue > 0 && !Number.isNaN(numericValue) && plan.totalInstallments > 0) {
      setDraftInstallmentValue((numericValue / plan.totalInstallments).toFixed(2))
    }
  }

  return (
    <>
      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        borderRadius="xl"
        boxShadow="0 1px 2px rgba(0,0,0,0.04)"
        overflow="hidden"
        position="relative"
        transition="border-color 0.18s ease, box-shadow 0.18s ease"
        _hover={{
          borderColor: cardHoverBorder,
          boxShadow: '0 3px 10px -6px rgba(0,0,0,0.16)',
        }}
      >
        {!isPast && <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={activeStripe} />}
        <CardBody
          p={{ base: 3, md: 3.5 }}
          pl={!isPast ? { base: 3.5, md: 4 } : { base: 3, md: 3.5 }}
        >
          <VStack align="stretch" spacing={{ base: 2.5, md: 3 }}>
            <HStack justify="space-between" align="center" spacing={2}>
              <HStack spacing={2.5} minW={0} flex={1}>
                <Box
                  w={{ base: 8, md: 9 }}
                  h={{ base: 8, md: 9 }}
                  borderRadius="lg"
                  bg={accentBg}
                  color={accentFg}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon as={CreditCard} boxSize={4} weight="duotone" />
                </Box>
                <VStack align="flex-start" spacing={0} minW={0}>
                  <Text
                    fontWeight={700}
                    fontSize="sm"
                    color={titleColor}
                    lineHeight="1.25"
                    noOfLines={1}
                  >
                    {firstTransaction?.description
                      ? getInstallmentPlanTitle(firstTransaction.description)
                      : 'Installment plan'}
                  </Text>
                  <Text fontSize="xs" color={captionColor} noOfLines={1}>
                    {firstTransaction?.category}{plan.accountName ? ` · ${plan.accountName}` : ' · Account not linked'}
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={0.5} flexShrink={0}>
                <Tooltip label="Edit installment plan">
                  <IconButton
                    aria-label="Edit installment plan"
                    icon={<Icon as={Pencil} boxSize={3.5} />}
                    size="xs"
                    variant="ghost"
                    color={captionColor}
                    onClick={editDisclosure.onOpen}
                  />
                </Tooltip>
                <IconButton
                  aria-label="Delete installment plan"
                  icon={<Icon as={Trash2} boxSize={3.5} />}
                  size="xs"
                  variant="ghost"
                  color={captionColor}
                  _hover={{ bg: deleteHoverBg, color: 'red.500' }}
                  onClick={onOpen}
                  transition="background-color 0.15s ease, color 0.15s ease"
                />
              </HStack>
            </HStack>

            <HStack
              justify="space-between"
              align="center"
              px={3.5}
              py={3}
              bg={metaBg}
              borderRadius="lg"
              border="1px solid"
              borderColor={metaBorder}
            >
              <VStack align="flex-start" spacing={0.5}>
                <Text fontSize="xs" color={captionColor} fontWeight={600} textTransform="uppercase" letterSpacing="0.04em">
                  Per installment
                </Text>
                <Text
                  fontFamily={ed ? ed.fontDisplay : undefined}
                  fontSize={{ base: 'xl', md: '2xl' }}
                  fontWeight={ed ? 400 : 800}
                  color={valueColor}
                  lineHeight="1"
                >
                  £{plan.installmentValue.toFixed(2)}
                </Text>
              </VStack>
              <VStack align="flex-end" spacing={0.5}>
                <Text fontSize="xs" color={captionColor} fontWeight={600} textTransform="uppercase" letterSpacing="0.04em">
                  Total
                </Text>
                <Text
                  fontFamily={ed ? ed.fontDisplay : undefined}
                  fontSize={{ base: 'md', md: 'lg' }}
                  fontWeight={ed ? 400 : 700}
                  color={titleColor}
                  lineHeight="1"
                >
                  £{plan.totalAmount.toFixed(2)}
                </Text>
              </VStack>
            </HStack>

            {isPast ? (
              <HStack justify="space-between" align="center">
                <Badge
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  bg={completedBadgeBg}
                  color={completedBadgeFg}
                  fontSize="2xs"
                  fontWeight={700}
                  textTransform="uppercase"
                  letterSpacing="0.04em"
                  display="inline-flex"
                  alignItems="center"
                  gap={1}
                >
                  <Icon as={CheckCircle2} boxSize={3} strokeWidth={2.5} />
                  Completed
                </Badge>
                <Text fontSize="xs" color={captionColor}>
                  {plan.totalInstallments} of {plan.totalInstallments} paid
                </Text>
              </HStack>
            ) : (
              <Box>
                <HStack justify="space-between" mb={1.5}>
                  <Text fontSize="xs" fontWeight={600} color={captionColor}>
                    {paidCount} of {plan.totalInstallments} paid
                  </Text>
                  <Text fontSize="sm" fontWeight={800} color={valueColor}>
                    {progressPct}%
                  </Text>
                </HStack>
                <Box h="6px" w="full" bg={dividerColor} borderRadius="full" overflow="hidden">
                  <Box
                    h="full"
                    w={`${progressPct}%`}
                    bg={progressBar}
                    borderRadius="full"
                    transition="width 0.4s ease"
                  />
                </Box>
              </Box>
            )}

            <Button
              size="xs"
              variant="ghost"
              w="full"
              h="28px"
              fontSize="xs"
              fontWeight={600}
              color={accentFg}
              rightIcon={<Icon as={isExpanded ? ChevronUp : ChevronDown} boxSize={3.5} />}
              onClick={() => setIsExpanded(!isExpanded)}
              _hover={{ bg: accentBg }}
            >
              {isExpanded
                ? 'Hide installments'
                : isPast
                  ? `View ${plan.totalInstallments} payments`
                  : `View ${plan.totalInstallments} installments`}
            </Button>

            <Collapse in={isExpanded} animateOpacity>
              <VStack
                align="stretch"
                spacing={1.5}
                mt={1}
                p={3}
                bg={collapseBg}
                borderRadius="lg"
                maxH={{ base: '240px', md: '320px' }}
                overflowY="auto"
                border="1px solid"
                borderColor={dividerColor}
              >
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
                      px={3}
                      py={2}
                      bg={isPaid ? rowTokens.paidBg : rowTokens.pendingBg}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={isPaid ? rowTokens.paidBorder : rowTokens.pendingBorder}
                      gap={2}
                      flexWrap="wrap"
                    >
                      <HStack spacing={2} minW={0} flex={1}>
                        <Icon as={Calendar} boxSize={3} color={rowTokens.metaColor} />
                        <VStack align="flex-start" spacing={0} minW={0}>
                          <Text fontSize="xs" fontWeight={600} color={rowTokens.textColor}>
                            {formattedDate}
                          </Text>
                          <Text fontSize="2xs" color={rowTokens.metaColor}>
                            {transaction.installmentNumber}/{plan.totalInstallments}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={2}>
                        <Text fontSize="xs" fontWeight={700} color={rowTokens.textColor}>
                          £{transaction.amount.toFixed(2)}
                        </Text>
                        <Badge
                          fontSize="2xs"
                          fontWeight={600}
                          px={2}
                          py={0.5}
                          borderRadius="full"
                          bg={isPaid ? rowTokens.paidBg : rowTokens.pendingBg}
                          color={isPaid ? rowTokens.paidColor : rowTokens.pendingColor}
                          textTransform="none"
                          letterSpacing="0"
                        >
                          {isPaid ? 'Paid' : 'Pending'}
                        </Badge>
                      </HStack>
                    </HStack>
                  )
                })}
              </VStack>
            </Collapse>
          </VStack>
        </CardBody>
      </Card>

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
                  onChange={(event) => setDraftPaymentMethodId(event.target.value ? Number(event.target.value) : null)}
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
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
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
                All <Text as="span" fontWeight={700} color={titleColor}>{plan.totalInstallments}</Text>{' '}
                installments will be permanently removed.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter
              px={6}
              py={4}
              borderTop="1px solid"
              borderColor={dividerColor}
              gap={2}
            >
              <Button
                ref={cancelRef}
                onClick={onClose}
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
    </>
  )
}
