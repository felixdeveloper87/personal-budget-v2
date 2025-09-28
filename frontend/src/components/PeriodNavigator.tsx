import { 
  Button, 
  ButtonGroup,
  HStack, 
  Text, 
  IconButton, 
  Card, 
  CardBody, 
  VStack,
  Badge,
  Divider
} from '@chakra-ui/react'
import { useThemeColors } from '../hooks/useThemeColors'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Calendar, RotateCcw, CalendarDays, CalendarRange, BarChart3 } from 'lucide-react'

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
  periodLabel 
}: PeriodNavigatorProps) {
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

  const goToToday = () => {
    onDateChange(new Date())
  }

  const periods = [
    { type: 'day' as PeriodType, label: 'Day', icon: Calendar },
    { type: 'week' as PeriodType, label: 'Week', icon: CalendarDays },
    { type: 'month' as PeriodType, label: 'Month', icon: CalendarRange },
    { type: 'year' as PeriodType, label: 'Year', icon: BarChart3 }
  ]

  const colors = useThemeColors()

  return (
    <Card bg={colors.cardBg} shadow="lg" borderRadius="2xl" border="1px" borderColor={colors.border}>
      <CardBody p={{ base: 4, md: 6 }}>
        <VStack spacing={6} align="stretch">
          {/* Time Period Filter Section */}
          <VStack spacing={4} align="stretch">
            <HStack spacing={3} align="center">
              <Calendar size={20} color={colors.text.secondary} />
              <Text fontSize="lg" fontWeight="600" color={colors.text.label}>
                Time Period
              </Text>
              <Badge colorScheme="blue" borderRadius="full" px={3}>
                Filter
              </Badge>
            </HStack>
            <Text fontSize="sm" color={colors.text.secondary}>
              Choose how you want to view your financial data
            </Text>
            
            <ButtonGroup isAttached variant="outline" size="md" w="full">
              {periods.map((period) => {
                const IconComponent = period.icon
                return (
                  <Button
                    key={period.type}
                    colorScheme={selectedPeriod === period.type ? 'blue' : 'gray'}
                    variant={selectedPeriod === period.type ? 'solid' : 'outline'}
                    onClick={() => onPeriodChange(period.type)}
                    borderRadius="xl"
                    flex={1}
                    fontWeight="600"
                  >
                    <HStack spacing={2}>
                      <IconComponent size={18} />
                      <Text>{period.label}</Text>
                    </HStack>
                  </Button>
                )
              })}
            </ButtonGroup>
          </VStack>

          <Divider />

          {/* Period Navigation Section */}
          <VStack spacing={4} align="stretch">
            <HStack spacing={3} align="center" justify="center">
              <Calendar size={20} color={colors.text.secondary} />
              <Text fontSize="lg" fontWeight="600" color={colors.text.label}>
                Period Navigation
              </Text>
              <Badge colorScheme="green" borderRadius="full" px={3}>
                Navigate
              </Badge>
            </HStack>
            <Text fontSize="sm" color={colors.text.secondary} textAlign="center">
              Navigate through different time periods
            </Text>
            
            <HStack spacing={4} align="center" justify="space-between">
              <HStack spacing={2}>
                <IconButton
                  aria-label="Previous period"
                  icon={<ChevronLeftIcon />}
                  size="md"
                  variant="outline"
                  colorScheme="blue"
                  borderRadius="xl"
                  onClick={() => navigatePeriod('prev')}
                />
                <IconButton
                  aria-label="Next period"
                  icon={<ChevronRightIcon />}
                  size="md"
                  variant="outline"
                  colorScheme="blue"
                  borderRadius="xl"
                  onClick={() => navigatePeriod('next')}
                />
              </HStack>
              
              <Text fontSize="lg" fontWeight="600" color={colors.text.label} textAlign="center" flex="1">
                {periodLabel}
              </Text>
              
              <Button 
                size="md" 
                variant="outline" 
                colorScheme="blue" 
                borderRadius="xl"
                leftIcon={<RotateCcw size={16} />}
                onClick={goToToday}
              >
                Today
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
