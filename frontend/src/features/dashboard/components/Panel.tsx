import { Box } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'

interface PanelProps extends BoxProps {
  interactive?: boolean
}

/** Card surface. The optional --pb-panel-* tokens let a page (e.g. the
 * Nubank-style dashboard) flatten every panel without touching other pages. */
export default function Panel({ children, interactive = false, ...props }: PanelProps) {
  return (
    <Box
      bg="var(--pb-panel-bg, var(--pb-surface))"
      border="1px solid var(--pb-panel-border, var(--pb-hair))"
      borderRadius="var(--pb-panel-radius, 22px)"
      boxShadow="var(--pb-shadow)"
      p="var(--pb-panel-padding, clamp(1.3rem, 2.6vw, 1.6rem))"
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      {...(interactive
        ? {
            _hover: {
              transform: 'translateY(-2px)',
              boxShadow: 'var(--pb-shadow-lift)',
              cursor: 'pointer',
            },
          }
        : {})}
      {...props}
    >
      {children}
    </Box>
  )
}
