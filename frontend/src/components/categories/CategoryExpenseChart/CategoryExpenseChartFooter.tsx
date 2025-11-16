import { Box, Text, HStack, Icon, useColorModeValue } from '@chakra-ui/react'
import { TrendingDown } from 'lucide-react'
import React from 'react'

interface CategoryExpenseChartFooterProps {
  totalExpenses: number
}

export const CategoryExpenseChartFooter = React.memo<CategoryExpenseChartFooterProps>(({ totalExpenses }) => {
  const footerBg = useColorModeValue('rgba(239, 68, 68, 0.05)', 'rgba(239, 68, 68, 0.1)')
  const footerBorderColor = useColorModeValue('gray.200', 'gray.600')
  const redColor = useColorModeValue('red.600', 'red.300')
  const redIcon = useColorModeValue('red.500', 'red.400')
  const textColor = useColorModeValue('gray.800', 'gray.100')

  return (
    <Box
      pt={4}
      borderTop="1px solid"
      borderColor={footerBorderColor}
      bg={footerBg}
      borderRadius="xl"
      p={4}
      mt={2}
    >
      <HStack justify="space-between" align="center">
        <HStack spacing={3}>
          <Icon as={TrendingDown} boxSize={4} color={redIcon} />
          <Text
            fontSize="md"
            fontWeight="700"
            color={textColor}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Total Expenses
          </Text>
        </HStack>
        <Text
          fontSize={{ base: 'xs', sm: 'md', md: 'lg' }}
          fontWeight="800"
          color={redColor}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          £{totalExpenses.toFixed(2)}
        </Text>
      </HStack>
    </Box>
  )
})

CategoryExpenseChartFooter.displayName = 'CategoryExpenseChartFooter'

