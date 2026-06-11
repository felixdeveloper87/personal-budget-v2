import { memo, useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Skeleton,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { AlertCircle, ListFilter, RefreshCw } from '../ui/icons'
import { Transaction } from '../../types'
import { searchTransactions } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import SearchSummaryHeader from './SearchSummaryHeader'
import CategoryResultsList from './CategoryResultsList'
import { SearchResultsModalProps } from '../../types'
import { ModalHeader, PremiumModal } from '../ui'
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
  const skeletonStart = useColorModeValue('gray.100', 'whiteAlpha.80')
  const skeletonEnd = useColorModeValue('gray.200', 'whiteAlpha.150')
  const skeletonCardBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const skeletonCardBorder = useColorModeValue('gray.150', 'whiteAlpha.100')

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
        <ModalHeader
          icon={ListFilter}
          title="Results"
          caption={
            isLoading
              ? 'Searching…'
              : error
                ? 'Could not load results'
                : transactions.length === 1
                  ? '1 transaction found'
                  : `${transactions.length} transactions found`
          }
          onClose={onClose}
          accent="blue"
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box
        flex="1"
        minH="0"
        bg={surfaceBg}
        px={{ base: 4, sm: 6 }}
        py={{ base: 5, sm: 6 }}
        overflowX="hidden"
        overflowY="auto"
        sx={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
        }}
      >
        {!isLoading && !error && <SearchSummaryHeader searchFilters={searchFilters} />}
        {isLoading ? (
          <VStack spacing={3} align="stretch" w="full">
            {/* Summary pills skeleton */}
            <HStack spacing={2}>
              <Skeleton h="28px" w="90px" borderRadius="full" startColor={skeletonStart} endColor={skeletonEnd} />
              <Skeleton h="28px" w="90px" borderRadius="full" startColor={skeletonStart} endColor={skeletonEnd} />
              <Skeleton h="28px" w="70px" borderRadius="full" startColor={skeletonStart} endColor={skeletonEnd} />
            </HStack>
            {/* Header row skeleton */}
            <HStack justify="space-between">
              <Skeleton h="18px" w="80px" borderRadius="md" startColor={skeletonStart} endColor={skeletonEnd} />
              <Skeleton h="28px" w="90px" borderRadius="lg" startColor={skeletonStart} endColor={skeletonEnd} />
            </HStack>
            {/* Category card skeletons */}
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                bg={skeletonCardBg}
                border="1px solid"
                borderColor={skeletonCardBorder}
                borderRadius="xl"
                overflow="hidden"
              >
                <HStack px={4} pl={5} py={3} spacing={3}>
                  <Skeleton w={9} h={9} borderRadius="lg" startColor={skeletonStart} endColor={skeletonEnd} />
                  <VStack align="start" spacing={1.5} flex={1}>
                    <Skeleton h="14px" w={`${60 + i * 15}px`} borderRadius="md" startColor={skeletonStart} endColor={skeletonEnd} />
                    <Skeleton h="11px" w="80px" borderRadius="md" startColor={skeletonStart} endColor={skeletonEnd} />
                  </VStack>
                  <Skeleton h="16px" w="64px" borderRadius="md" startColor={skeletonStart} endColor={skeletonEnd} />
                </HStack>
              </Box>
            ))}
          </VStack>
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
