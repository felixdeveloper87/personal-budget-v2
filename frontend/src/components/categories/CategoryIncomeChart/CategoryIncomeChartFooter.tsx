import { Box, Text, HStack, Image, useColorModeValue } from '@chakra-ui/react'
import trendingUpImage from '../../../../assets/trendingUp.png'
import React from 'react'

interface CategoryIncomeChartFooterProps {
  totalIncome: number
}

export const CategoryIncomeChartFooter = React.memo<CategoryIncomeChartFooterProps>(({ totalIncome }) => {
  const footerBg = useColorModeValue('white', 'black')
  const footerBorderColor = useColorModeValue('gray.100', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const amountGradient = useColorModeValue(
    'linear(to-r, green.600, green.500)',
    'linear(to-r, green.400, green.300)'
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
          'linear-gradient(to right, rgba(220,252,231,0.3), rgba(255,255,255,0))',
          'linear-gradient(to right, rgba(220,252,231,0.05), rgba(0,0,0,0))'
        )}
        pointerEvents="none"
      />

      <HStack justify="space-between" align="center" position="relative">
        <HStack spacing={3}>
          <Box
            p={2}
            bg={useColorModeValue('green.50', 'whiteAlpha.100')}
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Image
              src={trendingUpImage}
              alt="Income"
              boxSize={{ base: 5, sm: 6 }}
              objectFit="contain"
            />
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
              Total Income
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
          £{totalIncome.toFixed(2)}
        </Text>
      </HStack>
    </Box>
  )
})

CategoryIncomeChartFooter.displayName = 'CategoryIncomeChartFooter'

