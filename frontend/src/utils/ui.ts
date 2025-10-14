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

// Scrollbar utilities
export const getScrollbarStyles = (useColorModeValue: any) => ({
  ...safariStyles.scrollbar,
  '&::-webkit-scrollbar-thumb': {
    background: useColorModeValue('rgba(0,0,0,0.2)', 'rgba(255,255,255,0.2)'),
    borderRadius: '4px',
    WebkitAppearance: 'none'
  },
  // Mobile Safari specific
  '@media screen and (max-width: 768px)': {
    WebkitOverflowScrolling: 'touch',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: '6px',
      display: 'block !important',
      WebkitAppearance: 'none'
    }
  }
})

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
  },
  scrollbar: {
    WebkitOverflowScrolling: 'touch' as const,
    overflowScrolling: 'touch' as const,
    // Force scrollbar on mobile Safari
    overflowY: 'scroll' as const,
    '&::-webkit-scrollbar': {
      width: '8px',
      display: 'block',
      WebkitAppearance: 'none'
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
      WebkitAppearance: 'none'
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '4px',
      WebkitAppearance: 'none',
      minHeight: '20px'
    }
  }
}

// Responsive table utilities
export const getTableStyles = () => ({
  container: {
    w: 'full',
    overflow: 'visible' as const
  },
  table: {
    variant: 'simple' as const,
    size: 'sm' as const,
    w: 'full'
  },
  columns: {
    date: {
      minW: { base: '100px', sm: '120px' },
      w: { base: '100px', sm: '120px' }
    },
    description: {
      // Flexível - ocupa espaço restante
    },
    amount: {
      minW: { base: '100px', sm: '120px' },
      w: { base: '100px', sm: '120px' }
    }
  }
})

// Mobile detection and responsive utilities - iPhone 14 Pro as mobile base
export const getResponsiveStyles = () => ({
  modal: {
    maxH: { base: '100vh', md: '90vh' },
    h: { base: '100vh', md: 'auto' }
  },
  content: {
    maxH: { base: 'calc(100vh - 100px)', md: 'none' },
    minH: '0'
  },
  spacing: {
    container: { base: 3, md: 5, lg: 6 },
    stack: { base: 3, md: 4, lg: 6 }
  },
  buttons: {
    category: {
      size: 'sm',
      height: '28px',
      padding: 2,
      fontSize: 'xs'
    },
    expand: {
      size: 'xs',
      height: '24px',
      padding: 1,
      fontSize: 'xs'
    }
  },
  categoryList: {
    spacing: { base: 2, md: 3 },
    header: {
      fontSize: { base: 'sm', md: 'lg' },
      marginBottom: { base: 2, md: 3 }
    },
    badge: {
      padding: { base: 1, md: 3 },
      fontSize: { base: 'xs', md: 'sm' }
    },
    controls: {
      fontSize: { base: 'xs', md: 'sm' },
      spacing: { base: 1, md: 2 }
    }
  },
  categoryCard: {
    header: {
      padding: { base: 3, md: 4 },
      fontSize: { base: 'sm', md: 'lg' },
      height: { base: '48px', md: 'auto' }
    },
    badge: {
      fontSize: { base: 'xs', md: 'sm' },
      padding: { base: 1, md: 2 }
    },
    amount: {
      fontSize: { base: 'md', md: 'xl' }
    },
    table: {
      fontSize: { base: 'xs', md: 'sm' },
      padding: { base: 2, md: 3 }
    }
  },
  header: {
    icon: {
      boxSize: { base: 7, md: 6 },
      padding: { base: 4, md: 3 }
    },
    closeButton: {
      size: { base: 'lg', md: 'lg' },
      padding: { base: 4, md: 3 },
      iconSize: { base: 6, md: 5 }
    },
    title: {
      fontSize: { base: 'lg', md: 'lg' }
    },
    subtitle: {
      fontSize: { base: 'sm', md: 'sm' }
    },
    mobileIcons: {
      search: {
        size: { base: 'md', lg: 'sm' },
        fontSize: { base: 'lg', lg: 'md' },
        padding: { base: 3, lg: 2 }
      },
      theme: {
        size: { base: 'md', lg: 'md' },
        fontSize: { base: 'lg', lg: 'lg' },
        padding: { base: 3, lg: 2 }
      },
      profile: {
        size: { base: 'md', lg: 'md' },
        fontSize: { base: 'lg', lg: 'md' },
        padding: { base: 2, lg: 2 },
        avatarSize: { base: 'md', lg: 'md' }
      }
    }
  }
})

// Common styles
export const commonStyles = {
  borderRadius: '2xl',
  shadow: 'lg',
  transition: 'all 0.2s ease'
} as const
