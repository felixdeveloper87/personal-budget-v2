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
  Button,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useBreakpointValue,
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
  Calendar,
  RotateCcw,
  CalendarDays,
  CalendarRange,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { PeriodData } from '../hooks/usePeriodData'
import { useThemeColors } from '../hooks/useThemeColors'
import { useMemo, useState } from 'react'
import SummaryCardModal from '../components/transactions/SummaryCardModal'
import { SUMMARY_CARD_COLORS } from '../constants/summaryColors'
import { PeriodType } from '../components/ui/PeriodNavigator'
import { Transaction } from '../types'
import ExpenseChart from '../components/charts/ExpenseChart'
import IncomeChart from '../components/charts/IncomeChart'

// 🎨 Animações personalizadas aprimoradas
const shimmer = 'shimmer 4s ease-in-out infinite'
const float = 'float 3s ease-in-out infinite'
const pulse = 'pulse 2s ease-in-out infinite'
const glow = 'glow 3s ease-in-out infinite'
const slideIn = 'slideIn 0.6s ease-out'

// ✅ Tipagem explícita dos tipos válidos de card
type CardId = 'transactions' | 'income' | 'expenses' | 'balance'

interface SummaryWithAnalysisSectionProps {
  periodData: PeriodData
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
}

/**
 * 💰 SummaryWithAnalysisSection - Financial Summary + Period Navigator + Category Analysis
 * - Design fluido e intuitivo com header unificado
 * - Animações e micro-interações
 * - Responsivo para mobile e desktop
 */
