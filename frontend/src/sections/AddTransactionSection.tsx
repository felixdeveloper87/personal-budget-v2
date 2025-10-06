import { useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useThemeColors } from '../hooks/useThemeColors'
import { TrendingUp, TrendingDown } from 'lucide-react'
import DashboardSection from './DashboardSection'
import { FormCard, TransactionForm } from '../components'
import { Transaction } from '../types'

interface AddTransactionSectionProps {
  transactions: Transaction[]
  onRefresh: () => void
}

export default function AddTransactionSection({ transactions, onRefresh }: AddTransactionSectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const colors = useThemeColors()

  const handleAddIncome = () => {
    setTransactionType('INCOME')
    onOpen()
  }

  const handleAddExpense = () => {
    setTransactionType('EXPENSE')
    onOpen()
  }

  const handleTransactionCreated = (transaction: Transaction) => {
    onRefresh()
    onClose()
  }

  return (
    <>
      <DashboardSection title="Quick Actions">
        <FormCard>
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            <Text 
              fontSize={{ base: "xs", sm: "sm" }} 
              color={colors.text.secondary} 
              textAlign="center"
              px={{ base: 2, sm: 0 }}
            >
              Choose an action to quickly add a transaction
            </Text>
            
            {/* Mobile layout (vertical) */}
            <VStack 
              spacing={{ base: 4, sm: 5 }} 
              align="stretch"
              display={{ base: "flex", sm: "none" }}
            >
              <Button
                onClick={handleAddIncome}
                size="lg"
                leftIcon={<TrendingUp size={28} />}
                borderRadius="2xl"
                px={8}
                py={8}
                fontSize="lg"
                fontWeight="800"
                bg="linear-gradient(135deg, #22c55e, #16a34a)"
                color="white"
                _hover={{ 
                  bg: 'linear-gradient(135deg, #16a34a, #15803d)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)'
                }}
                _active={{ 
                  bg: 'linear-gradient(135deg, #15803d, #166534)',
                  transform: 'translateY(0)'
                }}
                boxShadow="0 8px 20px rgba(34, 197, 94, 0.3)"
                w="full"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                letterSpacing="wide"
              >
                Add Money
              </Button>

              <Button
                onClick={handleAddExpense}
                size="lg"
                leftIcon={<TrendingDown size={28} />}
                borderRadius="2xl"
                px={8}
                py={8}
                fontSize="lg"
                fontWeight="800"
                bg="linear-gradient(135deg, #ef4444, #b91c1c)"
                color="white"
                _hover={{ 
                  bg: 'linear-gradient(135deg, #dc2626, #991b1b)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)'
                }}
                _active={{ 
                  bg: 'linear-gradient(135deg, #991b1b, #7f1d1d)',
                  transform: 'translateY(0)'
                }}
                boxShadow="0 8px 20px rgba(239, 68, 68, 0.3)"
                w="full"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                letterSpacing="wide"
              >
                Remove Money
              </Button>
            </VStack>

            {/* Desktop layout (horizontal) */}
            <HStack 
              spacing={{ base: 4, sm: 6, md: 8 }} 
              justify="center"
              display={{ base: "none", sm: "flex" }}
              flexWrap="wrap"
            >
              <Button
                onClick={handleAddIncome}
                size={{ base: "lg", sm: "xl", md: "2xl" }}
                leftIcon={<TrendingUp size={32} />}
                borderRadius="2xl"
                px={{ base: 12, sm: 16, md: 20, lg: 24 }}
                py={{ base: 6, sm: 8, md: 10 }}
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                fontWeight="800"
                bg="linear-gradient(135deg, #22c55e, #16a34a)"
                color="white"
                _hover={{ 
                  bg: 'linear-gradient(135deg, #16a34a, #15803d)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 30px rgba(34, 197, 94, 0.4)'
                }}
                _active={{ 
                  bg: 'linear-gradient(135deg, #15803d, #166534)',
                  transform: 'translateY(-1px)'
                }}
                boxShadow="0 10px 25px rgba(34, 197, 94, 0.3)"
                minW={{ base: "180px", sm: "220px", md: "260px", lg: "300px" }}
                flex={{ base: 1, sm: "none" }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                letterSpacing="wide"
              >
                Add Money
              </Button>

              <Button
                onClick={handleAddExpense}
                size={{ base: "lg", sm: "xl", md: "2xl" }}
                leftIcon={<TrendingDown size={32} />}
                borderRadius="2xl"
                px={{ base: 12, sm: 16, md: 20, lg: 24 }}
                py={{ base: 6, sm: 8, md: 10 }}
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                fontWeight="800"
                bg="linear-gradient(135deg, #ef4444, #b91c1c)"
                color="white"
                _hover={{ 
                  bg: 'linear-gradient(135deg, #dc2626, #991b1b)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 30px rgba(239, 68, 68, 0.4)'
                }}
                _active={{ 
                  bg: 'linear-gradient(135deg, #991b1b, #7f1d1d)',
                  transform: 'translateY(-1px)'
                }}
                boxShadow="0 10px 25px rgba(239, 68, 68, 0.3)"
                minW={{ base: "180px", sm: "220px", md: "260px", lg: "300px" }}
                flex={{ base: 1, sm: "none" }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                letterSpacing="wide"
              >
                Remove Money
              </Button>
            </HStack>
          </VStack>
        </FormCard>
      </DashboardSection>

      {/* Modal com TransactionForm */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={{ base: "full", sm: "md", md: "lg", lg: "xl" }}
        closeOnOverlayClick={false}
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay 
          bg="blackAlpha.700" 
          backdropFilter="blur(8px)" 
          css={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        />
        <ModalContent 
          borderRadius={{ base: "none", sm: "3xl", md: "3xl" }} 
          m={0} 
          h={{ base: "100vh", sm: "auto", md: "auto" }}
          maxH={{ base: "100vh", sm: "85vh", md: "80vh" }}
          overflow="hidden"
          mx={{ base: 0, sm: 4 }}
          my={{ base: 0, sm: 4 }}
          maxW={{ base: "100vw", sm: "95vw", md: "90vw", lg: "600px" }}
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          border="1px solid"
          borderColor={colors.border}
        >
          {/* Header com gradiente baseado no tipo */}
          <ModalHeader 
            textAlign="center" 
            borderBottom="1px" 
            borderColor={colors.border}
            fontSize={{ base: "xl", sm: "2xl" }}
            py={{ base: 6, sm: 8 }}
            bg={transactionType === 'INCOME' 
              ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
              : 'linear-gradient(135deg, #ef4444, #b91c1c)'
            }
            color="white"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
            />
            <Box position="relative" zIndex={1}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={3} mb={2}>
                {transactionType === 'INCOME' ? (
                  <TrendingUp size={28} />
                ) : (
                  <TrendingDown size={28} />
                )}
                <Text fontWeight="800" letterSpacing="wide">
                  {transactionType === 'INCOME' ? 'Add Income' : 'Add Expense'}
                </Text>
              </Box>
              <Text fontSize="sm" opacity={0.9} fontWeight="500">
                {transactionType === 'INCOME' 
                  ? 'Track your incoming money' 
                  : 'Record your spending'
                }
              </Text>
            </Box>
          </ModalHeader>

          <ModalCloseButton 
            size="lg"
            top={{ base: 4, sm: 6 }}
            right={{ base: 4, sm: 6 }}
            color="white"
            bg="rgba(0, 0, 0, 0.2)"
            borderRadius="full"
            _hover={{ bg: "rgba(0, 0, 0, 0.3)" }}
            zIndex={2}
          />

          <ModalBody 
            p={0} 
            overflowY="auto"
            css={{
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { 
                background: colors.border, 
                borderRadius: '3px',
                '&:hover': { background: colors.text.secondary }
              },
            }}
          >
            <Box p={{ base: 6, sm: 8, md: 10 }}>
              <TransactionForm
                transactions={transactions}
                onCreated={handleTransactionCreated}
                onTransactionDeleted={onRefresh}
                initialType={transactionType}
                showRecentTransactions={true}
                compact={true}
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
