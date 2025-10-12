import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  useBreakpointValue,
  HStack,
  Text,
  Badge,
  VStack,
  Card,
  CardBody,
  Icon,
  Flex,
  Heading,
} from '@chakra-ui/react'
import { Transaction } from '../types'
import { useThemeColors } from '../hooks/useThemeColors'
import ExpenseChart from '../components/charts/ExpenseChart'
import IncomeChart from '../components/charts/IncomeChart'
import { TrendingDown, TrendingUp, BarChart3, Sparkles } from 'lucide-react'

// 🎨 Animações personalizadas aprimoradas
const shimmer = 'shimmer 4s ease-in-out infinite'
const slideIn = 'slideIn 0.6s ease-out'
const glow = 'glow 3s ease-in-out infinite'
const float = 'float 3s ease-in-out infinite'

interface CategoryAnalysisSectionProps {
  transactions: Transaction[]
  selectedPeriod: string
}

/**
 * 📊 CategoryAnalysisSection - Category Analysis com UI/UX Aprimorada
 * - Design fluido e intuitivo
 * - Animações e micro-interações
 * - Responsivo para mobile e desktop
 */
export default function CategoryAnalysisSection({ transactions, selectedPeriod }: CategoryAnalysisSectionProps) {
  const colors = useThemeColors()
  const isMobile = useBreakpointValue({ base: true, md: false })
  
  const tabStyle = {
    bg: colors.cardBg,
    borderColor: colors.border,
    borderBottomColor: colors.cardBg,
    fontWeight: '600',
  }

  return (
    <Box 
      w="full" 
      px={{ base: 4, md: 8, lg: 12 }}
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
            'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
            'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(16, 185, 129, 0.2) 100%)'
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
            background="linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444)"
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
              {/* Header com design moderno */}
              <Box 
                p={{ base: 4, sm: 5, md: 6 }} 
                borderBottom="1px" 
                borderColor={colors.border}
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
                        'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        'linear-gradient(135deg, #a78bfa, #8b5cf6)'
                      )}
                      boxShadow="lg"
                      sx={{
                        animation: glow,
                        '@keyframes glow': {
                          '0%, 100%': { 
                            boxShadow: '0 0 5px rgba(139, 92, 246, 0.3)' 
                          },
                          '50%': { 
                            boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)' 
                          }
                        }
                      }}
                    >
                      <Icon as={BarChart3} boxSize={6} color="white" />
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
                        Category Analysis
                      </Heading>
                      <Text
                        fontSize="sm"
                        color={colors.text.secondary}
                        fontWeight="500"
                      >
                        Detailed breakdown by categories
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Badge
                    colorScheme="purple"
                    variant="solid"
                    borderRadius="full"
                    px={4}
                    py={2}
                    fontSize="sm"
                    fontWeight="600"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      'linear-gradient(135deg, #a78bfa, #8b5cf6)'
                    )}
                    boxShadow="md"
                  >
                    <HStack spacing={2}>
                      <Icon as={Sparkles} boxSize={3} />
                      <Text>Charts</Text>
                    </HStack>
                  </Badge>
                </Flex>
              </Box>

              {/* Tabs otimizadas para iPhone 14 Pro */}
              <Tabs 
                variant="enclosed"
                colorScheme="purple"
                defaultIndex={0}
                flex="1"
                display="flex"
                flexDirection="column"
              >
                {/* Tab buttons otimizadas para mobile */}
                <TabList 
                  borderBottom="1px" 
                  borderColor={colors.border}
                  bg={colors.cardBg}
                >
                  {/* Expenses Tab */}
                  <Tab
                    _selected={{ 
                      ...tabStyle, 
                      color: useColorModeValue('red.500', 'red.400'),
                      bg: useColorModeValue('red.50', 'red.900'),
                      borderColor: useColorModeValue('red.200', 'red.700'),
                      transform: 'translateY(-1px)',
                      boxShadow: useColorModeValue(
                        '0 4px 12px rgba(239, 68, 68, 0.2)',
                        '0 4px 12px rgba(239, 68, 68, 0.4)'
                      ),
                    }}
                    borderRadius="0"
                    p={{ base: 2.5, sm: 3, md: 4 }}
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    fontWeight="600"
                    transition="all 0.2s ease"
                    color={useColorModeValue('gray.600', 'gray.300')}
                    _hover={{
                      bg: useColorModeValue('red.50', 'red.900'),
                      color: useColorModeValue('red.500', 'red.400'),
                      transform: 'translateY(-1px)',
                    }}
                    flex="1"
                    minH={{ base: '48px', sm: '52px' }}
                  >
                    <HStack spacing={{ base: 1.5, sm: 2 }} justify="center">
                      <Box
                        p={{ base: 1, sm: 1.5 }}
                        borderRadius="full"
                        bg={useColorModeValue('red.100', 'red.800')}
                        sx={{
                          animation: `${float} 3s ease-in-out infinite`,
                          '@keyframes float': {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-3px)' }
                          }
                        }}
                      >
                        <TrendingDown size={14} color={useColorModeValue('#ef4444', '#f87171')} />
                      </Box>
                      <Text 
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        color={useColorModeValue('gray.600', 'gray.300')}
                      >
                        Expenses
                      </Text>
                    </HStack>
                  </Tab>

                  {/* Income Tab */}
                  <Tab
                    _selected={{ 
                      ...tabStyle, 
                      color: useColorModeValue('green.500', 'green.400'),
                      bg: useColorModeValue('green.50', 'green.900'),
                      borderColor: useColorModeValue('green.200', 'green.700'),
                      transform: 'translateY(-1px)',
                      boxShadow: useColorModeValue(
                        '0 4px 12px rgba(34, 197, 94, 0.2)',
                        '0 4px 12px rgba(34, 197, 94, 0.4)'
                      ),
                    }}
                    borderRadius="0"
                    p={{ base: 2.5, sm: 3, md: 4 }}
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    fontWeight="600"
                    transition="all 0.2s ease"
                    color={useColorModeValue('gray.600', 'gray.300')}
                    _hover={{
                      bg: useColorModeValue('green.50', 'green.900'),
                      color: useColorModeValue('green.500', 'green.400'),
                      transform: 'translateY(-1px)',
                    }}
                    flex="1"
                    minH={{ base: '48px', sm: '52px' }}
                  >
                    <HStack spacing={{ base: 1.5, sm: 2 }} justify="center">
                      <Box
                        p={{ base: 1, sm: 1.5 }}
                        borderRadius="full"
                        bg={useColorModeValue('green.100', 'green.800')}
                        sx={{
                          animation: `${float} 3s ease-in-out infinite 1.5s`,
                          '@keyframes float': {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-3px)' }
                          }
                        }}
                      >
                        <TrendingUp size={14} color={useColorModeValue('#22c55e', '#4ade80')} />
                      </Box>
                      <Text 
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        color={useColorModeValue('gray.600', 'gray.300')}
                      >
                        Income
                      </Text>
                    </HStack>
                  </Tab>
                </TabList>

                {/* Tab content panels otimizados para iPhone 14 Pro */}
                <TabPanels flex="1" display="flex" flexDirection="column">
                  {/* Expense Chart Panel */}
                  <TabPanel p={0} flex="1">
                    <Box 
                      p={{ base: 3, sm: 4, md: 6 }} 
                      flex="1"
                      bg="linear-gradient(135deg, rgba(239, 68, 68, 0.02), rgba(239, 68, 68, 0.05))"
                      minH={{ base: '280px', sm: '320px', md: '380px' }}
                      sx={{
                        // Safe area support para iPhone 14 Pro
                        paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
                        paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
                      }}
                    >
                      <ExpenseChart
                        transactions={transactions}
                        selectedPeriod={selectedPeriod}
                      />
                    </Box>
                  </TabPanel>

                  {/* Income Chart Panel */}
                  <TabPanel p={0} flex="1">
                    <Box 
                      p={{ base: 3, sm: 4, md: 6 }} 
                      flex="1"
                      bg="linear-gradient(135deg, rgba(34, 197, 94, 0.02), rgba(34, 197, 94, 0.05))"
                      minH={{ base: '280px', sm: '320px', md: '380px' }}
                      sx={{
                        // Safe area support para iPhone 14 Pro
                        paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
                        paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
                      }}
                    >
                      <IncomeChart
                        transactions={transactions}
                        selectedPeriod={selectedPeriod}
                      />
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  )
}
