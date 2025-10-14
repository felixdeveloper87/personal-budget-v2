import React, { useState } from 'react'
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Icon, 
  Flex,
  Button,
  useColorModeValue
} from '@chakra-ui/react'
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import { Transaction } from '../../types'
import { PeriodType } from '../ui/PeriodNavigator'
import { useThemeColors } from '../../hooks/useThemeColors'
import ExpenseChart from '../charts/ExpenseChart'
import IncomeChart from '../charts/IncomeChart'

interface CategoryAnalysisTabsProps {
  transactions: Transaction[]
  selectedPeriod: PeriodType
  showHeader?: boolean
  activeTab?: 'expenses' | 'incomes'
  setActiveTab?: (tab: 'expenses' | 'incomes') => void
}

export default function CategoryAnalysisTabs({ 
  transactions, 
  selectedPeriod, 
  showHeader = true, 
  activeTab: externalActiveTab, 
  setActiveTab: externalSetActiveTab 
}: CategoryAnalysisTabsProps) {
  const colors = useThemeColors()
  const [internalActiveTab, setInternalActiveTab] = useState<'expenses' | 'incomes'>('expenses')
  
  // Usar props externas se fornecidas, senão usar estado interno
  const activeTab = externalActiveTab ?? internalActiveTab
  const setActiveTab = externalSetActiveTab ?? setInternalActiveTab

  return (
    <Box>
      <VStack spacing={{ base: 2, md: 1 }} align="stretch">
        {/* Header responsivo */}
        {showHeader && (
          <VStack spacing={{ base: 3, md: 0 }} align="stretch" w="full">
            {/* Header principal */}
            <HStack spacing={{ base: 2, md: 3 }} align="center" justify={{ base: 'center', md: 'flex-start' }}>
              <Box
                p={{ base: 1.5, md: 2 }}
                borderRadius="xl"
                bg={useColorModeValue(
                  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  'linear-gradient(135deg, #a78bfa, #8b5cf6)'
                )}
                boxShadow="md"
              >
                <Icon as={BarChart3} boxSize={{ base: 3, md: 4 }} color="white" />
              </Box>
              <VStack align={{ base: 'center', md: 'start' }} spacing={0.5}>
                <Heading
                  size={{ base: 'md', md: 'lg' }}
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
                  fontSize={{ base: 'xs', md: 'sm' }}
                  color={useColorModeValue('gray.500', 'gray.400')}
                  fontWeight="400"
                  textAlign={{ base: 'center', md: 'left' }}
                >
                  Detailed category breakdown and insights
                </Text>
              </VStack>
            </HStack>

            {/* Botões - linha separada no mobile */}
            <HStack spacing={{ base: 1, md: 2 }} justify={{ base: 'center', md: 'flex-end' }}>
              <Button
                size={{ base: 'xs', md: 'sm' }}
                variant={activeTab === 'expenses' ? 'solid' : 'outline'}
                colorScheme="red"
                leftIcon={<Icon as={TrendingDown} boxSize={{ base: 2, md: 3 }} />}
                borderRadius="lg"
                fontSize={{ base: '2xs', md: 'xs' }}
                fontWeight="600"
                px={{ base: 2, md: 3 }}
                py={{ base: 1, md: 2 }}
                h="auto"
                bg={activeTab === 'expenses' ? 'red.50' : 'transparent'}
                color={activeTab === 'expenses' ? 'red.600' : 'gray.600'}
                borderColor={activeTab === 'expenses' ? 'red.200' : 'gray.300'}
                _hover={{
                  bg: activeTab === 'expenses' ? 'red.100' : 'red.50',
                  color: 'red.600',
                  borderColor: 'red.300'
                }}
                onClick={() => setActiveTab('expenses')}
              >
                Expenses
              </Button>
              <Button
                size={{ base: 'xs', md: 'sm' }}
                variant={activeTab === 'incomes' ? 'solid' : 'outline'}
                colorScheme="green"
                leftIcon={<Icon as={TrendingUp} boxSize={3} />}
                borderRadius="lg"
                fontSize={{ base: '2xs', md: 'xs' }}
                fontWeight="600"
                px={{ base: 2, md: 3 }}
                py={{ base: 1, md: 2 }}
                h="auto"
                bg={activeTab === 'incomes' ? 'green.50' : 'transparent'}
                color={activeTab === 'incomes' ? 'green.600' : 'gray.600'}
                borderColor={activeTab === 'incomes' ? 'green.200' : 'gray.300'}
                _hover={{
                  bg: activeTab === 'incomes' ? 'green.100' : 'green.50',
                  color: 'green.600',
                  borderColor: 'green.300'
                }}
                onClick={() => setActiveTab('incomes')}
              >
                Incomes
              </Button>
            </HStack>
          </VStack>
        )}


        {/* Charts */}
        {activeTab === 'expenses' ? (
          <ExpenseChart
            transactions={transactions}
            selectedPeriod={selectedPeriod}
          />
        ) : (
          <IncomeChart
            transactions={transactions}
            selectedPeriod={selectedPeriod}
          />
        )}
      </VStack>
    </Box>
  )
}