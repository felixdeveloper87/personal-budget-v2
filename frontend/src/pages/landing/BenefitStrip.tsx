import {
  Box,
  Container,
  Flex,
  HStack,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { fadeUp } from './shared'
import { BENEFIT_STRIP } from './landing.config'

const MotionFlex = motion.create(Flex)

/**
 * Slim "immediate feedback" band right under the hero — four short,
 * verifiable claims, no invented numbers.
 */
export default function BenefitStrip() {
  const bg = useColorModeValue('white', 'black')
  const stripBg = useColorModeValue('rgba(248,250,252,0.8)', 'rgba(255,255,255,0.03)')
  const stripBorder = useColorModeValue('rgba(15,23,42,0.07)', 'rgba(255,255,255,0.07)')
  const labelColor = useColorModeValue('gray.700', 'gray.300')
  const iconColor = useColorModeValue('blue.600', 'blue.300')
  const iconBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.12)')
  const divider = useColorModeValue('rgba(15,23,42,0.06)', 'rgba(255,255,255,0.06)')

  return (
    <Box as="section" aria-label="Product highlights" bg={bg} py={{ base: 6, md: 8 }}>
      <Container maxW={{ base: '100%', xl: '1200px', '2xl': '1320px' }} px={{ base: 4, md: 8, lg: 12 }}>
        <MotionFlex
          {...fadeUp}
          direction={{ base: 'column', sm: 'row' }}
          wrap="wrap"
          borderRadius="2xl"
          bg={stripBg}
          border="1px solid"
          borderColor={stripBorder}
          overflow="hidden"
        >
          {BENEFIT_STRIP.map((item, i) => (
            <HStack
              key={item.id}
              flex={{ base: '1 1 100%', sm: '1 1 50%', lg: 1 }}
              spacing={3}
              px={{ base: 4, md: 5 }}
              py={{ base: 3.5, md: 4 }}
              justify={{ base: 'flex-start', lg: 'center' }}
              borderLeft={{ base: 'none', lg: i > 0 ? '1px solid' : 'none' }}
              borderTop={{ base: i > 0 ? '1px solid' : 'none', sm: i > 1 ? '1px solid' : 'none', lg: 'none' }}
              borderColor={divider}
            >
              <Flex
                w={8}
                h={8}
                align="center"
                justify="center"
                borderRadius="lg"
                bg={iconBg}
                color={iconColor}
                flexShrink={0}
              >
                <Icon as={item.icon} boxSize={4} weight="duotone" />
              </Flex>
              <Text fontSize="sm" fontWeight={600} color={labelColor} letterSpacing="-0.01em">
                {item.label}
              </Text>
            </HStack>
          ))}
        </MotionFlex>
      </Container>
    </Box>
  )
}
