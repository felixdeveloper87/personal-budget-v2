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
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from '../../components/ui/icons'
import DashboardPreview from './DashboardPreview'
import { Eyebrow, GlowOrb, GridLines, fadeUp } from './shared'
import { HERO_COPY } from './landing.config'

const MotionBox = motion.create(Box)

interface HeroProps {
  onGetStarted: () => void
}

export default function Hero({ onGetStarted }: HeroProps) {
  const bg = useColorModeValue(
    'linear-gradient(180deg, #f8fafc 0%, #ffffff 70%)',
    'linear-gradient(180deg, #0a0c10 0%, #06080b 70%)',
  )
  const bgImg = useColorModeValue('url(/hero_bg_premium_light.png)', 'url(/hero_bg_premium.png)')
  const overlayBg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(10, 12, 16, 0.75)')

  const titleColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const subColor = useColorModeValue('gray.600', 'gray.400')
  const bulletColor = useColorModeValue('gray.500', 'gray.400')
  const secondaryBtnBorder = useColorModeValue('gray.200', 'whiteAlpha.300')
  const secondaryBtnHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100')

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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: overlayBg,
        zIndex: 0
      }}
    >
      <GridLines />
      <MotionBox
        animate={{ 
          scale: [1, 1.1, 1], 
          opacity: [0.5, 0.8, 0.5],
          y: [0, -20, 0]
        }}
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
      <MotionBox
        animate={{ 
          scale: [1, 1.15, 1], 
          opacity: [0.4, 0.7, 0.4],
          y: [0, 20, 0]
        }}
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
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          gap={{ base: 12, lg: 16 }}
        >
          {/* Left — copy */}
          <MotionBox flex={1} maxW={{ base: 'full', lg: '560px' }} {...fadeUp}>
            <VStack align={{ base: 'center', lg: 'flex-start' }} spacing={6} textAlign={{ base: 'center', lg: 'left' }}>
              <Eyebrow>{HERO_COPY.eyebrow}</Eyebrow>

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
                <Text
                  as="span"
                  display="inline-block"
                  bgGradient="linear(120deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)"
                  bgClip="text"
                  pb={1}
                  sx={{
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {HERO_COPY.titleAccent}.
                </Text>
              </Box>

              <Text fontSize={{ base: 'md', md: 'lg' }} color={subColor} maxW="540px" lineHeight={1.55}>
                {HERO_COPY.subtitle}
              </Text>

              <HStack spacing={3} pt={2} flexWrap="wrap" justify={{ base: 'center', lg: 'flex-start' }}>
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
                  _hover={{
                    bgPosition: '100% 50%',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 18px 40px -12px rgba(79, 70, 229, 0.6)',
                  }}
                  _active={{ transform: 'translateY(0)' }}
                >
                  {HERO_COPY.primaryCta}
                </Button>
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
                  bg={useColorModeValue('white', 'transparent')}
                  backdropFilter="blur(10px)"
                >
                  {HERO_COPY.secondaryCta}
                </Button>
              </HStack>

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
            </VStack>
          </MotionBox>

          {/* Right — preview */}
          <MotionBox
            flex={1}
            w="full"
            display="flex"
            justifyContent={{ base: 'center', lg: 'flex-end' }}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
          >
            <MotionBox
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              w="full"
              display="flex"
              justifyContent={{ base: 'center', lg: 'flex-end' }}
            >
              <DashboardPreview />
            </MotionBox>
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  )
}
