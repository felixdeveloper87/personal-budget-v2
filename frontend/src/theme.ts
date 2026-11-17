import { extendTheme, ThemeConfig } from '@chakra-ui/react'
import { DARK_PALETTE, LIGHT_PALETTE, paletteCssVariables } from './palette'
import { ACCENT_IDS, BRAND_COLOR_TOKENS, DEFAULT_ACCENT, accentCssVariables } from './accent'

/** Default accent on :root, each other accent under html[data-accent]. Variables
 * that reference --accent live on the same element, so they follow the switch. */
const ACCENT_STYLES = Object.fromEntries(
  ACCENT_IDS.filter((id) => id !== DEFAULT_ACCENT).map((id) => [
    `html[data-accent="${id}"]`,
    accentCssVariables(id),
  ]),
)

// 🎨 Gradientes centralizados
const GRADIENTS = {
  light: LIGHT_PALETTE.canvas,
  dark: DARK_PALETTE.canvas,
  cardLight: LIGHT_PALETTE.surface,
  cardDark: DARK_PALETTE.surface,
  secondaryLight: LIGHT_PALETTE['surface-2'],
  secondaryDark: DARK_PALETTE['surface-2'],
} as const

const FONTS = {
  display: "'Schibsted Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
  mono: "'Spline Sans Mono', ui-monospace, monospace",
} as const

