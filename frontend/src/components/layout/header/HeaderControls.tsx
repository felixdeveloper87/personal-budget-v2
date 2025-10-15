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
import { getResponsiveStyles } from '../../../utils/ui'
import { getMobileSearchButtonStyles } from '../../ui'

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

  const glassBg = useColorModeValue('rgba(255,255,255,0.55)', 'rgba(17,25,40,0.45)')
  const glassBorder = useColorModeValue(
    '1px solid rgba(255,255,255,0.4)',
    '1px solid rgba(255,255,255,0.1)'
  )
  const hoverBg = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(255,255,255,0.15)')
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900')

  const loginGradient = useColorModeValue(
    'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(124,58,237,0.85), rgba(16,185,129,0.8))',
    'linear-gradient(135deg, rgba(96,165,250,0.85), rgba(167,139,250,0.8), rgba(52,211,153,0.75))'
  )

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="2xl"
      bg={glassBg}
      border={glassBorder}
      backdropFilter="blur(16px) saturate(180%)"
      boxShadow={useColorModeValue(
        '0 8px 25px rgba(0, 0, 0, 0.05)',
        '0 8px 25px rgba(0, 0, 0, 0.3)'
      )}
      px={{ base: 2, md: 3 }}
      py={{ base: 1.5, md: 2 }}
      transition="all 0.35s ease-in-out"
      _hover={{ backdropFilter: 'blur(18px) saturate(200%)' }}
    >
      <HStack spacing={{ base: 2, md: 3, lg: 4 }}>
        {/* 🔍 Search (mobile/tablet) */}
        {user && (
          <Tooltip label="Search" hasArrow>
            <IconButton
              icon={<SearchIcon />}
              aria-label="Open search"
              onClick={onSearchOpen}
              variant="ghost"
              bg="transparent"
              color={textColor}
              _hover={{ bg: hoverBg, transform: 'scale(1.1)' }}
              transition="all 0.25s ease-in-out"
              size={responsive.header.mobileIcons.search.size}
              fontSize={responsive.header.mobileIcons.search.fontSize}
              p={responsive.header.mobileIcons.search.padding}
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
            variant="ghost"
            bg="transparent"
            color={textColor}
            borderRadius="xl"
            transition="all 0.3s ease-in-out"
            _hover={{
              bg: hoverBg,
              color: 'blue.400',
              transform: 'scale(1.1)',
            }}
            size={responsive.header.mobileIcons.theme.size}
            fontSize={responsive.header.mobileIcons.theme.fontSize}
            p={responsive.header.mobileIcons.theme.padding}
          />
        </Tooltip>

        {/* 🚀 Login Button */}
        {!user && (
          <Button
            onClick={onLogin}
            bg={loginGradient}
            color="white"
            fontWeight="900"
            px={{ base: 6, md: 8 }}
            py={{ base: 3, md: 4 }}
            borderRadius="2xl"
            letterSpacing="wide"
            fontSize={{ base: 'md', lg: 'lg' }}
            boxShadow="0 8px 25px rgba(59,130,246,0.3)"
            backdropFilter="blur(8px)"
            transition="all 0.4s cubic-bezier(0.4,0,0.2,1)"
            _hover={{
              transform: 'translateY(-4px) scale(1.06)',
              boxShadow: '0 12px 35px rgba(59,130,246,0.45)',
              filter: 'brightness(1.05)',
            }}
            _active={{ transform: 'translateY(-2px) scale(1.03)' }}
            sx={{
              animation: 'pulse 3s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { filter: 'brightness(1)' },
                '50%': { filter: 'brightness(1.2)' },
              },
            }}
          >
            Get Started
          </Button>
        )}
      </HStack>
    </Box>
  )
}
