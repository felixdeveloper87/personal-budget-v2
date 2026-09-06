import type { ReactNode } from 'react'
import {
  Box,
  HStack,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react'
import { editorialPalette, useEd } from '../../editorial'
import AppCloseButton from './AppCloseButton'

export interface ModalHeaderProps {
  /** Lucide icon rendered inside the accent chip on the left. */
  /** Main title (one short line). */
  title: string
  /** Optional caption rendered under the title. */
  caption?: string
  /** Close handler. The X button is placed in the top-right corner. */
  onClose: () => void
  /** Accent palette for the icon chip. Defaults to "blue". */
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
  title,
  caption,
  onClose,
  rightSlot,
  hideClose,
}: ModalHeaderProps) {
  const { colorMode } = useColorMode()
  const ed = useEd() ?? editorialPalette(colorMode)
  return (
    <Box
      w="full"
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
      <HStack justify="space-between" align="center" spacing={3}>
        <HStack spacing={3} minW={0} flex={1}>
          <VStack align="flex-start" spacing={0} minW={0}>
            <Text
              textStyle="display"
              fontWeight={400}
              fontSize={{ base: 'lg', sm: 'xl' }}
              color={ed.headerInk}
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
