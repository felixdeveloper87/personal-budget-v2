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
  VStack
} from '@chakra-ui/react'
import { Transaction } from '../../types'
import { useThemeColors } from '../../hooks/useThemeColors'
import ExpenseChart from './ExpenseChart'
import IncomeChart from './IncomeChart'
import { TrendingDown, TrendingUp, BarChart3 } from 'lucide-react'

interface CategoryTabsChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

/**
 * 📊 CategoryTabsChart - Componente base para análise de categorias
 * - Componente simples e reutilizável
 * - Sem UI/UX complexa (fica nas sections)
 * - Focado na funcionalidade básica
 */
export default function CategoryTabsChart({ transactions, selectedPeriod }: CategoryTabsChartProps) {
  const colors = useThemeColors()
  const isMobile = useBreakpointValue({ base: true, md: false })
  
  const tabStyle = {
    bg: colors.cardBg,
    borderColor: colors.border,
    borderBottomColor: colors.cardBg,
    fontWeight: '600',
  }

  return (
    <VStack spacing={0} align="stretch" h="full">
      {/* Header básico */}
      <Box p={{ base: 4, md: 6 }} borderBottom="1px" borderColor={colors.border}>
        <VStack spacing={4} align="stretch">
          <HStack spacing={3} align="center">
            <BarChart3 size={20} color={colors.text.secondary} />
            <Text fontSize="lg" fontWeight="600" color={colors.text.label}>
              Category Analysis
            </Text>
            {!isMobile && (
              <Badge colorScheme="purple" borderRadius="full" px={3}>
                Charts
              </Badge>
            )}
          </HStack>
          {!isMobile && (
            <Text fontSize="sm" color={colors.text.secondary}>
              Detailed breakdown by income and expense categories
            </Text>
          )}
        </VStack>
      </Box>

      {/* Tabs básicos */}
      <Tabs 
        variant="enclosed"
        colorScheme="blue"
        defaultIndex={0}
        flex="1"
        display="flex"
        flexDirection="column"
      >
        {/* Tab buttons básicos */}
        <TabList borderBottom="1px" borderColor={colors.border}>
          <Tab
            _selected={{ ...tabStyle, color: 'red.500' }}
            borderRadius="0"
            p={4}
            fontSize="sm"
          >
            <HStack spacing={2}>
              <TrendingDown size={16} />
              <Text>Expenses</Text>
            </HStack>
          </Tab>
          <Tab
            _selected={{ ...tabStyle, color: 'green.500' }}
            borderRadius="0"
            p={4}
            fontSize="sm"
          >
            <HStack spacing={2}>
              <TrendingUp size={16} />
              <Text>Income</Text>
            </HStack>
          </Tab>
        </TabList>

        {/* Tab content panels básicos */}
        <TabPanels flex="1" display="flex" flexDirection="column">
          <TabPanel p={0} flex="1">
            <Box p={{ base: 4, md: 6 }} flex="1">
              <ExpenseChart
                transactions={transactions}
                selectedPeriod={selectedPeriod}
              />
            </Box>
          </TabPanel>
          <TabPanel p={0} flex="1">
            <Box p={{ base: 4, md: 6 }} flex="1">
              <IncomeChart
                transactions={transactions}
                selectedPeriod={selectedPeriod}
              />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}