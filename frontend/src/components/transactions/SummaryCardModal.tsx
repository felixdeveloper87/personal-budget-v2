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
  Divider,
  useColorModeValue,
  Icon as ChakraIcon,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { TransactionsChart, IncomeChart, ExpensesChart, BalanceChart } from '../charts/modal'
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

const MotionBox = motion.create(Box)
const MotionVStack = motion.create(VStack)
const MotionBadge = motion.create(Badge)

interface SummaryCardModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCard: string | null | undefined
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

  const headerInfo = useMemo(() => {
    const map: Record<
      string,
      {
        icon: React.ElementType
        title: string
        subtitle: string
        color: string
        bg: string
        bgDark: string
      }
    > = {
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

    return map[selectedCard ?? 'transactions']
  }, [selectedCard])

  const IconEl = headerInfo.icon as React.ElementType
  const iconBg = useColorModeValue(headerInfo.bg, headerInfo.bgDark)

  const headerGradient = useColorModeValue(
    'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.15) 100%)',
    'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.25) 100%)'
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" motionPreset="slideInBottom">
      <ModalOverlay backdropFilter="blur(6px) brightness(0.9)" />
      <ModalContent
        bg={useColorModeValue('rgba(255,255,255,0.9)', 'rgba(17,17,17,0.9)')}
        backdropFilter="blur(10px)"
        borderRadius="2xl"
        boxShadow="xl"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        overflow="hidden"
      >
        {/* 🌈 Header com gradiente + animações */}
        <Box
          bg={headerGradient}
          backdropFilter="blur(8px)"
          px={6}
          pt={5}
          pb={3}
          borderBottom="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          boxShadow={useColorModeValue('0 2px 6px rgba(0,0,0,0.05)', '0 2px 10px rgba(0,0,0,0.4)')}
        >
          <HStack spacing={4} align="center">
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
              align="start"
              flex={1}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            >
              <Text fontSize="lg" fontWeight="700" color={colors.text.label}>
                {headerInfo.title}
              </Text>
              <Text fontSize="sm" color={colors.text.secondary}>
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
              variant="subtle"
              fontSize="sm"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' }}
            >
              {selectedPeriod}
            </MotionBadge>
          </HStack>
        </Box>

        <ModalCloseButton />

        {/* 🧊 Corpo com cards glassmorphism + animações */}
        <ModalBody py={6} px={6}>
          {!transactions.length ? (
            <Center py={10}>
              <Spinner
                size="lg"
                color={useColorModeValue('blue.500', 'blue.300')}
                thickness="3px"
              />

            </Center>
          ) : (
            <AnimatePresence mode="wait">
              {selectedCard === 'transactions' && (
                <motion.div
                  key="transactions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Box
                    p={5}
                    borderRadius="2xl"
                    bg={useColorModeValue('rgba(255,255,255,0.65)', 'rgba(26,26,26,0.6)')}
                    boxShadow={useColorModeValue(
                      '0 2px 10px rgba(0,0,0,0.08)',
                      '0 2px 12px rgba(0,0,0,0.4)'
                    )}
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                  >
                    <TransactionsChart
                      transactions={transactions}
                      selectedPeriod={selectedPeriod}
                    />
                  </Box>
                </motion.div>
              )}

              {selectedCard === 'income' && (
                <motion.div
                  key="income"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Box
                    p={5}
                    borderRadius="2xl"
                    bg={useColorModeValue('rgba(235,255,245,0.7)', 'rgba(26,36,26,0.6)')}
                    boxShadow={useColorModeValue(
                      '0 2px 10px rgba(0,0,0,0.08)',
                      '0 2px 12px rgba(0,0,0,0.4)'
                    )}
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor={useColorModeValue('green.100', 'green.800')}
                  >
                    <IncomeChart
                      transactions={transactions}
                      selectedPeriod={selectedPeriod}
                    />
                  </Box>
                </motion.div>
              )}

              {selectedCard === 'expenses' && (
                <motion.div
                  key="expenses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Box
                    p={5}
                    borderRadius="2xl"
                    bg={useColorModeValue('rgba(255,240,240,0.7)', 'rgba(36,26,26,0.6)')}
                    boxShadow={useColorModeValue(
                      '0 2px 10px rgba(0,0,0,0.08)',
                      '0 2px 12px rgba(0,0,0,0.4)'
                    )}
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor={useColorModeValue('red.100', 'red.800')}
                  >
                    <ExpensesChart
                      transactions={transactions}
                      selectedPeriod={selectedPeriod}
                    />
                  </Box>
                </motion.div>
              )}

              {selectedCard === 'balance' && (
                <motion.div
                  key="balance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Box
                    p={5}
                    borderRadius="2xl"
                    bg={useColorModeValue('rgba(240,235,255,0.7)', 'rgba(26,26,36,0.6)')}
                    boxShadow={useColorModeValue(
                      '0 2px 10px rgba(0,0,0,0.08)',
                      '0 2px 12px rgba(0,0,0,0.4)'
                    )}
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor={useColorModeValue('purple.100', 'purple.800')}
                  >
                    <BalanceChart
                      transactions={transactions}
                      selectedPeriod={selectedPeriod}
                      currentBalance={currentBalance}
                    />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
