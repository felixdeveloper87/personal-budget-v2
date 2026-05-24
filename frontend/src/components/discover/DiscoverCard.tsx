import {
  Badge,
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronRight } from '../ui/icons'
import type { DiscoverAccent, DiscoverCardItem } from './types'

interface AccentTokens {
  chipBgLight: string
  chipBgDark: string
  chipFgLight: string
  chipFgDark: string
  hoverBorderLight: string
  hoverBorderDark: string
  glowLight: string
  glowDark: string
}

const ACCENTS: Record<DiscoverAccent, AccentTokens> = {
  violet: {
    chipBgLight: 'purple.50',
    chipBgDark: 'rgba(139,92,246,0.16)',
    chipFgLight: 'purple.600',
    chipFgDark: 'purple.300',
    hoverBorderLight: 'purple.200',
    hoverBorderDark: 'rgba(139,92,246,0.45)',
    glowLight: 'rgba(139,92,246,0.10)',
    glowDark: 'rgba(139,92,246,0.18)',
  },
  blue: {
    chipBgLight: 'blue.50',
    chipBgDark: 'rgba(59,130,246,0.16)',
    chipFgLight: 'blue.600',
    chipFgDark: 'blue.300',
    hoverBorderLight: 'blue.200',
    hoverBorderDark: 'rgba(59,130,246,0.45)',
    glowLight: 'rgba(59,130,246,0.10)',
    glowDark: 'rgba(59,130,246,0.18)',
  },
  amber: {
    chipBgLight: 'orange.50',
    chipBgDark: 'rgba(249,115,22,0.16)',
    chipFgLight: 'orange.600',
    chipFgDark: 'orange.300',
    hoverBorderLight: 'orange.200',
    hoverBorderDark: 'rgba(249,115,22,0.45)',
    glowLight: 'rgba(249,115,22,0.10)',
    glowDark: 'rgba(249,115,22,0.18)',
  },
  green: {
    chipBgLight: 'green.50',
    chipBgDark: 'rgba(34,197,94,0.16)',
    chipFgLight: 'green.600',
    chipFgDark: 'green.300',
    hoverBorderLight: 'green.200',
    hoverBorderDark: 'rgba(34,197,94,0.45)',
    glowLight: 'rgba(34,197,94,0.10)',
    glowDark: 'rgba(34,197,94,0.18)',
  },
  red: {
    chipBgLight: 'red.50',
    chipBgDark: 'rgba(239,68,68,0.16)',
    chipFgLight: 'red.600',
    chipFgDark: 'red.300',
    hoverBorderLight: 'red.200',
    hoverBorderDark: 'rgba(239,68,68,0.45)',
    glowLight: 'rgba(239,68,68,0.10)',
    glowDark: 'rgba(239,68,68,0.18)',
  },
}

export interface DiscoverCardProps {
  item: DiscoverCardItem
  onClick: () => void
  featured?: boolean
  compact?: boolean
}

export default function DiscoverCard({
  item,
  onClick,
  featured,
  compact,
}: DiscoverCardProps) {
  const tokens = ACCENTS[item.accent]
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const hoverBorderColor = useColorModeValue(
    tokens.hoverBorderLight,
    tokens.hoverBorderDark,
  )
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const descriptionColor = useColorModeValue('gray.500', 'gray.400')
  const ctaColor = useColorModeValue('gray.600', 'gray.300')
  const chipBg = useColorModeValue(tokens.chipBgLight, tokens.chipBgDark)
  const chipFg = useColorModeValue(tokens.chipFgLight, tokens.chipFgDark)
  const glowColor = useColorModeValue(tokens.glowLight, tokens.glowDark)
  const badgeBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const badgeColor = useColorModeValue('gray.600', 'gray.300')

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
      _focusVisible={{
        outline: 'none',
      }}
    >
      <Box
        position="relative"
        h="full"
        minH={compact ? '148px' : featured ? { md: '180px' } : undefined}
        p={{ base: 4, md: featured ? 6 : 5 }}
        borderRadius="xl"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        transition="border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease"
        _groupHover={{
          borderColor: hoverBorderColor,
          transform: 'translateY(-2px)',
          boxShadow: `0 12px 32px -16px ${glowColor}`,
        }}
        _focusWithin={{
          borderColor: hoverBorderColor,
          boxShadow: `0 0 0 3px ${glowColor}`,
        }}
      >
        <Box
          position="absolute"
          top="-30%"
          right="-20%"
          w={featured ? '200px' : '160px'}
          h={featured ? '200px' : '160px'}
          borderRadius="full"
          bg={glowColor}
          filter="blur(40px)"
          opacity={featured ? 0.35 : 0}
          transition="opacity 0.25s ease"
          _groupHover={{ opacity: 1 }}
          pointerEvents="none"
          aria-hidden
        />

        <VStack align="flex-start" spacing={3} position="relative" h="full">
          <HStack w="full" justify="space-between" align="flex-start">
            <Box
              w={featured ? 10 : 9}
              h={featured ? 10 : 9}
              borderRadius="lg"
              bg={chipBg}
              color={chipFg}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Icon as={item.icon} boxSize={featured ? 5 : 4} weight="duotone" />
            </Box>

            {item.badge && (
              <Badge
                px={2}
                py={0.5}
                borderRadius="full"
                bg={badgeBg}
                color={badgeColor}
                fontSize="2xs"
                fontWeight={600}
                textTransform="none"
                letterSpacing="0.01em"
                maxW="55%"
                noOfLines={1}
              >
                {item.badge}
              </Badge>
            )}
          </HStack>

          <VStack align="flex-start" spacing={1} flex={1}>
            <Text
              fontWeight={700}
              fontSize={featured ? { base: 'md', md: 'lg' } : 'md'}
              color={titleColor}
              lineHeight="1.25"
            >
              {item.title}
            </Text>
            <Text
              fontSize="sm"
              color={descriptionColor}
              lineHeight="1.45"
              noOfLines={featured ? 3 : 2}
            >
              {item.description}
            </Text>
          </VStack>

          <HStack
            spacing={1}
            color={ctaColor}
            fontSize="xs"
            fontWeight={600}
            letterSpacing="0.02em"
            transition="color 0.2s ease, transform 0.2s ease"
            _groupHover={{
              color: chipFg,
              transform: 'translateX(2px)',
            }}
          >
            <Text>{item.cta}</Text>
            <Icon as={ChevronRight} boxSize={3.5} weight="bold" />
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}
