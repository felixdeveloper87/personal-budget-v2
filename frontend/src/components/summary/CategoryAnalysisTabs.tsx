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
import { PeriodType } from '../ui'
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
      <VStack spacing={1} align="stretch">
        {/* Header com botões na mesma linha */}
        {showHeader && (
          <HStack spacing={4} align="center" justify="space-between" w="full">
            <HStack spacing={3} align="center">
              <Box
                p={2}
                borderRadius="xl"
                bg={useColorModeValue(
                  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  'linear-gradient(135deg, #a78bfa, #8b5cf6)'
                )}
                boxShadow="md"
              >
                <Icon as={BarChart3} boxSize={4} color="white" />
              </Box>
              <VStack align="start" spacing={0.5}>
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
                  fontSize={{ base: '2xs', sm: 'xs' }}
                  color={useColorModeValue('gray.500', 'gray.400')}
                  fontWeight="400"
                  opacity={0.8}
                >
                  Detailed category breakdown and insights
                </Text>
              </VStack>
            </HStack>

            {/* Botões compactos ao lado do header */}
            <HStack spacing={2}>
              <Button
                size="sm"
                variant={activeTab === 'expenses' ? 'solid' : 'outline'}
                colorScheme="red"
                leftIcon={<Icon as={TrendingDown} boxSize={3} />}
                borderRadius="lg"
                fontSize="xs"
                fontWeight="600"
                px={3}
                py={2}
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
                size="sm"
                variant={activeTab === 'incomes' ? 'solid' : 'outline'}
                colorScheme="green"
                leftIcon={<Icon as={TrendingUp} boxSize={3} />}
                borderRadius="lg"
                fontSize="xs"
                fontWeight="600"
                px={3}
                py={2}
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
          </HStack>
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