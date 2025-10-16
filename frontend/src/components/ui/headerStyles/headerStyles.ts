import { useColorModeValue } from '@chakra-ui/react'
import { getSharedColors, sharedTransitions, sharedSizes, getSharedEffects, sharedHoverEffects } from '../sharedStyles'

// Estilos do container principal do HeaderControls
export const getHeaderControlsContainerStyles = () => {
  const sharedColors = getSharedColors()
  const sharedEffects = getSharedEffects()
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sharedSizes.borderRadius.md,
    bg: sharedColors.background.glass,
    border: sharedColors.background.glassBorder,
    backdropFilter: sharedEffects.glass.backdropFilter,
    boxShadow: sharedEffects.shadows.md,
    px: sharedSizes.padding.sm,
    py: { base: 1.5, md: 2 },
    transition: sharedTransitions.smooth,
    _hover: { backdropFilter: sharedEffects.glass.backdropFilterHover }
  }
}

// Estilos do botão de busca mobile
export const getHeaderSearchButtonStyles = () => {
  const sharedColors = getSharedColors()
  
  return {
    variant: 'ghost' as const,
    bg: 'transparent',
    color: sharedColors.text.primary,
    _hover: { 
      bg: sharedColors.background.glassHover, 
      transform: sharedHoverEffects.scale.medium
    },
    transition: sharedTransitions.fast
  }
}

// Estilos do botão de tema
export const getThemeToggleStyles = () => {
  return {
    variant: 'ghost' as const,
    bg: useColorModeValue(
      'linear-gradient(135deg, #e2e8f0, #cbd5e1)', // Modo claro: tons de lua
      'linear-gradient(135deg, #fef3c7, #fde68a)'  // Modo escuro: amarelo pastel para o sol
    ),
    color: useColorModeValue('gray.700', 'yellow.800'),
    borderRadius: sharedSizes.borderRadius.sm,
    boxShadow: 'md',
    _hover: {
      bg: useColorModeValue(
        'linear-gradient(135deg, #cbd5e1, #94a3b8)', // Modo claro: lua mais escura
        'linear-gradient(135deg, #fde68a, #fcd34d)'  // Modo escuro: amarelo pastel mais intenso
      ),
      transform: sharedHoverEffects.scale.medium,
      boxShadow: 'lg',
    },
    transition: sharedTransitions.fast
  }
}

// Estilos do botão de login
export const getLoginButtonStyles = () => {
  const loginGradient = useColorModeValue(
    'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(124,58,237,0.85), rgba(16,185,129,0.8))',
    'linear-gradient(135deg, rgba(96,165,250,0.85), rgba(167,139,250,0.8), rgba(52,211,153,0.75))'
  )
  const sharedEffects = getSharedEffects()
  
  return {
    bg: loginGradient,
    color: 'white',
    fontWeight: '900',
    px: { base: 6, md: 8 },
    py: { base: 3, md: 4 },
    borderRadius: sharedSizes.borderRadius.md,
    letterSpacing: 'wide',
    fontSize: { base: 'md', lg: 'lg' },
    boxShadow: '0 8px 25px rgba(59,130,246,0.3)',
    backdropFilter: 'blur(8px)',
    transition: sharedTransitions.slow,
    _hover: {
      transform: `${sharedHoverEffects.lift.medium} scale(1.06)`,
      boxShadow: sharedEffects.shadows.lg,
      filter: 'brightness(1.05)',
    },
    _active: { 
      transform: `${sharedHoverEffects.lift.small} scale(1.03)` 
    },
    sx: {
      animation: 'pulse 3s ease-in-out infinite',
      '@keyframes pulse': {
        '0%, 100%': { filter: 'brightness(1)' },
        '50%': { filter: 'brightness(1.2)' },
      },
    }
  }
}
