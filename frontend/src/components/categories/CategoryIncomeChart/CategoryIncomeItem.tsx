import { Box, Text, HStack, Progress, useColorModeValue } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles } from '../../ui'
import React from 'react'
import { CategoryIncomeItemProps } from './types'

export const CategoryIncomeItem = React.memo<CategoryIncomeItemProps>(({
  category,
  amount,
  percentage,
  color,
  onClick,
}) => {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const boxHoverBg = useColorModeValue('white', '#0a0a0a')
  const progressBg = useColorModeValue('gray.100', 'gray.700')

  return (
    <Box
      p={responsiveStyles.charts.progress.item.padding}
      bg={boxHoverBg}
      borderRadius="xl"
      cursor="pointer"
      onClick={onClick}
      _hover={{
        bg: useColorModeValue(`${color}20`, `${color}30`),
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
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
        <Text
          fontSize={responsiveStyles.charts.progress.text.valueFontSize}
          fontWeight="700"
          color={colors.text.primary}
        >
          £{amount.toFixed(2)}
        </Text>
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
  )
})

CategoryIncomeItem.displayName = 'CategoryIncomeItem'

