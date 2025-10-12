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
import { SUMMARY_CARD_COLORS, SummaryCardType } from '../../constants/summaryColors'

const MotionBox = motion.create(Box)
const MotionVStack = motion.create(VStack)
const MotionBadge = motion.create(Badge)

// ✅ Tipagem explícita das props do modal
interface SummaryCardModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCard: SummaryCardType | null | undefined
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

  // ✅ Usar cores centralizadas
  const iconMap = {
    transactions: BarChart3,
    income: TrendingUp,
    expenses: TrendingDown,
    balance: DollarSign,
  } as const

  const headerInfo = useMemo(() => {
    const cardType = selectedCard ?? 'transactions'
    return {
      icon: iconMap[cardType],
      ...SUMMARY_CARD_COLORS[cardType],
    }
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
      size={useBreakpointValue({ base: 'full', sm: 'md', md: 'xl', lg: '2xl' })}
      motionPreset="slideInBottom"
      isCentered={false}
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
        // 👇 Safe area support para iPhone 14 Pro
        sx={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {/* 🌈 Header com espaçamento adequado para iPhone 14 Pro */}
        <Box
          bg={headerGradient}
          backdropFilter="blur(8px)"
          px={{ base: 4, sm: 5, md: 6, lg: 8 }}
          pt={{ base: 6, sm: 6, md: 5, lg: 6 }}
          pb={{ base: 4, sm: 4, md: 3, lg: 4 }}
          borderBottom="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          // 👇 Espaçamento extra para Dynamic Island/Notch
          sx={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)',
          }}
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

        <ModalCloseButton 
          top={{ base: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)', md: 4 }} 
          right={{ base: 4, md: 4 }}
          size="lg"
          borderRadius="full"
          bg={useColorModeValue('rgba(255,255,255,0.9)', 'rgba(0,0,0,0.6)')}
          _hover={{
            bg: useColorModeValue('rgba(255,255,255,1)', 'rgba(0,0,0,0.8)')
          }}
          backdropFilter="blur(8px)"
        />

        {/* 🧊 Corpo responsivo com safe-area para iPhone 14 Pro */}
        <ModalBody
          py={{ base: 4, sm: 5, md: 6, lg: 8 }}
          px={{ base: 4, sm: 5, md: 6, lg: 8 }}
          overflowY="auto"
          maxH={{ base: 'calc(100dvh - 200px)', md: '70vh' }}
          // 👇 Safe area completo para iPhone 14 Pro
          sx={{
            paddingTop: '1rem',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            // 👇 Melhor scroll no iOS
            overscrollBehavior: 'contain',
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
        p={{ base: 3, sm: 4, md: 5 }}
        borderRadius="2xl"
        bg={bg}
        boxShadow={useColorModeValue('0 2px 10px rgba(0,0,0,0.08)', '0 2px 12px rgba(0,0,0,0.4)')}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={borderColor}
        // 👇 Melhor espaçamento para gráficos no iPhone
        sx={{
          minHeight: { base: '300px', sm: '350px', md: '400px' },
        }}
      >
        {children}
      </Box>
    </motion.div>
  )
}
