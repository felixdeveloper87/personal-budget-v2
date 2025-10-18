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
import { GRADIENTS } from '../../theme'
import { Transaction } from '../../types'
import { PeriodType } from '../../types'
import { useThemeColors } from '../../hooks/useThemeColors'
import { getResponsiveStyles, sectionTitleStyles } from '../ui'
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
  const responsiveStyles = getResponsiveStyles()
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
            <HStack spacing={{ base: 2, sm: 2, md: 3 }} align="center" justify="flex-start">
              <Box
                p={{ base: 2, sm: 2.5, md: 3 }}
                borderRadius="xl"
                bg={useColorModeValue('#dbeafe', '#1e293b')} // Azul post-it
                border="1px solid"
                borderColor={useColorModeValue('blue.200', 'blue.500')}
                boxShadow="sm"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderColor: useColorModeValue('blue.300', 'blue.400')
                }}
                transition="all 0.2s ease"
              >
                <Icon as={BarChart3} boxSize={{ base: 4, sm: 5, md: 6 }} color={useColorModeValue('blue.600', 'blue.300')} />
              </Box>
              <VStack align="flex-start" spacing={1} flex="0">
                <Heading
                  size={sectionTitleStyles.size}
                  color={useColorModeValue('gray.800', 'gray.100')}
                  fontWeight={sectionTitleStyles.fontWeight}
                  fontFamily={sectionTitleStyles.fontFamily}
                  letterSpacing={sectionTitleStyles.letterSpacing}
                  lineHeight={sectionTitleStyles.lineHeight}
                  textAlign="left"
                  whiteSpace="nowrap"
                >
                  Category Analysis
                </Heading>
                <Text
                  fontSize={{ base: 'xs', md: 'sm' }}
                  color={useColorModeValue('gray.600', 'gray.300')}
                  fontWeight="500"
                  textAlign="left"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  Detailed category breakdown and insights
                </Text>
              </VStack>
            </HStack>

            {/* Botões - linha separada no mobile */}
            <HStack spacing={{ base: 1, md: 2 }} justify={{ base: 'center', md: 'flex-end' }}>
              <Button
                size={{ base: 'xs', md: 'sm' }}
                leftIcon={<Icon as={TrendingDown} boxSize={{ base: 2, md: 3 }} />}
                borderRadius="xl"
                fontSize={{ base: '2xs', md: 'xs' }}
                fontWeight="500"
                px={{ base: 2, md: 3 }}
                py={{ base: 1, md: 2 }}
                h="auto"
                bg={useColorModeValue(
                  activeTab === 'expenses' ? '#fecaca' : GRADIENTS.cardLight,
                  activeTab === 'expenses' ? '#2d1b1b' : GRADIENTS.cardDark
                )}
                color={useColorModeValue(
                  activeTab === 'expenses' ? 'red.600' : 'gray.600',
                  activeTab === 'expenses' ? 'red.300' : 'gray.300'
                )}
                border="1px solid"
                borderColor={useColorModeValue(
                  activeTab === 'expenses' ? 'red.200' : 'gray.200',
                  activeTab === 'expenses' ? 'red.500' : 'gray.600'
                )}
                fontFamily="system-ui, -apple-system, sans-serif"
                backdropFilter="blur(10px)"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderColor: useColorModeValue('red.300', 'red.400'),
                  bg: useColorModeValue('red.50', 'red.900')
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s ease"
                onClick={() => setActiveTab('expenses')}
              >
                Expenses
              </Button>
              <Button
                size={{ base: 'xs', md: 'sm' }}
                leftIcon={<Icon as={TrendingUp} boxSize={{ base: 2, md: 3 }} />}
                borderRadius="xl"
                fontSize={{ base: '2xs', md: 'xs' }}
                fontWeight="500"
                px={{ base: 2, md: 3 }}
                py={{ base: 1, md: 2 }}
                h="auto"
                bg={useColorModeValue(
                  activeTab === 'incomes' ? '#dcfce7' : GRADIENTS.cardLight,
                  activeTab === 'incomes' ? '#1f2937' : GRADIENTS.cardDark
                )}
                color={useColorModeValue(
                  activeTab === 'incomes' ? 'green.600' : 'gray.600',
                  activeTab === 'incomes' ? 'green.300' : 'gray.300'
                )}
                border="1px solid"
                borderColor={useColorModeValue(
                  activeTab === 'incomes' ? 'green.200' : 'gray.200',
                  activeTab === 'incomes' ? 'green.500' : 'gray.600'
                )}
                fontFamily="system-ui, -apple-system, sans-serif"
                backdropFilter="blur(10px)"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderColor: useColorModeValue('green.300', 'green.400'),
                  bg: useColorModeValue('green.50', 'green.900')
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s ease"
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