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
  Icon,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { useThemeColors } from '../hooks/useThemeColors'
import { TrendingUp, TrendingDown, Plus, Minus, Sparkles } from 'lucide-react'
import { FormCard, TransactionForm } from '../components'
import { Transaction } from '../types'

// 🎨 Animações personalizadas
const pulse = 'pulse 2s ease-in-out infinite'
const float = 'float 3s ease-in-out infinite'
const shimmer = 'shimmer 3s ease-in-out infinite'

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
      {/* 💳 Card wrapper for Add Transaction section - Design Aprimorado */}
      <Box position="relative">
        {/* Barra colorida animada no topo */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="3px"
          background="linear-gradient(90deg, #22c55e, #3b82f6, #ef4444, #8b5cf6)"
          backgroundSize="200% 100%"
          borderRadius="2xl 2xl 0 0"
          zIndex={1}
          sx={{
            animation: `${shimmer} 3s ease-in-out infinite`,
          }}
        />
        <FormCard>
        <VStack spacing={{ base: 5, md: 6 }} align="stretch">
          {/* 🎯 Header com ícone e badge */}
          <VStack spacing={3} align="center">
            <HStack spacing={2} align="center">
              <Icon as={Sparkles} boxSize={5} color="blue.500" />
              <Text
                fontSize={{ base: 'sm', sm: 'md' }}
                fontWeight="600"
                color={colors.text.label}
                textAlign="center"
              >
                Quick Actions
              </Text>
              <Badge
                colorScheme="blue"
                variant="subtle"
                borderRadius="full"
                px={2}
                py={1}
                fontSize="xs"
              >
                New
              </Badge>
            </HStack>
            <Text
              fontSize={{ base: 'xs', sm: 'sm' }}
              color={colors.text.secondary}
              textAlign="center"
              px={{ base: 2, sm: 0 }}
              maxW="300px"
            >
              Choose an action to quickly add a transaction
            </Text>
          </VStack>

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
              leftIcon={<Plus size={20} aria-hidden="true" />}
              rightIcon={<TrendingUp size={18} aria-hidden="true" />}
              borderRadius="2xl"
              px={6}
              py={6}
              fontSize={{ base: "md", sm: "lg" }}
              fontWeight="800"
              bg="linear-gradient(135deg, #22c55e, #16a34a, #15803d)"
              backgroundSize="200% 100%"
              color="white"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s',
              }}
              _hover={{
                bg: 'linear-gradient(135deg, #16a34a, #15803d, #166534)',
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: '0 15px 35px rgba(34, 197, 94, 0.4), 0 5px 15px rgba(34, 197, 94, 0.2)',
                _before: {
                  left: '100%',
                },
              }}
              _active={{
                bg: 'linear-gradient(135deg, #15803d, #166534, #14532d)',
                transform: 'translateY(-1px) scale(0.98)',
                boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)',
              }}
              boxShadow="0 8px 20px rgba(34, 197, 94, 0.3)"
              w="full"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              letterSpacing="wide"
              animation={`${float} 3s ease-in-out infinite`}
            >
              Add Money
            </Button>

            <Button
              aria-label="Add expense transaction" // ♿ Accessibility
              onClick={handleAddExpense}
              size="lg"
              leftIcon={<Minus size={20} aria-hidden="true" />}
              rightIcon={<TrendingDown size={18} aria-hidden="true" />}
              borderRadius="2xl"
              px={6}
              py={6}
              fontSize={{ base: "md", sm: "lg" }}
              fontWeight="800"
              bg="linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)"
              backgroundSize="200% 100%"
              color="white"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s',
              }}
              _hover={{
                bg: 'linear-gradient(135deg, #dc2626, #b91c1c, #991b1b)',
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: '0 15px 35px rgba(239, 68, 68, 0.4), 0 5px 15px rgba(239, 68, 68, 0.2)',
                _before: {
                  left: '100%',
                },
              }}
              _active={{
                bg: 'linear-gradient(135deg, #b91c1c, #991b1b, #7f1d1d)',
                transform: 'translateY(-1px) scale(0.98)',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
              }}
              boxShadow="0 8px 20px rgba(239, 68, 68, 0.3)"
              w="full"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              letterSpacing="wide"
              animation={`${float} 3s ease-in-out infinite 1.5s`}
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
              leftIcon={<Plus size={28} aria-hidden="true" />}
              rightIcon={<TrendingUp size={24} aria-hidden="true" />}
              borderRadius="2xl"
              px={{ base: 12, sm: 16, md: 20, lg: 24 }}
              py={{ base: 6, sm: 8, md: 10 }}
              fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
              fontWeight="800"
              bg="linear-gradient(135deg, #22c55e, #16a34a, #15803d)"
              backgroundSize="200% 100%"
              color="white"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s',
              }}
              _hover={{
                bg: 'linear-gradient(135deg, #16a34a, #15803d, #166534)',
                transform: 'translateY(-4px) scale(1.02)',
                boxShadow: '0 20px 40px rgba(34, 197, 94, 0.4), 0 8px 20px rgba(34, 197, 94, 0.2)',
                _before: {
                  left: '100%',
                },
              }}
              _active={{
                bg: 'linear-gradient(135deg, #15803d, #166534, #14532d)',
                transform: 'translateY(-2px) scale(0.98)',
                boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)',
              }}
              boxShadow="0 10px 25px rgba(34, 197, 94, 0.3)"
              minW={{ base: '180px', sm: '220px', md: '260px', lg: '300px' }}
              flex={{ base: 1, sm: 'none' }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              letterSpacing="wide"
              animation={`${pulse} 4s ease-in-out infinite`}
            >
              Add Money
            </Button>

            <Button
              aria-label="Add expense transaction" // ♿ Accessibility
              onClick={handleAddExpense}
              size={{ base: 'lg', sm: 'xl', md: '2xl' }}
              leftIcon={<Minus size={28} aria-hidden="true" />}
              rightIcon={<TrendingDown size={24} aria-hidden="true" />}
              borderRadius="2xl"
              px={{ base: 12, sm: 16, md: 20, lg: 24 }}
              py={{ base: 6, sm: 8, md: 10 }}
              fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
              fontWeight="800"
              bg="linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)"
              backgroundSize="200% 100%"
              color="white"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s',
              }}
              _hover={{
                bg: 'linear-gradient(135deg, #dc2626, #b91c1c, #991b1b)',
                transform: 'translateY(-4px) scale(1.02)',
                boxShadow: '0 20px 40px rgba(239, 68, 68, 0.4), 0 8px 20px rgba(239, 68, 68, 0.2)',
                _before: {
                  left: '100%',
                },
              }}
              _active={{
                bg: 'linear-gradient(135deg, #b91c1c, #991b1b, #7f1d1d)',
                transform: 'translateY(-2px) scale(0.98)',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
              }}
              boxShadow="0 10px 25px rgba(239, 68, 68, 0.3)"
              minW={{ base: '180px', sm: '220px', md: '260px', lg: '300px' }}
              flex={{ base: 1, sm: 'none' }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              letterSpacing="wide"
              animation={`${pulse} 4s ease-in-out infinite 2s`}
            >
              Add Expense
            </Button>
          </HStack>
        </VStack>
        </FormCard>
      </Box>

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
          bg="blackAlpha.600"
          backdropFilter="blur(12px)"
          css={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
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
          boxShadow="0 32px 64px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
          border="1px solid"
          borderColor={colors.border}
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: transactionType === 'INCOME' 
              ? 'linear-gradient(90deg, #22c55e, #16a34a, #15803d)'
              : 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c)',
            borderRadius: '3xl 3xl 0 0',
          }}
          // 👇 Safe area support para iPhone 14 Pro
          sx={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
          }}
        >
          {/* 🏷️ Modal Header com design aprimorado e animações */}
          <ModalHeader
            textAlign="center"
            borderBottom="1px"
            borderColor={colors.border}
            fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
            py={{ base: 8, sm: 8, md: 8 }}
            px={{ base: 4, sm: 6, md: 8 }}
            bg={
              transactionType === 'INCOME'
                ? 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)'
                : 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)'
            }
            backgroundSize="200% 100%"
            color="white"
            position="relative"
            overflow="hidden"
            // 👇 Espaçamento extra para Dynamic Island/Notch
            sx={{
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 2rem)',
              animation: `${shimmer} 3s ease-in-out infinite`,
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
                  <Box
                    p={2}
                    borderRadius="full"
                    bg="rgba(255, 255, 255, 0.2)"
                    animation={`${pulse} 2s ease-in-out infinite`}
                  >
                    <Plus size={24} aria-hidden="true" />
                  </Box>
                ) : (
                  <Box
                    p={2}
                    borderRadius="full"
                    bg="rgba(255, 255, 255, 0.2)"
                    animation={`${pulse} 2s ease-in-out infinite`}
                  >
                    <Minus size={24} aria-hidden="true" />
                  </Box>
                )}
                <Text fontWeight="800" letterSpacing="wide">
                  {transactionType === 'INCOME' ? 'Add Income' : 'Add Expense'}
                </Text>
                {transactionType === 'INCOME' ? (
                  <TrendingUp size={20} aria-hidden="true" opacity={0.8} />
                ) : (
                  <TrendingDown size={20} aria-hidden="true" opacity={0.8} />
                )}
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
