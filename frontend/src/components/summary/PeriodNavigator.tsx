import {
  VStack,
  HStack,
  Button,
  IconButton,
  Text,
  Box,
  SimpleGrid,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  Activity,
  Calendar,
  CalendarDays,
  CalendarRange,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { PeriodType } from '../../types'
import { getResponsiveStyles } from '../ui'
import { useThemeColors } from '../../hooks/useThemeColors'

interface PeriodNavigatorProps {
  selectedPeriod: PeriodType
  onPeriodChange: (period: PeriodType) => void
  onNavigatePeriod: (direction: 'prev' | 'next') => void
  onGoToToday: () => void
  formatLabel: () => string
}

export default function PeriodNavigator({
  selectedPeriod,
  onPeriodChange,
  onNavigatePeriod,
  onGoToToday,
  formatLabel,
}: PeriodNavigatorProps) {
  const colors = useThemeColors()
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Colors for theme consistency
  const selectedBg = useColorModeValue(
    'linear-gradient(135deg,rgb(31, 32, 33),rgb(101, 118, 173))',
    'linear-gradient(135deg,rgb(8, 8, 8),rgb(44, 69, 120))'
  )
  const unselectedBg = colors.bgSecondary
  const unselectedColor = colors.text.primary
  const unselectedBorder = colors.border
  const selectedBorder = useColorModeValue('blue.300', 'blue.600')
  const hoverBorder = colors.borderHover

  const periods = [
    { type: 'day' as PeriodType, label: 'Day', icon: Calendar },
    { type: 'week' as PeriodType, label: 'Week', icon: CalendarDays },
    { type: 'month' as PeriodType, label: 'Month', icon: CalendarRange },
    { type: 'year' as PeriodType, label: 'Year', icon: Activity },
  ]

  return (
    <VStack spacing={3} align="stretch">
      {isMobile ? (
        <SimpleGrid columns={4} spacing={2}>
          {periods.map(({ type, label, icon: IconComp }) => {
            const selected = selectedPeriod === type
            return (
              <Button
                key={type}
                size="sm"
                borderRadius="xl"
                onClick={() => onPeriodChange(type)}
                bg={selected ? selectedBg : unselectedBg}
                color={selected ? 'white' : unselectedColor}
                border="1px solid"
                borderColor={selected ? selectedBorder : unselectedBorder}
                _hover={{ 
                  transform: 'translateY(-1px)', 
                  boxShadow: 'md',
                  borderColor: selected ? selectedBorder : hoverBorder,
                }}
              >
                <VStack spacing={0.5}>
                  <IconComp size={14} />
                  <Text fontSize="2xs" fontWeight="600">
                    {label}
                  </Text>
                </VStack>
              </Button>
            )
          })}
        </SimpleGrid>
      ) : (
        <HStack spacing={2}>
          {periods.map(({ type, label, icon: IconComp }) => {
            const selected = selectedPeriod === type
            return (
              <Button
                key={type}
                flex={1}
                borderRadius="xl"
                leftIcon={<IconComp size={16} />}
                onClick={() => onPeriodChange(type)}
                bg={selected ? selectedBg : unselectedBg}
                color={selected ? 'white' : unselectedColor}
                border="1px solid"
                borderColor={selected ? selectedBorder : unselectedBorder}
                _hover={{ 
                  transform: 'translateY(-1px)', 
                  boxShadow: 'lg',
                  borderColor: selected ? selectedBorder : hoverBorder,
                }}
              >
                {label}
              </Button>
            )
          })}
        </HStack>
      )}

      <HStack spacing={2} justify="space-between" w="full">
        <IconButton
          aria-label="Previous period"
          icon={<ArrowLeft size={18} />}
          onClick={() => onNavigatePeriod('prev')}
          variant="outline"
          colorScheme="blue"
        />
        
        <Box
          flex="1"
          textAlign="center"
          px={4}
          py={2}
          borderRadius="md"
          background={useColorModeValue(
            'linear-gradient(135deg,rgb(106, 151, 209),rgb(142, 178, 223),rgb(132, 159, 188))',
            'linear-gradient(135deg,rgb(20, 20, 21),rgb(50, 70, 135),rgb(19, 32, 59))'
          )}
          border="1px solid"
          borderColor={useColorModeValue('blue.200', 'blue.700')}
        >
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="600"
          >
            {formatLabel()}
          </Text>
        </Box>
        
        <IconButton
          aria-label="Next period"
          icon={<ArrowRight size={18} />}
          onClick={() => onNavigatePeriod('next')}
          variant="outline"
          colorScheme="blue"
        />
      </HStack>
    </VStack>
  )
}
