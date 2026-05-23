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
  Flex,
  Select,
  Button,
} from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { FiCreditCard } from 'react-icons/fi'
import { Transaction } from '../../types'
import { useMemo, useState, useEffect } from 'react'
import { formatDateBR, formatTransactionDateTime } from '../../utils/dateTime'
import { DeleteTransactionDialog } from '../ui'
import { useDeleteTransaction } from '../../hooks/useDeleteTransaction'
import { normalizeInstallmentDescription } from '../../utils/installments'
import EditTransactionModal from './EditTransactionModal'
import { ChevronLeft, ChevronRight } from '../ui/icons'

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionDeleted?: () => void
}

export default function TransactionList({ transactions, onTransactionDeleted }: TransactionListProps) {
  const { transactionToDelete, isOpen, openDeleteDialog, closeDeleteDialog } = useDeleteTransaction()
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  // Reset to first page when the total number of transactions changes (e.g. filter applied)
  useEffect(() => {
    setCurrentPage(1)
  }, [transactions.length])

  // Memoize sorted transactions to prevent recalculation on every render
  const sortedTransactions = useMemo(() => 
    [...transactions].sort((a, b) => new Date(b.paymentDate || b.dateTime).getTime() - new Date(a.paymentDate || a.dateTime).getTime()),
    [transactions]
  )

  const totalItems = sortedTransactions.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const activePage = Math.min(currentPage, totalPages || 1)

  const paginatedTransactions = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize
    return sortedTransactions.slice(startIndex, startIndex + pageSize)
  }, [sortedTransactions, activePage, pageSize])

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const range = 1
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= activePage - range && i <= activePage + range)
      ) {
        pages.push(i)
      } else if (
        i === activePage - range - 1 ||
        i === activePage + range + 1
      ) {
        pages.push('...')
      }
    }
    
    return pages.filter((item, index) => {
      if (item === '...' && pages[index - 1] === '...') {
        return false
      }
      return true
    })
  }

  const paginationBg = useColorModeValue('white', 'rgba(18, 18, 22, 0.4)')
  const paginationBorderColor = useColorModeValue('gray.100', 'rgba(255, 255, 255, 0.05)')
  const pageBtnBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const pageBtnHover = useColorModeValue('gray.100', 'whiteAlpha.100')
  const pageActiveBg = useColorModeValue('blue.500', 'blue.500')
  const pageActiveColor = 'white'

  if (totalItems === 0) {
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
            {paginatedTransactions.map((tx) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Flex
          justify="space-between"
          align="center"
          mt={6}
          pt={4}
          borderTop="1px solid"
          borderColor={paginationBorderColor}
          flexDirection={{ base: 'column', md: 'row' }}
          gap={{ base: 4, md: 0 }}
        >
          {/* Items per page selector */}
          <HStack spacing={2}>
            <Text fontSize="xs" fontWeight="500" color="gray.500">
              Show
            </Text>
            <Select
              size="xs"
              w="75px"
              borderRadius="md"
              value={pageSize}
              onChange={handlePageSizeChange}
              bg={paginationBg}
              borderColor={paginationBorderColor}
              fontSize="xs"
              fontWeight="600"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
            <Text fontSize="xs" fontWeight="500" color="gray.500">
              per page
            </Text>
          </HStack>

          {/* Page Info */}
          <Text fontSize="xs" fontWeight="500" color="gray.500">
            Showing {Math.min((activePage - 1) * pageSize + 1, totalItems)} to{' '}
            {Math.min(activePage * pageSize, totalItems)} of {totalItems} entries
          </Text>

          {/* Navigation Controls */}
          <HStack spacing={1}>
            <IconButton
              aria-label="Previous page"
              icon={<Icon as={ChevronLeft} boxSize={4} />}
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={activePage === 1}
              borderRadius="lg"
              bg={pageBtnBg}
              borderColor={paginationBorderColor}
              _hover={{ bg: pageBtnHover }}
            />

            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <Text key={`ellipsis-${index}`} px={2} fontSize="sm" color="gray.500">
                    ...
                  </Text>
                )
              }
              const isPageActive = page === activePage
              return (
                <Button
                  key={`page-${page}`}
                  size="sm"
                  variant={isPageActive ? 'solid' : 'outline'}
                  colorScheme={isPageActive ? 'blue' : 'gray'}
                  onClick={() => setCurrentPage(page as number)}
                  borderRadius="lg"
                  fontSize="xs"
                  fontWeight="bold"
                  h="32px"
                  w="32px"
                  p={0}
                  bg={isPageActive ? pageActiveBg : pageBtnBg}
                  color={isPageActive ? pageActiveColor : undefined}
                  borderColor={paginationBorderColor}
                  _hover={isPageActive ? undefined : { bg: pageBtnHover }}
                >
                  {page}
                </Button>
              )
            })}

            <IconButton
              aria-label="Next page"
              icon={<Icon as={ChevronRight} boxSize={4} />}
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              isDisabled={activePage === totalPages}
              borderRadius="lg"
              bg={pageBtnBg}
              borderColor={paginationBorderColor}
              _hover={{ bg: pageBtnHover }}
            />
          </HStack>
        </Flex>
      )}

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
