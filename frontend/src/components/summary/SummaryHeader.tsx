import {
  HStack,
  Text,
  Flex,
  Heading,
  useColorModeValue,
  Box,
  VStack,
  Image,
} from '@chakra-ui/react'
import summaryImage from '../../../assets/summary.png'
import PeriodNavigator from './PeriodNavigator'
import { PeriodType } from '../../types'

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
  const containerBorder = useColorModeValue('whiteAlpha.400', 'whiteAlpha.100')
  const containerBg = useColorModeValue('rgba(255, 255, 255, 0.6)', 'rgba(0, 0, 0, 0.4)')

  return (
    <Flex
      justify="space-between"
      align="center"
      w="full"
      direction={{ base: 'column', lg: 'row' }}
      gap={{ base: 4, lg: 8 }}
      border="1px solid"
      borderColor={containerBorder}
      borderRadius="2xl"
      bg={containerBg}
      // backdropFilter="blur(20px)"
      // boxShadow="0 8px 32px rgba(31, 38, 135, 0.07)"
    >
      {/* Left side */}
      <HStack spacing={4} w={{ base: 'full', lg: 'auto' }}>
        <Box
          p={2}
          bg="transparent"
          borderRadius="xl"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            src={summaryImage}
            alt="Summary"
            boxSize={{ base: 8, sm: 10, md: 12 }}
            objectFit="contain"
          />
        </Box>
        <VStack align="start" spacing={0.5}>
          <Heading
            size="md"
            fontWeight="700"
            textAlign="left"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.02em"
            fontSize={{ base: 'lg', sm: 'xl' }}
            bgGradient={useColorModeValue(
              'linear(to-r, gray.800, gray.600)',
              'linear(to-r, white, gray.300)'
            )}
            bgClip="text"
          >
            Overview
          </Heading>
          <Text
            fontSize={{ base: 'xs', sm: 'xl' }}
            color={useColorModeValue('gray.500', 'gray.400')}
            fontWeight="600"
            textAlign="left"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Financial summary & insights
          </Text>
        </VStack>
      </HStack>

      {/* Right side - Period Navigator */}
      <Box w={{ base: 'full', lg: '75%' }} maxW={{ lg: '900px' }}>
        <PeriodNavigator
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
          onNavigatePeriod={onNavigatePeriod}
          onGoToToday={onGoToToday}
          formatLabel={formatLabel}
        />
      </Box>
    </Flex>
  )
}
