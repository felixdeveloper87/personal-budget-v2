import { useColorModeValue } from '@chakra-ui/react'

// Gradientes do logo
export const logoGradients = {
  light: 'linear-gradient(135deg, #e2e8f0, #94a3b8, #60a5fa, #3b82f6)',
  dark: 'linear-gradient(135deg, #f1f5f9, #cbd5e1, #93c5fd, #60a5fa)'
}

// Sombras do logo
export const logoShadows = {
  light: '0 12px 30px rgba(107, 114, 128, 0.4), 0 6px 15px rgba(75, 85, 99, 0.3), 0 0 25px rgba(55, 65, 85, 0.2)',
  dark: '0 20px 50px rgba(147, 197, 253, 0.8), 0 8px 25px rgba(96, 165, 250, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)'
}

// Animações do logo
export const logoAnimations = {
  light: 'glow 4s ease-in-out infinite, float 5s ease-in-out infinite, pulse 3s ease-in-out infinite',
  dark: 'glow 2.5s ease-in-out infinite, float 3.5s ease-in-out infinite, pulse 1.8s ease-in-out infinite'
}

// Estilos do ícone do logo
export const getLogoIconStyles = () => {
  return {
    bg: useColorModeValue(logoGradients.light, logoGradients.dark),
    boxShadow: useColorModeValue(logoShadows.light, logoShadows.dark),
    animation: useColorModeValue(logoAnimations.light, logoAnimations.dark),
    borderRadius: '3xl',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'visible'
  }
}

// Keyframes para animações do logo (sem hooks)
export const logoKeyframes = {
  glow: {
    '0%, 100%': { 
      boxShadow: '0 12px 30px rgba(107, 114, 128, 0.4), 0 6px 15px rgba(75, 85, 99, 0.3), 0 0 25px rgba(55, 65, 85, 0.2)'
    },
    '50%': { 
      boxShadow: '0 16px 40px rgba(107, 114, 128, 0.6), 0 8px 20px rgba(75, 85, 99, 0.5), 0 0 35px rgba(55, 65, 85, 0.4)'
    }
  },
  glowDark: {
    '0%, 100%': { 
      boxShadow: '0 20px 50px rgba(147, 197, 253, 0.8), 0 8px 25px rgba(96, 165, 250, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)'
    },
    '50%': { 
      boxShadow: '0 25px 60px rgba(147, 197, 253, 0.9), 0 12px 35px rgba(96, 165, 250, 0.7), 0 0 50px rgba(59, 130, 246, 0.6), 0 0 80px rgba(147, 197, 253, 0.3)'
    }
  },
  float: {
    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
    '25%': { transform: 'translateY(-3px) rotate(1deg)' },
    '50%': { transform: 'translateY(-5px) rotate(0deg)' },
    '75%': { transform: 'translateY(-2px) rotate(-1deg)' }
  },
  pulse: {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' }
  }
}

// Estilos do texto do símbolo "£"
export const getSymbolTextStyles = () => {
  return {
    background: 'linear-gradient(45deg, #ffffff, #f0f9ff, #ffffff, #e0f2fe)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
  }
}

// Estilos do título "Personal Budget"
export const getTitleStyles = () => {
  return {
    bg: useColorModeValue(
      'linear-gradient(135deg, #1e293b, #475569, #64748b, #334155)',
      'linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1, #94a3b8)'
    ),
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
  }
}

// Estilos do badge "Free"
export const getBadgeStyles = () => {
  return {
    bg: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: 'white',
    fontSize: 'xs',
    fontWeight: 'bold',
    px: 2,
    py: 1,
    borderRadius: 'full',
    letterSpacing: 'wide',
    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
  }
}
