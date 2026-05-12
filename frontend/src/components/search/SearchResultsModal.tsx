import { memo, useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Center,
  Icon,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { AlertCircle, RefreshCw } from '../ui/icons'
import { Transaction } from '../../types'
import { searchTransactions } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import SearchSummaryHeader from './SearchSummaryHeader'
import CategoryResultsList from './CategoryResultsList'
import { SearchResultsModalProps } from '../../types'
import { PremiumModal } from '../ui'
import { ToastService } from '../../services/toast'

const SearchResultsModal = memo(function SearchResultsModal({
  isOpen,
  onClose,
  searchFilters,
  user: propUser,
}: SearchResultsModalProps) {
  const { user: contextUser } = useAuth()
  const user = propUser || contextUser
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const subtleText = useColorModeValue('gray.500', 'gray.400')
  const errorText = useColorModeValue('gray.700', 'gray.300')
  const spinnerEmpty = useColorModeValue('gray.200', 'whiteAlpha.200')

  const performSearch = useCallback(async () => {
    if (!user?.token) return

    setIsLoading(true)
    setError(null)

    try {
      const searchParams = {
        text: searchFilters.text || undefined,
        type: searchFilters.type || undefined,
        category: searchFilters.category || undefined,
        startDate: searchFilters.startDate || undefined,
        endDate: searchFilters.endDate || undefined,
      }
      const results = await searchTransactions(searchParams)
      setTransactions(results)
    } catch (err) {
      console.error('Search error:', err)
      ToastService.apiError(err, {
        title: 'Could not load search results',
        dedupeKey: 'search-results-load-failed',
      })
      setError('We could not load your transactions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [user?.token, searchFilters])

  useEffect(() => {
    if (isOpen && user?.token) {
      performSearch()
    }
  }, [isOpen, user?.token, performSearch])

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
          resultCount={isLoading || error ? undefined : transactions.length}
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box
        flex="1"
        bg={surfaceBg}
        px={{ base: 4, sm: 6 }}
        py={{ base: 5, sm: 6 }}
        overflowY="auto"
      >
        {isLoading ? (
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner
                size="lg"
                color="blue.500"
                thickness="3px"
                emptyColor={spinnerEmpty}
              />
              <Text color={subtleText} fontSize="sm">
                Searching transactions…
              </Text>
            </VStack>
          </Center>
        ) : error ? (
          <Center py={16}>
            <VStack spacing={5} maxW="sm" textAlign="center">
              <Icon as={AlertCircle} boxSize={10} color="red.400" />
              <VStack spacing={1}>
                <Text fontSize="md" fontWeight={600} color={errorText}>
                  Something went wrong
                </Text>
                <Text color={subtleText} fontSize="sm">
                  {error}
                </Text>
              </VStack>
              <Button
                leftIcon={<Icon as={RefreshCw} boxSize={4} />}
                onClick={handleRetry}
                size="sm"
                variant="outline"
                borderRadius="lg"
              >
                Try again
              </Button>
            </VStack>
          </Center>
        ) : (
          <CategoryResultsList transactions={transactions} searchFilters={searchFilters} />
        )}
      </Box>
    </PremiumModal>
  )
})

export default SearchResultsModal
