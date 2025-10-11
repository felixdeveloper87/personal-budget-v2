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
} from '@chakra-ui/react'
import {
  FiCreditCard,
  FiChevronDown,
  FiChevronUp,
  FiTrash2,
  FiCalendar,
} from 'react-icons/fi'
import { useThemeColors } from '../../hooks/useThemeColors'
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
  const colors = useThemeColors()
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
        title: 'Parcelamento excluído',
        description: 'Todas as parcelas foram removidas',
        status: 'success',
        duration: 2000,
      })
      onDeleted()
      onClose()
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir',
        description: err?.message || 'Tente novamente',
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
        bg={colors.cardBg}
        shadow="md"
        borderRadius="xl"
        border="1px"
        borderColor={colors.border}
        _hover={{ shadow: 'lg', borderColor: colors.accent }}
        transition="all 0.2s"
      >
        <CardBody p={5}>
          <VStack align="stretch" spacing={4}>
            {/* Header */}
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={FiCreditCard} fontSize="xl" color={colors.accent} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" fontSize="md">
                    {firstTransaction?.description?.replace(/ \(Parcela.*\)/, '')}
                  </Text>
                  <Text fontSize="sm" color={colors.text.secondary}>
                    {firstTransaction?.category}
                  </Text>
                </VStack>
              </HStack>
              <IconButton
                aria-label="Excluir parcelamento"
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
                <Text fontSize="xs" color={colors.text.secondary}>
                  Valor da parcela
                </Text>
                <Text fontSize="xl" fontWeight="bold" color={colors.accent}>
                  R$ {plan.installmentValue.toFixed(2)}
                </Text>
              </VStack>

              <VStack align="end" spacing={0}>
                <Text fontSize="xs" color={colors.text.secondary}>
                  Total
                </Text>
                <Text fontSize="lg" fontWeight="semibold">
                  R$ {plan.totalAmount.toFixed(2)}
                </Text>
              </VStack>
            </HStack>

            {/* Progress */}
            <HStack justify="space-between">
              <Badge colorScheme="purple" fontSize="sm" px={2} py={1} borderRadius="md">
                {paidCount}/{plan.totalInstallments} pagas
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                rightIcon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Ocultar' : 'Ver parcelas'}
              </Button>
            </HStack>

            {/* Installment list (collapsible) */}
            <Collapse in={isExpanded} animateOpacity>
              <VStack
                align="stretch"
                spacing={2}
                mt={2}
                p={3}
                bg={colors.bgSecondary}
                borderRadius="md"
                maxH="300px"
                overflowY="auto"
              >
                {plan.transactions.map((transaction) => {
                  const isPaid = new Date(transaction.date) < new Date()
                  return (
                    <HStack
                      key={transaction.id}
                      justify="space-between"
                      p={2}
                      bg={isPaid ? colors.cardBg : colors.cardBg}
                      borderRadius="md"
                      border="1px"
                      borderColor={isPaid ? colors.border : 'transparent'}
                    >
                      <HStack spacing={2}>
                        <Icon as={FiCalendar} fontSize="sm" color={colors.text.secondary} />
                        <Text fontSize="sm">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Badge colorScheme={isPaid ? 'green' : 'gray'} fontSize="xs">
                          {transaction.installmentNumber}/{plan.totalInstallments}
                        </Badge>
                        <Text fontSize="sm" fontWeight="semibold">
                          R$ {transaction.amount.toFixed(2)}
                        </Text>
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
          <AlertDialogContent bg={colors.cardBg} borderColor={colors.border}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Parcelamento
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza? Todas as {plan.totalInstallments} parcelas serão removidas
              permanentemente.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleting}
              >
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

