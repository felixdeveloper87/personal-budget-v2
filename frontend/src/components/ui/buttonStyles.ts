import { useColorModeValue } from '@chakra-ui/react'

// Cores do logo para consistência visual
export const logoGradients = {
  light: 'linear-gradient(135deg, #e2e8f0, #94a3b8, #60a5fa, #3b82f6)',
  dark: 'linear-gradient(135deg, #f1f5f9, #cbd5e1, #93c5fd, #60a5fa)'
}

export const logoHoverGradients = {
  light: 'linear-gradient(135deg, #cbd5e1, #64748b, #3b82f6, #1d4ed8)',
  dark: 'linear-gradient(135deg, #e2e8f0, #94a3b8, #60a5fa, #3b82f6)'
}

// Estilos dos botões de navegação
export const getNavigationButtonStyles = (isSelected: boolean) => {
  const textColor = useColorModeValue('gray.800', 'white')
  
  return {
    variant: 'ghost' as const,
    fontWeight: '800',
    color: isSelected ? 'white' : textColor,
    bg: isSelected ? 
      useColorModeValue(logoGradients.light, logoGradients.dark) : 
      'transparent',
    _hover: {
      bg: isSelected ? 
        useColorModeValue(logoHoverGradients.light, logoHoverGradients.dark) :
        useColorModeValue(
          'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
          'linear-gradient(135deg, #334155, #475569)'
        ),
      color: isSelected ? 'white' : 'blue.500',
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: isSelected ? 
        useColorModeValue(
          '0 12px 35px rgba(148, 163, 184, 0.4), 0 6px 20px rgba(96, 165, 250, 0.3)',
          '0 12px 35px rgba(147, 197, 253, 0.5), 0 6px 20px rgba(96, 165, 250, 0.4)'
        ) : 
        useColorModeValue(
          '0 8px 25px rgba(0, 0, 0, 0.1)',
          '0 8px 25px rgba(0, 0, 0, 0.3)'
        )
    },
    boxShadow: isSelected ? 
      useColorModeValue(
        '0 8px 25px rgba(148, 163, 184, 0.3), 0 4px 15px rgba(96, 165, 250, 0.2)',
        '0 8px 25px rgba(147, 197, 253, 0.4), 0 4px 15px rgba(96, 165, 250, 0.3)'
      ) : 
      'none',
    borderRadius: '2xl',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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

// Estilos do botão de search
export const getSearchButtonStyles = () => {
  const textColor = useColorModeValue('gray.800', 'white')
  
  return {
    size: { lg: "sm", xl: "md" },
    px: { lg: 6, xl: 8 },
    fontWeight: '700',
    fontSize: { lg: "sm", xl: "md" },
    borderRadius: '2xl',
    variant: 'outline' as const,
    borderColor: useColorModeValue('gray.300', 'gray.600'),
    color: textColor,
    bg: useColorModeValue(
      'linear-gradient(135deg, #f8fafc, #e2e8f0, #f1f5f9)',
      'linear-gradient(135deg, #1e293b, #334155, #475569)'
    ),
    overflow: 'hidden',
    _before: {
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
    },
    _hover: {
      bg: useColorModeValue(
        'linear-gradient(135deg, #e2e8f0, #cbd5e1, #f1f5f9)',
        'linear-gradient(135deg, #334155, #475569, #64748b)'
      ),
      borderColor: 'blue.500',
      color: 'blue.500',
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: useColorModeValue(
        '0 10px 25px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1)',
        '0 10px 25px rgba(96, 165, 250, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
      ),
      _before: {
        left: '100%'
      }
    },
    _active: {
      transform: 'translateY(-1px) scale(1.01)',
      boxShadow: useColorModeValue(
        '0 6px 15px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)',
        '0 6px 15px rgba(96, 165, 250, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)'
      )
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: useColorModeValue(
      '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
      '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)'
    )
  }
}

// Container do botão de search
export const searchButtonContainerStyles = {
  flex: '1',
  maxW: { lg: "300px", xl: "400px" },
  display: { base: 'none', lg: 'flex' },
  justifyContent: 'center'
}

// Estilos do botão de search mobile
export const getMobileSearchButtonStyles = () => {
  const textColor = useColorModeValue('gray.800', 'white')
  
  return {
    display: { base: 'flex', lg: 'none' },
    'aria-label': 'Search',
    variant: 'ghost' as const,
    color: textColor,
    borderRadius: 'xl',
    position: 'relative' as const,
    overflow: 'hidden',
    _before: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: useColorModeValue(
        'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.15), transparent)',
        'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.25), transparent)'
      ),
      transition: 'left 0.6s ease'
    },
    _hover: {
      bg: useColorModeValue(
        'linear-gradient(135deg, #f1f5f9, #e2e8f0, #cbd5e1)',
        'linear-gradient(135deg, #374151, #4b5563, #6b7280)'
      ),
      color: 'blue.500',
      transform: 'translateY(-1px) scale(1.05)',
      boxShadow: useColorModeValue(
        '0 8px 20px rgba(59, 130, 246, 0.25), 0 3px 8px rgba(0, 0, 0, 0.1)',
        '0 8px 20px rgba(96, 165, 250, 0.35), 0 3px 8px rgba(0, 0, 0, 0.2)'
      ),
      _before: {
        left: '100%'
      }
    },
    _active: {
      transform: 'translateY(0px) scale(1.02)',
      boxShadow: useColorModeValue(
        '0 4px 12px rgba(59, 130, 246, 0.3), 0 1px 4px rgba(0, 0, 0, 0.1)',
        '0 4px 12px rgba(96, 165, 250, 0.4), 0 1px 4px rgba(0, 0, 0, 0.2)'
      )
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: useColorModeValue(
      '0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',
      '0 2px 6px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)'
    )
  }
}
