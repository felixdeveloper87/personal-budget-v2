/**
 * UI utilities and shared styles
 */
import { useColorModeValue } from '@chakra-ui/react'

// Animation utilities
export const animations = {
  shimmer: 'shimmer 4s ease-in-out infinite',
  slideIn: 'slideIn 0.6s ease-out',
  glow: 'glow 3s ease-in-out infinite',
  float: 'float 3s ease-in-out infinite'
} as const

// Gradient utilities
export const getGradients = () => ({
  primary: useColorModeValue(
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #60a5fa, #3b82f6)'
  ),
  background: useColorModeValue(
    'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
  ),
  decorative: useColorModeValue(
    'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
    'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(16, 185, 129, 0.2) 100%)'
  )
})

// Color utilities
export const getTypeColor = (type: 'INCOME' | 'EXPENSE') => {
  return useColorModeValue(
    type === 'INCOME' ? 'green.600' : 'red.600',
    type === 'INCOME' ? 'green.400' : 'red.400'
  )
}

// Safe area utilities
export const safeAreaStyles = {
  container: {
    paddingTop: 'max(16px, env(safe-area-inset-top, 0px))',
    paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
    paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
    paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
  },
  content: {
    paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
    paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
    paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
    WebkitOverflowScrolling: 'touch' as const,
  }
}

// Safari specific utilities
export const safariStyles = {
  modal: {
    WebkitOverflowScrolling: 'touch' as const,
    position: 'relative' as const,
  },
  scrollable: {
    WebkitOverflowScrolling: 'touch' as const,
    overflowScrolling: 'touch' as const,
  },
  sticky: {
    WebkitTransform: 'translateZ(0)' as const,
    transform: 'translateZ(0)' as const,
  },
  hardwareAcceleration: {
    WebkitTransform: 'translateZ(0)' as const,
    transform: 'translateZ(0)' as const,
  }
}

// Common styles
export const commonStyles = {
  borderRadius: '2xl',
  shadow: 'lg',
  transition: 'all 0.2s ease'
} as const
