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
  HStack,
  Icon,
  IconButton,
  Input,
  SimpleGrid,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { AlertTriangle, CalendarClock, Check, Pencil, RefreshCw, Trash2, TrendingUp, TrendingDown } from '../ui/icons'
import {
  cancelRecurringTransaction,
  generateDueRecurringTransactions,
  updateRecurringTransactionAmount,
} from '../../api'
import { RecurringTransaction } from '../../types'

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
  const toast = useToast()
  const [isCancelling, setIsCancelling] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSavingAmount, setIsSavingAmount] = useState(false)
  const [isEditingAmount, setIsEditingAmount] = useState(false)
  const [draftAmount, setDraftAmount] = useState(String(recurringTransaction.amount))
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
  }, [recurringTransaction.amount])

  const handleGenerateDue = async () => {
    setIsGenerating(true)
    try {
      await generateDueRecurringTransactions(recurringTransaction.id)
      toast({
        title: 'Fixed payment synced',
        status: 'success',
        duration: 2000,
      })
      await Promise.resolve(onChanged())
    } catch (err: any) {
      toast({
        title: 'Error syncing fixed payment',
        description: err?.message || 'Please try again',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await cancelRecurringTransaction(recurringTransaction.id)
      toast({
        title: 'Fixed payment cancelled',
        status: 'success',
        duration: 2000,
      })
      await Promise.resolve(onChanged())
      onClose()
    } catch (err: any) {
      toast({
        title: 'Error cancelling fixed payment',
        description: err?.message || 'Please try again',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handleSaveAmount = async () => {
    const nextAmount = Number(draftAmount)
    if (nextAmount <= 0 || Number.isNaN(nextAmount)) {
      toast({
        title: 'Enter a valid amount',
        status: 'warning',
        duration: 2500,
      })
      return
    }

    setIsSavingAmount(true)
    try {
      await updateRecurringTransactionAmount(recurringTransaction.id, nextAmount)
      toast({
        title: 'Amount updated',
        description: 'Future transactions will use the new value.',
        status: 'success',
        duration: 2500,
      })
      setIsEditingAmount(false)
      await Promise.resolve(onChanged())
    } catch (err: any) {
      toast({
        title: 'Error updating amount',
        description: err?.response?.data?.error || err?.message || 'Please try again',
        status: 'error',
        duration: 3000,
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
        <CardBody p={5} pl={recurringTransaction.active ? 6 : 5}>
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" align="flex-start">
              <HStack spacing={3} minW={0} flex={1}>
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
                  <Icon as={typeIcon} boxSize={4} weight="duotone" />
                </Box>
                <VStack align="flex-start" spacing={0} minW={0}>
                  <Text fontWeight={700} fontSize="md" color={titleColor} noOfLines={1}>
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

            <Box bg={amountPanelBg} borderRadius="xl" p={4} border="1px solid" borderColor={metaBorder}>
              <HStack justify="space-between" align="flex-start" mb={isEditingAmount ? 2 : 0}>
                <Text fontSize="xs" color={captionColor} fontWeight={500}>
                  Fixed monthly amount
                </Text>
                {!isEditingAmount && recurringTransaction.active && (
                  <Tooltip label="Edit amount">
                    <IconButton
                      aria-label="Edit recurring amount"
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
                  <HStack spacing={2} flexWrap="wrap">
                    <Input
                      value={draftAmount}
                      onChange={(event) => setDraftAmount(event.target.value)}
                      type="number"
                      min={0}
                      step="0.01"
                      size="sm"
                      w="120px"
                      fontWeight={700}
                    />
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
                        setIsEditingAmount(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </HStack>
                ) : (
                  <HStack spacing={2}>
                    <Text fontSize="2xl" fontWeight={800} color={accentFg} lineHeight="1.05">
                      £{recurringTransaction.amount.toFixed(2)}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={2}>
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
                mx={-5}
                mb={-5}
                px={5}
                pb={5}
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
    <Box bg={bg} border="1px solid" borderColor={borderColor} borderRadius="lg" p={3}>
      <Text fontSize="2xs" color={captionColor} fontWeight={700} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="xs" color={titleColor} fontWeight={800} mt={0.5} noOfLines={1}>
        {value}
      </Text>
    </Box>
  )
}
