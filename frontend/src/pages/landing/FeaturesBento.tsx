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
import type { LucideIcon } from '../../components/ui/icons'
import { SectionShell, fadeUp } from './shared'
import { FEATURES, type LandingFeature } from './landing.config'

const MotionGridItem = motion.create(GridItem)

export default function FeaturesBento() {
  const hero = FEATURES.find((f) => f.variant === 'hero')!
  const cards = FEATURES.filter((f) => f.variant === 'card')

  return (
    <SectionShell
      id="features"
      bg={useColorModeValue('white', 'black')}
      pt={{ base: 4, md: 6, lg: 8 }}
      eyebrow="What's inside"
      title={
        <>
          A small toolkit, <br />
          ruthlessly polished.
        </>
      }
      subtitle="No bloated feature list. Just the few things that turn raw transactions into a calm dashboard you actually open every day."
    >
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        templateRows={{ base: 'auto', lg: 'auto auto' }}
        gap={{ base: 4, md: 5 }}
        w="full"
      >
        {/* Hero card spans 2 cols x 2 rows on lg */}
        <MotionGridItem
          colSpan={{ base: 1, md: 2 }}
          rowSpan={{ base: 1, lg: 2 }}
          {...fadeUp}
        >
          <HeroCard feature={hero} />
        </MotionGridItem>

        {cards.map((f, i) => (
          <MotionGridItem
            key={f.id}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 + i * 0.06 }}
          >
            <FeatureCard feature={f} />
          </MotionGridItem>
        ))}
      </Grid>
    </SectionShell>
  )
}

/* -------------------------------------------------------------------------- */
/* Hero card — large, with floating icon constellation                        */
/* -------------------------------------------------------------------------- */

function HeroCard({ feature }: { feature: LandingFeature }) {
  const cardBg = useColorModeValue('white', 'rgba(255,255,255,0.03)')
  const cardBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const subText = useColorModeValue('gray.600', 'gray.400')
  const titleColor = useColorModeValue('gray.900', 'whiteAlpha.900')

  return (
    <Box
      role="article"
      position="relative"
      h="full"
      minH={{ base: '320px', lg: '460px' }}
      p={{ base: 6, md: 8, lg: 10 }}
      borderRadius="2xl"
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      overflow="hidden"
      transition="border-color 0.25s ease, transform 0.25s ease"
      _hover={{ borderColor: feature.accent }}
      sx={{
        '@keyframes floatDot': {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-8px,0)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '.bento-orbit': { animation: 'none !important' },
        },
      }}
    >
      {/* Background gradient blob */}
      <Box
        aria-hidden
        position="absolute"
        right="-10%"
        top="-20%"
        w="60%"
        h="60%"
        borderRadius="full"
        bg={`radial-gradient(circle, ${feature.accent}55 0%, transparent 65%)`}
        filter="blur(40px)"
        pointerEvents="none"
      />

      <VStack align="flex-start" spacing={4} h="full" position="relative" zIndex={1}>
        <HStack spacing={4} align="center" w="full">
          <Box
            p={3}
            borderRadius="xl"
            bg={`${feature.accent}1F`}
            color={feature.accent}
            border="1px solid"
            borderColor={`${feature.accent}33`}
            flexShrink={0}
          >
            <feature.icon size={24} weight="duotone" />
          </Box>

          <Heading
            as="h3"
            size="xl"
            color={titleColor}
            lineHeight={1.1}
            letterSpacing="-0.025em"
            maxW="420px"
          >
            {feature.title}
          </Heading>
        </HStack>

        <Text fontSize={{ base: 'md', md: 'lg' }} color={subText} maxW="480px" lineHeight={1.55}>
          {feature.description}
        </Text>

        <Box flex={1} />

        {/* Mini stat row, decorative */}
        <HStack
          spacing={4}
          pt={4}
          mt="auto"
          divider={
            <Box w="1px" h="32px" bg={useColorModeValue('gray.200', 'whiteAlpha.200')} />
          }
        >
          <MiniStat label="Updates" value="Realtime" />
          <MiniStat label="Charts" value="3 views" />
          <MiniStat label="Setup" value="0 config" />
        </HStack>
      </VStack>
    </Box>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  const subText = useColorModeValue('gray.500', 'gray.500')
  const text = useColorModeValue('gray.900', 'whiteAlpha.900')
  return (
    <VStack spacing={0} align="flex-start">
      <Text fontSize="2xs" color={subText} fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="md" fontWeight={800} color={text} letterSpacing="-0.02em">
        {value}
      </Text>
    </VStack>
  )
}

/* -------------------------------------------------------------------------- */
/* Compact card                                                                */
/* -------------------------------------------------------------------------- */

function FeatureCard({ feature }: { feature: LandingFeature }) {
  const cardBg = useColorModeValue('white', 'rgba(255,255,255,0.03)')
  const cardBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const subText = useColorModeValue('gray.600', 'gray.400')
  const titleColor = useColorModeValue('gray.900', 'whiteAlpha.900')

  return (
    <Box
      role="article"
      position="relative"
      h="full"
      p={{ base: 5, md: 6 }}
      borderRadius="2xl"
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      overflow="hidden"
      transition="all 0.25s cubic-bezier(0.32, 0.72, 0, 1)"
      _hover={{
        borderColor: feature.accent,
        transform: 'translateY(-2px)',
        boxShadow: `0 18px 40px -25px ${feature.accent}80`,
      }}
    >
      <VStack align="flex-start" spacing={3} h="full">
        <HStack spacing={3} align="center" w="full">
          <Box flexShrink={0}>
            <FeatureIconBadge icon={feature.icon} accent={feature.accent} />
          </Box>
          <Heading as="h3" size="sm" color={titleColor} letterSpacing="-0.015em" lineHeight={1.2}>
            {feature.title}
          </Heading>
        </HStack>
        <Text fontSize="sm" color={subText} lineHeight={1.5}>
          {feature.description}
        </Text>
      </VStack>
    </Box>
  )
}

function FeatureIconBadge({ icon, accent }: { icon: LucideIcon; accent: string }) {
  const FeatureIcon = icon

  return (
    <Box
      p={2}
      borderRadius="lg"
      bg={`${accent}1F`}
      color={accent}
      border="1px solid"
      borderColor={`${accent}33`}
    >
      <FeatureIcon size={18} weight="duotone" />
    </Box>
  )
}
