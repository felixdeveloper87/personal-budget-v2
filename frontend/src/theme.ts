import { extendTheme, ThemeConfig } from '@chakra-ui/react'
import { BRAND_COLORS, DARK_PALETTE, LIGHT_PALETTE, paletteCssVariables } from './palette'

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
  display: "'Instrument Serif', Georgia, serif",
  mono: "'Spline Sans Mono', ui-monospace, monospace",
} as const

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
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
      ':root': paletteCssVariables(LIGHT_PALETTE),
      '[data-theme="dark"]': paletteCssVariables(DARK_PALETTE),
      '::selection': {
        bg: 'var(--pb-sidebar-active-bg)',
        color: 'var(--pb-ink)',
      },
      // 👇 Estilos específicos para navegadores móveis (Safari/Chrome no iPhone)
      html: {
        colorScheme: 'light',
        // Suporte para safe areas em navegadores móveis
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        // Melhor scroll no iOS
        WebkitOverflowScrolling: 'touch',
        // Previne zoom indesejado no iOS
        touchAction: 'manipulation',
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
      // Estilos para modo escuro
      'html[data-theme="dark"]': { colorScheme: 'dark' },
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
    // A serifada editorial é a fonte PADRÃO da plataforma (títulos e corpo).
    heading: FONTS.display,
    body: FONTS.display,
    mono: FONTS.mono,
  },
  // Escala de tamanhos: subimos só os degraus PEQUENOS (~+1px), pois no serif
  // ficavam apertados. Títulos usam `lg`/`xl`/`2xl`+ (intactos, defaults Chakra).
  fontSizes: {
    '2xs': '0.6875rem', // 10 → 11px
    xs: '0.8125rem', // 12 → 13px
    sm: '1.05rem', // 14 → 15px
  },
  // Tokens de tipografia reutilizáveis. Use `textStyle="display"` (serifada
  // editorial, = padrão) ou `"mono"` (labels/números) em vez de repetir
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
    brand: BRAND_COLORS,
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
