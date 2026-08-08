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

/* ── Dark variant — neutral graphite, cool teal and soft gold ────────────── */
export const EDITORIAL_DARK = {
  bg: '#080a09',
  bg2: '#0c0f0e',
  /** Brand accent (jade mint) + soft gold. */
  jade: '#5fd0b5',
  gold: '#d0b76f',
  /** Primary text. ~18:1 on `bg`. */
  cream: '#eff4f1',
  /** Secondary / muted text. ~11:1 on the matte-black `bg`. */
  muted: '#a8b5af',
  red: '#f08f86',
  /** Dark glyph colour for text sitting on a brand/gold accent fill. */
  onAccent: '#061a15',

  /** ── Superfícies de card (fonte única) ──────────────────────────────
   *  `panel`  → card padrão da plataforma (páginas). Leve transparência pro
   *             backdrop aparecer sem atrapalhar a leitura.
   *  `modal`  → diálogos/modais. Um pouco mais opaco (conteúdo denso) + o blur
   *             do PremiumModal dá o efeito de vidro fosco, mantendo legível.
   *  `solid`  → superfícies que NÃO podem vazar (dropdowns, menus, popovers).
   *  `panelRaised` → painéis internos (card dentro de card). */
  panel: 'rgba(10, 13, 12, 0.94)',
  modal: 'rgba(13, 16, 15, 0.98)',
  solid: '#101312',
  panelRaised: 'rgba(16, 20, 18, 0.98)',
  line: 'rgba(232, 242, 237, 0.09)',
  lineStrong: 'rgba(232, 242, 237, 0.17)',

  /** Glass surface for the sticky header / sidebar. */
  glass: 'rgba(8, 10, 9, 0.93)',

  /** Subtle hover wash on a panel. */
  hoverBg: 'rgba(239, 244, 241, 0.065)',
  /** Chrome control surface (search pill, theme toggle, user trigger). */
  controlBg: 'rgba(239, 244, 241, 0.04)',
  controlHoverBg: 'rgba(239, 244, 241, 0.075)',
  /** Segmented-control track and its active thumb. */
  trackBg: 'rgba(239, 244, 241, 0.045)',
  thumbBg: 'rgba(239, 244, 241, 0.105)',
  /** Brand-tinted soft fills (Today button, hints). */
  jadeSoft: 'rgba(95, 208, 181, 0.10)',
  jadeSoftHover: 'rgba(95, 208, 181, 0.17)',

  /** Full-bleed background for the app shell. Keep in sync with `GRADIENTS.dark`. */
  bgGradient:
    'radial-gradient(circle at 88% -12%, rgba(55,150,125,0.08) 0%, transparent 32%), linear-gradient(180deg, #0c0f0e 0%, #080a09 58%, #060807 100%)',

  fontDisplay: "'Instrument Serif', Georgia, serif",
} as const

export type EditorialTokens = {
  [Key in keyof typeof EDITORIAL_DARK]: string
}

/* ── Light variant — silvered off-white, forest ink and white cards ───────── */
export const EDITORIAL_LIGHT: EditorialTokens = {
  bg: '#f3f4f2',
  bg2: '#e7eae7',
  /** Brand accent (forest green) + restrained gold. */
  jade: '#26735a',
  gold: '#7c6427',
  /** Primary text → deep green-ink (the "cream" slot, semantically primary). */
  cream: '#17201c',
  muted: '#58635e',
  red: '#aa4938',
  onAccent: '#f8fbf8',

  panel: 'rgba(255, 255, 255, 0.90)',
  modal: 'rgba(255, 255, 255, 0.97)',
  solid: '#ffffff',
  panelRaised: '#ffffff',
  line: 'rgba(23, 32, 28, 0.11)',
  lineStrong: 'rgba(24, 81, 62, 0.23)',

  glass: 'rgba(248, 249, 247, 0.91)',

  hoverBg: 'rgba(24, 81, 62, 0.06)',
  controlBg: 'rgba(255, 255, 255, 0.70)',
  controlHoverBg: 'rgba(255, 255, 255, 0.96)',
  trackBg: 'rgba(23, 32, 28, 0.05)',
  thumbBg: '#ffffff',
  jadeSoft: 'rgba(38, 115, 90, 0.09)',
  jadeSoftHover: 'rgba(38, 115, 90, 0.15)',

  bgGradient:
    'radial-gradient(circle at 12% -8%, rgba(255,255,255,0.96) 0%, transparent 36%), radial-gradient(circle at 100% 0%, rgba(38,115,90,0.035) 0%, transparent 30%), linear-gradient(145deg, #f8f9f7 0%, #f3f4f2 48%, #ecefeb 100%)',

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
