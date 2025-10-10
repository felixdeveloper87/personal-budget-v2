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
} from '@chakra-ui/react'
import { Transaction } from '../types'
import { useThemeColors } from '../hooks/useThemeColors'
import ExpenseChart from '../components/charts/ExpenseChart'
import IncomeChart from '../components/charts/IncomeChart'
import { TrendingDown, TrendingUp, BarChart3, Sparkles } from 'lucide-react'

// 🎨 Animações personalizadas
const pulse = 'pulse 2s ease-in-out infinite'
const float = 'float 3s ease-in-out infinite'
const shimmer = 'shimmer 3s ease-in-out infinite'

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
    <Box position="relative" w="full">
      {/* Barra colorida animada no topo */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="3px"
        background="linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981, #f59e0b)"
        backgroundSize="200% 100%"
        borderRadius="2xl 2xl 0 0"
        zIndex={1}
        sx={{
          animation: `${shimmer} 3s ease-in-out infinite`,
        }}
      />
      <Card
        bg={colors.cardBg}
        shadow="lg"
        borderRadius="2xl"
        border="1px"
        borderColor={colors.border}
        w="full"
      >
        <CardBody p={0}>
          <VStack spacing={0} align="stretch" h="full">
            {/* Header com design aprimorado */}
            <Box 
              p={{ base: 4, sm: 5, md: 6 }} 
              borderBottom="1px" 
              borderColor={colors.border}
              position="relative"
            >
              <VStack spacing={{ base: 2, sm: 3 }} align="center">
                <HStack spacing={2} align="center" flexWrap="wrap" justify="center">
                  <Icon as={BarChart3} boxSize={5} color="purple.500" />
                  <Text
                    fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
                    fontWeight="700"
                    color={colors.text.label}
                    textAlign="center"
                  >
                    Category Analysis
                  </Text>
                  <Badge
                    colorScheme="purple"
                    variant="subtle"
                    borderRadius="full"
                    px={{ base: 2, sm: 3 }}
                    py={{ base: 1, sm: 1 }}
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    fontWeight="600"
                  >
                    Charts
                  </Badge>
                </HStack>
                <Text
                  fontSize={{ base: 'sm', sm: 'md' }}
                  color={colors.text.secondary}
                  textAlign="center"
                  maxW={{ base: '280px', sm: '320px', md: '400px' }}
                  lineHeight="shorter"
                  px={2}
                >
                  Detailed breakdown by income and expense categories
                </Text>
              </VStack>
            </Box>

            {/* Tabs com design aprimorado */}
            <Tabs 
              variant="enclosed"
              colorScheme="purple"
              defaultIndex={0}
              flex="1"
              display="flex"
              flexDirection="column"
            >
              {/* Tab buttons com design aprimorado */}
              <TabList 
                borderBottom="1px" 
                borderColor={colors.border}
                bg={colors.cardBg}
              >
                {/* Expenses Tab */}
                <Tab
                  _selected={{ 
                    ...tabStyle, 
                    color: 'red.500',
                    bg: 'red.50',
                    borderColor: 'red.200',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  }}
                  borderRadius="0"
                  p={{ base: 3, sm: 4 }}
                  fontSize={{ base: 'xs', sm: 'sm' }}
                  fontWeight="600"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: 'red.50',
                    color: 'red.500',
                    transform: 'translateY(-1px)',
                  }}
                  flex="1"
                >
                  <HStack spacing={2} justify="center">
                    <Box
                      p={1}
                      borderRadius="full"
                      bg="red.100"
                      animation={`${float} 3s ease-in-out infinite`}
                    >
                      <TrendingDown size={16} />
                    </Box>
                    <Text>Expenses</Text>
                  </HStack>
                </Tab>

                {/* Income Tab */}
                <Tab
                  _selected={{ 
                    ...tabStyle, 
                    color: 'green.500',
                    bg: 'green.50',
                    borderColor: 'green.200',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
                  }}
                  borderRadius="0"
                  p={{ base: 3, sm: 4 }}
                  fontSize={{ base: 'xs', sm: 'sm' }}
                  fontWeight="600"
                  transition="all 0.2s ease"
                  _hover={{
                    bg: 'green.50',
                    color: 'green.500',
                    transform: 'translateY(-1px)',
                  }}
                  flex="1"
                >
                  <HStack spacing={2} justify="center">
                    <Box
                      p={1}
                      borderRadius="full"
                      bg="green.100"
                      animation={`${float} 3s ease-in-out infinite 1.5s`}
                    >
                      <TrendingUp size={16} />
                    </Box>
                    <Text>Income</Text>
                  </HStack>
                </Tab>
              </TabList>

              {/* Tab content panels com design aprimorado */}
              <TabPanels flex="1" display="flex" flexDirection="column">
                {/* Expense Chart Panel */}
                <TabPanel p={0} flex="1">
                  <Box 
                    p={{ base: 4, sm: 5, md: 6 }} 
                    flex="1"
                    bg="linear-gradient(135deg, rgba(239, 68, 68, 0.02), rgba(239, 68, 68, 0.05))"
                    minH={{ base: '300px', sm: '350px', md: '400px' }}
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
                    p={{ base: 4, sm: 5, md: 6 }} 
                    flex="1"
                    bg="linear-gradient(135deg, rgba(34, 197, 94, 0.02), rgba(34, 197, 94, 0.05))"
                    minH={{ base: '300px', sm: '350px', md: '400px' }}
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
  )
}
