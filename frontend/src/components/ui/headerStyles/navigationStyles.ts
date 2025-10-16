import { useColorModeValue } from '@chakra-ui/react'
import { getSharedColors, sharedTransitions, sharedSizes, getSharedEffects, sharedHoverEffects, sharedBreakpoints } from '../sharedStyles'

// Cores dos botões de navegação
export const navigationGradients = {
  light: 'linear-gradient(135deg,rgb(116, 176, 198),rgb(98, 191, 162),rgb(126, 188, 171),rgb(61, 115, 100))',
  dark: 'linear-gradient(135deg,rgb(147, 197, 253),rgb(134, 239, 172),rgb(131, 180, 157),rgb(110, 231, 183))'
}

export const navigationHoverGradients = {
  light: 'linear-gradient(135deg,rgb(98, 191, 162),rgb(117, 210, 183),rgb(61, 115, 100),rgb(52, 101, 88))',
  dark: 'linear-gradient(135deg,rgb(134, 239, 172),rgb(167, 243, 208),rgb(110, 231, 183),rgb(77, 201, 142))'
}

// Estilos dos botões de navegação
export const getNavigationButtonStyles = (isSelected: boolean) => {
  const sharedColors = getSharedColors()
  const sharedEffects = getSharedEffects()
  
  return {
    variant: 'ghost' as const,
    fontWeight: '800',
    color: isSelected ? 'white' : sharedColors.text.primary,
    bg: isSelected ? 
      useColorModeValue(navigationGradients.light, navigationGradients.dark) : 
      'transparent',
    _hover: {
      bg: isSelected ? 
        useColorModeValue(navigationHoverGradients.light, navigationHoverGradients.dark) :
        sharedColors.gradients.gray,
      color: isSelected ? 'white' : 'blue.500',
      transform: `${sharedHoverEffects.lift.small} scale(1.02)`,
      boxShadow: isSelected ? 
        sharedEffects.shadows.lg : 
        sharedEffects.shadows.md
    },
    boxShadow: isSelected ? sharedEffects.shadows.md : 'none',
    borderRadius: sharedSizes.borderRadius.md,
    transition: sharedTransitions.smooth,
    letterSpacing: 'wide'
  }
}

// Tamanhos responsivos dos botões
export const navigationButtonSizes = {
  size: { md: "md", lg: "lg", xl: "lg" },
  fontSize: { md: "md", lg: "lg", xl: "xl" },
  px: { md: 6, lg: 8, xl: 10 },
  py: { md: 3, lg: 4, xl: 5 }
}

// Estilos base para botões de search (compartilhado)
const getBaseSearchStyles = () => {
  const sharedColors = getSharedColors()
  const sharedEffects = getSharedEffects()
  
  return {
    fontWeight: '700',
    borderRadius: sharedSizes.borderRadius.md,
    variant: 'outline' as const,
    borderColor: useColorModeValue('gray.300', 'gray.600'),
    color: sharedColors.text.primary,
    bg: sharedColors.gradients.gray,
    overflow: 'hidden',
    sx: {
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: useColorModeValue(
          'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
          'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.2), transparent)'
        ),
        transition: 'left 0.5s ease'
      }
    },
    _hover: {
      bg: sharedColors.gradients.gray,
      borderColor: 'blue.500',
      color: 'blue.500',
      transform: `${sharedHoverEffects.lift.small} scale(1.02)`,
      boxShadow: sharedEffects.shadows.lg,
      sx: {
        '&::before': { left: '100%' }
      }
    },
    _active: {
      transform: `${sharedHoverEffects.lift.small} scale(1.01)`,
      boxShadow: sharedEffects.shadows.md
    },
    transition: sharedTransitions.smooth,
    boxShadow: sharedEffects.shadows.sm
  }
}

// Estilos do botão de search desktop
export const getSearchButtonStyles = () => ({
  ...getBaseSearchStyles(),
  size: { lg: "sm", xl: "md" },
  px: { lg: 6, xl: 8 },
  fontSize: { lg: "sm", xl: "md" }
})

// Container do botão de search
export const searchButtonContainerStyles = {
  flex: '1',
  maxW: { lg: "300px", xl: "400px" },
  display: sharedBreakpoints.display.desktopOnly,
  justifyContent: 'center'
}

// Estilos do botão de search mobile
export const getMobileSearchButtonStyles = () => {
  const baseStyles = getBaseSearchStyles()
  const sharedEffects = getSharedEffects()
  
  return {
    ...baseStyles,
    display: sharedBreakpoints.display.mobileOnly,
    'aria-label': 'Search',
    variant: 'ghost' as const,
    borderRadius: sharedSizes.borderRadius.sm,
    position: 'relative' as const,
    sx: {
      ...baseStyles.sx,
      '&::before': {
        ...baseStyles.sx?.['&::before'],
        background: useColorModeValue(
          'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.15), transparent)',
          'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.25), transparent)'
        ),
        transition: 'left 0.6s ease'
      }
    },
    _hover: {
      ...baseStyles._hover,
      transform: `${sharedHoverEffects.lift.small} scale(1.05)`,
      boxShadow: sharedEffects.shadows.md
    },
    _active: {
      transform: `translateY(0px) scale(1.02)`,
      boxShadow: sharedEffects.shadows.sm
    }
  }
}
