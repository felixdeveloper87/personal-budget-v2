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
  SimpleGrid,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { AlertTriangle, Calendar, CheckCircle2, ChevronDown, ChevronUp, CreditCard, Pencil, Trash2 } from '../ui/icons'
import { InstallmentPlan } from '../../types'
import { deleteInstallmentPlan, updateInstallmentPlan } from '../../api'
import { ToastService } from '../../services/toast'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingPlan, setIsSavingPlan] = useState(false)
  const [draftInstallmentValue, setDraftInstallmentValue] = useState(String(plan.installmentValue))
  const [draftTotalAmount, setDraftTotalAmount] = useState(String(plan.totalAmount))
  const [draftStartDate, setDraftStartDate] = useState(getPlanStartDate(plan))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const editDisclosure = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const isPast = variant === 'past'

  // ---- All useColorModeValue calls resolved once at the top ----
  const cardBg = useColorModeValue('#ffffff', 'whiteAlpha.50')
  const cardBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')

  const accentBgActive = useColorModeValue('teal.50', 'rgba(20,184,166,0.14)')
  const accentFgActive = useColorModeValue('teal.700', 'teal.300')
  const accentBgPast = useColorModeValue('gray.100', 'whiteAlpha.100')
  const accentFgPast = useColorModeValue('gray.600', 'gray.400')

  const accentBg = isPast ? accentBgPast : accentBgActive
  const accentFg = isPast ? accentFgPast : accentFgActive
  const valueColor = isPast ? titleColor : accentFgActive

  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const collapseBg = useColorModeValue('gray.50', 'whiteAlpha.50')

  const completedBadgeBg = useColorModeValue('rgba(16,185,129,0.10)', 'rgba(16,185,129,0.16)')
  const completedBadgeFg = useColorModeValue('green.700', 'green.300')

  const rowTokens: InstallmentRowTokens = {
    paidBg: useColorModeValue('rgba(16,185,129,0.08)', 'rgba(16,185,129,0.14)'),
    paidBorder: useColorModeValue('rgba(16,185,129,0.25)', 'rgba(16,185,129,0.35)'),
    paidColor: useColorModeValue('green.700', 'green.300'),
    pendingBg: useColorModeValue('gray.50', 'whiteAlpha.50'),
    pendingBorder: useColorModeValue('blackAlpha.100', 'whiteAlpha.100'),
    pendingColor: useColorModeValue('gray.600', 'gray.400'),
    metaColor: useColorModeValue('gray.500', 'gray.500'),
    textColor: useColorModeValue('gray.900', 'gray.100'),
  }

  const cardHoverBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const deleteHoverBg = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')

  // Dialog tokens
  const dialogBg = useColorModeValue('#ffffff', '#0a0a0a')
  const warningChipBg = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')
  const warningChipFg = useColorModeValue('red.600', 'red.300')
  const amountPanelBg = useColorModeValue(
    'linear-gradient(135deg, rgba(20,184,166,0.10), rgba(37,99,235,0.08))',
    'linear-gradient(135deg, rgba(45,212,191,0.16), rgba(96,165,250,0.10))',
  )
  const activeStripe = useColorModeValue(
    'linear-gradient(180deg, #14b8a6, #2563eb)',
    'linear-gradient(180deg, #2dd4bf, #60a5fa)',
  )
  const metaBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const metaBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  useEffect(() => {
    setDraftInstallmentValue(String(plan.installmentValue))
    setDraftTotalAmount(String(plan.totalAmount))
    setDraftStartDate(getPlanStartDate(plan))
  }, [plan])

  const firstTransaction = plan.transactions[0]

  const paidCount = useMemo(() => {
    const now = new Date()
    return plan.transactions.filter((t) => new Date(t.date) < now).length
  }, [plan.transactions])

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
    if (nextTotal <= 0 || Number.isNaN(nextTotal) || nextValue <= 0 || Number.isNaN(nextValue) || !draftStartDate) {
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
        transition="border-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease"
        _hover={{
          borderColor: cardHoverBorder,
          boxShadow: '0 8px 20px -10px rgba(0,0,0,0.18)',
          transform: 'translateY(-1px)',
        }}
      >
        {!isPast && <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={activeStripe} />}
        <CardBody
          p={{ base: 3, md: 5 }}
          pl={!isPast ? { base: 4.5, md: 6 } : { base: 3, md: 5 }}
        >
          <VStack align="stretch" spacing={{ base: 2.5, md: 4 }}>
            <HStack justify="space-between" align="flex-start">
              <HStack spacing={{ base: 2, md: 3 }} minW={0} flex={1}>
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
                  <Icon as={CreditCard} boxSize={{ base: 3.5, md: 4 }} weight="duotone" />
                </Box>
                <VStack align="flex-start" spacing={0} minW={0}>
                  <Text
                    fontWeight={700}
                    fontSize={{ base: 'sm', md: 'md' }}
                    color={titleColor}
                    lineHeight="1.2"
                    noOfLines={1}
                  >
                    {firstTransaction?.description?.replace(/ \(Parcela.*\)/, '') || 'Installment plan'}
                  </Text>
                  <Text fontSize="xs" color={captionColor} noOfLines={1}>
                    {firstTransaction?.category}
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={1}>
                <Tooltip label="Edit installment plan">
                  <IconButton
                    aria-label="Edit installment plan"
                    icon={<Icon as={Pencil} boxSize={3.5} />}
                    size="sm"
                    variant="ghost"
                    color={captionColor}
                    onClick={editDisclosure.onOpen}
                  />
                </Tooltip>
                <IconButton
                  aria-label="Delete installment plan"
                  icon={<Icon as={Trash2} boxSize={4} />}
                  size="sm"
                  variant="ghost"
                  color={captionColor}
                  _hover={{ bg: deleteHoverBg, color: 'red.500' }}
                  onClick={onOpen}
                  transition="background-color 0.15s ease, color 0.15s ease"
                />
              </HStack>
            </HStack>

            <Box bg={amountPanelBg} borderRadius="xl" p={{ base: 3, md: 4 }} border="1px solid" borderColor={metaBorder}>
            <HStack justify="space-between" align="flex-end">
              <VStack align="flex-start" spacing={0}>
                <Text fontSize={{ base: '2xs', md: 'xs' }} color={captionColor} fontWeight={500}>
                  Per installment
                </Text>
                <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight={700} color={valueColor} lineHeight="1.1">
                  £{plan.installmentValue.toFixed(2)}
                </Text>
              </VStack>
              <VStack align="flex-end" spacing={0}>
                <Text fontSize={{ base: '2xs', md: 'xs' }} color={captionColor} fontWeight={500}>
                  Total
                </Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight={600} color={titleColor} lineHeight="1.1">
                  £{plan.totalAmount.toFixed(2)}
                </Text>
              </VStack>
            </HStack>
            </Box>

            <SimpleGrid columns={2} spacing={{ base: 1.5, md: 2 }}>
              <MetaTile
                label="Installments"
                value={`${plan.totalInstallments} months`}
                bg={metaBg}
                borderColor={metaBorder}
                titleColor={titleColor}
                captionColor={captionColor}
              />
              <MetaTile
                label={isPast ? 'Status' : 'Progress'}
                value={isPast ? 'Completed' : `${progressPct}% paid`}
                bg={metaBg}
                borderColor={metaBorder}
                titleColor={titleColor}
                captionColor={captionColor}
              />
            </SimpleGrid>

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
                  <Text fontSize="xs" fontWeight={600} color={valueColor}>
                    {progressPct}%
                  </Text>
                </HStack>
                <Box h="5px" w="full" bg={dividerColor} borderRadius="full" overflow="hidden">
                  <Box
                    h="full"
                    w={`${progressPct}%`}
                    bg="linear-gradient(90deg, #14b8a6 0%, #2563eb 55%, #0d9488 100%)"
                    borderRadius="full"
                    transition="width 0.4s ease"
                  />
                </Box>
              </Box>
            )}

            <Button
              size="sm"
              variant="ghost"
              w="full"
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
                {plan.transactions.map((transaction) => {
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
            <Button colorScheme="teal" fontSize="sm" onClick={handleSavePlan} isLoading={isSavingPlan}>
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
                color="white"
                bg="linear-gradient(135deg, #f43f5e 0%, #dc2626 50%, #b91c1c 100%)"
                bgSize="200% 100%"
                bgPosition="0% 50%"
                boxShadow="0 8px 24px -10px rgba(244, 63, 94, 0.55)"
                _hover={{
                  bgPosition: '100% 50%',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 12px 30px -10px rgba(244, 63, 94, 0.65)',
                }}
                _active={{ transform: 'translateY(0)' }}
                transition="background-position 0.3s ease, transform 0.15s ease, box-shadow 0.2s ease"
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

interface MetaTileProps {
  label: string
  value: string
  bg: string
  borderColor: string
  titleColor: string
  captionColor: string
}

function MetaTile({
  label,
  value,
  bg,
  borderColor,
  titleColor,
  captionColor,
}: MetaTileProps) {
  return (
    <Box bg={bg} border="1px solid" borderColor={borderColor} borderRadius="lg" p={{ base: 2, md: 3 }}>
      <Text fontSize="2xs" color={captionColor} fontWeight={700} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize={{ base: '2xs', md: 'xs' }} color={titleColor} fontWeight={800} mt={0.5} noOfLines={1}>
        {value}
      </Text>
    </Box>
  )
}
