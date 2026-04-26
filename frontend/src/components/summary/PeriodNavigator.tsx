import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarDays,
  CalendarRange,
  CalendarClock,
} from 'lucide-react'
import { PeriodType } from '../../types'

interface PeriodNavigatorProps {
  selectedPeriod: PeriodType
  onPeriodChange: (period: PeriodType) => void
  onNavigatePeriod: (direction: 'prev' | 'next') => void
  onGoToToday: () => void
  formatLabel: () => string
  /**
   * When embedded inside another card the navigator drops its own surface
   * (no border / no background) and just renders the controls.
   */
  isEmbedded?: boolean
}

interface PeriodOption {
  type: PeriodType
  label: string
  icon: typeof Calendar
}

const PERIODS: PeriodOption[] = [
  { type: 'day', label: 'Day', icon: Calendar },
  { type: 'week', label: 'Week', icon: CalendarDays },
  { type: 'month', label: 'Month', icon: CalendarRange },
  { type: 'year', label: 'Year', icon: Activity },
]

export default function PeriodNavigator({
  selectedPeriod,
  onPeriodChange,
  onNavigatePeriod,
  formatLabel,
  isEmbedded = false,
}: PeriodNavigatorProps) {
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Pre-resolve EVERY token at the top so no hook is called inside loops
  // or conditional branches. Fixes the React Hooks order warning previously
  // emitted by this component.
  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const surfaceBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  const trackBg = useColorModeValue('gray.100', 'whiteAlpha.50')
  const trackBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

  const inactivePillColor = useColorModeValue('gray.600', 'gray.300')
  const activePillBg = useColorModeValue('white', 'whiteAlpha.200')
  const activePillColor = useColorModeValue('blue.600', 'blue.300')
  const activePillBorder = useColorModeValue(
    'blue.200',
    'rgba(59,130,246,0.35)',
  )
  const activePillShadow = useColorModeValue(
    '0 1px 2px rgba(15,23,42,0.06)',
    'none',
  )

  const navIconColor = useColorModeValue('gray.600', 'gray.300')
  const navIconHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const navIconHoverColor = useColorModeValue('blue.600', 'blue.300')

  const labelBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const labelBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const labelColor = useColorModeValue('gray.800', 'gray.50')

  return (
    <Box
      w="full"
      bg={isEmbedded ? 'transparent' : surfaceBg}
      border={isEmbedded ? 'none' : '1px solid'}
      borderColor={surfaceBorder}
      borderRadius={isEmbedded ? 'none' : '2xl'}
      p={isEmbedded ? 0 : { base: 3, md: 4 }}
    >
      <Flex direction="column" gap={3} w="full">
        <Box
          bg={trackBg}
          p={1}
          borderRadius="xl"
          border="1px solid"
          borderColor={trackBorder}
        >
          {isMobile ? (
            <SimpleGrid columns={4} spacing={1}>
              {PERIODS.map(({ type, icon: PeriodIcon, label }) => {
                const selected = selectedPeriod === type
                return (
                  <Button
                    key={type}
                    size="sm"
                    h="34px"
                    borderRadius="lg"
                    onClick={() => onPeriodChange(type)}
                    aria-label={label}
                    aria-pressed={selected}
                    bg={selected ? activePillBg : 'transparent'}
                    color={selected ? activePillColor : inactivePillColor}
                    border="1px solid"
                    borderColor={selected ? activePillBorder : 'transparent'}
                    boxShadow={selected ? activePillShadow : 'none'}
                    transition="background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease"
                    _hover={
                      selected
                        ? undefined
                        : { color: activePillColor }
                    }
                    _active={{ transform: 'scale(0.97)' }}
                    _focusVisible={{
                      outline: '2px solid',
                      outlineColor: 'blue.300',
                      outlineOffset: '2px',
                    }}
                  >
                    <Icon as={PeriodIcon} boxSize={4} strokeWidth={2.25} />
                  </Button>
                )
              })}
            </SimpleGrid>
          ) : (
            <HStack spacing={1}>
              {PERIODS.map(({ type, label, icon: PeriodIcon }) => {
                const selected = selectedPeriod === type
                return (
                  <Button
                    key={type}
                    flex={1}
                    h="34px"
                    borderRadius="lg"
                    leftIcon={
                      <Icon as={PeriodIcon} boxSize={3.5} strokeWidth={2.25} />
                    }
                    onClick={() => onPeriodChange(type)}
                    aria-pressed={selected}
                    bg={selected ? activePillBg : 'transparent'}
                    color={selected ? activePillColor : inactivePillColor}
                    fontWeight={selected ? 600 : 500}
                    fontSize="sm"
                    border="1px solid"
                    borderColor={selected ? activePillBorder : 'transparent'}
                    boxShadow={selected ? activePillShadow : 'none'}
                    transition="background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease"
                    _hover={
                      selected
                        ? undefined
                        : { color: activePillColor }
                    }
                    _active={{ transform: 'scale(0.99)' }}
                    _focusVisible={{
                      outline: '2px solid',
                      outlineColor: 'blue.300',
                      outlineOffset: '2px',
                    }}
                  >
                    {label}
                  </Button>
                )
              })}
            </HStack>
          )}
        </Box>

        <HStack spacing={2} w="full">
          <IconButton
            aria-label="Previous period"
            icon={<Icon as={ArrowLeft} boxSize={4} strokeWidth={2.5} />}
            onClick={() => onNavigatePeriod('prev')}
            variant="ghost"
            size="md"
            borderRadius="lg"
            color={navIconColor}
            _hover={{ bg: navIconHoverBg, color: navIconHoverColor }}
            transition="background-color 0.15s ease, color 0.15s ease"
          />

          <HStack
            flex={1}
            justify="center"
            spacing={2}
            py={2}
            px={3}
            borderRadius="lg"
            bg={labelBg}
            border="1px solid"
            borderColor={labelBorder}
          >
            <Icon as={CalendarClock} boxSize={4} color={activePillColor} />
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight={700}
              color={labelColor}
              letterSpacing="-0.01em"
            >
              {formatLabel()}
            </Text>
          </HStack>

          <IconButton
            aria-label="Next period"
            icon={<Icon as={ArrowRight} boxSize={4} strokeWidth={2.5} />}
            onClick={() => onNavigatePeriod('next')}
            variant="ghost"
            size="md"
            borderRadius="lg"
            color={navIconColor}
            _hover={{ bg: navIconHoverBg, color: navIconHoverColor }}
            transition="background-color 0.15s ease, color 0.15s ease"
          />
        </HStack>
      </Flex>
    </Box>
  )
}
