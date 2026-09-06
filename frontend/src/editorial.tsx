/** Shared editorial identity, backed by the same palette as Chakra and CSS. */
import { createContext, useContext, useMemo } from 'react'
import { Box, useColorMode } from '@chakra-ui/react'
import { DARK_PALETTE, LIGHT_PALETTE, type Palette } from './palette'

function createEditorialPalette(palette: Palette) {
  return {
    bg: palette.paper,
    bg2: palette['paper-2'],
    jade: palette['forest-2'],
    gold: palette.gold,
    cream: palette.ink,
    muted: palette['ink-soft'],
    red: palette.coral,
    onAccent: palette['on-accent'],
    panel: palette.surface,
    modal: palette.modal,
    solid: palette.solid,
    panelRaised: palette['panel-raised'],
    line: palette.hair,
    lineStrong: palette['hair-2'],
    glass: palette.glass,
    header: palette.header,
    headerInk: palette['header-ink'],
    hoverBg: palette.hover,
    controlBg: palette.control,
    controlHoverBg: palette['control-hover'],
    trackBg: palette.track,
    thumbBg: palette.thumb,
    jadeSoft: palette['tint-green'],
    jadeSoftHover: palette['tint-green-hover'],
    bgGradient: palette.canvas,
    fontDisplay: "'Instrument Serif', Georgia, serif",
  }
}

export type EditorialTokens = ReturnType<typeof createEditorialPalette>
export const EDITORIAL_DARK = createEditorialPalette(DARK_PALETTE)
export const EDITORIAL_LIGHT = createEditorialPalette(LIGHT_PALETTE)

/** Back-compat alias — defaults to the dark palette. */
export const EDITORIAL = EDITORIAL_DARK

/** Pick the editorial palette for a Chakra color mode. */
export function editorialPalette(colorMode: 'light' | 'dark'): EditorialTokens {
  return colorMode === 'dark' ? EDITORIAL_DARK : EDITORIAL_LIGHT
}

/* ── Context ──────────────────────────────────────────────────────────────── */
const EditorialContext = createContext<boolean>(false)

export function EditorialProvider({
  active,
  children,
}: {
  active: boolean
  children: React.ReactNode
}) {
  return (
    <EditorialContext.Provider value={active}>{children}</EditorialContext.Provider>
  )
}

/** `true` when the surrounding tree is rendered in editorial mode. */
export function useEditorial() {
  return useContext(EditorialContext)
}

/**
 * Returns the editorial token object for the active color mode while editorial
 * mode is on, otherwise `null`. Always call it unconditionally and branch on
 * the result so the Rules of Hooks are respected:
 *
 *   const ed = useEd()
 *   const base = useColorModeValue('gray.900', 'gray.50')
 *   const color = ed ? ed.cream : base
 */
export function useEd(): EditorialTokens | null {
  const active = useContext(EditorialContext)
  const { colorMode } = useColorMode()
  return active ? editorialPalette(colorMode) : null
}

/** Returns the V3 editorial palette regardless of provider scope. */
export function useEditorialPalette(): EditorialTokens {
  const { colorMode } = useColorMode()
  return editorialPalette(colorMode)
}

/* ── Guilloché engraving ──────────────────────────────────────────────────── */
/**
 * Code-generated guilloché — concentric ellipses split into two slowly
 * counter-rotating groups, matching the landing page. Purely decorative,
 * radially masked, and disabled when reduced motion is requested.
 */
export function Guilloche({
  n = 28,
  rx = 300,
  ry = 120,
  opacity = 0.35,
}: {
  n?: number
  rx?: number
  ry?: number
  opacity?: number
}) {
  const { colorMode } = useColorMode()
  const pal = editorialPalette(colorMode)
  const ellipses = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        id: i,
        angle: (i / n) * 180,
        gold: i % 5 === 0,
        group: i % 2,
      })),
    [n],
  )
  const drawGroup = (group: number) =>
    ellipses
      .filter((ellipse) => ellipse.group === group)
      .map((ellipse) => (
        <ellipse
          key={ellipse.id}
          cx="0"
          cy="0"
          rx={rx}
          ry={ry}
          transform={`rotate(${ellipse.angle})`}
          fill="none"
          strokeWidth={0.6}
          vectorEffect="non-scaling-stroke"
          stroke={ellipse.gold ? pal.gold : pal.jade}
        />
      ))

  return (
    <Box
      aria-hidden
      position="absolute"
      inset={0}
      display="grid"
      placeItems="center"
      pointerEvents="none"
      zIndex={0}
      opacity={opacity}
      sx={{
        WebkitMaskImage:
          'radial-gradient(circle at center, #000 30%, transparent 72%)',
        maskImage: 'radial-gradient(circle at center, #000 30%, transparent 72%)',
        '@keyframes editorialGuillocheSpin': {
          to: { transform: 'rotate(360deg)' },
        },
        '.editorial-guilloche-spin': {
          transformBox: 'fill-box',
          transformOrigin: 'center',
          willChange: 'transform',
          animation: 'editorialGuillocheSpin 140s linear infinite',
        },
        '.editorial-guilloche-spin-reverse': {
          transformBox: 'fill-box',
          transformOrigin: 'center',
          willChange: 'transform',
          animation: 'editorialGuillocheSpin 200s linear infinite reverse',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '.editorial-guilloche-spin, .editorial-guilloche-spin-reverse': {
            animation: 'none',
            willChange: 'auto',
          },
        },
      }}
    >
      <svg
        viewBox="-300 -300 600 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <g className="editorial-guilloche-spin">{drawGroup(0)}</g>
        <g className="editorial-guilloche-spin-reverse">{drawGroup(1)}</g>
      </svg>
    </Box>
  )
}

/* ── Page backdrop ────────────────────────────────────────────────────────── */
/**
 * The dashboard's signature backdrop, factored out so every page wears the same
 * look without repeating it. Renders the guilloché engraving absolutely behind
 * the page content. Returns `null` outside editorial mode (admin shell).
 *
 * Mounted once in the Layout's `<main>` (which is `position="relative"
 * overflow="hidden"`), with the page content kept above via `zIndex={1}`. Works
 * for both color modes automatically — {@link Guilloche} follows the palette.
 */
export function EditorialBackdrop({ opacity }: { opacity?: number }) {
  const ed = useEd()
  const { colorMode } = useColorMode()
  if (!ed) return null
  // Light mode is a quiet paper surface — no page-background engraving. The
  // guilloché backdrop stays only in dark, where it reads as quiet depth.
  if (colorMode !== 'dark') return null
  // The page texture is deliberately subordinate to dashboard content. At the
  // old opacity it competed with charts and made dense financial data harder to
  // scan, particularly in dark mode.
  const resolved = opacity ?? 0.06
  return (
    <Box aria-hidden position="absolute" inset={0} pointerEvents="none" zIndex={0}>
      <Box position="sticky" top={0} h="100vh" overflow="hidden">
        <Guilloche n={30} rx={300} ry={120} opacity={resolved} />
      </Box>
    </Box>
  )
}
