import { Box, Text, HStack, Icon, useColorModeValue } from '@chakra-ui/react'
import { Sparkles } from 'lucide-react'
import { getGradients } from '../../ui'
import React from 'react'

interface CategoryExpenseChartShowMoreProps {
  remainingCount: number
}

export const CategoryExpenseChartShowMore = React.memo<CategoryExpenseChartShowMoreProps>(({ remainingCount }) => {
  const gradients = getGradients()
  const footerBorderColor = useColorModeValue('gray.200', 'gray.600')
  const textColorSecondary = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box
      textAlign="center"
      py={4}
      bg={gradients.background}
      borderRadius="xl"
      border="1px dashed"
      borderColor={footerBorderColor}
    >
      <HStack justify="center" spacing={2}>
        <Icon as={Sparkles} boxSize={3} color={textColorSecondary} />
        <Text
          fontSize="sm"
          color={textColorSecondary}
          fontWeight="500"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          ... and {remainingCount} more categories
        </Text>
      </HStack>
    </Box>
  )
})

CategoryExpenseChartShowMore.displayName = 'CategoryExpenseChartShowMore'

