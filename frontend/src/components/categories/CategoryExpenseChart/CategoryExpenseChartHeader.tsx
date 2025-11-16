import { Box, Text, VStack, HStack, Button, Icon, Flex, useBreakpointValue } from '@chakra-ui/react'
import { TrendingDown, Eye } from 'lucide-react'
import { getTransactionModalHeaderStyles } from '../../ui'
import { useColorModeValue } from '@chakra-ui/react'
import React from 'react'

interface CategoryExpenseChartHeaderProps {
  title: string
  subtitle: string
  totalExpenses: number
  selectedPeriod: string
  onViewAllClick: () => void
  isMobile: boolean
}

export const CategoryExpenseChartHeader = React.memo<CategoryExpenseChartHeaderProps>(({
  title,
  subtitle,
  totalExpenses,
  selectedPeriod,
  onViewAllClick,
  isMobile,
}) => {
  const headerStyles = getTransactionModalHeaderStyles(useColorModeValue, 'EXPENSE')
  const buttonHoverBg = useColorModeValue('red.50', 'red.900')

  return (
    <Box {...headerStyles.container}>
      <Flex
        direction="row"
        align="center"
        justify="center"
        flexWrap="wrap"
        pr={{ base: 1, sm: 2 }}
        pt={{ base: 0.5, sm: 0 }}
        gap={{ base: 1.5, sm: 2 }}
      >
        <HStack spacing={{ base: 2, sm: 3 }} align="center" flex="1" minW={0}>
          <Box
            p={{ base: 2, sm: 3 }}
            borderRadius="2xl"
            bg={headerStyles.iconContainer.bg}
            boxShadow="lg"
            flexShrink={0}
          >
            <Icon as={TrendingDown} boxSize={{ base: 4, sm: 5, md: 6 }} color="white" />
          </Box>
          <VStack align="start" spacing={0} flex="1" minW={0}>
            <Text
              color={headerStyles.title.color}
              fontWeight="500"
              fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
              lineHeight="shorter"
              noOfLines={1}
            >
              {title}
            </Text>
            <Text
              color={headerStyles.subtitle.color}
              fontWeight="600"
              fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
              noOfLines={1}
            >
              {selectedPeriod} • £{totalExpenses.toLocaleString()}
            </Text>
          </VStack>
        </HStack>

        <Button
          size={{ base: 'sm', sm: 'md' }}
          variant="ghost"
          color={headerStyles.title.color}
          onClick={onViewAllClick}
          rightIcon={<Icon as={Eye} boxSize={4} color={headerStyles.title.color} />}
          _hover={{
            bg: buttonHoverBg,
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
          transition="all 0.2s ease"
          flexShrink={0}
        >
          {isMobile ? 'View All' : 'View All Details'}
        </Button>
      </Flex>
    </Box>
  )
})

CategoryExpenseChartHeader.displayName = 'CategoryExpenseChartHeader'

