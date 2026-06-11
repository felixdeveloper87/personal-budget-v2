import { Box, HStack, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { ChevronRight } from '../ui/icons'
import type { DiscoverAccent, DiscoverCardItem } from './types'

interface AccentTokens {
  borderColor: string
  bgLight: string
  bgDark: string
  chipBgLight: string
  chipBgDark: string
  fgLight: string
  fgDark: string
}

const ACCENTS: Record<DiscoverAccent, AccentTokens> = {
  neutral: {
    borderColor: 'gray.400',
    bgLight: 'transparent',
    bgDark: 'whiteAlpha.50',
    chipBgLight: 'gray.100',
    chipBgDark: 'whiteAlpha.100',
    fgLight: 'gray.600',
    fgDark: 'gray.300',
  },
  blue: {
    borderColor: 'blue.400',
    bgLight: 'transparent',
    bgDark: 'rgba(59,130,246,0.07)',
    chipBgLight: 'blue.100',
    chipBgDark: 'rgba(59,130,246,0.22)',
    fgLight: 'blue.600',
    fgDark: 'blue.300',
  },
  amber: {
    borderColor: 'orange.400',
    bgLight: 'transparent',
    bgDark: 'rgba(249,115,22,0.07)',
    chipBgLight: 'orange.100',
    chipBgDark: 'rgba(249,115,22,0.22)',
    fgLight: 'orange.600',
    fgDark: 'orange.300',
  },
  green: {
    borderColor: 'green.400',
    bgLight: 'transparent',
    bgDark: 'rgba(34,197,94,0.07)',
    chipBgLight: 'green.100',
    chipBgDark: 'rgba(34,197,94,0.22)',
    fgLight: 'green.600',
    fgDark: 'green.300',
  },
  red: {
    borderColor: 'red.400',
    bgLight: 'transparent',
    bgDark: 'rgba(239,68,68,0.09)',
    chipBgLight: 'red.100',
    chipBgDark: 'rgba(239,68,68,0.22)',
    fgLight: 'red.600',
    fgDark: 'red.400',
  },
}

export interface AlertRowProps {
  item: DiscoverCardItem
  onClick: () => void
}

export default function AlertRow({ item, onClick }: AlertRowProps) {
  const a = ACCENTS[item.accent]
  const bg         = useColorModeValue(a.bgLight, a.bgDark)
  const chipBg     = useColorModeValue(a.chipBgLight, a.chipBgDark)
  const chipFg     = useColorModeValue(a.fgLight, a.fgDark)
  const titleColor = useColorModeValue('gray.800', 'gray.100')
  const descColor  = useColorModeValue('gray.500', 'gray.400')
  const hoverBg    = useColorModeValue('blackAlpha.50', 'whiteAlpha.50')

  return (
    <HStack
      as="button"
      type="button"
      onClick={onClick}
      w="full"
      spacing={3}
      pl={4}
      pr={3}
      py={3.5}
      borderRadius="lg"
      borderLeft="3px solid"
      borderLeftColor={a.borderColor}
      bg={bg}
      textAlign="left"
      cursor="pointer"
      align="flex-start"
      transition="background 0.15s ease"
      _hover={{ bg: hoverBg }}
      _focusVisible={{ outline: 'none', bg: hoverBg }}
    >
      <Box
        w={9}
        h={9}
        borderRadius="md"
        bg={chipBg}
        color={chipFg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <Icon as={item.icon} boxSize={4} />
      </Box>

      <VStack align="flex-start" spacing={0.5} flex={1} minW={0} py="1px">
        <Text fontSize="sm" fontWeight={700} color={titleColor} lineHeight="1.3">
          {item.title}
        </Text>
        <Text fontSize="sm" color={descColor} lineHeight="1.45">
          {item.description}
        </Text>
      </VStack>

      <Icon as={ChevronRight} boxSize={4} color={chipFg} flexShrink={0} mt="10px" opacity={0.7} />
    </HStack>
  )
}
