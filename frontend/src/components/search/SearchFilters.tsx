import { 
  VStack, HStack, Input, InputGroup, InputLeftElement, Button, useColorModeValue, 
  Text, Wrap, WrapItem, Box, Icon 
} from '@chakra-ui/react'
import { Search, Sparkles, Calendar, Tag } from 'lucide-react'
import { SearchFiltersProps } from '../../types'
import { safariStyles, getResponsiveStyles } from '../ui'

export default function SearchFilters({ 
  filters, 
  onUpdateFilter, 
  onTypeChange, 
  availableCategories 
}: SearchFiltersProps) {
  const responsiveStyles = getResponsiveStyles()
  return (
    <VStack 
      spacing={{ base: 4, md: 6 }} 
      align="stretch" 
      pb={{ base: 6, md: 0 }}
      minH="fit-content"
    >
      {/* Main search field */}
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
            value={filters.text}
            onChange={(e) => onUpdateFilter('text', e.target.value)}
            fontSize={{ base: 'md', sm: 'sm' }}
            h={{ base: '48px', sm: '44px' }}
          />
        </InputGroup>
      </Box>

      {/* Type filters */}
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
            variant={filters.type === 'income' ? 'solid' : 'outline'}
            colorScheme="green"
            borderRadius="2xl"
            h={{ base: '48px', sm: '44px' }}
            fontSize={{ base: 'md', sm: 'sm' }}
            fontWeight="600"
            bg={filters.type === 'income' ? 
              useColorModeValue('green.500', 'green.600') : 
              'transparent'
            }
            borderColor={useColorModeValue('green.300', 'green.600')}
            color={filters.type === 'income' ? 'white' : useColorModeValue('green.600', 'green.400')}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            onClick={() => onTypeChange(filters.type === 'income' ? null : 'income')}
          >
            <HStack spacing={2}>
              <Icon as={Sparkles} boxSize={4} />
              <Text>Income</Text>
            </HStack>
          </Button>
          <Button
            flex={1}
            variant={filters.type === 'expense' ? 'solid' : 'outline'}
            colorScheme="red"
            borderRadius="2xl"
            h={{ base: '48px', sm: '44px' }}
            fontSize={{ base: 'md', sm: 'sm' }}
            fontWeight="600"
            bg={filters.type === 'expense' ? 
              useColorModeValue('red.500', 'red.600') : 
              'transparent'
            }
            borderColor={useColorModeValue('red.300', 'red.600')}
            color={filters.type === 'expense' ? 'white' : useColorModeValue('red.600', 'red.400')}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            onClick={() => onTypeChange(filters.type === 'expense' ? null : 'expense')}
          >
            <HStack spacing={2}>
              <Icon as={Sparkles} boxSize={4} />
              <Text>Expense</Text>
            </HStack>
          </Button>
        </HStack>
      </Box>

      {/* Category filters */}
      {filters.type && (
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
            {availableCategories.map((cat) => (
              <WrapItem key={cat}>
                <Button
                  {...responsiveStyles.buttons.category}
                  variant={filters.category === cat ? 'solid' : 'outline'}
                  colorScheme={filters.category === cat ? 'blue' : 'gray'}
                  borderRadius="full"
                  fontWeight="600"
                  bg={filters.category === cat ? 
                    useColorModeValue('blue.500', 'blue.600') : 
                    'transparent'
                  }
                  borderColor={useColorModeValue('gray.300', 'gray.600')}
                  color={filters.category === cat ? 'white' : useColorModeValue('gray.700', 'gray.300')}
                  onClick={() => onUpdateFilter('category', filters.category === cat ? '' : cat)}
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: 'md',
                    bg: filters.category === cat ? 
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
          {filters.category && (
            <Box
              mt={3}
              p={{ base: 3, md: 4 }}
              bg={useColorModeValue('blue.50', 'blue.900')}
              borderRadius="2xl"
              border="2px solid"
              borderColor={useColorModeValue('blue.200', 'blue.700')}
              flexShrink={0}
              sx={safariStyles.hardwareAcceleration}
            >
              <HStack justify="space-between" align="center">
                <Text 
                  fontSize="sm" 
                  color={useColorModeValue('blue.700', 'blue.200')} 
                  fontWeight="600"
                  flex="1"
                  minW="0"
                >
                  Selected: <strong>{filters.category}</strong>
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  borderRadius="full"
                  flexShrink={0}
                  onClick={() => onUpdateFilter('category', '')}
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

      {/* Date filters */}
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
        
        {/* Quick date buttons */}
        <VStack spacing={3} align="stretch">
          <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} fontWeight="500">
            Quick select:
          </Text>
          <HStack spacing={2} wrap="wrap">
            {(() => {
              const now = new Date()
              const months = []
              for (let i = 0; i < 3; i++) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const monthName = date.toLocaleDateString('en-US', { month: 'long' })
                const year = date.getFullYear()
                const startDate = date.toISOString().split('T')[0]
                const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
                
                months.push(
                  <Button
                    key={i}
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="500"
                    bg={useColorModeValue('gray.50', 'gray.800')}
                    borderColor={useColorModeValue('gray.300', 'gray.600')}
                    color={useColorModeValue('gray.700', 'gray.200')}
                    _hover={{
                      bg: useColorModeValue('blue.50', 'blue.900'),
                      borderColor: 'blue.300',
                      color: 'blue.600'
                    }}
                    onClick={() => {
                      onUpdateFilter('startDate', startDate)
                      onUpdateFilter('endDate', endDate)
                    }}
                  >
                    {monthName} {year}
                  </Button>
                )
              }
              return months
            })()}
          </HStack>
        </VStack>
        
        <HStack spacing={3} mt={4}>
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
              value={filters.startDate}
              onChange={(e) => onUpdateFilter('startDate', e.target.value)}
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
              value={filters.endDate}
              onChange={(e) => onUpdateFilter('endDate', e.target.value)}
            />
          </Box>
        </HStack>
      </Box>
    </VStack>
  )
}
