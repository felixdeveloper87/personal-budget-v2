import {
  Box,
  VStack,
  useColorModeValue,
  Spinner,
  Center,
  Text,
  Icon,
  Button
} from '@chakra-ui/react'
import { memo, useMemo, useState, useEffect, useCallback } from 'react'
import { Transaction } from '../../types'
import { searchTransactions } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import { AlertCircle, RefreshCw } from 'lucide-react'
import SearchSummaryHeader from './SearchSummaryHeader'
import CategoryResultsList from './CategoryResultsList'
import { SearchResultsModalProps } from '../../types'
import { getGradients, safeAreaStyles, safariStyles, getResponsiveStyles, getScrollbarStyles, PremiumModal } from '../ui'

const SearchResultsModal = memo(function SearchResultsModal({
  isOpen,
  onClose,
  searchFilters,
  user: propUser
}: SearchResultsModalProps) {
  const { user: contextUser } = useAuth()
  const user = propUser || contextUser
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gradients = getGradients()
  const responsiveStyles = getResponsiveStyles()
  const scrollbarStyles = getScrollbarStyles(useColorModeValue)
  const textColor = useColorModeValue('gray.600', 'gray.400')

  // Memoized calculations for performance
  const summaryData = useMemo(() => {
    let totalIncome = 0
    let totalExpense = 0

    for (const transaction of transactions) {
      if (transaction.type === 'INCOME') {
        totalIncome += transaction.amount
      } else if (transaction.type === 'EXPENSE') {
        totalExpense += transaction.amount
      }
    }

    const netAmount = totalIncome - totalExpense
    const totalTransactions = transactions.length

    return {
      totalIncome,
      totalExpense,
      netAmount,
      totalTransactions
    }
  }, [transactions])

  // Search function with error handling
  const performSearch = useCallback(async () => {
    if (!(user as any)?.userId) return

    setIsLoading(true)
    setError(null)

    try {
      const searchParams = {
        text: searchFilters.text || undefined,
        type: searchFilters.type || undefined,
        category: searchFilters.category || undefined,
        startDate: searchFilters.startDate || undefined,
        endDate: searchFilters.endDate || undefined
      }

      const results = await searchTransactions(searchParams)
      setTransactions(results)
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search transactions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [(user as any)?.userId, searchFilters])

  // Effect to trigger search when modal opens or filters change
  useEffect(() => {
    if (isOpen && (user as any)?.userId) {
      performSearch()
    }
  }, [isOpen, (user as any)?.userId, performSearch])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTransactions([])
      setError(null)
    }
  }, [isOpen])

  const handleRetry = useCallback(() => {
    performSearch()
  }, [performSearch])

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
      header={
        <SearchSummaryHeader
          searchFilters={searchFilters}
          onClose={onClose}
        />
      }
      contentProps={{
        bg: useColorModeValue(
          'rgba(255, 255, 255, 0.95)',
          'rgba(17, 17, 17, 0.95)'
        ),
        backdropFilter: "blur(20px)",
        border: "1px solid",
        borderColor: useColorModeValue(
          'rgba(255, 255, 255, 0.2)',
          'rgba(255, 255, 255, 0.1)'
        )
      }}
    >
      {/* Decorative background */}
      <Box
        position="absolute"
        top="-50px"
        left="-50px"
        right="-50px"
        height="200px"
        background={gradients.decorative}
        borderRadius="3xl"
        filter="blur(40px)"
        opacity={0.6}
        zIndex={0}
        pointerEvents="none"
      />

      {/* Content */}
      <Box
        flex="1"
        p={responsiveStyles.spacing.container}
        overflowY="auto"
        {...responsiveStyles.content}
        sx={{
          ...safeAreaStyles.content,
          ...safariStyles.scrollable,
          ...scrollbarStyles,
          position: 'relative',
          zIndex: 1
        }}
      >
        {isLoading ? (
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text color={textColor} fontSize="lg">
                Searching transactions...
              </Text>
            </VStack>
          </Center>
        ) : error ? (
          <Center py={20}>
            <VStack spacing={6}>
              <Icon as={AlertCircle} boxSize={16} color="red.500" />
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  Search Failed
                </Text>
                <Text color={textColor} textAlign="center">
                  {error}
                </Text>
              </VStack>
              <Button
                leftIcon={<Icon as={RefreshCw} boxSize={4} />}
                colorScheme="blue"
                onClick={handleRetry}
                size="lg"
              >
                Try Again
              </Button>
            </VStack>
          </Center>
        ) : (
          <VStack spacing={6} align="stretch">
            {/* Results List */}
            <CategoryResultsList
              transactions={transactions}
              searchFilters={searchFilters}
            />
          </VStack>
        )}
      </Box>
    </PremiumModal>
  )
})

export default SearchResultsModal