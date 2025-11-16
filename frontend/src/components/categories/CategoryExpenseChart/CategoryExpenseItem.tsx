import { Box, Text, HStack, Progress, useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { CategoryExpenseItemProps } from './types'

export const CategoryExpenseItem = React.memo<CategoryExpenseItemProps>(({
  category,
  amount,
  percentage,
  color,
  onClick,
}) => {
  const boxHoverBg = useColorModeValue('gray.50', 'black')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const textColorSecondary = useColorModeValue('gray.600', 'gray.300')
  const progressBg = useColorModeValue('gray.100', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.900')

  return (
    <Box
      p={4}
      bg={boxHoverBg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      cursor="pointer"
      onClick={onClick}
      _hover={{
        bg: `${color}20`,
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
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
        <Text
          fontSize="sm"
          fontWeight="700"
          color={textColor}
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          £{amount.toFixed(2)}
        </Text>
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
  )
})

CategoryExpenseItem.displayName = 'CategoryExpenseItem'

