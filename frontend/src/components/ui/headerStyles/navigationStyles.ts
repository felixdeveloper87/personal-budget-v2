import { useColorModeValue } from '@chakra-ui/react'
import { getSharedColors, sharedTransitions, sharedSizes, getSharedEffects, sharedHoverEffects, sharedBreakpoints } from '../sharedStyles'

// Cores dos botões de navegação - Gradientes azul elegante
export const navigationGradients = {
  light: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  dark: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
}

export const navigationHoverGradients = {
  light: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
  dark: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
}

// Estilos dos botões de navegação
export const getNavigationButtonStyles = (isSelected: boolean) => {
  const sharedColors = getSharedColors()
  const sharedEffects = getSharedEffects()

  return {
    variant: 'ghost' as const,
    fontWeight: '600',
    fontSize: { base: 'sm', lg: 'md' },
    color: isSelected ? 'white' : sharedColors.text.primary,
    bg: isSelected ?
      useColorModeValue(navigationGradients.light, navigationGradients.dark) :
      'transparent',
    border: '1px solid',
    borderColor: isSelected ? 'transparent' : 'transparent',
    _hover: {
      bg: isSelected ?
        useColorModeValue(navigationHoverGradients.light, navigationHoverGradients.dark) :
        useColorModeValue('rgba(59, 130, 246, 0.08)', 'rgba(59, 130, 246, 0.15)'), // Glass hover
      color: isSelected ? 'white' : 'blue.500',
      transform: 'translateY(-1px)',
      boxShadow: isSelected ?
        '0 4px 12px rgba(37, 99, 235, 0.3)' :
        'none'
    },
    _active: {
      transform: 'translateY(0)',
      bg: isSelected ?
        useColorModeValue(navigationGradients.light, navigationGradients.dark) :
        useColorModeValue('rgba(59, 130, 246, 0.12)', 'rgba(59, 130, 246, 0.2)'),
    },
    boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none',
    borderRadius: 'full', // Pill shape
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.01em',
    height: 'auto',
    minH: '40px'
  }
}

// Tamanhos responsivos dos botões
export const navigationButtonSizes = {
  px: { md: 4, lg: 6 },
  py: { md: 2, lg: 2.5 }
}

// Estilos base para botões de search (compartilhado)
const getBaseSearchStyles = () => {
  const sharedColors = getSharedColors()

  return {
    fontWeight: '500',
    borderRadius: 'full', // Pill shape
    variant: 'outline' as const,
    borderColor: useColorModeValue('gray.200', 'gray.700'),
    color: sharedColors.text.secondary,
    bg: useColorModeValue('rgba(255, 255, 255, 0.5)', 'rgba(0, 0, 0, 0.2)'), // Glass bg
    backdropFilter: 'blur(8px)',
    _hover: {
      borderColor: 'blue.400',
      bg: useColorModeValue('white', 'gray.800'),
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
      color: 'blue.500',
      transform: 'translateY(-1px)'
    },
    _active: {
      transform: 'translateY(0)',
      boxShadow: 'none'
    },
    transition: 'all 0.2s ease',
    height: '40px'
  }
}

// Estilos do botão de search desktop
export const getSearchButtonStyles = () => ({
  ...getBaseSearchStyles(),
  width: { lg: "200px", xl: "260px" },
  justifyContent: 'flex-start',
  px: 4,
  fontSize: 'sm'
})

// Container do botão de search
export const searchButtonContainerStyles = {
  display: sharedBreakpoints.display.desktopOnly,
  alignItems: 'center',
  ml: 4
}

// Estilos do botão de search mobile
export const getMobileSearchButtonStyles = () => {
  return {
    display: { base: 'flex', md: 'none' },
    'aria-label': 'Search',
    variant: 'ghost' as const,
    rounded: 'full',
    color: useColorModeValue('gray.600', 'gray.400'),
    _hover: {
      bg: useColorModeValue('gray.100', 'whiteAlpha.200'),
      color: 'blue.500'
    }
  }
}
