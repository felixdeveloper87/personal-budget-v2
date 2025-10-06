import { useState, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  VStack, HStack, Input, InputGroup, InputLeftElement, Button, useColorModeValue, 
  Text, Wrap, WrapItem, Box
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import SearchResultsModal from './SearchResultsModal'
import { useSearch } from '../../contexts/SearchContext'

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
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader
          bg={useColorModeValue('blue.500', 'gray.800')}
          color="white"
          fontSize="lg"
          fontWeight="bold"
        >
          Search Transactions
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            {/* Texto */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by description..."
                borderRadius="xl"
                bg={useColorModeValue('gray.100', 'gray.700')}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </InputGroup>

            {/* Tipo */}
            <HStack spacing={3}>
              <Button
                flex={1}
                variant={type === 'income' ? 'solid' : 'outline'}
                colorScheme="green"
                onClick={() => handleTypeChange(type === 'income' ? null : 'income')}
              >
                Income
              </Button>
              <Button
                flex={1}
                variant={type === 'expense' ? 'solid' : 'outline'}
                colorScheme="red"
                onClick={() => handleTypeChange(type === 'expense' ? null : 'expense')}
              >
                Expense
              </Button>
            </HStack>

            {/* Categoria */}
            {type && (
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.700', 'gray.300')}>
                  Category
                </Text>
                <Wrap spacing={2}>
                  {(type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                    <WrapItem key={cat}>
                      <Button
                        size="sm"
                        variant={category === cat ? 'solid' : 'outline'}
                        colorScheme={category === cat ? 'blue' : 'gray'}
                        borderRadius="full"
                        onClick={() => setCategory(category === cat ? '' : cat)}
                        _hover={{
                          transform: 'scale(1.05)',
                          boxShadow: 'md'
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
                    p={2}
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={useColorModeValue('blue.200', 'blue.700')}
                  >
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.200')}>
                        Selected: <strong>{category}</strong>
                      </Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => setCategory('')}
                      >
                        Clear
                      </Button>
                    </HStack>
                  </Box>
                )}
              </VStack>
            )}

            {/* Intervalo de datas */}
            <HStack spacing={3}>
              <Input
                type="date"
                borderRadius="xl"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                borderRadius="xl"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button
            variant="outline"
            borderRadius="xl"
            onClick={() => {
              resetFilters()
              onSearch({ text: '', type: null, category: '', startDate: '', endDate: '' })
              onClose()
            }}
          >
            Clear
          </Button>
          <Button
            colorScheme="blue"
            borderRadius="xl"
            px={8}
            onClick={handleSearch}
          >
            Search
          </Button>
        </ModalFooter>
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
