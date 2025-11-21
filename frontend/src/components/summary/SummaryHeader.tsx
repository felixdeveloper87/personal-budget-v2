import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Stack,
  Badge,
  Icon,
  useBreakpointValue,
  useToken,
  Image,
} from '@chakra-ui/react'
import {
  CalendarDays,
  CalendarRange,
  Calendar,
  CalendarClock,
  Sparkles,
} from 'lucide-react'
import PeriodNavigator from './PeriodNavigator'
import { PeriodType } from '../../types'
import summaryImage from '../../../assets/summary.png'

interface SummaryHeaderProps {
  selectedPeriod: PeriodType
  onPeriodChange: (period: PeriodType) => void
  onNavigatePeriod: (direction: 'prev' | 'next') => void
  onGoToToday: () => void
  formatLabel: () => string
}

export default function SummaryHeader({
  selectedPeriod,
  onPeriodChange,
  onNavigatePeriod,
  onGoToToday,
  formatLabel,
}: SummaryHeaderProps) {
  const containerBg = useColorModeValue('white', 'black')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const highlightText = useColorModeValue('gray.800', 'whiteAlpha.900')
  const descriptionColor = useColorModeValue('gray.600', 'gray.300')

  const periodMeta = (() => {
    const base = {
      day: {
        label: 'Daily snapshot',
        detail: "Today’s momentum and insights",
        icon: CalendarDays,
        accentColor: 'blue.400',
      },
      week: {
        label: 'Weekly progress',
        detail: 'Rolling 7-day performance',
        icon: CalendarRange,
        accentColor: 'purple.400',
      },
      month: {
        label: 'Monthly overview',
        detail: "All activity for this month",
        icon: Calendar,
        accentColor: 'green.400',
      },
      year: {
        label: 'Year-to-date',
        detail: 'Full-year trajectory',
        icon: CalendarClock,
        accentColor: 'orange.400',
      },
    }

    return base[selectedPeriod]
  })()
  const [accentColorValue] = useToken('colors', [periodMeta.accentColor])
  const layoutDirection = useBreakpointValue<'column' | 'row'>({
    base: 'column',
    lg: 'row',
  })

  return (
    <Box
      w="full"
      bg={containerBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="3xl"
      px={{ base: 4, md: 6 }}
      py={{ base: 4, md: 6 }}
      shadow={useColorModeValue('md', 'xl')}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset={0}
        // bgGradient={useColorModeValue(
        //   'linear(to-r, rgba(59,130,246,0.08), rgba(16,185,129,0.05))',
        //   'linear(to-r, rgba(59,130,246,0.15), rgba(16,185,129,0.08))'
        // )}
        opacity={0.7}
        pointerEvents="none"
      />

      <Flex
        position="relative"
        zIndex={1}
        justify="space-between"
        align="stretch"
        direction={layoutDirection}
        gap={{ base: 6, lg: 10 }}
      >
        <Stack spacing={4} flex="1">
          <HStack spacing={4} align="center">
            <Box
              p={3}
              borderRadius="2xl"
              border="1px solid"
              borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.300')}
            >
              <Image
                src={summaryImage}
                alt="Summary"
                boxSize={{ base: 10, sm: 12 }}
                objectFit="contain"
              />
            </Box>
            <VStack align="flex-start" spacing={0}>
              <Heading
                size={useBreakpointValue({ base: 'md', md: 'lg' })}
                letterSpacing="-0.04em"
                color={highlightText}
              >
                Overview
              </Heading>
              <Text fontSize="sm" color={descriptionColor}>
                Financial summary & insights
              </Text>
            </VStack>
          </HStack>


          <VStack align="flex-start" spacing={2}>
            <Heading
              size={useBreakpointValue({ base: 'lg', md: 'xl' })}
              letterSpacing="-0.04em"
              color={highlightText}
              fontWeight="800"
            >
              Personalized insights to guide your next move
            </Heading>
            <Text color={descriptionColor} fontSize={{ base: 'sm', md: 'md' }}>
              Track performance, spot opportunities, and stay ahead of your plan
              with an adaptive summary for every period.
            </Text>
          </VStack>

          <HStack
            spacing={3}
            align="center"
            flexWrap="wrap"
            bg={containerBg}
            borderRadius="xl"
            px={3}
            py={3}
            border="1px solid"
            borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.200')}
          >
            <Box
              p={2}
              borderRadius="lg"
              bg={`${accentColorValue}1a`}
              border="1px solid"
              borderColor={`${accentColorValue}66`}
            >
              <Icon as={periodMeta.icon} color={periodMeta.accentColor} />
            </Box>
            <VStack align="flex-start" spacing={0} >
              <Text
                fontSize="xs"
                letterSpacing="0.08em"
                textTransform="uppercase"
                fontWeight="700"
                color={periodMeta.accentColor}
              >
                {periodMeta.label}
              </Text>
              <Text fontSize="sm" color={descriptionColor}>
                {periodMeta.detail} • {formatLabel()}
              </Text>
            </VStack>
          </HStack>
        </Stack>

        <Box
          flex={{ base: 'unset', lg: '0 0 420px' }}
          w="full"
          bg={useColorModeValue('white', 'blackAlpha.400')}
          borderRadius="2xl"
          border="1px solid"
          borderColor={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
          p={{ base: 3, sm: 4 }}
          shadow="lg"
        >
          <PeriodNavigator
            selectedPeriod={selectedPeriod}
            onPeriodChange={onPeriodChange}
            onNavigatePeriod={onNavigatePeriod}
            onGoToToday={onGoToToday}
            formatLabel={formatLabel}
          />
        </Box>
      </Flex>
    </Box>
  )
}
