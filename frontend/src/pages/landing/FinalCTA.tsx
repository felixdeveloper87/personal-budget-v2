import {
  Box,
  Button,
  HStack,
  Heading,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from '../../components/ui/icons'
import { Eyebrow, GlowOrb, SectionShell, fadeUp } from './shared'
import { FINAL_CTA } from './landing.config'

const MotionBox = motion.create(Box)

interface FinalCTAProps {
  onGetStarted: () => void
}

export default function FinalCTA({ onGetStarted }: FinalCTAProps) {
  const sectionBg = useColorModeValue('white', 'black')
  const cardBg = useColorModeValue(
    'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #4c1d95 100%)',
    'linear-gradient(135deg, #0a0a0a 0%, #1e3a8a 50%, #4c1d95 100%)',
  )
  const dotPattern =
    'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.08) 1.5px, transparent 0)'

  return (
    <SectionShell bg={sectionBg} pt={{ base: 16, md: 20 }} pb={{ base: 24, md: 28 }}>
      <MotionBox
        {...fadeUp}
        position="relative"
        borderRadius="3xl"
        overflow="hidden"
        bg={cardBg}
        px={{ base: 8, md: 16, lg: 20 }}
        py={{ base: 14, md: 20 }}
        textAlign="center"
        boxShadow="0 30px 80px -20px rgba(79, 70, 229, 0.45)"
      >
        {/* Layered decorative effects */}
        <Box
          aria-hidden
          position="absolute"
          inset={0}
          bgImage={dotPattern}
          bgSize="40px 40px"
          opacity={0.7}
        />
        <GlowOrb
          color="rgba(56,189,248,0.6)"
          size="540px"
          intensity={0.6}
          top="-200px"
          left="-150px"
        />
        <GlowOrb
          color="rgba(236,72,153,0.5)"
          size="480px"
          intensity={0.5}
          bottom="-180px"
          right="-150px"
        />

        <VStack spacing={6} position="relative" zIndex={1} maxW="720px" mx="auto">
          <Box
            sx={{
              '& > span': {
                bg: 'whiteAlpha.200',
                color: 'white',
                borderColor: 'whiteAlpha.300',
              },
            }}
          >
            <Eyebrow>{FINAL_CTA.eyebrow}</Eyebrow>
          </Box>

          <Heading
            as="h2"
            color="white"
            fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
            fontWeight={800}
            letterSpacing="-0.035em"
            lineHeight={1.05}
          >
            {FINAL_CTA.title}
          </Heading>

          <Text fontSize={{ base: 'md', md: 'lg' }} color="whiteAlpha.800" lineHeight={1.55}>
            {FINAL_CTA.subtitle}
          </Text>

          <Button
            size="lg"
            onClick={onGetStarted}
            rightIcon={<Icon as={ArrowRight} boxSize={4} weight="bold" />}
            bg="white"
            color="gray.900"
            fontWeight={700}
            px={8}
            h="56px"
            borderRadius="xl"
            boxShadow="0 20px 60px -15px rgba(0, 0, 0, 0.5)"
            transition="all 0.3s cubic-bezier(0.32, 0.72, 0, 1)"
            _hover={{
              bg: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.6)',
            }}
            _active={{ transform: 'translateY(0)' }}
            mt={2}
          >
            {FINAL_CTA.cta}
          </Button>

          <HStack spacing={5} pt={2} flexWrap="wrap" justify="center">
            {FINAL_CTA.bullets.map((b) => (
              <HStack key={b} spacing={2}>
                <Icon as={CheckCircle2} boxSize={4} color="whiteAlpha.900" weight="duotone" />
                <Text fontSize="sm" color="whiteAlpha.800" fontWeight={500}>
                  {b}
                </Text>
              </HStack>
            ))}
          </HStack>
        </VStack>
      </MotionBox>
    </SectionShell>
  )
}
