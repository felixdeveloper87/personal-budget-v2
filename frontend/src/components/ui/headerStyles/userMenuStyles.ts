import { useColorModeValue } from '@chakra-ui/react'
import { getSharedColors, getSharedEffects, sharedTransitions } from '../sharedStyles'

// 🎨 Gradientes específicos do user menu
export const userMenuGradients = {
  light: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.9))',
    header: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.06))',
    avatar: 'linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)',
    title: 'linear-gradient(135deg, #1e293b, #475569, #64748b)',
    badge: 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.4), transparent)'
  },
  dark: {
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.9))',
    header: 'linear-gradient(135deg, rgba(96, 165, 250, 0.12), rgba(167, 139, 250, 0.1))',
    avatar: 'linear-gradient(135deg, #60a5fa, #3b82f6, #2563eb)',
    title: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1)',
    badge: 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.6), rgba(167, 139, 250, 0.6), transparent)'
  }
}

// 🌟 Sombras específicas do user menu
export const userMenuShadows = {
  light: '0 25px 60px rgba(59, 130, 246, 0.2), 0 12px 35px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)',
  dark: '0 30px 70px rgba(96, 165, 250, 0.3), 0 15px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(96, 165, 250, 0.2)'
}

// 🎯 Estilos principais do user menu
export const getUserMenuStyles = () => {
  const sharedEffects = getSharedEffects()
  
  return {
    background: useColorModeValue(userMenuGradients.light.background, userMenuGradients.dark.background),
    boxShadow: useColorModeValue(userMenuShadows.light, userMenuShadows.dark),
    borderColor: useColorModeValue('rgba(59, 130, 246, 0.25)', 'rgba(96, 165, 250, 0.35)'),
    backdropFilter: sharedEffects.glass.backdropFilter,
    borderRadius: '2xl',
    overflow: 'hidden'
  }
}

// ✨ Estilos sx para pseudo-elementos do user menu
export const getUserMenuSxStyles = () => {
  return {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: useColorModeValue(userMenuGradients.light.shimmer, userMenuGradients.dark.shimmer),
      animation: 'shimmer 3s ease-in-out infinite'
    }
  }
}

// 🎨 Estilos do header do user menu
export const getUserMenuHeaderStyles = () => {
  return {
    background: useColorModeValue(userMenuGradients.light.header, userMenuGradients.dark.header),
    borderBottom: '1px solid',
    borderColor: useColorModeValue('rgba(59, 130, 246, 0.15)', 'rgba(96, 165, 250, 0.2)')
  }
}

// ✨ Estilos sx para pseudo-elementos do header
export const getUserMenuHeaderSxStyles = () => {
  return {
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: useColorModeValue(
        'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
        'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), transparent)'
      )
    }
  }
}

// 👤 Estilos do avatar do user menu
export const getUserMenuAvatarStyles = () => {
  return {
    background: useColorModeValue(userMenuGradients.light.avatar, userMenuGradients.dark.avatar),
    boxShadow: useColorModeValue(
      '0 8px 25px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(30, 58, 138, 0.3)',
      '0 12px 35px rgba(96, 165, 250, 0.5), 0 6px 18px rgba(37, 99, 235, 0.4)'
    ),
    border: '2px solid',
    borderColor: useColorModeValue('rgba(255, 255, 255, 0.3)', 'rgba(96, 165, 250, 0.3)')
  }
}

// ✨ Estilos sx para pseudo-elementos do avatar
export const getUserMenuAvatarSxStyles = () => {
  return {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: '-2px',
      borderRadius: 'inherit',
      background: useColorModeValue(
        'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
        'linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(96, 165, 250, 0.2))'
      ),
      zIndex: -1
    }
  }
}

// 📝 Estilos do título do user menu
export const getUserMenuTitleStyles = () => {
  return {
    background: useColorModeValue(userMenuGradients.light.title, userMenuGradients.dark.title),
    backgroundClip: 'text',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
    fontWeight: '800',
    letterSpacing: 'wide'
  }
}

// ✨ Estilos sx para propriedades WebKit do título
export const getUserMenuTitleSxStyles = () => {
  return {
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }
}

// 🏷️ Estilos do badge do user menu
export const getUserMenuBadgeStyles = () => {
  return {
    background: useColorModeValue(userMenuGradients.light.badge, userMenuGradients.dark.badge),
    color: 'white',
    boxShadow: 'none',
    border: '1px solid',
    borderColor: 'rgba(255, 255, 255, 0.2)'
  }
}

// ✨ Estilos sx para pseudo-elementos do badge
export const getUserMenuBadgeSxStyles = () => {
  return {
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: '-1px',
      borderRadius: 'inherit',
      background: 'transparent',
      zIndex: -1
    }
  }
}

// 📱 Estilos dos botões de navegação mobile
export const getMobileNavButtonStyles = (isActive: boolean) => {
  return {
    color: isActive ? 'blue.500' : 'inherit',
    fontWeight: isActive ? '700' : '500',
    display: { base: 'flex', md: 'none' },
    bg: isActive ? 
      useColorModeValue('rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.2)') : 
      'transparent',
    _hover: { 
      bg: useColorModeValue('rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.2)'),
      color: 'blue.500'
    },
    px: 6,
    py: 3,
    borderRadius: 'none'
  }
}
