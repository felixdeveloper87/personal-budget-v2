import {
  HStack,
  IconButton,
  Button,
  Tooltip,
  useColorMode,
  useColorModeValue,
  Box,
  useBreakpointValue,
} from '@chakra-ui/react'
import { SunIcon, MoonIcon, SearchIcon } from '@chakra-ui/icons'
import { getResponsiveStyles } from '../../ui'
import { 
  getHeaderControlsContainerStyles,
  getHeaderSearchButtonStyles,
  getThemeToggleStyles,
  getLoginButtonStyles,
  getMobileSearchButtonStyles
} from '../../ui'
import MobileNavigation from './MobileNavigation'

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
    p: 1.5,
    minW: '32px',
    h: '32px'
  } : {
    size: responsive.header.mobileIcons.search.size,
    fontSize: responsive.header.mobileIcons.search.fontSize,
    p: responsive.header.mobileIcons.search.padding,
    minW: undefined,
    h: undefined
  }

  return (
    <Box {...getHeaderControlsContainerStyles()}>
      <HStack spacing={{ base: 0.5, md: 3, lg: 4 }}>
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
              icon={<SearchIcon {...(isMobile && { boxSize: 3.5 })} />}
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
            icon={colorMode === 'light' ? <MoonIcon {...(isMobile && { boxSize: 3.5 })} /> : <SunIcon {...(isMobile && { boxSize: 3.5 })} />}
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
