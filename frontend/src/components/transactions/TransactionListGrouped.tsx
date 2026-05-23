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
  useColorModeValue,
  Icon,
  Tooltip,
  Flex,
  Select,
} from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { FiCreditCard } from 'react-icons/fi'
import { Transaction } from '../../types'
import { useMemo, useState, useEffect } from 'react'
import { formatDateBR, formatTransactionDateTime } from '../../utils/dateTime'
import { DeleteTransactionDialog } from '../ui'
import { useDeleteTransaction } from '../../hooks/useDeleteTransaction'
import { normalizeInstallmentDescription } from '../../utils/installments'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from '../ui/icons'
import EditTransactionModal from './EditTransactionModal'

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
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const monthGroups = useMemo(() => {
    const groups: Record<string, MonthGroup> = {}

    transactions.forEach(transaction => {
      const date = new Date(transaction.paymentDate || transaction.dateTime)
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
      group.transactions.sort((a, b) => new Date(b.paymentDate || b.dateTime).getTime() - new Date(a.paymentDate || a.dateTime).getTime())
    })

    // Sort groups by month (newest first)
    return Object.values(groups).sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  }, [transactions])

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
  useEffect(() => {
    setHasInitializedPage(false)
  }, [transactions.length])

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

  const borderColor = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.04)')
  const headerBg = useColorModeValue('transparent', 'transparent')
  const textColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400')
  
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
      {/* Top Action Buttons */}
      <HStack justify="space-between" mb={5} align="center">
        <Box>
          {currentMonthIndex !== -1 && (
            <Button
              size="sm"
              variant="link"
              colorScheme="blue"
              onClick={goToCurrentMonth}
              fontSize="xs"
              fontWeight="700"
              _hover={{ textDecoration: 'none', color: 'blue.400' }}
            >
              Jump to Current Month
            </Button>
          )}
        </Box>
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={ChevronDown} boxSize={4} weight="bold" />}
            onClick={expandAll}
            borderRadius="lg"
            fontSize="xs"
            fontWeight="700"
            color={useColorModeValue('gray.600', 'gray.400')}
            _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100'), color: useColorModeValue('gray.900', 'white') }}
          >
            Expand All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={ChevronUp} boxSize={4} weight="bold" />}
            onClick={collapseAll}
            borderRadius="lg"
            fontSize="xs"
            fontWeight="700"
            color={useColorModeValue('gray.600', 'gray.400')}
            _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100'), color: useColorModeValue('gray.900', 'white') }}
          >
            Collapse All
          </Button>
        </HStack>
      </HStack>

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
                ? useColorModeValue('blue.400', 'rgba(59, 130, 246, 0.4)') 
                : borderColor}
              borderRadius="xl"
              overflow="hidden"
              bg={useColorModeValue('white', 'linear-gradient(135deg, rgba(23, 23, 28, 0.7) 0%, rgba(15, 15, 20, 0.4) 100%)')}
              boxShadow={isCurrentMonth
                ? useColorModeValue('0 4px 20px -2px rgba(59, 130, 246, 0.12)', '0 4px 20px -8px rgba(59, 130, 246, 0.35)')
                : useColorModeValue('0 4px 18px -4px rgba(15, 23, 42, 0.05)', '0 4px 20px -8px rgba(0, 0, 0, 0.3)')}
              transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: isCurrentMonth
                  ? useColorModeValue('0 12px 24px -10px rgba(59, 130, 246, 0.25)', '0 12px 30px -10px rgba(59, 130, 246, 0.6)')
                  : useColorModeValue('0 12px 24px -10px rgba(15, 23, 42, 0.1)', '0 12px 30px -10px rgba(0, 0, 0, 0.6)'),
                borderColor: useColorModeValue('blue.500', 'rgba(59, 130, 246, 0.6)'),
              }}
            >
              {/* Month Header */}
              <Box
                bg={headerBg}
                p={{ base: 4, md: 5 }}
                cursor="pointer"
                onClick={() => toggleMonth(group.monthKey)}
                transition="background-color 0.2s ease"
                _hover={{ bg: useColorModeValue('gray.50/50', 'whiteAlpha.50') }}
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
                        <Text as="span" fontWeight="500" color="gray.500">
                          {mYear}
                        </Text>
                      </Text>
                      <Text fontSize="xs" color="gray.500" fontWeight="500" flexShrink={0}>
                        • {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'}
                      </Text>
                      {isCurrentMonth && (
                        <Badge
                          colorScheme="blue"
                          variant="subtle"
                          fontSize="3xs"
                          px={2}
                          py={0.2}
                          borderRadius="full"
                          fontWeight="700"
                          textTransform="uppercase"
                          letterSpacing="0.05em"
                          bg={useColorModeValue('blue.50', 'rgba(59, 130, 246, 0.12)')}
                          color={useColorModeValue('blue.600', 'blue.300')}
                          border="1px solid"
                          borderColor={useColorModeValue('blue.100', 'rgba(59, 130, 246, 0.25)')}
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
                      color="gray.500"
                      align="center"
                    >
                      <Text color={useColorModeValue('green.600', 'green.400')}>
                        In: £{group.totalIncome.toFixed(0)}
                      </Text>
                      <Text opacity={0.3} fontSize="xs">•</Text>
                      <Text color={useColorModeValue('red.600', 'red.400')}>
                        Out: £{group.totalExpense.toFixed(0)}
                      </Text>
                      <Text opacity={0.3} fontSize="xs">•</Text>
                      <Text color={group.netAmount >= 0 ? 'green.500' : 'red.500'} fontWeight="700">
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
                          bg={useColorModeValue('green.50', 'rgba(74, 222, 128, 0.1)')}
                          color={useColorModeValue('green.600', 'green.400')}
                          flexShrink={0}
                        >
                          <Icon as={TrendingUp} weight="bold" boxSize={3.5} />
                        </Box>
                        <VStack spacing={0} align="start">
                          <Text fontSize="3xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" lineHeight={1}>
                            Income
                          </Text>
                          <Text fontSize="sm" fontWeight="700" color={useColorModeValue('gray.800', 'whiteAlpha.900')}>
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
                          bg={useColorModeValue('red.50', 'rgba(248, 113, 113, 0.1)')}
                          color={useColorModeValue('red.600', 'red.400')}
                          flexShrink={0}
                        >
                          <Icon as={TrendingDown} weight="bold" boxSize={3.5} />
                        </Box>
                        <VStack spacing={0} align="start">
                          <Text fontSize="3xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" lineHeight={1}>
                            Expense
                          </Text>
                          <Text fontSize="sm" fontWeight="700" color={useColorModeValue('gray.800', 'whiteAlpha.900')}>
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
                          ? useColorModeValue('green.50', 'rgba(74, 222, 128, 0.08)') 
                          : useColorModeValue('red.50', 'rgba(248, 113, 113, 0.08)')}
                        border="1px solid"
                        borderColor={group.netAmount >= 0 
                          ? useColorModeValue('green.100', 'rgba(74, 222, 128, 0.15)') 
                          : useColorModeValue('red.100', 'rgba(248, 113, 113, 0.15)')}
                        w={{ sm: "115px", md: "145px" }}
                        flexShrink={0}
                        textAlign="center"
                      >
                        <Text fontSize="3xs" fontWeight="700" color={group.netAmount >= 0 ? 'green.500' : 'red.500'} textTransform="uppercase" letterSpacing="0.05em" mb={0.5} lineHeight={1}>
                          Net Balance
                        </Text>
                        <Text 
                          fontSize="sm" 
                          fontWeight="800" 
                          color={group.netAmount >= 0 
                            ? useColorModeValue('green.700', 'green.300') 
                            : useColorModeValue('red.700', 'red.300')}
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
                      color={useColorModeValue('gray.400', 'gray.500')}
                      p={1.5}
                      borderRadius="full"
                      bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
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
                  borderColor={useColorModeValue('gray.100', 'rgba(255, 255, 255, 0.04)')}
                  bg={useColorModeValue('rgba(252, 253, 255, 0.3)', 'rgba(10, 10, 12, 0.15)')}
                  px={{ base: 2, sm: 3, md: 5 }}
                  py={{ base: 3, sm: 4, md: 5 }}
                >
                  <TableContainer>
                    <Table 
                      variant="simple" 
                      size="sm"
                      sx={{
                        'th, td': {
                          borderColor: useColorModeValue('gray.100', 'rgba(255,255,255,0.03)'),
                          padding: { base: '8px 4px', md: '12px 8px' }
                        }
                      }}
                    >
                      <Thead>
                        <Tr>
                          <Th fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">Date & Time</Th>
                          <Th fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">Type</Th>
                          <Th fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">Category</Th>
                          <Th fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">Description</Th>
                          <Th isNumeric fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">Amount</Th>
                          <Th fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em" w="80px">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {group.transactions.map((tx) => (
                          <Tr key={tx.id} _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}>
                            <Td>
                              <VStack spacing={1} align="start">
                                <Text fontSize="sm" fontWeight="600" color={textColor}>
                                  {formatTransactionDateTime(tx.dateTime).date}
                                </Text>
                                <Text fontSize="xs" color="gray.500" fontWeight="500">
                                  {formatTransactionDateTime(tx.dateTime).time}
                                </Text>
                                {tx.paymentDate && tx.paymentDate !== (tx.transactionDate || tx.dateTime.slice(0, 10)) && (
                                  <Text fontSize="xs" color="blue.500">
                                    Paid {formatDateBR(tx.paymentDate)}
                                  </Text>
                                )}
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
                                <Text 
                                  fontSize="sm" 
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
                                        fontSize="sm" 
                                      />
                                    </span>
                                  </Tooltip>
                                )}
                              </HStack>
                            </Td>
                            <Td isNumeric>
                              <Text 
                                fontSize="sm" 
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
                                    size="sm"
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
                                    size="sm"
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
            <Text fontSize="xs" fontWeight="500" color="gray.500">
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
              _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
            </Select>
            <Text fontSize="xs" fontWeight="500" color="gray.500">
              per page
            </Text>
          </HStack>

          {/* Page Info */}
          <Text fontSize="xs" fontWeight="500" color="gray.500">
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
