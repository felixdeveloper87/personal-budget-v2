import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  Box,
  useColorModeValue,
  Spinner,
  Center,
  Text,
  Icon,
  Button,
  HStack
} from '@chakra-ui/react'
import { memo, useMemo, useState, useEffect, useCallback } from 'react'
import { Transaction } from '../../types'
import { searchTransactions } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import { X, AlertCircle, RefreshCw } from 'lucide-react'
import SearchSummaryHeader from './SearchSummaryHeader'
import CategoryResultsList from './CategoryResultsList'

interface SearchResultsModalProps {
  isOpen: boolean
  onClose: () => void
  searchFilters: {
    text: string
    type: 'income' | 'expense' | null
    category: string
    startDate: string
    endDate: string
  }
  user?: {
    id: number
    name: string
    email: string
    token: string
  }
}

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

  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  // Memoized calculations for performance
  // Single pass through transactions to calculate totals (more efficient than multiple filters)
  // Note: Backend already filters by search criteria, so we only need to separate by type for totals
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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size={{ base: 'full', sm: 'lg', md: 'xl' }} 
      isCentered
      scrollBehavior="inside"
      closeOnOverlayClick={false}
      closeOnEsc={true}
      blockScrollOnMount={true}
    >
      <ModalOverlay 
        bg="blackAlpha.600" 
        backdropFilter="blur(10px)"
      />
      <ModalContent 
        borderRadius={{ base: 'none', sm: '3xl' }}
        overflow="hidden"
        maxH={{ base: '100vh', sm: '90vh' }}
        m={{ base: 0, sm: 4 }}
        sx={{
          // Safe area support for iPhone 14 Pro
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Decorative background */}
        <Box
          position="absolute"
          top="-50px"
          left="-50px"
          right="-50px"
          height="200px"
          background={useColorModeValue(
            'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
            'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(16, 185, 129, 0.2) 100%)'
          )}
          borderRadius="3xl"
          filter="blur(40px)"
          opacity={0.6}
          zIndex={0}
        />
        
        {/* Main card with glassmorphism */}
        <Box
          position="relative"
          bg={useColorModeValue(
            'rgba(255, 255, 255, 0.95)',
            'rgba(17, 17, 17, 0.95)'
          )}
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={useColorModeValue(
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.1)'
          )}
          borderRadius={{ base: 'none', sm: '3xl' }}
          shadow="2xl"
          overflow="hidden"
          w="full"
          h="full"
          sx={{
            animation: 'slideIn 0.6s ease-out',
            '@keyframes slideIn': {
              from: { 
                opacity: 0, 
                transform: 'translateY(20px) scale(0.95)' 
              },
              to: { 
                opacity: 1, 
                transform: 'translateY(0) scale(1)' 
              }
            }
          }}
        >
          {/* Animated top bar */}
          <Box
            height="4px"
            background="linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981, #f59e0b, #ef4444)"
            backgroundSize="300% 100%"
            sx={{
              animation: 'shimmer 4s ease-in-out infinite',
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '-200% 0' },
                '100%': { backgroundPosition: '200% 0' }
              }
            }}
          />
          
          {/* Close Button */}
          <Button
            position="absolute"
            top={{ base: 4, sm: 5, md: 6 }}
            right={{ base: 4, sm: 5, md: 6 }}
            size="lg"
            variant="ghost"
            onClick={onClose}
            borderRadius="full"
            p={3}
            bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(15, 23, 42, 0.8)')}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={useColorModeValue('gray.300', 'gray.600')}
            _hover={{
              bg: useColorModeValue('red.50', 'red.900'),
              borderColor: 'red.300',
              transform: 'scale(1.1)',
              boxShadow: 'lg',
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            transition="all 0.2s ease"
            zIndex={10}
            boxShadow="md"
          >
            <Icon as={X} boxSize={5} color={useColorModeValue('gray.700', 'gray.200')} />
          </Button>

          {/* Content */}
          <Box 
            flex="1" 
            p={{ base: 4, sm: 5, md: 6 }}
            overflowY="auto"
            sx={{
              // Safe area support for iPhone 14 Pro
              paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
              paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
              paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
              // Smooth scroll for iPhone
              WebkitOverflowScrolling: 'touch',
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
                {/* Summary Header */}
                <SearchSummaryHeader
                  searchFilters={searchFilters}
                />

                {/* Results List */}
                <CategoryResultsList
                  transactions={transactions}
                  searchFilters={searchFilters}
                />
              </VStack>
            )}
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  )
})

export default SearchResultsModal