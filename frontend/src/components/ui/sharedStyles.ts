import { useColorModeValue } from '@chakra-ui/react'

// 🎨 Cores e gradientes compartilhados (funções que retornam valores)
export const getSharedColors = () => ({
  text: {
    primary: useColorModeValue('gray.800', 'white'),
    secondary: useColorModeValue('gray.600', 'whiteAlpha.700'),
    light: useColorModeValue('gray.500', 'whiteAlpha.500')
  },
  background: {
    glass: useColorModeValue('rgba(255,255,255,0.55)', 'rgba(17,25,40,0.45)'),
    glassHover: useColorModeValue('rgba(255,255,255,0.65)', 'rgba(255,255,255,0.15)'),
    glassBorder: useColorModeValue(
      '1px solid rgba(255,255,255,0.4)',
      '1px solid rgba(255,255,255,0.1)'
    )
  },
  gradients: {
    blue: {
      light: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      dark: 'linear-gradient(135deg, #60a5fa, #3b82f6)'
    },
    purple: {
      light: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      dark: 'linear-gradient(135deg, #a78bfa, #8b5cf6)'
    },
    gray: {
      light: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
      dark: 'linear-gradient(135deg, #334155, #475569)'
    }
  }
})

// 🔧 Transições e animações compartilhadas
export const sharedTransitions = {
  smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 0.2s ease',
  slow: 'all 0.4s cubic-bezier(0.4,0,0.2,1)'
}

// 📏 Tamanhos e espaçamentos compartilhados
export const sharedSizes = {
  borderRadius: {
    sm: 'xl',
    md: '2xl',
    lg: '3xl'
  },
  padding: {
    sm: { base: 2, md: 3 },
    md: { base: 3, md: 4 },
    lg: { base: 4, md: 6 }
  }
}

// 🎭 Efeitos visuais compartilhados
export const getSharedEffects = () => ({
  glass: {
    backdropFilter: 'blur(16px) saturate(180%)',
    backdropFilterHover: 'blur(18px) saturate(200%)'
  },
  shadows: {
    sm: useColorModeValue(
      '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
      '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)'
    ),
    md: useColorModeValue(
      '0 8px 25px rgba(0, 0, 0, 0.1)',
      '0 8px 25px rgba(0, 0, 0, 0.3)'
    ),
    lg: useColorModeValue(
      '0 12px 35px rgba(0, 0, 0, 0.15)',
      '0 12px 35px rgba(0, 0, 0, 0.4)'
    )
  }
})

// 🔄 Hover effects compartilhados
export const sharedHoverEffects = {
  scale: {
    small: 'scale(1.05)',
    medium: 'scale(1.1)',
    large: 'scale(1.15)'
  },
  lift: {
    small: 'translateY(-2px)',
    medium: 'translateY(-4px)',
    large: 'translateY(-6px)'
  }
}

// 📱 Responsive breakpoints compartilhados
export const sharedBreakpoints = {
  display: {
    mobileOnly: { base: 'flex', lg: 'none' },
    desktopOnly: { base: 'none', lg: 'flex' },
    always: 'flex'
  },
  textAlign: {
    mobileCenter: { base: 'center', sm: 'left' },
    mobileCenterDesktop: { base: 'center', md: 'left' }
  }
}
