import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from '../../components/ui/icons'
import DashboardPreview from './DashboardPreview'
import { Eyebrow, GlowOrb, GridLines } from './shared'
import { HERO_COPY } from './landing.config'

const MotionBox = motion.create(Box)

interface HeroProps {
  onGetStarted: () => void
}

const EASE = [0.32, 0.72, 0, 1] as const

function slideUp(delay: number, reduce: boolean) {
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3, delay: Math.min(delay, 0.1) },
    }
  }
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
  }
}

export default function Hero({ onGetStarted }: HeroProps) {
  const reduceMotion = Boolean(useReducedMotion())

  const bg = useColorModeValue(
    'linear-gradient(180deg, #f8fafc 0%, #ffffff 70%)',
    'linear-gradient(180deg, #0a0c10 0%, #06080b 70%)',
  )
  const bgImg = useColorModeValue('url(/hero_bg_premium_light.webp)', 'url(/hero_bg_premium.webp)')
  const overlayBg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(10, 12, 16, 0.75)')

  const titleColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const subColor = useColorModeValue('gray.600', 'gray.400')
  const bulletColor = useColorModeValue('gray.500', 'gray.400')
  const secondaryBtnBorder = useColorModeValue('gray.200', 'whiteAlpha.300')
  const secondaryBtnHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const secondaryBtnBg = useColorModeValue('white', 'transparent')
  const pulseColor = useColorModeValue('rgba(79,70,229,0.5)', 'rgba(99,102,241,0.6)')

  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      bg={bg}
      backgroundImage={bgImg}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment={{ base: 'scroll', md: 'fixed' }}
      pt={{ base: 14, md: 24, lg: 28 }}
      pb={{ base: 12, md: 16, lg: 20 }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        bg: overlayBg,
        zIndex: 0,
      }}
    >
      <GridLines />

      {/* Floating orb — top left */}
      <MotionBox
        animate={reduceMotion ? undefined : { scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        position="absolute"
        top="-180px"
        left="-200px"
        zIndex={0}
      >
        <GlowOrb
          color={useColorModeValue('rgba(59,130,246,0.45)', 'rgba(59,130,246,0.55)')}
          size="640px"
          intensity={1}
          position="relative"
        />
      </MotionBox>

      {/* Floating orb — right */}
      <MotionBox
        animate={reduceMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        position="absolute"
        top="40%"
        right="-160px"
        zIndex={0}
      >
        <GlowOrb
          color={useColorModeValue('rgba(139,92,246,0.4)', 'rgba(139,92,246,0.55)')}
          size="560px"
          intensity={1}
          position="relative"
        />
      </MotionBox>

      <Container
        maxW={{ base: '100%', xl: '1200px', '2xl': '1320px' }}
        px={{ base: 4, md: 8, lg: 12 }}
        position="relative"
        zIndex={1}
      >
        <Flex direction={{ base: 'column', lg: 'row' }} align="center" gap={{ base: 12, lg: 16 }}>

          {/* ── Left: copy with staggered entrance ── */}
          <Box flex={1} maxW={{ base: 'full', lg: '560px' }}>
            <VStack
              align={{ base: 'center', lg: 'flex-start' }}
              spacing={6}
              textAlign={{ base: 'center', lg: 'left' }}
            >
              {/* Eyebrow */}
              <MotionBox {...slideUp(0, reduceMotion)}>
                <Eyebrow>{HERO_COPY.eyebrow}</Eyebrow>
              </MotionBox>

              {/* Headline */}
              <MotionBox {...slideUp(0.1, reduceMotion)}>
                <Box
                  as="h1"
                  fontSize={{ base: '4xl', sm: '5xl', md: '6xl', lg: '6xl', xl: '7xl' }}
                  fontWeight={800}
                  letterSpacing="-0.04em"
                  lineHeight={1.02}
                  color={titleColor}
                >
                  <Text as="span" display="block">
                    {HERO_COPY.titlePrimary}{' '}
                  </Text>
                  {/* Gradient shimmer on the accent word */}
                  <Text
                    as="span"
                    display="inline-block"
                    bgGradient="linear(120deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)"
                    bgClip="text"
                    pb={1}
                    sx={{
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '200% auto',
                      animation: 'heroShimmer 5s linear infinite',
                      '@keyframes heroShimmer': {
                        '0%':   { backgroundPosition: '0% center' },
                        '100%': { backgroundPosition: '-200% center' },
                      },
                      '@media (prefers-reduced-motion: reduce)': {
                        animation: 'none',
                      },
                    }}
                  >
                    {HERO_COPY.titleAccent}.
                  </Text>
                </Box>
              </MotionBox>

              {/* Subtitle */}
              <MotionBox {...slideUp(0.2, reduceMotion)}>
                <Text fontSize={{ base: 'md', md: 'lg' }} color={subColor} maxW="540px" lineHeight={1.55}>
                  {HERO_COPY.subtitle}
                </Text>
              </MotionBox>

              {/* CTAs */}
              <MotionBox {...slideUp(0.3, reduceMotion)}>
                <HStack spacing={3} pt={2} flexWrap="wrap" justify={{ base: 'center', lg: 'flex-start' }}>
                  {/* Primary CTA with pulsing attention ring */}
                  <Box position="relative">
                    <MotionBox
                      position="absolute"
                      inset="-3px"
                      borderRadius="xl"
                      border="1.5px solid"
                      borderColor={pulseColor}
                      animate={reduceMotion ? undefined : { opacity: [0.7, 0, 0.7], scale: [1, 1.06, 1] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
                      pointerEvents="none"
                    />
                    <Button
                      size="lg"
                      onClick={onGetStarted}
                      rightIcon={<Icon as={ArrowRight} boxSize={4} weight="bold" />}
                      bg="linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)"
                      bgSize="200% 100%"
                      bgPosition="0% 50%"
                      color="white"
                      fontWeight={700}
                      px={6}
                      h="52px"
                      borderRadius="xl"
                      boxShadow="0 10px 30px -10px rgba(79, 70, 229, 0.5)"
                      transition="all 0.3s cubic-bezier(0.32, 0.72, 0, 1)"
                      overflow="hidden"
                      position="relative"
                      sx={{
                        // Subtle shine sweeping across the CTA every few seconds
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: 0,
                          width: '45%',
                          background:
                            'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)',
                          transform: 'translateX(-150%) skewX(-18deg)',
                          animation: 'ctaShine 4.5s ease-in-out 2s infinite',
                          pointerEvents: 'none',
                        },
                        '@keyframes ctaShine': {
                          '0%':        { transform: 'translateX(-150%) skewX(-18deg)' },
                          '35%, 100%': { transform: 'translateX(340%) skewX(-18deg)' },
                        },
                        '@media (prefers-reduced-motion: reduce)': {
                          '&::after': { animation: 'none', opacity: 0 },
                        },
                      }}
                      _hover={{
                        bgPosition: '100% 50%',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 18px 40px -12px rgba(79, 70, 229, 0.6)',
                      }}
                      _active={{ transform: 'translateY(0)' }}
                    >
                      {HERO_COPY.primaryCta}
                    </Button>
                  </Box>

                  <Button
                    size="lg"
                    variant="outline"
                    borderColor={secondaryBtnBorder}
                    color={titleColor}
                    fontWeight={600}
                    px={6}
                    h="52px"
                    borderRadius="xl"
                    onClick={() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    _hover={{ bg: secondaryBtnHoverBg, transform: 'translateY(-2px)' }}
                    transition="all 0.2s ease"
                    bg={secondaryBtnBg}
                    backdropFilter="blur(10px)"
                  >
                    {HERO_COPY.secondaryCta}
                  </Button>
                </HStack>
              </MotionBox>

              {/* Trust bullets */}
              <MotionBox {...slideUp(0.45, reduceMotion)}>
                <HStack spacing={5} pt={2} flexWrap="wrap" justify={{ base: 'center', lg: 'flex-start' }}>
                  {HERO_COPY.bullets.map((b) => (
                    <HStack key={b} spacing={2}>
                      <Icon as={CheckCircle2} boxSize={4} color="green.500" weight="duotone" />
                      <Text fontSize="sm" color={bulletColor} fontWeight={500}>
                        {b}
                      </Text>
                    </HStack>
                  ))}
                </HStack>
              </MotionBox>
            </VStack>
          </Box>

          {/* ── Right: preview slides in from the right ── */}
          <MotionBox
            flex={1}
            w="full"
            display="flex"
            justifyContent={{ base: 'center', lg: 'flex-end' }}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.96 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.85, ease: EASE, delay: 0.15 }}
          >
            <Box
              position="relative"
              w="full"
              display="flex"
              justifyContent={{ base: 'center', lg: 'flex-end' }}
              isolation="isolate"
              _before={{
                content: '""',
                position: 'absolute',
                inset: { base: '-8%', md: '-14%' },
                background: useColorModeValue(
                  'radial-gradient(circle at 65% 40%, rgba(99,102,241,0.24) 0%, rgba(59,130,246,0.12) 38%, transparent 72%)',
                  'radial-gradient(circle at 65% 40%, rgba(99,102,241,0.28) 0%, rgba(59,130,246,0.13) 40%, transparent 72%)',
                ),
                filter: 'blur(24px)',
                zIndex: -1,
                pointerEvents: 'none',
              }}
            >
              <DashboardPreview />
            </Box>
          </MotionBox>

        </Flex>
      </Container>
    </Box>
  )
}