export default function SummaryWithAnalysisSection({ 
  periodData, 
  selectedPeriod, 
  selectedDate, 
  onDateChange, 
  onPeriodChange 
}: SummaryWithAnalysisSectionProps) {
  const { transactions, income, expense, balance, label } = periodData
  const colors = useThemeColors()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedCard, setSelectedCard] = useState<CardId | null>(null)
  const isMobile = useBreakpointValue({ base: true, md: false })

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

  // 🔥 Formata o rótulo de acordo com o período selecionado
  const formatLabel = () => {
    if (selectedPeriod === 'month') {
      // Exibe abreviação do mês + ano (ex.: "Jan 2025")
      return selectedDate.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      })
      .toUpperCase()
    }
    return label
  }

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    switch (selectedPeriod) {
      case 'day':
        newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'month':
        newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'year':
        newDate.setFullYear(selectedDate.getFullYear() + (direction === 'next' ? 1 : -1))
        break
    }
    onDateChange(newDate)
  }

  const goToToday = () => onDateChange(new Date())

  const periods = [
    { type: 'day' as PeriodType, label: 'Day', icon: Calendar },
    { type: 'week' as PeriodType, label: 'Week', icon: CalendarDays },
    { type: 'month' as PeriodType, label: 'Month', icon: CalendarRange },
    { type: 'year' as PeriodType, label: 'Year', icon: BarChart3 },
  ]

  const tabStyle = {
    bg: colors.cardBg,
    borderColor: colors.border,
    borderBottomColor: colors.cardBg,
    fontWeight: '600',
  }

  return (
    <>
      <Box 
        w="full" 
        px={{ base: 4, md: 8, lg: 12 }}
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
            w="full"
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
            
            <CardBody p={0}>
              <VStack spacing={0} align="stretch" h="full">
                {/* Header unificado com Summary e Period Navigator */}
                <Box 
                  p={{ base: 4, sm: 5, md: 6 }} 
                  borderBottom="1px" 
                  borderColor={colors.border}
                  position="relative"
                >
                  <HStack spacing={4} align="center" justify="space-between" w="full">
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
                          Financial Overview
                        </Heading>
                        <Text
                          fontSize="sm"
                          color={colors.text.secondary}
                          fontWeight="500"
                        >
                          Complete overview with category analysis
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={3}>
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
                          <Text>{formatLabel()}</Text>
                        </HStack>
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        leftIcon={<RotateCcw size={14} />}
                        onClick={goToToday}
                      >
                        Today
                      </Button>
                    </HStack>
                  </HStack>

                  {/* Period Navigator integrado */}
                  <Box mt={6}>
                    <VStack spacing={4} align="stretch">
                      {/* Seleção de período */}
                      {isMobile ? (
                        <SimpleGrid columns={4} spacing={2} w="full">
                          {periods.map((period) => {
                            const IconComponent = period.icon
                            const isSelected = selectedPeriod === period.type
                            return (
                              <Button
                                key={period.type}
                                colorScheme={isSelected ? 'blue' : 'gray'}
                                variant={isSelected ? 'solid' : 'outline'}
                                onClick={() => onPeriodChange(period.type)}
                                borderRadius="xl"
                                size="sm"
                                px={2}
                                bg={isSelected ? 
                                  useColorModeValue(
                                    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    'linear-gradient(135deg, #60a5fa, #3b82f6)'
                                  ) : 
                                  useColorModeValue(
                                    'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                                    'linear-gradient(135deg, #1e293b, #334155)'
                                  )
                                }
                                color={isSelected ? 'white' : useColorModeValue('gray.700', 'gray.300')}
                                borderColor={isSelected ? 'transparent' : useColorModeValue('gray.300', 'gray.600')}
                                _hover={{
                                  bg: isSelected ? 
                                    useColorModeValue(
                                      'linear-gradient(135deg, #2563eb, #1e40af)',
                                      'linear-gradient(135deg, #3b82f6, #2563eb)'
                                    ) : 
                                    useColorModeValue(
                                      'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                                      'linear-gradient(135deg, #334155, #475569)'
                                    ),
                                  transform: 'translateY(-1px)',
                                  boxShadow: 'md'
                                }}
                                _active={{
                                  transform: 'translateY(0)',
                                }}
                                transition="all 0.2s ease"
                                boxShadow={isSelected ? 'lg' : 'sm'}
                              >
                                <VStack spacing={0.5}>
                                  <IconComponent size={14} />
                                  <Text fontSize="2xs" fontWeight="600">{period.label}</Text>
                                </VStack>
                              </Button>
                            )
                          })}
                        </SimpleGrid>
                      ) : (
                        <HStack spacing={2} w="full">
                          {periods.map((period) => {
                            const IconComponent = period.icon
                            const isSelected = selectedPeriod === period.type
                            return (
                              <Button
                                key={period.type}
                                colorScheme={isSelected ? 'blue' : 'gray'}
                                variant={isSelected ? 'solid' : 'outline'}
                                onClick={() => onPeriodChange(period.type)}
                                flex={1}
                                size="md"
                                leftIcon={<IconComponent size={16} />}
                                borderRadius="xl"
                                bg={isSelected ? 
                                  useColorModeValue(
                                    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    'linear-gradient(135deg, #60a5fa, #3b82f6)'
                                  ) : 
                                  useColorModeValue(
                                    'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                                    'linear-gradient(135deg, #1e293b, #334155)'
                                  )
                                }
                                color={isSelected ? 'white' : useColorModeValue('gray.700', 'gray.300')}
                                borderColor={isSelected ? 'transparent' : useColorModeValue('gray.300', 'gray.600')}
                                _hover={{
                                  bg: isSelected ? 
                                    useColorModeValue(
                                      'linear-gradient(135deg, #2563eb, #1e40af)',
                                      'linear-gradient(135deg, #3b82f6, #2563eb)'
                                    ) : 
                                    useColorModeValue(
                                      'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                                      'linear-gradient(135deg, #334155, #475569)'
                                    ),
                                  transform: 'translateY(-1px)',
                                  boxShadow: 'lg'
                                }}
                                _active={{
                                  transform: 'translateY(0)',
                                }}
                                transition="all 0.2s ease"
                                boxShadow={isSelected ? 'lg' : 'sm'}
                                fontWeight="600"
                              >
                                {period.label}
                              </Button>
                            )
                          })}
                        </HStack>
                      )}

                      {/* Navegação integrada */}
                      <HStack spacing={2} justify="space-between" w="full">
                        <IconButton
                          aria-label="Previous period"
                          icon={<ArrowLeft size={18} />}
                          onClick={() => navigatePeriod('prev')}
                          size="md"
                          variant="outline"
                          colorScheme="blue"
                          borderRadius="md"
                        />
                        
                        <Box
                          flex="1"
                          textAlign="center"
                          px={4}
                          py={2}
                          borderRadius="md"
                          bg={useColorModeValue('blue.50', 'blue.900')}
                          border="1px solid"
                          borderColor={useColorModeValue('blue.200', 'blue.700')}
                        >
                          <Text
                            fontSize={{ base: 'sm', md: 'md' }}
                            fontWeight="700"
                            color="blue.600"
                          >
                            {formatLabel()}
                          </Text>
                        </Box>
                        
                        <IconButton
                          aria-label="Next period"
                          icon={<ArrowRight size={18} />}
                          onClick={() => navigatePeriod('next')}
                          size="md"
                          variant="outline"
                          colorScheme="blue"
                          borderRadius="md"
                        />
                      </HStack>
                    </VStack>
                  </Box>
                </Box>

                {/* Grid de cards otimizado para iPhone 14 Pro */}
                <Box p={{ base: 4, sm: 5, md: 6 }}>
                  <SimpleGrid
                    columns={{ base: 2, sm: 2, md: 4 }}
                    spacing={{ base: 2, sm: 3, md: 4 }}
                    w="full"
                    mb={6}
                  >
                    {stats.map((stat, index) => {
                      const IconComponent = stat.icon
                      
                      return (
                        <Card
                          key={stat.id}
                          position="relative"
                          bg={useColorModeValue(
                            (() => {
                              switch (stat.id) {
                                case 'transactions':
                                  return 'linear-gradient(135deg, #eff6ff, #dbeafe)'
                                case 'income':
                                  return 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
                                case 'expenses':
                                  return 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                                case 'balance':
                                  return 'linear-gradient(135deg, #fefce8, #fef3c7)'
                                default:
                                  return 'linear-gradient(135deg, #eff6ff, #dbeafe)'
                              }
                            })(),
                            (() => {
                              switch (stat.id) {
                                case 'transactions':
                                  return 'linear-gradient(135deg, #1e293b, #334155)'
                                case 'income':
                                  return 'linear-gradient(135deg, #1e293b, #334155)'
                                case 'expenses':
                                  return 'linear-gradient(135deg, #1e293b, #334155)'
                                case 'balance':
                                  return 'linear-gradient(135deg, #1e293b, #334155)'
                                default:
                                  return 'linear-gradient(135deg, #1e293b, #334155)'
                              }
                            })()
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
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '4px',
                              background: (() => {
                                switch (stat.id) {
                                  case 'transactions':
                                    return 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                                  case 'income':
                                    return 'linear-gradient(90deg, #22c55e, #16a34a)'
                                  case 'expenses':
                                    return 'linear-gradient(90deg, #ef4444, #dc2626)'
                                  case 'balance':
                                    return 'linear-gradient(90deg, #f59e0b, #d97706)'
                                  default:
                                    return 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                                }
                              })(),
                              borderRadius: '2xl 2xl 0 0',
                              zIndex: 1
                            },
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
                          
                          <CardBody p={{ base: 3, sm: 4, md: 5 }}>
                            <VStack spacing={{ base: 2, sm: 3 }} align="center">
                              {/* Ícone com efeito especial */}
                              <Box
                                position="relative"
                                p={{ base: 2, sm: 3 }}
                                borderRadius="xl"
                                bg={useColorModeValue(
                                  `${stat.color}15`,
                                  `${stat.color}25`
                                )}
                                boxShadow="md"
                                sx={{
                                  animation: `${float} 3s ease-in-out infinite`,
                                  animationDelay: `${index * 0.5}s`,
                                  '@keyframes float': {
                                    '0%, 100%': { transform: 'translateY(0px)' },
                                    '50%': { transform: 'translateY(-6px)' }
                                  }
                                }}
                              >
                                <Icon as={IconComponent} boxSize={{ base: 4, sm: 5 }} color={stat.color} />
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
                              <VStack spacing={{ base: 1, sm: 1.5 }} align="center">
                                <Text
                                  fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: '2xl' }}
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
                                  fontSize={{ base: '2xs', sm: 'xs', md: 'sm' }}
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
                </Box>

                <Divider />

                {/* Category Analysis Section */}
                <Box p={{ base: 4, sm: 5, md: 6 }}>
                  <VStack spacing={6} align="stretch">
                    {/* Header da análise de categorias */}
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
                            'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            'linear-gradient(135deg, #a78bfa, #8b5cf6)'
                          )}
                          boxShadow="lg"
                          sx={{
                            animation: glow,
                            '@keyframes glow': {
                              '0%, 100%': { 
                                boxShadow: '0 0 5px rgba(139, 92, 246, 0.3)' 
                              },
                              '50%': { 
                                boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)' 
                              }
                            }
                          }}
                        >
                          <Icon as={BarChart3} boxSize={6} color="white" />
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
                            Category Analysis
                          </Heading>
                          <Text
                            fontSize="sm"
                            color={colors.text.secondary}
                            fontWeight="500"
                          >
                            Detailed breakdown by categories
                          </Text>
                        </VStack>
                      </HStack>
                      
                      <Badge
                        colorScheme="purple"
                        variant="solid"
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontSize="sm"
                        fontWeight="600"
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          'linear-gradient(135deg, #a78bfa, #8b5cf6)'
                        )}
                        boxShadow="md"
                      >
                        <HStack spacing={2}>
                          <Icon as={Sparkles} boxSize={3} />
                          <Text>Charts</Text>
                        </HStack>
                      </Badge>
                    </Flex>

                    {/* Tabs para análise de categorias */}
                    <Tabs 
                      variant="enclosed"
                      colorScheme="purple"
                      defaultIndex={0}
                      flex="1"
                      display="flex"
                      flexDirection="column"
                    >
                      {/* Tab buttons modernas */}
                      <TabList 
                        bg={useColorModeValue('gray.50', 'gray.800')}
                        borderRadius="2xl"
                        p={1}
                        border="none"
                        boxShadow="sm"
                      >
                        {/* Expenses Tab */}
                        <Tab
                          _selected={{ 
                            bg: useColorModeValue(
                              'linear-gradient(135deg, #fca5a5, #f87171)',
                              'linear-gradient(135deg, #dc2626, #b91c1c)'
                            ),
                            color: 'white',
                            transform: 'translateY(-1px)',
                            boxShadow: useColorModeValue(
                              '0 8px 25px rgba(239, 68, 68, 0.2)',
                              '0 8px 25px rgba(239, 68, 68, 0.4)'
                            ),
                            '& .icon-container': {
                              bg: 'rgba(255, 255, 255, 0.3)',
                            },
                            '& .icon': {
                              color: 'white',
                            }
                          }}
                          borderRadius="xl"
                          p={{ base: 3, sm: 4, md: 5 }}
                          fontSize={{ base: 'sm', sm: 'md' }}
                          fontWeight="700"
                          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          color={useColorModeValue('gray.600', 'gray.300')}
                          bg="transparent"
                          _hover={{
                            bg: useColorModeValue(
                              'linear-gradient(135deg, #fef2f2, #fecaca)',
                              'linear-gradient(135deg, #991b1b, #7f1d1d)'
                            ),
                            color: useColorModeValue('red.500', 'red.400'),
                            transform: 'translateY(-1px)',
                            boxShadow: 'lg',
                            '& .icon-container': {
                              bg: useColorModeValue(
                                'rgba(239, 68, 68, 0.2)',
                                'rgba(239, 68, 68, 0.3)'
                              ),
                            },
                            '& .icon': {
                              color: useColorModeValue('#dc2626', '#f87171'),
                            }
                          }}
                          flex="1"
                          minH={{ base: '56px', sm: '60px' }}
                          position="relative"
                          overflow="hidden"
                        >
                          <HStack spacing={3} justify="center">
                            <Box
                              className="icon-container"
                              p={2}
                              borderRadius="xl"
                              bg={useColorModeValue(
                                'rgba(239, 68, 68, 0.1)',
                                'rgba(239, 68, 68, 0.2)'
                              )}
                              transition="all 0.3s ease"
                              sx={{
                                animation: `${float} 3s ease-in-out infinite`,
                                '@keyframes float': {
                                  '0%, 100%': { transform: 'translateY(0px)' },
                                  '50%': { transform: 'translateY(-2px)' }
                                }
                              }}
                            >
                              <TrendingDown 
                                className="icon"
                                size={18} 
                                color={useColorModeValue('#ef4444', '#f87171')}
                                style={{ transition: 'color 0.3s ease' }}
                              />
                            </Box>
                            <Text 
                              fontSize={{ base: 'sm', sm: 'md' }}
                              fontWeight="700"
                              letterSpacing="wide"
                            >
                              Expenses
                            </Text>
                          </HStack>
                        </Tab>

                        {/* Income Tab */}
                        <Tab
                          _selected={{ 
                            bg: useColorModeValue(
                              'linear-gradient(135deg, #86efac, #4ade80)',
                              'linear-gradient(135deg, #16a34a, #15803d)'
                            ),
                            color: 'white',
                            transform: 'translateY(-1px)',
                            boxShadow: useColorModeValue(
                              '0 8px 25px rgba(34, 197, 94, 0.2)',
                              '0 8px 25px rgba(34, 197, 94, 0.4)'
                            ),
                            '& .icon-container': {
                              bg: 'rgba(255, 255, 255, 0.3)',
                            },
                            '& .icon': {
                              color: 'white',
                            }
                          }}
                          borderRadius="xl"
                          p={{ base: 3, sm: 4, md: 5 }}
                          fontSize={{ base: 'sm', sm: 'md' }}
                          fontWeight="700"
                          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          color={useColorModeValue('gray.600', 'gray.300')}
                          bg="transparent"
                          _hover={{
                            bg: useColorModeValue(
                              'linear-gradient(135deg, #f0fdf4, #bbf7d0)',
                              'linear-gradient(135deg, #166534, #14532d)'
                            ),
                            color: useColorModeValue('green.500', 'green.400'),
                            transform: 'translateY(-1px)',
                            boxShadow: 'lg',
                            '& .icon-container': {
                              bg: useColorModeValue(
                                'rgba(34, 197, 94, 0.2)',
                                'rgba(34, 197, 94, 0.3)'
                              ),
                            },
                            '& .icon': {
                              color: useColorModeValue('#16a34a', '#4ade80'),
                            }
                          }}
                          flex="1"
                          minH={{ base: '56px', sm: '60px' }}
                          position="relative"
                          overflow="hidden"
                        >
                          <HStack spacing={3} justify="center">
                            <Box
                              className="icon-container"
                              p={2}
                              borderRadius="xl"
                              bg={useColorModeValue(
                                'rgba(34, 197, 94, 0.1)',
                                'rgba(34, 197, 94, 0.2)'
                              )}
                              transition="all 0.3s ease"
                              sx={{
                                animation: `${float} 3s ease-in-out infinite 1.5s`,
                                '@keyframes float': {
                                  '0%, 100%': { transform: 'translateY(0px)' },
                                  '50%': { transform: 'translateY(-2px)' }
                                }
                              }}
                            >
                              <TrendingUp 
                                className="icon"
                                size={18} 
                                color={useColorModeValue('#22c55e', '#4ade80')}
                                style={{ transition: 'color 0.3s ease' }}
                              />
                            </Box>
                            <Text 
                              fontSize={{ base: 'sm', sm: 'md' }}
                              fontWeight="700"
                              letterSpacing="wide"
                            >
                              Income
                            </Text>
                          </HStack>
                        </Tab>
                      </TabList>

                      {/* Tab content panels otimizados para iPhone 14 Pro */}
                      <TabPanels flex="1" display="flex" flexDirection="column">
                        {/* Expense Chart Panel */}
                        <TabPanel p={0} flex="1">
                          <Box 
                            p={{ base: 3, sm: 4, md: 6 }} 
                            flex="1"
                            bg="linear-gradient(135deg, rgba(239, 68, 68, 0.02), rgba(239, 68, 68, 0.05))"
                            minH={{ base: '280px', sm: '320px', md: '380px' }}
                            sx={{
                              // Safe area support para iPhone 14 Pro
                              paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
                              paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
                            }}
                          >
                            <ExpenseChart
                              transactions={transactions}
                              selectedPeriod={selectedPeriod}
                            />
                          </Box>
                        </TabPanel>

                        {/* Income Chart Panel */}
                        <TabPanel p={0} flex="1">
                          <Box 
                            p={{ base: 3, sm: 4, md: 6 }} 
                            flex="1"
                            bg="linear-gradient(135deg, rgba(34, 197, 94, 0.02), rgba(34, 197, 94, 0.05))"
                            minH={{ base: '280px', sm: '320px', md: '380px' }}
                            sx={{
                              // Safe area support para iPhone 14 Pro
                              paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
                              paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
                            }}
                          >
                            <IncomeChart
                              transactions={transactions}
                              selectedPeriod={selectedPeriod}
                            />
                          </Box>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </VStack>
                </Box>
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
