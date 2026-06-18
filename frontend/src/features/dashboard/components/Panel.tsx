import { Box } from '@chakra-ui/react'
import type { BoxProps } from '@chakra-ui/react'

interface PanelProps extends BoxProps {
  interactive?: boolean
}

export default function Panel({ children, interactive = false, ...props }: PanelProps) {
  return (
    <Box
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius="22px"
      boxShadow="var(--pb-shadow)"
      p="clamp(1.3rem, 2.6vw, 1.6rem)"
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
