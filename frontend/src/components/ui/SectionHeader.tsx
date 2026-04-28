import type { ReactNode } from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import type { LucideIcon } from './icons'

export type SectionHeaderAccent =
  | 'blue'
  | 'green'
  | 'red'
  | 'violet'
  | 'pink'
  | 'amber'
  | 'neutral'

interface AccentTokens {
  bgLight: string
  bgDark: string
  fgLight: string
  fgDark: string
}

const ACCENT_TOKENS: Record<SectionHeaderAccent, AccentTokens> = {
  blue: {
    bgLight: 'blue.50',
    bgDark: 'rgba(59,130,246,0.14)',
    fgLight: 'blue.600',
    fgDark: 'blue.300',
  },
  green: {
    bgLight: 'green.50',
    bgDark: 'rgba(34,197,94,0.14)',
    fgLight: 'green.600',
    fgDark: 'green.300',
  },
  red: {
    bgLight: 'red.50',
    bgDark: 'rgba(239,68,68,0.14)',
    fgLight: 'red.600',
    fgDark: 'red.300',
  },
  violet: {
    bgLight: 'purple.50',
    bgDark: 'rgba(139,92,246,0.14)',
    fgLight: 'purple.600',
    fgDark: 'purple.300',
  },
  pink: {
    bgLight: 'pink.50',
    bgDark: 'rgba(236,72,153,0.14)',
    fgLight: 'pink.600',
    fgDark: 'pink.300',
  },
  amber: {
    bgLight: 'orange.50',
    bgDark: 'rgba(249,115,22,0.14)',
    fgLight: 'orange.600',
    fgDark: 'orange.300',
  },
  neutral: {
    bgLight: 'gray.100',
    bgDark: 'whiteAlpha.100',
    fgLight: 'gray.700',
    fgDark: 'gray.200',
  },
}

export interface SectionHeaderProps {
  /** Lucide icon rendered inside the accent chip. */
  icon: LucideIcon
  /** Section title. */
  title: string
  /** Optional secondary line. */
  caption?: string
  /** Accent palette for the icon chip. Defaults to "neutral". */
  accent?: SectionHeaderAccent
  /** Optional content rendered on the right (CTA, badge, controls…). */
  rightSlot?: ReactNode
  /** Optional dense mode — slightly smaller chip & spacing. */
  dense?: boolean
}

/**
 * Shared header used at the top of every dashboard section.
 * Mirrors the visual contract of `<ModalHeader>` so the app feels coherent.
 */
export default function SectionHeader({
  icon,
  title,
  caption,
  accent = 'neutral',
  rightSlot,
  dense,
}: SectionHeaderProps) {
  const tokens = ACCENT_TOKENS[accent]

  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const chipBg = useColorModeValue(tokens.bgLight, tokens.bgDark)
  const chipFg = useColorModeValue(tokens.fgLight, tokens.fgDark)

  const chipSize = dense ? 8 : 9

  return (
    <HStack justify="space-between" align="center" spacing={3} w="full">
      <HStack spacing={3} minW={0} flex={1}>
        <Box
          w={chipSize}
          h={chipSize}
          borderRadius="lg"
          bg={chipBg}
          color={chipFg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={dense ? 3.5 : 4} weight="duotone" />
        </Box>
        <VStack align="flex-start" spacing={0} minW={0}>
          <Text
            fontWeight={700}
            fontSize={dense ? 'sm' : 'md'}
            color={titleColor}
            lineHeight="1.2"
            noOfLines={1}
          >
            {title}
          </Text>
          {caption && (
            <Text fontSize="xs" color={captionColor} noOfLines={1}>
              {caption}
            </Text>
          )}
        </VStack>
      </HStack>

      {rightSlot && (
        <Box flexShrink={0} maxW="60%">
          {rightSlot}
        </Box>
      )}
    </HStack>
  )
}
