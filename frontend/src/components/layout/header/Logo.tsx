import { Badge, Box, HStack, Image, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import logoImage from '../../../../assets/logo.png'
import { BRAND } from './brand.config'

interface LogoProps {
  user?: any
  onClick?: () => void
}

export default function Logo({ user, onClick }: LogoProps) {
  const wordMuted = useColorModeValue('gray.700', 'gray.300')
  const wordBudgetGradient = useColorModeValue(
    'linear(to-r, #1d4ed8, #5b21b6)',
    'linear(to-r, #60a5fa, #a78bfa)',
  )
  const separatorColor = useColorModeValue('gray.300', 'whiteAlpha.400')
  const subtitleColor = useColorModeValue('gray.500', 'gray.500')
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

  const titleFontSize = { base: 'sm', sm: 'md', md: 'lg', lg: 'xl' } as const
  const sepFontSize = { base: 'xs', sm: 'sm', md: 'md', lg: 'md' } as const

  return (
    <HStack
      as="button"
      type="button"
      aria-label={`${BRAND.nameFull} — go to top`}
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

      <VStack
        align="flex-start"
        spacing={0}
        minW={0}
        flex={1}
        overflow="hidden"
        lineHeight="1.1"
      >
        <HStack
          align="baseline"
          spacing={0}
          minW={0}
          w="100%"
          flexWrap="nowrap"
        >
          <Text
            as="span"
            fontSize={titleFontSize}
            fontWeight={600}
            letterSpacing="-0.02em"
            color={wordMuted}
            noOfLines={1}
            minW={0}
            flexShrink={1}
          >
            {BRAND.nameFirst}
          </Text>

          <Text
            as="span"
            fontSize={sepFontSize}
            color={separatorColor}
            fontWeight={400}
            mx={{ base: 0.5, sm: 1 }}
            lineHeight="1"
            flexShrink={0}
            aria-hidden
          >
            ·
          </Text>

          <Text
            as="span"
            fontSize={titleFontSize}
            fontWeight={800}
            letterSpacing="-0.03em"
            bgGradient={wordBudgetGradient}
            bgClip="text"
            noOfLines={1}
            minW={0}
            flexShrink={1}
          >
            {BRAND.nameSecond}
          </Text>

          {!user && (
            <Badge
              fontSize="2xs"
              fontWeight={700}
              px={1.5}
              py={0.5}
              ml={1}
              rounded="full"
              textTransform="none"
              letterSpacing="0.02em"
              bg={badgeBg}
              color={badgeColor}
              border="1px solid"
              borderColor={badgeBorder}
              display={{ base: 'none', md: 'inline-flex' }}
              flexShrink={0}
            >
              Free
            </Badge>
          )}
        </HStack>

        <Text
          fontSize="2xs"
          fontWeight={500}
          color={subtitleColor}
          letterSpacing="0.04em"
          lineHeight="1.2"
          mt={0.5}
          noOfLines={2}
          display={{ base: 'none', lg: 'block' }}
          _dark={{ color: 'gray.500' }}
        >
          {BRAND.tagline}
        </Text>
      </VStack>
    </HStack>
  )
}
