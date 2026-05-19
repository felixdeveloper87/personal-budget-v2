import { Box, Text, HStack, Icon, useColorModeValue } from '@chakra-ui/react'
import { TrendingDown } from '../../ui/icons'
import React from 'react'

interface CategoryExpenseChartFooterProps {
  totalExpenses: number
}

export const CategoryExpenseChartFooter = React.memo<CategoryExpenseChartFooterProps>(({ totalExpenses }) => {
  const footerBg = useColorModeValue('white', 'black')
  const footerBorderColor = useColorModeValue('gray.100', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const amountGradient = useColorModeValue(
    'linear(to-r, red.600, red.500)',
    'linear(to-r, red.400, red.300)'
  )

  return (
    <Box
      mt={4}
      p={4}
      bg={footerBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={footerBorderColor}
      boxShadow="sm"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative background gradient */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={useColorModeValue(
          'linear-gradient(to right, rgba(254,226,226,0.3), rgba(255,255,255,0))',
          'linear-gradient(to right, rgba(254,226,226,0.05), rgba(0,0,0,0))'
        )}
        pointerEvents="none"
      />

      <HStack justify="space-between" align="center" position="relative">
        <HStack spacing={3}>
          <Box
            p={2}
            bg={useColorModeValue('red.50', 'whiteAlpha.100')}
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={useColorModeValue('red.600', 'red.400')}
          >
            <TrendingDown size="20px" />
          </Box>
          <Box>
            <Text
              fontSize="xs"
              fontWeight="600"
              color={useColorModeValue('gray.500', 'gray.500')}
              textTransform="uppercase"
              letterSpacing="wider"
              mb={0.5}
            >
              Total Expenses
            </Text>
            <Text
              fontSize="sm"
              fontWeight="500"
              color={textColor}
            >
              Summary
            </Text>
          </Box>
        </HStack>

        <Text
          fontSize={{ base: 'xl', sm: '2xl' }}
          fontWeight="800"
          bgGradient={amountGradient}
          bgClip="text"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5px"
        >
          £{totalExpenses.toFixed(2)}
        </Text>
      </HStack>
    </Box>
  )
})

CategoryExpenseChartFooter.displayName = 'CategoryExpenseChartFooter'

