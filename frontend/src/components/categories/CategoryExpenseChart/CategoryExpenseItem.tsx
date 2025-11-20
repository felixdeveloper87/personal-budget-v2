import { Box, Text, HStack, Progress, useColorModeValue, VStack, Collapse, Icon, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react'
import React from 'react'
import { CategoryExpenseItemProps } from './types'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatTransactionDateTime } from '../../../utils/dateTime'

export const CategoryExpenseItem = React.memo<CategoryExpenseItemProps>(({
  category,
  amount,
  percentage,
  color,
  onClick,
  isExpanded = false,
  transactions = [],
}) => {
  const boxHoverBg = useColorModeValue('gray.50', 'black')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const textColorSecondary = useColorModeValue('gray.600', 'gray.300')
  const progressBg = useColorModeValue('gray.100', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.900')
  const tableHeaderBg = useColorModeValue('gray.100', 'black')
  const tableRowBg = useColorModeValue('gray.100', 'black')
  const tableRowHoverBg = useColorModeValue('gray.50', 'gray.800')

  return (
    <Box
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      bg={boxHoverBg}
      transition="all 0.2s ease"
    >
      <Box
        p={4}
        cursor="pointer"
        onClick={onClick}
        _hover={{
          bg: `${color}20`,
        }}
        transition="all 0.2s ease"
      >
        <HStack justify="space-between" mb={3}>
          <HStack spacing={3}>
            <Box w={3} h={3} borderRadius="full" bg={color} />
            <HStack spacing={2} align="center">
              <Text
                fontSize="sm"
                fontWeight="600"
                color={textColor}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {category}
              </Text>
              <Text
                fontSize={{ base: '2xs', sm: 'xs' }}
                fontWeight="500"
                color={textColorSecondary}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {percentage.toFixed(1)}%
              </Text>
            </HStack>
          </HStack>
          <HStack spacing={2}>
            <Text
              fontSize="sm"
              fontWeight="700"
              color={textColor}
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              £{amount.toFixed(2)}
            </Text>
            <Icon 
              as={isExpanded ? ChevronUp : ChevronDown} 
              boxSize={4} 
              color={textColorSecondary}
            />
          </HStack>
        </HStack>

        <Progress
          value={percentage}
          size="sm"
          borderRadius="full"
          bg={progressBg}
          sx={{
            '& > div': {
              background: color,
              borderRadius: 'full',
            },
          }}
        />
      </Box>

      <Collapse in={isExpanded} animateOpacity>
        <Box
          borderTop="1px solid"
          borderColor={borderColor}
          bg={tableRowBg}
          maxH="400px"
          overflowY="auto"
        >
          {transactions.length > 0 ? (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead position="sticky" top={0} bg={tableHeaderBg} zIndex={1}>
                  <Tr>
                    <Th fontSize="xs" color={textColorSecondary} fontWeight="600">Date</Th>
                    <Th fontSize="xs" color={textColorSecondary} fontWeight="600">Description</Th>
                    <Th fontSize="xs" color={textColorSecondary} fontWeight="600" isNumeric>Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {transactions
                    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
                    .map((tx) => {
                      const { date, time } = formatTransactionDateTime(tx.dateTime)
                      return (
                        <Tr
                          key={tx.id}
                          _hover={{ bg: tableRowHoverBg }}
                          transition="background 0.2s"
                        >
                          <Td fontSize="xs" color={textColor}>
                            <VStack spacing={0.5} align="start">
                              <Text fontSize="xs">{date}</Text>
                              <Text fontSize="2xs" color={textColorSecondary}>{time}</Text>
                            </VStack>
                          </Td>
                          <Td fontSize="xs" color={textColor}>
                            {tx.description || 'No description'}
                          </Td>
                          <Td fontSize="xs" color="red.500" fontWeight="600" isNumeric>
                            £{tx.amount.toFixed(2)}
                          </Td>
                        </Tr>
                      )
                    })}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Box p={4} textAlign="center">
              <Text fontSize="sm" color={textColorSecondary}>
                No transactions found
              </Text>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  )
})

CategoryExpenseItem.displayName = 'CategoryExpenseItem'

