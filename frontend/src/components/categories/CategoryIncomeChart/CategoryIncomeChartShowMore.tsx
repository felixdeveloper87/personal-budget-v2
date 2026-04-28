// import { Box, Text, HStack, Icon, useColorModeValue } from '@chakra-ui/react'
// import { Sparkles } from '../../ui/icons'
// import { getGradients } from '../../ui'
// import { useThemeColors } from '../../../hooks/useThemeColors'
// import { getResponsiveStyles } from '../../ui'
// import React from 'react'

// interface CategoryIncomeChartShowMoreProps {
//   remainingCount: number
// }

// export const CategoryIncomeChartShowMore = React.memo<CategoryIncomeChartShowMoreProps>(({ remainingCount }) => {
//   const colors = useThemeColors()
//   const responsiveStyles = getResponsiveStyles()
//   const gradients = getGradients()

//   return (
//     <Box
//       textAlign="center"
//       py={responsiveStyles.charts.progress.container.padding}
//       bg={useColorModeValue(gradients.background, gradients.background)}
//       borderRadius="xl"
//       border="1px dashed"
//       borderColor={colors.border}
//     >
//       <HStack justify="center" spacing={2}>
//         <Icon
//           as={Sparkles}
//           boxSize={responsiveStyles.charts.button.iconSize}
//           color={colors.text.secondary}
//         />
//         <Text
//           fontSize={responsiveStyles.charts.progress.text.fontSize}
//           color={colors.text.primary}
//           fontWeight="500"
//         >
//           ... and {remainingCount} more categories
//         </Text>
//       </HStack>
//     </Box>
//   )
// })

// CategoryIncomeChartShowMore.displayName = 'CategoryIncomeChartShowMore'

