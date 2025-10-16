import React, { useState } from 'react'
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  Button,
  Collapse,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FiCreditCard,
  FiChevronDown,
  FiChevronUp,
  FiTrash2,
  FiCalendar,
} from 'react-icons/fi'
import { InstallmentPlan } from '../../types'
import { deleteInstallmentPlan } from '../../api'

interface InstallmentPlanCardProps {
  plan: InstallmentPlan
  onDeleted: () => void
}

/**
 * 💳 InstallmentPlanCard
 * Displays an installment plan with all its transactions
 * Allows expanding/collapsing and deletion
 */
export default function InstallmentPlanCard({ plan, onDeleted }: InstallmentPlanCardProps) {
  const toast = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const firstTransaction = plan.transactions[0]
  const paidCount = plan.transactions.filter((t) => {
    const txDate = new Date(t.date)
    return txDate < new Date()
  }).length

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteInstallmentPlan(plan.id)
      toast({
        title: 'Installment plan deleted',
        description: 'All installments have been removed',
        status: 'success',
        duration: 2000,
      })
      onDeleted()
      onClose()
    } catch (err: any) {
      toast({
        title: 'Error deleting',
        description: err?.message || 'Please try again',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card
        bg={useColorModeValue('#dbeafe', '#1e3a8a')} // Azul post-it no light, azul escuro no dark
        shadow={useColorModeValue('md', 'lg')}
        borderRadius="xl"
        border="2px"
        borderColor={useColorModeValue('#60a5fa', '#3b82f6')} // Azul claro no light, azul mais escuro no dark
        _hover={{ 
          shadow: useColorModeValue('lg', 'xl'), 
          borderColor: useColorModeValue('#3b82f6', '#60a5fa'),
          transform: 'translateY(-2px)'
        }}
        transition="all 0.3s ease"
      >
        <CardBody p={5}>
          <VStack align="stretch" spacing={4}>
            {/* Header */}
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={FiCreditCard} fontSize="xl" color={useColorModeValue('#3b82f6', '#60a5fa')} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" fontSize="md" color={useColorModeValue('gray.800', 'white')}>
                    {firstTransaction?.description?.replace(/ \(Parcela.*\)/, '')}
                  </Text>
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                    {firstTransaction?.category}
                  </Text>
                </VStack>
              </HStack>
              <IconButton
                aria-label="Delete installment plan"
                icon={<FiTrash2 />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={onOpen}
              />
            </HStack>

            {/* Summary */}
            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.300')}>
                  Installment value
                </Text>
                <Text fontSize="xl" fontWeight="bold" color={useColorModeValue('#3b82f6', '#60a5fa')}>
                  £{plan.installmentValue.toFixed(2)}
                </Text>
              </VStack>

              <VStack align="end" spacing={0}>
                <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.300')}>
                  Total
                </Text>
                <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('gray.800', 'white')}>
                  £{plan.totalAmount.toFixed(2)}
                </Text>
              </VStack>
            </HStack>

            {/* Progress */}
            <HStack justify="space-between">
              <Badge 
                bg={useColorModeValue('#60a5fa', '#3b82f6')} 
                color="white" 
                fontSize="sm" 
                px={2} 
                py={1} 
                borderRadius="md"
                boxShadow="sm"
              >
                {paidCount}/{plan.totalInstallments} paid
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                rightIcon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                onClick={() => setIsExpanded(!isExpanded)}
                colorScheme="blue"
                fontWeight="medium"
              >
                {isExpanded ? 'Hide' : 'View Installments'}
              </Button>
            </HStack>

            {/* Installment list (collapsible) */}
            <Collapse in={isExpanded} animateOpacity>
              <VStack
                align="stretch"
                spacing={2}
                mt={3}
                p={3}
                bg={useColorModeValue('white', 'gray.800')}
                borderRadius="md"
                maxH="350px"
                overflowY="auto"
                border="1px"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
              >
                {plan.transactions.map((transaction) => {
                  const isPaid = new Date(transaction.date) < new Date()
                  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR')
                  
                  return (
                    <HStack
                      key={transaction.id}
                      justify="space-between"
                      p={2}
                      bg={useColorModeValue(
                        isPaid ? "green.50" : "gray.50",
                        isPaid ? "green.900" : "gray.700"
                      )}
                      borderRadius="md"
                      border="1px"
                      borderColor={useColorModeValue(
                        isPaid ? "green.200" : "gray.200",
                        isPaid ? "green.600" : "gray.600"
                      )}
                      flexWrap="wrap"
                      gap={2}
                    >
                      <HStack spacing={2} minW="0" flex="1">
                        <Icon as={FiCalendar} fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} />
                        <VStack align="start" spacing={0} minW="0">
                          <Text fontSize="xs" fontWeight="medium" color={useColorModeValue('gray.800', 'white')}>
                            {formattedDate}
                          </Text>
                          <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
                            {transaction.installmentNumber}/{plan.totalInstallments}
                          </Text>
                        </VStack>
                      </HStack>
                      
                      <HStack spacing={2} minW="0">
                        <Text fontSize="xs" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>
                          £{transaction.amount.toFixed(2)}
                        </Text>
                        <Badge 
                          colorScheme={isPaid ? "green" : "gray"}
                          size="sm"
                          fontSize="xs"
                          px={1}
                          py={0}
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

      {/* Delete confirmation dialog */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent 
            bg={useColorModeValue('#dbeafe', '#1e3a8a')} 
            borderColor={useColorModeValue('#60a5fa', '#3b82f6')}
            border="2px"
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Installment Plan
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? All {plan.totalInstallments} installments will be permanently removed.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleting}
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

