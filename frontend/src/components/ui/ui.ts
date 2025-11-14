/**
 * UI utilities and shared styles
 */
import { useColorModeValue } from '@chakra-ui/react'
import { GRADIENTS } from '../../theme'

// Animation utilities
export const animations = {
  shimmer: 'shimmer 4s ease-in-out infinite',
  slideIn: 'slideIn 0.6s ease-out',
  glow: 'glow 3s ease-in-out infinite',
  float: 'float 3s ease-in-out infinite',
  pulse: 'pulse 2s ease-in-out infinite'
} as const

// Shimmer animation keyframes and styles
export const shimmerStyles = {
  keyframes: {
    shimmer: {
      '0%': { backgroundPosition: '-150% 0' },
      '100%': { backgroundPosition: '150% 0' }
    }
  },
  backgroundSize: '200% 100%',
  animation: 'shimmer 4s ease-in-out infinite'
} as const

// Shimmer gradients for different color modes
export const shimmerGradients = {
  light: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.3), transparent)',
  dark: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.4), transparent)'
} as const

// Shimmer animations for different color modes
export const shimmerAnimations = {
  light: 'shimmer 8s ease-in-out infinite',
  dark: 'shimmer 6s ease-in-out infinite'
} as const

// Shimmer styles with theme-specific animations and gradients
export const getShimmerStyles = () => {
  const background = useColorModeValue(shimmerGradients.light, shimmerGradients.dark)
  const animation = useColorModeValue(shimmerAnimations.light, shimmerAnimations.dark)

  return {
    background,
    backgroundSize: shimmerStyles.backgroundSize,
    animation,
    ...shimmerStyles.keyframes
  }
}

// Gradient utilities
export const getGradients = () => ({
  primary: useColorModeValue(
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #60a5fa, #3b82f6)'
  ),
  background: useColorModeValue(GRADIENTS.light, GRADIENTS.dark),
  decorative: useColorModeValue(
    'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
    'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(16, 185, 129, 0.2) 100%)'
  )
})

// Modal header utilities
export const getModalHeaderStyles = (useColorModeValue: any) => {
  const responsiveStyles = getResponsiveStyles()
  
  return {
    container: {
      ...responsiveStyles.modals.header.container,
      borderColor: useColorModeValue(
        responsiveStyles.modals.header.container.borderColor.light,
        responsiveStyles.modals.header.container.borderColor.dark
      ),
      bg: useColorModeValue(
        responsiveStyles.modals.header.container.bg.light,
        responsiveStyles.modals.header.container.bg.dark
      ),
      sx: responsiveStyles.modals.header.container.sx
    },
    closeButton: {
      ...responsiveStyles.modals.header.closeButton,
      bg: useColorModeValue(
        responsiveStyles.modals.header.closeButton.bg.light,
        responsiveStyles.modals.header.closeButton.bg.dark
      ),
      borderColor: useColorModeValue(
        responsiveStyles.modals.header.closeButton.borderColor.light,
        responsiveStyles.modals.header.closeButton.borderColor.dark
      ),
      _hover: {
        ...responsiveStyles.modals.header.closeButton._hover,
        bg: useColorModeValue(
          responsiveStyles.modals.header.closeButton._hover.bg.light,
          responsiveStyles.modals.header.closeButton._hover.bg.dark
        )
      }
    },
    closeButtonIcon: {
      color: useColorModeValue(
        responsiveStyles.modals.header.closeButton.iconColor.light,
        responsiveStyles.modals.header.closeButton.iconColor.dark
      ),
      boxSize: responsiveStyles.modals.header.closeButton.iconSize
    },
    content: responsiveStyles.modals.header.content,
    iconContainer: {
      ...responsiveStyles.modals.header.iconContainer,
      bg: useColorModeValue(
        responsiveStyles.modals.header.iconContainer.bg.light,
        responsiveStyles.modals.header.iconContainer.bg.dark
      ),
      sx: responsiveStyles.modals.header.iconContainer.sx
    },
    title: {
      ...responsiveStyles.modals.header.title,
      bg: useColorModeValue(
        responsiveStyles.modals.header.title.bg.light,
        responsiveStyles.modals.header.title.bg.dark
      )
    },
    subtitle: {
      ...responsiveStyles.modals.header.subtitle,
      color: useColorModeValue(
        responsiveStyles.modals.header.subtitle.color.light,
        responsiveStyles.modals.header.subtitle.color.dark
      )
    },
    backButton: responsiveStyles.modals.header.backButton
  }
}

