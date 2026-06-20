import { Box } from '@chakra-ui/react'

interface MonogramTileProps {
  label: string
  color: string
  size?: number
}

/** Engraved monogram tile (no third-party logos) — banknote-overlay on a brand colour. */
export default function MonogramTile({ label, color, size = 44 }: MonogramTileProps) {
  return (
    <Box
      position="relative"
      flexShrink={0}
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="12px"
      bg={color}
      color="#f6f5ee"
      display="grid"
      placeItems="center"
      overflow="hidden"
      fontFamily="var(--pb-mono)"
      fontWeight={600}
      fontSize={`${size * 0.42}px`}
      boxShadow="inset 0 1px 0 rgba(255,255,255,.28), 0 4px 12px rgba(15,23,42,.18)"
      sx={{
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          mixBlendMode: 'overlay',
          background: 'repeating-linear-gradient(120deg, rgba(255,255,255,.14) 0 1px, transparent 1px 5px)',
        },
      }}
    >
      <Box as="span" position="relative" zIndex={1}>
        {label}
      </Box>
    </Box>
  )
}
