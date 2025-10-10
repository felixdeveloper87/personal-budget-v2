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
import { FormCard, TransactionForm } from '../components'
import { Transaction } from '../types'

interface AddTransactionSectionProps {
  transactions: Transaction[]
  onRefresh: () => void
}

/**
 * 💰 AddTransactionSection
 * - Displays quick "Add Money" and "Add Expense" buttons
 * - Opens a modal containing the TransactionForm
 * - Handles both INCOME and EXPENSE transaction creation flows
 */
export default function AddTransactionSection({
  transactions,
  onRefresh,
}: AddTransactionSectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const colors = useThemeColors()

  /** 🔹 Opens modal for adding income */
  const handleAddIncome = () => {
    setTransactionType('INCOME')
    onOpen()
  }

  /** 🔹 Opens modal for adding expense */
  const handleAddExpense = () => {
    setTransactionType('EXPENSE')
    onOpen()
  }

  /** 🔹 Refresh dashboard after successful transaction creation */
  const handleTransactionCreated = (transaction: Transaction) => {
    onRefresh()
    onClose()
  }

  return (
    <>
      {/* 💳 Card wrapper for Add Transaction section */}
      <FormCard>
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          <Text
            fontSize={{ base: 'xs', sm: 'sm' }}
            color={colors.text.secondary}
            textAlign="center"
            px={{ base: 2, sm: 0 }}
          >
            Choose an action to quickly add a transaction
          </Text>

          {/* 📱 Mobile layout (stacked buttons) - Otimizado para iPhone */}
          <VStack
            spacing={{ base: 3, sm: 4 }}
            align="stretch"
            display={{ base: 'flex', sm: 'none' }}
          >
            <Button
              aria-label="Add income transaction" // ♿ Accessibility
              onClick={handleAddIncome}
              size="lg"
              leftIcon={<TrendingUp size={24} aria-hidden="true" />}
              borderRadius="2xl"
              px={6}
              py={6}
              fontSize={{ base: "md", sm: "lg" }}
              fontWeight="800"
              bg="linear-gradient(135deg, #22c55e, #16a34a)"
              color="white"
              _hover={{
                bg: 'linear-gradient(135deg, #16a34a, #15803d)',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)',
              }}
              _active={{
                bg: 'linear-gradient(135deg, #15803d, #166534)',
                transform: 'translateY(0)',
              }}
              boxShadow="0 8px 20px rgba(34, 197, 94, 0.3)"
              w="full"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              letterSpacing="wide"
            >
              Add Money
            </Button>

            <Button
              aria-label="Add expense transaction" // ♿ Accessibilityy
              onClick={handleAddExpense}
              size="lg"
              leftIcon={<TrendingDown size={24} aria-hidden="true" />}
              borderRadius="2xl"
              px={6}
              py={6}
              fontSize={{ base: "md", sm: "lg" }}
              fontWeight="800"
              bg="linear-gradient(135deg, #ef4444, #b91c1c)"
              color="white"
              _hover={{
                bg: 'linear-gradient(135deg, #dc2626, #991b1b)',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
              }}
              _active={{
                bg: 'linear-gradient(135deg, #991b1b, #7f1d1d)',
                transform: 'translateY(0)',
              }}
              boxShadow="0 8px 20px rgba(239, 68, 68, 0.3)"
              w="full"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              letterSpacing="wide"
            >
              Add Expense
            </Button>
          </VStack>

          {/* 💻 Desktop layout (side-by-side buttons) */}
          <HStack
            spacing={{ base: 4, sm: 6, md: 8 }}
            justify="center"
            display={{ base: 'none', sm: 'flex' }}
            flexWrap="wrap"
          >
            <Button
              aria-label="Add income transaction" // ♿ Accessibility
              onClick={handleAddIncome}
              size={{ base: 'lg', sm: 'xl', md: '2xl' }}
              leftIcon={<TrendingUp size={32} aria-hidden="true" />}
              borderRadius="2xl"
              px={{ base: 12, sm: 16, md: 20, lg: 24 }}
              py={{ base: 6, sm: 8, md: 10 }}
              fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
              fontWeight="800"
              bg="linear-gradient(135deg, #22c55e, #16a34a)"
              color="white"
              _hover={{
                bg: 'linear-gradient(135deg, #16a34a, #15803d)',
                transform: 'translateY(-3px)',
                boxShadow: '0 15px 30px rgba(34, 197, 94, 0.4)',
              }}
              _active={{
                bg: 'linear-gradient(135deg, #15803d, #166534)',
                transform: 'translateY(-1px)',
              }}
              boxShadow="0 10px 25px rgba(34, 197, 94, 0.3)"
              minW={{ base: '180px', sm: '220px', md: '260px', lg: '300px' }}
              flex={{ base: 1, sm: 'none' }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              letterSpacing="wide"
            >
              Add Money
            </Button>

            <Button
              aria-label="Add expense transaction" // ♿ Accessibility
              onClick={handleAddExpense}
              size={{ base: 'lg', sm: 'xl', md: '2xl' }}
              leftIcon={<TrendingDown size={32} aria-hidden="true" />}
              borderRadius="2xl"
              px={{ base: 12, sm: 16, md: 20, lg: 24 }}
              py={{ base: 6, sm: 8, md: 10 }}
              fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
              fontWeight="800"
              bg="linear-gradient(135deg, #ef4444, #b91c1c)"
              color="white"
              _hover={{
                bg: 'linear-gradient(135deg, #dc2626, #991b1b)',
                transform: 'translateY(-3px)',
                boxShadow: '0 15px 30px rgba(239, 68, 68, 0.4)',
              }}
              _active={{
                bg: 'linear-gradient(135deg, #991b1b, #7f1d1d)',
                transform: 'translateY(-1px)',
              }}
              boxShadow="0 10px 25px rgba(239, 68, 68, 0.3)"
              minW={{ base: '180px', sm: '220px', md: '260px', lg: '300px' }}
              flex={{ base: 1, sm: 'none' }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              letterSpacing="wide"
            >
              Add Expense
            </Button>
          </HStack>
        </VStack>
      </FormCard>

      {/* 🧾 Modal with Transaction Form - Otimizado para iPhone 14 Pro */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: 'full', sm: 'md', md: 'lg', lg: 'xl' }}
        closeOnOverlayClick={false}
        isCentered={false}
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
          borderRadius={{ base: 'none', sm: '3xl', md: '3xl' }}
          m={0}
          h={{ base: '100dvh', sm: 'auto', md: 'auto' }}
          maxH={{ base: '100dvh', sm: '85vh', md: '80vh' }}
          overflow="hidden"
          mx={{ base: 0, sm: 4 }}
          my={{ base: 0, sm: 4 }}
          maxW={{ base: '100vw', sm: '95vw', md: '90vw', lg: '600px' }}
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          border="1px solid"
          borderColor={colors.border}
          // 👇 Safe area support para iPhone 14 Pro
          sx={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
          }}
        >
          {/* 🏷️ Modal Header com espaçamento adequado para iPhone 14 Pro */}
          <ModalHeader
            textAlign="center"
            borderBottom="1px"
            borderColor={colors.border}
            fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
            py={{ base: 8, sm: 8, md: 8 }}
            px={{ base: 4, sm: 6, md: 8 }}
            bg={
              transactionType === 'INCOME'
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'linear-gradient(135deg, #ef4444, #b91c1c)'
            }
            color="white"
            position="relative"
            overflow="hidden"
            // 👇 Espaçamento extra para Dynamic Island/Notch
            sx={{
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 2rem)',
            }}
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
                  <TrendingUp size={28} aria-hidden="true" />
                ) : (
                  <TrendingDown size={28} aria-hidden="true" />
                )}
                <Text fontWeight="800" letterSpacing="wide">
                  {transactionType === 'INCOME' ? 'Add Income' : 'Add Expense'}
                </Text>
              </Box>
              <Text fontSize="sm" opacity={0.9} fontWeight="500">
                {transactionType === 'INCOME'
                  ? 'Track your incoming money'
                  : 'Record your spending'}
              </Text>
            </Box>
          </ModalHeader>

          <ModalCloseButton
            aria-label="Close transaction form" // ♿ Accessibility
            size="lg"
            top={{ base: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)', sm: 6 }}
            right={{ base: 4, sm: 6 }}
            color="white"
            bg="rgba(0, 0, 0, 0.3)"
            borderRadius="full"
            _hover={{ bg: 'rgba(0, 0, 0, 0.5)' }}
            zIndex={2}
            backdropFilter="blur(8px)"
          />

          {/* 🧩 Modal Body otimizado para iPhone 14 Pro */}
          <ModalBody
            p={0}
            overflowY="auto"
            maxH={{ base: 'calc(100dvh - 200px)', sm: '70vh' }}
            // 👇 Safe area completo para iPhone 14 Pro
            sx={{
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
              paddingLeft: 'env(safe-area-inset-left, 0px)',
              paddingRight: 'env(safe-area-inset-right, 0px)',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              overscrollBehavior: 'contain',
            }}
            css={{
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                background: colors.border,
                borderRadius: '3px',
                '&:hover': { background: colors.text.secondary },
              },
            }}
          >
            <Box p={{ base: 4, sm: 6, md: 8, lg: 10 }}>
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
