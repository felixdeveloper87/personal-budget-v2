import type { CSSProperties } from 'react'
import { useColorMode } from '@chakra-ui/react'

interface BrandMarkProps {
  size?: number | string
  /** mark: the P only · title: P + name · wordmark: P + name + tagline. */
  variant?: 'mark' | 'wordmark' | 'title'
  /** 'dark' = drawn on a dark or purple surface (white artwork). */
  colorMode?: 'light' | 'dark'
  className?: string
  style?: CSSProperties
}

/* The "P" is three folded layers: the bowl, a light ribbon folding over it
   (with a darker overlap where it crosses the bowl) and the stem leaf.
   Flat Nubank-purple tones on light surfaces, white tints on brand ones. */
const P_PATHS = {
  bowl: 'M8 92C8 46 46 8 92 8H210C264 8 310 54 310 108C310 162 264 208 210 208H8Z',
  ribbon: 'M8 270V205C8 150 58 110 132 110H198C225 110 247 132 247 159C247 186 225 208 198 208H128C60 208 8 230 8 270Z',
  overlap: 'M168 110H198C225 110 247 132 247 159C247 186 225 208 198 208H134C122 180 136 128 168 110Z',
  stem: 'M128 205V236C128 297 90 344 40 344H8V268C8 230 52 205 128 205Z',
} as const

const PALETTE = {
  light: { bowl: '#820ad1', ribbon: '#e6d0fa', overlap: '#b77ce9', stem: '#5a0791', ink: '#1f1f24', soft: '#6b6b76' },
  dark: { bowl: '#ffffff', ribbon: '#e4cdf9', overlap: '#c597f0', stem: '#f3e8fc', ink: '#ffffff', soft: 'rgba(255,255,255,0.78)' },
} as const

const FONT = "'Schibsted Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"

// Mark box is 318×350; the name sits to its right, optically centred on the bowl.
const VIEWBOX = {
  mark: { w: 318, h: 352 },
  title: { w: 1660, h: 352 },
  wordmark: { w: 1660, h: 352 },
} as const

export default function BrandMark({
  size = 48,
  variant = 'mark',
  colorMode: requestedMode,
  className,
  style,
}: BrandMarkProps) {
  const { colorMode } = useColorMode()
  const c = PALETTE[(requestedMode ?? colorMode) === 'dark' ? 'dark' : 'light']
  const box = VIEWBOX[variant]
  const wordmark = variant !== 'mark'

  return (
    <svg
      className={className}
      viewBox={`0 0 ${box.w} ${box.h}`}
      width={size}
      height={wordmark ? undefined : size}
      aria-hidden="true"
      focusable="false"
      style={{
        display: 'block',
        flexShrink: 0,
        maxWidth: '100%',
        aspectRatio: `${box.w} / ${box.h}`,
        ...style,
      }}
    >
      <path fill={c.bowl} d={P_PATHS.bowl} />
      <path fill={c.ribbon} d={P_PATHS.ribbon} />
      <path fill={c.overlap} d={P_PATHS.overlap} />
      <path fill={c.stem} d={P_PATHS.stem} />
      {wordmark && (
        <text
          x={390}
          y={variant === 'wordmark' ? 200 : 233}
          fill={c.ink}
          fontFamily={FONT}
          fontSize={164}
          fontWeight={700}
          letterSpacing={-4.5}
          // Pins the width so a fallback font can't overflow the viewBox.
          textLength={1250}
          lengthAdjust="spacingAndGlyphs"
        >
          Personal Budget
        </text>
      )}
      {variant === 'wordmark' && (
        <text x={396} y={296} fill={c.soft} fontFamily={FONT} fontSize={64} fontWeight={500}>
          Clarity is the goal
        </text>
      )}
    </svg>
  )
}
