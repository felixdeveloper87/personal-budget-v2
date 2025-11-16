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
    <Box 
      {...headerStyles.container} 
      p={{ base: 0.5, sm: 2, md: 3 }}
      sx={{
        ...headerStyles.container.sx,
        paddingTop: { base: '2px', sm: 'max(16px, env(safe-area-inset-top, 0px))' },
        paddingBottom: { base: '2'}
      }}
    >
      <Flex
        direction="row"
        align="center"
        justify="space-between"
        flexWrap="nowrap"
        gap={{ base: 1, sm: 2 }}
        w="full"
        py={0}
      >
        <HStack spacing={{ base: 1.5, sm: 3 }} align="center" flex="1" minW={0} overflow="hidden">
          <Box
            p={{ base: 1, sm: 3 }}
            borderRadius="xl"
            bg={headerStyles.iconContainer.bg}
            boxShadow="lg"
            flexShrink={0}
          >
            <Icon as={TrendingDown} boxSize={{ base: 3.5, sm: 5, md: 6 }} color="white" />
          </Box>
          <VStack align="start" spacing={0} flex="1" minW={0} overflow="hidden">
            <Text
              color={headerStyles.title.color}
              fontWeight="500"
              fontSize={{ base: 'sm', sm: 'xl', md: '2xl' }}
              lineHeight="1.2"
              noOfLines={1}
            >
              {title}
            </Text>
            <Text
              color={headerStyles.subtitle.color}
              fontWeight="600"
              fontSize={{ base: '2xs', sm: 'sm', md: 'md' }}
              lineHeight="1.2"
              noOfLines={1}
            >
              {selectedPeriod} • £{totalExpenses.toLocaleString()}
            </Text>
          </VStack>
        </HStack>

        <Button
          size={{ base: 'xs', sm: 'md' }}
          variant="ghost"
          color={headerStyles.title.color}
          onClick={onViewAllClick}
          rightIcon={<Icon as={Eye} boxSize={{ base: 3, sm: 4 }} color={headerStyles.title.color} />}
          _hover={{
            bg: buttonHoverBg,
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
          transition="all 0.2s ease"
          flexShrink={0}
          px={{ base: 2, sm: 4 }}
        >
          {isMobile ? 'View All' : 'View All Details'}
        </Button>
      </Flex>
    </Box>
  )
})

CategoryExpenseChartHeader.displayName = 'CategoryExpenseChartHeader'

