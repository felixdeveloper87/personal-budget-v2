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
import { getResponsiveStyles, sectionTitleStyles, sectionHeaderStyles } from '../components/ui'
import { GRADIENTS } from '../theme'

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
  const responsiveStyles = getResponsiveStyles()

  // Modern post-it inspired colors
  const cardBg = useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark)
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBorderColor = useColorModeValue('blue.200', 'blue.500')
  const textColor = useColorModeValue('gray.800', 'white')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box
      w="full"
      px={{ base: 1, sm: 2, md: 3, lg: 4 }}
      sx={{
        paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
      }}
    >
      <Card
        bg={cardBg}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        shadow="sm"
        overflow="hidden"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          borderColor: hoverBorderColor
        }}
        transition="all 0.2s ease"
      >
        {/* Simple top border */}
        <Box
          height="1px"
          bg={useColorModeValue('blue.200', 'blue.500')}
        />

          <CardBody p={{ base: 2, sm: 3, md: 4, lg: 5 }}>
            <VStack spacing={responsiveStyles.addTransactionSection.card.spacing} align="stretch">
              {/* Header */}
              <Flex
                direction={sectionHeaderStyles.container.direction}
                align={sectionHeaderStyles.container.align}
                justify={sectionHeaderStyles.container.justify}
                gap={sectionHeaderStyles.container.gap}
                w={sectionHeaderStyles.container.w}
              >
                {/* Icon and Title Section */}
                <HStack 
                  direction={sectionHeaderStyles.iconAndTitle.direction}
                  align={sectionHeaderStyles.iconAndTitle.align}
                  spacing={sectionHeaderStyles.iconAndTitle.spacing}
                  flex={sectionHeaderStyles.iconAndTitle.flex}
                  justify={sectionHeaderStyles.iconAndTitle.justify}
                >
                  {/* Modern Icon Container */}
                  <Box
                    p={sectionHeaderStyles.icon.padding}
                    borderRadius={sectionHeaderStyles.icon.borderRadius}
                    bg={useColorModeValue('#dbeafe', '#1e293b')}
                    border="1px solid"
                    borderColor={useColorModeValue('blue.300', 'blue.500')}
                    boxShadow={sectionHeaderStyles.icon.boxShadow}
                    _hover={{
                      transform: sectionHeaderStyles.icon.hover.transform,
                      boxShadow: sectionHeaderStyles.icon.hover.boxShadow,
                      borderColor: useColorModeValue('blue.200', 'blue.400')
                    }}
                    transition={sectionHeaderStyles.icon.transition}
                  >
                    <Icon 
                      as={List} 
                      boxSize={sectionHeaderStyles.icon.size} 
                      color={useColorModeValue('blue.600', 'blue.300')}
                    />
                  </Box>

                  <HStack align="center" spacing={3} flex="0">
                    <Heading
                      size={sectionTitleStyles.size}
                      fontWeight="600"
                      textAlign="left"
                      fontFamily={sectionTitleStyles.fontFamily}
                      letterSpacing="-0.01em"
                      lineHeight="1.2"
                      whiteSpace="nowrap"
                      fontSize={{ base: 'sm', sm: 'lg' }}
                      display={{ base: 'none', sm: 'block', md: 'block' }}
                      opacity={0.9}
                      color={textColor}
                    >
                      All Transactions
                    </Heading>
                    <Text
                      fontSize={{ base: 'sm', sm: 'md' }}
                      color={secondaryTextColor}
                      fontWeight="500"
                      textAlign="left"
                      display={{ base: 'none', sm: 'block', md: 'block' }}
                      fontFamily="system-ui, -apple-system, sans-serif"
                      whiteSpace="nowrap"
                    >
                      Complete transaction history
                    </Text>
                  </HStack>
                </HStack>

                {/* Badges Section */}
                <HStack spacing={3}>
                  <Badge
                    borderRadius="xl"
                    px={4}
                    py={2}
                    fontSize="sm"
                    fontWeight="500"
                    bg={useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark)}
                    color={useColorModeValue('blue.600', 'blue.300')}
                    border="1px solid"
                    borderColor={useColorModeValue('blue.200', 'blue.500')}
                    boxShadow="sm"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    backdropFilter="blur(10px)"
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderColor: useColorModeValue('blue.300', 'blue.400'),
                    }}
                    transition="all 0.2s ease"
                    flex="0 0 auto"
                  >
                    <HStack spacing={2}>
                      <Text
                        fontSize="sm"
                        lineHeight="1"
                        fontWeight="500"
                        color={useColorModeValue('blue.600', 'blue.300')}
                      >
                        {transactions.length} transactions
                      </Text>
                    </HStack>
                  </Badge>
                  
                  {hasFilters && (
                    <Badge
                      borderRadius="xl"
                      px={4}
                      py={2}
                      fontSize="sm"
                      fontWeight="500"
                      bg={useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark)}
                      color={useColorModeValue('orange.600', 'orange.300')}
                      border="1px solid"
                      borderColor={useColorModeValue('orange.200', 'orange.500')}
                      boxShadow="sm"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      backdropFilter="blur(10px)"
                      _hover={{
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        borderColor: useColorModeValue('orange.300', 'orange.400'),
                      }}
                      transition="all 0.2s ease"
                      flex="0 0 auto"
                    >
                      <HStack spacing={2}>
                        <Icon as={Filter} boxSize={3} color={useColorModeValue('orange.600', 'orange.300')} />
                        <Text
                          fontSize="sm"
                          lineHeight="1"
                          fontWeight="500"
                          color={useColorModeValue('orange.600', 'orange.300')}
                        >
                          Filtered
                        </Text>
                      </HStack>
                    </Badge>
                  )}
                </HStack>
              </Flex>

              {/* View Controls */}
              <Flex
                direction={{ base: 'column', sm: 'row' }}
                justify="space-between"
                align={{ base: 'stretch', sm: 'center' }}
                gap={4}
                wrap="wrap"
              >
                <HStack spacing={3} justify={{ base: 'center', sm: 'flex-start' }}>
                  <Button
                    size="sm"
                    variant={!groupByMonth ? 'solid' : 'outline'}
                    colorScheme="blue"
                    borderRadius="xl"
                    h="32px"
                    px={4}
                    fontSize="sm"
                    fontWeight="500"
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
                      <Icon as={List} boxSize={4} />
                      <Text>List View</Text>
                    </HStack>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={groupByMonth ? 'solid' : 'outline'}
                    colorScheme="purple"
                    borderRadius="xl"
                    h="32px"
                    px={4}
                    fontSize="sm"
                    fontWeight="500"
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
                      <Icon as={Calendar} boxSize={4} />
                      <Text>Grouped</Text>
                    </HStack>
                  </Button>
                </HStack>
                
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  borderRadius="xl"
                  h="32px"
                  px={4}
                  fontSize="sm"
                  fontWeight="500"
                  borderColor={borderColor}
                  color={textColor}
                  _hover={{
                    bg: useColorModeValue('gray.50', 'gray.700'),
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }}
                  onClick={onRefresh}
                  w={{ base: 'full', sm: 'auto' }}
                >
                  <HStack spacing={2}>
                    <Icon as={RefreshCw} boxSize={4} />
                    <Text>Refresh</Text>
                  </HStack>
                </Button>
              </Flex>

              {/* Transaction List */}
              <Box>
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
  )
}
