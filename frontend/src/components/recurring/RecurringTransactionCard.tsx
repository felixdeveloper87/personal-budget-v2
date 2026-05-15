import React, { useEffect, useState } from 'react'
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
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  SimpleGrid,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { AlertTriangle, CalendarClock, Check, Pencil, RefreshCw, Trash2, TrendingUp, TrendingDown } from '../ui/icons'
import {
  cancelRecurringTransaction,
  generateDueRecurringTransactions,
  updateRecurringTransaction,
} from '../../api'
import { RecurringTransaction } from '../../types'
import { ToastService } from '../../services/toast'

interface RecurringTransactionCardProps {
  recurringTransaction: RecurringTransaction
  onChanged: () => void | Promise<void>
}

function formatDate(value?: string) {
  if (!value) return 'Not scheduled'
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function RecurringTransactionCard({
  recurringTransaction,
  onChanged,
}: RecurringTransactionCardProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSavingAmount, setIsSavingAmount] = useState(false)
  const [isEditingAmount, setIsEditingAmount] = useState(false)
  const [draftAmount, setDraftAmount] = useState(String(recurringTransaction.amount))
  const [draftStartDate, setDraftStartDate] = useState(recurringTransaction.startDate)
  const [draftDayOfMonth, setDraftDayOfMonth] = useState(String(recurringTransaction.dayOfMonth))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const cardBg = useColorModeValue('#ffffff', 'whiteAlpha.50')
  const cardBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const cardHoverBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const accentBg = useColorModeValue('teal.50', 'rgba(20,184,166,0.14)')
  const accentFg = useColorModeValue('teal.700', 'teal.300')
  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const deleteHoverBg = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')
  const dialogBg = useColorModeValue('#ffffff', '#0a0a0a')
  const warningChipBg = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')
  const warningChipFg = useColorModeValue('red.600', 'red.300')
  const metaBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const metaBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const actionBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const activeStripe = useColorModeValue('linear-gradient(180deg, #14b8a6, #2563eb)', 'linear-gradient(180deg, #2dd4bf, #60a5fa)')
  const amountPanelBg = useColorModeValue(
    'linear-gradient(135deg, rgba(20,184,166,0.10), rgba(37,99,235,0.08))',
    'linear-gradient(135deg, rgba(45,212,191,0.16), rgba(96,165,250,0.10))',
  )
  const typeIcon = recurringTransaction.type === 'INCOME' ? TrendingUp : TrendingDown

  useEffect(() => {
    setDraftAmount(String(recurringTransaction.amount))
    setDraftStartDate(recurringTransaction.startDate)
    setDraftDayOfMonth(String(recurringTransaction.dayOfMonth))
  }, [recurringTransaction])

  const handleGenerateDue = async () => {
    setIsGenerating(true)
    try {
      await generateDueRecurringTransactions(recurringTransaction.id)
      ToastService.success({
        title: 'Fixed payment synced',
        duration: 2000,
        dedupeKey: `recurring-synced:${recurringTransaction.id}`,
      })
      await Promise.resolve(onChanged())
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: 'Could not sync fixed payment',
        duration: 3000,
        dedupeKey: `recurring-sync-failed:${recurringTransaction.id}`,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await cancelRecurringTransaction(recurringTransaction.id)
      ToastService.success({
        title: 'Fixed payment cancelled',
        duration: 2000,
        dedupeKey: `recurring-cancelled:${recurringTransaction.id}`,
      })
      await Promise.resolve(onChanged())
      onClose()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: 'Could not cancel fixed payment',
        duration: 3000,
        dedupeKey: `recurring-cancel-failed:${recurringTransaction.id}`,
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
      Number.isNaN(nextDayOfMonth)
    ) {
      ToastService.warning({
        title: 'Enter a valid amount and date',
        duration: 2500,
        dedupeKey: `recurring-invalid-amount:${recurringTransaction.id}`,
      })
      return
    }

    setIsSavingAmount(true)
    try {
      await updateRecurringTransaction(recurringTransaction.id, {
        amount: nextAmount,
        startDate: draftStartDate,
        dayOfMonth: nextDayOfMonth,
      })
      ToastService.success({
        title: 'Fixed payment updated',
        description: 'Future transactions were recalculated.',
        duration: 2500,
        dedupeKey: `recurring-amount-updated:${recurringTransaction.id}`,
      })
      setIsEditingAmount(false)
      await Promise.resolve(onChanged())
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: 'Could not update amount',
        duration: 3000,
        dedupeKey: `recurring-amount-update-failed:${recurringTransaction.id}`,
      })
    } finally {
      setIsSavingAmount(false)
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
        {recurringTransaction.active && (
          <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={activeStripe} />
        )}
        <CardBody
          p={{ base: 3, md: 5 }}
          pl={recurringTransaction.active ? { base: 4.5, md: 6 } : { base: 3, md: 5 }}
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
                  <Icon as={typeIcon} boxSize={{ base: 3.5, md: 4 }} weight="duotone" />
                </Box>
                <VStack align="flex-start" spacing={0} minW={0}>
                  <Text fontWeight={700} fontSize={{ base: 'sm', md: 'md' }} color={titleColor} noOfLines={1}>
                    {recurringTransaction.description}
                  </Text>
                  <Text fontSize="xs" color={captionColor} noOfLines={1} fontWeight={600}>
                    {recurringTransaction.category}
                  </Text>
                </VStack>
              </HStack>
              <Badge
                borderRadius="full"
                px={2.5}
                py={1}
                colorScheme={recurringTransaction.active ? 'teal' : 'gray'}
                textTransform="none"
              >
                {recurringTransaction.active ? 'Active' : 'Cancelled'}
              </Badge>
            </HStack>

            <Box bg={amountPanelBg} borderRadius="xl" p={{ base: 3, md: 4 }} border="1px solid" borderColor={metaBorder}>
              <HStack justify="space-between" align="flex-start" mb={isEditingAmount ? 2 : 0}>
                <Text fontSize="xs" color={captionColor} fontWeight={500}>
                  Fixed monthly amount
                </Text>
                {!isEditingAmount && recurringTransaction.active && (
                  <Tooltip label="Edit fixed payment">
                    <IconButton
                      aria-label="Edit fixed payment"
                      icon={<Icon as={Pencil} boxSize={3.5} />}
                      size="xs"
                      variant="ghost"
                      color={captionColor}
                      onClick={() => setIsEditingAmount(true)}
                    />
                  </Tooltip>
                )}
              </HStack>

              <VStack align="stretch" spacing={2}>
                {isEditingAmount ? (
                  <VStack align="stretch" spacing={3}>
                    <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="2xs" color={captionColor} fontWeight={700}>
                          Amount
                        </FormLabel>
                        <Input
                          value={draftAmount}
                          onChange={(event) => setDraftAmount(event.target.value)}
                          type="number"
                          min={0}
                          step="0.01"
                          size="sm"
                          fontWeight={700}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="2xs" color={captionColor} fontWeight={700}>
                          Start date
                        </FormLabel>
                        <Input
                          value={draftStartDate}
                          onChange={(event) => setDraftStartDate(event.target.value)}
                          type="date"
                          size="sm"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="2xs" color={captionColor} fontWeight={700}>
                          Payment day
                        </FormLabel>
                        <Input
                          value={draftDayOfMonth}
                          onChange={(event) => setDraftDayOfMonth(event.target.value)}
                          type="number"
                          min={1}
                          max={31}
                          step={1}
                          size="sm"
                        />
                      </FormControl>
                    </SimpleGrid>
                    <HStack spacing={2} flexWrap="wrap">
                      <Button
                        size="sm"
                        colorScheme="teal"
                        onClick={handleSaveAmount}
                        isLoading={isSavingAmount}
                        leftIcon={<Icon as={Check} boxSize={3.5} />}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDraftAmount(String(recurringTransaction.amount))
                          setDraftStartDate(recurringTransaction.startDate)
                          setDraftDayOfMonth(String(recurringTransaction.dayOfMonth))
                          setIsEditingAmount(false)
                        }}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  </VStack>
                ) : (
                  <HStack spacing={2}>
                    <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={800} color={accentFg} lineHeight="1.05">
                      £{recurringTransaction.amount.toFixed(2)}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            <SimpleGrid columns={{ base: 2, md: 2 }} spacing={{ base: 1.5, md: 2 }}>
              <MetaTile
                label="Payment day"
                value={`Day ${recurringTransaction.dayOfMonth}`}
                bg={metaBg}
                borderColor={metaBorder}
                titleColor={titleColor}
                captionColor={captionColor}
              />
              <MetaTile
                label="Next payment"
                value={formatDate(recurringTransaction.nextRunDate)}
                bg={metaBg}
                borderColor={metaBorder}
                titleColor={titleColor}
                captionColor={captionColor}
              />
            </SimpleGrid>

            {recurringTransaction.active && (
              <HStack
                spacing={2}
                pt={3}
                borderTop="1px solid"
                borderColor={dividerColor}
                bg={actionBg}
                mx={{ base: -3, md: -5 }}
                mb={{ base: -3, md: -5 }}
                px={{ base: 3, md: 5 }}
                pb={{ base: 3, md: 5 }}
              >
                <Button
                  size="sm"
                  flex={1}
                  variant="ghost"
                  fontSize="xs"
                  fontWeight={700}
                  color={accentFg}
                  leftIcon={<Icon as={RefreshCw} boxSize={3.5} />}
                  onClick={handleGenerateDue}
                  isLoading={isGenerating}
                  loadingText="Checking..."
                  _hover={{ bg: accentBg }}
                >
                  Sync month
                </Button>
                <Tooltip label="Cancel future transactions">
                  <IconButton
                    aria-label="Cancel fixed payment"
                    icon={<Icon as={Trash2} boxSize={4} />}
                    size="sm"
                    variant="ghost"
                    color={captionColor}
                    _hover={{ bg: deleteHoverBg, color: 'red.500' }}
                    onClick={onOpen}
                  />
                </Tooltip>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
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
                Future payments for <Text as="span" fontWeight={700} color={titleColor}>{recurringTransaction.description}</Text>{' '}
                will stop being generated.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter px={6} py={4} borderTop="1px solid" borderColor={dividerColor} gap={2}>
              <Button ref={cancelRef} onClick={onClose} variant="ghost" fontSize="sm" color={captionColor}>
                Keep active
              </Button>
              <Button colorScheme="red" onClick={handleCancel} isLoading={isCancelling} fontSize="sm">
                Cancel payment
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
