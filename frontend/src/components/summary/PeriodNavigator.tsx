import {
  VStack,
  HStack,
  Button,
  IconButton,
  Text,
  Box,
  SimpleGrid,
  Flex,
  useBreakpointValue,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import {
  Activity,
  Calendar,
  CalendarDays,
  CalendarRange,
  ArrowLeft,
  ArrowRight,
  CalendarClock
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

  // Premium Glass Container Styles
  const containerBg = useColorModeValue('rgba(255, 255, 255, 0.6)', 'rgba(0, 0, 0, 0.4)')
  const containerBorder = useColorModeValue('whiteAlpha.400', 'whiteAlpha.100')
  const containerShadow = useColorModeValue(
    '0 8px 32px rgba(31, 38, 135, 0.07)',
    '0 8px 32px rgba(0, 0, 0, 0.3)'
  )

  // Selected Button Gradient (Blue/Purple theme)
  const selectedBg = useColorModeValue(
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
  )

  const periods = [
    { type: 'day' as PeriodType, label: 'Day', icon: Calendar },
    { type: 'week' as PeriodType, label: 'Week', icon: CalendarDays },
    { type: 'month' as PeriodType, label: 'Month', icon: CalendarRange },
    { type: 'year' as PeriodType, label: 'Year', icon: Activity },
  ]

  return (
    <Box
      w="full"
      bg={containerBg}
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor={containerBorder}
      borderRadius="2xl"
      boxShadow={containerShadow}
      p={{ base: 3, md: 4 }}
      position="relative"
      overflow="hidden"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        boxShadow: useColorModeValue(
          '0 12px 40px rgba(31, 38, 135, 0.12)',
          '0 12px 40px rgba(0, 0, 0, 0.5)'
        ),
        transform: 'translateY(-2px)'
      }}
    >
      {/* Decorative gradient blob */}
      <Box
        position="absolute"
        top="-50%"
        left="20%"
        width="200px"
        height="200px"
        bg="radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)"
        filter="blur(40px)"
        zIndex={0}
        pointerEvents="none"
      />

      <Flex
        direction={{ base: 'column', xl: 'row' }}
        align={{ base: 'stretch', xl: 'center' }}
        justify="space-between"
        gap={{ base: 3, md: 4 }}
        position="relative"
        zIndex={1}
      >
        {/* Left Side - Label (Desktop Only) */}
        <HStack spacing={3} display={{ base: 'none', xl: 'flex' }} minW="fit-content">
          <Box
            p={2.5}
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={CalendarClock} boxSize={12} color="blue.500" />
          </Box>
          <VStack align="start" spacing={0}>
            <Text
              fontSize="sm"
              fontWeight="700"
              color={useColorModeValue('gray.800', 'white')}
            >
              Period
            </Text>
            <Text
              fontSize="xs"
              fontWeight="500"
              color={useColorModeValue('gray.500', 'gray.400')}
            >
              Navigate through time
            </Text>
          </VStack>
        </HStack>

        {/* Right Side - Controls */}
        <VStack spacing={4} align="stretch" flex={1}>
          {/* Period Selection Pills */}
          <Box
            bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.50')}
            p={1}
            borderRadius="xl"
            border="1px solid"
            borderColor={useColorModeValue('whiteAlpha.400', 'whiteAlpha.100')}
          >
            {isMobile ? (
              <SimpleGrid columns={4} spacing={1}>
                {periods.map(({ type, label, icon: IconComp }) => {
                  const selected = selectedPeriod === type
                  return (
                    <Button
                      key={type}
                      size="sm"
                      h="36px"
                      borderRadius="lg"
                      onClick={() => onPeriodChange(type)}
                      bg={selected ? selectedBg : 'transparent'}
                      color={selected ? 'white' : useColorModeValue('gray.600', 'gray.400')}
                      _hover={{
                        bg: selected ? selectedBg : useColorModeValue('whiteAlpha.800', 'whiteAlpha.100'),
                      }}
                      _active={{ transform: 'scale(0.95)' }}
                      transition="all 0.2s ease"
                      boxShadow={selected ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'}
                    >
                      <VStack spacing={0}>
                        <Icon as={IconComp} boxSize={4} strokeWidth={2.5} />
                      </VStack>
                    </Button>
                  )
                })}
              </SimpleGrid>
            ) : (
              <HStack spacing={1}>
                {periods.map(({ type, label, icon: IconComp }) => {
                  const selected = selectedPeriod === type
                  return (
                    <Button
                      key={type}
                      flex={1}
                      h="36px"
                      borderRadius="lg"
                      leftIcon={<Icon as={IconComp} boxSize={4} strokeWidth={2.5} />}
                      onClick={() => onPeriodChange(type)}
                      bg={selected ? selectedBg : 'transparent'}
                      color={selected ? 'white' : useColorModeValue('gray.600', 'gray.400')}
                      fontWeight={selected ? '600' : '500'}
                      _hover={{
                        bg: selected ? selectedBg : useColorModeValue('whiteAlpha.800', 'whiteAlpha.100'),
                        transform: 'translateY(-1px)'
                      }}
                      _active={{ transform: 'scale(0.98)' }}
                      transition="all 0.2s ease"
                      boxShadow={selected ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'}
                    >
                      {label}
                    </Button>
                  )
                })}
              </HStack>
            )}
          </Box>

          {/* Date Navigation */}
          <HStack spacing={3} justify="space-between" w="full">
            <IconButton
              aria-label="Previous period"
              icon={<Icon as={ArrowLeft} boxSize={5} strokeWidth={2.5} />}
              onClick={() => onNavigatePeriod('prev')}
              variant="ghost"
              isRound
              size="md"
              color={useColorModeValue('gray.600', 'gray.400')}
              _hover={{
                bg: useColorModeValue('whiteAlpha.800', 'whiteAlpha.200'),
                color: 'blue.500',
                transform: 'translateX(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              transition="all 0.2s ease"
            />

            <HStack
              flex="1"
              justify="center"
              spacing={3}
              py={2}
              px={4}
              borderRadius="xl"
              bg={useColorModeValue('whiteAlpha.500', 'whiteAlpha.50')}
              border="1px solid"
              borderColor={useColorModeValue('whiteAlpha.400', 'whiteAlpha.100')}
              backdropFilter="blur(10px)"
              transition="all 0.2s ease"
              _hover={{
                borderColor: 'blue.400',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.15)'
              }}
            >
              <Icon as={CalendarClock} boxSize={5} color="blue.500" />
              <Text
                fontSize={{ base: 'sm', md: 'md' }}
                fontWeight="700"
                bgGradient={useColorModeValue(
                  'linear(to-r, gray.800, gray.600)',
                  'linear(to-r, white, gray.300)'
                )}
                bgClip="text"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="wide"
              >
                {formatLabel()}
              </Text>
            </HStack>

            <IconButton
              aria-label="Next period"
              icon={<Icon as={ArrowRight} boxSize={5} strokeWidth={2.5} />}
              onClick={() => onNavigatePeriod('next')}
              variant="ghost"
              isRound
              size="md"
              color={useColorModeValue('gray.600', 'gray.400')}
              _hover={{
                bg: useColorModeValue('whiteAlpha.800', 'whiteAlpha.200'),
                color: 'blue.500',
                transform: 'translateX(2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              transition="all 0.2s ease"
            />
          </HStack>
        </VStack>
      </Flex>
    </Box>
  )
}
