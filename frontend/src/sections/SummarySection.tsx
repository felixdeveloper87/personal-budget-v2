import {
  SimpleGrid,
  Stat,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  useDisclosure,
  Box,
  Icon,
  Flex,
  Heading,
  useToken,
} from '@chakra-ui/react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Sparkles,
  Activity,
  Zap,
} from 'lucide-react'
import { PeriodData } from '../hooks/usePeriodData'
import { useThemeColors } from '../hooks/useThemeColors'
import { useMemo, useState } from 'react'
import SummaryCardModal from '../components/transactions/SummaryCardModal'
import { SUMMARY_CARD_COLORS } from '../constants/summaryColors'

// 🎨 Animações personalizadas aprimoradas
const shimmer = 'shimmer 4s ease-in-out infinite'
const float = 'float 3s ease-in-out infinite'
const pulse = 'pulse 2s ease-in-out infinite'
const glow = 'glow 3s ease-in-out infinite'
const slideIn = 'slideIn 0.6s ease-out'

// ✅ Tipagem explícita dos tipos válidos de card
type CardId = 'transactions' | 'income' | 'expenses' | 'balance'

interface SummarySectionProps {
  periodData: PeriodData
}

/**
 * 💰 SummarySection - Financial Summary com UI/UX Aprimorada
 * - Design fluido e intuitivo
 * - Animações e micro-interações
 * - Responsivo para mobile e desktop
 */
