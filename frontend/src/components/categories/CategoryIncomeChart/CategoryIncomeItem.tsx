import { Box, Text, HStack, Progress, useColorModeValue, VStack, Collapse, Icon, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles } from '../../ui'
import React from 'react'
import { CategoryIncomeItemProps } from './types'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatTransactionDateTime } from '../../../utils/dateTime'

export const CategoryIncomeItem = React.memo<CategoryIncomeItemProps>(({
  category,
  amount,
  percentage,
  color,
  onClick,
  isExpanded = false,
  transactions = [],
}) => {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const boxHoverBg = useColorModeValue('gray.50', 'black')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const textColorSecondary = useColorModeValue('gray.600', 'gray.300')
  const progressBg = useColorModeValue('gray.100', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.900')
  const tableHeaderBg = useColorModeValue('gray.100', 'black')
  const tableRowBg = useColorModeValue('gray.`100', 'black')
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
          bg: useColorModeValue(`${color}20`, `${color}30`),
        }}
        transition="all 0.2s ease"
      >
        <HStack justify="space-between" mb={responsiveStyles.charts.progress.item.spacing}>
          <HStack spacing={responsiveStyles.charts.progress.item.spacing}>
            <Box
              w={responsiveStyles.charts.progress.indicator.size}
              h={responsiveStyles.charts.progress.indicator.size}
              borderRadius="full"
              bg={color}
            />
            <HStack spacing={2} align="center">
              <Text
                fontSize={responsiveStyles.charts.progress.text.fontSize}
                fontWeight="600"
                color={colors.text.primary}
              >
                {category}
              </Text>
              <Text
                fontSize={{ base: 'xs', sm: 'sm' }}
                fontWeight="500"
                color={colors.text.secondary}
              >
                {percentage.toFixed(1)}%
              </Text>
            </HStack>
          </HStack>
          <HStack spacing={2}>
            <Text
              fontSize={responsiveStyles.charts.progress.text.valueFontSize}
              fontWeight="700"
              color={colors.text.primary}
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
          size={responsiveStyles.charts.progress.bar.size}
          borderRadius="full"
          bg={progressBg}
          sx={{
            height: responsiveStyles.charts.progress.bar.height,
            '& > div': {
              background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
              borderRadius: 'full',
              boxShadow: `0 0 10px ${color}40`,
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
                          <Td fontSize="xs" color="green.500" fontWeight="600" isNumeric>
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

CategoryIncomeItem.displayName = 'CategoryIncomeItem'
