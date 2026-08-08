import { extendTheme, ThemeConfig } from '@chakra-ui/react'

// 🎨 Gradientes centralizados
const GRADIENTS = {
  light:
    'radial-gradient(circle at 12% -8%, rgba(255,255,255,0.96) 0%, transparent 36%), radial-gradient(circle at 100% 0%, rgba(38,115,90,0.035) 0%, transparent 30%), linear-gradient(145deg, #f8f9f7 0%, #f3f4f2 48%, #ecefeb 100%)',
  dark:
    'radial-gradient(circle at 88% -12%, rgba(55,150,125,0.08) 0%, transparent 32%), linear-gradient(180deg, #0c0f0e 0%, #080a09 58%, #060807 100%)',

  cardLight: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(247,248,246,0.94) 100%)',
  cardDark: 'linear-gradient(135deg, rgba(15,19,17,0.98) 0%, rgba(10,13,12,0.96) 100%)',

  secondaryLight: 'linear-gradient(135deg, #ffffff 0%, #f3f4f2 100%)',
  secondaryDark: 'linear-gradient(135deg, #101312 0%, #151a17 100%)',
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

        color: '#17201c',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      },
      // Estilos para modo escuro
      '[data-theme="dark"] body': {
        bg: GRADIENTS.dark,
        color: '#eff4f1',
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
    appContent: '1720px',
  },
  colors: {
    brand: {
      50: '#eef7f4',
      100: '#d5ece4',
      200: '#aad9c9',
      300: '#5fd0b5',
      400: '#42bd98',
      500: '#26735a',
      600: '#18513e',
      700: '#144536',
      800: '#10392d',
      900: '#0a2a22',
    },
  },
  components: {
    // Apenas componentes essenciais que são realmente usados
    Card: {
      baseStyle: (props: any) => ({
        container: {
          // Card translúcido (igual ao token `panel` do editorial) pra o backdrop
          // aparecer de leve nos dois modos, mantendo a leitura.
          bg: props.colorMode === 'dark' ? 'rgba(10, 13, 12, 0.94)' : 'rgba(255, 255, 255, 0.90)',
          borderColor: props.colorMode === 'dark' ? 'rgba(232, 242, 237, 0.09)' : 'rgba(23, 32, 28, 0.11)',
          borderRadius: '2xl',
          boxShadow: props.colorMode === 'dark'
            ? '0 1px 2px rgba(0,0,0,0.52), 0 14px 38px rgba(0,0,0,0.40)'
            : 'inset 0 1px 0 rgba(255,255,255,0.84), 0 1px 2px rgba(18,45,36,0.045), 0 12px 32px rgba(18,45,36,0.07)',
          backdropFilter: props.colorMode === 'dark'
            ? 'blur(14px) saturate(112%)'
            : 'blur(18px) saturate(112%)',
        },
      }),
    },
    Modal: {
      baseStyle: (props: any) => ({
        dialog: {
          // Leve transparência + blur (vidro fosco): deixa o fundo aparecer
          // sutilmente sem atrapalhar a leitura. Igual ao token `modal` do editorial.
          bg: props.colorMode === 'dark' ? 'rgba(13, 16, 15, 0.98)' : 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px) saturate(140%)',
          color: props.colorMode === 'dark' ? '#eff4f1' : '#17201c',
          borderRadius: '18px',
          border: '1px solid',
          borderColor: props.colorMode === 'dark'
            ? 'rgba(232, 242, 237, 0.17)'
            : 'rgba(24, 81, 62, 0.23)',
          boxShadow: props.colorMode === 'dark'
            ? '0 32px 90px -28px rgba(0, 0, 0, 0.78)'
            : '0 28px 80px -28px rgba(18, 45, 36, 0.28)',
          overflow: 'hidden',
        },
        overlay: {
          bg: props.colorMode === 'dark'
            ? 'rgba(2, 4, 3, 0.76)'
            : 'rgba(23, 32, 28, 0.30)',
          backdropFilter: 'blur(18px) saturate(115%)',
        },
        header: {
          fontFamily: FONTS.display,
          fontWeight: 400,
        },
        footer: {
          borderTop: '1px solid',
          borderColor: props.colorMode === 'dark'
            ? 'rgba(232, 242, 237, 0.09)'
            : 'rgba(23, 32, 28, 0.11)',
        },
      }),
    },
    AlertDialog: {
      baseStyle: (props: any) => ({
        dialog: {
          // Leve transparência + blur (vidro fosco): deixa o fundo aparecer
          // sutilmente sem atrapalhar a leitura. Igual ao token `modal` do editorial.
          bg: props.colorMode === 'dark' ? 'rgba(13, 16, 15, 0.98)' : 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px) saturate(140%)',
          color: props.colorMode === 'dark' ? '#eff4f1' : '#17201c',
          borderRadius: '18px',
          border: '1px solid',
          borderColor: props.colorMode === 'dark'
            ? 'rgba(232, 242, 237, 0.17)'
            : 'rgba(24, 81, 62, 0.23)',
          boxShadow: props.colorMode === 'dark'
            ? '0 32px 90px -28px rgba(0, 0, 0, 0.78)'
            : '0 28px 80px -28px rgba(18, 45, 36, 0.28)',
          overflow: 'hidden',
        },
        overlay: {
          bg: props.colorMode === 'dark'
            ? 'rgba(2, 4, 3, 0.76)'
            : 'rgba(23, 32, 28, 0.30)',
          backdropFilter: 'blur(18px) saturate(115%)',
        },
        header: {
          fontFamily: FONTS.display,
          fontWeight: 400,
        },
        footer: {
          borderTop: '1px solid',
          borderColor: props.colorMode === 'dark'
            ? 'rgba(232, 242, 237, 0.09)'
            : 'rgba(23, 32, 28, 0.11)',
        },
      }),
    },
  },
})

export default theme

// Exportar gradientes para uso em outros componentes
export { GRADIENTS }
