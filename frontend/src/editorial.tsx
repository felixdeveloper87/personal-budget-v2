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
  bg: '#070a08',
  bg2: '#0b100d',
  jade: '#7fe6b3',
  gold: '#d9b36a',
  /** Primary text. */
  cream: '#efeae0',
  /** Secondary / muted text. */
  muted: '#94a398',
  red: '#f8a3a3',
  /** Dark glyph colour for text sitting on a jade/gold accent fill. */
  onAccent: '#07100a',

  /** ── Superfícies de card (fonte única) ──────────────────────────────
   *  `panel`  → card padrão da plataforma (páginas). Leve transparência pro
   *             backdrop aparecer sem atrapalhar a leitura.
   *  `modal`  → diálogos/modais. Um pouco mais opaco (conteúdo denso) + o blur
   *             do PremiumModal dá o efeito de vidro fosco, mantendo legível.
   *  `solid`  → superfícies que NÃO podem vazar (dropdowns, menus, popovers).
   *  `panelRaised` → painéis internos (card dentro de card). */
  panel: 'rgba(10, 11, 10, 0.80)',
  modal: 'rgba(14, 15, 14, 0.88)',
  solid: '#0e0f0e',
  panelRaised: 'rgba(239, 234, 224, 0.03)',
  line: 'rgba(239, 234, 224, 0.10)',
  lineStrong: 'rgba(239, 234, 224, 0.18)',

  /** Glass surface for the sticky header / sidebar. */
  glass: 'rgba(7, 10, 8, 0.80)',

  /** Subtle hover wash on a panel. */
  hoverBg: 'rgba(239, 234, 224, 0.08)',
  /** Chrome control surface (search pill, theme toggle, user trigger). */
  controlBg: 'rgba(239, 234, 224, 0.04)',
  controlHoverBg: 'rgba(239, 234, 224, 0.08)',
  /** Segmented-control track and its active thumb. */
  trackBg: 'rgba(239, 234, 224, 0.05)',
  thumbBg: 'rgba(239, 234, 224, 0.12)',
  /** Jade-tinted soft fills (Today button, hints). */
  jadeSoft: 'rgba(127, 230, 179, 0.12)',
  jadeSoftHover: 'rgba(127, 230, 179, 0.20)',

  /** Full-bleed background for the app shell. */
  bgGradient: 'linear-gradient(180deg, #0b100d 0%, #070a08 100%)',

  fontDisplay: "'Instrument Serif', Georgia, serif",
} as const

export type EditorialTokens = {
  [Key in keyof typeof EDITORIAL_DARK]: string
}

/* ── Light variant ("cream paper · ink · jade") ───────────────────────────── */
export const EDITORIAL_LIGHT: EditorialTokens = {
  bg: '#f4efe4',
  bg2: '#ebe3d4',
  /** Accents stay legible on cream: deep emerald + bronze gold. */
  jade: '#087a50',
  gold: '#a56f16',
  /** Primary text → deep ink-green (the "cream" slot, semantically primary). */
  cream: '#13281d',
  muted: '#586a5e',
  red: '#b8443d',
  onAccent: '#08120c',

  // Superfícies de card — ver doc no EDITORIAL_DARK.
  // Light paper needs a little more transparency so the guilloche remains
  // visible through large surfaces, matching the perceived dark-mode depth.
  panel: 'rgba(255, 252, 244, 0.70)',
  modal: 'rgba(255, 252, 244, 0.92)',
  solid: '#fffcf5',
  panelRaised: 'rgba(255, 255, 255, 0.48)',
  line: 'rgba(19, 56, 37, 0.14)',
  lineStrong: 'rgba(8, 122, 80, 0.28)',

  glass: 'rgba(248, 244, 235, 0.82)',

  hoverBg: 'rgba(8, 122, 80, 0.07)',
  controlBg: 'rgba(255, 255, 255, 0.48)',
  controlHoverBg: 'rgba(255, 255, 255, 0.76)',
  trackBg: 'rgba(19, 40, 29, 0.065)',
  thumbBg: 'rgba(255, 253, 248, 0.98)',
  jadeSoft: 'rgba(8, 122, 80, 0.11)',
  jadeSoftHover: 'rgba(8, 122, 80, 0.19)',

  bgGradient:
    'radial-gradient(circle at 12% 8%, rgba(8,122,80,0.13) 0%, transparent 30%), radial-gradient(circle at 88% 14%, rgba(165,111,22,0.12) 0%, transparent 28%), linear-gradient(145deg, #fcfaf4 0%, #f4eee1 52%, #ece2d0 100%)',

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
  // No dark as linhas (jade claro) somem sobre o quase-preto; subimos a opacidade
  // pra o padrão aparecer nos dois modos. Override via prop quando preciso.
  const resolved = opacity ?? (colorMode === 'dark' ? 0.45 : 0.29)
  return (
    <Box aria-hidden position="absolute" inset={0} pointerEvents="none" zIndex={0}>
      <Box position="sticky" top={0} h="100vh" overflow="hidden">
        <Guilloche n={30} rx={300} ry={120} opacity={resolved} />
      </Box>
    </Box>
  )
}
