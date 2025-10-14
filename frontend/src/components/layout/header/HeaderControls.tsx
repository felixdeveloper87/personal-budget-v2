import {
  HStack,
  IconButton,
  Button,
  Tooltip,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react'
import { SunIcon, MoonIcon, SearchIcon } from '@chakra-ui/icons'
import { getResponsiveStyles } from '../../../utils/ui'

interface HeaderControlsProps {
  user?: any
  onSearchOpen: () => void
  onLogin?: () => void
}

export default function HeaderControls({ user, onSearchOpen, onLogin }: HeaderControlsProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const responsiveStyles = getResponsiveStyles()
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <HStack spacing={{ base: 2, md: 3, lg: 4 }} flexShrink={0}>
      {/* Search (mobile/tablet only) */}
      {user && (
        <IconButton
          display={{ base: 'flex', lg: 'none' }}
          aria-label="Search"
          icon={<SearchIcon />}
          variant="ghost"
          size={responsiveStyles.header.mobileIcons.search.size}
          fontSize={responsiveStyles.header.mobileIcons.search.fontSize}
          p={responsiveStyles.header.mobileIcons.search.padding}
          color={textColor}
          onClick={onSearchOpen}
          borderRadius="lg"
          _hover={{
            bg: useColorModeValue('gray.100', 'gray.700'),
            color: 'blue.500'
          }}
        />
      )}

      {/* Theme Toggle */}
      <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
        <IconButton
          aria-label="toggle theme"
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
          size={responsiveStyles.header.mobileIcons.theme.size}
          fontSize={responsiveStyles.header.mobileIcons.theme.fontSize}
          p={responsiveStyles.header.mobileIcons.theme.padding}
          color={textColor}
          borderRadius="lg"
          _hover={{
            bg: useColorModeValue('gray.100', 'gray.700'),
            color: 'blue.500'
          }}
        />
      </Tooltip>

      {/* Login Button */}
      {!user && (
        <Button
          onClick={onLogin}
          size={{ base: "md", lg: "lg", xl: "lg" }}
          fontWeight="900"
          fontSize={{ base: "md", lg: "lg", xl: "xl" }}
          px={{ base: 6, md: 8, lg: 10, xl: 12 }}
          py={{ base: 3, md: 4, lg: 5, xl: 6 }}
          borderRadius="3xl"
          bg={useColorModeValue(
            'linear-gradient(135deg, #3b82f6, #1d4ed8, #7c3aed, #10b981)',
            'linear-gradient(135deg, #60a5fa, #3b82f6, #a78bfa, #34d399)'
          )}
          color="white"
          boxShadow={useColorModeValue(
            '0 12px 35px rgba(59, 130, 246, 0.4), 0 4px 15px rgba(124, 58, 237, 0.2)',
            '0 12px 35px rgba(96, 165, 250, 0.5), 0 4px 15px rgba(167, 139, 250, 0.3)'
          )}
          _hover={{
            transform: 'translateY(-4px) scale(1.08)',
            boxShadow: useColorModeValue(
              '0 20px 50px rgba(59, 130, 246, 0.5), 0 8px 25px rgba(124, 58, 237, 0.3)',
              '0 20px 50px rgba(96, 165, 250, 0.6), 0 8px 25px rgba(167, 139, 250, 0.4)'
            ),
            bg: useColorModeValue(
              'linear-gradient(135deg, #2563eb, #1e40af, #6d28d9, #059669)',
              'linear-gradient(135deg, #3b82f6, #2563eb, #8b5cf6, #10b981)'
            )
          }}
          _active={{
            transform: 'translateY(-2px) scale(1.04)',
          }}
          transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          letterSpacing="wide"
          sx={{
            animation: 'pulse 3s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { 
                boxShadow: useColorModeValue(
                  '0 12px 35px rgba(59, 130, 246, 0.4), 0 4px 15px rgba(124, 58, 237, 0.2)',
                  '0 12px 35px rgba(96, 165, 250, 0.5), 0 4px 15px rgba(167, 139, 250, 0.3)'
                )
              },
              '50%': { 
                boxShadow: useColorModeValue(
                  '0 16px 45px rgba(59, 130, 246, 0.6), 0 8px 25px rgba(124, 58, 237, 0.4)',
                  '0 16px 45px rgba(96, 165, 250, 0.7), 0 8px 25px rgba(167, 139, 250, 0.5)'
                )
              }
            }
          }}
        >
          Get Started
        </Button>
      )}
    </HStack>
  )
}
