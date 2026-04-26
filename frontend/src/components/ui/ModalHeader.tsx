import type { ReactNode } from 'react'
import {
  Box,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ModalHeaderAccent = 'blue' | 'green' | 'red' | 'violet' | 'neutral'

export interface ModalHeaderProps {
  /** Lucide icon rendered inside the accent chip on the left. */
  icon: LucideIcon
  /** Main title (one short line). */
  title: string
  /** Optional caption rendered under the title. */
  caption?: string
  /** Close handler. The X button is placed in the top-right corner. */
  onClose: () => void
  /** Accent palette for the icon chip. Defaults to "blue". */
  accent?: ModalHeaderAccent
  /**
   * Optional slot rendered between the brand block and the close button —
   * used for badges (e.g. selected period) or extra controls.
   */
  rightSlot?: ReactNode
  /** Hide the close button (rare — useful for embedded summary headers). */
  hideClose?: boolean
}

interface AccentTokens {
  bgLight: string
  bgDark: string
  fgLight: string
  fgDark: string
}

const ACCENT_TOKENS: Record<ModalHeaderAccent, AccentTokens> = {
  blue: {
    bgLight: 'blue.50',
    bgDark: 'whiteAlpha.100',
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
  neutral: {
    bgLight: 'gray.100',
    bgDark: 'whiteAlpha.100',
    fgLight: 'gray.700',
    fgDark: 'gray.200',
  },
}

/**
 * Standard modal header used across the app.
 *
 * Goals:
 *  - One single look & feel (alignment, sizing, safe-area padding) for every modal.
 *  - Zero looping animations — modals must stay cheap to keep open.
 *  - Tokens resolved at the top with `useColorModeValue`, never inside JSX trees
 *    or `.map()` callbacks.
 *
 * Pair with `<PremiumModal header={<ModalHeader …/>}>`.
 */
export default function ModalHeader({
  icon,
  title,
  caption,
  onClose,
  accent = 'blue',
  rightSlot,
  hideClose,
}: ModalHeaderProps) {
  const tokens = ACCENT_TOKENS[accent]

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const closeIdleColor = useColorModeValue('gray.500', 'gray.400')
  const closeHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  const chipBg = useColorModeValue(tokens.bgLight, tokens.bgDark)
  const chipFg = useColorModeValue(tokens.fgLight, tokens.fgDark)

  return (
    <Box
      bg={surfaceBg}
      borderBottom="1px solid"
      borderColor={borderColor}
      px={{ base: 4, sm: 6 }}
      pt={{ base: 'max(1rem, env(safe-area-inset-top, 0px))', sm: 5 }}
      pb={4}
    >
      <HStack justify="space-between" align="center" spacing={3}>
        <HStack spacing={3} minW={0} flex={1}>
          <Box
            w={9}
            h={9}
            borderRadius="lg"
            bg={chipBg}
            color={chipFg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Icon as={icon} boxSize={4} strokeWidth={2.25} />
          </Box>
          <VStack align="flex-start" spacing={0} minW={0}>
            <Text
              fontWeight={700}
              fontSize="md"
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
          <Box flexShrink={0} display={{ base: 'none', sm: 'block' }}>
            {rightSlot}
          </Box>
        )}

        {!hideClose && (
          <IconButton
            aria-label="Close"
            icon={<Icon as={X} boxSize={4} />}
            onClick={onClose}
            size="sm"
            variant="ghost"
            color={closeIdleColor}
            _hover={{ bg: closeHoverBg, color: titleColor }}
            transition="background-color 0.15s ease, color 0.15s ease"
            flexShrink={0}
          />
        )}
      </HStack>
    </Box>
  )
}
