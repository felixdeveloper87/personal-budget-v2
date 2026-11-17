/** User-selectable accent colour.
 *
 * Every accent use in the app reads CSS variables (`--accent`, `--accent-rgb`,
 * `--accent-tint`…) instead of a literal hex, so switching theme is just a
 * matter of setting `data-accent` on <html>. Green/red stay reserved for money
 * meaning and the logo stays purple in every theme.
 *
 * The saved choice applies to the signed-in app only: signed out (landing,
 * sign-in) the document is always purple, the brand colour.
 *
 * The boot script in index.html mirrors ACCENT_STORAGE_KEY and each accent's
 * `main` colour so the first paint already wears the saved theme — keep them
 * in sync.
 */
export const ACCENT_IDS = ['purple', 'blue', 'graphite'] as const
export type AccentId = (typeof ACCENT_IDS)[number]
export const DEFAULT_ACCENT: AccentId = 'purple'
export const ACCENT_STORAGE_KEY = 'pb-accent'

interface Accent {
  main: string
  /** The same colour as `main`, as `r, g, b`, for `rgba(var(--accent-rgb), a)`. */
  rgb: string
  /** Hover / pressed shade of `main`. */
  deep: string
  /** Slightly lighter than `main`, the start of the hero gradient. */
  bright: string
  /** Pale background behind accent-coloured text and icons. */
  tint: string
  /** `tint` as `r, g, b`. */
  tintRgb: string
  /** Even paler hover wash. */
  soft: string
  /** Hairline that sits on a `tint` background. */
  border: string
  /** `main` seen through a sheet's dark overlay (Android status bar). */
  dimmed: string
  scale: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>
}

export const ACCENTS: Record<AccentId, Accent> = {
  purple: {
    main: '#820ad1',
    rgb: '130, 10, 209',
    deep: '#6e08b3',
    bright: '#8a12dc',
    tint: '#f3e8fc',
    tintRgb: '243, 232, 252',
    soft: '#f8f1fe',
    border: '#ead6fa',
    dimmed: '#46056f',
    scale: {
      50: '#f6effd',
      100: '#ead9fb',
      200: '#d4b0f6',
      300: '#bb84f0',
      400: '#a04de6',
      500: '#820ad1',
      600: '#7008b5',
      700: '#5d0796',
      800: '#4a0577',
      900: '#36045a',
    },
  },
  blue: {
    main: '#1a5fd6',
    rgb: '26, 95, 214',
    deep: '#1651b6',
    bright: '#2869d8',
    tint: '#e8effb',
    tintRgb: '232, 239, 251',
    soft: '#f1f5fd',
    border: '#d6e2f8',
    dimmed: '#0e3374',
    scale: {
      50: '#f4f7fd',
      100: '#dfe9f9',
      200: '#bacff3',
      300: '#91b2eb',
      400: '#5a8ce1',
      500: '#1a5fd6',
      600: '#1652b8',
      700: '#13449a',
      800: '#0f367a',
      900: '#0b285a',
    },
  },
  /** Metallic graphite: `bright` is lifted further than the others so the
   * hero gradient reads as a brushed-metal sheen. */
  graphite: {
    main: '#2f353d',
    rgb: '47, 53, 61',
    deep: '#22262c',
    bright: '#4f5761',
    tint: '#eaebec',
    tintRgb: '234, 235, 236',
    soft: '#f3f3f4',
    border: '#dadbdc',
    dimmed: '#191d21',
    scale: {
      50: '#f5f5f5',
      100: '#e2e3e4',
      200: '#c1c2c5',
      300: '#9b9ea2',
      400: '#696e73',
      500: '#2f353d',
      600: '#282e34',
      700: '#22262c',
      800: '#1b1e23',
      900: '#14161a',
    },
  },
}

export function isAccentId(value: unknown): value is AccentId {
  return typeof value === 'string' && (ACCENT_IDS as readonly string[]).includes(value)
}

/** The raw `--accent-*` variables for one accent. */
export function accentCssVariables(id: AccentId): Record<string, string> {
  const accent = ACCENTS[id]
  const vars: Record<string, string> = {
    '--accent': accent.main,
    '--accent-rgb': accent.rgb,
    '--accent-deep': accent.deep,
    '--accent-bright': accent.bright,
    '--accent-tint': accent.tint,
    '--accent-tint-rgb': accent.tintRgb,
    '--accent-soft': accent.soft,
    '--accent-border': accent.border,
  }
  for (const [step, value] of Object.entries(accent.scale)) vars[`--accent-${step}`] = value
  return vars
}

/** Chakra's `brand` colour tokens, pointing at the live accent scale. */
export const BRAND_COLOR_TOKENS = Object.fromEntries(
  Object.keys(ACCENTS.purple.scale).map((step) => [step, `var(--accent-${step})`]),
) as Record<keyof Accent['scale'], string>

/** The accent this device saved, or the default. */
export function readStoredAccent(): AccentId {
  try {
    const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY)
    if (isAccentId(stored)) return stored
  } catch {
    // Storage can be unavailable (private mode); fall back to the default.
  }
  return DEFAULT_ACCENT
}

/** Paints the document with an accent without saving it (e.g. the landing page). */
export function setDocumentAccent(id: AccentId) {
  const root = document.documentElement
  if (root.dataset.accent === id) return
  root.dataset.accent = id
  // The page background shows under the iOS status bar and on overscroll.
  root.style.background = ACCENTS[id].main
  window.dispatchEvent(new CustomEvent('pb-accent-change', { detail: id }))
}

/** Applies an accent and remembers it on this device. */
export function applyAccent(id: AccentId) {
  try {
    window.localStorage.setItem(ACCENT_STORAGE_KEY, id)
  } catch {
    // Not persisted, but still applied for this session.
  }
  setDocumentAccent(id)
}

/** The accent currently applied to the document. */
export function currentAccent(): AccentId {
  const value = document.documentElement.dataset.accent
  return isAccentId(value) ? value : DEFAULT_ACCENT
}
