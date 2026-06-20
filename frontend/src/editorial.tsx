/**
 * Editorial theme — shared "Landing v3" visual identity for the in-app shell.
 *
 * The dashboard (and the chrome around it) borrows the landing's
 * "Editorial · guilloché" language: warm editorial surfaces, jade + gold
 * accents, a giant editorial serif for headings and a mono face for labels.
 *
 * It now ships in TWO variants — a deep ink-green **dark** and a cream-paper
 * **light** — so the dashboard honours the user's color-mode toggle instead of
 * being a forced-dark island.
 *
 * Components opt in by reading {@link useEd}: it returns the palette for the
 * active color mode while editorial mode is on, or `null` otherwise. When it
 * returns `null` they keep their normal light/dark Chakra styling. The provider
 * lives in the Layout and is only active on the dashboard, so every other page
 * is left untouched.
 */
import { createContext, useContext, useMemo } from 'react'
import { Box, useColorMode } from '@chakra-ui/react'

/* ── Dark variant (ported 1:1 from LandingV3.css) ─────────────────────────── */
export const EDITORIAL_DARK = {
  bg: '#0a0f16',
  bg2: '#0e141d',
  /** Brand accent (steel blue) + brass. */
  jade: '#6db3e8',
  gold: '#d8b772',
  /** Primary text. */
  cream: '#e8eef6',
  /** Secondary / muted text. */
  muted: '#94a3b1',
  red: '#f6928a',
  /** Dark glyph colour for text sitting on a brand/gold accent fill. */
  onAccent: '#06101a',

  /** ── Superfícies de card (fonte única) ──────────────────────────────
   *  `panel`  → card padrão da plataforma (páginas). Leve transparência pro
   *             backdrop aparecer sem atrapalhar a leitura.
   *  `modal`  → diálogos/modais. Um pouco mais opaco (conteúdo denso) + o blur
   *             do PremiumModal dá o efeito de vidro fosco, mantendo legível.
   *  `solid`  → superfícies que NÃO podem vazar (dropdowns, menus, popovers).
   *  `panelRaised` → painéis internos (card dentro de card). */
  panel: 'rgba(16, 22, 31, 0.80)',
  modal: 'rgba(18, 24, 33, 0.88)',
  solid: '#12181f',
  panelRaised: 'rgba(226, 235, 247, 0.03)',
  line: 'rgba(226, 235, 247, 0.10)',
  lineStrong: 'rgba(226, 235, 247, 0.18)',

  /** Glass surface for the sticky header / sidebar. */
  glass: 'rgba(10, 15, 22, 0.80)',

  /** Subtle hover wash on a panel. */
  hoverBg: 'rgba(226, 235, 247, 0.08)',
  /** Chrome control surface (search pill, theme toggle, user trigger). */
  controlBg: 'rgba(226, 235, 247, 0.04)',
  controlHoverBg: 'rgba(226, 235, 247, 0.08)',
  /** Segmented-control track and its active thumb. */
  trackBg: 'rgba(226, 235, 247, 0.05)',
  thumbBg: 'rgba(226, 235, 247, 0.12)',
  /** Brand-tinted soft fills (Today button, hints). */
  jadeSoft: 'rgba(109, 179, 232, 0.12)',
  jadeSoftHover: 'rgba(109, 179, 232, 0.20)',

  /** Full-bleed background for the app shell. */
  bgGradient: 'linear-gradient(180deg, #0e141d 0%, #0a0f16 100%)',

  fontDisplay: "'Instrument Serif', Georgia, serif",
} as const

export type EditorialTokens = {
  [Key in keyof typeof EDITORIAL_DARK]: string
}

/* ── Light variant ("cream paper · ink · jade") ───────────────────────────── */
export const EDITORIAL_LIGHT: EditorialTokens = {
  bg: '#e7ebf1',
  bg2: '#dde2ea',
  /** Brand accent (steel blue) + brass, legible on cool metallic. */
  jade: '#1d5a87',
  gold: '#9c7b2c',
  /** Primary text → deep slate (the "cream" slot, semantically primary). */
  cream: '#15202e',
  muted: '#4d5c6c',
  red: '#c23a2c',
  onAccent: '#f6f8fb',

  // Superfícies de card — ver doc no EDITORIAL_DARK. Cool near-white panels on
  // the flat metallic background (the guilloché page backdrop is off in light).
  panel: 'rgba(255, 255, 255, 0.72)',
  modal: 'rgba(255, 255, 255, 0.92)',
  solid: '#ffffff',
  panelRaised: 'rgba(255, 255, 255, 0.55)',
  line: 'rgba(28, 58, 92, 0.14)',
  lineStrong: 'rgba(29, 90, 135, 0.28)',

  glass: 'rgba(244, 247, 251, 0.82)',

  hoverBg: 'rgba(29, 90, 135, 0.07)',
  controlBg: 'rgba(255, 255, 255, 0.55)',
  controlHoverBg: 'rgba(255, 255, 255, 0.82)',
  trackBg: 'rgba(28, 48, 72, 0.07)',
  thumbBg: 'rgba(255, 255, 255, 0.98)',
  jadeSoft: 'rgba(29, 90, 135, 0.11)',
  jadeSoftHover: 'rgba(29, 90, 135, 0.19)',

  bgGradient: 'linear-gradient(180deg, #eef1f6 0%, #e3e8f0 100%)',

  fontDisplay: "'Instrument Serif', Georgia, serif",
}

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
  // Light mode is a flat metallic surface — no page-background engraving. The
  // guilloché backdrop stays only in dark, where it reads as quiet depth.
  if (colorMode !== 'dark') return null
  // The page texture is deliberately subordinate to dashboard content. At the
  // old opacity it competed with charts and made dense financial data harder to
  // scan, particularly in dark mode.
  const resolved = opacity ?? 0.10
  return (
    <Box aria-hidden position="absolute" inset={0} pointerEvents="none" zIndex={0}>
      <Box position="sticky" top={0} h="100vh" overflow="hidden">
        <Guilloche n={30} rx={300} ry={120} opacity={resolved} />
      </Box>
    </Box>
  )
}
