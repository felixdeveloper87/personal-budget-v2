import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  Heading,
  Icon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { BarChart3, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { useThemeColors } from '../../hooks/useThemeColors'
import ExpenseChart from '../charts/ExpenseChart'
import IncomeChart from '../charts/IncomeChart'

// 🎨 Animações personalizadas
const float = 'float 3s ease-in-out infinite'
const glow = 'glow 3s ease-in-out infinite'

interface CategoryAnalysisTabsProps {
  transactions: any[]
  selectedPeriod: string
}

export default function CategoryAnalysisTabs({ transactions, selectedPeriod }: CategoryAnalysisTabsProps) {
  const colors = useThemeColors()

  return (
    <Box p={{ base: 4, sm: 5, md: 6 }}>
      <VStack spacing={6} align="stretch">
        {/* Header da análise de categorias */}
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

        {/* Tabs para análise de categorias */}
        <Tabs 
          variant="enclosed"
          colorScheme="purple"
          defaultIndex={0}
          flex="1"
          display="flex"
          flexDirection="column"
        >
          {/* Tab buttons modernas */}
          <TabList 
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="2xl"
            p={1}
            border="none"
            boxShadow="sm"
          >
            {/* Expenses Tab */}
            <Tab
              _selected={{ 
                bg: useColorModeValue(
                  'linear-gradient(135deg, #fca5a5, #f87171)',
                  'linear-gradient(135deg, #dc2626, #b91c1c)'
                ),
                color: 'white',
                transform: 'translateY(-1px)',
                boxShadow: useColorModeValue(
                  '0 8px 25px rgba(239, 68, 68, 0.2)',
                  '0 8px 25px rgba(239, 68, 68, 0.4)'
                ),
                '& .icon-container': {
                  bg: 'rgba(255, 255, 255, 0.3)',
                },
                '& .icon': {
                  color: 'white',
                }
              }}
              borderRadius="xl"
              p={{ base: 3, sm: 4, md: 5 }}
              fontSize={{ base: 'sm', sm: 'md' }}
              fontWeight="700"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              color={useColorModeValue('gray.600', 'gray.300')}
              bg="transparent"
              _hover={{
                bg: useColorModeValue(
                  'linear-gradient(135deg, #fef2f2, #fecaca)',
                  'linear-gradient(135deg, #991b1b, #7f1d1d)'
                ),
                color: useColorModeValue('red.500', 'red.400'),
                transform: 'translateY(-1px)',
                boxShadow: 'lg',
                '& .icon-container': {
                  bg: useColorModeValue(
                    'rgba(239, 68, 68, 0.2)',
                    'rgba(239, 68, 68, 0.3)'
                  ),
                },
                '& .icon': {
                  color: useColorModeValue('#dc2626', '#f87171'),
                }
              }}
              flex="1"
              minH={{ base: '56px', sm: '60px' }}
              position="relative"
              overflow="hidden"
            >
              <HStack spacing={3} justify="center">
                <Box
                  className="icon-container"
                  p={2}
                  borderRadius="xl"
                  bg={useColorModeValue(
                    'rgba(239, 68, 68, 0.1)',
                    'rgba(239, 68, 68, 0.2)'
                  )}
                  transition="all 0.3s ease"
                  sx={{
                    animation: `${float} 3s ease-in-out infinite`,
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-2px)' }
                    }
                  }}
                >
                  <TrendingDown 
                    className="icon"
                    size={18} 
                    color={useColorModeValue('#ef4444', '#f87171')}
                    style={{ transition: 'color 0.3s ease' }}
                  />
                </Box>
                <Text 
                  fontSize={{ base: 'sm', sm: 'md' }}
                  fontWeight="700"
                  letterSpacing="wide"
                >
                  Expenses
                </Text>
              </HStack>
            </Tab>

            {/* Income Tab */}
            <Tab
              _selected={{ 
                bg: useColorModeValue(
                  'linear-gradient(135deg, #86efac, #4ade80)',
                  'linear-gradient(135deg, #16a34a, #15803d)'
                ),
                color: 'white',
                transform: 'translateY(-1px)',
                boxShadow: useColorModeValue(
                  '0 8px 25px rgba(34, 197, 94, 0.2)',
                  '0 8px 25px rgba(34, 197, 94, 0.4)'
                ),
                '& .icon-container': {
                  bg: 'rgba(255, 255, 255, 0.3)',
                },
                '& .icon': {
                  color: 'white',
                }
              }}
              borderRadius="xl"
              p={{ base: 3, sm: 4, md: 5 }}
              fontSize={{ base: 'sm', sm: 'md' }}
              fontWeight="700"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              color={useColorModeValue('gray.600', 'gray.300')}
              bg="transparent"
              _hover={{
                bg: useColorModeValue(
                  'linear-gradient(135deg, #f0fdf4, #bbf7d0)',
                  'linear-gradient(135deg, #166534, #14532d)'
                ),
                color: useColorModeValue('green.500', 'green.400'),
                transform: 'translateY(-1px)',
                boxShadow: 'lg',
                '& .icon-container': {
                  bg: useColorModeValue(
                    'rgba(34, 197, 94, 0.2)',
                    'rgba(34, 197, 94, 0.3)'
                  ),
                },
                '& .icon': {
                  color: useColorModeValue('#16a34a', '#4ade80'),
                }
              }}
              flex="1"
              minH={{ base: '56px', sm: '60px' }}
              position="relative"
              overflow="hidden"
            >
              <HStack spacing={3} justify="center">
                <Box
                  className="icon-container"
                  p={2}
                  borderRadius="xl"
                  bg={useColorModeValue(
                    'rgba(34, 197, 94, 0.1)',
                    'rgba(34, 197, 94, 0.2)'
                  )}
                  transition="all 0.3s ease"
                  sx={{
                    animation: `${float} 3s ease-in-out infinite 1.5s`,
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-2px)' }
                    }
                  }}
                >
                  <TrendingUp 
                    className="icon"
                    size={18} 
                    color={useColorModeValue('#22c55e', '#4ade80')}
                    style={{ transition: 'color 0.3s ease' }}
                  />
                </Box>
                <Text 
                  fontSize={{ base: 'sm', sm: 'md' }}
                  fontWeight="700"
                  letterSpacing="wide"
                >
                  Income
                </Text>
              </HStack>
            </Tab>
          </TabList>

          {/* Tab content panels */}
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
    </Box>
  )
}
