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
  bg: '#f5f1e8',
  bg2: '#efe9db',
  /** Accents stay legible on cream: deep emerald + bronze gold. */
  jade: '#0e8f5e',
  gold: '#9c7320',
  /** Primary text → deep ink-green (the "cream" slot, semantically primary). */
  cream: '#16241c',
  muted: '#5f6d62',
  red: '#c0473f',
  onAccent: '#08120c',

  // Superfícies de card — ver doc no EDITORIAL_DARK.
  panel: 'rgba(255, 253, 247, 0.80)',
  modal: 'rgba(255, 253, 247, 0.88)',
  solid: '#fffdf7',
  panelRaised: 'rgba(20, 36, 28, 0.035)',
  line: 'rgba(20, 36, 28, 0.12)',
  lineStrong: 'rgba(20, 36, 28, 0.20)',

  glass: 'rgba(245, 241, 232, 0.78)',

  hoverBg: 'rgba(20, 36, 28, 0.05)',
  controlBg: 'rgba(20, 36, 28, 0.035)',
  controlHoverBg: 'rgba(20, 36, 28, 0.06)',
  trackBg: 'rgba(20, 36, 28, 0.05)',
  thumbBg: 'rgba(255, 253, 247, 0.95)',
  jadeSoft: 'rgba(14, 143, 94, 0.10)',
  jadeSoftHover: 'rgba(14, 143, 94, 0.18)',

  bgGradient: 'linear-gradient(180deg, #faf7f0 0%, #f5f1e8 100%)',

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
 * Static code-generated guilloché — concentric counter-rotated ellipses,
 * radially masked. Purely decorative; rendered behind a section. Kept static
 * (no animation) since this sits behind dense, interactive content. Stroke
 * colours follow the active editorial palette.
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
        angle: (i / n) * 180,
        gold: i % 5 === 0,
      })),
    [n],
  )

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
        WebkitMaskImage:
          'radial-gradient(circle at center, #000 30%, transparent 72%)',
        maskImage: 'radial-gradient(circle at center, #000 30%, transparent 72%)',
      }}
    >
      <svg
        viewBox="-300 -300 600 600"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        {ellipses.map((e, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="0"
            rx={rx}
            ry={ry}
            transform={`rotate(${e.angle})`}
            fill="none"
            strokeWidth={0.6}
            vectorEffect="non-scaling-stroke"
            stroke={e.gold ? pal.gold : pal.jade}
          />
        ))}
      </svg>
    </div>
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
  const resolved = opacity ?? (colorMode === 'dark' ? 0.45 : 0.22)
  return (
    <Box aria-hidden position="absolute" inset={0} pointerEvents="none" zIndex={0}>
      <Guilloche n={30} rx={300} ry={120} opacity={resolved} />
    </Box>
  )
}
