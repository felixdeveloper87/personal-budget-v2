import { Box, Text, HStack, VStack, Badge, useColorModeValue } from '@chakra-ui/react'

interface LogoProps {
  user?: any
}

// Gradientes do logo
const logoGradients = {
  light: 'linear-gradient(135deg, #e2e8f0, #94a3b8, #60a5fa, #3b82f6)',
  dark: 'linear-gradient(135deg, #f1f5f9, #cbd5e1, #93c5fd, #60a5fa)'
}

// Sombras do logo
const logoShadows = {
  light: '0 12px 30px rgba(107, 114, 128, 0.4), 0 6px 15px rgba(75, 85, 99, 0.3), 0 0 25px rgba(55, 65, 85, 0.2)',
  dark: '0 8px 20px rgba(147, 197, 253, 0.2), 0 4px 10px rgba(96, 165, 250, 0.15), 0 0 15px rgba(59, 130, 246, 0.1)'
}

// Animações do logo
const logoAnimations = {
  light: 'glow 4s ease-in-out infinite, float 5s ease-in-out infinite, pulse 3s ease-in-out infinite',
  dark: 'glow 6s ease-in-out infinite, float 7s ease-in-out infinite, pulse 5s ease-in-out infinite'
}

// Estilos do ícone do logo
const getLogoIconStyles = () => {
  return {
    bg: useColorModeValue(logoGradients.light, logoGradients.dark),
    boxShadow: useColorModeValue(logoShadows.light, logoShadows.dark),
    animation: useColorModeValue(logoAnimations.light, logoAnimations.dark),
    borderRadius: '3xl',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'visible'
  }
}

// Keyframes para animações do logo
const logoKeyframes = {
  glow: {
    '0%, 100%': { 
      boxShadow: '0 12px 30px rgba(107, 114, 128, 0.4), 0 6px 15px rgba(75, 85, 99, 0.3), 0 0 25px rgba(55, 65, 85, 0.2)'
    },
    '50%': { 
      boxShadow: '0 16px 40px rgba(107, 114, 128, 0.6), 0 8px 20px rgba(75, 85, 99, 0.5), 0 0 35px rgba(55, 65, 85, 0.4)'
    }
  },
  glowDark: {
    '0%, 100%': { 
      boxShadow: '0 8px 20px rgba(147, 197, 253, 0.2), 0 4px 10px rgba(96, 165, 250, 0.15), 0 0 15px rgba(59, 130, 246, 0.1)'
    },
    '50%': { 
      boxShadow: '0 12px 25px rgba(147, 197, 253, 0.3), 0 6px 15px rgba(96, 165, 250, 0.2), 0 0 20px rgba(59, 130, 246, 0.15)'
    }
  },
  float: {
    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
    '25%': { transform: 'translateY(-3px) rotate(1deg)' },
    '50%': { transform: 'translateY(-5px) rotate(0deg)' },
    '75%': { transform: 'translateY(-2px) rotate(-1deg)' }
  },
  pulse: {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' }
  }
}

// Estilos do texto do símbolo "£"
const getSymbolTextStyles = (isDark = false) => {
  return {
    background: isDark 
      ? 'linear-gradient(45deg, #ffffff, #f8fafc, #ffffff, #f1f5f9)'
      : 'linear-gradient(45deg, #ffffff, #f0f9ff, #ffffff, #e0f2fe)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: isDark 
      ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) brightness(1.2)' 
      : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
  }
}

/**
 * 💰 Logo Component
 * - Compact responsive logo for the app header
 * - Animates smoothly on hover (float, pulse, shimmer)
 * - Adapts for both light and dark color modes
 */
export default function Logo({ user }: LogoProps) {
  const glowKeyframes = useColorModeValue(logoKeyframes.glow, logoKeyframes.glowDark)
  const subtitleColor = useColorModeValue('gray.600', 'gray.300')
  const titleColor = useColorModeValue('gray.800', 'gray.100')
  const isDark = useColorModeValue(false, true)

  return (
    <HStack 
      spacing={{ base: 2, sm: 3, md: 4, lg: 5 }} 
      flex="1" 
      minW="fit-content"
      flexShrink={0}
      maxW={{ base: '50%', sm: '60%', md: 'auto' }}
    >
      {/* Symbol Iconn */}
      <Box
        as="button"
        w={{ base: 12, md: 16, lg: 20, xl: 24 }}
        h={{ base: 12, md: 16, lg: 20, xl: 24 }}
        flexShrink={0}
        {...getLogoIconStyles()}
        sx={{
          '@keyframes glow': glowKeyframes,
          '@keyframes float': logoKeyframes.float,
          '@keyframes pulse': logoKeyframes.pulse,
        }}
        _hover={{
          transform: 'translateY(-6px) scale(1.12)',
          cursor: 'pointer',
          '& > *': {
            transform: 'scale(1.2)',
            filter: 'brightness(1.25)',
          },
        }}
        _active={{
          transform: 'translateY(-3px) scale(1.08)',
        }}
        transition="all 0.25s ease-in-out"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Text
          fontSize={{ base: '2xl', md: '4xl', lg: '5xl', xl: '6xl' }}
          fontWeight="black"
          color="white"
          textShadow={useColorModeValue(
            "0 6px 12px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 255, 255, 0.5)",
            "0 6px 12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2)"
          )}
          display="flex"
          alignItems="center"
          justifyContent="center"
          lineHeight="1"
          minH="100%"
          minW="100%"
          sx={{
            ...getSymbolTextStyles(isDark),
            animation: 'shimmer 3s ease-in-out infinite',
            backgroundSize: '200% 200%',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' },
            },
          }}
        >
          £
        </Text>
      </Box>

      {/* Title + Subtitle */}
      <VStack spacing={0} align="start" minW={0} display={{ base: 'none', sm: 'flex' }}>
        <HStack spacing={2}>
          <Text
            fontSize={{ base: 'lg', md: 'xl', lg: '2xl', xl: '3xl' }}
            fontWeight="700"
            letterSpacing="wide"
            color={titleColor}
            fontFamily="system-ui, -apple-system, sans-serif"
            sx={{
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
            }}
          >
            Personal Budget
          </Text>

          {/* Show "Free" badge only for guests */}
          {!user && (
            <Badge 
              bg={useColorModeValue('#dcfce7', '#1f2937')} // Verde post-it
              color={useColorModeValue('green.600', 'green.300')}
              border="1px solid"
              borderColor={useColorModeValue('green.200', 'green.500')}
              fontSize="xs"
              fontWeight="500"
              px={2}
              py={1}
              borderRadius="xl"
              fontFamily="system-ui, -apple-system, sans-serif"
              textTransform="none"
            >
              Free
            </Badge>
          )}
        </HStack>

        <Text 
          fontSize={{ base: 'xs', lg: 'sm' }} 
          color={subtitleColor} 
          noOfLines={1}
          fontWeight="500"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          Financial Management
        </Text>
      </VStack>
    </HStack>
  )
}
