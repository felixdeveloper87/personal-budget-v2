import { Box, Text, VStack, HStack, Button, Icon, Flex, useColorModeValue, Badge, Image } from '@chakra-ui/react'
import { Eye } from 'lucide-react'
import { getResponsiveStyles } from '../../ui'
import React from 'react'
import trendingUpImage from '../../../../assets/trendingUp.png'

interface CategoryIncomeChartHeaderProps {
  title: string
  subtitle: string
  totalIncome: number
  selectedPeriod: string
  onViewAllClick: () => void
  isMobile: boolean
}

export const CategoryIncomeChartHeader = React.memo<CategoryIncomeChartHeaderProps>(({
  title,
  totalIncome,
  selectedPeriod,
  onViewAllClick,
  isMobile,
}) => {
  const buttonHoverBg = useColorModeValue('green.50', 'green.900')

  const responsiveStyles = getResponsiveStyles()

  return (
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      w="full"
    >
      <HStack spacing={4}>
        <Box
          p={2}
          bg="transparent"
          borderRadius="xl"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            src={trendingUpImage}
            alt="Income"
            boxSize={{ base: 5, sm: 6, md: 10 }}
            objectFit="contain"
          />
        </Box>
        <VStack align="start" spacing={0.5}>
          <Text
            fontWeight="700"
            fontSize={{ base: 'md', sm: 'lg' }}
            lineHeight="1.2"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.02em"
            bgGradient={useColorModeValue(
              'linear(to-r, gray.800, gray.600)',
              'linear(to-r, white, gray.300)'
            )}
            bgClip="text"
          >
            {title}
          </Text>
          <Text
            color={useColorModeValue('gray.500', 'gray.400')}
            fontWeight="600"
            fontSize={{ base: 'xs', sm: 'sm' }}
            lineHeight="1.2"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {selectedPeriod} • £{totalIncome.toLocaleString()}
          </Text>
        </VStack>
        <Badge
          colorScheme="gray"
          variant="subtle"
          borderRadius="md"
          px={responsiveStyles.charts.badges.period.padding}
          py={responsiveStyles.charts.badges.period.padding}
          fontSize={responsiveStyles.charts.badges.period.fontSize}
          fontWeight="400"
          opacity={0.7}
        >
          {selectedPeriod}
        </Badge>
      </HStack>

      <Button
        size={{ base: 'xs', sm: 'sm' }}
        variant="ghost"
        color={useColorModeValue('green.600', 'green.300')}
        onClick={onViewAllClick}
        rightIcon={<Icon as={Eye} boxSize={{ base: 3, sm: 4 }} />}
        borderRadius="xl"
        _hover={{
          bg: buttonHoverBg,
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
        transition="all 0.2s ease"
        flexShrink={0}
        px={{ base: 2, sm: 4 }}
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {isMobile ? 'View All' : 'View All Details'}
      </Button>
    </Flex>
  )
})

CategoryIncomeChartHeader.displayName = 'CategoryIncomeChartHeader'
