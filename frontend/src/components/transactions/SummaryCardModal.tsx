import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Center,
  Spinner,
  useColorModeValue,
  Icon as ChakraIcon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import React, { ReactNode, useMemo } from 'react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { TransactionsChart, IncomeChart, ExpensesChart, BalanceChart } from '../charts/modal'
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

const MotionBox = motion.create(Box)
const MotionVStack = motion.create(VStack)
const MotionBadge = motion.create(Badge)

// ✅ Tipagem explícita das props do modal
interface SummaryCardModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCard: 'transactions' | 'income' | 'expenses' | 'balance' | null | undefined
  cardLabel?: string
  transactions?: any[]
  selectedPeriod?: string
  currentBalance?: number
}

export default function SummaryCardModal({
  isOpen,
  onClose,
  selectedCard,
  transactions = [],
  selectedPeriod = 'Current Period',
  currentBalance = 0,
}: SummaryCardModalProps) {
  const colors = useThemeColors()

  // ✅ Tipagem do mapa de ícones e informações
  type HeaderKey = 'transactions' | 'income' | 'expenses' | 'balance'

  interface HeaderInfo {
    icon: React.ElementType
    title: string
    subtitle: string
    color: string
    bg: string
    bgDark: string
  }

  const headerInfoMap: Record<HeaderKey, HeaderInfo> = {
    transactions: {
      icon: BarChart3,
      title: 'Transaction Analytics',
      subtitle: 'Complete overview of your activity',
      color: 'blue.500',
      bg: 'blue.50',
      bgDark: 'blue.900',
    },
    income: {
      icon: TrendingUp,
      title: 'Income Analysis',
      subtitle: 'Track and visualize your income streams',
      color: 'green.500',
      bg: 'green.50',
      bgDark: 'green.900',
    },
    expenses: {
      icon: TrendingDown,
      title: 'Expense Analysis',
      subtitle: 'See where your money goes',
      color: 'red.500',
      bg: 'red.50',
      bgDark: 'red.900',
    },
    balance: {
      icon: DollarSign,
      title: 'Balance Overview',
      subtitle: 'Understand your overall financial health',
      color: 'purple.500',
      bg: 'purple.50',
      bgDark: 'purple.900',
    },
  }

  const headerInfo = useMemo<HeaderInfo>(() => {
    return headerInfoMap[(selectedCard as HeaderKey) ?? 'transactions']
  }, [selectedCard])

  const IconEl = headerInfo.icon
  const iconBg = useColorModeValue(headerInfo.bg, headerInfo.bgDark)
  const headerGradient = useColorModeValue(
    'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.15) 100%)',
    'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.25) 100%)'
  )

  const modalSize = useBreakpointValue({ base: 'full', sm: 'lg', md: 'xl' })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={useBreakpointValue({ base: 'full', sm: 'md', md: 'xl' })}
      motionPreset="slideInBottom"
      isCentered
    >
      <ModalOverlay backdropFilter="blur(6px) brightness(0.9)" />
      <ModalContent
        h={{ base: '100dvh', md: 'auto' }}
        maxH={{ base: '100dvh', md: '90vh' }}
        borderRadius={{ base: '0', md: '2xl' }}
        bg={useColorModeValue('rgba(255,255,255,0.9)', 'rgba(17,17,17,0.9)')}
        backdropFilter="blur(10px)"
        boxShadow="xl"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        overflow="hidden"
      >
        {/* 🌈 Header compacto em telas pequenas */}
        <Box
          bg={headerGradient}
          backdropFilter="blur(8px)"
          px={{ base: 3, sm: 4, md: 6 }}
          pt={{ base: 3, sm: 4, md: 5 }}
          pb={{ base: 2, md: 3 }}
          borderBottom="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <VStack spacing={{ base: 2, sm: 3 }} align="center" textAlign="center">
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              p={2.5}
              bg={iconBg}
              borderRadius="xl"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              boxShadow="md"
            >
              <ChakraIcon as={IconEl} boxSize={{ base: 4, sm: 5 }} color={headerInfo.color} />
            </MotionBox>

            <VStack spacing={1} align="center">
              <Text
                fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
                fontWeight="700"
                color={colors.text.label}
                noOfLines={2}
                wordBreak="break-word"
              >
                {headerInfo.title}
              </Text>
              <Text
                fontSize={{ base: 'xs', sm: 'sm' }}
                color={colors.text.secondary}
                noOfLines={2}
                wordBreak="break-word"
              >
                {headerInfo.subtitle}
              </Text>
            </VStack>

            <MotionBadge
              colorScheme={
                selectedCard === 'income'
                  ? 'green'
                  : selectedCard === 'expenses'
                    ? 'red'
                    : selectedCard === 'balance'
                      ? 'purple'
                      : 'blue'
              }
              px={3}
              py={0.5}
              borderRadius="full"
              fontSize={{ base: '2xs', sm: 'xs', md: 'sm' }}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {selectedPeriod}
            </MotionBadge>
          </VStack>
        </Box>

        <ModalCloseButton top={{ base: 2, md: 4 }} right={{ base: 3, md: 4 }} />

        {/* 🧊 Corpo responsivo com safe-area para iPhone */}
        <ModalBody
          py={{ base: 3, sm: 4, md: 6 }}
          px={{ base: 3, sm: 4, md: 6 }}
          overflowY="auto"
          maxH={{ base: 'calc(100dvh - 180px)', md: '70vh' }}
          // 👇 safe area padding automático (iPhones)
          sx={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
          }}
        >
          {!transactions.length ? (
            <Center py={10}>
              <Spinner size="lg" color={useColorModeValue('blue.500', 'blue.300')} thickness="3px" />
            </Center>
          ) : (
            <AnimatePresence mode="wait">
              <AnimatedCard>
                {selectedCard === 'transactions' && (
                  <TransactionsChart transactions={transactions} selectedPeriod={selectedPeriod} />
                )}
                {selectedCard === 'income' && (
                  <IncomeChart transactions={transactions} selectedPeriod={selectedPeriod} />
                )}
                {selectedCard === 'expenses' && (
                  <ExpensesChart transactions={transactions} selectedPeriod={selectedPeriod} />
                )}
                {selectedCard === 'balance' && (
                  <BalanceChart
                    transactions={transactions}
                    selectedPeriod={selectedPeriod}
                    currentBalance={currentBalance}
                  />
                )}
              </AnimatedCard>
            </AnimatePresence>
          )}
        </ModalBody>

      </ModalContent>
    </Modal>
  )
}

// ✅ Tipagem do AnimatedCard
interface AnimatedCardProps {
  children: ReactNode
}

function AnimatedCard({ children }: AnimatedCardProps) {
  const bg = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(26,26,26,0.6)')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Box
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        bg={bg}
        boxShadow={useColorModeValue('0 2px 10px rgba(0,0,0,0.08)', '0 2px 12px rgba(0,0,0,0.4)')}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={borderColor}
      >
        {children}
      </Box>
    </motion.div>
  )
}
