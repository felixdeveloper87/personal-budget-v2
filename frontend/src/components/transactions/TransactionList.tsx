import { 
  Box, 
  Text, 
  Badge, 
  IconButton, 
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  VStack,
  HStack,
  Icon,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { FiCreditCard } from 'react-icons/fi'
import { Transaction } from '../../types'
import { useMemo, useState } from 'react'
import { formatDateBR, formatTransactionDateTime } from '../../utils/dateTime'
import { DeleteTransactionDialog } from '../ui'
import { useDeleteTransaction } from '../../hooks/useDeleteTransaction'
import { normalizeInstallmentDescription } from '../../utils/installments'
import EditTransactionModal from './EditTransactionModal'

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionDeleted?: () => void
}

export default function TransactionList({ transactions, onTransactionDeleted }: TransactionListProps) {
  const { transactionToDelete, isOpen, openDeleteDialog, closeDeleteDialog } = useDeleteTransaction()
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Memoize sorted transactions to prevent recalculation on every render
   const sortedTransactions = useMemo(() => 
    transactions
      .sort((a, b) => new Date(b.paymentDate || b.dateTime).getTime() - new Date(a.paymentDate || a.dateTime).getTime()),
    [transactions]
  )

  if (sortedTransactions.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Text color="gray.500">No transactions found</Text>
      </Box>
    )
  }

  return (
    <Box>
      <TableContainer>
        <Table 
          variant="simple" 
          size={{ base: "xs", md: "sm" }}
          sx={{
            'th, td': {
              padding: { base: '8px 4px', md: '12px 8px' }
            }
          }}
        >
          <Thead>
            <Tr>
              <Th fontSize={{ base: "xs", md: "sm" }}>Date & Time</Th>
              <Th fontSize={{ base: "xs", md: "sm" }}>Type</Th>
              <Th fontSize={{ base: "xs", md: "sm" }}>Category</Th>
              <Th fontSize={{ base: "xs", md: "sm" }}>Description</Th>
              <Th isNumeric fontSize={{ base: "xs", md: "sm" }}>Amount</Th>
              <Th fontSize={{ base: "xs", md: "sm" }}>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedTransactions.map((tx) => (
              <Tr key={tx.id} _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}>
                <Td>
                  <VStack spacing={{ base: 0.5, md: 1 }} align="start">
                    <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                      {formatTransactionDateTime(tx.dateTime).date}
                    </Text>
                    <Text fontSize={{ base: "2xs", md: "xs" }} color="gray.500">
                      {formatTransactionDateTime(tx.dateTime).time}
                    </Text>
                    {tx.paymentDate && tx.paymentDate !== (tx.transactionDate || tx.dateTime.slice(0, 10)) && (
                      <Text fontSize={{ base: "2xs", md: "xs" }} color="blue.500">
                        Paid {formatDateBR(tx.paymentDate)}
                      </Text>
                    )}
                  </VStack>
                </Td>
                <Td>
                  <Badge
                    colorScheme={tx.type === 'INCOME' ? 'green' : 'red'}
                    variant="subtle"
                    fontSize={{ base: "2xs", md: "xs" }}
                  >
                    {tx.type}
                  </Badge>
                </Td>
                <Td>
                  <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                    {tx.category}
                  </Text>
                </Td>
                <Td>
                  <HStack spacing={{ base: 1, md: 2 }}>
                    <Text 
                      fontSize={{ base: "xs", md: "sm" }} 
                      color={tx.isFutureInstallment ? "gray.500" : "gray.600"} 
                      noOfLines={1} 
                      maxW="200px"
                      fontStyle={tx.isFutureInstallment ? "italic" : "normal"}
                    >
                      {normalizeInstallmentDescription(tx.description || '-')}
                    </Text>
                    {tx.paymentMethodName && (
                      <Badge colorScheme="blue" variant="subtle" fontSize="2xs">
                        {tx.paymentMethodName}
                      </Badge>
                    )}
                    {tx.isInstallment && (
                      <Tooltip label={tx.isFutureInstallment ? "Future Installment" : "Installment"} hasArrow>
                        <span>
                          <Icon 
                            as={FiCreditCard} 
                            color={tx.isFutureInstallment ? "gray.400" : "purple.500"} 
                            fontSize={{ base: "xs", md: "sm" }} 
                          />
                        </span>
                      </Tooltip>
                    )}
                  </HStack>
                </Td>
                <Td isNumeric>
                  <Text 
                    fontSize={{ base: "xs", md: "sm" }} 
                    fontWeight="semibold"
                    color={tx.isFutureInstallment ? "gray.500" : (tx.type === 'INCOME' ? 'green.600' : 'red.600')}
                    fontStyle={tx.isFutureInstallment ? "italic" : "normal"}
                  >
                    £{tx.amount.toFixed(2)}
                    {tx.isFutureInstallment && " (future)"}
                  </Text>
                </Td>
                <Td>
                  {tx.id && !tx.isFutureInstallment && (
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Edit transaction"
                        icon={<EditIcon />}
                        size={{ base: "xs", md: "sm" }}
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => {
                          setTransactionToEdit(tx)
                          setIsEditModalOpen(true)
                        }}
                      />
                      <IconButton
                        aria-label="Delete transaction"
                        icon={<DeleteIcon />}
                        size={{ base: "xs", md: "sm" }}
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => openDeleteDialog(tx)}
                      />
                    </HStack>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      
      {/* Delete Transaction Dialog */}
      <DeleteTransactionDialog
        transaction={transactionToDelete}
        isOpen={isOpen}
        onClose={closeDeleteDialog}
        onDeleted={onTransactionDeleted || (() => {})}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setTransactionToEdit(null)
        }}
        transaction={transactionToEdit}
        onTransactionUpdated={() => {
          onTransactionDeleted?.()
          setIsEditModalOpen(false)
          setTransactionToEdit(null)
        }}
      />
    </Box>
  )
}
