/**
 * UI utilities and shared styles
 */
import { useColorModeValue } from '@chakra-ui/react'

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
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' }
    }
  },
  backgroundSize: '300% 100%',
  animation: 'shimmer 4s ease-in-out infinite'
} as const

// Shimmer gradients for different color modes
export const shimmerGradients = {
  light: 'linear-gradient(90deg, #000000, #ffffff, #6b7280, #000000, #f9fafb, #374151, #ffffff, #9ca3af)',
  dark: 'linear-gradient(90deg, #10b981, #60a5fa, #f87171, #a78bfa, #fbbf24)'
} as const

// Shimmer animations for different color modes
export const shimmerAnimations = {
  light: 'shimmer 12s ease-in-out infinite',
  dark: 'shimmer 4s ease-in-out infinite'
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

// Static shimmer styles that can be used in sx prop without hooks
export const shimmerStylesStatic = {
  backgroundSize: '300% 100%',
  keyframes: {
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' }
    }
  }
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
  // iPhone 14 Pro specific breakpoints
  breakpoints: {
    mobile: '375px',    // iPhone 14 Pro width
    mobileLarge: '414px', // iPhone 14 Pro Max width
    tablet: '768px',
    desktop: '1024px'
  },
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
      size: { base: 3, sm: 4, md: 5 }
    },
    content: {
      spacing: { base: 0.5, sm: 1, md: 1.5 }
    },
    value: {
      fontSize: { base: 'sm', sm: 'md', md: 'lg', lg: 'xl' }
    },
    label: {
      fontSize: { base: '3xs', sm: '2xs', md: 'xs' }
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
    // Standard close button configuration for all modals
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
      spacing: { base: 4, sm: 5, md: 6, lg: 8 }
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
        fontSize: { base: 'xs', sm: 'sm' }
      }
    },
    buttons: {
      direction: { base: 'row' as const, sm: 'row' as const },
      spacing: { base: 2, sm: 3, md: 4 },
      width: { base: 'full', sm: 'auto' },
      flex: { base: '1', sm: '0' }
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
        fontSize: { base: 'xs', sm: 'sm' }
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

// Common styles
export const commonStyles = {
  borderRadius: '2xl',
  shadow: 'lg',
  transition: 'all 0.2s ease'
} as const
