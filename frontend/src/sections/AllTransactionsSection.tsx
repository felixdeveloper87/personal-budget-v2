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
import { List, Calendar, Filter, RefreshCw, Sparkles } from 'lucide-react'

// 🎨 Animações personalizadas
const shimmer = 'shimmer 4s ease-in-out infinite'
const slideIn = 'slideIn 0.6s ease-out'
const glow = 'glow 3s ease-in-out infinite'
const float = 'float 3s ease-in-out infinite'

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

  return (
    <Box 
      w="full" 
      px={{ base: 3, sm: 4, md: 6 }}
      sx={{
        // Safe area support para iPhone 14 Pro
        paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
      }}
    >
      <Box position="relative" mb={8}>
        {/* Background decorativo com gradiente */}
        <Box
          position="absolute"
          top="-50px"
          left="-50px"
          right="-50px"
          height="200px"
          background={useColorModeValue(
            'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
            'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(16, 185, 129, 0.2) 100%)'
          )}
          borderRadius="3xl"
          filter="blur(40px)"
          opacity={0.6}
          zIndex={0}
        />
        
        {/* Card principal com glassmorphism */}
        <Card
          position="relative"
          bg={useColorModeValue(
            'rgba(255, 255, 255, 0.9)',
            'rgba(17, 17, 17, 0.9)'
          )}
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={useColorModeValue(
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.1)'
          )}
          borderRadius="3xl"
          shadow="2xl"
          overflow="hidden"
          w="full"
          sx={{
            animation: slideIn,
            '@keyframes slideIn': {
              from: { 
                opacity: 0, 
                transform: 'translateY(20px) scale(0.95)' 
              },
              to: { 
                opacity: 1, 
                transform: 'translateY(0) scale(1)' 
              }
            }
          }}
        >
          {/* Barra superior animada */}
          <Box
            height="4px"
            background="linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981, #f59e0b, #ef4444)"
            backgroundSize="300% 100%"
            sx={{
              animation: shimmer,
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '-200% 0' },
                '100%': { backgroundPosition: '200% 0' }
              }
            }}
          />
          
          <CardBody p={0}>
            <VStack spacing={0} align="stretch" h="full">
              {/* Header moderno */}
              <Box 
                p={{ base: 4, sm: 5, md: 6 }} 
                borderBottom="1px" 
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                position="relative"
              >
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align="center"
                  justify="space-between"
                  gap={4}
                >
                  <HStack spacing={4} align="center">
                    <Box
                      p={3}
                      borderRadius="2xl"
                      bg={useColorModeValue(
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        'linear-gradient(135deg, #60a5fa, #3b82f6)'
                      )}
                      boxShadow="lg"
                      sx={{
                        animation: glow,
                        '@keyframes glow': {
                          '0%, 100%': { 
                            boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' 
                          },
                          '50%': { 
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)' 
                          }
                        }
                      }}
                    >
                      <Icon as={List} boxSize={6} color="white" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading
                        size="lg"
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #1e293b, #475569)',
                          'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                        )}
                        bgClip="text"
                        fontWeight="800"
                      >
                        All Transactions
                      </Heading>
                      <Text
                        fontSize="sm"
                        color={useColorModeValue('gray.600', 'gray.300')}
                        fontWeight="500"
                      >
                        Complete transaction history
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={3}>
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      borderRadius="full"
                      px={4}
                      py={2}
                      fontSize="sm"
                      fontWeight="600"
                      bg={useColorModeValue(
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        'linear-gradient(135deg, #60a5fa, #3b82f6)'
                      )}
                      boxShadow="md"
                    >
                      <HStack spacing={2}>
                        <Text>{transactions.length}</Text>
                        <Text>transactions</Text>
                      </HStack>
                    </Badge>
                    
                    {hasFilters && (
                      <Badge
                        colorScheme="orange"
                        variant="solid"
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontSize="sm"
                        fontWeight="600"
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #f59e0b, #d97706)',
                          'linear-gradient(135deg, #fbbf24, #f59e0b)'
                        )}
                        boxShadow="md"
                      >
                        <HStack spacing={2}>
                          <Icon as={Filter} boxSize={3} />
                          <Text>Filtered</Text>
                        </HStack>
                      </Badge>
                    )}
                  </HStack>
                </Flex>
              </Box>

              {/* Controles de visualização */}
              <Box 
                p={{ base: 4, sm: 5, md: 6 }}
                borderBottom="1px" 
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                bg={useColorModeValue('gray.50', 'gray.800')}
              >
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  justify="space-between"
                  align={{ base: 'stretch', sm: 'center' }}
                  gap={4}
                >
                  <HStack spacing={3} justify={{ base: 'center', sm: 'flex-start' }}>
                    <Button
                      size={{ base: 'md', sm: 'sm' }}
                      variant={!groupByMonth ? 'solid' : 'outline'}
                      colorScheme="blue"
                      borderRadius="2xl"
                      h={{ base: '44px', sm: '40px' }}
                      px={{ base: 6, sm: 4 }}
                      fontSize={{ base: 'sm', sm: 'xs' }}
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
                        <Icon as={List} boxSize={4} />
                        <Text>List View</Text>
                      </HStack>
                    </Button>
                    
                    <Button
                      size={{ base: 'md', sm: 'sm' }}
                      variant={groupByMonth ? 'solid' : 'outline'}
                      colorScheme="purple"
                      borderRadius="2xl"
                      h={{ base: '44px', sm: '40px' }}
                      px={{ base: 6, sm: 4 }}
                      fontSize={{ base: 'sm', sm: 'xs' }}
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
                        <Icon as={Calendar} boxSize={4} />
                        <Text>Grouped</Text>
                      </HStack>
                    </Button>
                  </HStack>
                  
                  <Button
                    size={{ base: 'md', sm: 'sm' }}
                    variant="outline"
                    colorScheme="gray"
                    borderRadius="2xl"
                    h={{ base: '44px', sm: '40px' }}
                    px={{ base: 6, sm: 4 }}
                    fontSize={{ base: 'sm', sm: 'xs' }}
                    fontWeight="600"
                    borderColor={useColorModeValue('gray.300', 'gray.600')}
                    color={useColorModeValue('gray.700', 'gray.300')}
                    _hover={{
                      bg: useColorModeValue('gray.100', 'gray.700'),
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
              </Box>

              {/* Lista de transações */}
              <Box 
                p={{ base: 3, sm: 4, md: 6 }}
                sx={{
                  // Safe area support para iPhone 14 Pro
                  paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
                  paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
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