// Single light theme — the app no longer offers a dark mode.
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  breakpoints: {
    base: '0px',
    sm: '480px',
    md: '768px',
    lg: '992px',
    xl: '1280px',
    '2xl': '1536px',
  },
  styles: {
    global: {
      ':root': {
        ...accentCssVariables(DEFAULT_ACCENT),
        ...paletteCssVariables(LIGHT_PALETTE),
        '--nu-brand': 'var(--accent)',
        '--nu-brand-deep': 'var(--accent-deep)',
        '--nu-brand-tint': 'var(--accent-tint)',
      },
      ...ACCENT_STYLES,
      '::selection': {
        bg: 'var(--pb-sidebar-active-bg)',
        color: 'var(--pb-ink)',
      },
      // 👇 Estilos específicos para navegadores móveis (Safari/Chrome no iPhone)
      html: {
        colorScheme: 'light',
        // Safe areas are NOT padded here: every fixed/sticky surface (header,
        // bottom nav, sheets, landing) pads its own edge, so the purple bar can
        // run under the status bar instead of leaving an empty band.
        // Melhor scroll no iOS
        WebkitOverflowScrolling: 'touch',
        // Previne zoom indesejado no iOS
        touchAction: 'manipulation',
        // Native apps do not flash a grey box on tap.
        WebkitTapHighlightColor: 'transparent',
      },
      // Controls behave like native ones: no text selection or long-press
      // "copy / open link" callout when a finger rests on them. Form fields
      // and content text stay selectable.
      'button, a, nav, header, label, summary, [role="button"], [role="tab"], [role="menuitem"], [role="switch"], [role="checkbox"]': {
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      },
      img: {
        WebkitTouchCallout: 'none',
        WebkitUserDrag: 'none',
      },
      // Installed app: no rubber-band bounce or browser pull-to-refresh — the
      // app's own PullToRefresh owns that gesture.
      '@media (display-mode: standalone)': {
        'html, body': {
          overscrollBehaviorY: 'none',
        },
      },
      // Phones: sheets rise from the bottom edge like native sheets.
      '@keyframes pb-sheet-in': {
        from: { transform: 'translateY(100%)' },
        to: { transform: 'translateY(0)' },
      },
      '@media screen and (max-width: 47.99em) and (prefers-reduced-motion: no-preference)': {
        '[data-pb-sheet]': {
          // `backwards` only: once finished the animation lets go of
          // `transform`, so drag-to-dismiss can move the sheet.
          animation: 'pb-sheet-in 340ms cubic-bezier(0.32, 0.72, 0, 1) backwards',
        },
      },
      body: {
        // Garante que o body use toda a altura disponível
        minHeight: '100dvh', // Dynamic viewport height para navegadores modernos
        // Previne scroll horizontal indesejado
        overflowX: 'hidden',
        // Estilos de tema
        bg: 'var(--pb-paper)',
        backgroundImage: 'var(--pb-canvas)',

        color: 'var(--pb-ink)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      },
      // Melhora a experiência de scroll em modais no iOS
      '.chakra-modal__content': {
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      },
      // The Chakra modal portal wrapper is `position: fixed; height: 100vh`
      // by default. On iOS Chrome / Safari, `100vh` is the URL-bar-hidden
      // height — when the URL bar is visible, the wrapper extends behind it
      // and the close button at the top of the modal can be clipped. Using
      // `100dvh` keeps the wrapper inside the visible viewport.
      '.chakra-modal__content-container': {
        '@supports (height: 100dvh)': {
          height: '100dvh',
        },
      },
    },
  },
  fonts: {
    // Grotesca sem serifa é a fonte PADRÃO da plataforma (títulos e corpo).
    heading: FONTS.display,
    body: FONTS.display,
    mono: FONTS.mono,
  },
  // Tokens de tipografia reutilizáveis. Use `textStyle="display"` (fonte
  // padrão) ou `"mono"` (labels/números) em vez de repetir
  // `fontFamily`. Carregam só a família — peso/tamanho/spacing ficam por conta
  // de cada componente, pois variam.
  textStyles: {
    display: { fontFamily: FONTS.display },
    body: { fontFamily: FONTS.display },
    mono: { fontFamily: FONTS.mono },
  },
  sizes: {
    appContent: '1720px',
  },
  colors: {
    brand: BRAND_COLOR_TOKENS,
  },
  semanticTokens: {
    colors: {
      'chakra-body-bg': { default: LIGHT_PALETTE.paper, _dark: DARK_PALETTE.paper },
      'chakra-body-text': { default: LIGHT_PALETTE.ink, _dark: DARK_PALETTE.ink },
      'chakra-border-color': { default: LIGHT_PALETTE.hair, _dark: DARK_PALETTE.hair },
    },
  },
  components: {
    // Apenas componentes essenciais que são realmente usados
    Card: {
      baseStyle: {
        container: {
          bg: 'var(--pb-surface)',
          borderColor: 'var(--pb-hair)',
          borderRadius: '2xl',
          boxShadow: 'var(--pb-shadow)',
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'var(--pb-modal)',
          color: 'var(--pb-ink)',
          borderRadius: '18px',
          border: '1px solid',
          borderColor: 'var(--pb-hair-2)',
          boxShadow: 'var(--pb-modal-shadow)',
          overflow: 'hidden',
        },
        overlay: {
          bg: 'var(--pb-overlay)',
          backdropFilter: 'blur(10px)',
        },
        header: {
          fontFamily: FONTS.display,
          fontWeight: 400,
          bg: 'var(--pb-header)',
          color: 'var(--pb-header-ink)',
        },
        footer: {
          borderTop: '1px solid',
          borderColor: 'var(--pb-hair)',
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: 'var(--pb-solid)',
          color: 'var(--pb-ink)',
          borderColor: 'var(--pb-hair-2)',
          boxShadow: 'var(--pb-shadow-lift)',
        },
        item: {
          bg: 'transparent',
          _focus: { bg: 'var(--pb-hover)' },
          _active: { bg: 'var(--pb-tint-green)' },
        },
      },
    },
    Popover: {
      baseStyle: {
        content: {
          bg: 'var(--pb-solid)',
          color: 'var(--pb-ink)',
          borderColor: 'var(--pb-hair-2)',
          boxShadow: 'var(--pb-shadow-lift)',
        },
      },
    },
    Button: {
      baseStyle: {
        _focusVisible: { boxShadow: '0 0 0 3px var(--pb-focus)' },
      },
    },
  },
})

export default theme
export { GRADIENTS }
