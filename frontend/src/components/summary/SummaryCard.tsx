import {
  Card,
  CardBody,
  Text,
  Box,
  Icon,
  useColorModeValue,
  Flex,
  Stack,
  Circle,
  useBreakpointValue,
  useToken,
} from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'

interface SummaryCardProps {
  stat: {
    id: string
    label: string
    icon: LucideIcon
    color: string
    bgColor: string
    darkBgColor: string
    displayValue: string
    helpText: string
    description?: string
  }
  periodMeta: {
    label: string
    detail: string
    accentColor: string
    icon: LucideIcon
  }
  onCardClick: (cardId: string) => void
}

export default function SummaryCard({ stat, periodMeta, onCardClick }: SummaryCardProps) {
  const IconComponent = stat.icon
  const PeriodIcon = periodMeta.icon
  const [resolvedColor] = useToken('colors', [stat.color])

  const cardBg = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const helpBadgeBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.200')
  const helpBadgeColor = useColorModeValue('gray.600', 'gray.200')
  const valueColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const descriptionColor = useColorModeValue('gray.600', 'gray.300')
  const iconWrapperBg = useColorModeValue(stat.bgColor, stat.darkBgColor)
  const iconSize = useBreakpointValue({ base: '44px', sm: '52px', md: '56px' })
  const layoutDirection = useBreakpointValue<'column' | 'row'>({
    base: 'column',
    sm: 'row',
  })

  return (
    <Card
      role="button"
      aria-label={`View details for ${stat.label}`}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      cursor="pointer"
      position="relative"
      overflow="hidden"
      shadow="md"
      transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        bgGradient: useColorModeValue(
          `linear(to-br, ${stat.bgColor}, transparent)`,
          `linear(to-br, rgba(255,255,255,0.04), transparent)`
        ),
        opacity: 0.8,
      }}
      _hover={{
        transform: 'translateY(-6px)',
        shadow: 'xl',
        borderColor: stat.color,
        boxShadow: `0 16px 30px -14px ${resolvedColor}`,
      }}
      onClick={() => onCardClick(stat.id)}
    >
      <Box
        position="absolute"
        top="-20%"
        right="-15%"
        w="200px"
        h="200px"
        bgGradient={`radial(${stat.bgColor}, transparent)`}
        opacity={useColorModeValue(0.4, 0.2)}
        filter="blur(40px)"
      />

      <CardBody p={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        <Stack spacing={{ base: 4, md: 5 }}>
          <Flex align="center" gap={3} wrap="wrap">
            <Circle
              size={{ base: '34px', sm: '36px' }}
              bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.200')}
              color={periodMeta.accentColor}
              border="1px solid"
              borderColor={periodMeta.accentColor}
            >
              <Icon as={PeriodIcon} boxSize={4} />
            </Circle>
            <Box>
              <Text
                fontSize="xs"
                textTransform="uppercase"
                fontWeight="700"
                letterSpacing="0.08em"
                color={periodMeta.accentColor}
              >
                {periodMeta.label}
              </Text>
              <Text fontSize="sm" color={descriptionColor}>
                {periodMeta.detail}
              </Text>
            </Box>
          </Flex>

          <Flex
            w="full"
            align={layoutDirection === 'column' ? 'flex-start' : 'center'}
            justify="space-between"
            direction={layoutDirection}
            gap={{ base: 4, sm: 6 }}
          >
            <Box flex="1" minW={0}>
              <Text
                fontSize={{ base: 'xs', sm: 'sm' }}
                fontWeight="700"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="0.08em"
                mb={1}
                noOfLines={1}
              >
                {stat.label}
              </Text>

              <Text
                fontSize={{ base: '2xl', sm: '3xl' }}
                fontWeight="800"
                color={valueColor}
                lineHeight="tight"
                letterSpacing="-0.02em"
                noOfLines={1}
              >
                {stat.displayValue}
              </Text>

              {stat.description && (
                <Text
                  fontSize={{ base: 'sm', sm: 'md' }}
                  color={descriptionColor}
                  noOfLines={2}
                >
                  {stat.description}
                </Text>
              )}
            </Box>

            <Circle
              size={iconSize}
              bg={iconWrapperBg}
              color={stat.color}
              flexShrink={0}
              shadow="md"
            >
              <Icon as={IconComponent} boxSize={{ base: 5, md: 6 }} />
            </Circle>
          </Flex>

          <Flex
            align={{ base: 'flex-start', sm: 'center' }}
            justify="space-between"
            direction={{ base: 'column', sm: 'row' }}
            gap={{ base: 2, sm: 4 }}
          >
            <Box
              px={3}
              py={1}
              bg={helpBadgeBg}
              borderRadius="full"
              fontSize="xs"
              fontWeight="600"
              color={helpBadgeColor}
              textTransform="uppercase"
              letterSpacing="0.08em"
            >
              {stat.helpText}
            </Box>

            <Text
              fontSize="sm"
              fontWeight="600"
              color={stat.color}
              textTransform="uppercase"
              letterSpacing="0.08em"
            >
              Show details
            </Text>
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  )
}
