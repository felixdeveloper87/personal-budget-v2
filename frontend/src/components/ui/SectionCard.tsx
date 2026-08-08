import type { ReactNode } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'
import { useEd } from '../../editorial'

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
  const ed = useEd()
  const surfaceBgBase = useColorModeValue('#ffffff', '#0a0a0a')
  const surfaceBg = ed ? ed.panel : surfaceBgBase
  const borderColorBase = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const borderColor = ed ? ed.line : borderColorBase
  const hoverBorderBase = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const hoverBorder = ed ? ed.lineStrong : hoverBorderBase
  const shadowBase = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.82), 0 12px 34px -22px rgba(19,56,37,0.32), 0 3px 10px rgba(87,65,28,0.06)',
    '0 1px 0 rgba(255,255,255,0.04)',
  )
  const shadow = ed ? 'var(--pb-shadow)' : shadowBase
  const hoverShadowBase = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.92), 0 20px 46px -24px rgba(8,122,80,0.38), 0 8px 22px -16px rgba(165,111,22,0.24)',
    '0 6px 24px -8px rgba(0,0,0,0.6)',
  )
  const hoverShadow = ed ? 'var(--pb-shadow-lift)' : hoverShadowBase
  const editorialFilter = useColorModeValue(
    'blur(18px) saturate(112%)',
    'blur(14px) saturate(112%)',
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
      backdropFilter={ed ? editorialFilter : undefined}
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
