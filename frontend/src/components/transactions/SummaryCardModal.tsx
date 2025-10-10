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
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} motionPreset="slideInBottom" isCentered>
      <ModalOverlay backdropFilter="blur(6px) brightness(0.9)" />
      <ModalContent
        h={{ base: '100vh', md: 'auto' }}
        maxH={{ base: '100vh', md: '90vh' }}
        borderRadius={{ base: '0', md: '2xl' }}
        bg={useColorModeValue('rgba(255,255,255,0.9)', 'rgba(17,17,17,0.9)')}
        backdropFilter="blur(10px)"
        boxShadow="xl"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        overflow="hidden"
      >
        {/* 🌈 Header */}
        <Box
          bg={headerGradient}
          backdropFilter="blur(8px)"
          px={{ base: 4, md: 6 }}
          pt={{ base: 4, md: 5 }}
          pb={{ base: 2, md: 3 }}
          borderBottom="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <HStack
            spacing={{ base: 3, md: 4 }}
            align="center"
            flexWrap="wrap"
            justify={{ base: 'center', sm: 'flex-start' }}
          >
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              p={3}
              bg={iconBg}
              borderRadius="xl"
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              boxShadow="md"
            >
              <ChakraIcon as={IconEl} boxSize={5} color={headerInfo.color} />
            </MotionBox>

            <MotionVStack
              spacing={0}
              align={{ base: 'center', sm: 'start' }}
              flex={1}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            >
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight="700"
                color={colors.text.label}
                textAlign={{ base: 'center', sm: 'left' }}
              >
                {headerInfo.title}
              </Text>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color={colors.text.secondary}
                textAlign={{ base: 'center', sm: 'left' }}
              >
                {headerInfo.subtitle}
              </Text>
            </MotionVStack>

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
              py={1}
              borderRadius="full"
              fontSize={{ base: 'xs', md: 'sm' }}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' }}
            >
              {selectedPeriod}
            </MotionBadge>
          </HStack>
        </Box>

        <ModalCloseButton top={{ base: 3, md: 4 }} right={{ base: 3, md: 4 }} />

        {/* 🧊 Corpo responsivo */}
        <ModalBody
          py={{ base: 4, md: 6 }}
          px={{ base: 4, md: 6 }}
          overflowY="auto"
          maxH={{ base: 'calc(100vh - 180px)', md: '70vh' }}
        >
          {!transactions.length ? (
            <Center py={10}>
              <Spinner size="lg" color={useColorModeValue('blue.500', 'blue.300')} thickness="3px" />
            </Center>
          ) : (
            <AnimatePresence mode="wait">
              {selectedCard === 'transactions' && (
                <AnimatedCard>
                  <TransactionsChart transactions={transactions} selectedPeriod={selectedPeriod} />
                </AnimatedCard>
              )}
              {selectedCard === 'income' && (
                <AnimatedCard>
                  <IncomeChart transactions={transactions} selectedPeriod={selectedPeriod} />
                </AnimatedCard>
              )}
              {selectedCard === 'expenses' && (
                <AnimatedCard>
                  <ExpensesChart transactions={transactions} selectedPeriod={selectedPeriod} />
                </AnimatedCard>
              )}
              {selectedCard === 'balance' && (
                <AnimatedCard>
                  <BalanceChart
                    transactions={transactions}
                    selectedPeriod={selectedPeriod}
                    currentBalance={currentBalance}
                  />
                </AnimatedCard>
              )}
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
