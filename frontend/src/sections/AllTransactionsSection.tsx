import { TransactionList, TransactionListGrouped } from '../components'
import { Transaction } from '../types'
import { useState } from 'react'
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Flex,
  Heading,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import { List, Calendar, Filter, RefreshCw } from 'lucide-react'
import { getResponsiveStyles, getGradients, animations, getShimmerStyles } from '../utils/ui'
import { useThemeColors } from '../hooks/useThemeColors'

interface AllTransactionsSectionProps {
  transactions: Transaction[]
  hasFilters: boolean
  onRefresh: () => void
}

export default function AllTransactionsSection({
  transactions,
  hasFilters,
  onRefresh,
}: AllTransactionsSectionProps) {
  const [groupByMonth, setGroupByMonth] = useState(false)
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()
  const gradients = getGradients()

  // Move useColorModeValue to top (always safe)
  const cardBg = useColorModeValue('linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 50%, rgba(226, 232, 240, 0.9) 100%)', 'rgba(17, 17, 17, 0.9)')
  const cardBorderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)')
  const iconBg = useColorModeValue(
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #60a5fa, #3b82f6)'
  )
  const titleBg = useColorModeValue(
    'linear-gradient(135deg, #1e293b, #475569)',
    'linear-gradient(135deg, #f8fafc, #e2e8f0)'
  )
  const badgeBg = useColorModeValue(
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #60a5fa, #3b82f6)'
  )
  const filterBadgeBg = useColorModeValue(
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #fbbf24, #f59e0b)'
  )

  return (
    <Box
      w="full"
      px={responsiveStyles.addTransactionSection.container.padding}
      sx={{
        paddingLeft: responsiveStyles.addTransactionSection.container.safeArea.paddingLeft,
        paddingRight: responsiveStyles.addTransactionSection.container.safeArea.paddingRight,
      }}
    >
      <Box position="relative">
        {/* Decorative gradient background */}
        <Box
          position="absolute"
          top={responsiveStyles.installmentPlansSection.background.top}
          left={responsiveStyles.installmentPlansSection.background.left}
          right={responsiveStyles.installmentPlansSection.background.right}
          height={responsiveStyles.installmentPlansSection.background.height}
          background={gradients.decorative}
          borderRadius={responsiveStyles.installmentPlansSection.background.borderRadius}
          filter={responsiveStyles.installmentPlansSection.background.filter}
          opacity={responsiveStyles.installmentPlansSection.background.opacity}
          zIndex={0}
        />

        <Card
          position="relative"
          bg={cardBg}
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={cardBorderColor}
          borderRadius={responsiveStyles.addTransactionSection.card.borderRadius}
          shadow="2xl"
          overflow="hidden"
          w="full"
          sx={{
            animation: animations.slideIn,
            '@keyframes slideIn': {
              from: { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
              to: { opacity: 1, transform: 'translateY(0) scale(1)' },
            },
          }}
        >
          {/* Animated top border */}
          <Box
            height="4px"
            sx={getShimmerStyles()}
          />

          <CardBody p={0}>
            <VStack spacing={0} align="stretch" h="full">
              {/* Header */}
              <Box 
                p={responsiveStyles.addTransactionSection.card.padding} 
                borderBottom="1px" 
                borderColor={colors.border}
                position="relative"
              >
                <Flex
                  direction={responsiveStyles.addTransactionSection.header.direction}
                  align={{ base: 'stretch', sm: 'center' }}
                  justify="space-between"
                  gap={responsiveStyles.addTransactionSection.header.gap}
                >
                  <HStack spacing={{ base: 2, sm: 3, md: 4 }} align="center" flex="1">
                    <Box
                      p={responsiveStyles.addTransactionSection.header.icon.padding}
                      borderRadius={responsiveStyles.addTransactionSection.header.icon.borderRadius}
                      bg={iconBg}
                      boxShadow="lg"
                      sx={{
                        animation: animations.glow,
                        '@keyframes glow': {
                          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' },
                          '50%': {
                            boxShadow:
                              '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)',
                          },
                        },
                      }}
                    >
                      <Icon
                        as={List}
                        boxSize={responsiveStyles.addTransactionSection.header.icon.size}
                        color="white"
                      />
                    </Box>

                    <VStack align="start" spacing={1} flex="1">
                      <Heading
                        size={responsiveStyles.addTransactionSection.header.title.size}
                        bg={titleBg}
                        bgClip="text"
                        fontWeight="800"
                        textAlign="left"
                      >
                        All Transactions
                      </Heading>
                      <Text
                        fontSize={responsiveStyles.addTransactionSection.header.title.fontSize}
                        color={colors.text.secondary}
                        fontWeight="400"
                        opacity={0.8}
                        textAlign="left"
                        display={{ base: 'none', sm: 'block' }}
                      >
                        Complete transaction history
                      </Text>
                    </VStack>
                  </HStack>
                  
                  {/* Right side - Badges */}
                  <HStack spacing={3}>
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      borderRadius="full"
                      px={responsiveStyles.installmentPlansSection.badge.padding}
                      py={responsiveStyles.installmentPlansSection.badge.padding}
                      fontSize={responsiveStyles.installmentPlansSection.badge.fontSize}
                      fontWeight="600"
                      bg={badgeBg}
                      boxShadow="md"
                    >
                      <HStack spacing={responsiveStyles.installmentPlansSection.badge.spacing}>
                        <Text>{transactions.length}</Text>
                        <Text>transactions</Text>
                      </HStack>
                    </Badge>
                    
                    {hasFilters && (
                      <Badge
                        colorScheme="orange"
                        variant="solid"
                        borderRadius="full"
                        px={responsiveStyles.installmentPlansSection.badge.padding}
                        py={responsiveStyles.installmentPlansSection.badge.padding}
                        fontSize={responsiveStyles.installmentPlansSection.badge.fontSize}
                        fontWeight="600"
                        bg={filterBadgeBg}
                        boxShadow="md"
                      >
                        <HStack spacing={responsiveStyles.installmentPlansSection.badge.spacing}>
                          <Icon as={Filter} boxSize={responsiveStyles.installmentPlansSection.badge.iconSize} />
                          <Text>Filtered</Text>
                        </HStack>
                      </Badge>
                    )}
                  </HStack>
                </Flex>
              </Box>

              {/* View Controls */}
              <Box 
                p={responsiveStyles.addTransactionSection.card.padding}
                borderBottom="1px" 
                borderColor={colors.border}
                bg={colors.bgSecondary}
              >
                <Flex
                  direction={responsiveStyles.addTransactionSection.header.direction}
                  justify="space-between"
                  align={{ base: 'stretch', sm: 'center' }}
                  gap={responsiveStyles.addTransactionSection.header.gap}
                >
                  <HStack spacing={3} justify={{ base: 'center', sm: 'flex-start' }}>
                    <Button
                      size={responsiveStyles.buttons.action.size}
                      variant={!groupByMonth ? 'solid' : 'outline'}
                      colorScheme="blue"
                      borderRadius="2xl"
                      h={responsiveStyles.buttons.action.height}
                      px={responsiveStyles.buttons.action.padding}
                      fontSize={responsiveStyles.buttons.action.fontSize}
                      fontWeight="600"
                      bg={!groupByMonth ? 
                        useColorModeValue('blue.500', 'blue.600') : 
                        'transparent'
                      }
                      borderColor={useColorModeValue('blue.300', 'blue.600')}
                      color={!groupByMonth ? 'white' : useColorModeValue('blue.600', 'blue.400')}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                      }}
                      onClick={() => setGroupByMonth(false)}
                    >
                      <HStack spacing={2}>
                        <Icon as={List} boxSize={responsiveStyles.buttons.action.iconSize} />
                        <Text>List View</Text>
                      </HStack>
                    </Button>
                    
                    <Button
                      size={responsiveStyles.buttons.action.size}
                      variant={groupByMonth ? 'solid' : 'outline'}
                      colorScheme="purple"
                      borderRadius="2xl"
                      h={responsiveStyles.buttons.action.height}
                      px={responsiveStyles.buttons.action.padding}
                      fontSize={responsiveStyles.buttons.action.fontSize}
                      fontWeight="600"
                      bg={groupByMonth ? 
                        useColorModeValue('purple.500', 'purple.600') : 
                        'transparent'
                      }
                      borderColor={useColorModeValue('purple.300', 'purple.600')}
                      color={groupByMonth ? 'white' : useColorModeValue('purple.600', 'purple.400')}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                      }}
                      onClick={() => setGroupByMonth(true)}
                    >
                      <HStack spacing={2}>
                        <Icon as={Calendar} boxSize={responsiveStyles.buttons.action.iconSize} />
                        <Text>Grouped</Text>
                      </HStack>
                    </Button>
                  </HStack>
                  
                  <Button
                    size={responsiveStyles.buttons.action.size}
                    variant="outline"
                    colorScheme="gray"
                    borderRadius="2xl"
                    h={responsiveStyles.buttons.action.height}
                    px={responsiveStyles.buttons.action.padding}
                    fontSize={responsiveStyles.buttons.action.fontSize}
                    fontWeight="600"
                    borderColor={colors.border}
                    color={colors.text.primary}
                    _hover={{
                      bg: colors.cardHover,
                      transform: 'translateY(-2px)',
                      boxShadow: 'md',
                    }}
                    onClick={onRefresh}
                    w={{ base: 'full', sm: 'auto' }}
                  >
                    <HStack spacing={2}>
                      <Icon as={RefreshCw} boxSize={responsiveStyles.buttons.action.iconSize} />
                      <Text>Refresh</Text>
                    </HStack>
                  </Button>
                </Flex>
              </Box>

              {/* Transaction List */}
              <Box 
                p={responsiveStyles.addTransactionSection.card.padding}
                sx={{
                  paddingLeft: responsiveStyles.addTransactionSection.container.safeArea.paddingLeft,
                  paddingRight: responsiveStyles.addTransactionSection.container.safeArea.paddingRight,
                }}
              >
                {groupByMonth ? (
                  <TransactionListGrouped
                    transactions={transactions}
                    onTransactionDeleted={onRefresh}
                  />
                ) : (
                  <TransactionList
                    transactions={transactions}
                    onTransactionDeleted={onRefresh}
                  />
                )}
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  )
}
