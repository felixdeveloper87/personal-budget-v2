import { Box, Text, HStack, VStack, Badge, useColorModeValue } from '@chakra-ui/react'
import { 
  getLogoIconStyles, 
  logoKeyframes, 
  getSymbolTextStyles, 
  getTitleStyles, 
  getBadgeStyles 
} from '../../ui'

interface LogoProps {
  user?: any
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

  return (
    <HStack spacing={{ base: 3, md: 4, lg: 5 }} flex="1" minW="fit-content">
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
          filter={useColorModeValue(
            "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
            "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5)) brightness(0.8)"
          )}
          display="flex"
          alignItems="center"
          justifyContent="center"
          lineHeight="1"
          minH="100%"
          minW="100%"
          sx={{
            ...getSymbolTextStyles(),
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
