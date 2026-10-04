import { Box, Text } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

/** Concrete Nubank-style colours for places where CSS vars can't reach (recharts SVG attributes).
 * Mirrors the .nu-dashboard tokens in theme/pb-tokens.css. */
const NU = {
  brand: '#820ad1',
  ink: '#1f1f24',
  inkFaint: '#8a8a95',
  page: '#ffffff',
  hair: '#ececf1',
  hair2: '#dadae2',
  positive: '#1e8a5a',
  negative: '#c2412d',
} as const

export function useNuPalette() {
  return NU
}

interface NuSectionProps extends Omit<BoxProps, 'title'> {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  children?: ReactNode
}

/** A full-width block on the white sheet, separated from the previous one by a hairline. */
export function NuSection({ title, subtitle, action, children, ...props }: NuSectionProps) {
  return (
    <Box borderTop="1px solid var(--pb-hair)" px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }} {...props}>
      {(title || action) && (
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={3} mb={4}>
          <Box minW={0}>
            {title && <NuTitle>{title}</NuTitle>}
            {subtitle && <Text mt={0.5} fontSize="sm" color="var(--pb-ink-soft)">{subtitle}</Text>}
          </Box>
          {action}
        </Box>
      )}
      {children}
    </Box>
  )
}

export function NuTitle({ children }: { children: ReactNode }) {
  return (
    <Text as="h2" fontSize={{ base: 'lg', md: 'xl' }} fontWeight={600} letterSpacing="-0.01em" color="var(--pb-ink)">
      {children}
    </Text>
  )
}

/**
 * Page-bottom spacing shared by every page, so the gap above the footer is the
 * same everywhere. Nubank pages: the white sheet keeps `NU_SHEET_PB` inside and
 * the wrapper adds `NU_PAGE_BOTTOM` on desktop (on phones the sheet meets the footer).
 */
export const NU_PAGE_BOTTOM = { base: 0, md: 8 }
export const NU_SHEET_PB = { base: 6, md: 4 }
/** Bottom padding for non-sheet pages (cards on the page background). */
export const PAGE_BOTTOM_PADDING = { base: 6, md: 8 }

/** Wrapper that pulls the white sheet up over the purple hero. */
export const NU_SHEET_WRAP = {
  maxW: 'appContent',
  mx: 'auto',
  px: { base: 0, md: 4, lg: 6 },
  mt: '-24px',
  pb: NU_PAGE_BOTTOM,
  position: 'relative',
} as const satisfies BoxProps
