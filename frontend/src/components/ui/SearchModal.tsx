import { useState, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  VStack, HStack, Input, InputGroup, InputLeftElement, Button, useColorModeValue, 
  Text, Wrap, WrapItem, Box, Icon, Flex, Heading, Badge, Card, CardBody
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { Search, Sparkles, Filter, Calendar, Tag } from 'lucide-react'
import SearchResultsModal from './SearchResultsModal'
import { useSearch } from '../../contexts/SearchContext'

// 🎨 Animações personalizadas
const shimmer = 'shimmer 4s ease-in-out infinite'
const slideIn = 'slideIn 0.6s ease-out'
const glow = 'glow 3s ease-in-out infinite'
const float = 'float 3s ease-in-out infinite'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (filters: {
    text: string
    type: 'income' | 'expense' | null
    category: string
    startDate: string
    endDate: string
  }) => void
}

export default function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [text, setText] = useState('')
  const [type, setType] = useState<'income' | 'expense' | null>(null)
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    text: '',
    type: null as 'income' | 'expense' | null,
    category: '',
    startDate: '',
    endDate: ''
  })
  
  const { results } = useSearch()

  // Predefined categories
  const incomeCategories = [
    'Salary', 'Freelance', 'Investments', 'Business', 'Rental', 'Bonus', 'Refund', 'Others'
  ]
  
  const expenseCategories = [
    'Groceries', 'Rent', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Shopping', 'Others'
  ]

  const allCategories = [...incomeCategories, ...expenseCategories]

  useEffect(() => {
    if (!isOpen) {
      resetFilters()
    }
  }, [isOpen])

  const resetFilters = () => {
    setText('')
    setType(null)
    setCategory('')
    setStartDate('')
    setEndDate('')
    setShowResults(false)
    setSearchFilters({
      text: '',
      type: null,
      category: '',
      startDate: '',
      endDate: ''
    })
  }

  const handleTypeChange = (newType: 'income' | 'expense' | null) => {
    setType(newType)
    // Clear category when type changes to avoid inconsistencies
    setCategory('')
  }

  const handleSearch = () => {
    const filters = { text, type, category, startDate, endDate }
    setSearchFilters(filters)
    setShowResults(true)
    // Não chama onSearch aqui para não interferir com AllTransactions
    // onSearch(filters)
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size={{ base: 'full', sm: 'lg', md: 'xl' }} 
      isCentered
      scrollBehavior="inside"
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
          // Safe area support para iPhone 14 Pro
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Background decorativo */}
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
        
        {/* Card principal com glassmorphism */}
        <Card
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
            animation: slideIn,
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
          {/* Barra superior animada */}
          <Box
            height="4px"
            background="linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981, #f59e0b, #ef4444)"
            backgroundSize="300% 100%"
            sx={{
              animation: shimmer,
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '-200% 0' },
                '100%': { backgroundPosition: '200% 0' }
              }
            }}
          />
          
          <CardBody p={0}>
            <VStack spacing={0} align="stretch" h="full">
              {/* Header moderno */}
              <Box 
                p={{ base: 4, sm: 5, md: 6 }} 
                borderBottom="1px" 
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                position="relative"
              >
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align="center"
                  justify="space-between"
                  gap={4}
                >
                  <HStack spacing={4} align="center">
                    <Box
                      p={3}
                      borderRadius="2xl"
                      bg={useColorModeValue(
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        'linear-gradient(135deg, #60a5fa, #3b82f6)'
                      )}
                      boxShadow="lg"
                      sx={{
                        animation: glow,
                        '@keyframes glow': {
                          '0%, 100%': { 
                            boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' 
                          },
                          '50%': { 
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)' 
                          }
                        }
                      }}
                    >
                      <Icon as={Search} boxSize={6} color="white" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading
                        size="lg"
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #1e293b, #475569)',
                          'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                        )}
                        bgClip="text"
                        fontWeight="800"
                      >
                        Search Transactions
                      </Heading>
                      <Text
                        fontSize="sm"
                        color={useColorModeValue('gray.600', 'gray.300')}
                        fontWeight="500"
                      >
                        Find your transactions quickly
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={2}>
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      borderRadius="full"
                      px={4}
                      py={2}
                      fontSize="sm"
                      fontWeight="600"
                      bg={useColorModeValue(
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        'linear-gradient(135deg, #60a5fa, #3b82f6)'
                      )}
                      boxShadow="md"
                    >
                      <HStack spacing={2}>
                        <Icon as={Filter} boxSize={3} />
                        <Text>Filters</Text>
                      </HStack>
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onClose}
                      borderRadius="full"
                      p={2}
                      _hover={{
                        bg: useColorModeValue('gray.100', 'gray.700'),
                        transform: 'scale(1.1)',
                      }}
                      transition="all 0.2s"
                    >
                      <Icon as={Search} boxSize={4} />
                    </Button>
                  </HStack>
                </Flex>
              </Box>

              {/* Conteúdo do modal */}
              <Box 
                flex="1" 
                p={{ base: 4, sm: 5, md: 6 }}
                overflowY="auto"
                sx={{
                  // Safe area support para iPhone 14 Pro
                  paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
                  paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
                }}
              >
                <VStack spacing={{ base: 6, md: 8 }} align="stretch">
                  {/* Campo de busca principal */}
                  <Box>
                    <Text 
                      fontSize="sm" 
                      fontWeight="600" 
                      color={useColorModeValue('gray.700', 'gray.200')}
                      mb={3}
                    >
                      Search by description
                    </Text>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={Search} color={useColorModeValue('gray.400', 'gray.500')} />
                      </InputLeftElement>
                      <Input
                        placeholder="Type to search transactions..."
                        borderRadius="2xl"
                        bg={useColorModeValue('gray.50', 'gray.800')}
                        border="2px solid"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        }}
                        _hover={{
                          borderColor: useColorModeValue('gray.300', 'gray.500'),
                        }}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        fontSize={{ base: 'md', sm: 'sm' }}
                        h={{ base: '48px', sm: '44px' }}
                      />
                    </InputGroup>
                  </Box>

                  {/* Filtros de tipo */}
                  <Box>
                    <Text 
                      fontSize="sm" 
                      fontWeight="600" 
                      color={useColorModeValue('gray.700', 'gray.200')}
                      mb={3}
                    >
                      Transaction Type
                    </Text>
                    <HStack spacing={3}>
                      <Button
                        flex={1}
                        variant={type === 'income' ? 'solid' : 'outline'}
                        colorScheme="green"
                        borderRadius="2xl"
                        h={{ base: '48px', sm: '44px' }}
                        fontSize={{ base: 'md', sm: 'sm' }}
                        fontWeight="600"
                        bg={type === 'income' ? 
                          useColorModeValue('green.500', 'green.600') : 
                          'transparent'
                        }
                        borderColor={useColorModeValue('green.300', 'green.600')}
                        color={type === 'income' ? 'white' : useColorModeValue('green.600', 'green.400')}
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg',
                        }}
                        onClick={() => handleTypeChange(type === 'income' ? null : 'income')}
                      >
                        <HStack spacing={2}>
                          <Icon as={Sparkles} boxSize={4} />
                          <Text>Income</Text>
                        </HStack>
                      </Button>
                      <Button
                        flex={1}
                        variant={type === 'expense' ? 'solid' : 'outline'}
                        colorScheme="red"
                        borderRadius="2xl"
                        h={{ base: '48px', sm: '44px' }}
                        fontSize={{ base: 'md', sm: 'sm' }}
                        fontWeight="600"
                        bg={type === 'expense' ? 
                          useColorModeValue('red.500', 'red.600') : 
                          'transparent'
                        }
                        borderColor={useColorModeValue('red.300', 'red.600')}
                        color={type === 'expense' ? 'white' : useColorModeValue('red.600', 'red.400')}
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg',
                        }}
                        onClick={() => handleTypeChange(type === 'expense' ? null : 'expense')}
                      >
                        <HStack spacing={2}>
                          <Icon as={Filter} boxSize={4} />
                          <Text>Expense</Text>
                        </HStack>
                      </Button>
                    </HStack>
                  </Box>

                  {/* Filtros de categoria */}
                  {type && (
                    <Box>
                      <Text 
                        fontSize="sm" 
                        fontWeight="600" 
                        color={useColorModeValue('gray.700', 'gray.200')}
                        mb={3}
                      >
                        <HStack spacing={2}>
                          <Icon as={Tag} boxSize={4} />
                          <Text>Category</Text>
                        </HStack>
                      </Text>
                      <Wrap spacing={2}>
                        {(type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                          <WrapItem key={cat}>
                            <Button
                              size={{ base: 'md', sm: 'sm' }}
                              variant={category === cat ? 'solid' : 'outline'}
                              colorScheme={category === cat ? 'blue' : 'gray'}
                              borderRadius="full"
                              h={{ base: '40px', sm: '36px' }}
                              px={{ base: 4, sm: 3 }}
                              fontSize={{ base: 'sm', sm: 'xs' }}
                              fontWeight="600"
                              bg={category === cat ? 
                                useColorModeValue('blue.500', 'blue.600') : 
                                'transparent'
                              }
                              borderColor={useColorModeValue('gray.300', 'gray.600')}
                              color={category === cat ? 'white' : useColorModeValue('gray.700', 'gray.300')}
                              onClick={() => setCategory(category === cat ? '' : cat)}
                              _hover={{
                                transform: 'scale(1.05)',
                                boxShadow: 'md',
                                bg: category === cat ? 
                                  useColorModeValue('blue.600', 'blue.500') : 
                                  useColorModeValue('gray.100', 'gray.700')
                              }}
                              transition="all 0.2s"
                            >
                              {cat}
                            </Button>
                          </WrapItem>
                        ))}
                      </Wrap>
                      {category && (
                        <Box
                          mt={4}
                          p={4}
                          bg={useColorModeValue('blue.50', 'blue.900')}
                          borderRadius="2xl"
                          border="2px solid"
                          borderColor={useColorModeValue('blue.200', 'blue.700')}
                        >
                          <HStack justify="space-between">
                            <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.200')} fontWeight="600">
                              Selected: <strong>{category}</strong>
                            </Text>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              borderRadius="full"
                              onClick={() => setCategory('')}
                              _hover={{
                                bg: useColorModeValue('blue.100', 'blue.800'),
                                transform: 'scale(1.1)',
                              }}
                            >
                              Clear
                            </Button>
                          </HStack>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Filtros de data */}
                  <Box>
                    <Text 
                      fontSize="sm" 
                      fontWeight="600" 
                      color={useColorModeValue('gray.700', 'gray.200')}
                      mb={3}
                    >
                      <HStack spacing={2}>
                        <Icon as={Calendar} boxSize={4} />
                        <Text>Date Range</Text>
                      </HStack>
                    </Text>
                    <HStack spacing={3}>
                      <Box flex={1}>
                        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} mb={1}>
                          From
                        </Text>
                        <Input
                          type="date"
                          borderRadius="2xl"
                          h={{ base: '48px', sm: '44px' }}
                          fontSize={{ base: 'md', sm: 'sm' }}
                          bg={useColorModeValue('gray.50', 'gray.800')}
                          border="2px solid"
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          _focus={{
                            borderColor: 'blue.500',
                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                          }}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </Box>
                      <Box flex={1}>
                        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} mb={1}>
                          To
                        </Text>
                        <Input
                          type="date"
                          borderRadius="2xl"
                          h={{ base: '48px', sm: '44px' }}
                          fontSize={{ base: 'md', sm: 'sm' }}
                          bg={useColorModeValue('gray.50', 'gray.800')}
                          border="2px solid"
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          _focus={{
                            borderColor: 'blue.500',
                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                          }}
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </Box>
                    </HStack>
                  </Box>
                </VStack>
              </Box>

              {/* Footer com botões */}
              <Box 
                p={{ base: 4, sm: 5, md: 6 }} 
                borderTop="1px" 
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                bg={useColorModeValue('gray.50', 'gray.800')}
              >
                <HStack spacing={3} justify="end">
                  <Button
                    variant="outline"
                    borderRadius="2xl"
                    h={{ base: '48px', sm: '44px' }}
                    px={{ base: 6, sm: 4 }}
                    fontSize={{ base: 'md', sm: 'sm' }}
                    fontWeight="600"
                    borderColor={useColorModeValue('gray.300', 'gray.600')}
                    color={useColorModeValue('gray.700', 'gray.300')}
                    _hover={{
                      bg: useColorModeValue('gray.100', 'gray.700'),
                      transform: 'translateY(-2px)',
                      boxShadow: 'md',
                    }}
                    onClick={() => {
                      resetFilters()
                      onSearch({ text: '', type: null, category: '', startDate: '', endDate: '' })
                      onClose()
                    }}
                  >
                    Clear All
                  </Button>
                  <Button
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      'linear-gradient(135deg, #60a5fa, #3b82f6)'
                    )}
                    color="white"
                    borderRadius="2xl"
                    h={{ base: '48px', sm: '44px' }}
                    px={{ base: 8, sm: 6 }}
                    fontSize={{ base: 'md', sm: 'sm' }}
                    fontWeight="600"
                    boxShadow="lg"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'xl',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    onClick={handleSearch}
                  >
                    <HStack spacing={2}>
                      <Icon as={Search} boxSize={4} />
                      <Text>Search</Text>
                    </HStack>
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </ModalContent>
      
      {/* Search Results Modal */}
      <SearchResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        searchFilters={searchFilters}
      />
    </Modal>
  )
}
