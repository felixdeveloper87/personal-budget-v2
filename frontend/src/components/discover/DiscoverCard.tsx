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
  surfaceLight: string
  surfaceDark: string
  hoverSurfaceLight: string
  hoverSurfaceDark: string
  hoverBorderLight: string
  hoverBorderDark: string
  focusRingLight: string
  focusRingDark: string
  accentLine: string
}

const ACCENTS: Record<DiscoverAccent, AccentTokens> = {
  violet: {
    chipBgLight: 'purple.50',
    chipBgDark: 'rgba(139,92,246,0.16)',
    chipFgLight: 'purple.600',
    chipFgDark: 'purple.300',
    surfaceLight: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
    surfaceDark: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(15,15,15,0.96) 58%)',
    hoverSurfaceLight: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)',
    hoverSurfaceDark: 'linear-gradient(135deg, rgba(139,92,246,0.16) 0%, rgba(18,18,18,0.98) 58%)',
    hoverBorderLight: 'purple.200',
    hoverBorderDark: 'rgba(139,92,246,0.45)',
    focusRingLight: 'rgba(139,92,246,0.18)',
    focusRingDark: 'rgba(139,92,246,0.28)',
    accentLine: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
  },
  blue: {
    chipBgLight: 'blue.50',
    chipBgDark: 'rgba(59,130,246,0.16)',
    chipFgLight: 'blue.600',
    chipFgDark: 'blue.300',
    surfaceLight: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
    surfaceDark: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(15,15,15,0.96) 58%)',
    hoverSurfaceLight: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
    hoverSurfaceDark: 'linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(18,18,18,0.98) 58%)',
    hoverBorderLight: 'blue.200',
    hoverBorderDark: 'rgba(59,130,246,0.45)',
    focusRingLight: 'rgba(59,130,246,0.18)',
    focusRingDark: 'rgba(59,130,246,0.28)',
    accentLine: 'linear-gradient(90deg, #06b6d4, #2563eb)',
  },
  amber: {
    chipBgLight: 'orange.50',
    chipBgDark: 'rgba(249,115,22,0.16)',
    chipFgLight: 'orange.600',
    chipFgDark: 'orange.300',
    surfaceLight: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
    surfaceDark: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(15,15,15,0.96) 58%)',
    hoverSurfaceLight: 'linear-gradient(135deg, #ffffff 0%, #ffedd5 100%)',
    hoverSurfaceDark: 'linear-gradient(135deg, rgba(249,115,22,0.16) 0%, rgba(18,18,18,0.98) 58%)',
    hoverBorderLight: 'orange.200',
    hoverBorderDark: 'rgba(249,115,22,0.45)',
    focusRingLight: 'rgba(249,115,22,0.18)',
    focusRingDark: 'rgba(249,115,22,0.28)',
    accentLine: 'linear-gradient(90deg, #f97316, #f59e0b)',
  },
  green: {
    chipBgLight: 'green.50',
    chipBgDark: 'rgba(34,197,94,0.16)',
    chipFgLight: 'green.600',
    chipFgDark: 'green.300',
    surfaceLight: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
    surfaceDark: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(15,15,15,0.96) 58%)',
    hoverSurfaceLight: 'linear-gradient(135deg, #ffffff 0%, #dcfce7 100%)',
    hoverSurfaceDark: 'linear-gradient(135deg, rgba(34,197,94,0.16) 0%, rgba(18,18,18,0.98) 58%)',
    hoverBorderLight: 'green.200',
    hoverBorderDark: 'rgba(34,197,94,0.45)',
    focusRingLight: 'rgba(34,197,94,0.18)',
    focusRingDark: 'rgba(34,197,94,0.28)',
    accentLine: 'linear-gradient(90deg, #22c55e, #10b981)',
  },
  red: {
    chipBgLight: 'red.50',
    chipBgDark: 'rgba(239,68,68,0.16)',
    chipFgLight: 'red.600',
    chipFgDark: 'red.300',
    surfaceLight: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
    surfaceDark: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(15,15,15,0.96) 58%)',
    hoverSurfaceLight: 'linear-gradient(135deg, #ffffff 0%, #ffe4e6 100%)',
    hoverSurfaceDark: 'linear-gradient(135deg, rgba(239,68,68,0.16) 0%, rgba(18,18,18,0.98) 58%)',
    hoverBorderLight: 'red.200',
    hoverBorderDark: 'rgba(239,68,68,0.45)',
    focusRingLight: 'rgba(239,68,68,0.18)',
    focusRingDark: 'rgba(239,68,68,0.28)',
    accentLine: 'linear-gradient(90deg, #fb7185, #ef4444)',
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
  const cardBg = useColorModeValue(tokens.surfaceLight, tokens.surfaceDark)
  const hoverBg = useColorModeValue(tokens.hoverSurfaceLight, tokens.hoverSurfaceDark)
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
  const focusRing = useColorModeValue(tokens.focusRingLight, tokens.focusRingDark)
  const badgeBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const badgeColor = useColorModeValue('gray.600', 'gray.300')
  const shadow = useColorModeValue(
    '0 1px 2px rgba(15,23,42,0.05)',
    '0 1px 0 rgba(255,255,255,0.04)',
  )
  const hoverShadow = useColorModeValue(
    '0 14px 34px -24px rgba(15,23,42,0.45)',
    '0 16px 36px -24px rgba(0,0,0,0.85)',
  )

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
        boxShadow: `0 0 0 3px ${focusRing}`,
        borderRadius: 'lg',
      }}
    >
      <Box
        position="relative"
        h="full"
        minH={compact ? '148px' : featured ? { md: '180px' } : undefined}
        p={{ base: 4, md: featured ? 6 : 5 }}
        borderRadius="lg"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        boxShadow={shadow}
        overflow="hidden"
        transition="background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease"
        _groupHover={{
          bg: hoverBg,
          borderColor: hoverBorderColor,
          transform: 'translateY(-2px)',
          boxShadow: hoverShadow,
        }}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="3px"
          bg={tokens.accentLine}
          pointerEvents="none"
          aria-hidden
        />

        <VStack align="flex-start" spacing={3} position="relative" h="full" pt={1}>
          <HStack w="full" justify="space-between" align="flex-start">
            <Box
              w={featured ? 10 : 9}
              h={featured ? 10 : 9}
              borderRadius="md"
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
                letterSpacing="0"
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
            letterSpacing="0"
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
