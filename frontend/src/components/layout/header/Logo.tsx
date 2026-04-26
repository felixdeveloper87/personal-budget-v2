import { Badge, Box, HStack, Image, Text, useColorModeValue } from '@chakra-ui/react'
import logoImage from '../../../../assets/logo.png'

interface LogoProps {
  user?: any
  onClick?: () => void
}

export default function Logo({ user, onClick }: LogoProps) {
  const accentColor = useColorModeValue('blue.500', 'blue.300')
  const subtitleColor = useColorModeValue('gray.500', 'gray.400')
  const titleGradient = useColorModeValue(
    'linear(to-br, gray.900, gray.700)',
    'linear(to-br, white, gray.300)',
  )
  const frameBg = useColorModeValue(
    'linear-gradient(135deg, #ffffff 0%, #eef2ff 50%, #e0e7ff 100%)',
    'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
  )
  const frameBorder = useColorModeValue('rgba(37, 99, 235, 0.18)', 'whiteAlpha.300')
  const frameShadow = useColorModeValue(
    '0 4px 14px rgba(37, 99, 235, 0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
    '0 6px 18px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
  )
  const frameHoverShadow = useColorModeValue(
    '0 8px 22px rgba(37, 99, 235, 0.28), inset 0 1px 0 rgba(255,255,255,0.95)',
    '0 10px 26px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.10)',
  )
  const glossOverlay = useColorModeValue(
    'radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)',
    'radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%)',
  )
  const badgeBg = useColorModeValue('blue.50', 'whiteAlpha.200')
  const badgeColor = useColorModeValue('blue.700', 'blue.100')
  const badgeBorder = useColorModeValue('blue.200', 'whiteAlpha.300')

  const handleClick = () => {
    if (onClick) return onClick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <HStack
      as="button"
      type="button"
      aria-label="Personal Budget — go to top"
      onClick={handleClick}
      spacing={{ base: 2, md: 2.5 }}
      role="group"
      cursor="pointer"
      minW={0}
      flexShrink={1}
      transition="transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)"
      _hover={{ transform: 'translateY(-1px)' }}
      _active={{ transform: 'translateY(0)' }}
      _focusVisible={{ outline: 'none' }}
    >
      <Box
        flexShrink={0}
        position="relative"
        p={{ base: 1.5, md: 2 }}
        bg={frameBg}
        border="1px solid"
        borderColor={frameBorder}
        rounded={{ base: 'lg', md: 'xl' }}
        boxShadow={frameShadow}
        backdropFilter="blur(8px)"
        overflow="hidden"
        transition="box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease"
        _groupHover={{
          transform: 'scale(1.05) rotate(-2deg)',
          boxShadow: frameHoverShadow,
        }}
        sx={{
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: glossOverlay,
            pointerEvents: 'none',
          },
        }}
      >
        <Image
          src={logoImage}
          alt=""
          boxSize={{ base: 6, md: 8 }}
          objectFit="contain"
          aria-hidden
          position="relative"
          zIndex={1}
        />
      </Box>

      <Box textAlign="left" minW={0} overflow="hidden">
        <HStack spacing={1.5} align="center" minW={0}>
          <Text
            fontSize={{ base: 'md', md: 'xl', lg: '2xl' }}
            fontWeight={800}
            letterSpacing="-0.025em"
            bgGradient={titleGradient}
            bgClip="text"
            lineHeight={1}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            minW={0}
          >
            <Box as="span" display={{ base: 'inline', sm: 'none' }}>
              Personal<Text as="span" color={accentColor}>.</Text>Budget
            </Box>
            <Box as="span" display={{ base: 'none', sm: 'inline' }}>
              Personal<Text as="span" color={accentColor}>.</Text>Budget
            </Box>
          </Text>
          {!user && (
            <Badge
              fontSize="2xs"
              fontWeight={700}
              px={1.5}
              py={0.5}
              rounded="full"
              textTransform="none"
              letterSpacing="0.02em"
              bg={badgeBg}
              color={badgeColor}
              border="1px solid"
              borderColor={badgeBorder}
              display={{ base: 'none', md: 'inline-flex' }}
            >
              Free
            </Badge>
          )}
        </HStack>
        <Text
          fontSize="2xs"
          fontWeight={600}
          color={subtitleColor}
          letterSpacing="0.18em"
          textTransform="uppercase"
          mt={0.5}
          display={{ base: 'none', lg: 'block' }}
        >
          Smart Financial Freedom
        </Text>
      </Box>
    </HStack>
  )
}
