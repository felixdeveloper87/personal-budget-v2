import { useState, useMemo } from 'react'
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
import { TransactionForm } from '../components'
import { Transaction } from '../types'

// 🎨 Constantes para gradientes e animações
const GRADIENTS = {
  income: 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)',
  expense: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
  ambientLight: (isDark: boolean) =>
    isDark
      ? 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(59,130,246,0.2) 50%, rgba(239,68,68,0.2) 100%)'
      : 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(59,130,246,0.1) 50%, rgba(239,68,68,0.1) 100%)',
}

const ANIMATIONS = {
  shimmer: 'shimmer 4s ease-in-out infinite',
  float: 'float 3s ease-in-out infinite',
  pulse: 'pulse 2s ease-in-out infinite',
  glow: 'glow 3s ease-in-out infinite',
  slideIn: 'slideIn 0.6s ease-out',
}

interface AddTransactionSectionProps {
  transactions: Transaction[]
  onRefresh: () => void
}

export default function AddTransactionSection({ transactions, onRefresh }: AddTransactionSectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const colors = useThemeColors()
  const isDark = useColorModeValue(false, true)

  const gradient = useMemo(
    () => (type === 'INCOME' ? GRADIENTS.income : GRADIENTS.expense),
    [type]
  )

  const handleOpen = (t: 'INCOME' | 'EXPENSE') => {
    setType(t)
    onOpen()
  }

  const handleTransactionCreated = () => {
    onRefresh()
    onClose()
  }

  return (
    <>
      {/* 💳 Add Transaction Section */}
      <Box
        w="full"
        px={{ base: 3, sm: 4, md: 6 }}
        sx={{
          paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Box position="relative" mb={{ base: 6, md: 8 }}>
          {/* Background Blur Glow */}
          <Box
            position="absolute"
            top="-50px"
            left="-50px"
            right="-50px"
            height="200px"
            background={GRADIENTS.ambientLight(isDark)}
            borderRadius="3xl"
            filter="blur(40px)"
            opacity={0.6}
            zIndex={0}
          />

          {/* Card Principal */}
          <Card
            position="relative"
            bg={useColorModeValue('rgba(255,255,255,0.9)', 'rgba(17,17,17,0.9)')}
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={useColorModeValue('rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)')}
            borderRadius="3xl"
            shadow="2xl"
            overflow="hidden"
            sx={{
              animation: ANIMATIONS.slideIn,
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
                to: { opacity: 1, transform: 'translateY(0) scale(1)' },
              },
            }}
          >
            {/* Linha Superior Animada */}
            <Box
              height="4px"
              background="linear-gradient(90deg, #22c55e, #3b82f6, #ef4444, #8b5cf6, #f59e0b)"
              backgroundSize="300% 100%"
              sx={{
                animation: ANIMATIONS.shimmer,
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '-200% 0' },
                  '100%': { backgroundPosition: '200% 0' },
                },
              }}
            />

            <CardBody p={{ base: 4, sm: 5, md: 8 }}>
              <VStack spacing={{ base: 6, md: 8 }} align="stretch">
                {/* Header */}
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align={{ base: 'center', sm: 'center' }}
                  justify="space-between"
                  gap={{ base: 2, sm: 4 }}
                  textAlign={{ base: 'center', sm: 'left' }}
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
                        animation: ANIMATIONS.glow,
                        '@keyframes glow': {
                          '0%,100%': { boxShadow: '0 0 5px rgba(34,197,94,0.3)' },
                          '50%': {
                            boxShadow:
                              '0 0 20px rgba(34,197,94,0.6), 0 0 30px rgba(34,197,94,0.4)',
                          },
                        },
                      }}
                    >
                      <Icon as={Sparkles} boxSize={{ base: 5, sm: 6 }} color="white" />
                    </Box>

                    <VStack align={{ base: 'center', sm: 'start' }} spacing={0}>
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
                      >
                        Choose an action to quickly add a transaction
                      </Text>
                    </VStack>
                  </HStack>
                </Flex>

                {/* Botões */}
                <HStack
                  spacing={{ base: 3, sm: 4 }}
                  justify="center"
                  flexWrap="wrap"
                  direction={{ base: 'column', sm: 'row' }}
                  w="full"
                >
                  {[
                    {
                      label: 'Add Money',
                      icon: Plus,
                      accent: TrendingUp,
                      gradient: GRADIENTS.income,
                      type: 'INCOME' as const,
                    },
                    {
                      label: 'Add Expense',
                      icon: Minus,
                      accent: TrendingDown,
                      gradient: GRADIENTS.expense,
                      type: 'EXPENSE' as const,
                    },
                  ].map(({ label, icon, accent, gradient, type: t }, i) => (
                    <Button
                      key={t}
                      aria-label={label}
                      onClick={() => handleOpen(t)}
                      size="lg"
                      leftIcon={<Icon as={icon} boxSize={5} />}
                      rightIcon={<Icon as={accent} boxSize={4} />}
                      borderRadius="2xl"
                      px={{ base: 8, md: 10 }}
                      py={6}
                      fontSize="lg"
                      fontWeight="800"
                      bg={gradient}
                      color="white"
                      position="relative"
                      overflow="hidden"
                      minW={{ base: '160px', md: '200px' }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      letterSpacing="wide"
                      sx={{
                        animation: `${ANIMATIONS.float} ${i ? '1.5s' : '0s'} infinite`,
                        '@keyframes float': {
                          '0%,100%': { transform: 'translateY(0)' },
                          '50%': { transform: 'translateY(-5px)' },
                        },
                      }}
                      _hover={{
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 25px 50px -12px ${
                          t === 'INCOME'
                            ? 'rgba(34,197,94,0.4)'
                            : 'rgba(239,68,68,0.4)'
                        }`,
                      }}
                      boxShadow={`0 10px 25px ${
                        t === 'INCOME'
                          ? 'rgba(34,197,94,0.3)'
                          : 'rgba(239,68,68,0.3)'
                      }`}
                    >
                      {label}
                    </Button>
                  ))}
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Box>

      {/* 🧾 Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: 'full', sm: 'md', md: 'lg', lg: 'xl' }}
        closeOnOverlayClick={false}
        motionPreset="slideInBottom"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(12px)" />
        <ModalContent
          borderRadius={{ base: 'none', sm: '3xl' }}
          h={{ base: '100dvh', sm: 'auto' }}
          maxH={{ base: '100dvh', sm: '85vh' }}
          mx={{ base: 0, sm: 4 }}
          my={{ base: 0, sm: 4 }}
          border="1px solid"
          borderColor={colors.border}
          boxShadow="0 32px 64px -12px rgba(0,0,0,0.4)"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: gradient,
          }}
          sx={{
            padding: 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
          }}
        >
          <ModalHeader
            textAlign="center"
            borderBottom="1px"
            borderColor={colors.border}
            py={8}
            bg={gradient}
            color="white"
            fontWeight="800"
            letterSpacing="wide"
            position="relative"
            sx={{ animation: ANIMATIONS.shimmer }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={3}
              mb={2}
            >
              <Box
                p={2}
                borderRadius="full"
                bg="rgba(255,255,255,0.2)"
                animation={ANIMATIONS.pulse}
              >
                {type === 'INCOME' ? <Plus size={22} /> : <Minus size={22} />}
              </Box>
              <Text>{type === 'INCOME' ? 'Add Income' : 'Add Expense'}</Text>
              {type === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </Box>
            <Text fontSize="sm" opacity={0.9}>
              {type === 'INCOME' ? 'Track your incoming money' : 'Record your spending'}
            </Text>
          </ModalHeader>

          <ModalCloseButton
            aria-label="Close form"
            color="white"
            bg="rgba(0,0,0,0.3)"
            borderRadius="full"
            _hover={{ bg: 'rgba(0,0,0,0.5)' }}
          />

          <ModalBody
            p={0}
            overflowY="auto"
            maxH={{ base: 'calc(100dvh - 200px)', sm: '70vh' }}
            sx={{
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <Box p={{ base: 4, sm: 6, md: 8 }}>
              <TransactionForm
                transactions={transactions}
                onCreated={handleTransactionCreated}
                onTransactionDeleted={onRefresh}
                initialType={type}
                showRecentTransactions
                compact
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
