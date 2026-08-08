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
  VStack,
  HStack,
  Collapse,
  Button,
  Icon,
  Tooltip,
  Flex,
  Select,
} from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { FiCreditCard } from 'react-icons/fi'
import { Transaction } from '../../types'
import { useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { formatDateBR, formatTransactionDateTime } from '../../utils/dateTime'
import { DeleteTransactionDialog } from '../ui'
import { useDeleteTransaction } from '../../hooks/useDeleteTransaction'
import { normalizeInstallmentDescription } from '../../utils/installments'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from '../ui/icons'
import EditTransactionModal from './EditTransactionModal'
import {
  getTransactionDate,
  getTransactionDateSource,
  getCounterpartDateHint,
  type TransactionDateBasis,
} from '../../utils/transactionDates'
import { formatTransactionAccount } from '../../utils/transactionAccount'

interface TransactionListGroupedProps {
  transactions: Transaction[]
  onTransactionDeleted?: () => void
  dateBasis?: TransactionDateBasis
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

export interface TransactionListGroupedRef {
  goToCurrentMonth: () => void
}

const TransactionListGrouped = forwardRef<TransactionListGroupedRef, TransactionListGroupedProps>(
  ({ transactions, onTransactionDeleted, dateBasis = 'activity' }, ref) => {
    const { transactionToDelete, isOpen, openDeleteDialog, closeDeleteDialog } = useDeleteTransaction()
    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({})
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    useImperativeHandle(ref, () => ({
      goToCurrentMonth
    }))

  const monthGroups = useMemo(() => {
    const groups: Record<string, MonthGroup> = {}

    transactions.forEach(transaction => {
      const date = getTransactionDate(transaction, dateBasis)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      
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
      group.transactions.sort(
        (a, b) =>
          getTransactionDate(b, dateBasis).getTime() -
          getTransactionDate(a, dateBasis).getTime(),
      )
    })

    // Sort groups by month (newest first)
    return Object.values(groups).sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  }, [transactions, dateBasis])

  // Find current month key and index
  const currentMonthKey = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }, [])

  const currentMonthIndex = useMemo(() => {
    return monthGroups.findIndex(g => g.monthKey === currentMonthKey)
  }, [monthGroups, currentMonthKey])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6) // Default to showing 6 months per page

  // Automatically default page to the page containing the current month
  const [hasInitializedPage, setHasInitializedPage] = useState(false)
  useEffect(() => {
    if (monthGroups.length > 0 && !hasInitializedPage) {
      if (currentMonthIndex !== -1) {
        const targetPage = Math.ceil((currentMonthIndex + 1) / pageSize)
        setCurrentPage(targetPage)
      } else {
        setCurrentPage(1)
      }
      setHasInitializedPage(true)
    }
  }, [monthGroups, currentMonthIndex, pageSize, hasInitializedPage])

  // Reset initialization flag when transactions completely change
  // or when the date basis regroups the months
  useEffect(() => {
    setHasInitializedPage(false)
  }, [transactions.length, dateBasis])

  // Scroll to current month helper
  const goToCurrentMonth = () => {
    if (currentMonthIndex !== -1) {
      const targetPage = Math.ceil((currentMonthIndex + 1) / pageSize)
      setCurrentPage(targetPage)
      setTimeout(() => {
        const element = document.getElementById(`month-card-${currentMonthKey}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  const totalItems = monthGroups.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const activePage = Math.min(currentPage, totalPages || 1)

  const paginatedMonthGroups = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize
    return monthGroups.slice(startIndex, startIndex + pageSize)
  }, [monthGroups, activePage, pageSize])

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

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }))
  }

  const borderColor = 'var(--pb-hair)'
  const groupCardBg = 'var(--pb-surface)'
  const headerBg = 'transparent'
  const textColor = 'var(--pb-ink)'
  const secondaryTextColor = 'var(--pb-ink-soft)'
  
  const paginationBg = 'var(--pb-surface)'
  const paginationBorderColor = 'var(--pb-hair)'
  const pageBtnBg = 'var(--pb-surface-2)'
  const pageBtnHover = 'var(--pb-surface-3)'
  const pageActiveBg = 'var(--pb-forest-2)'
  const pageActiveColor = 'var(--pb-on-accent)'

  if (totalItems === 0) {
    return (
      <Box p={6} textAlign="center">
        <Text color="var(--pb-ink-soft)">No transactions found</Text>
      </Box>
    )
  }

  return (
    <Box>

      <VStack spacing={4} align="stretch">
        {paginatedMonthGroups.map((group) => {
          const isExpanded = expandedMonths[group.monthKey] || false
          const transactionCount = group.transactions.length
          const [mName, mYear] = group.monthName.split(' ')
          const isCurrentMonth = group.monthKey === currentMonthKey

          return (
            <Box
              key={group.monthKey}
              id={`month-card-${group.monthKey}`}
              border="1px solid"
              borderColor={isCurrentMonth 
                ? 'var(--pb-forest-2)'
                : borderColor}
              borderRadius="xl"
              overflow="hidden"
              bg={groupCardBg}
              boxShadow={isCurrentMonth
                ? 'var(--pb-shadow-lift)'
                : 'var(--pb-shadow)'}
              transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: 'var(--pb-shadow-lift)',
                borderColor: isCurrentMonth ? 'var(--pb-forest-2)' : 'var(--pb-hair-2)',
              }}
            >
              {/* Month Header */}
              <Box
                bg={headerBg}
                p={{ base: 4, md: 5 }}
                cursor="pointer"
                onClick={() => toggleMonth(group.monthKey)}
                transition="background-color 0.2s ease"
                _hover={{ bg: 'var(--pb-surface-2)' }}
              >
                <HStack justify="space-between" align="center" wrap="nowrap" overflow="hidden">
                  {/* Left: split Month and Year with badge & compact mobile stats */}
                  <VStack spacing={1} align="start" minW={0} flex={1}>
                    <HStack spacing={2} align="center" minW={0} w="full">
                      <Text 
                        fontSize={{ base: "md", md: "lg" }} 
                        fontWeight="700" 
                        color={textColor}
                        letterSpacing="-0.02em"
                        noOfLines={1}
                        minW={0}
                      >
                        {mName}{' '}
                        <Text as="span" fontWeight="500" color="var(--pb-ink-soft)">
                          {mYear}
                        </Text>
                      </Text>
                      <Text fontSize="xs" color="var(--pb-ink-soft)" fontWeight="500" flexShrink={0}>
                        • {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'}
                      </Text>
                      {isCurrentMonth && (
                        <Badge
                          variant="subtle"
                          fontSize="3xs"
                          px={2}
                          py={0.2}
                          borderRadius="full"
                          fontWeight="700"
                          textTransform="uppercase"
                          letterSpacing="0.05em"
                          bg="var(--pb-tint-green)"
                          color="var(--pb-forest-2)"
                          border="1px solid"
                          borderColor="var(--pb-hair-2)"
                        >
                          Current
                        </Badge>
                      )}
                    </HStack>

                    {/* Mobile summary - Compact inline metrics (visible only on base) */}
                    <HStack 
                      spacing={2.5} 
                      display={{ base: "flex", sm: "none" }} 
                      fontSize="2xs" 
                      fontWeight="600"
                      color="var(--pb-ink-soft)"
                      align="center"
                    >
                      <Text color="var(--pb-income-2)">
                        In: £{group.totalIncome.toFixed(0)}
                      </Text>
                      <Text opacity={0.3} fontSize="xs">•</Text>
                      <Text color="var(--pb-coral)">
                        Out: £{group.totalExpense.toFixed(0)}
                      </Text>
                      <Text opacity={0.3} fontSize="xs">•</Text>
                      <Text color={group.netAmount >= 0 ? 'var(--pb-income-2)' : 'var(--pb-coral)'} fontWeight="700">
                        Net: {group.netAmount >= 0 ? '+' : ''}£{group.netAmount.toFixed(0)}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Right: Metrics Grid + Chevron */}
                  <HStack spacing={{ base: 4, md: 8 }} align="center" flexShrink={0}>
                    {/* Financial Indicators Grid - Desktop */}
                    <HStack spacing={{ base: 4, md: 6 }} align="center" display={{ base: "none", sm: "flex" }}>
                      {/* Income Column */}
                      <HStack spacing={2.5} align="center" w={{ sm: "110px", md: "140px" }} flexShrink={0}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          w="26px"
                          h="26px"
                          borderRadius="lg"
                          bg="var(--pb-tint-income)"
                          color="var(--pb-income-2)"
                          flexShrink={0}
                        >
                          <Icon as={TrendingUp} weight="bold" boxSize={3.5} />
                        </Box>
                        <VStack spacing={0} align="start">
                          <Text fontSize="3xs" fontWeight="700" color="var(--pb-ink-faint)" textTransform="uppercase" letterSpacing="0.05em" lineHeight={1}>
                            Income
                          </Text>
                          <Text fontSize="sm" fontWeight="700" color="var(--pb-ink)">
                            £{group.totalIncome.toFixed(2)}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Expense Column */}
                      <HStack spacing={2.5} align="center" w={{ sm: "110px", md: "140px" }} flexShrink={0}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          w="26px"
                          h="26px"
                          borderRadius="lg"
                          bg="var(--pb-tint-coral)"
                          color="var(--pb-coral)"
                          flexShrink={0}
                        >
                          <Icon as={TrendingDown} weight="bold" boxSize={3.5} />
                        </Box>
                        <VStack spacing={0} align="start">
                          <Text fontSize="3xs" fontWeight="700" color="var(--pb-ink-faint)" textTransform="uppercase" letterSpacing="0.05em" lineHeight={1}>
                            Expense
                          </Text>
                          <Text fontSize="sm" fontWeight="700" color="var(--pb-ink)">
                            £{group.totalExpense.toFixed(2)}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Net Balance Column */}
                      <Box
                        px={3.5}
                        py={1.5}
                        borderRadius="xl"
                        bg={group.netAmount >= 0
                          ? 'var(--pb-tint-income)'
                          : 'var(--pb-tint-coral)'}
                        border="1px solid"
                        borderColor="var(--pb-hair)"
                        w={{ sm: "115px", md: "145px" }}
                        flexShrink={0}
                        textAlign="center"
                      >
                        <Text fontSize="3xs" fontWeight="700" color={group.netAmount >= 0 ? 'var(--pb-income-2)' : 'var(--pb-coral)'} textTransform="uppercase" letterSpacing="0.05em" mb={0.5} lineHeight={1}>
                          Net Balance
                        </Text>
                        <Text 
                          fontSize="sm" 
                          fontWeight="800" 
                          color={group.netAmount >= 0
                            ? 'var(--pb-income-2)'
                            : 'var(--pb-coral)'}
                          lineHeight={1.1}
                        >
                          {group.netAmount >= 0 ? '+' : ''}£{group.netAmount.toFixed(2)}
                        </Text>
                      </Box>
                    </HStack>

                    {/* Expand/Collapse Chevron wrapper */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      transform={isExpanded ? 'rotate(180deg)' : 'none'}
                      transition="transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                      color="var(--pb-ink-faint)"
                      p={1.5}
                      borderRadius="full"
                      bg="var(--pb-surface-2)"
                      w="32px"
                      h="32px"
                      flexShrink={0}
                    >
                      <Icon as={ChevronDown} boxSize={4} weight="bold" />
                    </Box>
                  </HStack>
                </HStack>
              </Box>

              {/* Transactions Table */}
              <Collapse in={isExpanded} animateOpacity>
                <Box 
                  borderTop="1px solid" 
                  borderColor="var(--pb-hair)"
                  bg="var(--pb-surface-2)"
                  px={{ base: 2, sm: 3, md: 5 }}
                  py={{ base: 3, sm: 4, md: 5 }}
                >
                  <TableContainer>
                    <Table 
                      variant="simple" 
                      size="sm"
                      sx={{
                        'th, td': {
                          borderColor: 'var(--pb-hair)',
                          padding: { base: '8px 4px', md: '12px 8px' }
                        }
                      }}
                    >
                      <Thead>
                        <Tr>
                          <Th fontSize="2xs" color="var(--pb-ink-faint)" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" display={{ base: 'none', md: 'table-cell' }}>Date & Time</Th>
                          <Th fontSize="2xs" color="var(--pb-ink-faint)" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" display={{ base: 'none', md: 'table-cell' }}>Type</Th>
                          <Th fontSize="2xs" color="var(--pb-ink-faint)" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">Category</Th>
                          <Th fontSize="2xs" color="var(--pb-ink-faint)" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">Description</Th>
                          <Th isNumeric fontSize="2xs" color="var(--pb-ink-faint)" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">Amount</Th>
                          <Th fontSize="2xs" color="var(--pb-ink-faint)" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" w={{ base: "60px", md: "80px" }}>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {group.transactions.map((tx) => {
                          const dateHint = getCounterpartDateHint(tx, dateBasis)
                          return (
                          <Tr key={tx.id} _hover={{ bg: 'var(--pb-surface-3)' }}>
                            <Td display={{ base: 'none', md: 'table-cell' }}>
                              <VStack spacing={1} align="start">
                                <Text fontSize="sm" fontWeight="600" color={textColor}>
                                  {formatTransactionDateTime(getTransactionDateSource(tx, dateBasis)).date}
                                </Text>
                                <Text fontSize="xs" color="var(--pb-ink-faint)" fontWeight="500">
                                  {formatTransactionDateTime(tx.dateTime).time}
                                </Text>
                                {dateHint && (
                                  <Text fontSize="xs" color="var(--pb-ink-faint)">
                                    {dateHint.prefix} {formatDateBR(dateHint.date)}
                                  </Text>
                                )}
                              </VStack>
                            </Td>
                            <Td display={{ base: 'none', md: 'table-cell' }}>
                              <Badge
                                variant="subtle"
                                fontSize="xs"
                                bg={tx.type === 'INCOME' ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'}
                                color={tx.type === 'INCOME' ? 'var(--pb-income-2)' : 'var(--pb-coral)'}
                                border="1px solid var(--pb-hair)"
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
                              <VStack spacing={0.5} align="start">
                                <HStack spacing={{ base: 1, md: 2 }}>
                                  <Tooltip label={normalizeInstallmentDescription(tx.description || '-')} hasArrow isDisabled={!tx.description || tx.description.length <= 25}>
                                    <Text
                                      fontSize={{ base: "xs", md: "sm" }}
                                      color={tx.isFutureInstallment ? 'var(--pb-ink-faint)' : secondaryTextColor}
                                      noOfLines={1}
                                      fontStyle={tx.isFutureInstallment ? "italic" : "normal"}
                                    >
                                      {normalizeInstallmentDescription(tx.description || '-')}
                                    </Text>
                                  </Tooltip>
                                  {tx.paymentMethodName && (
                                    <Badge
                                      variant="subtle"
                                      fontSize="2xs"
                                      display={{ base: 'none', sm: 'inline-flex' }}
                                      bg="var(--pb-tint-green)"
                                      color="var(--pb-forest-2)"
                                      border="1px solid var(--pb-hair)"
                                    >
                                      {tx.paymentMethodName}
                                    </Badge>
                                  )}
                                  {tx.isInstallment && (
                                    <Tooltip label={tx.isFutureInstallment ? "Future Installment" : "Installment"} hasArrow>
                                      <span>
                                        <Icon
                                          as={FiCreditCard}
                                          color={tx.isFutureInstallment ? 'var(--pb-ink-faint)' : 'var(--pb-forest-2)'}
                                          fontSize={{ base: "xs", md: "sm" }}
                                        />
                                      </span>
                                    </Tooltip>
                                  )}
                                </HStack>
                                {formatTransactionAccount(tx) && (
                                  <Text fontSize="2xs" color="var(--pb-forest-2)" noOfLines={1}>
                                    {formatTransactionAccount(tx)}
                                  </Text>
                                )}
                              </VStack>
                            </Td>
                            <Td isNumeric>
                              <Text 
                                fontSize={{ base: "xs", md: "sm" }} 
                                fontWeight="semibold"
                                color={tx.isFutureInstallment ? 'var(--pb-ink-faint)' : (tx.type === 'INCOME' ? 'var(--pb-income-2)' : 'var(--pb-coral)')}
                                fontStyle={tx.isFutureInstallment ? "italic" : "normal"}
                                whiteSpace="nowrap"
                              >
                                £{tx.amount.toFixed(2)}
                                {tx.isFutureInstallment && " (future)"}
                              </Text>
                            </Td>
                            <Td>
                              {tx.id && !tx.isFutureInstallment && (
                                <HStack spacing={0}>
                                  <IconButton
                                    aria-label="Edit transaction"
                                    icon={<EditIcon />}
                                    size={{ base: "xs", md: "sm" }}
                                    variant="ghost"
                                    color="var(--pb-forest-2)"
                                    _hover={{ bg: 'var(--pb-tint-green)', color: 'var(--pb-forest)' }}
                                    onClick={() => {
                                      setTransactionToEdit(tx)
                                      setIsEditModalOpen(true)
                                    }}
                                  />
                                  <IconButton
                                    aria-label="Delete transaction"
                                    icon={<DeleteIcon />}
                                    size={{ base: "xs", md: "sm" }}
                                    variant="ghost"
                                    color="var(--pb-coral)"
                                    _hover={{ bg: 'var(--pb-tint-coral)', color: 'var(--pb-coral-2)' }}
                                    onClick={() => openDeleteDialog(tx)}
                                  />
                                </HStack>
                              )}
                            </Td>
                          </Tr>
                          )
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </Collapse>
            </Box>
          )
        })}
      </VStack>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Flex
          justify="space-between"
          align="center"
          mt={8}
          pt={5}
          borderTop="1px solid"
          borderColor={paginationBorderColor}
          flexDirection={{ base: 'column', md: 'row' }}
          gap={{ base: 4, md: 0 }}
        >
          {/* Items per page selector */}
          <HStack spacing={2}>
            <Text fontSize="xs" fontWeight="500" color="var(--pb-ink-soft)">
              Show
            </Text>
            <Select
              size="xs"
              w="110px"
              borderRadius="lg"
              value={pageSize}
              onChange={handlePageSizeChange}
              bg={paginationBg}
              borderColor={paginationBorderColor}
              fontSize="xs"
              fontWeight="600"
              color="var(--pb-ink)"
              _focus={{ borderColor: 'var(--pb-forest-2)', boxShadow: 'none' }}
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
            </Select>
            <Text fontSize="xs" fontWeight="500" color="var(--pb-ink-soft)">
              per page
            </Text>
          </HStack>

          {/* Page Info */}
          <Text fontSize="xs" fontWeight="500" color="var(--pb-ink-soft)">
            Showing {Math.min((activePage - 1) * pageSize + 1, totalItems)} to{' '}
            {Math.min(activePage * pageSize, totalItems)} of {totalItems} months
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
              color="var(--pb-ink-soft)"
              borderColor={paginationBorderColor}
              _hover={{ bg: pageBtnHover, color: 'var(--pb-ink)' }}
            />

            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <Text key={`ellipsis-${index}`} px={2} fontSize="sm" color="var(--pb-ink-faint)">
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
                  onClick={() => setCurrentPage(page as number)}
                  borderRadius="lg"
                  fontSize="xs"
                  fontWeight="bold"
                  h="32px"
                  w="32px"
                  p={0}
                  bg={isPageActive ? pageActiveBg : pageBtnBg}
                  color={isPageActive ? pageActiveColor : 'var(--pb-ink-soft)'}
                  borderColor={paginationBorderColor}
                  _hover={isPageActive
                    ? { bg: 'var(--pb-forest)' }
                    : { bg: pageBtnHover, color: 'var(--pb-ink)' }}
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
              color="var(--pb-ink-soft)"
              borderColor={paginationBorderColor}
              _hover={{ bg: pageBtnHover, color: 'var(--pb-ink)' }}
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
)

export default TransactionListGrouped
