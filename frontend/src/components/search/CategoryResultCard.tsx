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
import { formatDateBR } from '../../utils/dateTime'
import { getTypeColor, getTableStyles, getResponsiveStyles } from '../../utils/ui'
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
  const tableStyles = getTableStyles()
  const responsiveStyles = getResponsiveStyles()

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
        h={responsiveStyles.categoryCard.header.height}
        p={responsiveStyles.categoryCard.header.padding}
        bg={headerBg}
        borderRadius="none"
        onClick={onToggle}
        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
        _active={{ bg: useColorModeValue('gray.200', 'gray.500') }}
        justifyContent="space-between"
        variant="ghost"
      >
        <HStack spacing={{ base: 2, md: 4 }} flex={1}>
          <Icon as={Tag} boxSize={{ base: 4, md: 5 }} color={typeColor} />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize={responsiveStyles.categoryCard.header.fontSize} fontWeight="bold" color={textColor}>
              {category}
            </Text>
            <HStack spacing={{ base: 2, md: 4 }}>
              <Text fontSize={responsiveStyles.categoryCard.table.fontSize} color={textColor}>
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </Text>
              <Badge 
                colorScheme={type === 'INCOME' ? 'green' : 'red'} 
                variant="subtle"
                px={responsiveStyles.categoryCard.badge.padding}
                py={1}
                borderRadius="md"
                fontSize={responsiveStyles.categoryCard.badge.fontSize}
              >
                {type === 'INCOME' ? 'Income' : 'Expense'}
              </Badge>
            </HStack>
          </VStack>
          <HStack spacing={2}>
            <Text fontSize={responsiveStyles.categoryCard.amount.fontSize} fontWeight="bold" color={typeColor}>
              £{categoryTotal.toFixed(2)}
            </Text>
            <Icon 
              as={isExpanded ? ChevronUp : ChevronDown} 
              boxSize={{ base: 4, md: 5 }} 
              color={textColor} 
            />
          </HStack>
        </HStack>
      </Button>

      {/* Transactions Table */}
      <Collapse in={isExpanded} animateOpacity>
        <Box p={0} {...tableStyles.container}>
          <Table {...tableStyles.table}>
            <Thead bg={headerBg}>
              <Tr>
                <Th color={textColor} fontSize="xs" fontWeight="600" textTransform="uppercase" {...tableStyles.columns.date}>
                  <HStack spacing={1}>
                    <Icon as={Calendar} boxSize={3} />
                    <Text>Date</Text>
                  </HStack>
                </Th>
                <Th color={textColor} fontSize="xs" fontWeight="600" textTransform="uppercase">
                  Description
                </Th>
                <Th color={textColor} fontSize="xs" fontWeight="600" textTransform="uppercase" isNumeric {...tableStyles.columns.amount}>
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
                  <Td color={textColor} fontSize={responsiveStyles.categoryCard.table.fontSize} {...tableStyles.columns.date}>
                    {formatDateBR((transaction as any).date || transaction.dateTime)}
                  </Td>
                  <Td color={textColor} fontSize={responsiveStyles.categoryCard.table.fontSize}>
                    <Text 
                      isTruncated 
                      title={transaction.description}
                      maxW="100%"
                    >
                      {transaction.description}
                    </Text>
                  </Td>
                  <Td isNumeric {...tableStyles.columns.amount}>
                    <Text 
                      fontSize={responsiveStyles.categoryCard.table.fontSize} 
                      fontWeight="600" 
                      color={typeColor}
                      whiteSpace="nowrap"
                    >
                      {type === 'INCOME' ? '+' : ''}£{Math.abs(transaction.amount).toFixed(2)}
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
