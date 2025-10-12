import {
  Box,
  Button,
  HStack,
  Text,
  IconButton,
  Card,
  CardBody,
  VStack,
  SimpleGrid,
  useBreakpointValue,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { Calendar, RotateCcw, CalendarDays, CalendarRange, BarChart3, ArrowLeft, ArrowRight } from 'lucide-react'

export type PeriodType = 'day' | 'week' | 'month' | 'year'

interface PeriodNavigatorProps {
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
  periodLabel: string
}

export default function PeriodNavigator({
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
  periodLabel,
}: PeriodNavigatorProps) {
  const isMobile = useBreakpointValue({ base: true, md: false })
  const colors = useThemeColors()

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
    return periodLabel
  }

  return (
    <Card bg={colors.cardBg} shadow="md" borderRadius="xl" border="1px" borderColor={colors.border}>
      <CardBody p={{ base: 4, md: 5 }}>
        <VStack spacing={4} align="stretch">
          {/* Título principal */}
          <HStack justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={Calendar} boxSize={5} color="blue.500" />
              <Text fontSize="lg" fontWeight="700" color={colors.text.label}>
                Period Filter
              </Text>
            </HStack>
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

          {/* Seleção de período compacta */}
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
      </CardBody>
    </Card>
  )
}
