import React, { useState } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { Transaction } from '../../types'
import { PeriodType } from '../../types'
import ExpenseChart from '../charts/ExpenseChart'
import IncomeChart from '../charts/IncomeChart'

interface CategoryAnalysisTabsProps {
  transactions: Transaction[]
  selectedPeriod: PeriodType
  activeTab?: 'expenses' | 'incomes'
  setActiveTab?: (tab: 'expenses' | 'incomes') => void
}

export default function CategoryAnalysisTabs({ 
  transactions, 
  selectedPeriod, 
  activeTab: externalActiveTab, 
  setActiveTab: externalSetActiveTab 
}: CategoryAnalysisTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<'expenses' | 'incomes'>('expenses')
  
  // Usar props externas se fornecidas, senão usar estado interno
  const activeTab = externalActiveTab ?? internalActiveTab
  const setActiveTab = externalSetActiveTab ?? setInternalActiveTab

  return (
    <Box w="full">
      <VStack spacing={{ base: 2, md: 1 }} align="stretch" w="full">
        {/* Charts */}
        <Box 
          w={{ base: 'calc(100% + 32px)', sm: 'calc(100% + 40px)', md: 'calc(100% + 48px)' }} 
          ml={{ base: '-16px', sm: '-20px', md: '-24px' }}
          mr={{ base: '-16px', sm: '-20px', md: '-24px' }}
        >
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
        </Box>
      </VStack>
    </Box>
  )
}