import { Box, Text, HStack, Icon, useColorModeValue } from '@chakra-ui/react'
import { TrendingUp } from 'lucide-react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles } from '../../ui'
import React from 'react'

interface CategoryIncomeChartFooterProps {
  totalIncome: number
}

export const CategoryIncomeChartFooter = React.memo<CategoryIncomeChartFooterProps>(({ totalIncome }) => {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const footerBg = useColorModeValue('rgba(34, 197, 94, 0.05)', 'rgba(34, 197, 94, 0.1)')
  const greenIcon = useColorModeValue('green.500', 'green.400')

  return (
    <Box
      pt={responsiveStyles.charts.footer.padding}
      borderTop="1px solid"
      borderColor={colors.border}
      bg={footerBg}
      borderRadius="xl"
      p={responsiveStyles.charts.footer.padding}
      mt={2}
    >
      <HStack justify="space-between" align="center">
        <HStack spacing={responsiveStyles.charts.footer.spacing}>
          <Icon
            as={TrendingUp}
            boxSize={responsiveStyles.charts.footer.iconSize}
            color={greenIcon}
          />
          <Text
            fontSize={responsiveStyles.charts.footer.titleFontSize}
            fontWeight="700"
            color={colors.text.primary}
          >
            Total Income
          </Text>
        </HStack>
        <Text
          fontSize={{ base: 'xs', sm: 'md', md: 'lg' }}
          fontWeight="800"
          bg={useColorModeValue(
            'linear-gradient(135deg, #22c55e, #16a34a)',
            'linear-gradient(135deg, #4ade80, #22c55e)'
          )}
          bgClip="text"
        >
          £{totalIncome.toFixed(2)}
        </Text>
      </HStack>
    </Box>
  )
})

CategoryIncomeChartFooter.displayName = 'CategoryIncomeChartFooter'