export default function SummarySection({ periodData }: SummarySectionProps) {
  const { transactions, income, expense, balance, label } = periodData
  const colors = useThemeColors()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null)

  const { incomeTransactions, expenseTransactions } = useMemo(() => {
    return {
      incomeTransactions: transactions.filter(t => t.type === 'INCOME').length,
      expenseTransactions: transactions.filter(t => t.type === 'EXPENSE').length,
    }
  }, [transactions])

  // ✅ Define stats usando cores centralizadas
  const stats: {
    id: CardId
    label: string
    icon: any
    color: string
    bgColor: string
    darkBgColor: string
    helpText: string
    displayValue: string
  }[] = [
    {
      id: 'transactions',
      label: 'Transactions',
      icon: BarChart3,
      color: SUMMARY_CARD_COLORS.transactions.color,
      bgColor: SUMMARY_CARD_COLORS.transactions.bg,
      darkBgColor: SUMMARY_CARD_COLORS.transactions.bgDark,
      helpText: 'Total transactions',
      displayValue: transactions.length.toString(),
    },
    {
      id: 'income',
      label: 'Income',
      icon: TrendingUp,
      color: SUMMARY_CARD_COLORS.income.color,
      bgColor: SUMMARY_CARD_COLORS.income.bg,
      darkBgColor: SUMMARY_CARD_COLORS.income.bgDark,
      helpText: 'Total income',
      displayValue: `£${income.toFixed(2)}`,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: TrendingDown,
      color: SUMMARY_CARD_COLORS.expenses.color,
      bgColor: SUMMARY_CARD_COLORS.expenses.bg,
      darkBgColor: SUMMARY_CARD_COLORS.expenses.bgDark,
      helpText: 'Total expenses',
      displayValue: `£${expense.toFixed(2)}`,
    },
    {
      id: 'balance',
      label: 'Balance',
      icon: DollarSign,
      color: SUMMARY_CARD_COLORS.balance.color,
      bgColor: SUMMARY_CARD_COLORS.balance.bg,
      darkBgColor: SUMMARY_CARD_COLORS.balance.bgDark,
      helpText: 'Current balance',
      displayValue: `£${balance.toFixed(2)}`,
    },
  ]

  const handleCardClick = (cardId: CardId) => {
    setSelectedCard(cardId)
    onOpen()
  }

  const selectedLabel =
    selectedCard ? stats.find(s => s.id === selectedCard)?.label ?? undefined : undefined

  return (
    <>
      <Box 
        w="full" 
        px={{ base: 3, sm: 4, md: 6 }}
        sx={{
          // Safe area support para iPhone 14 Pro
          paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Box position="relative" mb={8}>
          {/* Background decorativo com gradiente */}
          <Box
            position="absolute"
            top="-50px"
            left="-50px"
            right="-50px"
            height="200px"
            background={useColorModeValue(
              'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(139, 92, 246, 0.1) 100%)',
              'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.2) 50%, rgba(139, 92, 246, 0.2) 100%)'
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
              background="linear-gradient(90deg, #3b82f6, #10b981, #ef4444, #8b5cf6, #f59e0b)"
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
                {/* Header com design moderno */}
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align="center"
                  justify="space-between"
                  gap={4}
                >
                  <HStack spacing={4} align="center">
                    <Box
                      p={3}
                      borderRadius="2xl"
                      bg={useColorModeValue(
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        'linear-gradient(135deg, #60a5fa, #3b82f6)'
                      )}
                      boxShadow="lg"
                      sx={{
                        animation: glow,
                        '@keyframes glow': {
                          '0%, 100%': { 
                            boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' 
                          },
                          '50%': { 
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)' 
                          }
                        }
                      }}
                    >
                      <Icon as={Activity} boxSize={6} color="white" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading
                        size="lg"
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #1e293b, #475569)',
                          'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                        )}
                        bgClip="text"
                        fontWeight="800"
                      >
                        Financial Summary
                      </Heading>
                      <Text
                        fontSize="sm"
                        color={colors.text.secondary}
                        fontWeight="500"
                      >
                        Complete overview of your finances
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Badge
                    colorScheme="blue"
                    variant="solid"
                    borderRadius="full"
                    px={4}
                    py={2}
                    fontSize="sm"
                    fontWeight="600"
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      'linear-gradient(135deg, #60a5fa, #3b82f6)'
                    )}
                    boxShadow="md"
                  >
                    <HStack spacing={2}>
                      <Icon as={Zap} boxSize={3} />
                      <Text>{label}</Text>
                    </HStack>
                  </Badge>
                </Flex>

                {/* Grid de cards otimizado para iPhone 14 Pro */}
                <SimpleGrid
                  columns={{ base: 2, sm: 2, md: 4 }}
                  spacing={{ base: 3, sm: 4, md: 6 }}
                  w="full"
                >
                  {stats.map((stat, index) => {
                    const IconComponent = stat.icon
                    
                    return (
                      <Card
                        key={stat.id}
                        position="relative"
                        bg={useColorModeValue(
                          `linear-gradient(135deg, ${stat.bgColor}, ${stat.bgColor}dd)`,
                          `linear-gradient(135deg, ${SUMMARY_CARD_COLORS[stat.id].bgDark}, ${SUMMARY_CARD_COLORS[stat.id].bgDark}dd)`
                        )}
                        backdropFilter="blur(10px)"
                        border="1px solid"
                        borderColor={useColorModeValue(
                          `${stat.color}20`,
                          `${stat.color}30`
                        )}
                        borderRadius="2xl"
                        shadow="xl"
                        cursor="pointer"
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        overflow="hidden"
                        sx={{
                          animation: `${slideIn} ${0.2 + index * 0.1}s ease-out`,
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
                        _hover={{
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 25px 50px -12px ${stat.color}40`,
                          borderColor: stat.color,
                        }}
                        _active={{
                          transform: 'translateY(-4px) scale(1.01)',
                        }}
                        onClick={() => handleCardClick(stat.id)}
                      >
                        {/* Efeito de brilho no hover */}
                        <Box
                          position="absolute"
                          top={0}
                          left="-100%"
                          width="100%"
                          height="100%"
                          background="linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
                          transition="left 0.5s"
                          _groupHover={{ left: '100%' }}
                        />
                        
                        <CardBody p={{ base: 4, sm: 5, md: 6 }}>
                          <VStack spacing={{ base: 3, sm: 4 }} align="center">
                            {/* Ícone com efeito especial */}
                            <Box
                              position="relative"
                              p={{ base: 3, sm: 4 }}
                              borderRadius="2xl"
                              bg={useColorModeValue(
                                `${stat.color}15`,
                                `${stat.color}25`
                              )}
                              boxShadow="lg"
                              sx={{
                                animation: `${float} 3s ease-in-out infinite`,
                                animationDelay: `${index * 0.5}s`,
                                '@keyframes float': {
                                  '0%, 100%': { transform: 'translateY(0px)' },
                                  '50%': { transform: 'translateY(-10px)' }
                                }
                              }}
                            >
                              <Icon as={IconComponent} boxSize={{ base: 5, sm: 6 }} color={stat.color} />
                              {/* Efeito de brilho no ícone */}
                              <Box
                                position="absolute"
                                top="-2px"
                                left="-2px"
                                right="-2px"
                                bottom="-2px"
                                borderRadius="2xl"
                                bg={`${stat.color}20`}
                                filter="blur(8px)"
                                opacity={0.6}
                                zIndex={-1}
                              />
                            </Box>
                            
                            {/* Valores e labels - Otimizado para iPhone 14 Pro */}
                            <VStack spacing={{ base: 1.5, sm: 2 }} align="center">
                              <Text
                                fontSize={{ base: 'lg', sm: 'xl', md: '2xl', lg: '3xl' }}
                                fontWeight="900"
                                color={stat.color}
                                textAlign="center"
                                lineHeight="1"
                                sx={{
                                  textShadow: `0 2px 4px ${stat.color}30`,
                                }}
                              >
                                {stat.displayValue}
                              </Text>
                              <Text
                                fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
                                fontWeight="700"
                                color={useColorModeValue(
                                  SUMMARY_CARD_COLORS[stat.id].textColor,
                                  SUMMARY_CARD_COLORS[stat.id].textColorDark
                                )}
                                textAlign="center"
                                textTransform="uppercase"
                                letterSpacing="0.5px"
                              >
                                {stat.label}
                              </Text>
                              <Text
                                fontSize={{ base: '2xs', sm: 'xs' }}
                                color={colors.text.muted}
                                textAlign="center"
                                fontWeight="500"
                                display={{ base: 'none', sm: 'block' }}
                              >
                                {stat.helpText}
                              </Text>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    )
                  })}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Box>

      {/* Modal com dados detalhados */}
      <SummaryCardModal
        isOpen={isOpen}
        onClose={onClose}
        selectedCard={selectedCard}
        cardLabel={selectedLabel}
        transactions={transactions}
        selectedPeriod={label}
        currentBalance={balance}
      />
    </>
  )
}
