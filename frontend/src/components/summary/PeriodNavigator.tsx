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
  formatLabel,
}: PeriodNavigatorProps) {
  const isMobile = useBreakpointValue({ base: true, md: false })

  const selectedBg = useColorModeValue(
    'linear-gradient(135deg, rgb(219, 234, 254) 0%, rgb(191, 219, 254) 50%, rgb(147, 197, 253) 100%)',
    'linear-gradient(135deg, rgb(30, 41, 59) 0%, rgb(51, 65, 85) 50%, rgb(71, 85, 105) 100%)'
  )

  const unselectedColor = useColorModeValue('gray.700', 'gray.100')
  const selectedColor = useColorModeValue('blue.600', 'blue.300')
  const unselectedBorder = useColorModeValue('gray.400', 'gray.700')
  const selectedBorder = useColorModeValue('blue.400', 'blue.500')
  const hoverBorder = useColorModeValue('blue.300', 'blue.400')

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
                h="32px"
                borderRadius="xl"
                onClick={() => onPeriodChange(type)}
                background={selected ? selectedBg : 'transparent'}
                color={selected ? selectedColor : unselectedColor}
                border="1px solid"
                borderColor={selected ? selectedBorder : unselectedBorder}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="500"
                _hover={{ 
                  transform: 'translateY(-2px) scale(1.02)', 
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  borderColor: selected ? selectedBorder : hoverBorder,
                  background: selected ? selectedBg : useColorModeValue('gray.50', 'rgba(30, 41, 59, 0.8)')
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
                h="32px"
                borderRadius="xl"
                leftIcon={<IconComp size={16} />}
                onClick={() => onPeriodChange(type)}
                background={selected ? selectedBg : 'transparent'}
                color={selected ? selectedColor : unselectedColor}
                border="1px solid"
                borderColor={selected ? selectedBorder : unselectedBorder}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="500"
                _hover={{ 
                  transform: 'translateY(-2px) scale(1.02)', 
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  borderColor: selected ? selectedBorder : hoverBorder,
                  background: selected ? selectedBg : useColorModeValue('gray.50', 'rgba(30, 41, 59, 0.8)')
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
          h="32px"
          w="32px"
          borderRadius="xl"
          borderColor={useColorModeValue('gray.400', 'gray.600')}
          color={useColorModeValue('gray.600', 'gray.300')}
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('blue.400', 'blue.500'),
            color: useColorModeValue('blue.600', 'blue.300')
          }}
          transition="all 0.2s ease"
        />
        
        <Box
          flex="1"
          textAlign="center"
          px={4}
          py={2}
          borderRadius="xl"
          // bg={useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark)}
          border="1px solid"
          borderColor={useColorModeValue('gray.300', 'blue.500')}
          backdropFilter="blur(10px)"
          h="32px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('blue.300', 'blue.400'),
            // bg: useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark)
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
          h="32px"
          w="32px"
          borderRadius="xl"
          borderColor={useColorModeValue('gray.400', 'gray.600')}
          color={useColorModeValue('gray.600', 'gray.300')}
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('blue.400', 'blue.500'),
            color: useColorModeValue('blue.600', 'blue.300')
          }}
          transition="all 0.2s ease"
        />
      </HStack>
    </VStack>
  )
}