// Transaction-specific modal header utilities
export const getTransactionModalHeaderStyles = (useColorModeValue: any, type: 'INCOME' | 'EXPENSE') => {
  const responsiveStyles = getResponsiveStyles()
  
  // Cores específicas para cada tipo de transação
  const incomeGradient = useColorModeValue(
    'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 40%, #86efac 100%)', // Verde claro
    'linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%)'  // Verde escuro
  )
  
  const expenseGradient = useColorModeValue(
    'linear-gradient(135deg, #fecaca 0%, #fca5a5 40%, #f87171 100%)', // Vermelho claro
    'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%)'  // Vermelho escuro
  )
  
  return {
    container: {
      ...responsiveStyles.modals.header.container,
      borderColor: useColorModeValue(
        type === 'INCOME' ? 'green.200' : 'red.200',
        type === 'INCOME' ? 'green.700' : 'red.700'
      ),
      bg: type === 'INCOME' ? incomeGradient : expenseGradient,
      sx: responsiveStyles.modals.header.container.sx
    },
    closeButton: {
      ...responsiveStyles.modals.header.closeButton,
      bg: useColorModeValue(
        'rgba(255, 255, 255, 0.9)',
        'rgba(15, 23, 42, 0.9)'
      ),
      borderColor: useColorModeValue(
        type === 'INCOME' ? 'green.300' : 'red.300',
        type === 'INCOME' ? 'green.600' : 'red.600'
      ),
      _hover: {
        ...responsiveStyles.modals.header.closeButton._hover,
        bg: useColorModeValue('red.50', 'red.900'),
        borderColor: 'red.300'
      },
      iconColor: useColorModeValue('gray.700', 'gray.200')
    },
    content: responsiveStyles.modals.header.content,
    iconContainer: {
      ...responsiveStyles.modals.header.iconContainer,
      bg: useColorModeValue(
        type === 'INCOME' ? '#10b981' : '#ef4444',
        type === 'INCOME' ? '#22c55e' : '#dc2626'
      ),
      sx: responsiveStyles.modals.header.iconContainer.sx
    },
    title: {
      ...responsiveStyles.modals.header.title,
      color: useColorModeValue('gray.800', 'white')
    },
    subtitle: {
      ...responsiveStyles.modals.header.subtitle,
      color: useColorModeValue('gray.600', 'gray.300')
    },
    backButton: responsiveStyles.modals.header.backButton
  }
}

// Color utilities
export const getTypeColor = (type: 'INCOME' | 'EXPENSE') => {
  return useColorModeValue(
    type === 'INCOME' ? 'green.600' : 'red.600',
    type === 'INCOME' ? 'green.400' : 'red.400'
  )
}

