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
    borderRadius: 'full', // Pill shape
    bg: sharedColors.background.glass,
    border: sharedColors.background.glassBorder,
    backdropFilter: sharedEffects.glass.backdropFilter,
    boxShadow: sharedEffects.shadows.md,
    px: { base: 2, md: 3 },
    py: { base: 1.5, md: 2 },
    transition: sharedTransitions.smooth,
    _hover: {
      backdropFilter: sharedEffects.glass.backdropFilterHover,
      boxShadow: sharedEffects.shadows.lg,
      transform: 'translateY(-1px)'
    }
  }
}

// Estilos do botão de busca mobile
export const getHeaderSearchButtonStyles = () => {
  const sharedColors = getSharedColors()

  return {
    variant: 'ghost' as const,
    bg: 'transparent',
    color: sharedColors.text.primary,
    borderRadius: 'full',
    _hover: {
      bg: sharedColors.background.glassHover,
      transform: sharedHoverEffects.scale.medium,
      color: 'blue.500'
    },
    transition: sharedTransitions.fast
  }
}

// Estilos do botão de tema
export const getThemeToggleStyles = () => {
  return {
    variant: 'ghost' as const,
    bg: useColorModeValue('gray.100', 'whiteAlpha.200'),
    color: useColorModeValue('gray.600', 'yellow.400'),
    borderRadius: 'full',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    _hover: {
      bg: useColorModeValue('gray.200', 'whiteAlpha.300'),
      transform: 'rotate(15deg) scale(1.1)',
      color: useColorModeValue('orange.500', 'yellow.300'),
      boxShadow: '0 0 15px rgba(255, 200, 0, 0.3)'
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }
}

// Estilos do botão de login
export const getLoginButtonStyles = () => {
  const loginGradient = useColorModeValue(
    'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  )

  return {
    bg: loginGradient,
    color: 'white',
    fontWeight: '700',
    px: { base: 5, md: 6 },
    py: { base: 0, md: 0 }, // Let height control vertical size
    height: '40px',
    borderRadius: 'full',
    letterSpacing: '0.02em',
    fontSize: { base: 'sm', lg: 'sm' },
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    _hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(37, 99, 235, 0.6)',
      filter: 'brightness(1.1)',
    },
    _active: {
      transform: 'translateY(0)',
      boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)'
    }
  }
}
