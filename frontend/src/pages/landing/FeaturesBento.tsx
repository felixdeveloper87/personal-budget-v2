import {
  Box,
  Grid,
  GridItem,
  HStack,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { SectionShell, fadeUp } from './shared'
import { FEATURES, type LandingFeature } from './landing.config'

const MotionGridItem = motion.create(GridItem)

const CHART_BARS = [0.38, 0.62, 0.48, 0.91, 0.55, 0.72, 0.44, 0.68, 0.5, 0.8]

export default function FeaturesBento() {
  const hero  = FEATURES.find((f) => f.variant === 'hero')!
  const cards = FEATURES.filter((f) => f.variant === 'card')

  return (
    <SectionShell
      id="features"
      bg={useColorModeValue('white', 'black')}
      pt={{ base: 4, md: 6, lg: 8 }}
      eyebrow="What's inside"
      title={<>A small toolkit, <br />ruthlessly polished.</>}
      subtitle="No bloated feature list. Just the few things that turn raw transactions into a calm dashboard you actually open every day."
    >
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        templateRows={{ base: 'auto', lg: 'auto auto' }}
        gap={{ base: 4, md: 5 }}
        w="full"
      >
        <MotionGridItem colSpan={{ base: 1, md: 2 }} rowSpan={{ base: 1, lg: 2 }} {...fadeUp}>
          <HeroCard feature={hero} />
        </MotionGridItem>

        {cards.map((f, i) => (
          <MotionGridItem
            key={f.id}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 + i * 0.07 }}
          >
            <FeatureCard feature={f} />
          </MotionGridItem>
        ))}
      </Grid>
    </SectionShell>
  )
}

/* -------------------------------------------------------------------------- */
/* Hero card                                                                   */
/* -------------------------------------------------------------------------- */

