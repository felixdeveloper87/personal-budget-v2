import { useState, useEffect } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  VStack, HStack, Input, InputGroup, InputLeftElement, Button, useColorModeValue
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'

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
                onClick={() => setType(type === 'income' ? null : 'income')}
              >
                Income
              </Button>
              <Button
                flex={1}
                variant={type === 'expense' ? 'solid' : 'outline'}
                colorScheme="red"
                onClick={() => setType(type === 'expense' ? null : 'expense')}
              >
                Expense
              </Button>
            </HStack>

            {/* Categoria */}
            <Input
              placeholder="Category (e.g. Salary, Investment...)"
              borderRadius="xl"
              bg={useColorModeValue('gray.100', 'gray.700')}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

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
            onClick={() => {
              onSearch({ text, type, category, startDate, endDate })
              onClose()
            }}
          >
            Search
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
