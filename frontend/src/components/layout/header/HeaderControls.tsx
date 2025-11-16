import {
  HStack,
  IconButton,
  Button,
  Tooltip,
  useColorMode,
  Box,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react'
import { SunIcon, MoonIcon, SearchIcon } from '@chakra-ui/icons'
import { getResponsiveStyles } from '../../ui'
import { 
  getHeaderControlsContainerStyles,
  getHeaderSearchButtonStyles,
  getThemeToggleStyles,
  getLoginButtonStyles,
} from '../../ui'
import { getSharedColors, sharedTransitions, sharedSizes, getSharedEffects, sharedHoverEffects, sharedBreakpoints } from '../../ui/sharedStyles'
import MobileNavigation from './MobileNavigation'

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

// Estilos do botão de search mobile
const getMobileSearchButtonStyles = () => {
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

interface HeaderControlsProps {
  user?: any
  onSearchOpen: () => void
  onLogin?: () => void
  currentPage?: 'dashboard' | 'transactions' | 'charts'
  onPageChange?: (page: 'dashboard' | 'transactions' | 'charts') => void
}

/**
 * 🌫️ HeaderControls (Liquid Glass Edition - Fixed aria-label)
 * - Modern, glassy header actions with safe accessibility and theme awareness.
 */
export default function HeaderControls({ user, onSearchOpen, onLogin, currentPage, onPageChange }: HeaderControlsProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const responsive = getResponsiveStyles()
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Tamanhos para mobile (mesmos dos botões de navegação)
  const mobileButtonSize = isMobile ? {
    size: 'sm' as const,
    fontSize: 'sm',
    p: 2,
    minW: '36px',
    h: '36px'
  } : {
    size: responsive.header.mobileIcons.search.size,
    fontSize: responsive.header.mobileIcons.search.fontSize,
    p: responsive.header.mobileIcons.search.padding,
    minW: undefined,
    h: undefined
  }

  return (
    <Box 
      {...getHeaderControlsContainerStyles()}
      flexShrink={0}
    >
      <HStack spacing={{ base: 0.5, sm: 1, md: 2, lg: 3, xl: 4 }}>
        {/* 📱 Mobile Navigation */}
        <MobileNavigation 
          user={user} 
          currentPage={currentPage} 
          onPageChange={onPageChange} 
        />

        {/* 🔍 Search (mobile/tablet) */}
        {user && (
          <Tooltip label="Search" hasArrow>
            <IconButton
              icon={<SearchIcon {...(isMobile && { boxSize: 4 })} />}
              aria-label="Open search"
              onClick={onSearchOpen}
              size={mobileButtonSize.size}
              fontSize={mobileButtonSize.fontSize}
              p={mobileButtonSize.p}
              minW={mobileButtonSize.minW}
              h={mobileButtonSize.h}
              {...getHeaderSearchButtonStyles()}
              {...Object.fromEntries(
                Object.entries(getMobileSearchButtonStyles()).filter(
                  ([key]) => key !== 'aria-label'
                )
              )}
            />
          </Tooltip>
        )}

        {/* 🌗 Theme Toggle */}
        <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} hasArrow>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon {...(isMobile && { boxSize: 4 })} /> : <SunIcon {...(isMobile && { boxSize: 4 })} />}
            aria-label="Toggle theme mode"
            onClick={toggleColorMode}
            size={mobileButtonSize.size}
            fontSize={mobileButtonSize.fontSize}
            p={mobileButtonSize.p}
            minW={mobileButtonSize.minW}
            h={mobileButtonSize.h}
            {...getThemeToggleStyles()}
          />
        </Tooltip>

        {/* 🚀 Login Button */}
        {!user && (
          <Button
            onClick={onLogin}
            {...getLoginButtonStyles()}
          >
            Get Started
          </Button>
        )}
      </HStack>
    </Box>
  )
}
