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
  // Preto fosco neutro — o verde/dourado vive só nos acentos, nunca no fundo.
  bg: '#0b0b0c',
  bg2: '#111113',
  /** Brand accent (jade mint) + soft gold. */
  jade: '#7fe6b3',
  gold: '#e8c477',
  /** Primary text. ~18:1 on `bg`. */
  cream: '#f2f4f0',
  /** Secondary / muted text. ~11:1 on the matte-black `bg`. */
  muted: '#b6bab4',
  red: '#ff9a90',
  /** Dark glyph colour for text sitting on a brand/gold accent fill. */
  onAccent: '#06221f',

  /** ── Superfícies de card (fonte única) ──────────────────────────────
   *  `panel`  → card padrão da plataforma (páginas). Leve transparência pro
   *             backdrop aparecer sem atrapalhar a leitura.
   *  `modal`  → diálogos/modais. Um pouco mais opaco (conteúdo denso) + o blur
   *             do PremiumModal dá o efeito de vidro fosco, mantendo legível.
   *  `solid`  → superfícies que NÃO podem vazar (dropdowns, menus, popovers).
   *  `panelRaised` → painéis internos (card dentro de card). */
  // Painéis no MESMO preto fosco do glass da sidebar (pedido do usuário): os
  // cards se separam do fundo pelo hairline `line`, não por elevação de tom.
  panel: 'rgba(10, 10, 11, 0.88)',
  modal: 'rgba(18, 18, 20, 0.94)',
  solid: '#141416',
  panelRaised: 'rgba(244, 246, 242, 0.05)',
  line: 'rgba(244, 246, 242, 0.12)',
  lineStrong: 'rgba(244, 246, 242, 0.20)',

  /** Glass surface for the sticky header / sidebar. */
  glass: 'rgba(10, 10, 11, 0.88)',

  /** Subtle hover wash on a panel. */
  hoverBg: 'rgba(244, 246, 242, 0.08)',
  /** Chrome control surface (search pill, theme toggle, user trigger). */
  controlBg: 'rgba(244, 246, 242, 0.04)',
  controlHoverBg: 'rgba(244, 246, 242, 0.08)',
  /** Segmented-control track and its active thumb. */
  trackBg: 'rgba(244, 246, 242, 0.05)',
  thumbBg: 'rgba(244, 246, 242, 0.12)',
  /** Brand-tinted soft fills (Today button, hints). */
  jadeSoft: 'rgba(127, 230, 179, 0.10)',
  jadeSoftHover: 'rgba(127, 230, 179, 0.18)',

  /** Full-bleed background for the app shell. Keep in sync with `GRADIENTS.dark`. */
  bgGradient: 'linear-gradient(180deg, #111113 0%, #0b0b0c 100%)',

  fontDisplay: "'Instrument Serif', Georgia, serif",
} as const

export type EditorialTokens = {
  [Key in keyof typeof EDITORIAL_DARK]: string
}

/* ── Light variant ("cream paper · ink · jade") ───────────────────────────── */
export const EDITORIAL_LIGHT: EditorialTokens = {
  // Single warm-cream shell surface: header, sidebar and pages all share `bg`
  // (glass is opaque to the same value, bgGradient is flat). White cards then
  // elevate cleanly off the paper.
  bg: '#f2f0e6',
  bg2: '#e9e6d8',
  /** Brand accent (forest green) + restrained gold. */
  jade: '#1e5a41',
  gold: '#8f6b1f',
  /** Primary text → deep green-ink (the "cream" slot, semantically primary). */
  cream: '#1a2620',
  muted: '#5a685e',
  red: '#b8452f',
  onAccent: '#f7fffc',

  // Superfícies de card — ver doc no EDITORIAL_DARK. Solid white panels so cards
  // lift clearly off the cream shell (the guilloché page backdrop is off in
  // light).
  panel: '#ffffff',
  modal: 'rgba(255, 255, 255, 0.94)',
  solid: '#ffffff',
  panelRaised: 'rgba(255, 255, 255, 0.62)',
  line: 'rgba(26, 38, 32, 0.13)',
  lineStrong: 'rgba(30, 90, 65, 0.26)',

  // Opaque = same colour as the page, so the sticky header / sidebar read as one
  // continuous surface with the content (no glass tint seam).
  glass: '#f2f0e6',

  hoverBg: 'rgba(30, 90, 65, 0.07)',
  controlBg: 'rgba(255, 255, 255, 0.62)',
  controlHoverBg: 'rgba(255, 255, 255, 0.88)',
  trackBg: 'rgba(26, 38, 32, 0.06)',
  thumbBg: 'rgba(255, 255, 255, 0.98)',
  jadeSoft: 'rgba(30, 90, 65, 0.09)',
  jadeSoftHover: 'rgba(30, 90, 65, 0.16)',

  // Flat — no radial glow / gradient — so the page is a single even cream that
  // matches the header and sidebar.
  bgGradient: 'linear-gradient(180deg, #f2f0e6 0%, #f2f0e6 100%)',

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
