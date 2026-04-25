import {
  HStack,
  IconButton,
  Button,
  Tooltip,
  useColorMode,
  Box,
  useBreakpointValue,
} from '@chakra-ui/react'
import { SunIcon, MoonIcon, SearchIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { getResponsiveStyles } from '../../ui'
import {
  getHeaderControlsContainerStyles,
  getHeaderSearchButtonStyles,
  getLoginButtonStyles,
  getSharedEffects,
  sharedHoverEffects,
  sharedTransitions,
  getSharedColors
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
  const isCompactMobile = useBreakpointValue({ base: true, sm: false }) ?? false
  const ctaLabel = useBreakpointValue({
    base: 'Start',
    sm: 'Get Started',
    lg: 'Get Started Free',
  }) ?? 'Get Started'

  const sharedEffects = getSharedEffects()
  const sharedColors = getSharedColors()

  // Tamanhos para mobile (mesmos dos botões de navegação)
  const mobileButtonSize = isMobile ? {
    size: 'sm' as const,
    fontSize: 'sm',
    p: 2,
    minW: '26px',
    h: '36px'
  } : {
    size: responsive.header.mobileIcons.search.size,
    fontSize: responsive.header.mobileIcons.search.fontSize,
    p: responsive.header.mobileIcons.search.padding,
    minW: undefined,
    h: undefined
  }

  const buttonStyles = {
    ...getHeaderSearchButtonStyles(),
    boxShadow: sharedEffects.shadows.sm,
    bg: 'transparent',
    _hover: {
      bg: sharedColors.gradients.gray,
      color: 'blue.500',
      transform: `${sharedHoverEffects.lift.small} scale(1.05)`,
      boxShadow: sharedEffects.shadows.md
    },
    _active: {
      transform: `translateY(0px) scale(1.02)`,
      boxShadow: sharedEffects.shadows.sm
    },
    transition: sharedTransitions.smooth
  }

  const themeButtonSize = isCompactMobile
    ? {
        size: 'xs' as const,
        fontSize: 'xs',
        p: 1.5,
        minW: '32px',
        h: '32px',
      }
    : {
        size: mobileButtonSize.size,
        fontSize: mobileButtonSize.fontSize,
        p: mobileButtonSize.p,
        minW: '36px',
        h: '36px',
      }

  const loginButtonOverrides = isCompactMobile
    ? {
        h: '32px',
        minH: '32px',
        px: 3,
        fontSize: 'xs',
        borderRadius: 'full',
      }
    : {
        h: '36px',
        minH: '36px',
        px: 4,
        fontSize: 'sm',
      }

  const themeButtonStyles = {
    ...buttonStyles,
    border: '1px solid',
    borderColor: colorMode === 'light' ? 'gray.200' : 'whiteAlpha.200',
    bg: colorMode === 'light' ? 'white' : 'whiteAlpha.100',
    color: colorMode === 'light' ? 'gray.700' : 'yellow.300',
    _hover: {
      ...buttonStyles._hover,
      bg: colorMode === 'light' ? 'gray.50' : 'whiteAlpha.200',
      borderColor: colorMode === 'light' ? 'blue.200' : 'yellow.400',
      color: colorMode === 'light' ? 'blue.600' : 'yellow.200',
      transform: `${sharedHoverEffects.lift.small} scale(1.03)`,
    },
  }

  return (
    <Box
      {...getHeaderControlsContainerStyles()}
      flexShrink={0}
      px={{ base: 1.5, sm: 2, md: 3 }}
      py={{ base: 1, sm: 1.25, md: 2 }}
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
              {...buttonStyles}
              display={{ base: 'flex', xl: 'none' }}
            />
          </Tooltip>
        )}

        {/* 🌗 Theme Toggle */}
        <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} hasArrow>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon {...(isMobile && { boxSize: 4 })} /> : <SunIcon {...(isMobile && { boxSize: 4 })} />}
            aria-label="Toggle theme mode"
            onClick={toggleColorMode}
            size={themeButtonSize.size}
            fontSize={themeButtonSize.fontSize}
            p={themeButtonSize.p}
            minW={themeButtonSize.minW}
            h={themeButtonSize.h}
            {...themeButtonStyles}
          />
        </Tooltip>

        {/* 🚀 Login Button */}
        {!user && (
          <Button
            onClick={onLogin}
            {...getLoginButtonStyles()}
            {...loginButtonOverrides}
            rightIcon={isCompactMobile ? undefined : <ArrowForwardIcon />}
            border="1px solid"
            borderColor="whiteAlpha.400"
            boxShadow={sharedEffects.shadows.sm}
            _hover={{
              transform: `${sharedHoverEffects.lift.small} scale(1.02)`,
              boxShadow: sharedEffects.shadows.md,
              filter: 'brightness(1.08)',
            }}
            _active={{
              transform: 'translateY(0) scale(0.99)',
            }}
          >
            {ctaLabel}
          </Button>
        )}
      </HStack>
    </Box>
  )
}