function HeroCard({ feature }: { feature: LandingFeature }) {
  const cardBg      = useColorModeValue('#ffffff', 'rgba(10,11,15,0.97)')
  const cardBorder  = useColorModeValue('rgba(0,0,0,0.07)', 'rgba(255,255,255,0.07)')
  const subText     = useColorModeValue('gray.600', 'gray.400')
  const titleColor  = useColorModeValue('gray.900', 'whiteAlpha.900')
  const chartBg     = useColorModeValue('gray.50', 'rgba(255,255,255,0.03)')
  const chartBorder = useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.06)')
  const statDivider = useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.06)')
  const statBg      = useColorModeValue('gray.50', 'rgba(255,255,255,0.03)')
  const statLabel   = useColorModeValue('gray.500', 'gray.500')

  return (
    <Box
      role="article"
      position="relative"
      h="full"
      minH={{ base: '340px', lg: '480px' }}
      p={{ base: 6, md: 8, lg: 10 }}
      borderRadius="2xl"
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      overflow="hidden"
      transition="all 0.35s cubic-bezier(0.32, 0.72, 0, 1)"
      _hover={{
        borderColor: feature.accent,
        boxShadow: `0 32px 64px -24px ${feature.accent}45`,
      }}
      sx={{
        '@keyframes growBarHero': {
          from: { transform: 'scaleY(0)', opacity: 0 },
          to:   { transform: 'scaleY(1)', opacity: 1 },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '.hero-bar': { animation: 'none !important', transform: 'scaleY(1) !important', opacity: '1 !important' },
        },
      }}
    >
      {/* Gradient blobs */}
      <Box
        aria-hidden
        position="absolute" right="-8%" top="-18%"
        w="55%" h="55%" borderRadius="full"
        bg={`radial-gradient(circle, ${feature.accent}60 0%, transparent 65%)`}
        filter="blur(55px)" opacity={0.65} pointerEvents="none"
      />
      <Box
        aria-hidden
        position="absolute" left="-6%" bottom="-12%"
        w="40%" h="40%" borderRadius="full"
        bg={`radial-gradient(circle, ${feature.accent}35 0%, transparent 65%)`}
        filter="blur(45px)" opacity={0.5} pointerEvents="none"
      />

      <VStack align="flex-start" spacing={5} h="full" position="relative" zIndex={1}>
        {/* Icon + title */}
        <HStack spacing={4} align="center">
          <Box position="relative" flexShrink={0}>
            <Box
              position="absolute" inset="-8px" borderRadius="2xl"
              bg={feature.accent} opacity={0.12} filter="blur(14px)" pointerEvents="none"
            />
            <Box
              p={3.5} borderRadius="xl"
              bg={`${feature.accent}1c`} color={feature.accent}
              border="1px solid" borderColor={`${feature.accent}38`}
              position="relative"
              boxShadow={`0 0 24px -6px ${feature.accent}55`}
            >
              <feature.icon size={26} weight="duotone" />
            </Box>
          </Box>
          <Heading
            as="h3" size="xl" color={titleColor}
            lineHeight={1.08} letterSpacing="-0.03em" maxW="400px"
          >
            {feature.title}
          </Heading>
        </HStack>

        <Text fontSize={{ base: 'md', md: 'lg' }} color={subText} maxW="480px" lineHeight={1.6}>
          {feature.description}
        </Text>

        {/* Mini bar chart */}
        <Box
          w="full" flex={1}
          borderRadius="xl"
          bg={chartBg} border="1px solid" borderColor={chartBorder}
          p={{ base: 3, md: 4 }}
        >
          <HStack justify="space-between" mb={3}>
            <Text fontSize="2xs" color={statLabel} fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
              Monthly overview
            </Text>
            <Box
              px={2} py={0.5} borderRadius="full"
              bg={`${feature.accent}18`} color={feature.accent}
              fontSize="2xs" fontWeight={800} letterSpacing="-0.01em"
            >
              +12.4%
            </Box>
          </HStack>
          <HStack spacing={1.5} align="flex-end" h={{ base: '52px', md: '64px' }}>
            {CHART_BARS.map((v, i) => {
              const isHighlight = i === 3 || i === 9
              return (
                <Box
                  key={i}
                  className="hero-bar"
                  flex={1}
                  h={`${Math.max(10, v * 100)}%`}
                  borderRadius="sm"
                  overflow="hidden"
                  position="relative"
                  transformOrigin="bottom"
                  boxShadow={isHighlight ? `0 4px 12px -4px ${feature.accent}80` : 'none'}
                  sx={{
                    animation: `growBarHero 0.55s cubic-bezier(0.32,0.72,0,1) ${i * 0.035 + 0.15}s both`,
                  }}
                >
                  <Box
                    position="absolute" inset={0}
                    bg={isHighlight
                      ? `linear-gradient(180deg, ${feature.accent} 0%, ${feature.accent}bb 100%)`
                      : `linear-gradient(180deg, ${feature.accent}55 0%, ${feature.accent}33 100%)`
                    }
                  />
                </Box>
              )
            })}
          </HStack>
        </Box>

        {/* Stats row */}
        <HStack
          spacing={0} w="full"
          borderRadius="xl"
          bg={statBg} border="1px solid" borderColor={statDivider}
          overflow="hidden"
        >
          {[
            { label: 'Updates', value: 'Realtime' },
            { label: 'Periods',  value: '4 levels' },
            { label: 'Export',   value: 'PDF ready' },
          ].map(({ label, value }, i) => (
            <VStack
              key={label}
              flex={1} spacing={0} py={3} px={2} align="center"
              borderLeft={i > 0 ? '1px solid' : 'none'}
              borderColor={statDivider}
            >
              <Text fontSize="2xs" color={statLabel} fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
                {label}
              </Text>
              <Text fontSize="sm" fontWeight={800} color={titleColor} letterSpacing="-0.02em">
                {value}
              </Text>
            </VStack>
          ))}
        </HStack>
      </VStack>
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Compact card                                                                */
/* -------------------------------------------------------------------------- */

function FeatureCard({ feature }: { feature: LandingFeature }) {
  const lightBg   = `linear-gradient(145deg, #ffffff 0%, ${feature.accent}09 100%)`
  const darkBg    = `linear-gradient(145deg, rgba(11,12,16,0.96) 0%, ${feature.accent}12 100%)`
  const cardBg    = useColorModeValue(lightBg, darkBg)
  const border    = useColorModeValue(`${feature.accent}28`, `${feature.accent}22`)
  const titleColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const subText    = useColorModeValue('gray.500', 'gray.400')
  const glowOp     = useColorModeValue(0.06, 0.1)

  return (
    <Box
      role="article"
      position="relative"
      h="full"
      p={{ base: 5, md: 6 }}
      borderRadius="2xl"
      bg={cardBg}
      border="1px solid"
      borderColor={border}
      overflow="hidden"
      transition="all 0.3s cubic-bezier(0.32, 0.72, 0, 1)"
      _hover={{
        transform: 'translateY(-3px)',
        borderColor: feature.accent,
        boxShadow: `0 24px 48px -18px ${feature.accent}55`,
      }}
    >
      {/* Corner glow blob */}
      <Box
        aria-hidden
        position="absolute" bottom="-28px" right="-28px"
        w="110px" h="110px" borderRadius="full"
        bg={feature.accent} opacity={glowOp}
        filter="blur(26px)" pointerEvents="none"
      />

      <VStack align="flex-start" spacing={4} h="full" position="relative" zIndex={1}>
        {/* Icon with halo */}
        <Box position="relative" display="inline-block">
          <Box
            position="absolute" inset="-7px" borderRadius="2xl"
            bg={feature.accent} opacity={0.1}
            filter="blur(12px)" pointerEvents="none"
          />
          <Box
            p={2.5} borderRadius="xl"
            bg={`${feature.accent}1c`} color={feature.accent}
            border="1px solid" borderColor={`${feature.accent}32`}
            position="relative"
            transition="transform 0.25s ease"
            _groupHover={{ transform: 'scale(1.08)' }}
          >
            <feature.icon size={20} weight="duotone" />
          </Box>
        </Box>

        <VStack align="flex-start" spacing={1.5} flex={1}>
          <Heading
            as="h3" size="sm" color={titleColor}
            letterSpacing="-0.02em" lineHeight={1.2}
          >
            {feature.title}
          </Heading>
          <Text fontSize="sm" color={subText} lineHeight={1.55}>
            {feature.description}
          </Text>
        </VStack>

        {/* Accent gradient bottom line */}
        <Box
          w="full" h="2px" borderRadius="full"
          bg={`linear-gradient(90deg, ${feature.accent}95, transparent)`}
          opacity={0.55}
        />
      </VStack>
    </Box>
  )
}
