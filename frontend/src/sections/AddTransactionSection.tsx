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
  Card,
  CardBody,
  Flex,
  Heading,
} from '@chakra-ui/react'
import { useThemeColors } from '../hooks/useThemeColors'
import { TrendingUp, TrendingDown, Plus, Minus, Sparkles } from 'lucide-react'
import { FormCard, TransactionForm } from '../components'
import { Transaction } from '../types'

// 🎨 Animações personalizadas aprimoradas
const shimmer = 'shimmer 4s ease-in-out infinite'
const float = 'float 3s ease-in-out infinite'
const pulse = 'pulse 2s ease-in-out infinite'
const glow = 'glow 3s ease-in-out infinite'
const slideIn = 'slideIn 0.6s ease-out'

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
      {/* 💳 Card wrapper for Add Transaction section - Otimizado para iPhone 14 Pro */}
      <Box 
        w="full" 
        px={{ base: 3, sm: 4, md: 6 }}
        sx={{
          // Safe area support para iPhone 14 Pro
          paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Box position="relative" mb={{ base: 6, md: 8 }}>
          {/* Background decorativo com gradiente */}
          <Box
            position="absolute"
            top="-50px"
            left="-50px"
            right="-50px"
            height="200px"
            background={useColorModeValue(
              'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(239, 68, 68, 0.1) 100%)',
              'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(239, 68, 68, 0.2) 100%)'
            )}
            borderRadius="3xl"
            filter="blur(40px)"
            opacity={0.6}
            zIndex={0}
          />
          
          {/* Card principal com glassmorphism */}
          <Card
            position="relative"
            bg={useColorModeValue(
              'rgba(255, 255, 255, 0.9)',
              'rgba(17, 17, 17, 0.9)'
            )}
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={useColorModeValue(
              'rgba(255, 255, 255, 0.2)',
              'rgba(255, 255, 255, 0.1)'
            )}
            borderRadius="3xl"
            shadow="2xl"
            overflow="hidden"
            sx={{
              animation: slideIn,
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
            {/* Barra superior animada */}
            <Box
              height="4px"
              background="linear-gradient(90deg, #22c55e, #3b82f6, #ef4444, #8b5cf6, #f59e0b)"
              backgroundSize="300% 100%"
              sx={{
                animation: shimmer,
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '-200% 0' },
                  '100%': { backgroundPosition: '200% 0' }
                }
              }}
            />
            
            <CardBody p={{ base: 4, sm: 5, md: 8 }}>
              <VStack spacing={{ base: 6, md: 8 }} align="stretch">
                {/* Header com design moderno - Otimizado para iPhone 14 Pro */}
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align="center"
                  justify="space-between"
                  gap={{ base: 3, sm: 4 }}
                >
                  <HStack spacing={{ base: 3, sm: 4 }} align="center">
                    <Box
                      p={{ base: 2.5, sm: 3 }}
                      borderRadius="2xl"
                      bg={useColorModeValue(
                        'linear-gradient(135deg, #22c55e, #16a34a)',
                        'linear-gradient(135deg, #4ade80, #22c55e)'
                      )}
                      boxShadow="lg"
                      sx={{
                        animation: glow,
                        '@keyframes glow': {
                          '0%, 100%': { 
                            boxShadow: '0 0 5px rgba(34, 197, 94, 0.3)' 
                          },
                          '50%': { 
                            boxShadow: '0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.4)' 
                          }
                        }
                      }}
                    >
                      <Icon as={Sparkles} boxSize={{ base: 5, sm: 6 }} color="white" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading
                        size={{ base: 'md', sm: 'lg' }}
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #1e293b, #475569)',
                          'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                        )}
                        bgClip="text"
                        fontWeight="800"
                      >
                        Quick Actions
                      </Heading>
                      <Text
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        color={colors.text.secondary}
                        fontWeight="500"
                        textAlign={{ base: 'center', sm: 'left' }}
                      >
                        Choose an action to quickly add a transaction
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Badge
                    colorScheme="green"
                    variant="solid"
                    borderRadius="full"
                    px={{ base: 3, sm: 4 }}
                    py={{ base: 1.5, sm: 2 }}
                    fontSize={{ base: 'xs', sm: 'sm' }}
                    fontWeight="600"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #22c55e, #16a34a)',
                      'linear-gradient(135deg, #4ade80, #22c55e)'
                    )}
                    boxShadow="md"
                  >
                    <HStack spacing={{ base: 1, sm: 2 }}>
                      <Icon as={Sparkles} boxSize={{ base: 2.5, sm: 3 }} />
                      <Text>NEW</Text>
                    </HStack>
                  </Badge>
                </Flex>

                {/* Botões de ação otimizados para iPhone 14 Pro */}
                <VStack
                  spacing={{ base: 3, sm: 4 }}
                  align="stretch"
                  w="full"
                >
                  {/* Layout responsivo: vertical no mobile, horizontal no desktop */}
                  <HStack
                    spacing={{ base: 3, sm: 4 }}
                    justify="center"
                    flexWrap="wrap"
                    display={{ base: 'none', sm: 'flex' }}
                  >
                    {/* Botão Add Money - Desktop */}
                    <Button
                      aria-label="Add income transaction"
                      onClick={handleAddIncome}
                      size="lg"
                      leftIcon={<Icon as={Plus} boxSize={5} />}
                      rightIcon={<Icon as={TrendingUp} boxSize={4} />}
                      borderRadius="2xl"
                      px={{ base: 8, md: 10 }}
                      py={6}
                      fontSize="lg"
                      fontWeight="800"
                      bg="linear-gradient(135deg, #22c55e, #16a34a, #15803d)"
                      color="white"
                      position="relative"
                      overflow="hidden"
                      minW={{ base: '160px', md: '200px' }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      letterSpacing="wide"
                      sx={{
                        animation: `${float} 3s ease-in-out infinite`,
                        '@keyframes float': {
                          '0%, 100%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-5px)' }
                        }
                      }}
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
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 25px 50px -12px rgba(34, 197, 94, 0.4)',
                        _before: {
                          left: '100%',
                        },
                      }}
                      _active={{
                        transform: 'translateY(-4px) scale(1.01)',
                      }}
                      boxShadow="0 10px 25px rgba(34, 197, 94, 0.3)"
                    >
                      Add Money
                    </Button>

                    {/* Botão Add Expense - Desktop */}
                    <Button
                      aria-label="Add expense transaction"
                      onClick={handleAddExpense}
                      size="lg"
                      leftIcon={<Icon as={Minus} boxSize={5} />}
                      rightIcon={<Icon as={TrendingDown} boxSize={4} />}
                      borderRadius="2xl"
                      px={{ base: 8, md: 10 }}
                      py={6}
                      fontSize="lg"
                      fontWeight="800"
                      bg="linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)"
                      color="white"
                      position="relative"
                      overflow="hidden"
                      minW={{ base: '160px', md: '200px' }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      letterSpacing="wide"
                      sx={{
                        animation: `${float} 3s ease-in-out infinite 1.5s`,
                        '@keyframes float': {
                          '0%, 100%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-5px)' }
                        }
                      }}
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
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)',
                        _before: {
                          left: '100%',
                        },
                      }}
                      _active={{
                        transform: 'translateY(-4px) scale(1.01)',
                      }}
                      boxShadow="0 10px 25px rgba(239, 68, 68, 0.3)"
                    >
                      Add Expense
                    </Button>
                  </HStack>

                  {/* Layout Mobile - Otimizado para iPhone 14 Pro */}
                  <VStack
                    spacing={3}
                    align="stretch"
                    display={{ base: 'flex', sm: 'none' }}
                  >
                    {/* Botão Add Money - Mobile */}
                    <Button
                      aria-label="Add income transaction"
                      onClick={handleAddIncome}
                      size="lg"
                      leftIcon={<Icon as={Plus} boxSize={6} />}
                      rightIcon={<Icon as={TrendingUp} boxSize={5} />}
                      borderRadius="2xl"
                      px={6}
                      py={8}
                      fontSize="lg"
                      fontWeight="800"
                      bg="linear-gradient(135deg, #22c55e, #16a34a, #15803d)"
                      color="white"
                      position="relative"
                      overflow="hidden"
                      w="full"
                      h="60px"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      letterSpacing="wide"
                      sx={{
                        animation: `${float} 3s ease-in-out infinite`,
                        '@keyframes float': {
                          '0%, 100%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-3px)' }
                        }
                      }}
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
                        transform: 'translateY(-4px) scale(1.01)',
                        boxShadow: '0 20px 40px -12px rgba(34, 197, 94, 0.4)',
                        _before: {
                          left: '100%',
                        },
                      }}
                      _active={{
                        transform: 'translateY(-2px) scale(0.99)',
                      }}
                      boxShadow="0 8px 20px rgba(34, 197, 94, 0.3)"
                    >
                      Add Money
                    </Button>

                    {/* Botão Add Expense - Mobile */}
                    <Button
                      aria-label="Add expense transaction"
                      onClick={handleAddExpense}
                      size="lg"
                      leftIcon={<Icon as={Minus} boxSize={6} />}
                      rightIcon={<Icon as={TrendingDown} boxSize={5} />}
                      borderRadius="2xl"
                      px={6}
                      py={8}
                      fontSize="lg"
                      fontWeight="800"
                      bg="linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)"
                      color="white"
                      position="relative"
                      overflow="hidden"
                      w="full"
                      h="60px"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      letterSpacing="wide"
                      sx={{
                        animation: `${float} 3s ease-in-out infinite 1.5s`,
                        '@keyframes float': {
                          '0%, 100%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-3px)' }
                        }
                      }}
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
                        transform: 'translateY(-4px) scale(1.01)',
                        boxShadow: '0 20px 40px -12px rgba(239, 68, 68, 0.4)',
                        _before: {
                          left: '100%',
                        },
                      }}
                      _active={{
                        transform: 'translateY(-2px) scale(0.99)',
                      }}
                      boxShadow="0 8px 20px rgba(239, 68, 68, 0.3)"
                    >
                      Add Expense
                    </Button>
                  </VStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Box>

      {/* 🧾 Modal with Transaction Form - Otimizado para iPhone 14 Pro */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: 'full', sm: 'md', md: 'lg', lg: 'xl' }}
        closeOnOverlayClick={false}
        isCentered={false}
        motionPreset="slideInBottom"
        scrollBehavior="inside"
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
