import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Badge,
  useColorModeValue,
  Icon,
  Collapse
} from '@chakra-ui/react'
import { ChevronDown, ChevronUp, Calendar, Tag, DollarSign } from 'lucide-react'
import { memo, useMemo } from 'react'
import { Transaction } from '../../types'
import { formatCurrency } from '../../utils/currency'
import { formatDateBR } from '../../utils/dateTime'
import { getTypeColor } from '../../utils/ui'
import { CategoryResultCardProps } from '../../types'

const CategoryResultCard = memo(function CategoryResultCard({
  category,
  transactions,
  type,
  isExpanded,
  onToggle
}: CategoryResultCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const headerBg = useColorModeValue('gray.50', 'gray.700')
  const typeColor = getTypeColor(type)

  // Memoized calculations
  const categoryTotal = useMemo(() => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  }, [transactions])


  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      shadow="md"
      overflow="hidden"
      mb={4}
    >
      {/* Category Header */}
      <Button
        w="full"
        h="auto"
        p={4}
        bg={headerBg}
        borderRadius="none"
        onClick={onToggle}
        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
        _active={{ bg: useColorModeValue('gray.200', 'gray.500') }}
        justifyContent="space-between"
        variant="ghost"
      >
        <HStack spacing={4} flex={1}>
          <Icon as={Tag} boxSize={5} color={typeColor} />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              {category}
            </Text>
            <HStack spacing={4}>
              <Text fontSize="sm" color={textColor}>
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </Text>
              <Badge 
                colorScheme={type === 'INCOME' ? 'green' : 'red'} 
                variant="subtle"
                px={2}
                py={1}
                borderRadius="md"
              >
                {type === 'INCOME' ? 'Income' : 'Expense'}
              </Badge>
            </HStack>
          </VStack>
          <HStack spacing={2}>
            <Text fontSize="xl" fontWeight="bold" color={typeColor}>
              {formatCurrency(categoryTotal)}
            </Text>
            <Icon 
              as={isExpanded ? ChevronUp : ChevronDown} 
              boxSize={5} 
              color={textColor} 
            />
          </HStack>
        </HStack>
      </Button>

      {/* Transactions Table */}
      <Collapse in={isExpanded} animateOpacity>
        <Box p={0}>
          <Table variant="simple" size="sm">
            <Thead bg={headerBg}>
              <Tr>
                <Th color={textColor} fontSize="xs" fontWeight="600" textTransform="uppercase">
                  <HStack spacing={1}>
                    <Icon as={Calendar} boxSize={3} />
                    <Text>Date</Text>
                  </HStack>
                </Th>
                <Th color={textColor} fontSize="xs" fontWeight="600" textTransform="uppercase">
                  Description
                </Th>
                <Th color={textColor} fontSize="xs" fontWeight="600" textTransform="uppercase" isNumeric>
                  <HStack spacing={1} justify="flex-end">
                    <Icon as={DollarSign} boxSize={3} />
                    <Text>Amount</Text>
                  </HStack>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.map((transaction) => (
                <Tr 
                  key={transaction.id}
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                  transition="background-color 0.2s"
                >
                  <Td color={textColor} fontSize="sm">
                    {formatDateBR((transaction as any).date || transaction.dateTime)}
                  </Td>
                  <Td color={textColor} fontSize="sm" maxW="200px">
                    <Text 
                      isTruncated 
                      title={transaction.description}
                    >
                      {transaction.description}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    <Text 
                      fontSize="sm" 
                      fontWeight="600" 
                      color={typeColor}
                    >
                      {type === 'INCOME' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Collapse>
    </Box>
  )
})

export default CategoryResultCard
