import type { ReactNode } from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useEd } from '../../editorial'
import type { LucideIcon } from './icons'

export type SectionHeaderAccent =
  | 'blue'
  | 'green'
  | 'teal'
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
    bgDark: 'rgba(59,130,246,0.12)',
    fgLight: 'blue.600',
    fgDark: 'blue.300',
  },
  green: {
    bgLight: 'green.50',
    bgDark: 'rgba(34,197,94,0.12)',
    fgLight: 'green.600',
    fgDark: 'green.300',
  },
  teal: {
    bgLight: 'teal.50',
    bgDark: 'rgba(20,184,166,0.12)',
    fgLight: 'teal.600',
    fgDark: 'teal.300',
  },
  red: {
    bgLight: 'red.50',
    bgDark: 'rgba(239,68,68,0.12)',
    fgLight: 'red.600',
    fgDark: 'red.300',
  },
  violet: {
    bgLight: 'purple.50',
    bgDark: 'rgba(139,92,246,0.12)',
    fgLight: 'purple.600',
    fgDark: 'purple.300',
  },
  pink: {
    bgLight: 'pink.50',
    bgDark: 'rgba(236,72,153,0.12)',
    fgLight: 'pink.600',
    fgDark: 'pink.300',
  },
  amber: {
    bgLight: 'orange.50',
    bgDark: 'rgba(249,115,22,0.12)',
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
  icon: LucideIcon
  title: string
  caption?: string
  accent?: SectionHeaderAccent
  rightSlot?: ReactNode
  dense?: boolean
}

export default function SectionHeader({
  icon,
  title,
  caption,
  accent = 'neutral',
  rightSlot,
  dense,
}: SectionHeaderProps) {
  const tokens = ACCENT_TOKENS[accent]
  const ed = useEd()

  const titleColorBase = useColorModeValue('gray.900', 'gray.50')
  const titleColor = ed ? ed.cream : titleColorBase
  const captionColorBase = useColorModeValue('gray.500', 'gray.400')
  const captionColor = ed ? ed.muted : captionColorBase
  const accentColorBase = useColorModeValue(tokens.fgLight, tokens.fgDark)
  const accentColor = ed ? ed.jade : accentColorBase
  const iconBgBase = useColorModeValue(tokens.bgLight, tokens.bgDark)
  const iconBg = ed ? ed.jadeSoft : iconBgBase
  const iconFgBase = useColorModeValue(tokens.fgLight, tokens.fgDark)
  const iconFg = ed ? ed.jade : iconFgBase
  const rightIconOpacity = useColorModeValue(0.9, 0.82)

  return (
    <HStack justify="space-between" align="flex-start" spacing={3} w="full">
      <HStack spacing={3} minW={0} flex={1} align="stretch">
        <Box
          w="3px"
          minH={dense ? 7 : 9}
          my="2px"
          borderRadius="full"
          bg={accentColor}
          flexShrink={0}
        />

        <VStack align="flex-start" spacing={0.5} minW={0} justify="center">
          <Text
            textStyle={ed ? 'display' : undefined}
            fontWeight={ed ? 400 : 800}
            fontSize={ed ? (dense ? 'lg' : { base: 'lg', sm: 'xl' }) : (dense ? 'sm' : { base: 'md', sm: 'lg' })}
            color={titleColor}
            lineHeight="1.05"
            noOfLines={1}
            letterSpacing={ed ? '-0.01em' : '0'}
          >
            {title}
          </Text>
          {caption && (
            <Text fontSize="xs" color={captionColor} lineHeight="1.25" noOfLines={1}>
              {caption}
            </Text>
          )}
        </VStack>
      </HStack>

      <HStack spacing={2} flexShrink={0} pt="1px">
        {rightSlot ? (
          <Box flexShrink={0} maxW="60%">
            {rightSlot}
          </Box>
        ) : (
          <Box
            w={dense ? 7 : 8}
            h={dense ? 7 : 8}
            borderRadius="full"
            bg={iconBg}
            color={iconFg}
            display={{ base: 'none', sm: 'flex' }}
            alignItems="center"
            justifyContent="center"
            opacity={rightIconOpacity}
          >
            <Icon as={icon} boxSize={dense ? 3.5 : 4} weight="duotone" />
          </Box>
        )}
      </HStack>
    </HStack>
  )
}
