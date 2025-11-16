import { Box, Text, VStack, HStack, Card, CardBody, Flex, Icon } from '@chakra-ui/react'
import { BarChart3 } from 'lucide-react'
import { getTransactionModalHeaderStyles, animations } from '../../ui'
import { useColorModeValue } from '@chakra-ui/react'
import React from 'react'

interface CategoryExpenseChartEmptyStateProps {
  title: string
  cardBg: string
}

export const CategoryExpenseChartEmptyState = React.memo<CategoryExpenseChartEmptyStateProps>(({
  title,
  cardBg,
}) => {
  const headerStyles = getTransactionModalHeaderStyles(useColorModeValue, 'EXPENSE')

  return (
    <Card
      bg={cardBg}
      backdropFilter="blur(20px)"
      borderRadius="2xl"
      shadow="2xl"
      overflow="hidden"
      w="full"
      sx={{
        animation: animations.slideIn,
        '@keyframes slideIn': {
          from: {
            opacity: 0,
            transform: 'translateY(20px) scale(0.95)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0) scale(1)',
          },
        },
      }}
    >
      <CardBody p={0} display="flex" flexDirection="column" h="full">
        <VStack spacing={0} align="stretch" h="full">
          <Box {...headerStyles.container}>
            <Flex
              direction="row"
              align="center"
              justify="flex-start"
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
                  <Icon as={BarChart3} boxSize={{ base: 4, sm: 5, md: 6 }} color="white" />
                </Box>
                <VStack align="start" spacing={0} flex="1" minW={0}>
                  <Text
                    color={headerStyles.title.color}
                    fontWeight="800"
                    fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                    lineHeight="shorter"
                    noOfLines={1}
                  >
                    {title}
                  </Text>
                  <Text
                    color={headerStyles.subtitle.color}
                    fontWeight="600"
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    noOfLines={1}
                  >
                    No expense data available
                  </Text>
                </VStack>
              </HStack>
            </Flex>
          </Box>

          <Box p={{ base: 4, sm: 6, md: 8 }} textAlign="center">
            <Text fontSize={{ base: 'sm', sm: 'md' }} color={headerStyles.subtitle.color}>
              Add some expenses to see your spending breakdown
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
})

CategoryExpenseChartEmptyState.displayName = 'CategoryExpenseChartEmptyState'

