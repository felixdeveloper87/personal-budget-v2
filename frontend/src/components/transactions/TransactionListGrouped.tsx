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
  Collapse,
  Button,
  useColorModeValue,
  Divider,
  Icon,
  Tooltip,
} from '@chakra-ui/react'
import { DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { FiCreditCard } from 'react-icons/fi'
import { Transaction } from '../../types'
import { useMemo, useState } from 'react'
import { formatTransactionDateTime } from '../../utils/dateTime'
import { DeleteTransactionDialog } from '../ui'
import { useDeleteTransaction } from '../../hooks/useDeleteTransaction'

interface TransactionListGroupedProps {
  transactions: Transaction[]
  onTransactionDeleted?: () => void
}

interface MonthGroup {
  monthKey: string
  monthName: string
  year: number
  transactions: Transaction[]
  totalIncome: number
  totalExpense: number
  netAmount: number
}

export default function TransactionListGrouped({ transactions, onTransactionDeleted }: TransactionListGroupedProps) {
  const { transactionToDelete, isOpen, openDeleteDialog, closeDeleteDialog } = useDeleteTransaction()
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({})

  const monthGroups = useMemo(() => {
    const groups: Record<string, MonthGroup> = {}

    transactions.forEach(transaction => {
      const date = new Date(transaction.dateTime)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      
      if (!groups[monthKey]) {
        groups[monthKey] = {
          monthKey,
          monthName,
          year: date.getFullYear(),
          transactions: [],
          totalIncome: 0,
          totalExpense: 0,
          netAmount: 0
        }
      }

      groups[monthKey].transactions.push(transaction)
      
      if (transaction.type === 'INCOME') {
        groups[monthKey].totalIncome += transaction.amount
      } else {
        groups[monthKey].totalExpense += transaction.amount
      }
    })

    // Calculate net amount and sort transactions within each group
    Object.values(groups).forEach(group => {
      group.netAmount = group.totalIncome - group.totalExpense
      group.transactions.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    })

    // Sort groups by month (newest first)
    return Object.values(groups).sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  }, [transactions])

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }))
  }

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {}
    monthGroups.forEach(group => {
      allExpanded[group.monthKey] = true
    })
    setExpandedMonths(allExpanded)
  }

  const collapseAll = () => {
    setExpandedMonths({})
  }

  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400')

  if (monthGroups.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Text color="gray.500">No transactions found</Text>
      </Box>
    )
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md">All Transactions</Heading>
        <HStack spacing={2}>
          <Button size="xs" variant="outline" onClick={expandAll}>
            Expand All
          </Button>
          <Button size="xs" variant="outline" onClick={collapseAll}>
            Collapse All
          </Button>
        </HStack>
      </HStack>

      <VStack spacing={4} align="stretch">
        {monthGroups.map((group) => {
          const isExpanded = expandedMonths[group.monthKey] || false
          const transactionCount = group.transactions.length

          return (
            <Box
              key={group.monthKey}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="lg"
              overflow="hidden"
            >
              {/* Month Header */}
              <Box
                bg={headerBg}
                p={4}
                cursor="pointer"
                onClick={() => toggleMonth(group.monthKey)}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                transition="background-color 0.2s"
              >
                <HStack justify="space-between" align="center">
                  <HStack spacing={4} align="center">
                    <Text fontSize="lg" fontWeight="bold" color={textColor}>
                      {group.monthName}
                    </Text>
                    <Badge colorScheme="blue" variant="subtle">
                      {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
                    </Badge>
                  </HStack>

                  <HStack spacing={6} align="center">
                    <VStack spacing={0} align="end">
                      <Text fontSize="sm" color={secondaryTextColor}>
                        Income: <Text as="span" color="green.600" fontWeight="bold">£{group.totalIncome.toFixed(2)}</Text>
                      </Text>
                      <Text fontSize="sm" color={secondaryTextColor}>
                        Expense: <Text as="span" color="red.600" fontWeight="bold">£{group.totalExpense.toFixed(2)}</Text>
                      </Text>
                      <Text fontSize="sm" color={secondaryTextColor}>
                        Net: <Text as="span" color={group.netAmount >= 0 ? 'green.600' : 'red.600'} fontWeight="bold">
                          £{group.netAmount.toFixed(2)}
                        </Text>
                      </Text>
                    </VStack>

                    <IconButton
                      aria-label={isExpanded ? 'Collapse month' : 'Expand month'}
                      icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      size="sm"
                      variant="ghost"
                    />
                  </HStack>
                </HStack>
              </Box>

              {/* Transactions Table */}
              <Collapse in={isExpanded} animateOpacity>
                <Box>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Date & Time</Th>
                          <Th>Type</Th>
                          <Th>Category</Th>
                          <Th>Description</Th>
                          <Th isNumeric>Amount</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {group.transactions.map((tx) => (
                          <Tr key={tx.id}>
                            <Td>
                              <VStack spacing={1} align="start">
                                <Text fontSize="sm" fontWeight="medium">
                                  {formatTransactionDateTime(tx.dateTime).date}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {formatTransactionDateTime(tx.dateTime).time}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={tx.type === 'INCOME' ? 'green' : 'red'}
                                variant="subtle"
                                fontSize="xs"
                              >
                                {tx.type}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm" fontWeight="medium">
                                {tx.category}
                              </Text>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Text fontSize="sm" color="gray.600" noOfLines={1} maxW="200px">
                                  {tx.description || '-'}
                                </Text>
                                {tx.isInstallment && (
                                  <Tooltip label="Installment" hasArrow>
                                    <span>
                                      <Icon as={FiCreditCard} color="purple.500" fontSize="sm" />
                                    </span>
                                  </Tooltip>
                                )}
                              </HStack>
                            </Td>
                            <Td isNumeric>
                              <Text 
                                fontSize="sm" 
                                fontWeight="semibold"
                                color={tx.type === 'INCOME' ? 'green.600' : 'red.600'}
                              >
                                £{tx.amount.toFixed(2)}
                              </Text>
                            </Td>
                            <Td>
                              {tx.id && (
                                <IconButton
                                  aria-label="Delete transaction"
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => openDeleteDialog(tx)}
                                />
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </Collapse>
            </Box>
          )
        })}
      </VStack>
      
      {/* Delete Transaction Dialog */}
      <DeleteTransactionDialog
        transaction={transactionToDelete}
        isOpen={isOpen}
        onClose={closeDeleteDialog}
        onDeleted={onTransactionDeleted || (() => {})}
      />
    </Box>
  )
}