export const getScrollbarStyles = (useColorModeValue: any) => ({
  // Safari iOS fix
  WebkitOverflowScrolling: 'touch',

  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
    display: 'block !important',
    WebkitAppearance: 'none'
  },

  '&::-webkit-scrollbar-thumb': {
    background: useColorModeValue('rgba(0,0,0,0.25)', 'rgba(255,255,255,0.25)'),
    borderRadius: '6px'
  },

  '&::-webkit-scrollbar-track': {
    background: useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.05)')
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

// Responsive utilities for all screen sizes (mobile, tablet, desktop)
export const getResponsiveStyles = () => ({
  // Breakpoints used across the application
  breakpoints: {
    mobile: '375px',    // iPhone 14 Pro width (base)
    mobileLarge: '414px', // iPhone 14 Pro Max width
    tablet: '768px',    // md breakpoint
    desktop: '1024px'   // lg breakpoint
  },
  modal: {
    maxH: { base: '100vh', md: '90vh' },
    h: { base: '100vh', md: 'auto' }
  },
  content: {
    maxH: { base: 'calc(100vh - 100px)', md: 'calc(90vh - 200px)', lg: 'calc(90vh - 180px)' },
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
    },
    action: {
      size: { base: 'sm', sm: 'md', md: 'lg' },
      height: { base: '36px', sm: '40px', md: '48px' },
      padding: { base: 3, sm: 4, md: 6 },
      fontSize: { base: 'xs', sm: 'sm', md: 'md' },
      minWidth: { base: '100px', sm: '120px', md: '140px' },
      iconSize: { base: 3, sm: 4, md: 5 },
      rightIconSize: { base: 2, sm: 3, md: 4 }
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
  summaryCards: {
    container: {
      padding: { base: 3, sm: 4, md: 6 }
    },
    grid: {
      columns: { base: 4, sm: 4, md: 4 },
      spacing: { base: 1, sm: 1.5, md: 4 }
    },
    card: {
      padding: { base: 2, sm: 3, md: 5 },
      spacing: { base: 1, sm: 2, md: 3 }
    },
    icon: {
      padding: { base: 1.5, sm: 2.5, md: 3 },
      size: { base: 4, sm: 5, md: 6 }
    },
    content: {
      spacing: { base: 1, sm: 1.5, md: 2 }
    },
    value: {
      fontSize: { base: 'md', sm: 'lg', md: 'xl', lg: '2xl' }
    },
    label: {
      fontSize: { base: '2xs', sm: 'xs', md: 'sm' }
    }
  },
  charts: {
    container: {
      padding: { base: 4, sm: 5, md: 6 },
      borderRadius: { base: 'xl', sm: '2xl' }
    },
    header: {
      spacing: { base: 2, sm: 3, md: 4 },
      icon: {
        padding: { base: 1.5, sm: 2, md: 2.5 },
        size: { base: 3, sm: 4, md: 4 }
      },
      title: {
        size: { base: 'sm', sm: 'md', md: 'lg' },
        fontSize: { base: 'xs', sm: 'sm', md: 'sm' }
      }
    },
    badges: {
      container: {
        spacing: { base: 2, sm: 3, md: 3 }
      },
      category: {
        padding: { base: 2, sm: 3, md: 3 },
        fontSize: { base: '2xs', sm: 'xs', md: 'xs' }
      },
      period: {
        padding: { base: 1.5, sm: 2, md: 2 },
        fontSize: { base: '3xs', sm: '2xs', md: '2xs' }
      }
    },
    button: {
      size: { base: 'xs', sm: 'sm', md: 'sm' },
      padding: { base: 2, sm: 3, md: 4 },
      fontSize: { base: '2xs', sm: 'sm', md: 'sm' },
      iconSize: { base: 3, sm: 4, md: 4 }
    },
    progress: {
      container: {
        spacing: { base: 3, sm: 4, md: 4 },
        padding: { base: 3, sm: 4, md: 4 }
      },
      item: {
        padding: { base: 3, sm: 4, md: 4 },
        spacing: { base: 2, sm: 3, md: 3 }
      },
      indicator: {
        size: { base: 2, sm: 3, md: 3 }
      },
      bar: {
        size: { base: 'sm', sm: 'md', md: 'lg' },
        height: { base: '6px', sm: '8px', md: '12px' }
      },
      text: {
        fontSize: { base: '2xs', sm: 'sm', md: 'sm' },
        valueFontSize: { base: '2xs', sm: 'sm', md: 'sm' },
        percentageFontSize: { base: '3xs', sm: 'xs', md: 'xs' }
      }
    },
    footer: {
      padding: { base: 3, sm: 4, md: 4 },
      spacing: { base: 2, sm: 2, md: 2 },
      iconSize: { base: 4, sm: 5, md: 5 },
      titleFontSize: { base: 'sm', sm: 'md', md: 'lg' },
      valueFontSize: { base: 'lg', sm: 'xl', md: '2xl' }
    },
    empty: {
      padding: { base: 6, sm: 8, md: 8 },
      iconPadding: { base: 3, sm: 4, md: 4 },
      iconSize: { base: 6, sm: 8, md: 8 },
      titleFontSize: { base: 'md', sm: 'lg', md: 'lg' },
      descriptionFontSize: { base: 'xs', sm: 'sm', md: 'sm' }
    }
  },
  modals: {
    // Standard modal header styles - used by AuthModal and SearchModal
    header: {
      container: {
        p: { base: 1.5, sm: 2, md: 3 },
        borderBottom: '1px',
        borderColor: { light: 'gray.200', dark: 'gray.700' },
        borderRadius: 'xl',
        position: 'relative' as const,
        bg: {
          light: `
            linear-gradient(135deg,
              rgba(245, 250, 255, 1) 0%,
              rgba(210, 230, 255, 0.95) 25%,
              rgba(130, 170, 255, 0.9) 65%,
              rgba(100, 140, 255, 1) 100%
            )`,
          dark: `
            linear-gradient(135deg,
              rgba(10, 25, 47, 1) 0%,
              rgba(15, 32, 58, 1) 35%,
              rgba(18, 40, 67, 1) 65%,
              rgba(22, 50, 84, 1) 100%
            )`
        },
        sx: {
          // Safe area support for iPhone 14 Pro
          paddingTop: 'max(16px, env(safe-area-inset-top, 0px))',
        }
      },
      closeButton: {
        position: 'absolute' as const,
        top: { base: 4, sm: 5, md: 6 },
        right: { base: 4, sm: 5, md: 6 },
        size: 'lg' as const,
        variant: 'ghost' as const,
        borderRadius: 'full',
        p: 3,
        bg: { light: 'rgba(255, 255, 255, 0.8)', dark: 'rgba(15, 23, 42, 0.8)' },
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: { light: 'gray.300', dark: 'gray.600' },
        _hover: {
          bg: { light: 'red.50', dark: 'red.900' },
          borderColor: 'red.300',
          transform: 'scale(1.1)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'scale(0.95)',
        },
        transition: 'all 0.2s ease',
        zIndex: 10,
        boxShadow: 'md',
        iconColor: { light: 'gray.700', dark: 'gray.200' },
        iconSize: 5
      },
      content: {
        direction: { base: 'column' as const, sm: 'row' as const },
        align: 'center' as const,
        justify: 'space-between' as const,
        gap: 4,
        pr: { base: 16, sm: 20, md: 20 } // Space for close button
      },
      iconContainer: {
        p: 3,
        borderRadius: '2xl',
        bg: {
          light: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          dark: 'linear-gradient(135deg, #60a5fa, #3b82f6)'
        },
        boxShadow: 'lg',
        sx: {
          animation: 'glow 3s ease-in-out infinite',
          '@keyframes glow': {
            '0%, 100%': {
              boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)'
            },
            '50%': {
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)'
            }
          }
        }
      },
      title: {
        fontSize: { base: 'lg', sm: 'xl', md: '2xl' },
        fontWeight: 800,
        bg: {
          light: 'linear-gradient(135deg, #0f172a, #1e293b)',
          dark: 'linear-gradient(135deg, #f1f5f9, #cbd5e1)'
        },
        bgClip: 'text'
      },
      subtitle: {
        fontSize: { base: 'xs', sm: 'sm' },
        color: { light: 'gray.700', dark: 'gray.200' },
        fontWeight: 500
      },
      backButton: {
        size: { base: 'sm', sm: 'md' },
        variant: 'ghost',
        borderRadius: 'full',
        _hover: {
          bg: 'blue.50',
          transform: 'translateX(-2px)',
          boxShadow: 'md',
        },
        transition: 'all 0.2s ease'
      }
    },
    // Legacy close button configuration for other modals
    closeButton: {
      position: 'absolute',
      top: { base: 4, sm: 5, md: 6 },
      right: { base: 4, sm: 5, md: 6 },
      size: 'lg',
      variant: 'ghost',
      borderRadius: 'full',
      padding: 3,
      bg: {
        light: 'rgba(255, 255, 255, 0.8)',
        dark: 'rgba(15, 23, 42, 0.8)'
      },
      backdropFilter: 'blur(10px)',
      border: '1px solid',
      borderColor: {
        light: 'gray.300',
        dark: 'gray.600'
      },
      hover: {
        bg: {
          light: 'red.50',
          dark: 'red.900'
        },
        borderColor: 'red.300',
        transform: 'scale(1.1)',
        boxShadow: 'lg'
      },
      active: {
        transform: 'scale(0.95)'
      },
      transition: 'all 0.2s ease',
      zIndex: 10,
      boxShadow: 'md',
      iconColor: {
        light: 'gray.700',
        dark: 'gray.200'
      },
      iconSize: 5
    },
    category: {
      container: {
        size: { base: 'full', sm: 'md', md: 'lg', lg: 'xl' },
        borderRadius: { base: 'none', sm: '3xl', md: '3xl' },
        maxW: { base: '100vw', sm: '95vw', md: '90vw', lg: '800px' },
        maxH: { base: '100dvh', sm: '85vh', md: '80vh' }
      },
      header: {
        padding: { base: 8, sm: 8, md: 8 },
        fontSize: { base: 'lg', sm: 'xl', md: '2xl' },
        iconPadding: { base: 2, sm: 2, md: 2 },
        iconSize: { base: 'lg', sm: 'lg', md: 'lg' },
        titleFontSize: { base: 'sm', sm: 'sm', md: 'sm' }
      },
      closeButton: {
        size: { base: 'lg', sm: 'lg', md: 'lg' },
        top: { base: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)', sm: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)', md: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' },
        right: { base: 4, sm: 6, md: 8 }
      },
      body: {
        padding: { base: 4, sm: 5, md: 6 }
      },
      categoryCard: {
        padding: { base: 4, sm: 5, md: 6 },
        spacing: { base: 3, sm: 3, md: 3 }
      },
      categoryHeader: {
        spacing: { base: 3, sm: 3, md: 3 },
        indicatorSize: { base: 4, sm: 4, md: 4 },
        titleFontSize: { base: 'md', sm: 'md', md: 'lg' },
        valueFontSize: { base: 'md', sm: 'md', md: 'lg' },
        percentageFontSize: { base: 'sm', sm: 'sm', md: 'sm' }
      },
      progress: {
        size: { base: 'md', sm: 'lg', md: 'lg' }
      },
      table: {
        headerFontSize: { base: 'xs', sm: 'sm', md: 'sm' },
        cellFontSize: { base: 'xs', sm: 'sm', md: 'sm' },
        padding: { base: 3, sm: 3, md: 3 }
      },
      button: {
        size: { base: 'sm', sm: 'sm', md: 'sm' },
        marginTop: { base: 3, sm: 3, md: 3 }
      },
      empty: {
        padding: { base: 4, sm: 6, md: 6 },
        titleFontSize: { base: 'md', sm: 'lg', md: 'lg' },
        descriptionFontSize: { base: 'sm', sm: 'sm', md: 'sm' }
      }
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
  },
  addTransactionSection: {
    container: {
      padding: { base: 2, sm: 3, md: 4, lg: 6 },
      safeArea: {
        paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(8px, env(safe-area-inset-right, 0px))'
      }
    },
    card: {
      padding: { base: 3, sm: 4, md: 6, lg: 8 },
      borderRadius: { base: '2xl', md: '3xl' },
      spacing: { base: 4, sm: 4, md: 5, lg: 6 }
    },
    header: {
      direction: { base: 'column' as const, sm: 'row' as const },
      gap: { base: 3, sm: 4, md: 6 },
      icon: {
        padding: { base: 2, sm: 2.5, md: 3 },
        size: { base: 4, sm: 5, md: 6 },
        borderRadius: { base: 'xl', md: '2xl' }
      },
      title: {
        size: { base: 'sm', sm: 'md', md: 'lg' },
        fontSize: { base: 'xs', sm: 'sm' },
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
        fontWeight: '700',
        letterSpacing: { base: '-0.01em', sm: '-0.015em', md: '-0.02em' },
        lineHeight: { base: '1.1', sm: '1.15', md: '1.2' }
      }
    },
    buttons: {
      direction: { base: 'row' as const, sm: 'row' as const },
      spacing: { base: 2, sm: 3, md: 4 },
      width: { base: 'full', sm: 'auto' },
      flex: { base: '1', sm: '0' },
      container: {
        spacing: { base: 2, sm: 3, md: 4, lg: 3 },
        justify: { base: 'center', sm: 'center', md: 'flex-end' },
        align: 'center',
        flexWrap: { base: 'wrap' as const, sm: 'nowrap' as const, md: 'nowrap' as const, lg: 'wrap' as const, xl: 'nowrap' as const },
        width: { base: 'full', sm: 'auto', md: 'auto', lg: 'full' }
      },
      button: {
        size: { base: 'sm', sm: 'sm', md: 'sm', lg: 'sm', xl: 'md', '2xl': 'lg' },
        height: { base: '32px', sm: '36px', md: '36px', lg: '32px', xl: '40px', '2xl': '48px' },
        minWidth: { base: '90px', sm: '100px', md: '100px', lg: '80px', xl: '110px', '2xl': '140px' },
        maxWidth: { base: '140px', sm: '140px', md: '140px', lg: '100px', xl: '140px', '2xl': 'none' },
        width: { base: 'calc(50% - 4px)', sm: 'auto', md: 'auto', lg: 'auto' },
        padding: { base: 2, sm: 3, md: 3, lg: 2, xl: 4, '2xl': 6 },
        fontSize: { base: 'xs', sm: 'xs', md: 'xs', lg: 'xs', xl: 'sm', '2xl': 'md' },
        iconSize: { base: 3, sm: 3.5, md: 3.5, lg: 3, xl: 3.5, '2xl': 5 },
        rightIconSize: { base: 2, sm: 2.5, md: 2.5, lg: 2, xl: 2.5, '2xl': 4 },
        textDisplay: {
          mobile: { base: 'block', sm: 'block', md: 'block', lg: 'block', xl: 'none', '2xl': 'none' },
          desktop: { base: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'block', '2xl': 'block' }
        }
      }
    }
  },
  installmentPlansSection: {
    container: {
      padding: { base: 2, sm: 3, md: 4, lg: 6 },
      safeArea: {
        paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(8px, env(safe-area-inset-right, 0px))'
      }
    },
    card: {
      padding: { base: 3, sm: 4, md: 5, lg: 6 },
      borderRadius: { base: '2xl', md: '3xl' },
      spacing: { base: 4, sm: 5, md: 6 }
    },
    header: {
      direction: { base: 'row' as const, sm: 'row' as const },
      gap: { base: 3, sm: 4, md: 4 },
      icon: {
        padding: { base: 2, sm: 2.5, md: 3 },
        size: { base: 4, sm: 5, md: 6 },
        borderRadius: { base: 'xl', md: '2xl' }
      },
      title: {
        size: { base: 'sm', sm: 'md', md: 'lg' },
        fontSize: { base: 'xs', sm: 'sm' },
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
        fontWeight: '700',
        letterSpacing: { base: '-0.01em', sm: '-0.015em', md: '-0.02em' },
        lineHeight: { base: '1.1', sm: '1.15', md: '1.2' }
      }
    },
    badge: {
      padding: { base: 3, sm: 4 },
      fontSize: { base: 'xs', sm: 'sm' },
      iconSize: { base: 2, sm: 3 },
      spacing: { base: 1, sm: 2 }
    },
    background: {
      top: { base: '-30px', md: '-50px' },
      left: { base: '-20px', md: '-50px' },
      right: { base: '-20px', md: '-50px' },
      height: { base: '120px', md: '200px' },
      borderRadius: { base: '2xl', md: '3xl' },
      filter: { base: 'blur(20px)', md: 'blur(40px)' },
      opacity: { base: 0.4, md: 0.6 }
    }
  }
})

// Section title styles - unified across all components
export const sectionTitleStyles = {
  size: { base: 'md', sm: 'lg', md: 'xl' },
  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
  fontWeight: '700',
  letterSpacing: { base: '-0.01em', sm: '-0.015em', md: '-0.02em' },
  lineHeight: { base: '1.1', sm: '1.15', md: '1.2' }
} as const

// Section header layout - unified across all components
export const sectionHeaderStyles = {
  container: {
    direction: { base: 'row' as const, sm: 'row' as const, md: 'row' as const },
    align: { base: 'center' as const, sm: 'center' as const, md: 'center' as const },
    justify: 'space-between',
    gap: { base: 3, sm: 4, md: 6 },
    w: 'full'
  },
  iconAndTitle: {
    direction: 'row' as const,
    align: 'center' as const,
    spacing: { base: 0.5, sm: 2, md: 3 },
    flex: '1',
    justify: 'flex-start'
  },
  icon: {
    padding: { base: 2, sm: 2.5, md: 3 },
    borderRadius: { base: 'xl', md: '2xl' },
    size: { base: 4, sm: 5, md: 6 },
    boxShadow: 'sm',
    hover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    transition: 'all 0.2s ease'
  },
  titleContainer: {
    align: { base: 'center', sm: 'start', md: 'start' },
    spacing: 1,
    flex: '1'
  }
} as const
