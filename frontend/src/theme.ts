import { extendTheme, ThemeConfig } from '@chakra-ui/react'

// 🎨 Gradientes centralizados
const GRADIENTS = {
  light: '#f2f0e6',
  dark: 'linear-gradient(180deg, #111113 0%, #0b0b0c 100%)',

  cardLight: 'linear-gradient(135deg, #ffffff 0%, #f3f9f6 100%)',
  cardDark: 'linear-gradient(135deg, #111113 0%, #0a0a0b 100%)',

  secondaryLight: 'linear-gradient(135deg, #ffffff 0%, #f8fcfa 100%)',
  secondaryDark: 'linear-gradient(135deg, #141416 0%, #1b1b1e 100%)',
} as const

// 🔤 Fontes da plataforma — fonte única de verdade.
// Os mesmos valores da skin editorial (ver src/editorial.tsx). Reusados abaixo
// em `fonts` (defaults do Chakra) e em `textStyles` (tokens reutilizáveis:
// textStyle="display" | "body" | "mono"), para não repetir a família em cada arquivo.
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
      // 👇 Estilos específicos para navegadores móveis (Safari/Chrome no iPhone)
      html: {
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
        bg: GRADIENTS.light,

        color: '#1a2620',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      },
      // Estilos para modo escuro
      '[data-theme="dark"] body': {
        bg: GRADIENTS.dark,
        color: '#f2f4f0',
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
    appContent: '1540px',
  },
  colors: {
    brand: {
      50: '#ecf8f1',
      100: '#d2eede',
      200: '#a8dcc0',
      300: '#74c39c',
      400: '#45a678',
      500: '#2d8a5f',
      600: '#1e6b4b',
      700: '#1e5a41',
      800: '#173f2f',
      900: '#122d23',
    },
  },
  components: {
    // Apenas componentes essenciais que são realmente usados
    Card: {
      baseStyle: (props: any) => ({
        container: {
          // Card translúcido (igual ao token `panel` do editorial) pra o backdrop
          // aparecer de leve nos dois modos, mantendo a leitura.
          bg: props.colorMode === 'dark' ? 'rgba(10, 10, 11, 0.88)' : 'rgba(255, 255, 255, 0.72)',
          borderColor: props.colorMode === 'dark' ? 'rgba(244, 246, 242, 0.12)' : 'rgba(26, 38, 32, 0.14)',
          borderRadius: '2xl',
          boxShadow: props.colorMode === 'dark'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
            : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 34px -22px rgba(28,55,40,0.28), 0 3px 10px rgba(28,55,40,0.05)',
          backdropFilter: props.colorMode === 'dark'
            ? 'blur(12px) saturate(115%)'
            : 'blur(16px) saturate(125%)',
        },
      }),
    },
    Modal: {
      baseStyle: (props: any) => ({
        dialog: {
          // Leve transparência + blur (vidro fosco): deixa o fundo aparecer
          // sutilmente sem atrapalhar a leitura. Igual ao token `modal` do editorial.
          bg: props.colorMode === 'dark' ? 'rgba(18, 18, 20, 0.92)' : 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(20px) saturate(140%)',
          color: props.colorMode === 'dark' ? '#f2f4f0' : '#1a2620',
          borderRadius: '18px',
          border: '1px solid',
          borderColor: props.colorMode === 'dark'
            ? 'rgba(244, 246, 242, 0.18)'
            : 'rgba(26, 38, 32, 0.18)',
          boxShadow: '0 32px 90px -28px rgba(0, 0, 0, 0.72)',
          overflow: 'hidden',
        },
        overlay: {
          bg: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(18px) saturate(115%)',
        },
        header: {
          fontFamily: FONTS.display,
          fontWeight: 400,
        },
        footer: {
          borderTop: '1px solid',
          borderColor: props.colorMode === 'dark'
            ? 'rgba(244, 246, 242, 0.10)'
            : 'rgba(26, 38, 32, 0.12)',
        },
      }),
    },
    AlertDialog: {
      baseStyle: (props: any) => ({
        dialog: {
          // Leve transparência + blur (vidro fosco): deixa o fundo aparecer
          // sutilmente sem atrapalhar a leitura. Igual ao token `modal` do editorial.
          bg: props.colorMode === 'dark' ? 'rgba(18, 18, 20, 0.92)' : 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(20px) saturate(140%)',
          color: props.colorMode === 'dark' ? '#f2f4f0' : '#1a2620',
          borderRadius: '18px',
          border: '1px solid',
          borderColor: props.colorMode === 'dark'
            ? 'rgba(244, 246, 242, 0.18)'
            : 'rgba(26, 38, 32, 0.18)',
          boxShadow: '0 32px 90px -28px rgba(0, 0, 0, 0.72)',
          overflow: 'hidden',
        },
        overlay: {
          bg: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(18px) saturate(115%)',
        },
        header: {
          fontFamily: FONTS.display,
          fontWeight: 400,
        },
        footer: {
          borderTop: '1px solid',
          borderColor: props.colorMode === 'dark'
            ? 'rgba(244, 246, 242, 0.10)'
            : 'rgba(26, 38, 32, 0.12)',
        },
      }),
    },
  },
})

export default theme

// Exportar gradientes para uso em outros componentes
export { GRADIENTS }
