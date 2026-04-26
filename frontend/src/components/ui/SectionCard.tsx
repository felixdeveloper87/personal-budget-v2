import type { ReactNode } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'

export interface SectionCardProps extends Omit<BoxProps, 'children'> {
  /** Section content. */
  children: ReactNode
  /**
   * When true the card has no border / no background — used for sections
   * that already render their own visual frame (e.g. SummaryHeader).
   */
  bare?: boolean
  /** Disable the lift on hover. Defaults to false. */
  staticOnHover?: boolean
}

/**
 * Shared shell used by every dashboard section.
 *
 * Goals:
 *  - One single look across the whole dashboard (no per-section glass /
 *    backdrop-blur / decorative blob duplicated five times over).
 *  - All color tokens resolved at the top via `useColorModeValue` so we
 *    never break the Rules of Hooks.
 *  - Cheap to render: no infinite animations, no heavy filters.
 */
export default function SectionCard({
  children,
  bare,
  staticOnHover,
  ...rest
}: SectionCardProps) {
  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const hoverBorder = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const shadow = useColorModeValue(
    '0 1px 2px rgba(15,23,42,0.04), 0 1px 0 rgba(15,23,42,0.02)',
    '0 1px 0 rgba(255,255,255,0.04)',
  )
  const hoverShadow = useColorModeValue(
    '0 6px 24px -8px rgba(15,23,42,0.10), 0 2px 4px rgba(15,23,42,0.04)',
    '0 6px 24px -8px rgba(0,0,0,0.6)',
  )

  if (bare) {
    return (
      <Box w="full" {...rest}>
        {children}
      </Box>
    )
  }

  return (
    <Box
      w="full"
      bg={surfaceBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      boxShadow={shadow}
      overflow="hidden"
      transition="border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease"
      _hover={
        staticOnHover
          ? undefined
          : {
              borderColor: hoverBorder,
              boxShadow: hoverShadow,
              transform: 'translateY(-1px)',
            }
      }
      {...rest}
    >
      {children}
    </Box>
  )
}
