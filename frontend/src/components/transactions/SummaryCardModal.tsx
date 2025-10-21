import {
  Modal,
  ModalOverlay,
  ModalContent,
  Card,
  CardBody,
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
  Button,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import React, { ReactNode, useMemo } from 'react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { TransactionsChart, IncomeChart, ExpensesChart, BalanceChart } from '../charts/modal'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, X } from 'lucide-react'
import { SUMMARY_CARD_COLORS, SummaryCardType } from '../../constants/summaryColors'
import InsightsCard from '../ui/InsightsCard'
import { getResponsiveStyles, getGradients, animations, safeAreaStyles, safariStyles, getShimmerStyles, getModalHeaderStyles } from '../ui'

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
  const responsiveStyles = getResponsiveStyles()
  const gradients = getGradients()
  const headerStyles = getModalHeaderStyles(useColorModeValue)

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
        overflow="hidden"
        m={{ base: 0, md: 4 }}
        display="flex"
        flexDirection="column"
        {...responsiveStyles.modal}
        sx={{
          ...safeAreaStyles.container,
          ...safariStyles.modal
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
                      flexShrink={0}
                    >
                      <ChakraIcon as={IconEl} boxSize={{ base: 4, sm: 5 }} color={headerInfo.color} />
                    </MotionBox>
                    <VStack
                      align="start"
                      spacing={0}
                      flex="1"
                      minW={0}
                    >
                      <Text
                        color={useColorModeValue('black', 'white')}
                        fontWeight="800"
                        fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                        lineHeight="shorter"
                        noOfLines={1}
                      >
                        {selectedCard === 'transactions' ? 'Transactions Analytics' :
                         selectedCard === 'income' ? 'Incomes' :
                         selectedCard === 'expenses' ? 'Expenses' :
                         selectedCard === 'balance' ? 'Balance' :
                         headerInfo.title}
                      </Text>
                      <Text
                        color={useColorModeValue('gray.600', 'gray.300')}
                        fontWeight="600"
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        noOfLines={1}
                        display={{ base: 'none', sm: 'block' }}
                      >
                        {headerInfo.subtitle}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Period Badge */}
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
                    flexShrink={0}
                  >
                    {selectedPeriod}
                  </MotionBadge>
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
                  ...safariStyles.scrollable
                }}
              >
          {!transactions.length ? (
            <Center py={10}>
              <Spinner size="lg" color={useColorModeValue('blue.500', 'blue.300')} thickness="3px" />
            </Center>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <Box key="chart">
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
                </Box>
              </AnimatePresence>
              
              {/* Insights Card - Outside AnimatePresence to avoid key conflicts */}
              <Box mt={4}>
                <InsightsCard
                  transactions={transactions}
                  selectedPeriod={selectedPeriod}
                  cardType={selectedCard || 'transactions'}
                />
              </Box>
            </>
          )}
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </ModalContent>
    </Modal>
  )
}

