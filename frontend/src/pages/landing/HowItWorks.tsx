import {
  Box,
  Grid,
  GridItem,
  Heading,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { SectionShell, fadeUp } from './shared'
import { STEPS } from './landing.config'

const MotionGridItem = motion.create(GridItem)

export default function HowItWorks() {
  const bg = useColorModeValue(
    'linear-gradient(180deg, #f8fafc 0%, #ffffff 70%)',
    'linear-gradient(180deg, #0a0c10 0%, #06080b 70%)',
  )
  const bgImg = useColorModeValue('url(/hero_bg_premium_light.webp)', 'url(/hero_bg_premium.webp)')
  const overlayBg = useColorModeValue(
    'linear-gradient(180deg, #ffffff 0%, #ffffff 260px, rgba(255, 255, 255, 0.85) 100%)',
    'linear-gradient(180deg, #0a0c10 0%, #0a0c10 260px, rgba(10, 12, 16, 0.75) 100%)'
  )

  const lineColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const lineActive = useColorModeValue(
    'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
    'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)',
  )

  return (
    <SectionShell
      id="how-it-works"
      bg={bg}
      backgroundImage={bgImg}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment={{ base: 'scroll', md: 'fixed' }}
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
      eyebrow="How it works"
      title="Four steps. Most people skip three."
      subtitle="The shortest path between signing up and knowing where your money went last month."
    >
      <Box position="relative" zIndex={1}>
        {/* Connector line — desktop only */}
        <Box
          aria-hidden
          display={{ base: 'none', md: 'block' }}
          position="absolute"
          top="32px"
          left="10%"
          right="10%"
          h="2px"
          bg={lineColor}
          borderRadius="full"
          overflow="hidden"
        >
          <Box
            h="full"
            w="100%"
            background={lineActive}
            sx={{
              transformOrigin: 'left',
              animation: 'fillLine 1.4s cubic-bezier(0.32, 0.72, 0, 1) 0.3s both',
              '@keyframes fillLine': {
                from: { transform: 'scaleX(0)' },
                to: { transform: 'scaleX(1)' },
              },
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
                transform: 'scaleX(1)',
              },
            }}
          />
        </Box>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={{ base: 8, md: 6 }}>
          {STEPS.map((step, index) => (
            <MotionGridItem
              key={step.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 + index * 0.1 }}
            >
              <StepCard index={index + 1} step={step} />
            </MotionGridItem>
          ))}
        </Grid>
      </Box>
    </SectionShell>
  )
}

function StepCard({
  index,
  step,
}: {
  index: number
  step: (typeof STEPS)[number]
}) {
  const titleColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const subText = useColorModeValue('gray.600', 'gray.400')
  const numberColor = useColorModeValue('gray.400', 'whiteAlpha.500')
  const dotBg = useColorModeValue('white', 'gray.900')
  const dotBorder = useColorModeValue('gray.200', 'whiteAlpha.300')

  return (
    <VStack spacing={4} align="center" textAlign="center">
      <Box position="relative">
        <Box
          w="64px"
          h="64px"
          borderRadius="full"
          bg={dotBg}
          border="1px solid"
          borderColor={dotBorder}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={useColorModeValue('blue.600', 'blue.300')}
          boxShadow={useColorModeValue(
            '0 10px 24px -12px rgba(15,23,42,0.2)',
            '0 10px 24px -12px rgba(0,0,0,0.6)',
          )}
        >
          <Icon as={step.icon} boxSize={6} weight="duotone" />
        </Box>
        <Box
          aria-hidden
          position="absolute"
          top="-6px"
          right="-6px"
          w="22px"
          h="22px"
          borderRadius="full"
          bgGradient="linear(135deg, #3b82f6, #8b5cf6)"
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="xs"
          fontWeight={800}
        >
          {index}
        </Box>
      </Box>

      <VStack spacing={1.5} maxW="280px">
        <Text
          fontSize="2xs"
          color={numberColor}
          fontWeight={700}
          letterSpacing="0.12em"
          textTransform="uppercase"
        >
          Step {index}
        </Text>
        <Heading as="h3" size="sm" color={titleColor} letterSpacing="-0.015em">
          {step.title}
        </Heading>
        <Text fontSize="sm" color={subText} lineHeight={1.55}>
          {step.description}
        </Text>
      </VStack>
    </VStack>
  )
}
