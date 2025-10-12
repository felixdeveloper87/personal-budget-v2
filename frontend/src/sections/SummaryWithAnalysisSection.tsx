import {
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
  Button,
  IconButton,
  useBreakpointValue,
  SimpleGrid,
} from '@chakra-ui/react'
import {
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
import { SummaryCardsGrid, CategoryAnalysisTabs } from '../components/summary'

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


  const handleCardClick = (cardId: string) => {
    setSelectedCard(cardId as CardId)
    onOpen()
  }

  const selectedLabel = selectedCard

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
    
    // No modo mobile, quando dia está selecionado, exibe formato completo britânico
    if (selectedPeriod === 'day' && isMobile) {
      return selectedDate.toLocaleString('en-GB', {
        weekday: 'short',
        day: 'numeric',
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
    { type: 'year' as PeriodType, label: 'Year', icon: Activity },
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

                {/* Grid de cards */}
                <SummaryCardsGrid
                  transactions={transactions}
                  income={income}
                  expense={expense}
                  balance={balance}
                  onCardClick={handleCardClick}
                />

                <Divider />

                {/* Category Analysis Section */}
                <CategoryAnalysisTabs
                  transactions={transactions}
                  selectedPeriod={selectedPeriod}
                />
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
        cardLabel={selectedLabel as string}
        transactions={transactions}
        selectedPeriod={label}
        currentBalance={balance}
      />
    </>
  )
}
