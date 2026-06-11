import {
  Badge,
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronRight, TrendingDown, TrendingUp } from '../ui/icons'
import type { DiscoverAccent, DiscoverCardItem } from './types'

interface AccentTokens {
  chipBgLight: string
  chipBgDark: string
  chipFgLight: string
  chipFgDark: string
}

const ACCENTS: Record<DiscoverAccent, AccentTokens> = {
  neutral: {
    chipBgLight: 'gray.100',
    chipBgDark: 'whiteAlpha.100',
    chipFgLight: 'gray.700',
    chipFgDark: 'gray.200',
  },
  blue: {
    chipBgLight: 'blue.50',
    chipBgDark: 'rgba(59,130,246,0.16)',
    chipFgLight: 'blue.600',
    chipFgDark: 'blue.300',
  },
  amber: {
    chipBgLight: 'orange.50',
    chipBgDark: 'rgba(249,115,22,0.16)',
    chipFgLight: 'orange.600',
    chipFgDark: 'orange.300',
  },
  green: {
    chipBgLight: 'green.50',
    chipBgDark: 'rgba(34,197,94,0.16)',
    chipFgLight: 'green.600',
    chipFgDark: 'green.300',
  },
  red: {
    chipBgLight: 'red.50',
    chipBgDark: 'rgba(239,68,68,0.16)',
    chipFgLight: 'red.600',
    chipFgDark: 'red.300',
  },
}

export interface DiscoverCardProps {
  item: DiscoverCardItem
  onClick: () => void
  featured?: boolean
  compact?: boolean
}

export default function DiscoverCard({ item, onClick }: DiscoverCardProps) {
  const tokens = ACCENTS[item.accent]
  const cardBg = useColorModeValue('white', 'whiteAlpha.50')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const hoverBorderColor = useColorModeValue('gray.300', 'whiteAlpha.300')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const descriptionColor = useColorModeValue('gray.500', 'gray.400')
  const ctaColor = useColorModeValue('gray.600', 'gray.300')
  const chipBg = useColorModeValue(tokens.chipBgLight, tokens.chipBgDark)
  const chipFg = useColorModeValue(tokens.chipFgLight, tokens.chipFgDark)
  const badgeBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const badgeColor = useColorModeValue('gray.600', 'gray.300')
  const positive = useColorModeValue('green.600', 'green.300')
  const negative = useColorModeValue('red.600', 'red.300')
  const neutral = useColorModeValue('gray.500', 'gray.400')
  const deltaColor =
    item.delta?.tone === 'positive'
      ? positive
      : item.delta?.tone === 'negative'
        ? negative
        : neutral
  const DeltaIcon = item.delta?.direction === 'down' ? TrendingDown : TrendingUp

  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      role="group"
      display="block"
      h="full"
      w="full"
      textAlign="left"
      cursor="pointer"
      p={5}
      borderRadius="lg"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      transition="border-color 0.18s ease, transform 0.18s ease"
      _hover={{ borderColor: hoverBorderColor, transform: 'translateY(-2px)' }}
      _focusVisible={{ outline: '2px solid', outlineColor: 'blue.400', outlineOffset: '2px' }}
    >
      <VStack align="stretch" spacing={3} h="full">
        <HStack justify="space-between" align="flex-start">
          <Box
            w={9}
            h={9}
            borderRadius="md"
            bg={chipBg}
            color={chipFg}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={item.icon} boxSize={4} weight="duotone" />
          </Box>
          {item.badge && (
            <Badge
              px={2}
              py={0.5}
              borderRadius="full"
              bg={badgeBg}
              color={badgeColor}
              fontSize="2xs"
              textTransform="none"
            >
              {item.badge}
            </Badge>
          )}
        </HStack>

        <VStack align="flex-start" spacing={1} flex={1}>
          <Text fontSize="sm" fontWeight={700} color={titleColor}>
            {item.title}
          </Text>
          {item.value && (
            <Text fontSize="xl" fontWeight={800} color={chipFg} lineHeight="1.2">
              {item.value}
            </Text>
          )}
          {item.delta && (
            <HStack spacing={1} color={deltaColor}>
              <Icon as={DeltaIcon} boxSize={3.5} weight="bold" />
              <Text fontSize="xs" fontWeight={700}>
                {item.delta.label}
              </Text>
            </HStack>
          )}
          <Text fontSize="sm" color={descriptionColor} lineHeight="1.45" noOfLines={2}>
            {item.description}
          </Text>
        </VStack>

        <HStack spacing={1} color={ctaColor} fontSize="xs" fontWeight={600}>
          <Text>{item.cta}</Text>
          <Icon as={ChevronRight} boxSize={3.5} weight="bold" />
        </HStack>
      </VStack>
    </Box>
  )
}
