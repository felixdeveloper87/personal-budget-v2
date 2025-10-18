import { extendTheme, ThemeConfig } from '@chakra-ui/react'

// 🎨 Gradientes centralizados
const GRADIENTS = {
  light: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)',
  dark: 'linear-gradient(135deg, #0F0F10 0%, #18181B 100%)',

  cardLight: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
  cardDark: 'linear-gradient(135deg, #111111 0%, #000000 100%)',

  secondaryLight: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
  secondaryDark: 'linear-gradient(135deg, #1E1E20 0%, #2A2A2D 100%)',
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

        color: '#0f172a',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      },
      // Estilos para modo escuro
      '[data-theme="dark"] body': {
        bg: GRADIENTS.dark,
        color: '#ffffff',
      },
      // Melhora a experiência de scroll em modais no iOS
      '.chakra-modal__content': {
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      },
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  components: {
    // Apenas componentes essenciais que são realmente usados
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === 'dark' ? GRADIENTS.cardDark : GRADIENTS.cardLight,
          borderColor: props.colorMode === 'dark' ? 'gray.800' : '#cbd5e1',
          borderRadius: '2xl',
          boxShadow: props.colorMode === 'dark'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        },
      }),
    },
    Modal: {
      baseStyle: (props: any) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? GRADIENTS.cardDark : GRADIENTS.cardLight,
          borderRadius: '2xl',
          border: props.colorMode === 'dark' ? '1px solid' : 'none',
          borderColor: props.colorMode === 'dark' ? 'gray.800' : 'transparent',
        },
        overlay: {
          bg: props.colorMode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.6)',
        },
      }),
    },
  },
})

export default theme

// Exportar gradientes para uso em outros componentes
export { GRADIENTS }

