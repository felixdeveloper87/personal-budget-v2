import { Box, Flex, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface NuHeroProps {
  /** Page title (string) or a custom identity block (e.g. household eyebrow + name). */
  title: ReactNode
  /** Round control on the right of the title row (icon badge, eye toggle…). */
  action?: ReactNode
  /** Line art drawn behind the content. */
  decoration?: ReactNode
  children?: ReactNode
}

/**
 * Purple page hero shared by Dashboard, Earnings, Expenses and Household:
 * same colour, padding, title row and minimum height, flowing out of the app
 * bar. The next sibling should be a white sheet pulled up with mt="-24px".
 */
export default function NuHero({ title, action, decoration, children }: NuHeroProps) {
  return (
    <Box as="section" className="nu-on-brand" position="relative" overflow="hidden" isolation="isolate" bg="var(--pb-hero)" color="white">
      {decoration}
      <Box
        position="relative"
        maxW="appContent"
        mx="auto"
        px={{ base: 4, md: 6, lg: 8 }}
        pt={{ base: 3, md: 6 }}
        pb={{ base: 10, md: 12 }}
        // Desktop keeps one hero height across pages; on phones the hero hugs its content.
        minH={{ base: 'auto', md: '252px' }}
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
        {children}
      </Box>
    </Box>
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
