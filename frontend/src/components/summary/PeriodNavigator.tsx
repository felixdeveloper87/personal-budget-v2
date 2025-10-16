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

  // Modern post-it inspired colors
  const selectedBg = useColorModeValue(
    '#dbeafe', // Azul post-it
    '#1e293b'  // Azul escuro
  )
  const unselectedBg = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(30, 41, 59, 0.6)' // Azul escuro mais suave para botões não selecionados
  )
  const unselectedColor = useColorModeValue('gray.600', 'gray.300')
  const selectedColor = useColorModeValue('blue.600', 'blue.300')
  const unselectedBorder = useColorModeValue('gray.200', 'gray.600')
  const selectedBorder = useColorModeValue('blue.300', 'blue.500')
  const hoverBorder = useColorModeValue('blue.200', 'blue.400')

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
                color={selected ? selectedColor : unselectedColor}
                border="1px solid"
                borderColor={selected ? selectedBorder : unselectedBorder}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="500"
                _hover={{ 
                  transform: 'translateY(-2px) scale(1.02)', 
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  borderColor: selected ? selectedBorder : hoverBorder,
                  bg: selected ? selectedBg : useColorModeValue('gray.50', 'rgba(30, 41, 59, 0.8)')
                }}
                _active={{
                  transform: 'translateY(0) scale(0.98)'
                }}
                transition="all 0.2s ease"
              >
                <VStack spacing={0.5}>
                  <IconComp size={14} />
                  <Text fontSize="2xs" fontWeight="500">
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
                color={selected ? selectedColor : unselectedColor}
                border="1px solid"
                borderColor={selected ? selectedBorder : unselectedBorder}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="500"
                _hover={{ 
                  transform: 'translateY(-2px) scale(1.02)', 
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  borderColor: selected ? selectedBorder : hoverBorder,
                  bg: selected ? selectedBg : useColorModeValue('gray.50', 'rgba(30, 41, 59, 0.8)')
                }}
                _active={{
                  transform: 'translateY(0) scale(0.98)'
                }}
                transition="all 0.2s ease"
              >
                {label}
              </Button>
            )
          })}
        </HStack>
      )}

      <HStack spacing={3} justify="space-between" w="full">
        <IconButton
          aria-label="Previous period"
          icon={<ArrowLeft size={18} />}
          onClick={() => onNavigatePeriod('prev')}
          variant="outline"
          borderRadius="xl"
          borderColor={useColorModeValue('gray.300', 'gray.600')}
          color={useColorModeValue('gray.600', 'gray.300')}
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('blue.300', 'blue.500'),
            color: useColorModeValue('blue.600', 'blue.300')
          }}
          transition="all 0.2s ease"
        />
        
        <Box
          flex="1"
          textAlign="center"
          px={4}
          py={3}
          borderRadius="xl"
          bg={useColorModeValue(
            'rgba(255, 255, 255, 0.9)',
            'rgba(30, 41, 59, 0.8)' // Azul escuro mais suave
          )}
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'blue.500')}
          backdropFilter="blur(10px)"
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('blue.200', 'blue.400'),
            bg: useColorModeValue(
              'rgba(255, 255, 255, 0.95)',
              'rgba(30, 41, 59, 0.9)'
            )
          }}
          transition="all 0.2s ease"
        >
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="600"
            color={useColorModeValue('gray.800', 'gray.100')}
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {formatLabel()}
          </Text>
        </Box>
        
        <IconButton
          aria-label="Next period"
          icon={<ArrowRight size={18} />}
          onClick={() => onNavigatePeriod('next')}
          variant="outline"
          borderRadius="xl"
          borderColor={useColorModeValue('gray.300', 'gray.600')}
          color={useColorModeValue('gray.600', 'gray.300')}
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('blue.300', 'blue.500'),
            color: useColorModeValue('blue.600', 'blue.300')
          }}
          transition="all 0.2s ease"
        />
      </HStack>
    </VStack>
  )
}
