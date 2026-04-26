import {
  Box,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { SectionShell, fadeUp } from './shared'
import { TRUST } from './landing.config'

const MotionBox = motion.create(Box)

export default function TrustStrip() {
  const bg = useColorModeValue('white', 'black')
  const cardBg = useColorModeValue('white', 'rgba(255,255,255,0.03)')
  const cardBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const titleColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const subText = useColorModeValue('gray.600', 'gray.400')
  const iconColor = useColorModeValue('blue.600', 'blue.300')
  const iconBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.12)')

  return (
    <SectionShell
      id="trust"
      bg={bg}
      eyebrow="What we promise"
      title={
        <>
          A small, honest contract <br />
          with your data.
        </>
      }
      subtitle="Instead of made-up testimonials, here is exactly what Personal Budget does — and doesn't do — with everything you put into it."
    >
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, md: 5 }}>
        {TRUST.map((item, i) => (
          <MotionBox
            key={item.id}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 + i * 0.05 }}
            p={{ base: 5, md: 6 }}
            borderRadius="2xl"
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            sx={{ transition: 'border-color 0.25s ease, transform 0.25s ease' }}
            _hover={{
              borderColor: useColorModeValue('blue.200', 'blue.500'),
              transform: 'translateY(-2px)',
            }}
          >
            <HStack align="flex-start" spacing={4}>
              <Box p={2.5} borderRadius="lg" bg={iconBg} color={iconColor}>
                <Icon as={item.icon} boxSize={5} />
              </Box>
              <VStack align="flex-start" spacing={1.5} flex={1}>
                <Heading as="h3" size="sm" color={titleColor} letterSpacing="-0.015em">
                  {item.title}
                </Heading>
                <Text fontSize="sm" color={subText} lineHeight={1.55}>
                  {item.description}
                </Text>
              </VStack>
            </HStack>
          </MotionBox>
        ))}
      </SimpleGrid>
    </SectionShell>
  )
}
