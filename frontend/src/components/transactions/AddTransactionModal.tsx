import {
  Modal,
  ModalOverlay,
  ModalContent,
  Box,
  Text,
  useColorModeValue,
  VStack,
  Button,
  Icon,
} from '@chakra-ui/react'
import { TrendingUp, TrendingDown, Plus, Minus, X } from 'lucide-react'
import { useThemeColors } from '../../hooks/useThemeColors'
import TransactionForm from './TransactionForm/TransactionForm'
import { Transaction } from '../../types'
import { animations, getGradients, safeAreaStyles, safariStyles, getResponsiveStyles, getScrollbarStyles } from '../ui'

// 🎨 Constantes para gradientes e animações
const GRADIENTS = {
  income: 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)',
  expense: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
}

const ANIMATIONS = {
  shimmer: 'shimmer 4s ease-in-out infinite',
  pulse: 'pulse 2s ease-in-out infinite',
}

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'INCOME' | 'EXPENSE'
  transactions: Transaction[]
  onTransactionCreated: () => void
  onRefresh: () => void
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  type,
  transactions,
  onTransactionCreated,
  onRefresh,
}: AddTransactionModalProps) {
  const colors = useThemeColors()
  const gradients = getGradients()
  const responsiveStyles = getResponsiveStyles()
  const gradient = type === 'INCOME' ? GRADIENTS.income : GRADIENTS.expense
  const handleTransactionCreated = () => {
    onTransactionCreated()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl' }}
      isCentered
      scrollBehavior="inside"
      closeOnOverlayClick={false}
      closeOnEsc={true}
      blockScrollOnMount={true}
    >
      <ModalOverlay 
        bg="blackAlpha.600" 
        backdropFilter="blur(10px)"
      />
      <ModalContent 
        borderRadius={{ base: 'none', md: '3xl' }}
        overflow="visible"
        m={{ base: 0, md: 4 }}
        display="flex"
        flexDirection="column"
        bg={useColorModeValue(
          'rgba(255, 255, 255, 0.95)',
          'rgba(17, 17, 17, 0.95)'
        )}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={useColorModeValue(
          'rgba(255, 255, 255, 0.2)',
          'rgba(255, 255, 255, 0.1)'
        )}
        shadow="2xl"
        position="relative"
        {...responsiveStyles.modal}
        sx={{
          ...safeAreaStyles.container,
          ...safariStyles.modal,
          animation: animations.slideIn,
          '@keyframes slideIn': {
            from: { 
              opacity: 0, 
              transform: 'translateY(20px) scale(0.95)' 
            },
            to: { 
              opacity: 1, 
              transform: 'translateY(0) scale(1)' 
            }
          }
        }}
      >        
        {/* Decorative background */}
        <Box
          position="absolute"
          top="-50px"
          left="-50px"
          right="-50px"
          height="200px"
          background={gradients.decorative}
          borderRadius="3xl"
          filter="blur(40px)"
          opacity={0.6}
          zIndex={0}
        />
        
        <VStack spacing={0} align="stretch" h="full" overflow="hidden">
          {/* Header */}
          <Box
            textAlign="center"
            borderBottom="1px"
            borderColor={colors.border}
            py={{ base: 4, md: 6 }}
            bg={gradient}
            color="white"
            fontWeight="800"
            letterSpacing="wide"
            position="relative"
            sx={{ animation: animations.shimmer }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={{ base: 2, md: 3 }}
              mb={1}
            >
              <Box
                p={{ base: 1.5, md: 2 }}
                borderRadius="full"
                bg="rgba(255,255,255,0.2)"
                animation={ANIMATIONS.pulse}
                boxSize={{ base: 8, md: 10 }}
              >
                {type === 'INCOME' ? <Plus size={16} /> : <Minus size={16} />}
              </Box>
              <Text fontSize={{ base: 'md', md: 'lg' }}>
                {type === 'INCOME' ? 'Add Income' : 'Add Expense'}
              </Text>
              {type === 'INCOME' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </Box>
            <Text fontSize={{ base: 'xs', md: 'sm' }} opacity={0.9}>
              {type === 'INCOME' ? 'Track your incoming money' : 'Record your spending'}
            </Text>
            
            {/* Close button */}
            <Button
              position="absolute"
              top={{ base: 4, sm: 5, md: 6 }}
              right={{ base: 4, sm: 5, md: 6 }}
              size="lg"
              variant="ghost"
              onClick={onClose}
              borderRadius="full"
              p={3}
              bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(15, 23, 42, 0.8)')}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor={useColorModeValue('gray.300', 'gray.600')}
              _hover={{
                bg: useColorModeValue('red.50', 'red.900'),
                borderColor: 'red.300',
                transform: 'scale(1.1)',
                boxShadow: 'lg',
              }}
              _active={{
                transform: 'scale(0.95)',
              }}
              transition="all 0.2s ease"
              zIndex={10}
              boxShadow="md"
              aria-label="Close form"
            >
              <Icon as={X} boxSize={5} color={useColorModeValue('gray.700', 'gray.200')} />
            </Button>
          </Box>

          {/* Modal content - Scrollable */}
          <Box 
            flex="1" 
            p={responsiveStyles.spacing.container}
            overflowY="auto"
            {...responsiveStyles.content}
            sx={{
              ...safeAreaStyles.content,
              ...safariStyles.scrollable,
              ...getScrollbarStyles(useColorModeValue)
            }}
          >
            <TransactionForm
              transactions={transactions}
              onCreated={handleTransactionCreated}
              onTransactionDeleted={onRefresh}
              initialType={type}
              showRecentTransactions
              compact
            />
          </Box>
        </VStack>
      </ModalContent>
    </Modal>
  )
}
