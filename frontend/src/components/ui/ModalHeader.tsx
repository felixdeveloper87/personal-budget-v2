import type { ReactNode } from 'react'
import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react'
import { editorialPalette, useEd } from '../../editorial'
import AppCloseButton from './AppCloseButton'
import type { LucideIcon } from './icons'

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
  const { colorMode } = useColorMode()
  const ed = useEd() ?? editorialPalette(colorMode)
  const semanticColor =
    accent === 'red' ? ed.red :
    accent === 'violet' ? ed.gold :
    ed.jade
  const accentLine = accent === 'red'
    ? `linear-gradient(90deg, ${ed.red}, ${ed.gold})`
    : `linear-gradient(90deg, ${ed.jade}, ${ed.gold})`

  return (
    <Box
      bg={ed.bg2}
      borderBottom="1px solid"
      borderColor={ed.line}
      px={{ base: 3.5, sm: 6 }}
      pt={{
        // Always leave breathing room above the close button:
        //  - On Android / desktop / iOS Chrome (env() = 0) → 1.25rem
        //  - On iOS Safari with bottom URL bar (env() ≈ 50px) → 50px + 0.75rem
        // This keeps the X clear of the Dynamic Island / status bar.
        base: 'max(0.85rem, calc(env(safe-area-inset-top, 0px) + 0.55rem))',
        sm: 5,
      }}
      pb={{ base: 3, sm: 4 }}
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" top={0} left={0} right={0} h="2px" bg={accentLine} />
      <HStack justify="space-between" align="center" spacing={3}>
        <HStack spacing={3} minW={0} flex={1}>
          <Box
            w={{ base: 8, sm: 9 }}
            h={{ base: 8, sm: 9 }}
            borderRadius="full"
            bg={ed.panelRaised}
            color={semanticColor}
            border="1px solid"
            borderColor={ed.lineStrong}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Icon as={icon} boxSize={{ base: 3.5, sm: 4 }} weight="duotone" />
          </Box>
          <VStack align="flex-start" spacing={0} minW={0}>
            <Text
              textStyle="display"
              fontWeight={400}
              fontSize={{ base: 'lg', sm: 'xl' }}
              color={ed.cream}
              lineHeight="1.05"
              noOfLines={1}
            >
              {title}
            </Text>
            {caption && (
              <Text
                textStyle="mono"
                fontSize={{ base: '2xs', sm: 'xs' }}
                color={ed.muted}
                letterSpacing="0.025em"
                noOfLines={1}
              >
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
          <AppCloseButton onClick={onClose} />
        )}
      </HStack>
    </Box>
  )
}
