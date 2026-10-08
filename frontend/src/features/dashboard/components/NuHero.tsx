import { Box, Flex, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

/** Shared hero height (content box incl. padding). Tune here to resize every page header. */
export const NU_HERO_MIN_H = { base: '312px', md: '296px' }

interface NuHeroProps {
  /** Page title (string) or a custom identity block (e.g. household eyebrow + name). */
  title: ReactNode
  /** Round control on the right of the title row (icon badge, eye toggle…). */
  action?: ReactNode
  /** Line art drawn behind the content. */
  decoration?: ReactNode
  /** Drop the shared minimum height so the hero hugs its content. */
  compact?: boolean
  children?: ReactNode
}

/**
 * Purple page hero shared by Dashboard, Earnings, Expenses and Household:
 * same colour, padding, title row and minimum height, flowing out of the app
 * bar. The next sibling should be a white sheet pulled up with mt="-24px".
 */
export default function NuHero({ title, action, decoration, compact = false, children }: NuHeroProps) {
  return (
    <Box as="section" className="nu-on-brand" position="relative" overflow="hidden" isolation="isolate" bg="var(--pb-hero)" color="white">
      {decoration}
      <Box
        position="relative"
        maxW="appContent"
        mx="auto"
        px={{ base: 4, md: 6, lg: 8 }}
        pt={{ base: 3, md: 6 }}
        pb={compact ? { base: 9, md: 10 } : { base: 10, md: 12 }}
        // One hero height on every page (sized for the tallest content, e.g. a
        // stacked period bar on phones / Household's actions on desktop).
        minH={compact ? undefined : NU_HERO_MIN_H}
        display="flex"
        flexDirection="column"
      >
        <Flex align="center" justify="space-between" gap={3} minH="44px">
          {typeof title === 'string' ? (
            <Text as="h1" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} letterSpacing="-0.01em" color="white" noOfLines={1}>
              {title}
            </Text>
          ) : (
            <Box flex={1} minW={0}>{title}</Box>
          )}
          {action}
        </Flex>
        {/* Figures sit at the bottom, just above the white sheet; spare height goes under the title. */}
        {children != null && <Box mt="auto" minW={0}>{children}</Box>}
      </Box>
    </Box>
  )
}

/** Depth for the purple hero without line art: a diagonal deepening plus a soft glow behind the headline figure. */
export function NuHeroGlow() {
  return (
    <Box
      aria-hidden="true" position="absolute" inset={0} zIndex={-1} pointerEvents="none"
      bg={[
        'radial-gradient(60% 70% at 18% 62%, rgba(214, 160, 255, 0.28) 0%, rgba(214, 160, 255, 0) 70%)',
        'radial-gradient(50% 60% at 100% 0%, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0) 70%)',
        'linear-gradient(135deg, #8a12dc 0%, #820ad1 45%, #6c05b5 100%)',
      ].join(', ')}
    />
  )
}

/** Round shortcut on the purple hero (Nubank style): icon in a circle, label below. */
export function NuHeroShortcut({ label, icon, onClick, primary = false, disabled = false, badge }: {
  label: string
  icon: ReactNode
  onClick: () => void
  primary?: boolean
  disabled?: boolean
  badge?: ReactNode
}) {
  return (
    <Flex
      as="button" type="button" onClick={onClick} disabled={disabled}
      direction="column" align="center" gap={1.5} w={{ base: '64px', md: '72px' }} flexShrink={0}
      _disabled={{ opacity: 0.55, cursor: 'not-allowed' }}
      _focusVisible={{ outline: 'none', '& .nu-shortcut-circle': { boxShadow: '0 0 0 3px rgba(255,255,255,0.55)' } }}
    >
      <Flex
        className="nu-shortcut-circle" position="relative" w="52px" h="52px" align="center" justify="center" borderRadius="full"
        bg={primary ? 'white' : 'rgba(255,255,255,0.16)'}
        color={primary ? 'var(--pb-hero)' : 'white'}
        border={primary ? 'none' : '1px solid rgba(255,255,255,0.18)'}
        transition="transform 120ms ease, background 160ms ease"
        _hover={{ bg: primary ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.24)' }}
        _active={{ transform: 'scale(0.94)' }}
      >
        {icon}
        {badge}
      </Flex>
      <Text fontSize="11px" fontWeight={700} color="white" noOfLines={1}>{label}</Text>
    </Flex>
  )
}

/** Round translucent badge for the hero title row. */
export function NuHeroBadge({ children }: { children: ReactNode }) {
  return (
    <Box display="grid" placeItems="center" w="36px" h="36px" borderRadius="full" bg="rgba(255,255,255,0.16)" color="white" flexShrink={0}>
      {children}
    </Box>
  )
}
