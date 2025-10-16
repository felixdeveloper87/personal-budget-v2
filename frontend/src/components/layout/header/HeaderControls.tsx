import {
  HStack,
  IconButton,
  Button,
  Tooltip,
  useColorMode,
  useColorModeValue,
  Box,
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

interface HeaderControlsProps {
  user?: any
  onSearchOpen: () => void
  onLogin?: () => void
}

/**
 * 🌫️ HeaderControls (Liquid Glass Edition - Fixed aria-label)
 * - Modern, glassy header actions with safe accessibility and theme awareness.
 */
export default function HeaderControls({ user, onSearchOpen, onLogin }: HeaderControlsProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const responsive = getResponsiveStyles()

  return (
    <Box {...getHeaderControlsContainerStyles()}>
      <HStack spacing={{ base: 2, md: 3, lg: 4 }}>
        {/* 🔍 Search (mobile/tablet) */}
        {user && (
          <Tooltip label="Search" hasArrow>
            <IconButton
              icon={<SearchIcon />}
              aria-label="Open search"
              onClick={onSearchOpen}
              size={responsive.header.mobileIcons.search.size}
              fontSize={responsive.header.mobileIcons.search.fontSize}
              p={responsive.header.mobileIcons.search.padding}
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
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            aria-label="Toggle theme mode"
            onClick={toggleColorMode}
            size={responsive.header.mobileIcons.theme.size}
            fontSize={responsive.header.mobileIcons.theme.fontSize}
            p={responsive.header.mobileIcons.theme.padding}
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
