import React, { useState } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Transaction, PeriodType } from '../../types'
import CategoryExpenseChart from './CategoryExpenseChart'
import CategoryIncomeChart from './CategoryIncomeChart'

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
  
  // Use external props if provided, otherwise use internal state
  const activeTab = externalActiveTab ?? internalActiveTab
  
  return (
    <Box w="full">
      <VStack spacing={0} align="stretch" w="full">
        {/* Charts Area with AnimatePresence */}
        <Box 
          w={{ base: 'calc(100% + 32px)', sm: 'calc(100% + 40px)', md: 'calc(100% + 48px)' }} 
          ml={{ base: '-16px', sm: '-20px', md: '-24px' }}
          mr={{ base: '-16px', sm: '-20px', md: '-24px' }}
          position="relative"
          minH="400px" // Prevent layout jump during transition
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'expenses' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'expenses' ? 20 : -20 }}
              transition={{ 
                duration: 0.3, 
                ease: "easeOut",
                opacity: { duration: 0.2 }
              }}
              style={{ width: '100%' }}
            >
              {activeTab === 'expenses' ? (
                <CategoryExpenseChart
                  transactions={transactions}
                  selectedPeriod={selectedPeriod}
                />
              ) : (
                <CategoryIncomeChart
                  transactions={transactions}
                  selectedPeriod={selectedPeriod}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Box>
      </VStack>
    </Box>
  )
}