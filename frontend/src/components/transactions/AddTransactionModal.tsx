import {
  Modal,
  ModalOverlay,
  ModalContent,
  Card,
  CardBody,
  Box,
  Text,
  useColorModeValue,
  VStack,
  Button,
  Icon,
  HStack,
  Flex,
} from '@chakra-ui/react'
import { TrendingUp, TrendingDown, Plus, Minus, X } from 'lucide-react'
import { useThemeColors } from '../../hooks/useThemeColors'
import TransactionForm from './TransactionForm/TransactionForm'
import { Transaction } from '../../types'
import { animations, getGradients, safeAreaStyles, safariStyles, getResponsiveStyles, getScrollbarStyles, getShimmerStyles, getTransactionModalHeaderStyles } from '../ui'

// 🎨 Constantes para animações
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
  const headerStyles = getTransactionModalHeaderStyles(useColorModeValue, type)
  
  const handleTransactionCreated = () => {
    onTransactionCreated()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
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
        m={{ base: 0, md: 4 }}
        display="flex"
        flexDirection="column"
        {...responsiveStyles.modal}
        sx={{
          ...safeAreaStyles.container,
          ...safariStyles.modal,
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: useColorModeValue('#cbd5e1', '#4b5563'),
            borderRadius: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: useColorModeValue('#f1f5f9', '#1e293b'),
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
        
        {/* Main card with glassmorphism */}
        <Card
          position="relative"
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
          borderRadius={{ base: 'none', sm: '3xl' }}
          shadow="2xl"
          overflow="hidden"
          w="full"
          h="full"
          sx={{
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
          {/* Animated top bar */}
          <Box
            height="2px"
            sx={getShimmerStyles()}
          />
          
          <CardBody p={0} display="flex" flexDirection="column" h="full">
            <VStack spacing={0} align="stretch" h="full">
              {/* Header */}
              <Box {...headerStyles.container}>
                <Button 
                  onClick={onClose} 
                  {...headerStyles.closeButton}
                >
                  <Icon as={X} boxSize={headerStyles.closeButton.iconSize} />
                </Button>

                <Flex
                  direction="row"
                  align="center"
                  justify="center"
                  flexWrap="wrap"
                  pr={{ base: 14, sm: 20 }}
                  pt={{ base: 2, sm: 0 }}
                  gap={{ base: 2, sm: 3 }}
                >
                  {/* Logo + Text */}
                  <HStack
                    spacing={{ base: 2, sm: 3 }}
                    align="center"
                    flex="1"
                    minW={0}
                  >
                    <Box
                      p={{ base: 2, sm: 3 }}
                      borderRadius="2xl"
                      bg={headerStyles.iconContainer.bg}
                      boxShadow="lg"
                      flexShrink={0}
                      sx={{
                        animation: ANIMATIONS.pulse,
                        '@keyframes pulse': {
                          '0%, 100%': { 
                            boxShadow: `0 0 5px ${headerStyles.iconContainer.bg}40` 
                          },
                          '50%': { 
                            boxShadow: `0 0 20px ${headerStyles.iconContainer.bg}80, 0 0 30px ${headerStyles.iconContainer.bg}60` 
                          }
                        }
                      }}
                    >
                      {type === 'INCOME' ? <Plus size={20} color="white" /> : <Minus size={20} color="white" />}
                    </Box>
                    <VStack
                      align="start"
                      spacing={0}
                      flex="1"
                      minW={0}
                    >
                      <Text
                        color={headerStyles.title.color}
                        fontWeight="800"
                        fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                        lineHeight="shorter"
                        noOfLines={1}
                      >
                        {type === 'INCOME' ? 'Add Income' : 'Add Expense'}
                      </Text>
                      <Text
                        color={headerStyles.subtitle.color}
                        fontWeight="600"
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        noOfLines={1}
                      >
                        {type === 'INCOME' ? 'Track your incoming money' : 'Record your spending'}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Type Icon */}
                  <Box flexShrink={0}>
                    {type === 'INCOME' ? 
                      <TrendingUp size={20} color={headerStyles.iconContainer.bg} /> : 
                      <TrendingDown size={20} color={useColorModeValue('#ef4444', '#fca5a5')} />
                    }
                  </Box>
                </Flex>
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
          </CardBody>
        </Card>
      </ModalContent>
    </Modal>
  )
}
