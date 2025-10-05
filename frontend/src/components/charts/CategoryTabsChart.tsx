import { 
  Box, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  useColorModeValue,
  HStack,
  Text,
  Badge,
  VStack,
  Card,
  CardBody
} from '@chakra-ui/react'
import { Transaction } from '../../types'
import ExpenseChart from './ExpenseChart'
import IncomeChart from './IncomeChart'
import { TrendingDown, TrendingUp, BarChart3 } from 'lucide-react'

interface CategoryTabsChartProps {
  transactions: Transaction[]
  selectedPeriod: string
}

export default function CategoryTabsChart({ transactions, selectedPeriod }: CategoryTabsChartProps) {
  const cardBg = useColorModeValue('white', '#111111')
  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const labelColor = useColorModeValue('gray.700', 'white')
  const tabSelectedBg = useColorModeValue('white', '#111111')
  const tabBorder = useColorModeValue('gray.200', 'gray.800')
  const iconColor = textColor

  return (
    <Card bg={cardBg} shadow="lg" borderRadius="2xl" border="1px" borderColor={borderColor} h="full">
      <CardBody p={0}>
        <VStack spacing={0} align="stretch" h="full">
          {/* Header */}
          <Box p={{ base: 4, md: 6 }} borderBottom="1px" borderColor={borderColor}>
            <HStack spacing={3} align="center">
              <BarChart3 size={20} color={iconColor} />
              <Text fontSize="lg" fontWeight="600" color={labelColor}>
                Category Analysis
              </Text>
              <Badge colorScheme="purple" borderRadius="full" px={3}>
                Charts
              </Badge>
            </HStack>
            <Text fontSize="sm" color={textColor} mt={2}>
              Detailed breakdown by income and expense categories
            </Text>
          </Box>

          {/* Tabs */}
          <Tabs 
            variant="enclosed" 
            colorScheme="blue" 
            defaultIndex={0} 
            flex="1" 
            display="flex" 
            flexDirection="column"
          >
            <TabList borderBottom="1px" borderColor={borderColor}>
              <Tab
                _selected={{ 
                  bg: tabSelectedBg, 
                  borderColor: tabBorder,
                  borderBottomColor: tabSelectedBg,
                  fontWeight: '600',
                  color: 'red.500'
                }}
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
                _selected={{ 
                  bg: tabSelectedBg, 
                  borderColor: tabBorder,
                  borderBottomColor: tabSelectedBg,
                  fontWeight: '600',
                  color: 'green.500'
                }}
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
      </CardBody>
    </Card>
  )
}
