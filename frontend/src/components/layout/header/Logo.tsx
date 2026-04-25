import { Box, Text, HStack, Badge, useColorModeValue, Image } from '@chakra-ui/react'
import logoImage from '../../../../assets/logo.png'

interface LogoProps {
  user?: any
}

export default function Logo({ user }: LogoProps) {
  const subtitleColor = useColorModeValue('gray.500', 'gray.400')
  const logoTextGradient = useColorModeValue(
    'linear(to-r, gray.900, gray.700)',
    'linear(to-r, white, gray.200)'
  )
  const accentColor = useColorModeValue('blue.500', 'blue.300')
  const logoFrameBg = useColorModeValue(
    'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(241,245,249,0.85))',
    'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))'
  )
  const logoFrameBorder = useColorModeValue('whiteAlpha.700', 'whiteAlpha.300')
  const logoFrameShadow = useColorModeValue(
    '0 10px 24px rgba(59, 130, 246, 0.22), 0 2px 8px rgba(15, 23, 42, 0.12)',
    '0 12px 28px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255,255,255,0.08)'
  )
  const logoFrameHoverShadow = useColorModeValue(
    '0 14px 30px rgba(59, 130, 246, 0.28), 0 4px 10px rgba(15, 23, 42, 0.16)',
    '0 16px 34px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(147,197,253,0.2)'
  )
  const logoGlow = useColorModeValue(
    'radial-gradient(circle, rgba(59,130,246,0.28) 0%, rgba(59,130,246,0) 70%)',
    'radial-gradient(circle, rgba(96,165,250,0.35) 0%, rgba(96,165,250,0) 72%)'
  )
  const logoImageDropShadow = useColorModeValue(
    'drop-shadow(0 2px 8px rgba(30, 64, 175, 0.28))',
    'drop-shadow(0 2px 8px rgba(147, 197, 253, 0.25))'
  )
  const freeBadgeBg = useColorModeValue('blue.50', 'whiteAlpha.200')
  const freeBadgeColor = useColorModeValue('blue.700', 'blue.100')
  const freeBadgeBorder = useColorModeValue('blue.200', 'whiteAlpha.300')

  return (
    <HStack
      spacing={{ base: 1.5, sm: 2, md: 3 }}
      as="button"
      type="button"
      aria-label="Go to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      cursor="pointer"
      _hover={{ 
        transform: 'translateY(-1px)'
      }}
      _active={{ transform: 'translateY(0)' }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      minW={0}
      flexShrink={1}
      role="group"
    >
      <Box
        p={{ base: 1.5, sm: 2, md: 2.5 }}
        bg={logoFrameBg}
        border="1px solid"
        borderColor={logoFrameBorder}
        rounded={{ base: 'lg', md: '2xl' }}
        position="relative"
        overflow="hidden"
        flexShrink={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow={logoFrameShadow}
        backdropFilter="blur(8px)"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _groupHover={{
          transform: 'translateY(-1px) scale(1.03)',
          boxShadow: logoFrameHoverShadow,
        }}
      >
        <Box
          position="absolute"
          inset="-45%"
          bg={logoGlow}
          opacity={0.7}
          transition="transform 0.5s ease, opacity 0.3s ease"
          _groupHover={{
            transform: 'scale(1.08)',
            opacity: 0.95,
          }}
        />
        <Image
          src={logoImage}
          alt="Personal Budget Logo"
          boxSize={{ base: 6, sm: 7, md: 9, lg: 10 }}
          objectFit="contain"
          position="relative"
          zIndex={1}
          filter={logoImageDropShadow}
          transition="transform 0.3s ease"
          _groupHover={{ transform: 'scale(1.05)' }}
        />
      </Box>

      <Box textAlign="left" minW={0} flexShrink={1}>
        <HStack spacing={1.5} align="center" flexWrap="nowrap">
          <Text
            fontSize={{ base: 'md', sm: 'lg', md: '2xl', lg: '3xl' }}
            fontWeight="900"
            letterSpacing="-0.03em"
            bgGradient={logoTextGradient}
            bgClip="text"
            lineHeight="1"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            <Text as="span" display={{ base: 'inline', sm: 'none' }}>
              P<Text as="span" color={accentColor}>.</Text> Budget
            </Text>
            <Text as="span" display={{ base: 'none', sm: 'inline' }}>
              Personal
              <Text as="span" color={accentColor}>.</Text>
              Budget
            </Text>
          </Text>
          {!user && (
            <Badge
              variant="subtle"
              fontSize={{ base: '3xs', sm: '2xs', md: 'xs' }}
              px={{ base: 1.5, sm: 1.5, md: 2 }}
              py={0.5}
              rounded="full"
              textTransform="none"
              letterSpacing="0.02em"
              fontWeight="600"
              bg={freeBadgeBg}
              color={freeBadgeColor}
              border="1px solid"
              borderColor={freeBadgeBorder}
              boxShadow="xs"
              flexShrink={0}
              display={{ base: 'none', sm: 'inline-flex' }}
            >
              Free
            </Badge>
          )}
        </HStack>
        <Text
          fontSize={{ base: '3xs', sm: '2xs', md: 'xs' }}
          fontWeight="600"
          color={subtitleColor}
          letterSpacing="0.15em"
          textTransform="uppercase"
          opacity={0.8}
          mt={0.5}
          display={{ base: 'none', md: 'block' }}
        >
          Smart Financial Freedom
        </Text>
      </Box>
    </HStack>
  )
}

